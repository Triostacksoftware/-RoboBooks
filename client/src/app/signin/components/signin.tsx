"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/* -------------------- Small UI icons -------------------- */
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
function FingerprintIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3a7 7 0 0 0-7 7v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7a3 3 0 0 0-3 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 21c2 0 4-2 4-6v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 14c0 4 2 7 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 11v1c0 1.5-.3 3.5-1 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12l2.2 2.2L15 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}
function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 12h7m-3 0v3m0-3v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------- Brand SVGs (inline) -------------------- */
/** Google “G” */
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
/** Microsoft */
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
/** LinkedIn – square so it never crops */
function LinkedInMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#0A66C2" />
      <circle cx="7.25" cy="7.25" r="1.55" fill="#fff" />
      <rect x="6.4" y="9.6" width="1.7" height="7.8" fill="#fff" />
      <path
        d="M11 9.6h1.7v1.15h.03c.35-.67 1.22-1.32 2.5-1.32 2.34 0 3.27 1.46 3.27 3.9v3.67h-1.82v-3.35c0-1.1-.02-2.52-1.67-2.52-1.67 0-1.92 1.15-1.92 2.44v3.43H11V9.6Z"
        fill="#fff"
      />
    </svg>
  );
}
/** GitHub */
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

/* -------------------- Social provider button -------------------- */
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
        "group grid place-items-center rounded-2xl",
        "h-11 w-11 sm:h-12 sm:w-12",
        "bg-white border border-slate-200/80 shadow-sm",
        "transition duration-200 ease-out will-change-transform",
        "hover:shadow-md hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
      ].join(" ")}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/* -------------------- Page -------------------- */
export default function SignIn() {
  const [value, setValue] = useState("");

  // OAuth navigation (adjust to your auth setup)
  const goOAuth = (provider: "google" | "azure-ad" | "apple" | "linkedin" | "github") => {
    window.location.href = `/api/auth/signin/${provider}`;
  };

  // Security slider content
  const slides = [
    { title: "Passwordless sign-in", body: "Move away from risky passwords and experience one-tap access with our authenticator.", icon: <FingerprintIcon className="size-6 text-emerald-600" /> },
    { title: "MFA for all accounts", body: "Protect every login with time-based OTP and hardware keys. Back up secrets safely.", icon: <ShieldCheckIcon className="size-6 text-blue-600" /> },
    { title: "Encryption & recovery", body: "Your data is encrypted at rest and in transit with secure recovery options.", icon: <LockIcon className="size-6 text-sky-600" /> },
  ] as const;

  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((n) => (n + 1) % slides.length), 4200);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <main className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-24 h-56 w-56 sm:h-72 sm:w-72 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(120px 120px at 40% 40%, rgba(34,197,94,0.33), transparent), radial-gradient(200px 200px at 70% 70%, rgba(37,99,235,0.33), transparent)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 h-64 w-64 sm:h-80 sm:w-80 rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(160px 160px at 60% 40%, rgba(16,185,129,0.33), transparent), radial-gradient(220px 220px at 30% 70%, rgba(59,130,246,0.33), transparent)" }}
        />
      </div>

      {/* Card */}
      <section
        className={[
          "relative grid overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl ring-1 ring-black/5",
          "grid-cols-1 md:grid-cols-2",
        ].join(" ")}
      >
        {/* top brand bar */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 to-emerald-500" />

        {/* --- Security slider FIRST on phones (order-1), right on md+ --- */}
        <aside
          className={[
            "order-1 md:order-none",
            "relative overflow-hidden bg-gradient-to-b from-emerald-50/90 to-blue-50/90",
            "p-5 sm:p-8 lg:p-12",
            "border-b border-slate-100 md:border-b-0 md:border-l",
          ].join(" ")}
          // To HIDE on phones instead, replace previous class list with: "hidden sm:block md:order-none relative ..."
        >
          {/* soft glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-56 sm:size-72 rounded-full blur-2xl"
            style={{ background: "conic-gradient(from 120deg, #10b98155, #2563eb55, #10b98155)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-28 -bottom-28 size-64 sm:size-80 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle at 60% 40%, #2563eb33, transparent 60%)" }}
          />

          <div className="mx-auto w-full max-w-md">
            {/* Sliding card */}
            <div className="relative w-full overflow-hidden rounded-3xl bg-white/70 ring-1 ring-white/60 backdrop-blur-xl shadow-xl">
              <div className="flex w-[300%] transition-transform duration-500 ease-out" style={{ transform: `translateX(-${active * 100}%)` }}>
                {[
                  { icon: <FingerprintIcon className="size-6 text-emerald-600" />, bar: "bg-emerald-200" },
                  { icon: <ShieldCheckIcon className="size-6 text-blue-600" />, bar: "bg-blue-200" },
                  { icon: <LockIcon className="size-6 text-sky-600" />, bar: "bg-sky-200" },
                ].map((v, i) => (
                  <div key={i} className="w-full flex-shrink-0 p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="grid size-10 sm:size-12 place-items-center rounded-2xl bg-blue-600/10">
                        {v.icon}
                      </div>
                      <div className={`h-2 w-20 sm:w-24 rounded-full ${v.bar}`} />
                    </div>

                    <div className="mt-5 sm:mt-6 h-28 sm:h-32 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/70" />

                    <div className="mt-5 sm:mt-6 flex items-center justify-between">
                      <div className="h-2 w-28 sm:w-32 rounded-full bg-blue-200" />
                      <div className="grid size-9 sm:size-10 place-items-center rounded-full bg-emerald-500/15">
                        <KeyIcon className="size-4 sm:size-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* dots */}
              <div className="flex items-center justify-center gap-2 pb-3 pt-2">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={[
                      "h-1.5 rounded-full transition-all",
                      active === i ? "w-7 sm:w-8 bg-blue-500" : "w-3 bg-slate-300",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            <h2 className="mt-6 sm:mt-8 text-base sm:text-lg font-semibold">
              {["Passwordless sign-in", "MFA for all accounts", "Encryption & recovery"][active]}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {
                [
                  "Move away from risky passwords and experience one-tap access with our authenticator.",
                  "Protect every login with time-based OTP and hardware keys. Back up secrets safely.",
                  "Your data is encrypted at rest and in transit with secure recovery options.",
                ][active]
              }
            </p>

            <button
              type="button"
              className="mt-5 sm:mt-6 inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 hover:border-emerald-300 hover:shadow-sm"
            >
              Learn more
            </button>
          </div>
        </aside>

        {/* --- Form SECOND on phones (order-2), left on md+ --- */}
        <div className="order-2 md:order-none p-5 sm:p-8 lg:p-12">
          {/* Brand with logo.png */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Robo Books logo"
              width={96}
              height={32}
              className="h-6 w-auto rounded-[10px]"
              priority
            />
            <span className="font-semibold tracking-tight text-base sm:text-lg">Robo Books</span>
          </div>

          {/* Smart sign-in */}
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow ring-1 ring-white/10 bg-gradient-to-tr from-blue-600 to-emerald-500 hover:opacity-95"
            >
              <span className="pointer-events-none absolute inset-0 rounded-full opacity-30" style={{ maskImage: "linear-gradient(90deg, transparent, black, transparent)" }}>
                <span className="absolute -left-1 top-0 h-full w-8 bg-white/60 blur-md animate-[shine_2.2s_ease-in-out_infinite]" />
              </span>
              <FingerprintIcon className="size-4" />
              Try smart sign-in
            </button>
          </div>

          <h1 className="mt-6 sm:mt-8 text-2xl sm:text-[28px] font-semibold leading-7 tracking-tight">
            Sign in
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">to access Robo Books</p>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email address or mobile number
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="you@example.com"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                />
              </div>
            </label>

            <button
              type="submit"
              className={[
                "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl",
                "px-3.5 py-2.5 sm:px-4 sm:py-3",
                "font-semibold text-white shadow-lg bg-gradient-to-tr from-blue-600 to-emerald-500",
              ].join(" ")}
            >
              <span className="absolute inset-0 opacity-30" style={{ maskImage: "linear-gradient(90deg, transparent, black, transparent)" }}>
                <span className="absolute -left-6 top-0 h-full w-16 bg-white/70 blur-lg animate-[shine_2.2s_ease-in-out_infinite]" />
              </span>
              <span>Next</span>
              <ArrowRightIcon className="size-4 -translate-x-1 transition group-hover:translate-x-0" />
            </button>
          </form>

          {/* Social sign-ins */}
          <div className="mt-5 sm:mt-6">
            <p className="text-sm text-slate-500">Sign in using</p>
            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Apple – your PNG */}
              <ProviderButton label="Apple" onClick={() => goOAuth("apple")}>
                <Image
                  src="/images/apple.png"
                  alt="Apple"
                  width={24}
                  height={24}
                  className="h-5 w-5 sm:h-6 sm:w-6 select-none object-contain"
                  priority
                />
              </ProviderButton>

              {/* Google */}
              <ProviderButton label="Google" onClick={() => goOAuth("google")}>
                <GoogleMark className="h-5 w-5 sm:h-6 sm:w-6" />
              </ProviderButton>

              {/* LinkedIn */}
              <ProviderButton label="LinkedIn" onClick={() => goOAuth("linkedin")}>
                <LinkedInMark className="h-5 w-5 sm:h-6 sm:w-6" />
              </ProviderButton>

              {/* GitHub */}
              <ProviderButton label="GitHub" onClick={() => goOAuth("github")}>
                <GitHubMark className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </ProviderButton>

              {/* Microsoft */}
              <ProviderButton label="Microsoft" onClick={() => goOAuth("azure-ad")}>
                <MicrosoftMark className="h-5 w-5 sm:h-6 sm:w-6" />
              </ProviderButton>
            </div>
          </div>

          <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-slate-600">
            Don&apos;t have a Robo Books account?{" "}
            <Link className="font-semibold text-blue-700 hover:underline" href="/register">
              Register now
            </Link>
          </p>
        </div>
      </section>

      {/* Shine keyframes */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </main>
  );
}
