"use client";

import { useState, useEffect } from "react";
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

  /* ------------- Google OAuth login ----------- */
  const handleGoogle = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setErr("Google Client ID not configured.");
      return;
    }

    // Debug logging
    console.log("🔍 Debug info:");
    console.log("window.location.origin:", window.location.origin);
    console.log("window.location.href:", window.location.href);
    console.log(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID:",
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    );

    // Hardcode the redirect URI to fix truncation issue
    const redirectUri = process.env.NEXT_PUBLIC_MAIN_URL + "/signin";
    console.log("🎯 Using hardcoded redirect URI:", redirectUri);

    // Use the correct Google OAuth v2 endpoint
    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    googleAuthUrl.searchParams.set(
      "client_id",
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    );
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", "signin");

    const finalUrl = googleAuthUrl.toString();
    console.log("🎯 Final Google OAuth URL:", finalUrl);

    window.location.href = finalUrl;
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

        {/* Test button for debugging */}
        {/* <button
          type="button"
          onClick={() => {
            console.log("🧪 Test button clicked, pushing to /dashboard");
            router.push("/dashboard");
          }}
          className="w-full rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Test Dashboard Redirect
        </button> */}

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-300" />
          <span className="text-xs text-slate-500">or</span>
          <span className="h-px flex-1 bg-slate-300" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {/* Google "G" SVG inline */}
          <svg viewBox="0 0 48 48" className="h-6 w-6">
            <path
              fill="#EA4335"
              d="M24 9.5c3.3 0 6.2 1.1 8.5 3.2l6-6C34.9 3.1 29.8 1 24 1 14.8 1 6.9 6.3 3.2 14.1l7.7 6c1.8-5.8 7.2-10.6 13.1-10.6z"
            />
            <path
              fill="#FBBC05"
              d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.6 3-2.4 5.5-5.1 7.2l7.8 6c4.6-4.3 7.1-10.7 7.1-16.9z"
            />
            <path
              fill="#34A853"
              d="M10.9 27.8a14.5 14.5 0 0 1-.8-4.8c0-1.6.3-3.3.8-4.8l-7.7-6A23 23 0 0 0 1 23c0 3.7.9 7.3 2.6 10.5l7.3-5.7z"
            />
            <path
              fill="#4285F4"
              d="M24 47c6.5 0 12-2.1 16-5.9l-7.8-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.7-4.2-13.6-9.9l-7.7 6C6.4 42.1 14.5 47 24 47z"
            />
          </svg>
          <span className="font-semibold text-slate-700">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
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
