#!/usr/bin/env node

/**
 * Test script to verify the new Excel parsing flow
 */

import { ExcelParserService } from "./src/services/excelParserService.js";

console.log("🧪 Testing Excel parsing flow...\n");

// Test data that would come from Excel
const testExcelData = [
  ["Account Name", "Account Head", "Account Group", "Balance", "Balance Type"],
  ["Cash in Hand", "Asset", "Cash", "50000", "debit"],
  ["Bank Account", "Asset", "Bank", "100000", "debit"],
  ["Accounts Receivable", "Asset", "Accounts Receivable", "25000", "debit"],
  ["Inventory", "Asset", "Inventory", "75000", "debit"],
  ["Equipment", "Asset", "Fixed Asset", "50000", "debit"],
  ["Accounts Payable", "Liability", "Accounts Payable", "30000", "credit"],
  ["Bank Loan", "Liability", "Long Term Liability", "200000", "credit"],
  ["Owner's Capital", "Equity", "Capital", "100000", "credit"],
  ["Sales Revenue", "Income", "Sales", "0", "credit"],
  ["Cost of Goods Sold", "Expense", "Cost of Goods Sold", "0", "debit"],
  ["Rent Expense", "Expense", "Rent Expense", "0", "debit"],
];

// Test problematic data
const testProblematicData = [
  ["Account Name", "Account Head", "Account Group", "Balance", "Balance Type"],
  ["Test Account 1", "Liability", "Non-Current Liability", "1000", "credit"],
  ["Test Account 2", "Asset", "Fixed Assets", "5000", "debit"],
  ["Test Account 3", "Expense", "Cost of Goods", "0", "debit"],
  ["Test Account 4", "Asset", "Capital Account", "1000", "debit"], // This should fail
];

console.log("✅ Testing valid data parsing:");
try {
  const result1 = ExcelParserService.parseRows(testExcelData);
  console.log(`  Valid rows: ?{result1.validRows}`);
  console.log(`  Errors: ?{result1.errors.length}`);
  console.log(`  Total rows: ?{result1.totalRows}`);

  if (result1.errors.length === 0) {
    console.log("  ✅ All rows parsed successfully");
  } else {
    console.log("  ❌ Some errors found:");
    result1.errors.forEach((error) => {
      console.log(`    Row ?{error.row}: ?{error.field} - ?{error.message}`);
    });
  }
} catch (error) {
  console.log(`  ❌ Error: ?{error.message}`);
}

console.log("\n✅ Testing problematic data parsing:");
try {
  const result2 = ExcelParserService.parseRows(testProblematicData);
  console.log(`  Valid rows: ?{result2.validRows}`);
  console.log(`  Errors: ?{result2.errors.length}`);
  console.log(`  Total rows: ?{result2.totalRows}`);

  if (result2.errors.length > 0) {
    console.log("  ⚠️ Errors found (expected):");
    result2.errors.forEach((error) => {
      console.log(`    Row ?{error.row}: ?{error.field} - ?{error.message}`);
    });
  }
} catch (error) {
  console.log(`  ❌ Error: ?{error.message}`);
}

console.log("\n✅ Testing account group mapping:");
const testMappings = [
  { input: "Non-Current Liability", expected: "long_term_liability" },
  { input: "Fixed Assets", expected: "fixed_asset" },
  { input: "Cost of Goods", expected: "cost_of_goods_sold" },
  { input: "Bank", expected: "bank" },
];

testMappings.forEach(({ input, expected }) => {
  const result = ExcelParserService.mapAccountGroup(input);
  const status = result === expected ? "✅" : "❌";
  console.log(`  ?{status} "?{input}" → "?{result}" (expected: "?{expected}")`);
});

console.log("\n🎉 Excel parsing flow test completed!");
