import BulkUpdate from "../models/BulkUpdate.js";

// Create a new bulk update operation
export const createBulkUpdate = async (req, res) => {
  try {
    console.log("🔍 Creating bulk update:", req.body);
    
    const bulkUpdateData = {
      ...req.body,
      createdBy: req.user.uid
    };

    const bulkUpdate = new BulkUpdate(bulkUpdateData);
    await bulkUpdate.save();

    console.log("✅ Bulk update created:", bulkUpdate.name);
    res.status(201).json({
      success: true,
      message: "Bulk update created successfully",
      data: bulkUpdate
    });
  } catch (error) {
    console.error("❌ Error creating bulk update:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all bulk updates with pagination and filters
export const getBulkUpdates = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const bulkUpdates = await BulkUpdate.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BulkUpdate.countDocuments(filter);

    console.log(`✅ Retrieved ${bulkUpdates.length} bulk updates`);
    res.json({
      success: true,
      data: bulkUpdates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ Error fetching bulk updates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bulk updates"
    });
  }
};

// Get a single bulk update by ID
export const getBulkUpdate = async (req, res) => {
  try {
    const bulkUpdate = await BulkUpdate.findById(req.params.id);
    
    if (!bulkUpdate) {
      return res.status(404).json({
        success: false,
        message: "Bulk update not found"
      });
    }

    console.log("✅ Retrieved bulk update:", bulkUpdate.name);
    res.json({
      success: true,
      data: bulkUpdate
    });
  } catch (error) {
    console.error("❌ Error fetching bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bulk update"
    });
  }
};

// Update a bulk update
export const updateBulkUpdate = async (req, res) => {
  try {
    const bulkUpdate = await BulkUpdate.findById(req.params.id);
    
    if (!bulkUpdate) {
      return res.status(404).json({
        success: false,
        message: "Bulk update not found"
      });
    }

    // Only allow updates if bulk update is in draft status
    if (bulkUpdate.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Cannot update running or completed bulk update"
      });
    }

    const updatedBulkUpdate = await BulkUpdate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log("✅ Updated bulk update:", updatedBulkUpdate.name);
    res.json({
      success: true,
      message: "Bulk update updated successfully",
      data: updatedBulkUpdate
    });
  } catch (error) {
    console.error("❌ Error updating bulk update:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Execute bulk update
export const executeBulkUpdate = async (req, res) => {
  try {
    const bulkUpdate = await BulkUpdate.findById(req.params.id);
    
    if (!bulkUpdate) {
      return res.status(404).json({
        success: false,
        message: "Bulk update not found"
      });
    }

    if (bulkUpdate.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Bulk update is already running or completed"
      });
    }

    // Start the bulk update process
    bulkUpdate.status = 'running';
    bulkUpdate.startedAt = new Date();
    await bulkUpdate.save();

    // Simulate bulk update process (in real implementation, this would update actual transactions)
    console.log("🔄 Starting bulk update process:", bulkUpdate.name);
    
    // For now, we'll simulate the process
    setTimeout(async () => {
      try {
        // Simulate finding transactions to update
        const mockTransactions = [
          { id: '1', type: 'invoice', account: bulkUpdate.updateData.oldAccount, amount: 1000 },
          { id: '2', type: 'bill', account: bulkUpdate.updateData.oldAccount, amount: 500 },
          { id: '3', type: 'expense', account: bulkUpdate.updateData.oldAccount, amount: 750 }
        ];

        // Create bulk update items
        bulkUpdate.items = mockTransactions.map(t => ({
          transactionId: t.id,
          transactionType: t.type,
          oldAccount: t.account,
          newAccount: bulkUpdate.updateData.newAccount,
          amount: t.amount,
          status: 'updated'
        }));

        bulkUpdate.status = 'completed';
        bulkUpdate.completedAt = new Date();
        await bulkUpdate.save();

        console.log("✅ Bulk update completed:", bulkUpdate.name);
      } catch (error) {
        console.error("❌ Error in bulk update process:", error);
        bulkUpdate.status = 'failed';
        await bulkUpdate.save();
      }
    }, 2000); // Simulate 2 second process

    console.log("✅ Started bulk update:", bulkUpdate.name);
    res.json({
      success: true,
      message: "Bulk update started successfully",
      data: bulkUpdate
    });
  } catch (error) {
    console.error("❌ Error executing bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute bulk update"
    });
  }
};

// Delete a bulk update
export const deleteBulkUpdate = async (req, res) => {
  try {
    const bulkUpdate = await BulkUpdate.findById(req.params.id);
    
    if (!bulkUpdate) {
      return res.status(404).json({
        success: false,
        message: "Bulk update not found"
      });
    }

    if (bulkUpdate.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Cannot delete running or completed bulk update"
      });
    }

    await BulkUpdate.findByIdAndDelete(req.params.id);

    console.log("✅ Deleted bulk update:", bulkUpdate.name);
    res.json({
      success: true,
      message: "Bulk update deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bulk update"
    });
  }
};

// Get bulk update statistics
export const getBulkUpdateStats = async (req, res) => {
  try {
    const stats = await BulkUpdate.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalTransactions: { $sum: "$totalTransactions" },
          updatedTransactions: { $sum: "$updatedTransactions" },
          failedTransactions: { $sum: "$failedTransactions" }
        }
      }
    ]);

    const totalStats = await BulkUpdate.aggregate([
      {
        $group: {
          _id: null,
          totalBulkUpdates: { $sum: 1 },
          totalTransactions: { $sum: "$totalTransactions" },
          totalUpdated: { $sum: "$updatedTransactions" },
          totalFailed: { $sum: "$failedTransactions" }
        }
      }
    ]);

    console.log("✅ Retrieved bulk update statistics");
    res.json({
      success: true,
      data: {
        byStatus: stats,
        totals: totalStats[0] || { 
          totalBulkUpdates: 0, 
          totalTransactions: 0, 
          totalUpdated: 0, 
          totalFailed: 0 
        }
      }
    });
  } catch (error) {
    console.error("❌ Error fetching bulk update statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bulk update statistics"
    });
  }
};

// Preview transactions that would be affected by bulk update
export const previewBulkUpdate = async (req, res) => {
  try {
    const { filterCriteria, updateData } = req.body;
    
    // In a real implementation, this would query actual transaction data
    // For now, we'll return mock data
    const mockTransactions = [
      {
        id: '1',
        type: 'invoice',
        number: 'INV-001',
        date: new Date(),
        account: filterCriteria.oldAccount,
        amount: 1000,
        description: 'Sample invoice'
      },
      {
        id: '2',
        type: 'bill',
        number: 'BILL-001',
        date: new Date(),
        account: filterCriteria.oldAccount,
        amount: 500,
        description: 'Sample bill'
      },
      {
        id: '3',
        type: 'expense',
        number: 'EXP-001',
        date: new Date(),
        account: filterCriteria.oldAccount,
        amount: 750,
        description: 'Sample expense'
      }
    ];

    console.log("✅ Generated bulk update preview");
    res.json({
      success: true,
      data: {
        transactions: mockTransactions,
        totalCount: mockTransactions.length,
        totalAmount: mockTransactions.reduce((sum, t) => sum + t.amount, 0)
      }
    });
  } catch (error) {
    console.error("❌ Error generating bulk update preview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate bulk update preview"
    });
  }
};


