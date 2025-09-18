// services/bankService.js
import Account from '../models/Account.js';

/**
 * Apply the effect of a newly-created bank transaction
 * (deposit ➜ +amount, withdrawal ➜ –amount).
 */
export const applyTransactionToAccount = async (txn, session) => {
  const account = await Account.findById(txn.account).session(session);
  if (!account) throw new Error('Account not found');

  const delta = txn.type === 'deposit' ? txn.amount : -txn.amount;
  account.balance += delta;
  await account.save({ session });
};

/**
 * Reverse the effect of a transaction when it is deleted.
 * (deposit ➜ –amount, withdrawal ➜ +amount).
 */
export const revertTransactionFromAccount = async (txn, session) => {
  const account = await Account.findById(txn.account).session(session);
  if (!account) throw new Error('Account not found');

  const delta = txn.type === 'deposit' ? -txn.amount : txn.amount;
  account.balance += delta;
  await account.save({ session });
};


