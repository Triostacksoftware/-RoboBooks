import fetch from "node-fetch";

(async () => {
  try {
    const res = await fetch("http://localhost:5000/api/admin/create-simple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Mock",
        lastName: "Admin",
        email: "mockadmin@robobooks.com",
        password: "admin123",
        role: "admin",
        permissions: ["view_analytics"],
      }),
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
})();
