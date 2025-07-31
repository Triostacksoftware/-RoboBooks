// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "RoboBooks",
    template: "%s – RoboBooks",
  },
  description: "Billing, tax, and invoicing made simple.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${geistSans.variable} ${geistMono.variable}`}>
      <body
        className="
          antialiased min-h-screen 
          bg-gradient-to-br from-blue-50 via-white to-emerald-50 
          text-zinc-900 
          dark:from-zinc-900 dark:via-zinc-950 dark:to-black dark:bg-gradient-to-br dark:text-zinc-100
        "
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
