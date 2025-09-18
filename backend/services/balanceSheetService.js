import Account from "../models/Account.js";
import Invoice from "../models/invoicemodel.js";
import mongoose from "mongoose";

/**
 * Get Balance Sheet report data as of a specific date
 */
export const getBalanceSheetReport = async (asOfDate, userId) => {
  try {
    // Get all accounts
    const accounts = await Account.find({ is_active: true }).sort({ code: 1 });

    // Group accounts by category
    const assets = accounts.filter((acc) => acc.category === "asset");
    const liabilities = accounts.filter((acc) => acc.category === "liability");
    const equity = accounts.filter((acc) => acc.category === "equity");
    const income = accounts.filter((acc) => acc.category === "income");
    const expenses = accounts.filter((acc) => acc.category === "expense");

    // Calculate totals
    const totalAssets = assets.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );
    const totalLiabilities = liabilities.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );
    const totalEquity = equity.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );

    // Calculate net profit (income - expenses)
    const totalIncome = income.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );
    const netProfit = totalIncome - totalExpenses;

    return {
      asOfDate,
      assets: {
        currentAssets: assets.filter(
          (acc) =>
            acc.subtype === "bank" ||
            acc.subtype === "cash" ||
            acc.subtype === "accounts_receivable"
        ),
        fixedAssets: assets.filter((acc) => acc.subtype === "fixed_asset"),
        otherAssets: assets.filter(
          (acc) =>
            !["bank", "cash", "accounts_receivable", "fixed_asset"].includes(
              acc.subtype
            )
        ),
        totalAssets,
      },
      liabilities: {
        currentLiabilities: liabilities.filter(
          (acc) =>
            acc.subtype === "accounts_payable" ||
            acc.subtype === "current_liability"
        ),
        longTermLiabilities: liabilities.filter(
          (acc) => acc.subtype === "long_term_liability"
        ),
        otherLiabilities: liabilities.filter(
          (acc) =>
            ![
              "accounts_payable",
              "current_liability",
              "long_term_liability",
            ].includes(acc.subtype)
        ),
        totalLiabilities,
      },
      equity: {
        accounts: equity,
        netProfit,
        totalEquity: totalEquity + netProfit,
      },
      totals: {
        totalAssets,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity + netProfit,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to generate Balance Sheet report: ${error.message}`
    );
  }
};

/**
 * Update Balance Sheet when invoice is posted (Unpaid)
 */
export const updateBalanceSheetOnInvoicePosted = async (invoiceId, session) => {
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw new Error("Invoice not found");

    // Find required accounts
    const accountsReceivable = await Account.findOne({
      category: "asset",
      subtype: "accounts_receivable",
      is_active: true,
    }).session(session);

    const dutiesAndTaxes = await Account.findOne({
      category: "liability",
      subtype: "current_liability",
      name: { $regex: /duties.*taxes|taxes.*duties/i },
    }).session(session);

    if (!accountsReceivable) {
      throw new Error(
        "Accounts Receivable account not found in chart of accounts"
      );
    }

    if (!dutiesAndTaxes) {
      throw new Error("Duties & Taxes account not found in chart of accounts");
    }

    // Increase Accounts Receivable by invoice total
    accountsReceivable.balance += invoice.total || 0;
    await accountsReceivable.save({ session });

    // Increase Duties & Taxes by GST amount
    dutiesAndTaxes.balance += invoice.taxAmount || 0;
    await dutiesAndTaxes.save({ session });

    return { accountsReceivable, dutiesAndTaxes };
  } catch (error) {
    throw new Error(
      `Failed to update Balance Sheet on invoice posted: ${error.message}`
    );
  }
};

/**
 * Update Balance Sheet when payment is received
 */
export const updateBalanceSheetOnPaymentReceived = async (
  invoiceId,
  paymentAmount,
  paymentMethod,
  session
) => {
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw new Error("Invoice not found");

    // Find required accounts
    const accountsReceivable = await Account.findOne({
      category: "asset",
      subtype: "accounts_receivable",
      is_active: true,
    }).session(session);

    let bankOrCashAccount;
    if (paymentMethod === "bank" || paymentMethod === "bank_transfer") {
      bankOrCashAccount = await Account.findOne({
        category: "asset",
        subtype: "bank",
        is_active: true,
      }).session(session);
    } else {
      bankOrCashAccount = await Account.findOne({
        category: "asset",
        subtype: "cash",
        is_active: true,
      }).session(session);
    }

    if (!accountsReceivable) {
      throw new Error(
        "Accounts Receivable account not found in chart of accounts"
      );
    }

    if (!bankOrCashAccount) {
      throw new Error("Bank/Cash account not found in chart of accounts");
    }

    // Decrease Accounts Receivable by payment amount
    accountsReceivable.balance -= paymentAmount;
    await accountsReceivable.save({ session });

    // Increase Bank/Cash by payment amount
    bankOrCashAccount.balance += paymentAmount;
    await bankOrCashAccount.save({ session });

    return { accountsReceivable, bankOrCashAccount };
  } catch (error) {
    throw new Error(
      `Failed to update Balance Sheet on payment received: ${error.message}`
    );
  }
};

/**
 * Update Balance Sheet when GST is remitted
 */
export const updateBalanceSheetOnGSTRemitted = async (
  remittedAmount,
  paymentMethod,
  session
) => {
  try {
    // Find required accounts
    const dutiesAndTaxes = await Account.findOne({
      category: "liability",
      subtype: "current_liability",
      name: { $regex: /duties.*taxes|taxes.*duties/i },
    }).session(session);

    let bankOrCashAccount;
    if (paymentMethod === "bank" || paymentMethod === "bank_transfer") {
      bankOrCashAccount = await Account.findOne({
        category: "asset",
        subtype: "bank",
        is_active: true,
      }).session(session);
    } else {
      bankOrCashAccount = await Account.findOne({
        category: "asset",
        subtype: "cash",
        is_active: true,
      }).session(session);
    }

    if (!dutiesAndTaxes) {
      throw new Error("Duties & Taxes account not found in chart of accounts");
    }

    if (!bankOrCashAccount) {
      throw new Error("Bank/Cash account not found in chart of accounts");
    }

    // Decrease Duties & Taxes by remitted amount
    dutiesAndTaxes.balance -= remittedAmount;
    await dutiesAndTaxes.save({ session });

    // Decrease Bank/Cash by remitted amount
    bankOrCashAccount.balance -= remittedAmount;
    await bankOrCashAccount.save({ session });

    return { dutiesAndTaxes, bankOrCashAccount };
  } catch (error) {
    throw new Error(
      `Failed to update Balance Sheet on GST remitted: ${error.message}`
    );
  }
};

/**
 * Reverse Balance Sheet entries when invoice is voided/cancelled
 */
export const reverseBalanceSheetOnInvoiceVoided = async (
  invoiceId,
  session
) => {
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw new Error("Invoice not found");

    // Find required accounts
    const accountsReceivable = await Account.findOne({
      category: "asset",
      subtype: "accounts_receivable",
      is_active: true,
    }).session(session);

    const dutiesAndTaxes = await Account.findOne({
      category: "liability",
      subtype: "current_liability",
      name: { $regex: /duties.*taxes|taxes.*duties/i },
    }).session(session);

    if (!accountsReceivable) {
      throw new Error(
        "Accounts Receivable account not found in chart of accounts"
      );
    }

    if (!dutiesAndTaxes) {
      throw new Error("Duties & Taxes account not found in chart of accounts");
    }

    // Decrease Accounts Receivable by invoice total
    accountsReceivable.balance -= invoice.total || 0;
    await accountsReceivable.save({ session });

    // Decrease Duties & Taxes by GST amount
    dutiesAndTaxes.balance -= invoice.taxAmount || 0;
    await dutiesAndTaxes.save({ session });

    return { accountsReceivable, dutiesAndTaxes };
  } catch (error) {
    throw new Error(
      `Failed to reverse Balance Sheet on invoice voided: ${error.message}`
    );
  }
};


