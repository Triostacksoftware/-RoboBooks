"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";

export default function SignIn() {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state === "signin") {
      console.log("🔄 Processing Google OAuth callback...");
      handleGoogleCallback(code);
    }
  }, []);

  const handleGoogleCallback = async (code) => {
    setLoading(true);
    setErr("");
    try {
      console.log("🔄 Making request to backend with code:", code);
      const response = await api("/api/auth/google/callback", {
        method: "POST",
        json: {
          code,
          redirectUri: `${window.location.origin}/signin`,
          type: "signin",
        },
      });

      console.log("📡 Backend response:", response);

      if (response.success) {
        console.log(
          "✅ Google sign-in successful, redirecting to dashboard..."
        );
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        console.log("🔄 About to redirect to dashboard");
        // Use full URL for production redirect
        const dashboardUrl = process.env.NEXT_PUBLIC_MAIN_URL
          ? process.env.NEXT_PUBLIC_MAIN_URL + "/dashboard"
          : "/dashboard";
        window.location.href = dashboardUrl;
        console.log("✅ Redirect completed");

        // Fallback redirect after a short delay using NEXT_PUBLIC_MAIN_URL
        setTimeout(() => {
          console.log(
            "🔄 Fallback redirect to dashboard using NEXT_PUBLIC_MAIN_URL"
          );
          window.location.href =
            process.env.NEXT_PUBLIC_MAIN_URL + "/dashboard";
        }, 1000);
      } else {
        console.log("❌ Backend returned success: false");
        setErr("Google sign-in failed. Please try again.");
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } catch (error) {
      console.error("❌ Google OAuth callback error:", error);
      setErr(error.message || "Google sign-in failed. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setLoading(false);
    }
  };

  /* ------------ classic JWT login ------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const response = await api("/api/auth/login", {
        method: "POST",
        json: { emailOrPhone, password },
      });

      if (response.success) {
        // Store the access token in localStorage
        if (response.accessToken) {
          localStorage.setItem("token", response.accessToken);
          console.log("✅ Access token stored in localStorage");
        }

        // Use full URL for production redirect
        const dashboardUrl = process.env.NEXT_PUBLIC_MAIN_URL
          ? process.env.NEXT_PUBLIC_MAIN_URL + "/dashboard"
          : "/dashboard";
        window.location.href = dashboardUrl;
      } else {
        setErr("Login failed. Please try again.");
      }
    } catch (e) {
      setErr(e.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-xl"
      >
        {/* brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Robo Books"
            width={96}
            height={32}
            className="h-6 w-auto rounded-[10px]"
            priority
          />
          <h1 className="text-xl font-semibold">Robo Books</h1>
        </div>

        <h2 className="text-lg font-medium">Sign in</h2>

        <input
          required
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          placeholder="Email or mobile"
          className="w-full rounded-xl border p-3"
          disabled={loading}
        />

        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border p-3 pr-10"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={loading}
          >
            {showPassword ? (
              <svg
                className="h-5 w-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign in
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <a
            className="font-semibold text-blue-700 hover:underline"
            href="/register"
          >
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
}
