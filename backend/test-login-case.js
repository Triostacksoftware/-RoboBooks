import fetch from "node-fetch";

const testLoginCases = async () => {
  const testCases = [
    { email: "admin@robobooks.com", password: "admin123" },
    { email: "ADMIN@ROBOBOOKS.COM", password: "admin123" },
    { email: "Admin@RoboBooks.com", password: "admin123" },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: ${testCase.email}`);
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase),
      });

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error testing login:", error);
    }
  }
};

testLoginCases();
