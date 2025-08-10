// Test script to check API connection from frontend
const testApiConnection = async () => {
  try {
    console.log("Testing API connection...");

    // Test basic health endpoint
    const healthResponse = await fetch("http://localhost:5000/api/health", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("Health check status:", healthResponse.status);
    const healthData = await healthResponse.json();
    console.log("Health check data:", healthData);

    // Test admin login endpoint
    const loginResponse = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "mockadmin@robobooks.com",
        password: "admin123",
      }),
    });

    console.log("Login status:", loginResponse.status);
    console.log(
      "Login headers:",
      Object.fromEntries(loginResponse.headers.entries())
    );

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("Login data:", loginData);
    } else {
      const errorData = await loginResponse.text();
      console.log("Login error:", errorData);
    }
  } catch (error) {
    console.error("Connection error:", error);
  }
};

testApiConnection();
