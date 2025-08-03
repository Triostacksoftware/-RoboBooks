// controllers/bankTransactionController.js
import mongoose from 'mongoose';
import BankTransaction from '../models/BankTransaction.js';
import { applyTransaction } from '../services/applyTransaction.js';
import {
  applyTransactionToAccount,
  revertTransactionFromAccount,
} from '../services/bankService.js';

/**
 * GET /api/bank-transactions
 * List (optionally filtered) bank transactions.
 */
export const listTransactions = async (req, res) => {
  const { reconciled } = req.query; // e.g. ?reconciled=true
  const filter = {};
  if (reconciled !== undefined) filter.reconciled = reconciled === 'true';
  const txns = await BankTransaction.find(filter).populate('account');
  res.json(txns);
};

/**
 * POST /api/bank-transactions
 * Create a deposit / withdrawal and update account balance.
 */
export const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [txn] = await BankTransaction.create([req.body], { session });
    await applyTransaction(txn, session);
    await session.commitTransaction();
    res.status(201).json(txn);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * PATCH /api/bank-transactions/:id/reconcile
 * Mark one transaction as reconciled.
 */
export const reconcileTransaction = async (req, res) => {
  const { id } = req.params;
  const txn = await BankTransaction.findByIdAndUpdate(
    id,
    { reconciled: true },
    { new: true },
  );
  if (!txn) return res.status(404).json({ message: 'Transaction not found' });
  res.json(txn);
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const txn = await BankTransaction.findById(id).session(session);
    if (!txn) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await revertTransactionFromAccount(txn, session); // restore balance
    await txn.deleteOne({ session });                 // delete transaction
    await session.commitTransaction();
    res.status(204).end();
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
