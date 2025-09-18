import Salesperson from "../models/salespersonModel.js";

// Create a new salesperson
export const createSalesperson = async (salespersonData) => {
  try {
    const salesperson = new Salesperson(salespersonData);
    const savedSalesperson = await salesperson.save();
    return { success: true, data: savedSalesperson };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, error: "Email already exists" };
    }
    return { success: false, error: error.message };
  }
};

// Get all salespersons
export const getAllSalespersons = async () => {
  try {
    const salespersons = await Salesperson.find().sort({ createdAt: -1 });
    return { success: true, data: salespersons };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get active salespersons
export const getActiveSalespersons = async () => {
  try {
    const salespersons = await Salesperson.find({ status: "Active" }).sort({ name: 1 });
    return { success: true, data: salespersons };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get salesperson by ID
export const getSalespersonById = async (id) => {
  try {
    const salesperson = await Salesperson.findById(id);
    if (!salesperson) {
      return { success: false, error: "Salesperson not found" };
    }
    return { success: true, data: salesperson };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update salesperson
export const updateSalesperson = async (id, updateData) => {
  try {
    const salesperson = await Salesperson.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!salesperson) {
      return { success: false, error: "Salesperson not found" };
    }
    return { success: true, data: salesperson };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, error: "Email already exists" };
    }
    return { success: false, error: error.message };
  }
};

// Delete salesperson
export const deleteSalesperson = async (id) => {
  try {
    const salesperson = await Salesperson.findByIdAndDelete(id);
    if (!salesperson) {
      return { success: false, error: "Salesperson not found" };
    }
    return { success: true, data: salesperson };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update salesperson status
export const updateSalespersonStatus = async (id, status) => {
  try {
    const salesperson = await Salesperson.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!salesperson) {
      return { success: false, error: "Salesperson not found" };
    }
    return { success: true, data: salesperson };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


