'use client'

import React, { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  const [slide, setSlide] = useState(0)

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left: Carousel */}
        <div className="relative">
          <h3 className="text-xl font-semibold text-center mb-3">Account on the go!</h3>
          <p className="text-gray-600 text-center mb-6 max-w-md mx-auto">
            Download the Robo Books app for Android and iOS to manage your finances from anywhere, anytime!
          </p>
          <div className="flex items-center justify-center gap-8">
            <img src="/mobile-app.png" alt="Mobile App" className="h-48 w-auto object-contain" />
            <div className="h-40 w-40 bg-gray-200 rounded-lg" />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setSlide(i)} className={`h-1.5 w-4 rounded-full ${slide === i ? 'bg-blue-600' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>

        {/* Right: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: 'OTHER ROBO APPS', items: ['Ecommerce Software','Expense Reporting','Subscription Billing','100% Free Invoicing Solution','Inventory Management','CRM & Other Apps'] },
            { title: 'HELP & SUPPORT', items: ['Contact Support','Knowledge Base','Help Documentation','Webinar'] },
            { title: 'QUICK LINKS', items: ['Getting Started','Mobile apps','Add-ons','What\'s New?','Developers API'] },
          ].map(section => (
            <div key={section.title}>
              <h4 className="font-semibold mb-3">{section.title}</h4>
              <ul className="space-y-2 text-blue-600">
                {section.items.map(li => <li key={li}>{li}</li>)}
              </ul>
            </div>
          ))}

          {/* Contact block */}
          <div className="col-span-2 md:col-span-1 p-4 rounded-lg border bg-gray-50">
            <p className="font-medium">
              You can directly talk to us every <b>Monday to Friday 9:00 AM to 7:00 PM</b>
            </p>
            <p className="mt-2">
              Robo Books India Helpline: <b>18003093036</b> (Toll Free)
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Supported Languages: English, हिन्दी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t text-xs text-gray-500 text-center">
        © 2025, Robo Corporation Pvt. Ltd. All Rights Reserved.
      </div>
    </div>
  )
}
