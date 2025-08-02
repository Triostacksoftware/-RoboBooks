// src/app/dashboard/components/Footer.tsx
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto px-4 grid gap-8 lg:grid-cols-4">
        <div>
          <h4 className="font-semibold mb-2">Account on the go!</h4>
          <p className="text-sm text-gray-600">
            Download the Robo Books app for Android and iOS to manage your finances
            from anywhere, anytime!
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Other Zoho Apps</h4>
          <ul className="space-y-1 text-sm text-blue-600">
            <li>Ecommerce Software</li>
            <li>Expense Reporting</li>
            <li>Subscription Billing</li>
            <li>100% Free Invoicing Solution</li>
            <li>Inventory Management</li>
            <li>CRM & Other Apps</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Help & Support</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-blue-600">Contact Support</li>
            <li className="text-blue-600">Knowledge Base</li>
            <li className="text-blue-600">Help Documentation</li>
            <li className="text-blue-600">Webinar</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li className="text-blue-600">Getting Started</li>
            <li className="text-blue-600">Mobile apps</li>
            <li className="text-blue-600">Add-ons</li>
            <li className="text-blue-600">What's New?</li>
            <li className="text-blue-600">Developers API</li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 text-xs text-gray-500">
        You can directly talk to us every Monday to Friday 9:00 AM to 7:00 PM. Zoho Books
        India Helpline: 18003093036 (Toll Free)
      </div>
    </footer>
  )
}
