import TDS from "../models/TDS.js";

// Get all TDS taxes
export const getAllTDS = async (req, res) => {
  try {
    const tdsRecords = await TDS.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: tdsRecords,
    });
  } catch (error) {
    console.error("Error fetching TDS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch TDS records",
    });
  }
};

// Get active TDS taxes only
export const getActiveTDS = async (req, res) => {
  try {
    const currentDate = new Date();
    const tdsRecords = await TDS.find({
      status: "Active",
      $or: [
        {
          applicableFrom: { $lte: currentDate },
          applicableTo: { $gte: currentDate },
        },
        {
          applicableFrom: { $exists: false },
          applicableTo: { $exists: false },
        },
        {
          applicableFrom: { $lte: currentDate },
          applicableTo: { $exists: false },
        },
        {
          applicableFrom: { $exists: false },
          applicableTo: { $gte: currentDate },
        },
      ],
    }).sort({ section: 1, rate: 1 });

    res.status(200).json({
      success: true,
      data: tdsRecords,
    });
  } catch (error) {
    console.error("Error fetching active TDS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active TDS records",
    });
  }
};

// Get TDS by ID
export const getTDSById = async (req, res) => {
  try {
    const tds = await TDS.findById(req.params.id);
    if (!tds) {
      return res.status(404).json({
        success: false,
        error: "TDS record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tds,
    });
  } catch (error) {
    console.error("Error fetching TDS by ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch TDS record",
    });
  }
};

// Create new TDS
export const createTDS = async (req, res) => {
  try {
    const {
      name,
      rate,
      section,
      status,
      isHigherRate,
      applicableFrom,
      applicableTo,
    } = req.body;

    // Validation
    if (!name || !rate || !section) {
      return res.status(400).json({
        success: false,
        error: "Name, rate, and section are required",
      });
    }

    if (rate < 0 || rate > 100) {
      return res.status(400).json({
        success: false,
        error: "Rate must be between 0 and 100",
      });
    }

    // Check for duplicate TDS
    const existingTDS = await TDS.findOne({
      name: { $regex: new RegExp(`^${name}?`, "i") },
      section: section,
      rate: rate,
    });

    if (existingTDS) {
      return res.status(400).json({
        success: false,
        error: "TDS with same name, section, and rate already exists",
      });
    }

    const tdsData = {
      name: name.trim(),
      rate: parseFloat(rate),
      section: section.trim(),
      status: status || "Active",
      isHigherRate: isHigherRate || false,
      createdBy: req.user?.id,
    };

    if (applicableFrom) {
      tdsData.applicableFrom = new Date(applicableFrom);
    }

    if (applicableTo) {
      tdsData.applicableTo = new Date(applicableTo);
    }

    const tds = new TDS(tdsData);
    await tds.save();

    res.status(201).json({
      success: true,
      data: tds,
      message: "TDS created successfully",
    });
  } catch (error) {
    console.error("Error creating TDS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create TDS record",
    });
  }
};

// Update TDS
export const updateTDS = async (req, res) => {
  try {
    const {
      name,
      rate,
      section,
      status,
      isHigherRate,
      applicableFrom,
      applicableTo,
    } = req.body;

    const tds = await TDS.findById(req.params.id);
    if (!tds) {
      return res.status(404).json({
        success: false,
        error: "TDS record not found",
      });
    }

    // Validation
    if (rate !== undefined && (rate < 0 || rate > 100)) {
      return res.status(400).json({
        success: false,
        error: "Rate must be between 0 and 100",
      });
    }

    // Check for duplicate (excluding current record)
    if (name || section || rate !== undefined) {
      const checkName = name || tds.name;
      const checkSection = section || tds.section;
      const checkRate = rate !== undefined ? rate : tds.rate;

      const existingTDS = await TDS.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${checkName}?`, "i") },
        section: checkSection,
        rate: checkRate,
      });

      if (existingTDS) {
        return res.status(400).json({
          success: false,
          error: "TDS with same name, section, and rate already exists",
        });
      }
    }

    // Update fields
    if (name) tds.name = name.trim();
    if (rate !== undefined) tds.rate = parseFloat(rate);
    if (section) tds.section = section.trim();
    if (status) tds.status = status;
    if (isHigherRate !== undefined) tds.isHigherRate = isHigherRate;

    if (applicableFrom) {
      tds.applicableFrom = new Date(applicableFrom);
    }

    if (applicableTo) {
      tds.applicableTo = new Date(applicableTo);
    }

    await tds.save();

    res.status(200).json({
      success: true,
      data: tds,
      message: "TDS updated successfully",
    });
  } catch (error) {
    console.error("Error updating TDS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update TDS record",
    });
  }
};

// Delete TDS
export const deleteTDS = async (req, res) => {
  try {
    const tds = await TDS.findById(req.params.id);
    if (!tds) {
      return res.status(404).json({
        success: false,
        error: "TDS record not found",
      });
    }

    await TDS.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "TDS deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting TDS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete TDS record",
    });
  }
};

// Seed default TDS records
export const seedDefaultTDS = async (req, res) => {
  try {
    const defaultTDS = [
      { name: "Commission or Brokerage", rate: 2, section: "Section 194 H" },
      {
        name: "Commission or Brokerage (Reduced)",
        rate: 3.75,
        section: "Section 194 H",
      },
      { name: "Dividend", rate: 10, section: "Section 194" },
      { name: "Dividend (Reduced)", rate: 7.5, section: "Section 194" },
      {
        name: "Other Interest than securities",
        rate: 10,
        section: "Section 194 A",
      },
      {
        name: "Other Interest than securities (Reduced)",
        rate: 7.5,
        section: "Section 194 A",
      },
      {
        name: "Payment of contractors for Others",
        rate: 2,
        section: "Section 194 C",
      },
      {
        name: "Payment of contractors for Others (Reduced)",
        rate: 1.5,
        section: "Section 194 C",
      },
      {
        name: "Payment of contractors HUF/Indiv",
        rate: 1,
        section: "Section 194 C",
      },
      {
        name: "Payment of contractors HUF/Indiv (Reduced)",
        rate: 0.75,
        section: "Section 194 C",
      },
      { name: "Professional Fees", rate: 10, section: "Section 194 J" },
      {
        name: "Professional Fees (Reduced)",
        rate: 7.5,
        section: "Section 194 J",
      },
      {
        name: "Rent on land or furniture etc",
        rate: 10,
        section: "Section 194 I",
      },
      {
        name: "Rent on land or furniture etc (Reduced)",
        rate: 7.5,
        section: "Section 194 I",
      },
      { name: "Technical Fees (2%)", rate: 2, section: "Section 194 J" },
    ];

    let created = 0;
    let skipped = 0;

    for (const tdsData of defaultTDS) {
      const existing = await TDS.findOne({
        name: { $regex: new RegExp(`^${tdsData.name}?`, "i") },
        section: tdsData.section,
        rate: tdsData.rate,
      });

      if (!existing) {
        await TDS.create({
          ...tdsData,
          createdBy: req.user?.id,
        });
        created++;
      } else {
        skipped++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Default TDS seeded successfully. Created: ${created}, Skipped: ${skipped}`,
      data: { created, skipped },
    });
  } catch (error) {
    console.error("Error seeding default TDS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed default TDS records",
    });
  }
};


