'use client'
import { useState } from 'react'

export default function Footer() {
  const [slide, setSlide] = useState(0)

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Carousel */}
        <div className="relative">
          <h3 className="text-xl font-semibold text-center mb-3">Account on the go!</h3>
          <p className="text-gray-600 text-center mb-6 max-w-md mx-auto">
            Download the Zoho Books app for Android and iOS to manage your finances from anywhere, anytime!
          </p>

          <div className="flex items-center justify-center gap-8">
            <img src="/mobile-app.png" alt="" className="h-48 w-auto object-contain" />
            <div className="h-40 w-40 bg-gray-200 rounded-lg" />
          </div>

          {/* dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 w-4 rounded-full ${slide === i ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-semibold mb-3">OTHER ZOHO APPS</h4>
            <ul className="space-y-2 text-blue-600">
              <li>Ecommerce Software</li>
              <li>Expense Reporting</li>
              <li>Subscription Billing</li>
              <li>100% Free Invoicing Solution</li>
              <li>Inventory Management</li>
              <li>CRM & Other Apps</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">HELP & SUPPORT</h4>
            <ul className="space-y-2 text-blue-600">
              <li>Contact Support</li>
              <li>Knowledge Base</li>
              <li>Help Documentation</li>
              <li>Webinar</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">QUICK LINKS</h4>
            <ul className="space-y-2 text-blue-600">
              <li>Getting Started</li>
              <li>Mobile apps</li>
              <li>Add-ons</li>
              <li>What's New?</li>
              <li>Developers API</li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <div className="p-4 rounded-lg border bg-gray-50">
              <div className="font-medium">
                You can directly talk to us every <b>Monday to Friday 9:00 AM to 7:00 PM</b>
              </div>
              <div className="mt-2">
                Zoho Books India Helpline: <b>18003093036</b> (Toll Free)
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Supported Languages: English, हिन्दी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t text-xs text-gray-500">
        © 2025, Zoho Corporation Pvt. Ltd. All Rights Reserved.
      </div>
    </div>
  )
}
