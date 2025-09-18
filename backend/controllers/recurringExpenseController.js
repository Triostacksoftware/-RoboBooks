import RecurringExpense from '../models/RecurringExpense.js';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all recurring expenses
export const getRecurringExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc', search, frequency, category, status } = req.query;
    const organizationId = req.user.organizationId;
    
    // Build query
    const query = { organizationId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (frequency) {
      query.frequency = frequency;
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (status !== undefined) {
      query.isActive = status === 'active';
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query
    const recurringExpenses = await RecurringExpense.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email')
      .lean();
    
    const total = await RecurringExpense.countDocuments(query);
    
    res.json({
      recurringExpenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    res.status(500).json({ error: 'Failed to fetch recurring expenses' });
  }
};

// Get single recurring expense
export const getRecurringExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringExpense = await RecurringExpense.findOne({ 
      _id: id, 
      organizationId 
    }).populate('createdBy', 'name email');
    
    if (!recurringExpense) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }
    
    res.json(recurringExpense);
  } catch (error) {
    console.error('Error fetching recurring expense:', error);
    res.status(500).json({ error: 'Failed to fetch recurring expense' });
  }
};

// Create new recurring expense
export const createRecurringExpense = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const createdBy = req.user.id;
    
    const recurringExpenseData = {
      ...req.body,
      organizationId,
      createdBy
    };
    
    // Calculate next due date if not provided
    if (!recurringExpenseData.nextDue) {
      const now = new Date();
      recurringExpenseData.nextDue = now;
    }
    
    const recurringExpense = new RecurringExpense(recurringExpenseData);
    await recurringExpense.save();
    
    await recurringExpense.populate('createdBy', 'name email');
    
    res.status(201).json(recurringExpense);
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create recurring expense' });
  }
};

// Update recurring expense
export const updateRecurringExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringExpense = await RecurringExpense.findOneAndUpdate(
      { _id: id, organizationId },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!recurringExpense) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }
    
    res.json(recurringExpense);
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update recurring expense' });
  }
};

// Delete recurring expense
export const deleteRecurringExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const recurringExpense = await RecurringExpense.findOneAndDelete({ 
      _id: id, 
      organizationId 
    });
    
    if (!recurringExpense) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }
    
    res.json({ message: 'Recurring expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    res.status(500).json({ error: 'Failed to delete recurring expense' });
  }
};

// Toggle recurring expense active status
export const toggleRecurringExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const organizationId = req.user.organizationId;
    
    const recurringExpense = await RecurringExpense.findOneAndUpdate(
      { _id: id, organizationId },
      { isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!recurringExpense) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }
    
    res.json(recurringExpense);
  } catch (error) {
    console.error('Error toggling recurring expense:', error);
    res.status(500).json({ error: 'Failed to toggle recurring expense' });
  }
};

// Get recurring expense statistics
export const getRecurringExpenseStats = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const stats = await RecurringExpense.getStats(organizationId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching recurring expense stats:', error);
    res.status(500).json({ error: 'Failed to fetch recurring expense statistics' });
  }
};

// Import recurring expenses from CSV
export const importRecurringExpenses = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const organizationId = req.user.organizationId;
    const createdBy = req.user.id;
    const importedExpenses = [];
    const errors = [];
    
    // Parse CSV file
    const csvData = [];
    const stream = Readable.from(req.file.buffer);
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        const expenseData = {
          name: row.Name || row.name,
          description: row.Description || row.description,
          amount: parseFloat(row.Amount || row.amount),
          frequency: (row.Frequency || row.frequency)?.toLowerCase(),
          category: row.Category || row.category,
          vendor: row.Vendor || row.vendor,
          nextDue: row['Next Due'] || row.nextDue ? new Date(row['Next Due'] || row.nextDue) : new Date(),
          isActive: (row.Status || row.status)?.toLowerCase() === 'active',
          organizationId,
          createdBy
        };
        
        // Validate required fields
        if (!expenseData.name || !expenseData.amount || !expenseData.frequency || !expenseData.category) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Validate frequency
        const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
        if (!validFrequencies.includes(expenseData.frequency)) {
          errors.push(`Row ${i + 1}: Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`);
          continue;
        }
        
        const recurringExpense = new RecurringExpense(expenseData);
        await recurringExpense.save();
        importedExpenses.push(recurringExpense);
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    res.json({
      imported: importedExpenses.length,
      total: csvData.length,
      errors: errors.length > 0 ? errors : undefined,
      expenses: importedExpenses
    });
    
  } catch (error) {
    console.error('Error importing recurring expenses:', error);
    res.status(500).json({ error: 'Failed to import recurring expenses' });
  }
};

// Export recurring expenses to CSV
export const exportRecurringExpenses = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { format = 'csv' } = req.query;
    
    const recurringExpenses = await RecurringExpense.find({ organizationId })
      .populate('createdBy', 'name email')
      .lean();
    
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Name',
        'Description',
        'Amount',
        'Frequency',
        'Category',
        'Vendor',
        'Next Due',
        'Status',
        'Created At'
      ];
      
      const csvData = recurringExpenses.map(expense => [
        expense.name,
        expense.description || '',
        expense.amount,
        expense.frequency,
        expense.category,
        expense.vendor || '',
        expense.nextDue ? new Date(expense.nextDue).toLocaleDateString() : '',
        expense.isActive ? 'Active' : 'Inactive',
        new Date(expense.createdAt).toLocaleDateString()
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=recurring-expenses.csv');
      res.send(csvContent);
    } else {
      res.json(recurringExpenses);
    }
    
  } catch (error) {
    console.error('Error exporting recurring expenses:', error);
    res.status(500).json({ error: 'Failed to export recurring expenses' });
  }
};

// Bulk operations
export const bulkDeleteRecurringExpenses = async (req, res) => {
  try {
    const { ids } = req.body;
    const organizationId = req.user.organizationId;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No recurring expense IDs provided' });
    }
    
    const result = await RecurringExpense.deleteMany({
      _id: { $in: ids },
      organizationId
    });
    
    res.json({ 
      message: `${result.deletedCount} recurring expense(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting recurring expenses:', error);
    res.status(500).json({ error: 'Failed to delete recurring expenses' });
  }
};

export const bulkUpdateRecurringExpenses = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    const organizationId = req.user.organizationId;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No recurring expense IDs provided' });
    }
    
    const result = await RecurringExpense.updateMany(
      { _id: { $in: ids }, organizationId },
      updates
    );
    
    res.json({ 
      message: `${result.modifiedCount} recurring expense(s) updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating recurring expenses:', error);
    res.status(500).json({ error: 'Failed to update recurring expenses' });
  }
};


