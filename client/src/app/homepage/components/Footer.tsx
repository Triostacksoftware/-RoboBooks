'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FacebookIcon,
  TwitterIcon,
  PointerIcon,
  InstagramIcon,
} from 'lucide-react'; // or use @heroicons/react

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#16191d] text-white">
      {/* top glow border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* --- GRID ---------------------------------------------------- */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          {/* 1️⃣ Brand + blurb */}
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/logo.png" // ← update path if needed
                alt="Robo Books"
                width={180}
                height={56}
                priority={false}
                className="h-14 w-auto rounded-lg"
              />
            </Link>

            <p className="mt-6 max-w-md text-sm text-white/70 leading-relaxed">
              Robo&nbsp;Books is a comprehensive platform for billing, tax
              management and invoicing—offering seamless solutions for
              businesses and individuals. Designed for clarity, built for speed.
            </p>

            {/* social icons */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm font-medium text-white">Follow:</span>
              {[
                { href: '#', label: 'Facebook', icon: <FacebookIcon /> },
                { href: '#', label: 'Twitter/X', icon: <TwitterIcon /> },
                { href: '#', label: 'Pinterest', icon: <PointerIcon /> },
                { href: '#', label: 'Instagram', icon: <InstagramIcon /> },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full
                             border border-white/10 bg-white/5 text-white/80
                             transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* 2️⃣ Link column – Why Choose */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white/90">
              WHY CHOOSE
            </h3>
            <ul className="mt-6 space-y-3">
              {[
                { href: '/customers', label: 'Customers' },
                { href: '/why', label: 'Why choose us' },
                { href: '/faq', label: 'FAQ' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3️⃣ Link column – Company */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white/90">
              COMPANY
            </h3>
            <ul className="mt-6 space-y-3">
              {[
                { href: '/about', label: 'About' },
                { href: '/what-we-do', label: 'What we do' },
                { href: '/contact', label: 'Contact us' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* --- /GRID --------------------------------------------------- */}

        {/* bottom bar */}
        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/60">
            © {year} Tax Square. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-6 text-sm">
            {[
              { href: '/legal/terms', label: 'Terms and conditions' },
              { href: '/legal/cookies', label: 'Cookies' },
              { href: '/legal/privacy', label: 'Privacy policy' },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-white/70 transition hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
