// services/applyTransaction.js
import Account from '../models/Account.js';

/**
 * Apply the effect of a single bank transaction to its linked account.
 * @param {import('mongoose').Document} txn
 * @param {import('mongoose').ClientSession} session
 */
export const applyTransaction = async (txn, session) => {
  const account = await Account.findById(txn.account).session(session);
  if (!account) throw new Error('Linked account not found');

  // Assume bank accounts are **Assets**
  // Deposit => DR asset   | Withdrawal => CR asset
  account.balance += txn.type === 'deposit' ? txn.amount : -txn.amount;
  await account.save({ session });
};


