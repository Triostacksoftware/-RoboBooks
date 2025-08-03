// src/lib/api.ts
export async function api<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...rest } = init;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    credentials: "include",          // <-- send/receive rb_session cookie
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    body: json ? JSON.stringify(json) : undefined,
    ...rest
  });

  if (!res.ok) {
    const { message } = (await res.json()) as { message: string };
    throw new Error(message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}
