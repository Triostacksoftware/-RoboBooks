"use client";

import { useMemo, useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import {
  ALL_PHONE_OPTIONS,
  shortLabel,
  flagEmoji,
} from "../../../lib/phone-codes";

// Google OAuth types (for reference)

/* ----------------- Small UI icons ----------------- */
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
function QuoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18 8C10 8 6 14 6 20c0 5.5 3.7 9.3 8.5 10.1V40H26V20C26 12 22 8 18 8zm24 0c-8 0-12 6-12 12 0 5.5 3.7 9.3 8.5 10.1V40H50V20c0-8-4-12-8-12z" />
    </svg>
  );
}

/* ----------------- Stars with half support ----------------- */
function StarBase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 1.6l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.9 5 17l.9-5.6-4-3.9 5.6-.8L10 1.6z" />
    </svg>
  );
}
function Star({ fill, idBase }: { fill: 0 | 0.5 | 1; idBase: string }) {
  const halfId = `${idBase}-half`;
  return (
    <span className="inline-block relative">
      <StarBase className="h-3.5 w-3.5 text-slate-300 fill-current" />
      {fill > 0 && (
        <svg
          viewBox="0 0 20 20"
          className="absolute inset-0 h-3.5 w-3.5 text-amber-400"
        >
          <defs>
            <clipPath id={halfId}>
              <rect x="0" y="0" width={fill === 0.5 ? 10 : 20} height="20" />
            </clipPath>
          </defs>
          <path
            d="M10 1.6l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.9 5 17l.9-5.6-4-3.9 5.6-.8L10 1.6z"
            clipPath={`url(#${halfId})`}
            className="fill-current"
          />
        </svg>
      )}
    </span>
  );
}
function StarRow({ rating, id }: { rating: number; id: string }) {
  const full = Math.floor(rating);
  const frac = rating - full;
  const half = frac >= 0.25 && frac < 0.75 ? 1 : 0;
  const addFull = frac >= 0.75 ? 1 : 0;
  const fullTotal = Math.min(5, full + addFull);
  const empty = 5 - fullTotal - (half ? 1 : 0);

  const stars: React.ReactElement[] = [];
  for (let i = 0; i < fullTotal; i++)
    stars.push(<Star key={`f-${i}`} fill={1} idBase={`${id}-f-${i}`} />);
  if (half) stars.push(<Star key="h" fill={0.5} idBase={`${id}-h`} />);
  for (let i = 0; i < empty; i++)
    stars.push(<Star key={`e-${i}`} fill={0} idBase={`${id}-e-${i}`} />);
  return <div className="mt-[6px] flex items-center gap-1">{stars}</div>;
}

/* ----------------- Provider icons (inline SVGs) ----------------- */
function GoogleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
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
  );
}

/* ----------------- Types ----------------- */
type FormData = {
  companyName: string;
  email: string;
  phoneDialCode: string;
  phoneIso2: string;
  phoneNumber: string;
  password: string;
  passwordVisible: boolean;
  country: string;
  state: string;
  agree: boolean;
};
type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
};

/* ----------------- Rating card (uses PNG logos) ----------------- */
function RatingCard({
  logoSrc,
  label,
  score,
  id,
  labelTint,
}: {
  logoSrc: string;
  label: string;
  score: number;
  id: string;
  labelTint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200/80 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-slate-50">
            <Image
              src={logoSrc}
              alt={label}
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
              priority
            />
          </span>
          <span
            className="text-[14px] font-semibold"
            style={labelTint ? { color: labelTint } : undefined}
          >
            {label}
          </span>
        </div>
        <span className="text-[13px] text-slate-600 tabular-nums">
          {score.toFixed(1)}/5
        </span>
      </div>
      <StarRow rating={score} id={id} />
    </div>
  );
}

function RatingsRow() {
  return (
    <div
      className="
        mt-4
        grid
        grid-cols-[repeat(auto-fit,minmax(160px,1fr))]  /* auto-fit within container */
        gap-3 sm:gap-4
      "
    >
      <RatingCard
        id="capterra"
        label="Capterra"
        score={4.4}
        labelTint="#1F6FB2"
        logoSrc="/images/capterra.png"
      />
      <RatingCard id="g2" label="G2" score={4.4} logoSrc="/images/g2.png" />
      <RatingCard
        id="play"
        label="Play"
        score={4.7}
        logoSrc="/images/playstore.png"
      />
      <RatingCard
        id="appstore"
        label="App Store"
        score={4.8}
        logoSrc="/images/appstore.png"
      />
    </div>
  );
}

/* ----------------- Page ----------------- */
export default function Register() {
  const router = useRouter();
  const defaultIN = useMemo(
    () => ALL_PHONE_OPTIONS.find((o) => o.iso2 === "IN" && o.dial === "+91"),
    []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleGoogleCallback = async (code: string) => {
      setLoading(true);
      setError("");

      try {
        // Send the authorization code to your backend
        const response = await api<{
          success: boolean;
          user?: { id: string; email: string; companyName: string };
        }>("/api/auth/google/callback", {
          method: "POST",
          json: {
            code,
            redirectUri: `${window.location.origin}/register`,
            type: "register",
          },
        });

        if (response.success) {
          console.log("✅ Google registration successful");
          // Clear URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          router.push("/dashboard");
        } else {
          setError("Google registration failed. Please try again.");
          // Clear URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } catch (err: unknown) {
        console.error("❌ Google OAuth callback error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Google registration failed. Please try again.";
        setError(errorMessage);
        // Clear URL parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } finally {
        setLoading(false);
      }
    };
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state === "register") {
      console.log("🔄 Processing Google OAuth callback...");
      handleGoogleCallback(code);
    }
  }, [router]);

  const [form, setForm] = useState<FormData>({
    companyName: "",
    email: "",
    phoneDialCode: defaultIN?.dial ?? "+91",
    phoneIso2: defaultIN?.iso2 ?? "IN",
    phoneNumber: "",
    password: "",
    passwordVisible: false,
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
    setError("");

    // Client-side validation
    if (!form.companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError("Please enter your mobile number.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!form.agree) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await api<{
        success: boolean;
        user?: { id: string; email: string; companyName: string };
      }>("/api/auth/register", {
        method: "POST",
        json: {
          companyName: form.companyName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          phoneDialCode: form.phoneDialCode,
          phoneIso2: form.phoneIso2,
          password: form.password,
          country: form.country,
          state: form.state,
        },
      });

      if (response.success) {
        // Registration submitted successfully, show approval message
        setError(""); // Clear any existing errors
        alert("Registration submitted successfully! Your account will be activated after admin approval. You will be able to login once approved.");
        router.push("/signin");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* Google OAuth using Google Identity Services */
  const handleGoogleAuth = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured.");
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
    const redirectUri = "http://localhost:3000/register";
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
    googleAuthUrl.searchParams.set("state", "register");

    const finalUrl = googleAuthUrl.toString();
    console.log("🎯 Final Google OAuth URL:", finalUrl);

    window.location.href = finalUrl;
  };

  const testimonials: Testimonial[] = [
    {
      quote:
        "With Robo Books’ finance suite, we saved time and money while retaining customer satisfaction—posting over 20% YoY revenue growth.",
      author: "CA Sanjeev Archak",
      role: "Integrabooks · Proprietor",
      avatar: "/images/testimonial1.jpg",
    },
    {
      quote:
        "Automations and GST-ready invoicing cut monthly close by days. The team loves how fast it is.",
      author: "Shruti Mehta",
      role: "CFO · Diginest",
      avatar: "/images/testimonial2.jpg",
    },
    {
      quote:
        "From billing to reconciliation, it just flows. Support is fantastic and onboarding was seamless.",
      author: "Ankit Yadav",
      role: "Founder · Pixeldesk",
      avatar: "/images/testimonial3.jpg",
    },
  ];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [paused, testimonials.length]);

  return (
    <main
      className={[
        "relative mx-auto w-full",
        "max-w-[1100px] lg:max-w-6xl",
        "px-3 sm:px-4 py-6 sm:py-10",
        "min-h-[100svh]",
      ].join(" ")}
    >
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-25"
          style={{
            background:
              "radial-gradient(120px 120px at 40% 40%, rgba(34,197,94,0.33), transparent), radial-gradient(200px 200px at 70% 70%, rgba(37,99,235,0.33), transparent)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(160px 160px at 60% 40%, rgba(16,185,129,0.33), transparent), radial-gradient(220px 220px at 30% 70%, rgba(59,130,246,0.33), transparent)",
          }}
        />
      </div>

      {/* Card container */}
      <section className="relative grid overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 md:grid-cols-2">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500"
        />

        {/* LEFT: Trusted + testimonial + ratings (PNG logos) */}
        <aside className="relative overflow-hidden p-6 sm:p-8 md:p-10 bg-gradient-to-b from-blue-600 via-blue-600 to-emerald-600 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(800px 400px at 120% -10%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(600px 300px at -10% 110%, rgba(255,255,255,0.06), transparent 60%)",
            }}
          />

          <div className="relative mx-auto w-full max-w-[640px] lg:max-w-[700px]">
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
              Trusted by
              <br className="hidden sm:block" /> businesses and CAs
            </h2>

            {/* Testimonial card */}
            <div
              className="mt-6 sm:mt-8 rounded-3xl bg-blue-900/50 backdrop-blur-md ring-1 ring-white/15 p-5 sm:p-7"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <QuoteIcon className="h-8 w-8 text-blue-300/70" />

              <div className="relative mt-3 sm:mt-4 min-h-[120px]">
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    className={[
                      "absolute inset-0 transition-opacity duration-500",
                      i === index ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                    aria-hidden={i !== index}
                  >
                    <p className="text-[15px] sm:text-base leading-7 text-white/95">
                      {t.quote.includes("20% YoY") ? (
                        <>
                          {t.quote.split("20% YoY")[0]}
                          <span className="font-semibold text-emerald-200">
                            20% YoY
                          </span>
                          {t.quote.split("20% YoY")[1]}
                        </>
                      ) : (
                        t.quote
                      )}
                    </p>

                    <div className="mt-5 flex items-center gap-4">
                      <Image
                        src={t.avatar ?? "/images/testimonial1.jpg"}
                        alt={t.author}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full ring-2 ring-emerald-400/60 object-cover"
                      />
                      <div className="leading-tight">
                        <p className="font-semibold">{t.author}</p>
                        <p className="text-white/80 text-[13px]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pager */}
              <div className="mt-6 flex items-center justify-end gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={[
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-6 bg-white" : "w-1.5 bg-white/60",
                    ].join(" ")}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Ratings row with PNGs */}
            <div className="mt-7 sm:mt-9">
              <div className="relative mx-auto max-w-[520px]">
                <p className="text-center text-[12px] tracking-widest text-white/90">
                  RATED BY THE BEST
                </p>
                <div className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-white/20" />
              </div>

              <RatingsRow />
            </div>
          </div>
        </aside>

        {/* RIGHT: Registration form */}
        <div className="p-6 sm:p-8 md:p-10">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Robo Books logo"
              width={30} // reduced from 38
              height={30} // reduced from 38
              className="h-7 w-auto object-contain" // h-7 matches 28–30px size
              priority
            />
            <span className="font-semibold tracking-tight text-lg">
              Robo Books
            </span>
          </div>

          <h1 className="mt-6 text-[28px] font-semibold leading-7 tracking-tight">
            Create your account
          </h1>
          <p className="text-slate-500">
            Start your 14-day free trial. No credit card required.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Company */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Company name
              </span>
              <div className="relative">
                <input
                  id="companyName"
                  value={form.companyName}
                  onChange={onChange("companyName")}
                  placeholder="e.g., Robo Innovations Pvt Ltd"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  disabled={loading}
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
              </div>
            </label>

            {/* Email */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </span>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="you@company.com"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  disabled={loading}
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
              </div>
            </label>

            {/* Phone (country code + number in one group) */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Mobile number
              </span>
              <div className="rounded-2xl border border-slate-300/80 bg-white/70 transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/20">
                <div className="flex items-stretch">
                  <div className="relative">
                    <span className="sr-only">Country code</span>
                    <select
                      aria-label="Country code"
                      value={`${form.phoneDialCode}|${form.phoneIso2}`}
                      onChange={onPhoneCountryChange}
                      className={[
                        "min-w-[110px] sm:min-w-[150px]",
                        "h-full rounded-l-2xl bg-transparent",
                        "px-3 py-3 pr-8",
                        "text-slate-900 outline-none",
                        "border-0 focus:ring-0 appearance-none cursor-pointer",
                      ].join(" ")}
                      disabled={loading}
                    >
                      <optgroup label="Popular">
                        {["IN|+91", "US|+1", "GB|+44", "AU|+61", "AE|+971"].map(
                          (k) => {
                            const [iso2, dial] = k.split("|");
                            return (
                              <option
                                key={`popular-${k}`}
                                value={`${dial}|${iso2}`}
                              >
                                {shortLabel(iso2, dial)}
                              </option>
                            );
                          }
                        )}
                      </optgroup>
                      <optgroup label="All countries (A–Z)">
                        {ALL_PHONE_OPTIONS.map((o) => (
                          <option
                            key={`${o.iso2}-${o.dial}`}
                            value={`${o.dial}|${o.iso2}`}
                            title={o.name}
                          >
                            {shortLabel(o.iso2, o.dial)}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-6 w-px bg-slate-200/80"
                    />
                  </div>

                  <input
                    aria-label="Mobile number"
                    value={form.phoneNumber}
                    onChange={onChange("phoneNumber")}
                    placeholder="98765 43210"
                    className="flex-1 rounded-r-2xl bg-transparent px-4 py-3 text-slate-900 outline-none border-0 focus:ring-0"
                    disabled={loading}
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {flagEmoji(form.phoneIso2)} {form.phoneIso2} •{" "}
                {form.phoneDialCode}
              </p>
            </label>

            {/* Password */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </span>
              <div className="relative">
                <input
                  id="password"
                  type={form.passwordVisible ? "text" : "password"}
                  value={form.password}
                  onChange={onChange("password")}
                  placeholder="At least 6 characters"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  disabled={loading}
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      passwordVisible: !prev.passwordVisible,
                    }))
                  }
                >
                  {form.passwordVisible ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              </div>
            </label>

            {/* Country & State */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Country
                </span>
                <select
                  id="country"
                  value={form.country}
                  onChange={onChange("country")}
                  className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  disabled={loading}
                >
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>United Arab Emirates</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  State
                </span>
                <select
                  id="state"
                  value={form.state}
                  onChange={onChange("state")}
                  className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  disabled={loading}
                >
                  {[
                    "Andhra Pradesh",
                    "Arunachal Pradesh",
                    "Assam",
                    "Bihar",
                    "Chhattisgarh",
                    "Goa",
                    "Gujarat",
                    "Haryana",
                    "Himachal Pradesh",
                    "Jharkhand",
                    "Karnataka",
                    "Kerala",
                    "Madhya Pradesh",
                    "Maharashtra",
                    "Manipur",
                    "Meghalaya",
                    "Mizoram",
                    "Nagaland",
                    "Odisha",
                    "Punjab",
                    "Rajasthan",
                    "Sikkim",
                    "Tamil Nadu",
                    "Telangana",
                    "Tripura",
                    "Uttar Pradesh",
                    "Uttarakhand",
                    "West Bengal",
                    "Delhi",
                    "Jammu and Kashmir",
                    "Ladakh",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Consent */}
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={onChange("agree")}
                className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/legal/terms"
                  className="text-blue-700 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/privacy"
                  className="text-blue-700 hover:underline"
                >
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
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              <span
                className="absolute inset-0 opacity-30"
                style={{
                  maskImage:
                    "linear-gradient(90deg, transparent, black, transparent)",
                }}
              >
                <span className="absolute -left-6 top-0 h-full w-16 bg-white/70 blur-lg animate-[shine_2.2s_ease-in-out_infinite]" />
              </span>
              <span>
                {loading ? "Creating your account..." : "Create my account"}
              </span>
              <ArrowRightIcon className="size-4" />
            </button>

            <p className="mt-1 text-[12px] text-slate-500">
              *No credit card required
            </p>
          </form>

          {/* Social sign up — Google only */}
          <div className="mt-5 sm:mt-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px flex-1 bg-slate-300" />
              <span className="text-xs text-slate-500">or</span>
              <span className="h-px flex-1 bg-slate-300" />
            </div>
            {/* <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className={[
                  "flex w-full items-center justify-center gap-3 overflow-hidden",
                  "rounded-2xl px-4 py-4 font-semibold text-slate-700 shadow-lg border-2 border-slate-200",
                  "bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-xl",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                ].join(" ")}
              >
                <GoogleMark className="h-6 w-6 flex-shrink-0" />
                <span className="text-base">
                  {loading ? "Signing up with Google..." : "Continue with Google"}
                </span>
              </button> */}
          </div>

          {/* Login link */}
          <p className="mt-6 text-sm text-slate-600">
            Already have a Robo Books account?{" "}
            <a
              className="font-semibold text-blue-700 hover:underline"
              href="/signin"
            >
              Sign in
            </a>
          </p>
        </div>
      </section>

      {/* Google OAuth script removed - using simple redirect flow */}

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(120%);
          }
        }
      `}</style>
    </main>
  );
}
