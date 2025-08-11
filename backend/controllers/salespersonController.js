import Salesperson from "../models/Salesperson.js";

export const listSalespersons = async (req, res) => {
  try {
    const { search = "", limit = 50, page = 1 } = req.query;
    const query = search
      ? {
          isActive: true,
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : { isActive: true };

    const perPage = Math.min(Number(limit) || 50, 100);
    const skip = (Number(page) - 1) * perPage;

    const [data, total] = await Promise.all([
      Salesperson.find(query).sort({ name: 1 }).skip(skip).limit(perPage),
      Salesperson.countDocuments(query),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), perPage },
    });
  } catch (err) {
    console.error("listSalespersons error", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch salespersons" });
  }
};

export const createSalesperson = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }
    const sp = await Salesperson.create({
      name,
      email: String(email).toLowerCase(),
      phone,
      createdBy: req.user?.id || null,
    });
    res.status(201).json({ success: true, data: sp });
  } catch (err) {
    console.error("createSalesperson error", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create salesperson" });
  }
};

export const updateSalesperson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, isActive } = req.body;
    const updated = await Salesperson.findByIdAndUpdate(
      id,
      { name, email, phone, isActive, updatedBy: req.user?.id || null },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateSalesperson error", err);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

export const deleteSalesperson = async (req, res) => {
  try {
    const { id } = req.params;
    await Salesperson.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteSalesperson error", err);
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};
