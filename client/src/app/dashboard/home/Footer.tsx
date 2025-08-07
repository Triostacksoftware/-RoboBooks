"use client";

import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  DevicePhoneMobileIcon,
  LifebuoyIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const [slide, setSlide] = useState(0);

  return (
    <footer className="bg-white rounded-2xl border shadow-md overflow-hidden mt-8">
      <div className="p-6 lg:p-10">
        {/* Links & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Section: Other Robo Apps */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Other Robo Apps</h4>
            </div>
            <ul className="space-y-1 text-blue-600 text-sm">
              {[
                "Ecommerce Software",
                "Expense Reporting",
                "Subscription Billing",
                "100% Free Invoicing Solution",
                "Inventory Management",
                "CRM & Other Apps",
              ].map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          </div>
          {/* Section: Help & Support */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LifebuoyIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Help & Support</h4>
            </div>
            <ul className="space-y-1 text-blue-600 text-sm">
              {[
                "Contact Support",
                "Knowledge Base",
                "Help Documentation",
                "Webinar",
              ].map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          </div>
          {/* Section: Quick Links */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PlusIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Quick Links</h4>
            </div>
            <ul className="space-y-1 text-blue-600 text-sm">
              {[
                "Getting Started",
                "Add-ons",
                "What's New?",
                "Developers API",
              ].map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          </div>
          {/* Contact block - spans all columns on mobile */}
          <div className="sm:col-span-2 md:col-span-3 mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-2">
            <p className="font-medium text-gray-800">
              You can directly talk to us every{" "}
              <span className="font-bold">
                Monday to Friday 9:00 AM to 7:00 PM
              </span>
            </p>
            <p className="text-blue-700 font-semibold">
              Robo Books India Helpline:{" "}
              <span className="font-bold">18003093036</span>{" "}
              <span className="text-xs font-normal">(Toll Free)</span>
            </p>
            <p className="text-xs text-gray-500">
              Supported Languages: English, हिन्दी, தமிழ், తెలుగు, മലയാളം,
              ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t text-xs text-gray-500 text-center bg-gray-50">
        © 2025, Robo Corporation Pvt. Ltd. All Rights Reserved.
      </div>
    </footer>
  );
}
