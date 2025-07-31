// src/app/contact/components/hero.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent } from "react";

type Props = {
  className?: string;
};

export default function Hero({ className }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Smooth-scroll helper (with route fallback)
  const goToSection = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // If the section isn't on this DOM (SSR split / different page),
      // push to the same path with the hash so browser scrolls there.
      router.push(`${pathname}#${id}`);
    }
  };

  return (
    <header
      className={[
        "relative isolate overflow-hidden text-white",
        "bg-[#0B0F1A]",
        className ?? "",
      ].join(" ")}
    >
      {/* --- Ambient accents (blue/green radial fields) --- */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Left-lower green glow */}
        <div className="absolute -left-24 bottom-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.35)_0%,rgba(16,185,129,0.18)_35%,transparent_70%)] blur-2xl" />
        {/* Right-upper blue glow */}
        <div className="absolute -right-20 -top-16 h-[560px] w-[560px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.35)_0%,rgba(59,130,246,0.18)_35%,transparent_70%)] blur-2xl" />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_-10%_120%,rgba(255,255,255,0.10),transparent_55%)]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:28px_28px]" />
        {/* Slanted ribbon */}
        <div className="absolute -left-40 top-24 h-64 w-[480px] rotate-[-18deg] bg-gradient-to-r from-emerald-500/20 to-blue-500/20 [clip-path:polygon(0_0,100%_0,86%_100%,0_80%)]" />
      </div>

      <div className="container mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="relative z-10">
          {/* Brand chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Robo Books
          </div>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mt-3 text-sm text-white/70">
            <ol className="flex items-center gap-3">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none text-white/40">
                •
              </li>
              <li className="text-white">Contact</li>
            </ol>
          </nav>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Contact Us
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            Questions, partnerships, or support—our team responds fast. Let’s
            build something brilliant with{" "}
            <span className="text-emerald-300">Robo</span>
            <span className="text-blue-300">Books</span>.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Smooth-scroll to contact form (keep existing anchor) */}
            <Link
              href="#contact-form"
              onClick={goToSection("contact-form")}
              className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-blue-500/25"
            >
              Get in touch
              <svg
                className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* NEW: Smooth-scroll to contact details */}
            <Link
              href="#contact-details"
              onClick={goToSection("contact-details")}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
              aria-label="Go to contact details"
            >
              Support Center
            </Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative z-10 hidden justify-end lg:flex">
          <div className="relative h-[320px] w-[580px]">
            <RoboBookSVG />
          </div>
        </div>
      </div>
    </header>
  );
}

/** Clean, modern inline SVG that matches the blue/green accent palette */
function RoboBookSVG() {
  return (
    <svg
      viewBox="0 0 640 360"
      className="h-full w-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
      aria-hidden
    >
      {/* Back ring */}
      <circle cx="440" cy="170" r="130" fill="#111627" />
      <circle cx="440" cy="170" r="100" fill="#111b2a" />
      <circle cx="440" cy="170" r="70" fill="#0f172a" />

      {/* Spark dots */}
      <g fill="currentColor" className="text-emerald-400/80">
        <circle cx="560" cy="120" r="6" />
        <circle cx="510" cy="270" r="5" />
      </g>
      <g fill="currentColor" className="text-blue-400/80">
        <circle cx="370" cy="280" r="6" />
        <circle cx="335" cy="105" r="5" />
      </g>

      {/* Robot body */}
      <g>
        <rect
          x="260"
          y="90"
          width="150"
          height="160"
          rx="24"
          fill="url(#card)"
        />
        {/* eyes */}
        <circle cx="310" cy="155" r="10" fill="#e2f8ff" />
        <circle cx="360" cy="155" r="10" fill="#e2f8ff" />
        {/* smile */}
        <path
          d="M305 185c8 12 37 12 45 0"
          stroke="#d1fff1"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* antenna */}
        <line x1="335" y1="90" x2="335" y2="70" stroke="#7dd3fc" strokeWidth="4" />
        <circle cx="335" cy="62" r="8" fill="#34d399" />
      </g>

      {/* Open book */}
      <g transform="translate(210,180)">
        <path
          d="M0 0c40-15 80-15 120 0v85c-40-15-80-15-120 0V0z"
          fill="url(#left)"
        />
        <path
          d="M120 0c40-15 80-15 120 0v85c-40-15-80-15-120 0V0z"
          fill="url(#right)"
        />
        <rect x="118" y="2" width="4" height="81" rx="2" fill="#a7f3d0" />
        {/* lines */}
        <g stroke="#86efac" strokeOpacity="0.5" strokeWidth="2">
          <path d="M10 20h90M10 38h90M10 56h90M10 74h90" />
        </g>
        <g stroke="#93c5fd" strokeOpacity="0.5" strokeWidth="2" transform="translate(130,0)">
          <path d="M10 20h90M10 38h90M10 56h90M10 74h90" />
        </g>
      </g>

      {/* floating puzzle */}
      <g transform="translate(510,80) rotate(12)">
        <rect x="-30" y="-30" width="80" height="80" rx="14" fill="#22c55e" opacity="0.25" />
        <path
          d="M0 0h40v18a9 9 0 0 1-18 0V0h-22a9 9 0 0 1 0 18H0v22a9 9 0 0 1 18 0V40h22a9 9 0 0 1 0-18H40V0z"
          fill="#22d3ee"
          opacity="0.9"
        />
      </g>

      {/* defs */}
      <defs>
        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#042f2e" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#0b1b3a" stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  );
}
