import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/print.css";
import { ToastProvider } from "../contexts/ToastContext";
import { ModulePreferenceProvider } from "../contexts/ModulePreferenceContext";
import { AuthProvider } from "../contexts/AuthContext";
import GlobalErrorHandler from "../components/GlobalErrorHandler";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Robo Books – Sign in",
  description: "Ultra-modern blue & green sign-in UI for Robo Books",
  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/images/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    apple: "/images/logo.png",
    shortcut: "/favicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration mismatches
              if (typeof window !== 'undefined') {
                document.documentElement.removeAttribute('extension-installed');
                document.documentElement.removeAttribute('data-extension');
                document.documentElement.removeAttribute('data-extension-id');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50`}
      >
        <GlobalErrorHandler />
        <AuthProvider>
          <ToastProvider>
            <ModulePreferenceProvider>{children}</ModulePreferenceProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
