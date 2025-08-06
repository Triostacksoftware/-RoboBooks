// src/lib/api.ts
export async function api<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...rest } = init;

  // Use hardcoded backend URL for now
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  console.log("🌐 Making request to:", `${backendUrl}${path}`);

  const res = await fetch(`${backendUrl}${path}`, {
    credentials: "include", // <-- send/receive rb_session cookie
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

// Logout utility function
export async function logout(): Promise<void> {
  try {
    console.log("🚪 Logging out...");
    await api("/api/auth/logout", { method: "POST" });
    console.log("✅ Logout successful");
  } catch (error) {
    console.error("❌ Logout failed:", error);
    // Even if logout fails, we still want to clear the session
  }
}
