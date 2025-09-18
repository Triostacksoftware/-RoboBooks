import * as Svc from '../services/bills.service.js';

export const createBill = async (req, res, next) => {
  try {
    const bill = await Svc.createBill(req.body);
    res.status(201).json({ success: true, data: bill });
  } catch (err) { next(err); }
};

export const getBills = async (req, res, next) => {
  try {
    const result = await Svc.getBills(req.query);
    res.json({ success: true, data: result.bills, pagination: result.pagination });
  } catch (err) { next(err); }
};

export const getBillById = async (req, res, next) => {
  try {
    const bill = await Svc.getBillById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) { next(err); }
};

// Get bill statistics
export const getBillStats = async (req, res, next) => {
  try {
    const stats = await Svc.getBillStats(req.query);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};


