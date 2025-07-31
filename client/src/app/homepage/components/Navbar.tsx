'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [show, setShow] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // hide-on-scroll / show-on-scroll
  const controlNavbar = () => {
    if (typeof window === 'undefined') return;
    const y = window.scrollY;

    setShow(!(y > lastScrollY && y > 50));
    setScrolled(y > 80);
    setLastScrollY(y);
  };

  // listeners
  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // body scroll lock जब ड्रॉअर खुला हो
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
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
      {/* Top Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500
          ${show ? 'translate-y-0' : '-translate-y-full'}
          ${scrolled ? 'bg-white/70 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Robo Books" width={140} height={40} priority />
          </Link>

          {/* Desktop links */}
          <div
            className={`hidden md:flex space-x-6 transition-colors duration-500
              ${scrolled ? 'text-gray-800' : 'text-white'}`}
          >
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className="transition hover:text-blue-500">
                {label}
              </Link>
            ))}
          </div>

          {/* Buttons + Hamburger */}
          <div className="flex items-center space-x-4">
            <Link
              href="/signin"
              className={`font-medium transition
                ${scrolled ? 'text-gray-800 hover:text-blue-600'
                            : 'text-white hover:text-blue-400'}`}
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

            {/* Hamburger (md से नीचे) */}
            <button
              aria-label="Toggle menu"
              className={`ml-2 md:hidden ${scrolled ? 'text-gray-800' : 'text-white'}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={28} strokeWidth={2.5} /> : <Menu size={28} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 top-0 z-[60] md:hidden transition-transform duration-500
          ${mobileOpen ? 'translate-y-0' : '-translate-y-full'}
          ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md' : 'bg-black/120 backdrop-blur'}`}
      >
        {/* 72px (~h-18) ऊपर स्पेस, ताकि ड्रॉअर का पहला लिंक लोगो से न टकराए */}
        <div className="pt-[72px] flex h-full flex-col text-white items-center space-y-6 overflow-y-auto px-6 pb-10">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="w-full text-center text-lg font-medium transition hover:text-blue-500"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
