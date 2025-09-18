import Account from "../models/Account.js";
import Invoice from "../models/invoicemodel.js";
import mongoose from "mongoose";

/**
 * Get Profit & Loss report data for a specific date range
 */
export const getProfitLossReport = async (startDate, endDate, userId) => {
  try {
    // Get all accounts
    const accounts = await Account.find({ is_active: true }).sort({ code: 1 });

    // Get invoices in the date range
    const invoices = await Invoice.find({
      invoiceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $in: ["Unpaid", "Paid", "Partially Paid"] },
    });

    // Calculate income (Sales/Direct Income)
    const salesAccounts = accounts.filter(
      (acc) => acc.category === "income" && acc.subtype === "sales"
    );

    const salesIncome = invoices.reduce((total, invoice) => {
      // For cash basis: only count paid invoices
      // For accrual basis: count all posted invoices
      if (invoice.status === "Paid" || invoice.status === "Partially Paid") {
        return total + (invoice.subTotal || 0);
      }
      return total;
    }, 0);

    // Calculate expenses (from other income/expense accounts)
    const expenseAccounts = accounts.filter(
      (acc) => acc.category === "expense"
    );

    const expenses = expenseAccounts.map((account) => ({
      accountId: account._id,
      accountName: account.name,
      amount: account.balance || 0,
    }));

    // Calculate net profit
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = salesIncome - totalExpenses;

    return {
      period: {
        startDate,
        endDate,
      },
      income: {
        sales: salesIncome,
        otherIncome: 0, // To be implemented
        totalIncome: salesIncome,
      },
      expenses: {
        items: expenses,
        totalExpenses,
      },
      netProfit,
      cashBasis: true, // Default to cash basis
    };
  } catch (error) {
    throw new Error(`Failed to generate P&L report: ${error.message}`);
  }
};

/**
 * Update P&L when invoice is posted (accrual basis)
 */
export const updatePLOnInvoicePosted = async (invoiceId, session) => {
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw new Error("Invoice not found");

    // Find Sales account
    const salesAccount = await Account.findOne({
      category: "income",
      subtype: "sales",
      is_active: true,
    }).session(session);

    if (!salesAccount) {
      throw new Error("Sales account not found in chart of accounts");
    }

    // Increase Sales account by invoice subtotal
    salesAccount.balance += invoice.subTotal || 0;
    await salesAccount.save({ session });

    return salesAccount;
  } catch (error) {
    throw new Error(`Failed to update P&L on invoice posted: ${error.message}`);
  }
};

/**
 * Update P&L when payment is received (cash basis)
 */
export const updatePLOnPaymentReceived = async (
  invoiceId,
  paymentAmount,
  paymentDate,
  session
) => {
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw new Error("Invoice not found");

    // Find Sales account
    const salesAccount = await Account.findOne({
      category: "income",
      subtype: "sales",
      is_active: true,
    }).session(session);

    if (!salesAccount) {
      throw new Error("Sales account not found in chart of accounts");
    }

    // Calculate the portion of payment that goes to sales (before GST)
    const paymentRatio = paymentAmount / invoice.total;
    const salesAmount = (invoice.subTotal || 0) * paymentRatio;

    // Increase Sales account by the sales portion of payment
    salesAccount.balance += salesAmount;
    await salesAccount.save({ session });

    return salesAccount;
  } catch (error) {
    throw new Error(
      `Failed to update P&L on payment received: ${error.message}`
    );
  }
};

/**
 * Reverse P&L entries when invoice is voided/cancelled
 */
export const reversePLOnInvoiceVoided = async (invoiceId, session) => {
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw new Error("Invoice not found");

    // Find Sales account
    const salesAccount = await Account.findOne({
      category: "income",
      subtype: "sales",
      is_active: true,
    }).session(session);

    if (!salesAccount) {
      throw new Error("Sales account not found in chart of accounts");
    }

    // Decrease Sales account by invoice subtotal
    salesAccount.balance -= invoice.subTotal || 0;
    await salesAccount.save({ session });

    return salesAccount;
  } catch (error) {
    throw new Error(
      `Failed to reverse P&L on invoice voided: ${error.message}`
    );
  }
};


