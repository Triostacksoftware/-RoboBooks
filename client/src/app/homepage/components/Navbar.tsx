'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const [show, setShow] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;

      // Scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShow(false); // hide navbar
      } else {
        setShow(true); // show navbar
      }

      // Detect if scrolled from top
      if (currentScrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      setLastScrollY(currentScrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => window.removeEventListener('scroll', controlNavbar);
    }
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        show ? 'translate-y-0' : '-translate-y-full'
      } ${scrolled ? 'bg-white/70 backdrop-blur-lg shadow-md' : 'bg-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center transition-all duration-500">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Robo Books"
            width={140}
            height={40}
            className="transition-opacity duration-500"
          />
        </Link>

        {/* Menu */}
        <div
          className={`hidden md:flex space-x-6  transition-colors duration-500 ${
            scrolled ? 'text-gray-800' : 'text-white'
          }`}
        >
          <Link href="/" className="hover:text-blue-500 transition">Home</Link>
          <Link href="/about" className="hover:text-blue-500 transition">About Us</Link>
          <Link href="/services" className="hover:text-blue-500 transition">Services</Link>
          <Link href="/features" className="hover:text-blue-500 transition">Features</Link>
          <Link href="/contact" className="hover:text-blue-500 transition">Contact Us</Link>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <Link
            href="/signin"
            className={`font-medium transition duration-300 ${
              scrolled
                ? 'text-gray-800 hover:text-blue-600'
                : 'text-white hover:text-blue-400'
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full text-white font-semibold transition bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
