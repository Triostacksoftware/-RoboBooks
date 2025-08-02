'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Body scroll lock when drawer is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/features', label: 'Features' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <>
      {/* Always-fixed, white navbar */}
      <nav
        className="
          fixed top-0 left-0 z-50 w-full
          bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90
          border-b border-gray-100 shadow-sm
        "
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.png" alt="Robo Books" width={140} height={40} priority />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-6 text-gray-800">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="transition hover:text-blue-600">
                {label}
              </Link>
            ))}
          </div>

          {/* Buttons + Hamburger */}
          <div className="flex items-center space-x-4">
            <Link
              href="/signin"
              className="font-medium text-gray-800 transition hover:text-blue-600"
            >
              Sign&nbsp;in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-green-400 to-blue-500
                         px-5 py-2 font-semibold text-white shadow-lg
                         transition hover:from-blue-500 hover:to-green-400"
            >
              Register
            </Link>

            {/* Hamburger (md and below) */}
            <button
              aria-label="Toggle menu"
              className="ml-2 text-gray-900 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={28} strokeWidth={2.5} /> : <Menu size={28} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (white theme) */}
      <div
        className={`
          fixed inset-0 z-[60] md:hidden transition-transform duration-500
          ${mobileOpen ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="h-full w-full bg-white">
          {/* Spacer to avoid overlap with fixed navbar */}
          <div className="h-[72px]" />
          <div className="flex h-[calc(100%-72px)] flex-col items-center space-y-6 overflow-y-auto px-6 pb-10">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center text-lg font-medium text-gray-800 transition hover:text-blue-600"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
