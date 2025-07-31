"use client";

import { useMemo, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ALL_PHONE_OPTIONS,
  shortLabel,
  flagEmoji,
} from "../../../lib/phone-codes";

/* ---------- Small UI icons to keep parity with login ---------- */
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 12h12m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 12l2.2 2.2L15 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Brand SVG icons (inline, no deps) ---------- */
function GoogleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path fill="#EA4335" d="M24 9.5c3.3 0 6.2 1.1 8.5 3.2l6-6C34.9 3.1 29.8 1 24 1 14.8 1 6.9 6.3 3.2 14.1l7.7 6c1.8-5.8 7.2-10.6 13.1-10.6z"/>
      <path fill="#FBBC05" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.6 3-2.4 5.5-5.1 7.2l7.8 6c4.6-4.3 7.1-10.7 7.1-16.9z"/>
      <path fill="#34A853" d="M10.9 27.8a14.5 14.5 0 0 1-.8-4.8c0-1.6.3-3.3.8-4.8l-7.7-6A23 23 0 0 0 1 23c0 3.7.9 7.3 2.6 10.5l7.3-5.7z"/>
      <path fill="#4285F4" d="M24 47c6.5 0 12-2.1 16-5.9l-7.8-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.7-4.2-13.6-9.9l-7.7 6C6.4 42.1 14.5 47 24 47z"/>
    </svg>
  );
}
function MicrosoftMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 23 23" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" rx="1" />
      <rect x="13" y="1" width="9" height="9" fill="#7FBA00" rx="1" />
      <rect x="1" y="13" width="9" height="9" fill="#00A4EF" rx="1" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" rx="1" />
    </svg>
  );
}
function LinkedInMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4.9V24H.5zM9 8.5h4.7v2.1h.1c.7-1.2 2.5-2.5 5.1-2.5 5.5 0 6.5 3.6 6.5 8.3V24h-4.9v-7.4c0-1.8 0-4.2-2.6-4.2s-3 2-3 4V24H9z"/>
    </svg>
  );
}
function GitHubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.49-1.1-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.9.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05.8-.23 1.65-.35 2.5-.35s1.7.12 2.5.35c1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.02 1.63 1.02 2.75 0 3.95-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"
      />
    </svg>
  );
}

/* ---------- Reusable provider button (icons only) ---------- */
type ProviderBtnProps = {
  label: "Google" | "Microsoft" | "Apple" | "LinkedIn" | "GitHub";
  children: React.ReactNode;
  onClick?: () => void;
};

function ProviderButton({ label, children, onClick }: ProviderBtnProps) {
  return (
    <button
      type="button"
      aria-label={`Sign in with ${label}`}
      title={label}
      onClick={onClick}
      className={[
        "grid h-10 w-12 place-items-center rounded-2xl",
        "bg-white border border-slate-200/80 shadow-sm",
        "transition duration-200 ease-out will-change-transform",
        "hover:shadow-md hover:scale-[1.02] active:scale-95",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
      ].join(" ")}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/* ---------- Types ---------- */
type FormData = {
  companyName: string;
  email: string;
  phoneDialCode: string;
  phoneIso2: string;
  phoneNumber: string;
  password: string;
  country: string;
  state: string;
  agree: boolean;
};

const statesOfIndia = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh"
];

export default function Register() {
  const defaultIN = useMemo(
    () => ALL_PHONE_OPTIONS.find((o) => o.iso2 === "IN" && o.dial === "+91"),
    []
  );

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    companyName: "",
    email: "",
    phoneDialCode: defaultIN?.dial ?? "+91",
    phoneIso2: defaultIN?.iso2 ?? "IN",
    phoneNumber: "",
    password: "",
    country: "India",
    state: "Uttar Pradesh",
    agree: false,
  });

  const onChange =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value as never }));
    };

  const onPhoneCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [dial, iso2] = e.target.value.split("|");
    setForm((prev) => ({ ...prev, phoneDialCode: dial, phoneIso2: iso2 }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.companyName.trim()) return alert("Please enter your company name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return alert("Please enter a valid email.");
    if (!form.phoneNumber.trim()) return alert("Please enter your mobile number.");
    if (form.password.length < 6) return alert("Password must be at least 6 characters.");
    if (!form.agree) return alert("You must agree to the Terms of Service and Privacy Policy.");

    try {
      setLoading(true);
      // TODO: replace with your server action / API call
      console.log("Submitting form:", form);
      alert("Account created (demo). Wire this up to your API/server action.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (
    provider: "google" | "azure-ad" | "linkedin" | "apple" | "github"
  ) => {
    window.location.href = `/api/auth/signin/${provider}`;
  };

  return (
    <main
      className={[
        "relative mx-auto w-full",
        "max-w-[1100px] lg:max-w-6xl",
        "px-3 sm:px-4 py-6 sm:py-10",
        "min-h-[100svh]",
      ].join(" ")}
    >
      {/* Ambient blobs (match login) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(120px 120px at 40% 40%, rgba(34,197,94,0.33), transparent), radial-gradient(200px 200px at 70% 70%, rgba(37,99,235,0.33), transparent)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-25"
          style={{
            background:
              "radial-gradient(160px 160px at 60% 40%, rgba(16,185,129,0.33), transparent), radial-gradient(220px 220px at 30% 70%, rgba(59,130,246,0.33), transparent)",
          }}
        />
      </div>

      {/* Card container */}
      <section className="relative grid overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 md:grid-cols-2">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />

        {/* Left: promo / trust */}
        <aside className="relative overflow-hidden bg-gradient-to-b from-emerald-50/90 to-blue-50/90 p-6 sm:p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-2xl"
            style={{ background: "conic-gradient(from 120deg, #10b98155, #2563eb55, #10b98155)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-28 -bottom-28 size-80 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle at 60% 40%, #2563eb33, transparent 60%)" }}
          />

          <div className="mx-auto max-w-md">
            <div className="mx-auto w-full max-w-sm rounded-3xl bg-white/60 p-6 shadow-xl ring-1 ring-white/50 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-blue-600/10">
                  <ShieldCheckIcon className="size-6 text-blue-600" />
                </div>
                <div className="h-2 w-24 rounded-full bg-emerald-200" />
              </div>

              <div className="mt-6 h-32 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/70" />

              <div className="mt-6 flex items-center justify-between">
                <div className="h-2 w-32 rounded-full bg-blue-200" />
                <div className="grid size-10 place-items-center rounded-full bg-emerald-500/15">
                  <ShieldCheckIcon className="size-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-lg font-semibold">Built for compliance</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your data stays protected. Robo Books uses industry-standard encryption and adheres to local data regulations.
            </p>
          </div>
        </aside>

        {/* Right: the registration form */}
        <div className="p-6 sm:p-8 md:p-10">
          {/* Brand with logo image */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Robo Books logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
              priority
            />
            <span className="font-semibold tracking-tight">Robo Books</span>
          </div>

          <h1 className="mt-6 text-[28px] font-semibold leading-7 tracking-tight">Create your account</h1>
          <p className="text-slate-500">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Company */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Company name</span>
              <div className="relative">
                <input
                  id="companyName"
                  value={form.companyName}
                  onChange={onChange("companyName")}
                  placeholder="e.g., Robo Innovations Pvt Ltd"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
              </div>
            </label>

            {/* Email */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="you@company.com"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
              </div>
            </label>

            {/* Phone (always same row; two columns) */}
            <div className="grid grid-cols-[minmax(120px,160px),1fr] gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Country code</span>
                <select
                  aria-label="Country code"
                  value={`${form.phoneDialCode}|${form.phoneIso2}`}
                  onChange={onPhoneCountryChange}
                  className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                >
                  {/* Popular on top */}
                  <optgroup label="Popular">
                    {["IN|+91", "US|+1", "GB|+44", "AU|+61", "AE|+971"].map((k) => {
                      const [iso2, dial] = k.split("|");
                      return (
                        <option key={`popular-${k}`} value={`${dial}|${iso2}`}>
                          {shortLabel(iso2, dial)}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="All countries (A–Z)">
                    {ALL_PHONE_OPTIONS.map((o) => (
                      <option key={`${o.iso2}-${o.dial}`} value={`${o.dial}|${o.iso2}`} title={o.name}>
                        {shortLabel(o.iso2, o.dial)}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  {flagEmoji(form.phoneIso2)} {form.phoneIso2} • {form.phoneDialCode}
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Mobile number</span>
                <div className="relative">
                  <input
                    aria-label="Mobile number"
                    value={form.phoneNumber}
                    onChange={onChange("phoneNumber")}
                    placeholder="98765 43210"
                    className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
                </div>
              </label>
            </div>

            {/* Password */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={onChange("password")}
                  placeholder="At least 6 characters"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
              </div>
            </label>

            {/* Country & State */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Country</span>
                <select
                  id="country"
                  value={form.country}
                  onChange={onChange("country")}
                  className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                >
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>United Arab Emirates</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">State</span>
                <select
                  id="state"
                  value={form.state}
                  onChange={onChange("state")}
                  className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                >
                  {statesOfIndia.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={onChange("agree")}
                className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                I agree to the{" "}
                <Link href="/legal/terms" className="text-blue-700 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-blue-700 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={[
                "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden",
                "rounded-2xl px-4 py-3 font-semibold text-white shadow-lg",
                "bg-gradient-to-tr from-blue-600 to-emerald-500",
              ].join(" ")}
            >
              <span
                className="absolute inset-0 opacity-30"
                style={{ maskImage: "linear-gradient(90deg, transparent, black, transparent)" }}
              >
                <span className="absolute -left-6 top-0 h-full w-16 bg-white/70 blur-lg animate-[shine_2.2s_ease-in-out_infinite]" />
              </span>
              <span>{loading ? "Creating your account..." : "Create my account"}</span>
              <ArrowRightIcon className="size-4" />
            </button>

            <p className="mt-1 text-[12px] text-slate-500">*No credit card required</p>
          </form>

          {/* Social sign up — icons only (Apple uses PNG now) */}
          <div className="mt-5 sm:mt-6">
            <p className="text-sm text-slate-500">Sign in using</p>
            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Apple – your PNG */}
              <ProviderButton label="Apple" onClick={() => handleSocial("apple")}>
                <Image
                  src="/images/apple.png"
                  alt="Apple"
                  width={24}
                  height={24}
                  className="h-5 w-5 sm:h-6 sm:w-6 select-none object-contain"
                  priority
                />
              </ProviderButton>

              <ProviderButton label="Google" onClick={() => handleSocial("google")}>
                <GoogleMark className="h-5 w-5" />
              </ProviderButton>

              <ProviderButton label="LinkedIn" onClick={() => handleSocial("linkedin")}>
                <LinkedInMark className="h-5 w-5 text-[#0A66C2]" />
              </ProviderButton>

              <ProviderButton label="GitHub" onClick={() => handleSocial("github")}>
                <GitHubMark className="h-5 w-5 text-black" />
              </ProviderButton>

              <ProviderButton label="Microsoft" onClick={() => handleSocial("azure-ad")}>
                <MicrosoftMark className="h-5 w-5" />
              </ProviderButton>
            </div>
          </div>

          {/* Login link */}
          <p className="mt-6 text-sm text-slate-600">
            Already have a Robo Books account?{" "}
            <a className="font-semibold text-blue-700 hover:underline" href="/login">
              Log in
            </a>
          </p>
        </div>
      </section>

      {/* Keyframes for shiny buttons (same as login) */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </main>
  );
}
