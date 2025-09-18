import Account from "../models/Account.js";
// backend/controllers/accountController.js
import mongoose from "mongoose";
import { ACCOUNT_HEADS, ACCOUNT_GROUPS } from "../models/Account.js";

export async function getAccounts(req, res) {
  try {
    const { accountHead, parent, isActive } = req.query;
    const filter = {};

    if (accountHead) filter.accountHead = accountHead;
    if (parent !== undefined) filter.parent = parent === "null" ? null : parent;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const accounts = await Account.find(filter).sort({ code: 1, name: 1 });
    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch accounts" });
  }
}

export const listAccounts = async (req, res) => {
  try {
    const { accountHead, parent, isActive } = req.query;
    const filter = {};

    if (accountHead) filter.accountHead = accountHead;
    if (parent !== undefined) filter.parent = parent === "null" ? null : parent;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const accounts = await Account.find(filter).sort({ code: 1, name: 1 });
    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch accounts" });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid account id" });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    res.json({ success: true, data: account });
  } catch (error) {
    console.error("Error fetching account:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch account" });
  }
};

// export async function createAccount(req, res) {
//   const acct = new Account(req.body);
//   await acct.save();
//   res.status(201).json({ success: true, account_id: acct._id });
// }

// export async function updateAccount(req, res) {
//   await Account.findByIdAndUpdate(req.params.id, req.body);
//   res.json({ success: true });
// }

// /**
//  * GET /api/accounts
//  * Optional query params:
//  *   - category   (asset | liability | equity | income | expense)
//  *   - parent     (ObjectId) – list children of that parent
//  *   - is_active  (true / false)
//  */
// export const listAccounts = async (req, res) => {
//   const { category, parent, is_active } = req.query;
//   const filter = {};

//   if (category) filter.category = category;
//   if (parent !== undefined) filter.parent = parent === "null" ? null : parent;
//   if (is_active !== undefined) filter.is_active = is_active === "true";

//   const accounts = await Account.find(filter).sort({ code: 1, name: 1 });
//   res.json(accounts);
// };

// /**
//  * GET /api/accounts/:id
//  */
// export const getAccountById = async (req, res) => {
//   const { id } = req.params;
//   if (!mongoose.isValidObjectId(id))
//     return res.status(400).json({ message: "Invalid account id" });

//   const account = await Account.findById(id);
//   if (!account) return res.status(404).json({ success: false, message: "Account not found" });

//   res.json(account);
// };

/**
 * POST /api/accounts
 * Body: { code$, name, accountHead, accountGroup$, parent$, openingBalance$, currency$ }
 */
export const createAccount = async (req, res) => {
  const {
    name,
    accountHead,
    accountGroup,
    parent,
    code,
    openingBalance = 0,
    currency = "INR",
    description,
  } = req.body;

  // Basic validations
  if (!name || !accountHead) {
    return res.status(400).json({ message: "name and accountHead are required" });
  }
  if (!ACCOUNT_HEADS.includes(accountHead)) {
    return res.status(400).json({ message: "Invalid account head" });
  }
  if (accountGroup && accountGroup.length > 100) {
    return res
      .status(400)
      .json({ message: "Account group is too long (max 100 characters)" });
  }

  try {
    const account = await Account.create({
      name,
      accountHead,
      accountGroup,
      parent: parent || null,
      code,
      openingBalance,
      balance: openingBalance, // initialise running balance
      currency,
      description,
    });
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    // Handle duplicate key errors (code or unique name index)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate account code or name" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/accounts/:id
 * Body can include any updatable fields except balance (calculated)
 */
export const updateAccount = async (req, res) => {
  const { id } = req.params;
  const updatable = { ...req.body };

  // Prevent manual balance tampering
  delete updatable.balance;

  try {
    const updated = await Account.findByIdAndUpdate(id, updatable, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate account code or name" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/accounts/:id
 * (soft-delete by default: set is_active=false to preserve history)
 * $force=true  – hard delete; allowed only if balance = 0
 */
export const deleteAccount = async (req, res) => {
  const { id } = req.params;
  const { force } = req.query;

  const account = await Account.findById(id);
  if (!account)
    return res
      .status(404)
      .json({ success: false, message: "Account not found" });

  // Hard delete requested
  if (force === "true") {
    if (account.balance !== 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot hard-delete: balance not zero",
        });
    }
    await account.deleteOne();
    return res.status(204).end();
  }

  // Soft delete (recommended)
  account.is_active = false;
  await account.save();
  res.status(204).end();
};


