'use client'

import React from 'react'
import { ComputerDesktopIcon, PlayIcon } from '@heroicons/react/24/outline'

export default function RecentUpdates() {
  const updates = [
    {
      date: '27 June 2005',
      title: 'Manual Entry of Payment Numbers During Vendor Payment Import',
      description: 'You can now manually enter payment numbers during vendor payment import, with an option for auto-generation.'
    },
    {
      date: '26 June 2005',
      title: 'Associate Active Locations With GSTINs To Enable GST',
      description: 'Link GSTINs to active locations for GST compliance and proper tax management.'
    },
    {
      date: '25 June 2005',
      title: 'Introducing the Transfer Order Summary and Transfer Order Details Reports',
      description: 'New reports for tracking transfer orders and managing inventory movements effectively.'
    },
    {
      date: '24 June 2005',
      title: 'Share Payment Links Via WhatsApp',
      description: 'Send payment links directly via WhatsApp for faster payment collection.'
    },
    {
      date: '24 June 2005',
      title: 'Enhancements To Record Locking',
      description: 'Improved record locking features with dedicated settings for better data security.'
    },
    {
      date: '23 June 2005',
      title: 'Introducing a New Flow To Track Discounts on Bills Under Inventory Asset',
      description: 'New method for managing discounts on bills related to inventory assets.'
    },
    {
      date: '22 June 2005',
      title: 'Set \'Applied on Date\' for Customer Payments and Credit Notes',
      description: 'Option to set a specific \'Applied on Date\' for customer payments and credit notes.'
    },
    {
      date: '19 June 2005',
      title: 'Sort and Limit Data Points in Report Panels',
      description: 'New options for sorting and limiting data points within report panels.'
    },
    {
      date: '17 June 2005',
      title: 'Introducing Sales Summary Report',
      description: 'New report providing a comprehensive summary of sales activity.'
    },
    {
      date: '17 June 2005',
      title: 'View Sync History for Bigin Integration',
      description: 'View the synchronization history for integration with Bigin CRM.'
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Updates Timeline */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Updates</h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {updates.map((update, index) => (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="absolute left-3 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                  
                  {/* Content */}
                  <div className="ml-8 flex-1">
                    <div className="text-sm text-gray-500 mb-2">{update.date}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{update.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{update.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Help Resources */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <ComputerDesktopIcon className="w-8 h-8 text-blue-600" />
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-3">Want to understand how Robo Books works?</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Read our help documentation to understand how Robo Books works and how you can make the most of the features.
          </p>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm">
              Documentation
            </button>
            <button className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 text-sm">
              FAQ
            </button>
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-3">VIDEO TUTORIALS</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Visit our YouTube channel and watch for videos and webinars to learn everything about Robo Books.
          </p>
          <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
            Go to YouTube Channel
          </a>
        </div>
      </div>
    </div>
  )
} 
