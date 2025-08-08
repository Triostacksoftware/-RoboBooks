/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@robobooks.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const response = await api<{ success: boolean }>("/api/admin/login", {
        method: "POST",
        json: { email, password },
      });

      // Fix: response is of type 'unknown', so we need to safely check its shape
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        (response as any).success
      ) {
        router.push("/admin/dashboard");
      } else {
        setErr("Login failed. Please try again.");
      }
    } catch (e) {
      if (e && typeof e === "object" && "message" in e) {
        setErr(
          (e as { message?: string }).message ||
            "Login failed. Please try again."
        );
      } else {
        setErr("Login failed. Please try again.");
      }
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
          <div className="p-2 bg-purple-100 rounded-xl">
            <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Robo Books</h1>
            <p className="text-sm text-slate-500">Admin Panel</p>
          </div>
        </div>

        <h2 className="text-lg font-medium text-slate-900">Admin Sign in</h2>

        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@robobooks.com"
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
          className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in to Admin Panel"}
        </button>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-slate-700 font-medium text-sm mb-2">
            Demo Credentials:
          </h3>
          <div className="space-y-1 text-xs text-slate-600">
            <p>Email: admin@robobooks.com</p>
            <p>Password: admin123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600">
          Secure access to RoboBooks administration
        </p>
      </form>
    </main>
  );
}
