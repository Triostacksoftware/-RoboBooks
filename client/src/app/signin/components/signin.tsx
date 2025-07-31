"use client";

import { useState } from "react";

/* ---------- Basic UI icons ---------- */
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12h12m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

/* ---------- Brand SVG icons (inline, no deps) ---------- */
/* Google “G” */
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
/* Microsoft 4-squares */
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
/* Apple */
function AppleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.45 2.22-1.27 3.02-.94.94-2.17 1.35-3.32 1.24-.08-1.1.46-2.29 1.3-3.12.91-.93 2.41-1.63 3.29-1.14.03.02.04.04.04.08zM21 17.3c-.45 1.03-.66 1.49-1.24 2.39-.8 1.2-1.93 2.7-3.36 2.72-1.26.03-1.59-.79-3.32-.79s-2.11.77-3.36.81c-1.44.06-2.55-1.31-3.36-2.51C3.65 18 2.2 14.62 3.64 11.8c.94-1.88 2.93-3.07 4.98-3.1 1.56-.03 2.84.86 3.32.86.47 0 2.3-1.06 3.89-.9.66.03 2.52.27 3.72 2.04-.1.06-2.21 1.3-2.15 3.85.06 2.99 2.59 4 2.6 4.55z"
      />
    </svg>
  );
}
/* LinkedIn */
function LinkedInMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4.9V24H.5zM9 8.5h4.7v2.1h.1c.7-1.2 2.5-2.5 5.1-2.5 5.5 0 6.5 3.6 6.5 8.3V24h-4.9v-7.4c0-1.8 0-4.2-2.6-4.2s-3 2-3 4V24H9z"/>
    </svg>
  );
}
/* GitHub */
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

/* ---------- Reusable provider button ---------- */
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
        "group h-12 w-12 grid place-items-center rounded-2xl",
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

export default function SignIn() {
  const [value, setValue] = useState("");

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-12">
      {/* Ambient blobs */}
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

      {/* Card */}
      <section className="relative grid overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 md:grid-cols-2">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />

        {/* Left */}
        <div className="p-8 md:p-12">
          {/* Logo / brand */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <span className="size-6 rounded-md bg-blue-600 shadow-sm" />
              <span className="size-6 rounded-md bg-emerald-500 shadow-sm" />
              <span className="size-6 rounded-md bg-blue-400 shadow-sm" />
            </div>
            <span className="font-semibold tracking-tight">Robo Books</span>
          </div>

          {/* Smart sign-in */}
          <div className="mt-6">
            <button
              type="button"
              className="relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white shadow ring-1 ring-white/10 bg-gradient-to-tr from-blue-600 to-emerald-500 hover:opacity-95"
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-full opacity-30"
                style={{ maskImage: "linear-gradient(90deg, transparent, black, transparent)" }}
              >
                <span className="absolute -left-1 top-0 h-full w-8 bg-white/60 blur-md animate-[shine_2.2s_ease-in-out_infinite]" />
              </span>
              <FingerprintIcon className="size-4" />
              Try smart sign-in
            </button>
          </div>

          <h1 className="mt-8 text-[28px] font-semibold leading-7 tracking-tight">Sign in</h1>
          <p className="text-slate-500">to access Robo Books</p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email address or mobile number</span>
              <div className="relative">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="you@example.com"
                  className="peer w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.6)]" />
              </div>
            </label>

            <button
              type="submit"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-3 font-semibold text-white shadow-lg bg-gradient-to-tr from-blue-600 to-emerald-500"
            >
              <span
                className="absolute inset-0 opacity-30"
                style={{ maskImage: "linear-gradient(90deg, transparent, black, transparent)" }}
              >
                <span className="absolute -left-6 top-0 h-full w-16 bg-white/70 blur-lg animate-[shine_2.2s_ease-in-out_infinite]" />
              </span>
              <span>Next</span>
              <ArrowRightIcon className="size-4 -translate-x-1 transition group-hover:translate-x-0" />
            </button>
          </form>

          {/* Social sign-ins (only the five providers) */}
          <div className="mt-6">
            <p className="text-sm text-slate-500">Sign in using</p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {/* Apple */}
              <ProviderButton label="Apple">
                <AppleMark className="h-5 w-5 text-black" />
              </ProviderButton>

              {/* Google */}
              <ProviderButton label="Google">
                <GoogleMark className="h-5 w-5" />
              </ProviderButton>

              {/* LinkedIn */}
              <ProviderButton label="LinkedIn">
                <LinkedInMark className="h-5 w-5 text-[#0A66C2]" />
              </ProviderButton>

              {/* GitHub */}
              <ProviderButton label="GitHub">
                <GitHubMark className="h-5 w-5 text-black" />
              </ProviderButton>

              {/* Microsoft */}
              <ProviderButton label="Microsoft">
                <MicrosoftMark className="h-5 w-5" />
              </ProviderButton>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Don&apos;t have a Robo Books account?{" "}
            <a className="font-semibold text-blue-700 hover:underline" href="/register">
              Register now
            </a>
          </p>
        </div>

        {/* Right: promo */}
        <aside className="relative overflow-hidden bg-gradient-to-b from-emerald-50/90 to-blue-50/90 p-8 md:p-12">
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
                  <FingerprintIcon className="size-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-lg font-semibold">Passwordless sign-in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Move away from risky passwords and experience one-tap access. Install our authenticator to enable One-tap sign-in.
            </p>

            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 hover:border-emerald-300 hover:shadow-sm"
            >
              Learn more
            </button>
          </div>
        </aside>
      </section>

      {/* Keyframes for shiny buttons */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </main>
  );
}
