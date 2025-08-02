// src/app/contact/components/start-free.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  className?: string;
  eyebrow?: string;
  title?: string;
  ctaHref?: string;
  ctaText?: string;
  secondaryHref?: string;
  secondaryText?: string;
};

export default function StartFree({
  className,
  eyebrow = "Launch faster • Grow smarter",
  title = "Start building a high-performing website",
  ctaHref = "/signup",
  ctaText = "Get Started for Free",
  secondaryHref = "/pricing",
  secondaryText = "See pricing",
}: Props) {
  const [hover, setHover] = useState({ x: 0, y: 0 });

  const dotsBg = useMemo(
    () =>
      "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
    []
  );

  return (
    <section
      className={[
        "relative isolate overflow-hidden text-white",
        // ✅ match Hero base color
        "bg-[#2B5FA4]",
        className ?? "",
      ].join(" ")}
    >
      {/* ✅ hero-matched backdrop (same as your Hero component) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* broad tints */}
        <div className="absolute inset-0 bg-[radial-gradient(1060px_600px_at_85%_38%,rgba(37,99,235,0.48),transparent_66%),radial-gradient(980px_600px_at_0%_100%,rgba(16,185,129,0.40),transparent_66%)]" />
        {/* left green glow */}
        <div className="absolute -left-24 bottom-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.66)_0%,rgba(16,185,129,0.42)_35%,transparent_72%)] blur-2xl" />
        {/* right blue glow */}
        <div className="absolute -right-20 -top-16 h-[560px] w-[560px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.66)_0%,rgba(59,130,246,0.42)_35%,transparent_72%)] blur-2xl" />
        {/* soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_560px_at_-10%_120%,rgba(255,255,255,0.22),transparent_58%)]" />
      </div>

      {/* center divider shimmer */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/15 to-transparent md:block" />

      {/* right dotted panel (optional; remove this block if you want it identical to Hero) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] md:block"
        style={{
          backgroundImage: dotsBg,
          backgroundSize: "14px 14px, 28px 28px",
          backgroundPosition: "0 0, 7px 7px",
          opacity: 0.28, // toned down to blend with hero bg
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 sm:py-16 md:grid-cols-2 md:gap-12 lg:py-20">
        {/* LEFT: copy + CTA */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {eyebrow}
          </div>

          <h2 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h2>

          <p className="mt-4 max-w-xl text-base text-white/75 md:text-lg">
            Craft, launch, and scale with speed. Clean code, blazing performance,
            and a delightful editing experience—no credit card needed.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={ctaHref}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-300 hover:shadow-emerald-500/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              <span className="relative z-10">{ctaText}</span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.35),transparent)] transition duration-500 group-hover:translate-x-full" />
              <ArrowRight className="relative z-10 h-5 w-5 -translate-x-0.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                {secondaryText}
                <Spark className="h-4 w-4 text-emerald-300" />
              </Link>
            )}
          </div>

          {/* trust row */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
            <Badge>Free forever plan</Badge>
            <Badge>No credit card</Badge>
            <Badge>SEO &amp; analytics ready</Badge>
          </div>
        </div>

        {/* RIGHT: Illustration card */}
        <div className="relative z-10 hidden md:block">
          <div
            className="group relative mx-auto aspect-[5/3] w-full max-w-[620px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
            onMouseMove={(e) => {
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              setHover({
                x: e.clientX - r.left - r.width / 2,
                y: e.clientY - r.top - r.height / 2,
              });
            }}
          >
            {/* soft inner gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_70%_40%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(70%_70%_at_20%_90%,rgba(16,185,129,0.25),transparent_60%)]" />

            {/* floating bubbles */}
            <Bubble
              className="absolute left-10 top-10"
              style={{ transform: `translate3d(${hover.x * 0.02}px, ${hover.y * 0.02}px, 0)` }}
            />
            <Target
              className="absolute right-16 top-14"
              style={{ transform: `translate3d(${hover.x * 0.03}px, ${hover.y * 0.03}px, 0)` }}
            />
            <Person
              className="absolute bottom-0 right-8 h-[72%] w-auto"
              style={{ transform: `translate3d(${hover.x * 0.01}px, ${hover.y * 0.01}px, 0)` }}
            />

            {/* shine border on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 ring-2 ring-transparent transition duration-700 group-hover:opacity-100 group-hover:[animation:spin_6s_linear_infinite] group-hover:[background:conic-gradient(from_0deg,rgba(16,185,129,0.35),rgba(59,130,246,0.35),rgba(16,185,129,0.35))] group-hover:[mask:linear-gradient(#000_0_0)content-box,linear-gradient(#000_0_0)] p-[2px] [mask-composite:exclude]" />
          </div>
        </div>
      </div>

      {/* mobile illustration */}
      <div className="mt-6 px-6 pb-10 md:hidden">
        <MobileIllustration />
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(1turn); }
        }
      `}</style>
    </section>
  );
}

/* -------- atoms / illustration components (unchanged) -------- */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span className="ml-2">{children}</span>
    </span>
  );
}
function ArrowRight(props: React.SVGProps<SVGSVGElement>) { /* ...same as before... */ return (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);}
function Spark(props: React.SVGProps<SVGSVGElement>) { /* ...same as before... */ return (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);}

function Bubble({ className, style }: { className?: string; style?: React.CSSProperties }) { /* …same… */ return (
  <div className={["grid place-items-center", className].join(" ")} style={style}>
    <div className="grid h-16 w-16 place-items-center rounded-full bg-cyan-400">
      <div className="h-10 w-10 rounded-full bg-white/90" />
    </div>
  </div>
);}
function Target({ className, style }: { className?: string; style?: React.CSSProperties }) { /* …same… */ return (
  <svg className={className} style={style} viewBox="0 0 80 80" fill="none" width="80" height="80" aria-hidden>
    <circle cx="40" cy="40" r="28" fill="#FF4D8D" />
    <circle cx="40" cy="40" r="18" fill="white" />
    <circle cx="40" cy="40" r="8" fill="#FF4D8D" />
    <circle cx="40" cy="40" r="3" fill="white" />
    <path d="M64 16l6-6" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);}
function Person({ className, style }: { className?: string; style?: React.CSSProperties }) { /* …same… */ return (
  <svg className={className} style={style} viewBox="0 0 260 260" fill="none" aria-hidden>
    <defs>
      <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDB2C1" />
        <stop offset="100%" stopColor="#FF7CA8" />
      </linearGradient>
    </defs>
    <rect x="30" y="120" width="200" height="120" rx="28" fill="url(#shirt)" />
    <rect x="85" y="60" width="90" height="90" rx="45" fill="#0EA5E9" opacity="0.2" />
    <circle cx="130" cy="96" r="36" fill="#FFD7E2" />
    <path d="M110 92c4 10 36 10 40 0" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
    <circle cx="118" cy="88" r="5" fill="#0F172A" />
    <circle cx="142" cy="88" r="5" fill="#0F172A" />
    <rect x="66" y="160" width="80" height="50" rx="10" fill="#F9FAFB" />
    <rect x="66" y="160" width="80" height="50" rx="10" stroke="#0EA5E9" strokeWidth="4" />
    <rect x="78" y="174" width="56" height="6" rx="3" fill="#0EA5E9" />
    <rect x="78" y="188" width="40" height="6" rx="3" fill="#A7F3D0" />
  </svg>
);}
function MobileIllustration() { /* …same… */ return (
  <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
    <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_70%_40%,rgba(59,130,246,0.28),transparent_60%),radial-gradient(70%_70%_at_20%_90%,rgba(16,185,129,0.28),transparent_60%)]" />
    <div className="absolute left-4 top-4"><Bubble /></div>
    <div className="absolute right-6 top-6"><Target /></div>
    <Person className="absolute bottom-0 right-2 h-[70%] w-auto" />
  </div>
);}
