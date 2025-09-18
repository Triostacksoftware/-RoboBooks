import {
  createSalesperson,
  getAllSalespersons,
  getActiveSalespersons,
  getSalespersonById,
  updateSalesperson,
  deleteSalesperson,
  updateSalespersonStatus,
} from "../services/salespersonService.js";

// Create a new salesperson
export const createSalespersonController = async (req, res) => {
  try {
    const result = await createSalesperson(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all salespersons
export const getAllSalespersonsController = async (req, res) => {
  try {
    const result = await getAllSalespersons();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active salespersons
export const getActiveSalespersonsController = async (req, res) => {
  try {
    const result = await getActiveSalespersons();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get salesperson by ID
export const getSalespersonByIdController = async (req, res) => {
  try {
    const result = await getSalespersonById(req.params.id);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update salesperson
export const updateSalespersonController = async (req, res) => {
  try {
    const result = await updateSalesperson(req.params.id, req.body);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete salesperson
export const deleteSalespersonController = async (req, res) => {
  try {
    const result = await deleteSalesperson(req.params.id);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update salesperson status
export const updateSalespersonStatusController = async (req, res) => {
  try {
    const result = await updateSalespersonStatus(req.params.id, req.body.status);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


