import fetch from "node-fetch";

const testLogin = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@robobooks.com",
        password: "admin123",
      }),
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error testing login:", error);
  }
};

testLogin();
