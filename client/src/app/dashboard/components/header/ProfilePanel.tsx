// components/header/ProfilePanel.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  XMarkIcon,
  BookOpenIcon,
  ChatBubbleLeftEllipsisIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  ArrowPathIcon,
  FolderIcon,
  EnvelopeIcon,
  CursorArrowRippleIcon,
  CalendarDaysIcon,
  UserIcon,
  StarIcon,
  PhoneIcon,
  SparklesIcon,
  BriefcaseIcon,
  CommandLineIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

const GRID_ITEMS = [
  { Icon: BookOpenIcon, label: "Help Documents", href: "/help-docs" },
  { Icon: ChatBubbleLeftEllipsisIcon, label: "FAQs", href: "/faqs" },
  { Icon: GlobeAltIcon, label: "Forum", href: "/forum" },
  { Icon: PlayCircleIcon, label: "Video Tutorials", href: "/videos" },
  { Icon: ArrowPathIcon, label: "Explore Features", href: "/explore" },
  { Icon: FolderIcon, label: "Migration Guide", href: "/migration" },
];

const ASSIST_LIST = [
  { Icon: EnvelopeIcon, label: "Send an email", href: "/support/email" },
  {
    Icon: CursorArrowRippleIcon,
    label: "Record screen & share feedback",
    href: "/support/feedback",
  },
  {
    Icon: CalendarDaysIcon,
    label: "Register for webinars",
    href: "/support/webinars",
  },
  { Icon: UserIcon, label: "Find an accountant", href: "/support/accountant" },
  {
    Icon: StarIcon,
    label: "Early Access Features",
    href: "/support/early-access",
  },
  {
    Icon: PhoneIcon,
    label: "Talk to us (Mon–Fri · 9am–7pm · Toll-Free)",
    href: "tel:18003093036",
  },
];

export default function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const testClick = () => {
    console.log("🔘 Test button clicked!");
  };

  const handleLogout = async () => {
    console.log("🚪 Logout button clicked!");
    try {
      setIsLoggingOut(true);
      console.log("🚪 Calling logout...");

      // Use the AuthContext logout function
      await logout();
      console.log("✅ Logout successful");

      // Close the panel
      onClose();
      console.log("✅ Panel closed");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if logout fails, redirect to signin page
      console.log("🔄 Redirecting to signin page despite error...");
      router.push("/signin");
    } finally {
      setIsLoggingOut(false);
      console.log("✅ Logout process completed");
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose} />

      {/* panel */}
      <div className="fixed top-14 right-4 z-60 w-[380px] max-h-[85vh] overflow-auto bg-white rounded-2xl shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white">
              T
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">Try</div>
              <div className="text-sm text-gray-500">
                farziemailthisis@gmail.com
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* My Account / Sign Out */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <a
            href="/my-account"
            className="text-blue-600 font-medium hover:underline"
          >
            My Account
          </a>
        </div>

        {/* Trial info */}
        <div className="px-6 py-4 border-b text-sm text-gray-700 space-y-2">
          <p>
            Your premium trial plan ends in{" "}
            <span className="font-semibold text-gray-900">12 days</span>.
          </p>
          <div className="flex gap-4">
            <a href="/change-trial" className="text-blue-600 hover:underline">
              Change Trial Plan
            </a>
            <a href="/subscribe" className="text-blue-600 hover:underline">
              Subscribe
            </a>
          </div>
        </div>

        {/* top grid */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b">
          {GRID_ITEMS.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              className="
                flex flex-col items-center p-4
                bg-white rounded-2xl shadow-sm hover:shadow-md
                transform hover:-translate-y-1 transition
              "
            >
              <Icon className="w-7 h-7 text-indigo-500 mb-3" />
              <span className="text-sm font-medium text-gray-800 text-center">
                {label}
              </span>
            </a>
          ))}
        </div>

        {/* Need Assistance */}
        <div className="px-6 py-5 border-b">
          <div className="text-lg font-semibold text-gray-900 mb-4">
            Need Assistance?
          </div>
          <ul className="space-y-3">
            {ASSIST_LIST.map(({ Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="
                    flex items-center justify-between
                    p-3 bg-gray-50 rounded-2xl hover:bg-gray-100
                    transform hover:scale-[1.02] transition
                  "
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-800">{label}</span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* What's New */}
        <div className="px-6 py-6 border-b">
          <a
            href="/whats-new"
            className="
              flex items-center gap-4 p-4
              bg-yellow-50 rounded-2xl hover:bg-yellow-100
              shadow-sm hover:shadow-md transform hover:-translate-y-1
              transition
            "
          >
            <SparklesIcon className="w-7 h-7 text-yellow-500" />
            <div>
              <div className="font-medium text-gray-900">What&#39;s New?</div>
              <div className="text-sm text-gray-700">
                View the latest features and enhancements
              </div>
            </div>
          </a>
        </div>

        {/* guide cards */}
        <div className="grid grid-cols-2 gap-4 p-6 border-b">
          <a
            href="/guides/essential"
            className="
              flex flex-col gap-2 p-4
              bg-green-50 rounded-2xl hover:bg-green-100
              shadow-sm hover:shadow-md transform hover:-translate-y-1
              transition
            "
          >
            <BriefcaseIcon className="w-7 h-7 text-green-600" />
            <span className="text-sm font-medium text-gray-800">
              Essential guides for your business
            </span>
          </a>
          <a
            href="/guides/shortcuts"
            className="
              flex flex-col gap-2 p-4
              bg-indigo-50 rounded-2xl hover:bg-indigo-100
              shadow-sm hover:shadow-md transform hover:-translate-y-1
              transition
            "
          >
            <CommandLineIcon className="w-7 h-7 text-indigo-600" />
            <span className="text-sm font-medium text-gray-800">
              Navigate faster with keyboard shortcuts
            </span>
          </a>
        </div>

        {/* mobile + desktop apps */}
        <div className="px-6 py-6 space-y-6">
          <div className="flex items-start gap-4">
            <DevicePhoneMobileIcon className="w-7 h-7 text-gray-700" />
            <div className="space-y-1">
              <div className="font-medium text-gray-900">
                Download the mobile app
              </div>
              <div className="text-sm text-gray-700">
                Manage your business operations on the go
              </div>
              <div className="flex items-center gap-2 mt-2">
                <DevicePhoneMobileIcon className="w-6 h-6 text-gray-800" />
                <DeviceTabletIcon className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <BriefcaseIcon className="w-7 h-7 text-gray-700" />
            <div className="space-y-1">
              <div className="font-medium text-gray-900">
                Work simpler and faster with our secure standalone Windows app
              </div>
              <a
                href="/download/windows"
                className="text-blue-600 hover:underline text-sm"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
