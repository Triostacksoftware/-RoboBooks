import Expense from '../models/Expense.js';

export const createExpense   = (data) => Expense.create(data);
export const getAllExpenses  = ()     => Expense.find().sort({ date: -1 });
