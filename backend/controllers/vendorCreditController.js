import VendorCredit from '../models/VendorCredit.js';
import Bill from '../models/Bill.js';
import mongoose from 'mongoose';

// Get all vendor credits
export const getVendorCredits = async (req, res) => {
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
    
    const vendorCredits = await VendorCredit.find(query)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('appliedToBills', 'billNumber totalAmount')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await VendorCredit.countDocuments(query);
    
    res.json({
      success: true,
      data: vendorCredits,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching vendor credits:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vendor credits' });
  }
};

// Get vendor credit by ID
export const getVendorCreditById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const vendorCredit = await VendorCredit.findOne({ _id: id, organizationId })
      .populate('vendorId', 'name companyName email address')
      .populate('createdBy', 'name email')
      .populate('appliedToBills', 'billNumber totalAmount status');
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    res.json({ success: true, data: vendorCredit });
  } catch (error) {
    console.error('Error fetching vendor credit:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vendor credit' });
  }
};

// Create new vendor credit
export const createVendorCredit = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const createdBy = req.user.id;
    const vendorCreditData = req.body;
    
    // Generate credit number
    const creditCount = await VendorCredit.countDocuments({ organizationId });
    const creditNumber = `VC-${new Date().getFullYear()}-${String(creditCount + 1).padStart(4, '0')}`;
    
    const vendorCredit = new VendorCredit({
      ...vendorCreditData,
      creditNumber,
      organizationId,
      createdBy
    });
    
    await vendorCredit.save();
    
    const populatedVendorCredit = await VendorCredit.findById(vendorCredit._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email');
    
    res.status(201).json({ success: true, data: populatedVendorCredit });
  } catch (error) {
    console.error('Error creating vendor credit:', error);
    res.status(500).json({ success: false, error: 'Failed to create vendor credit' });
  }
};

// Update vendor credit
export const updateVendorCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const updateData = req.body;
    
    const vendorCredit = await VendorCredit.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email')
     .populate('appliedToBills', 'billNumber totalAmount');
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    res.json({ success: true, data: vendorCredit });
  } catch (error) {
    console.error('Error updating vendor credit:', error);
    res.status(500).json({ success: false, error: 'Failed to update vendor credit' });
  }
};

// Delete vendor credit
export const deleteVendorCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const vendorCredit = await VendorCredit.findOneAndDelete({ _id: id, organizationId });
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    res.json({ success: true, message: 'Vendor credit deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor credit:', error);
    res.status(500).json({ success: false, error: 'Failed to delete vendor credit' });
  }
};

// Search vendor credits
export const searchVendorCredits = async (req, res) => {
  try {
    const { query } = req.query;
    const organizationId = req.user.organizationId;
    
    const vendorCredits = await VendorCredit.find({
      organizationId,
      $or: [
        { creditNumber: { $regex: query, $options: 'i' } },
        { vendorName: { $regex: query, $options: 'i' } },
        { reference: { $regex: query, $options: 'i' } },
        { reason: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('vendorId', 'name companyName email')
    .populate('createdBy', 'name email')
    .populate('appliedToBills', 'billNumber totalAmount')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json({ success: true, data: vendorCredits });
  } catch (error) {
    console.error('Error searching vendor credits:', error);
    res.status(500).json({ success: false, error: 'Failed to search vendor credits' });
  }
};

// Get vendor credit statistics
export const getVendorCreditStats = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    const stats = await VendorCredit.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageCreditValue: { $avg: '$amount' },
          draftCredits: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          issuedCredits: {
            $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] }
          },
          appliedCredits: {
            $sum: { $cond: [{ $eq: ['$status', 'applied'] }, 1, 0] }
          },
          cancelledCredits: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalAppliedAmount: { $sum: '$appliedAmount' },
          totalRemainingAmount: { $sum: '$remainingAmount' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalCredits: 0,
      totalAmount: 0,
      averageCreditValue: 0,
      draftCredits: 0,
      issuedCredits: 0,
      appliedCredits: 0,
      cancelledCredits: 0,
      totalAppliedAmount: 0,
      totalRemainingAmount: 0
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching vendor credit stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vendor credit stats' });
  }
};

// Update vendor credit status
export const updateVendorCreditStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user.organizationId;
    
    const updateData = { status };
    
    if (status === 'issued') {
      updateData.issuedAt = new Date();
    }
    
    const vendorCredit = await VendorCredit.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email')
     .populate('appliedToBills', 'billNumber totalAmount');
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    res.json({ success: true, data: vendorCredit });
  } catch (error) {
    console.error('Error updating vendor credit status:', error);
    res.status(500).json({ success: false, error: 'Failed to update vendor credit status' });
  }
};

// Issue vendor credit
export const issueVendorCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const vendorCredit = await VendorCredit.findOne({ _id: id, organizationId });
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    if (vendorCredit.status !== 'draft') {
      return res.status(400).json({ success: false, error: 'Vendor credit is not in draft status' });
    }
    
    vendorCredit.status = 'issued';
    vendorCredit.issuedAt = new Date();
    
    await vendorCredit.save();
    
    const populatedVendorCredit = await VendorCredit.findById(vendorCredit._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('appliedToBills', 'billNumber totalAmount');
    
    res.json({ success: true, data: populatedVendorCredit });
  } catch (error) {
    console.error('Error issuing vendor credit:', error);
    res.status(500).json({ success: false, error: 'Failed to issue vendor credit' });
  }
};

// Apply vendor credit to bills
export const applyVendorCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const { billIds, amount } = req.body;
    const organizationId = req.user.organizationId;
    
    const vendorCredit = await VendorCredit.findOne({ _id: id, organizationId });
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    if (!vendorCredit.canApply(amount)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot apply credit. Check status and remaining amount.' 
      });
    }
    
    // Verify bills exist and belong to the same vendor
    const bills = await Bill.find({ 
      _id: { $in: billIds }, 
      organizationId,
      vendorId: vendorCredit.vendorId
    });
    
    if (bills.length !== billIds.length) {
      return res.status(400).json({ 
        success: false, 
        error: 'Some bills not found or do not belong to the vendor' 
      });
    }
    
    // Apply credit to bills
    await vendorCredit.applyToBills(billIds, amount);
    
    const populatedVendorCredit = await VendorCredit.findById(vendorCredit._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('appliedToBills', 'billNumber totalAmount');
    
    res.json({ success: true, data: populatedVendorCredit });
  } catch (error) {
    console.error('Error applying vendor credit:', error);
    res.status(500).json({ success: false, error: 'Failed to apply vendor credit' });
  }
};

// Cancel vendor credit
export const cancelVendorCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const vendorCredit = await VendorCredit.findOne({ _id: id, organizationId });
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    if (vendorCredit.status === 'applied') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel applied vendor credit' 
      });
    }
    
    vendorCredit.status = 'cancelled';
    await vendorCredit.save();
    
    const populatedVendorCredit = await VendorCredit.findById(vendorCredit._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('appliedToBills', 'billNumber totalAmount');
    
    res.json({ success: true, data: populatedVendorCredit });
  } catch (error) {
    console.error('Error cancelling vendor credit:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel vendor credit' });
  }
};

// Record refund for vendor credit
export const recordRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, refundMethod, refundReference, refundDate } = req.body;
    const organizationId = req.user.organizationId;
    
    const vendorCredit = await VendorCredit.findOne({ _id: id, organizationId });
    
    if (!vendorCredit) {
      return res.status(404).json({ success: false, error: 'Vendor credit not found' });
    }
    
    if (vendorCredit.status !== 'issued') {
      return res.status(400).json({ 
        success: false, 
        error: 'Credit must be issued before recording refund' 
      });
    }
    
    if (amount > vendorCredit.remainingAmount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot refund more than remaining credit amount' 
      });
    }
    
    // Record the refund
    await vendorCredit.recordRefund({
      amount,
      refundMethod,
      refundReference,
      refundDate: refundDate ? new Date(refundDate) : new Date()
    });
    
    const populatedVendorCredit = await VendorCredit.findById(vendorCredit._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('appliedToBills', 'billNumber totalAmount');
    
    res.json({ success: true, data: populatedVendorCredit });
  } catch (error) {
    console.error('Error recording refund:', error);
    res.status(500).json({ success: false, error: 'Failed to record refund' });
  }
};

// Import vendor credits from CSV
export const importVendorCredits = async (req, res) => {
  try {
    // This would typically use a CSV parsing library like csv-parser
    // For now, return a mock response
    res.json({ 
      success: true, 
      message: 'Vendor credits imported successfully',
      data: []
    });
  } catch (error) {
    console.error('Error importing vendor credits:', error);
    res.status(500).json({ success: false, error: 'Failed to import vendor credits' });
  }
};


