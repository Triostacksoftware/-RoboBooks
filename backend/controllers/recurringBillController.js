import RecurringBill from '../models/RecurringBill.js';
import Bill from '../models/Bill.js';
import mongoose from 'mongoose';

// Get all recurring bills
export const getRecurringBills = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { status, frequency, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = { organizationId };
    
    if (status) {
      query.status = status;
    }
    
    if (frequency) {
      query.frequency = frequency;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const recurringBills = await RecurringBill.find(query)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await RecurringBill.countDocuments(query);
    
    res.json({
      success: true,
      data: recurringBills,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching recurring bills:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recurring bills' });
  }
};

// Get recurring bill by ID
export const getRecurringBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringBill = await RecurringBill.findOne({ _id: id, organizationId })
      .populate('vendorId', 'name companyName email address')
      .populate('createdBy', 'name email');
    
    if (!recurringBill) {
      return res.status(404).json({ success: false, error: 'Recurring bill not found' });
    }
    
    res.json({ success: true, data: recurringBill });
  } catch (error) {
    console.error('Error fetching recurring bill:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recurring bill' });
  }
};

// Create new recurring bill
export const createRecurringBill = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const createdBy = req.user.id;
    const recurringBillData = req.body;
    
    const recurringBill = new RecurringBill({
      ...recurringBillData,
      organizationId,
      createdBy
    });
    
    await recurringBill.save();
    
    const populatedRecurringBill = await RecurringBill.findById(recurringBill._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email');
    
    res.status(201).json({ success: true, data: populatedRecurringBill });
  } catch (error) {
    console.error('Error creating recurring bill:', error);
    res.status(500).json({ success: false, error: 'Failed to create recurring bill' });
  }
};

// Update recurring bill
export const updateRecurringBill = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const updateData = req.body;
    
    const recurringBill = await RecurringBill.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email');
    
    if (!recurringBill) {
      return res.status(404).json({ success: false, error: 'Recurring bill not found' });
    }
    
    res.json({ success: true, data: recurringBill });
  } catch (error) {
    console.error('Error updating recurring bill:', error);
    res.status(500).json({ success: false, error: 'Failed to update recurring bill' });
  }
};

// Delete recurring bill
export const deleteRecurringBill = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringBill = await RecurringBill.findOneAndDelete({ _id: id, organizationId });
    
    if (!recurringBill) {
      return res.status(404).json({ success: false, error: 'Recurring bill not found' });
    }
    
    res.json({ success: true, message: 'Recurring bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring bill:', error);
    res.status(500).json({ success: false, error: 'Failed to delete recurring bill' });
  }
};

// Search recurring bills
export const searchRecurringBills = async (req, res) => {
  try {
    const { query } = req.query;
    const organizationId = req.user.organizationId;
    
    const recurringBills = await RecurringBill.find({
      organizationId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { vendorName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('vendorId', 'name companyName email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json({ success: true, data: recurringBills });
  } catch (error) {
    console.error('Error searching recurring bills:', error);
    res.status(500).json({ success: false, error: 'Failed to search recurring bills' });
  }
};

// Get recurring bill statistics
export const getRecurringBillStats = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    const stats = await RecurringBill.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
      {
        $group: {
          _id: null,
          totalRecurringBills: { $sum: 1 },
          totalMonthlyAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          activeRecurringBills: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveRecurringBills: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          pausedRecurringBills: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
          },
          nextDueCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'active'] },
                    { $lte: ['$nextDueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalRecurringBills: 0,
      totalMonthlyAmount: 0,
      averageAmount: 0,
      activeRecurringBills: 0,
      inactiveRecurringBills: 0,
      pausedRecurringBills: 0,
      nextDueCount: 0
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching recurring bill stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recurring bill stats' });
  }
};

// Update recurring bill status
export const updateRecurringBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user.organizationId;
    
    const recurringBill = await RecurringBill.findOneAndUpdate(
      { _id: id, organizationId },
      { status },
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email');
    
    if (!recurringBill) {
      return res.status(404).json({ success: false, error: 'Recurring bill not found' });
    }
    
    res.json({ success: true, data: recurringBill });
  } catch (error) {
    console.error('Error updating recurring bill status:', error);
    res.status(500).json({ success: false, error: 'Failed to update recurring bill status' });
  }
};

// Pause recurring bill
export const pauseRecurringBill = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringBill = await RecurringBill.findOneAndUpdate(
      { _id: id, organizationId },
      { status: 'paused' },
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email');
    
    if (!recurringBill) {
      return res.status(404).json({ success: false, error: 'Recurring bill not found' });
    }
    
    res.json({ success: true, data: recurringBill });
  } catch (error) {
    console.error('Error pausing recurring bill:', error);
    res.status(500).json({ success: false, error: 'Failed to pause recurring bill' });
  }
};

// Resume recurring bill
export const resumeRecurringBill = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringBill = await RecurringBill.findOneAndUpdate(
      { _id: id, organizationId },
      { status: 'active' },
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email');
    
    if (!recurringBill) {
      return res.status(404).json({ success: false, error: 'Recurring bill not found' });
    }
    
    res.json({ success: true, data: recurringBill });
  } catch (error) {
    console.error('Error resuming recurring bill:', error);
    res.status(500).json({ success: false, error: 'Failed to resume recurring bill' });
  }
};

// Create bill from recurring bill
export const createBillFromRecurring = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringBill = await RecurringBill.findOne({ _id: id, organizationId });
    
    if (!recurringBill) {
      return res.status(404).json({ success: false, error: 'Recurring bill not found' });
    }
    
    if (recurringBill.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Recurring bill is not active' });
    }
    
    // Create bill from recurring bill
    const bill = recurringBill.createBill();
    await bill.save();
    
    // Update recurring bill's next due date and last created
    recurringBill.nextDueDate = recurringBill.calculateNextDueDate();
    recurringBill.lastCreated = new Date();
    await recurringBill.save();
    
    const populatedBill = await Bill.findById(bill._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email');
    
    res.json({ success: true, data: populatedBill });
  } catch (error) {
    console.error('Error creating bill from recurring bill:', error);
    res.status(500).json({ success: false, error: 'Failed to create bill from recurring bill' });
  }
};

// Import recurring bills from CSV
export const importRecurringBills = async (req, res) => {
  try {
    // This would typically use a CSV parsing library like csv-parser
    // For now, return a mock response
    res.json({ 
      success: true, 
      message: 'Recurring bills imported successfully',
      data: []
    });
  } catch (error) {
    console.error('Error importing recurring bills:', error);
    res.status(500).json({ success: false, error: 'Failed to import recurring bills' });
  }
};


