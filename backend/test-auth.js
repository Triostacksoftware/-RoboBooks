import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000";

async function testAuth() {
  console.log("🧪 Testing RoboBooks Authentication API\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health check...");
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData);

    // Test 2: Register a test user
    console.log("\n2. Testing user registration...");
    const registerData = {
      companyName: "Test Company",
      email: "test@example.com",
      phoneNumber: "9876543210",
      phoneDialCode: "+91",
      phoneIso2: "IN",
      password: "password123",
      country: "India",
      state: "Uttar Pradesh",
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    const registerResult = await registerResponse.json();

    if (registerResponse.ok) {
      console.log("✅ Registration successful:", registerResult);
    } else {
      console.log("❌ Registration failed:", registerResult);
    }

    // Test 3: Login with the registered user
    console.log("\n3. Testing user login...");
    const loginData = {
      emailOrPhone: "test@example.com",
      password: "password123",
    };

    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const loginResult = await loginResponse.json();

    if (loginResponse.ok) {
      console.log("✅ Login successful:", loginResult);

      // Get cookies for session test
      const cookies = loginResponse.headers.get("set-cookie");
      console.log("🍪 Session cookie set:", cookies ? "Yes" : "No");
    } else {
      console.log("❌ Login failed:", loginResult);
    }

    // Test 4: Test invalid login
    console.log("\n4. Testing invalid login...");
    const invalidLoginData = {
      emailOrPhone: "test@example.com",
      password: "wrongpassword",
    };

    const invalidLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidLoginData),
    });

    const invalidLoginResult = await invalidLoginResponse.json();

    if (!invalidLoginResponse.ok) {
      console.log("✅ Invalid login correctly rejected:", invalidLoginResult);
    } else {
      console.log("❌ Invalid login should have been rejected");
    }

    console.log("\n🎉 Authentication tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. The backend server is running (npm start)");
    console.log("   2. MongoDB is running");
    console.log("   3. The server is accessible at http://localhost:5000");
  }
}

// Run the test
testAuth();
