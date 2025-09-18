import * as Svc from '../services/expenses.service.js';

export const createExpense = async (req, res, next) => {
  try {
    const exp = await Svc.createExpense(req.body);
    res.status(201).json({ success: true, data: exp });
  } catch (err) { next(err); }
};

export const listExpenses = async (req, res, next) => {
  try {
    const items = await Svc.getAllExpenses();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};


