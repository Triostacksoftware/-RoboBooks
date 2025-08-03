import BankTransaction from "../models/BankTransaction.js";

export async function getTransactions(req, res) {
  const filter = {};
  if (req.query.account_id) filter.account_id = req.query.account_id;
  if (req.query.startDate && req.query.endDate) {
    filter.txn_date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  const txns = await BankTransaction.find(filter).populate("account_id", "name");
  res.json(txns);
}

export async function reconcileTransactions(req, res) {
  const { txn_ids } = req.body;
  const result = await BankTransaction.updateMany(
    { _id: { $in: txn_ids } },
    { $set: { reconciled: true } }
  );
  res.json({ success: true, reconciled_count: result.modifiedCount });
}
