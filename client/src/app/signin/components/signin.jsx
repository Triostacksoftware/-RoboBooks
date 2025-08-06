"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignIn() {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

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
        router.push("/dashboard");
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
    if (!window.google) {
      setErr("Google SDK not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    setErr("");

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const response = await api("/api/auth/login/google", {
            method: "POST",
            json: { idToken: credential },
          });

          if (response.success) {
            router.push("/dashboard");
          } else {
            setErr("Google login failed. Please try again.");
          }
        } catch (e) {
          setErr(e.message || "Google login failed. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.prompt();
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
              <EyeSlashIcon className="h-5 w-5 text-slate-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-slate-500" />
            )}
          </button>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-300" />
          <span className="text-xs text-slate-500">or</span>
          <span className="h-px flex-1 bg-slate-300" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Google "G" SVG inline */}
          <svg viewBox="0 0 48 48" className="h-5 w-5">
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
          <span className="font-medium text-slate-700">
            Continue with Google
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

      {/* Google Identity script */}
      <script src="https://accounts.google.com/gsi/client" async defer />
    </main>
  );
}
