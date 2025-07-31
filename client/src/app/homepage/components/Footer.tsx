// components/Footer.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LinkGroup = {
  title: string;
  links: { label: string; href: string }[];
};

const groups: LinkGroup[] = [
  {
    title: "Why RoboBooks",
    links: [
      { label: "Customers", href: "/customers" },
      { label: "Why choose us", href: "/why" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "What we do", href: "/what-we-do" },
      { label: "Careers", href: "/careers" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/guides" },
      { label: "Help center", href: "/help" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Cookie preferences", href: "#cookie-prefs" },
    ],
  },
];

const social = [
  {
    name: "X (Twitter)",
    href: "https://twitter.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M18.244 2H21l-6.51 7.44L22.5 22h-6.9l-4.53-5.94L5.7 22H3l7.02-8.01L1.8 2h6.9l4.08 5.43L18.244 2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8.5h4V23h-4V8.5Zm7.5 0h3.84v1.98h.06c.54-1.02 1.86-2.1 3.84-2.1 4.11 0 4.87 2.7 4.87 6.2V23h-4v-6.49c0-1.55-.03-3.54-2.16-3.54-2.17 0-2.5 1.7-2.5 3.43V23h-4V8.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 .5A11.5 11.5 0 0 0 .5 12.2c0 5.18 3.36 9.58 8.03 11.14.59.12.8-.26.8-.58 0-.28-.01-1.04-.02-2.04-3.26.72-3.95-1.58-3.95-1.58-.54-1.38-1.33-1.75-1.33-1.75-1.09-.76.08-.75.08-.75 1.2.09 1.84 1.25 1.84 1.25 1.07 1.86 2.81 1.32 3.5 1.01.11-.79.42-1.32.76-1.62-2.6-.3-5.34-1.34-5.34-5.96 0-1.32.46-2.39 1.23-3.24-.12-.3-.53-1.52.12-3.16 0 0 .99-.32 3.25 1.23.94-.26 1.95-.39 2.95-.39 1 0 2.01.13 2.95.39 2.26-1.55 3.25-1.23 3.25-1.23.65 1.64.24 2.86.12 3.16.77.85 1.23 1.92 1.23 3.24 0 4.63-2.74 5.66-5.36 5.96.43.38.81 1.12.81 2.26 0 1.63-.01 2.95-.01 3.35 0 .32.2.7.8.58 4.67-1.56 8.02-5.96 8.02-11.14A11.5 11.5 0 0 0 12 .5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5ZM18 6.25a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setProgress(height > 0 ? scrolled / height : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );

  const disabled = useMemo(
    () => status === "loading" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email, status]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "ok" : "err");
      if (res.ok) setEmail("");
    } catch {
      setStatus("err");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]"
      aria-label="Newsletter signup"
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/50 outline-none backdrop-blur transition focus:border-white/30"
      />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:from-emerald-300 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      <p
        role="status"
        className="col-span-full text-xs text-white/60 [min-height:theme(spacing.5)]"
      >
        {status === "ok" && "Thanks! Please check your inbox to confirm."}
        {status === "err" && "Something went wrong. Please try again."}
      </p>
    </form>
  );
}

function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cookie:analytics") === "true";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cookie:analytics", String(analytics));
    }
  }, [analytics]);

  return (
    <>
      <button
        id="cookie-prefs"
        onClick={() => setOpen(true)}
        className="text-left text-sm text-white/70 underline underline-offset-4 hover:text-white"
      >
        Cookie preferences
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Cookie Settings</h3>
            <p className="mt-1 text-sm text-white/60">
              We use necessary cookies to make the site work. You can choose to
              enable analytics cookies to help us improve.
            </p>

            <label className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent"
              />
              Enable analytics cookies
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                Close
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2 text-sm font-semibold text-zinc-900"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const progress = useScrollProgress();

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-zinc-950 text-white">
      {/* Glow / gradient top border */}
      <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand + description */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative inline-block">
                <Image
                  src="/images/logo.png"
                  width={160}
                  height={48}
                  alt="RoboBooks"
                  priority={false}
                  className="h-12 w-auto rounded-lg"
                />
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              RoboBooks is a comprehensive platform for billing, tax management,
              and invoicing—offering seamless solutions for businesses and
              individuals. Designed for clarity, built for speed.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
              <span>Follow:</span>
              <ul className="flex items-center gap-3">
                {social.map((s) => (
                  <li key={s.name}>
                    <Link
                      href={s.href}
                      aria-label={s.name}
                      className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      {s.icon}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <NewsletterForm />
          </div>

          {/* Link groups */}
          <div className="md:col-span-7 lg:col-span-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {groups.map((g) => (
                <div key={g.title}>
                  <h4 className="text-sm font-semibold tracking-wide text-white/90">
                    {g.title}
                  </h4>
                  <ul className="mt-4 space-y-2">
                    {g.links.map((l) => {
                      const isCookie = l.href === "#cookie-prefs";
                      return (
                        <li key={l.label}>
                          {isCookie ? (
                            <CookiePreferences />
                          ) : (
                            <Link
                              className="text-sm text-white/70 transition hover:text-white"
                              href={l.href}
                            >
                              {l.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/60">
            © {year} RoboBooks by Tax Square. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/legal/terms" className="text-white/70 hover:text-white">
              Terms and conditions
            </Link>
            <Link
              href="/legal/cookies"
              className="text-white/70 hover:text-white"
            >
              Cookies
            </Link>
            <Link
              href="/legal/privacy"
              className="text-white/70 hover:text-white"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll-to-top progress button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="group fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-zinc-950/80 text-white shadow-lg ring-1 ring-white/15 backdrop-blur transition hover:bg-zinc-900"
        style={{
          backgroundImage: `conic-gradient(#34d399 ${Math.round(
            progress * 360
          )}deg, transparent 0deg)`,
        }}
      >
        <span className="grid place-items-center rounded-full bg-zinc-950/90 p-2">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 transition group-hover:-translate-y-0.5"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M12 5.5 5 12h4v7h6v-7h4l-7-6.5Z" />
          </svg>
        </span>
      </button>
    </footer>
  );
}
