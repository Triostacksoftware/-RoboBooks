#!/usr/bin/env node

/**
 * Test script to verify Excel upload fix for problematic subtypes
 */

import { ACCOUNT_HEADS, ACCOUNT_GROUPS } from "./models/Account.js";
import { ExcelImportService } from "./services/excelImportService.js";

console.log("🧪 Testing Excel upload fix for problematic subtypes...\n");

// Test the specific problematic subtypes
const testCases = [
  { input: "Non-Current Liability", expected: "long_term_liability" },
  { input: "Non Current Liability", expected: "long_term_liability" },
  { input: "non-current_liability", expected: "long_term_liability" },
  { input: "non_current_liability", expected: "long_term_liability" },
  { input: "noncurrent_liability", expected: "long_term_liability" },
  { input: "Long Term Liability", expected: "long_term_liability" },
  { input: "Fixed Assets", expected: "fixed_asset" },
  { input: "Accounts Receivables", expected: "accounts_receivable" },
  { input: "Cost of Goods", expected: "cost_of_goods_sold" },
  { input: "COGS", expected: "cost_of_goods_sold" },
  { input: "Operating Expenses", expected: "operating_expense" },
  { input: "Bank", expected: "bank" },
  { input: "Cash", expected: "cash" },
];

console.log("✅ Testing subtype mapping:");
let allPassed = true;

testCases.forEach(({ input, expected }) => {
  try {
    const result = ExcelImportService.mapAccountGroupToSubtype(input);
    const status = result === expected ? "✅" : "❌";
    console.log(`${status} "${input}" → "${result}" (expected: "${expected}")`);

    if (result !== expected) {
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ "${input}" → ERROR: ${error.message}`);
    allPassed = false;
  }
});

console.log("\n📊 Summary:");
if (allPassed) {
  console.log(
    "🎉 All tests passed! The Excel upload fix is working correctly."
  );
} else {
  console.log("❌ Some tests failed. Please check the implementation.");
}

console.log("\n📋 Current valid account heads:");
console.log(ACCOUNT_HEADS.join(", "));
console.log("\n📋 Current valid account groups:");
Object.entries(ACCOUNT_GROUPS).forEach(([head, groups]) => {
  console.log(`${head}: ${groups.join(", ")}`);
});

// Test validation function
console.log("\n🧪 Testing validation function:");
const testValidationData = [
  {
    name: "Test Account 1",
    accountType: "Liability",
    accountGroup: "Non-Current Liability",
    balance: 1000,
    rowNumber: 1,
  },
  {
    name: "Test Account 2",
    accountType: "Asset",
    accountGroup: "Fixed Assets",
    balance: 5000,
    rowNumber: 2,
  },
  {
    name: "Test Account 3",
    accountType: "Expense",
    accountGroup: "Cost of Goods",
    balance: 0,
    rowNumber: 3,
  },
];

testValidationData.forEach((data) => {
  const errors = ExcelImportService.validateAccountData(data, data.rowNumber);
  if (errors.length === 0) {
    console.log(
      `✅ Row ${data.rowNumber}: "${data.accountGroup}" - No validation errors`
    );
  } else {
    console.log(
      `❌ Row ${data.rowNumber}: "${data.accountGroup}" - ${errors.join(", ")}`
    );
  }
});


