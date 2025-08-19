#!/usr/bin/env node

/**
 * Test script to verify subtype validation
 * Run this to test if the 'loans' subtype is now valid
 */

import { ACCOUNT_SUBTYPES } from "./models/Account.js";

console.log("🧪 Testing subtype validation...\n");

// Test the specific subtype that was causing the error
const testSubtypes = [
  "loans",
  "bank",
  "cash",
  "accounts_receivable",
  "fixed_asset",
  "inventory",
  "other_asset",
  "current_asset",
  "investment",
  "advances",
  "prepaid_expenses",
  "accounts_payable",
  "credit_card",
  "current_liability",
  "long_term_liability",
  "provisions",
  "loans_payable",
  "bonds_payable",
  "owner_equity",
  "retained_earnings",
  "capital",
  "drawings",
  "sales",
  "service_revenue",
  "other_income",
  "direct_income",
  "indirect_income",
  "interest_income",
  "commission_income",
  "cost_of_goods_sold",
  "operating_expense",
  "other_expense",
  "direct_expense",
  "indirect_expense",
  "salary_expense",
  "rent_expense",
  "utilities_expense",
  "advertising_expense",
  "depreciation_expense",
  "interest_expense",
  "tax_expense",
];

console.log("✅ Valid subtypes:");
testSubtypes.forEach((subtype) => {
  if (ACCOUNT_SUBTYPES.includes(subtype)) {
    console.log(`  ✅ ${subtype}`);
  } else {
    console.log(`  ❌ ${subtype} - NOT FOUND`);
  }
});

console.log("\n📊 Summary:");
console.log(`Total valid subtypes: ${ACCOUNT_SUBTYPES.length}`);
console.log(`Tested subtypes: ${testSubtypes.length}`);

// Test the specific error case
const loansSubtype = "loans";
if (ACCOUNT_SUBTYPES.includes(loansSubtype)) {
  console.log(`\n🎉 SUCCESS: '${loansSubtype}' is now a valid subtype!`);
} else {
  console.log(`\n❌ ERROR: '${loansSubtype}' is still not a valid subtype`);
}

console.log("\n📋 All valid subtypes:");
console.log(ACCOUNT_SUBTYPES.join(", "));
