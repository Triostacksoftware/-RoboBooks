#!/usr/bin/env node

/**
 * Test script to verify subtype validation
 * Run this to test if the 'loans' subtype is now valid
 */

import { ACCOUNT_HEADS, ACCOUNT_GROUPS } from "./models/Account.js";

console.log("🧪 Testing account head and group validation...\n");

// Test account heads
const testAccountHeads = ACCOUNT_HEADS;

// Test account groups
const testAccountGroups = Object.values(ACCOUNT_GROUPS).flat();

console.log("✅ Valid account heads:");
testAccountHeads.forEach((head) => {
  console.log(`  ✅ ${head}`);
});

console.log("\n✅ Valid account groups:");
testAccountGroups.forEach((group) => {
  console.log(`  ✅ ${group}`);
});

console.log("\n📊 Summary:");
console.log(`Total valid account heads: ${ACCOUNT_HEADS.length}`);
console.log(`Total valid account groups: ${testAccountGroups.length}`);

// Test the specific error case - check if "Loans" is in the liability groups
const loansGroup = "Loans";
const liabilityGroups = ACCOUNT_GROUPS.liability || [];
if (liabilityGroups.includes(loansGroup)) {
  console.log(`\n🎉 SUCCESS: '${loansGroup}' is now a valid account group!`);
} else {
  console.log(`\n❌ ERROR: '${loansGroup}' is still not a valid account group`);
}

console.log("\n📋 All valid account heads:");
console.log(ACCOUNT_HEADS.join(", "));

console.log("\n📋 All valid account groups by category:");
Object.entries(ACCOUNT_GROUPS).forEach(([head, groups]) => {
  console.log(`${head}: ${groups.join(", ")}`);
});
