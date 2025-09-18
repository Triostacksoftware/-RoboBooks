import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api";

const testAPI = async () => {
  try {
    console.log("🧪 Testing Chart of Accounts API endpoints...\n");

    // Test 1: Get all accounts
    console.log("1️⃣ Testing GET /api/chart-of-accounts");
    try {
      const response = await fetch(`${BASE_URL}/chart-of-accounts`);
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Success: Found ${data.data.length} accounts`);
        console.log(
          `📊 Pagination: Page ${data.pagination.page} of ${data.pagination.pages}`
        );
        console.log(`📈 Stats: ${Object.keys(data.stats).length} categories`);
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Get categories
    console.log("2️⃣ Testing GET /api/chart-of-accounts/categories");
    try {
      const response = await fetch(`${BASE_URL}/chart-of-accounts/categories`);
      const data = await response.json();

      if (response.ok) {
        console.log(
          `✅ Success: Found ${data.data.categories.length} categories`
        );
        console.log(`📋 Categories: ${data.data.categories.join(", ")}`);
        console.log(
          `📋 Subtypes: ${data.data.subtypes.length} subtypes available`
        );
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 3: Get accounts by category
    console.log("3️⃣ Testing GET /api/chart-of-accounts$category=asset");
    try {
      const response = await fetch(
        `${BASE_URL}/chart-of-accounts$category=asset`
      );
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Success: Found ${data.data.length} asset accounts`);
        data.data.forEach((account) => {
          console.log(`  - ${account.code}: ${account.name}`);
        });
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 4: Search accounts
    console.log("4️⃣ Testing GET /api/chart-of-accounts$search=cash");
    try {
      const response = await fetch(`${BASE_URL}/chart-of-accounts$search=cash`);
      const data = await response.json();

      if (response.ok) {
        console.log(
          `✅ Success: Found ${data.data.length} accounts matching 'cash'`
        );
        data.data.forEach((account) => {
          console.log(`  - ${account.code}: ${account.name}`);
        });
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 5: Get account hierarchy
    console.log("5️⃣ Testing GET /api/chart-of-accounts/hierarchy");
    try {
      const response = await fetch(`${BASE_URL}/chart-of-accounts/hierarchy`);
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Success: Found ${data.data.length} root accounts`);
        data.data.forEach((account) => {
          console.log(
            `  - ${account.code}: ${account.name} (${account.children.length} children)`
          );
        });
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 6: Test pagination
    console.log("6️⃣ Testing GET /api/chart-of-accounts$page=1&limit=5");
    try {
      const response = await fetch(
        `${BASE_URL}/chart-of-accounts$page=1&limit=5`
      );
      const data = await response.json();

      if (response.ok) {
        console.log(
          `✅ Success: Page ${data.pagination.page} of ${data.pagination.pages}`
        );
        console.log(
          `📊 Showing ${data.data.length} of ${data.pagination.total} accounts`
        );
        data.data.forEach((account) => {
          console.log(`  - ${account.code}: ${account.name}`);
        });
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }

    console.log("\n🎉 API testing completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testAPI();


