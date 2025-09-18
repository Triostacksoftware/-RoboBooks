import Bill from '../models/Bill.js';
import mongoose from 'mongoose';

// Get all bills
export const getBills = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { status, vendorId, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = { organizationId };
    
    if (status) {
      query.status = status;
    }
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const bills = await Bill.find(query)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Bill.countDocuments(query);
    
    res.json({
      success: true,
      data: bills,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bills' });
  }
};

// Get bill by ID
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const bill = await Bill.findOne({ _id: id, organizationId })
      .populate('vendorId', 'name companyName email address')
      .populate('createdBy', 'name email');
    
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }
    
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bill' });
  }
};

// Create new bill
export const createBill = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const createdBy = req.user.id;
    const billData = req.body;
    
    // Generate bill number
    const billCount = await Bill.countDocuments({ organizationId });
    const billNumber = `BILL-${new Date().getFullYear()}-${String(billCount + 1).padStart(4, '0')}`;
    
    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    
    billData.items.forEach(item => {
      item.totalPrice = item.quantity * item.unitPrice;
      item.taxAmount = item.totalPrice * (item.taxRate || 0) / 100;
      subtotal += item.totalPrice;
      taxAmount += item.taxAmount;
    });
    
    const totalAmount = subtotal + taxAmount;
    
    const bill = new Bill({
      ...billData,
      billNumber,
      subtotal,
      taxAmount,
      totalAmount,
      organizationId,
      createdBy
    });
    
    await bill.save();
    
    const populatedBill = await Bill.findById(bill._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email');
    
    res.status(201).json({ success: true, data: populatedBill });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ success: false, error: 'Failed to create bill' });
  }
};

// Update bill
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const updateData = req.body;
    
    // Recalculate totals if items are updated
    if (updateData.items) {
      let subtotal = 0;
      let taxAmount = 0;
      
      updateData.items.forEach(item => {
        item.totalPrice = item.quantity * item.unitPrice;
        item.taxAmount = item.totalPrice * (item.taxRate || 0) / 100;
        subtotal += item.totalPrice;
        taxAmount += item.taxAmount;
      });
      
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = subtotal + taxAmount;
    }
    
    const bill = await Bill.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email');
    
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }
    
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ success: false, error: 'Failed to update bill' });
  }
};

// Delete bill
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const bill = await Bill.findOneAndDelete({ _id: id, organizationId });
    
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }
    
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ success: false, error: 'Failed to delete bill' });
  }
};

// Search bills
export const searchBills = async (req, res) => {
  try {
    const { query } = req.query;
    const organizationId = req.user.organizationId;
    
    const bills = await Bill.find({
      organizationId,
      $or: [
        { billNumber: { $regex: query, $options: 'i' } },
        { vendorName: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('vendorId', 'name companyName email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Error searching bills:', error);
    res.status(500).json({ success: false, error: 'Failed to search bills' });
  }
};

// Get bill statistics
export const getBillStats = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    const stats = await Bill.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
      {
        $group: {
          _id: null,
          totalBills: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          averageBillValue: { $avg: '$totalAmount' },
          draftBills: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          sentBills: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          },
          receivedBills: {
            $sum: { $cond: [{ $eq: ['$status', 'received'] }, 1, 0] }
          },
          overdueBills: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
          },
          paidBills: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          cancelledBills: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalOverdue: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$totalAmount', 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalBills: 0,
      totalAmount: 0,
      averageBillValue: 0,
      draftBills: 0,
      sentBills: 0,
      receivedBills: 0,
      overdueBills: 0,
      paidBills: 0,
      cancelledBills: 0,
      totalOverdue: 0
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching bill stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bill stats' });
  }
};

// Update bill status
export const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user.organizationId;
    
    const updateData = { status };
    
    if (status === 'received') {
      updateData.receivedAt = new Date();
    } else if (status === 'paid') {
      updateData.paidAt = new Date();
    }
    
    const bill = await Bill.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email');
    
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }
    
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).json({ success: false, error: 'Failed to update bill status' });
  }
};

// Mark bill as paid
export const markBillAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, reference } = req.body;
    const organizationId = req.user.organizationId;
    
    const bill = await Bill.findOne({ _id: id, organizationId });
    
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }
    
    bill.status = 'paid';
    bill.paidAt = new Date();
    
    await bill.save();
    
    const populatedBill = await Bill.findById(bill._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email');
    
    res.json({ success: true, data: populatedBill });
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ success: false, error: 'Failed to mark bill as paid' });
  }
};

// Import bills from CSV
export const importBills = async (req, res) => {
  try {
    // This would typically use a CSV parsing library like csv-parser
    // For now, return a mock response
    res.json({ 
      success: true, 
      message: 'Bills imported successfully',
      data: []
    });
  } catch (error) {
    console.error('Error importing bills:', error);
    res.status(500).json({ success: false, error: 'Failed to import bills' });
  }
};


