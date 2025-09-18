import ManualJournal from "../models/ManualJournal.js";

// Generate next journal number
const generateJournalNumber = async () => {
  const lastJournal = await ManualJournal.findOne().sort({ journalNumber: -1 });
  if (!lastJournal) {
    return "JRN-0001";
  }
  const lastNumber = parseInt(lastJournal.journalNumber.split("-")[1]);
  return `JRN-${String(lastNumber + 1).padStart(4, "0")}`;
};

// Create a new manual journal
export const createManualJournal = async (req, res) => {
  try {
    console.log("🔍 Creating manual journal:", req.body);

    // Validate that entries exist and have accounts
    if (!req.body.entries || req.body.entries.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least two journal entries are required",
      });
    }

    // Validate that entries have accounts
    const entriesWithAccounts = req.body.entries.filter(
      (entry) => entry.account && entry.account.trim()
    );
    if (entriesWithAccounts.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least two entries must have accounts selected",
      });
    }

    // Calculate totals
    const totalDebit = req.body.entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0
    );
    const totalCredit = req.body.entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0
    );

    // Validate that debits equal credits (with small tolerance for floating point)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Total debits (${totalDebit.toFixed(
          2
        )}) must equal total credits (${totalCredit.toFixed(2)})`,
      });
    }

    const journalData = {
      ...req.body,
      journalNumber: await generateJournalNumber(),
      createdBy: req.user.uid,
      totalDebit,
      totalCredit,
    };

    const journal = new ManualJournal(journalData);
    await journal.save();

    console.log("✅ Manual journal created:", journal.journalNumber);
    res.status(201).json({
      success: true,
      message: "Manual journal created successfully",
      data: journal,
    });
  } catch (error) {
    console.error("❌ Error creating manual journal:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all manual journals with pagination and filters
export const getManualJournals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.journalDate = {};
      if (dateFrom) filter.journalDate.$gte = new Date(dateFrom);
      if (dateTo) filter.journalDate.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { journalNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const journals = await ManualJournal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ManualJournal.countDocuments(filter);

    console.log(`✅ Retrieved ${journals.length} manual journals`);
    res.json({
      success: true,
      data: journals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching manual journals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manual journals",
    });
  }
};

// Get a single manual journal by ID
export const getManualJournal = async (req, res) => {
  try {
    const journal = await ManualJournal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Manual journal not found",
      });
    }

    console.log("✅ Retrieved manual journal:", journal.journalNumber);
    res.json({
      success: true,
      data: journal,
    });
  } catch (error) {
    console.error("❌ Error fetching manual journal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manual journal",
    });
  }
};

// Update a manual journal
export const updateManualJournal = async (req, res) => {
  try {
    const journal = await ManualJournal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Manual journal not found",
      });
    }

    // Only allow updates if journal is in draft status
    if (journal.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Cannot update posted or cancelled journal",
      });
    }

    const updatedJournal = await ManualJournal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log("✅ Updated manual journal:", updatedJournal.journalNumber);
    res.json({
      success: true,
      message: "Manual journal updated successfully",
      data: updatedJournal,
    });
  } catch (error) {
    console.error("❌ Error updating manual journal:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Post a manual journal
export const postManualJournal = async (req, res) => {
  try {
    const journal = await ManualJournal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Manual journal not found",
      });
    }

    if (journal.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Journal is already posted or cancelled",
      });
    }

    journal.status = "posted";
    journal.postedBy = req.user.uid;
    journal.postedAt = new Date();

    await journal.save();

    console.log("✅ Posted manual journal:", journal.journalNumber);
    res.json({
      success: true,
      message: "Manual journal posted successfully",
      data: journal,
    });
  } catch (error) {
    console.error("❌ Error posting manual journal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to post manual journal",
    });
  }
};

// Delete a manual journal
export const deleteManualJournal = async (req, res) => {
  try {
    const journal = await ManualJournal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Manual journal not found",
      });
    }

    if (journal.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete posted or cancelled journal",
      });
    }

    await ManualJournal.findByIdAndDelete(req.params.id);

    console.log("✅ Deleted manual journal:", journal.journalNumber);
    res.json({
      success: true,
      message: "Manual journal deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting manual journal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete manual journal",
    });
  }
};

// Get journal statistics
export const getJournalStats = async (req, res) => {
  try {
    const stats = await ManualJournal.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalDebit: { $sum: "$totalDebit" },
          totalCredit: { $sum: "$totalCredit" },
        },
      },
    ]);

    const totalStats = await ManualJournal.aggregate([
      {
        $group: {
          _id: null,
          totalJournals: { $sum: 1 },
          totalDebit: { $sum: "$totalDebit" },
          totalCredit: { $sum: "$totalCredit" },
        },
      },
    ]);

    console.log("✅ Retrieved journal statistics");
    res.json({
      success: true,
      data: {
        byStatus: stats,
        totals: totalStats[0] || {
          totalJournals: 0,
          totalDebit: 0,
          totalCredit: 0,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching journal statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch journal statistics",
    });
  }
};


