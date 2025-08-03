import Account from "../models/Account.js";

export async function getAccounts(req, res) {
  const accounts = await Account.find();
  res.json(accounts);
}

export async function createAccount(req, res) {
  const acct = new Account(req.body);
  await acct.save();
  res.status(201).json({ success: true, account_id: acct._id });
}

export async function updateAccount(req, res) {
  await Account.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
}
