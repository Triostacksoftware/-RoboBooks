// src/app/contact/components/hero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

type Props = { className?: string };

export default function Hero({ className }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Smooth-scroll helper (with route fallback)
  const goToSection = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else router.push(`${pathname}#${id}`);
  };

  return (
    <header
      className={[
        "relative isolate overflow-hidden",
        // Lightened dim background (no grid)
        "bg-[#2B5FA4] text-white",
        className ?? "",
      ].join(" ")}
    >
      {/* --- Ambient blue/green accents --- */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Broad tints to lift the canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(1060px_600px_at_85%_38%,rgba(37,99,235,0.48),transparent_66%),radial-gradient(980px_600px_at_0%_100%,rgba(16,185,129,0.40),transparent_66%)]" />
        {/* Left-lower green glow */}
        <div className="absolute -left-24 bottom-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.66)_0%,rgba(16,185,129,0.42)_35%,transparent_72%)] blur-2xl" />
        {/* Right-upper blue glow */}
        <div className="absolute -right-20 -top-16 h-[560px] w-[560px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.66)_0%,rgba(59,130,246,0.42)_35%,transparent_72%)] blur-2xl" />
        {/* Brighter vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_560px_at_-10%_120%,rgba(255,255,255,0.22),transparent_58%)]" />
        {/* Slanted ribbon */}
        <div className="absolute -left-40 top-24 h-64 w-[480px] rotate-[-18deg] bg-gradient-to-r from-emerald-500/36 to-blue-500/36 [clip-path:polygon(0_0,100%_0,86%_100%,0_80%)]" />
      </div>

      <div className="container mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="relative z-10">
          {/* Brand chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Robo Books
          </div>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mt-3 text-sm text-white/80">
            <ol className="flex items-center gap-3">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none text-white/50">
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
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            Questions, partnerships, or support—our team responds fast. Let’s
            build something brilliant with{" "}
            <span className="text-emerald-100">Robo</span>
            <span className="text-blue-100">Books</span>.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
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

        {/* Illustration: full GIF, rounded corners, no crop */}
        <div className="relative z-10 hidden justify-end lg:flex">
          <div className="relative h-[320px] w-[580px] rounded-2xl overflow-hidden">
            <Image
              src="/images/Robot-typing.gif"
              alt="Robot typing at a laptop"
              fill
              className="object-contain" // <- shows the whole GIF
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </header>
  );
}
