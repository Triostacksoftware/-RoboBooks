import TCS from "../models/TCS.js";

// Get all TCS taxes
export const getAllTCS = async (req, res) => {
  try {
    const tcsRecords = await TCS.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: tcsRecords,
    });
  } catch (error) {
    console.error("Error fetching TCS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch TCS records",
    });
  }
};

// Get active TCS taxes only
export const getActiveTCS = async (req, res) => {
  try {
    const currentDate = new Date();
    const tcsRecords = await TCS.find({
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
    }).sort({ natureOfCollection: 1, rate: 1 });

    res.status(200).json({
      success: true,
      data: tcsRecords,
    });
  } catch (error) {
    console.error("Error fetching active TCS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active TCS records",
    });
  }
};

// Get TCS by ID
export const getTCSById = async (req, res) => {
  try {
    const tcs = await TCS.findById(req.params.id);
    if (!tcs) {
      return res.status(404).json({
        success: false,
        error: "TCS record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tcs,
    });
  } catch (error) {
    console.error("Error fetching TCS by ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch TCS record",
    });
  }
};

// Create new TCS
export const createTCS = async (req, res) => {
  try {
    const {
      name,
      rate,
      natureOfCollection,
      section,
      status,
      isHigherRate,
      applicableFrom,
      applicableTo,
    } = req.body;

    // Validation
    if (!name || !rate || !natureOfCollection) {
      return res.status(400).json({
        success: false,
        error: "Name, rate, and nature of collection are required",
      });
    }

    if (rate < 0 || rate > 100) {
      return res.status(400).json({
        success: false,
        error: "Rate must be between 0 and 100",
      });
    }

    // Check for duplicate TCS
    const existingTCS = await TCS.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      natureOfCollection: natureOfCollection,
      rate: rate,
    });

    if (existingTCS) {
      return res.status(400).json({
        success: false,
        error:
          "TCS with same name, nature of collection, and rate already exists",
      });
    }

    const tcsData = {
      name: name.trim(),
      rate: parseFloat(rate),
      natureOfCollection: natureOfCollection.trim(),
      section: section ? section.trim() : undefined,
      status: status || "Active",
      isHigherRate: isHigherRate || false,
      createdBy: req.user?.id,
    };

    if (applicableFrom) {
      tcsData.applicableFrom = new Date(applicableFrom);
    }

    if (applicableTo) {
      tcsData.applicableTo = new Date(applicableTo);
    }

    const tcs = new TCS(tcsData);
    await tcs.save();

    res.status(201).json({
      success: true,
      data: tcs,
      message: "TCS created successfully",
    });
  } catch (error) {
    console.error("Error creating TCS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create TCS record",
    });
  }
};

// Update TCS
export const updateTCS = async (req, res) => {
  try {
    const {
      name,
      rate,
      natureOfCollection,
      section,
      status,
      isHigherRate,
      applicableFrom,
      applicableTo,
    } = req.body;

    const tcs = await TCS.findById(req.params.id);
    if (!tcs) {
      return res.status(404).json({
        success: false,
        error: "TCS record not found",
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
    if (name || natureOfCollection || rate !== undefined) {
      const checkName = name || tcs.name;
      const checkNature = natureOfCollection || tcs.natureOfCollection;
      const checkRate = rate !== undefined ? rate : tcs.rate;

      const existingTCS = await TCS.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${checkName}$`, "i") },
        natureOfCollection: checkNature,
        rate: checkRate,
      });

      if (existingTCS) {
        return res.status(400).json({
          success: false,
          error:
            "TCS with same name, nature of collection, and rate already exists",
        });
      }
    }

    // Update fields
    if (name) tcs.name = name.trim();
    if (rate !== undefined) tcs.rate = parseFloat(rate);
    if (natureOfCollection) tcs.natureOfCollection = natureOfCollection.trim();
    if (section) tcs.section = section.trim();
    if (status) tcs.status = status;
    if (isHigherRate !== undefined) tcs.isHigherRate = isHigherRate;

    if (applicableFrom) {
      tcs.applicableFrom = new Date(applicableFrom);
    }

    if (applicableTo) {
      tcs.applicableTo = new Date(applicableTo);
    }

    await tcs.save();

    res.status(200).json({
      success: true,
      data: tcs,
      message: "TCS updated successfully",
    });
  } catch (error) {
    console.error("Error updating TCS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update TCS record",
    });
  }
};

// Delete TCS
export const deleteTCS = async (req, res) => {
  try {
    const tcs = await TCS.findById(req.params.id);
    if (!tcs) {
      return res.status(404).json({
        success: false,
        error: "TCS record not found",
      });
    }

    await TCS.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "TCS deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting TCS:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete TCS record",
    });
  }
};

// Get nature of collection options
export const getNatureOfCollectionOptions = async (req, res) => {
  try {
    const options = [
      "206C(1)",
      "206C(1H)",
      "206C(6)",
      "206C(6CP)",
      "206C(7)",
      "206C(8)",
      "206C(9)",
      "206C(10)",
      "Other",
    ];

    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error("Error fetching nature of collection options:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch nature of collection options",
    });
  }
};
