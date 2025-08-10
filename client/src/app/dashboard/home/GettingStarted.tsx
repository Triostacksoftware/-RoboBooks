'use client'

import React, { useState } from 'react'
import { CheckIcon, PlayIcon } from '@heroicons/react/24/outline'

export default function GettingStarted() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
    }
    setCompletedTasks(newCompleted)
  }

  const progressPercentage = (completedTasks.size / 4) * 100

  const setupTasks = [
    {
      id: 'org-details',
      title: 'Add organization details',
      description: 'Add your organization\'s address and tax details to Robo Books to auto-populate them when you create transactions, files, and invoices to provide access to your employees and accountants.',
      learnMore: '/dashboard/settings'
    },
    {
      id: 'first-invoice',
      title: 'Create your first invoice',
      description: 'Email "Your invoice" to the test email id.',
      learnMore: '/dashboard/sales/invoices/new'
    },
    {
      id: 'first-bill',
      title: 'Create your first bill and expense',
      description: 'Set up your first bill and expense entries.',
      learnMore: '/dashboard/expenses/new'
    },
    {
      id: 'banking-journals',
      title: 'Set up banking and journals',
      description: 'Configure your banking details and journal entries.',
      learnMore: '/dashboard/banking'
    }
  ]

  const featureCards = [
    {
      title: 'Configure Chart of Accounts',
      description: 'Define accounts that can be used by any type of business. If there are other accounts that your business needs, you can create them.',
      learnMore: '/dashboard/accounts',
      configure: '/dashboard/accounts',
      watchLearn: 'https://www.youtube.com/results?search_query=chart+of+accounts'
    },
    {
      title: 'Enter Opening Balances',
      description: 'The first step to setting up your software, you must enter the opening balances in Robo Books before you start adding transactions to keep your books in sync.',
      learnMore: '/dashboard/opening-balances',
      configure: '/dashboard/opening-balances',
      watchLearn: 'https://www.youtube.com/results?search_query=opening+balances+accounting'
    },
    {
      title: 'Connect with Payment Gateways',
      description: 'Connect with payment gateways to accept online payments and gateways and collect payments faster from your customers.',
      learnMore: '/dashboard/settings/payments',
      configure: '/dashboard/settings/payments',
      watchLearn: 'https://www.youtube.com/results?search_query=payment+gateway+setup'
    },
    {
      title: 'Enable Customer and Vendor Portals',
      description: 'Enable customer and vendor portals to keep track and communicate with you about all the transactions that you\'ve created for them.',
      learnMore: '/dashboard/settings/portals',
      configure: '/dashboard/settings/portals',
      watchLearn: 'https://www.youtube.com/results?search_query=customer+vendor+portal'
    },
    {
      title: 'Set up Payment Reminders',
      description: 'Configure payment reminders to make sure that payments. Configure them to send automated emails and SMSes as reminders and collect payments on time.',
      learnMore: '/dashboard/settings/reminders',
      configure: '/dashboard/settings/reminders',
      watchLearn: 'https://www.youtube.com/results?search_query=payment+reminders'
    },
    {
      title: 'Configure Roles and Permission',
      description: 'Configure roles and permissions for accountants as users in Robo Books by configuring different roles and permissions for them.',
      learnMore: '/dashboard/settings/roles',
      configure: '/dashboard/settings/roles',
      watchLearn: 'https://www.youtube.com/results?search_query=roles+and+permissions'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Getting Started Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Getting Started with Robo Books</h1>
            <p className="text-xl mb-6">The easy-to-use accounting software that you can set up in no time!</p>
            <p className="text-blue-100">
              Need help getting started with Robo Books? Register for one of our free webinars.{' '}
             <a href="https://www.youtube.com/results?search_query=robobooks+webinar" target="_blank" rel="noreferrer" className="underline font-semibold">View Live Webinar</a>
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-blue-500 rounded-lg p-6 text-center max-w-md">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Setup and Overview of Robo Books</h3>
              <p className="text-blue-100">Watch our comprehensive guide to get started</p>
            </div>
          </div>
        </div>
      </div>

      {/* Let's get you up and running */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Let's get you up and running</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% Completed
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Mark as Completed
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {setupTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center mt-1 ${
                  completedTasks.has(task.id) 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                }`}
              >
                {completedTasks.has(task.id) && (
                  <CheckIcon className="w-4 h-4 text-white" />
                )}
              </button>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{task.title}</h3>
                <p className="text-gray-600 mb-2">{task.description}</p>
                <a href={task.learnMore} className="text-blue-600 hover:underline text-sm">
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explore useful features */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-2">Explore useful features and set up Robo Books</h2>
        <p className="text-gray-600 mb-6">Your journey to effortlessly manage your accounting starts here.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feature, index) => (
            <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  Configure
                </button>
                <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-50">
                  Watch & Learn
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Advanced Features */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Other Advanced Features</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm">+</span>
            </div>
            <span className="text-sm">Add a Custom Field</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm">✓</span>
            </div>
            <span className="text-sm">Set Up Approval Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm">#</span>
            </div>
            <span className="text-sm">Create Tag</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm">⚙</span>
            </div>
            <span className="text-sm">Create Custom Functions</span>
          </div>
        </div>
      </div>

      {/* Green Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold">Configure email alerts</h3>
          </div>
          <p className="text-gray-600 mb-2">Receive alerts on the email alerts.</p>
          <p className="text-gray-600 mb-4">Receive automated email alerts.</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold">Make your transactions reflect your brand</h3>
          </div>
          <p className="text-gray-600 mb-2">Customize your templates.</p>
          <p className="text-gray-600 mb-2">Add your organization's logo to the templates.</p>
          <p className="text-gray-600 mb-4">Add the bank details to the templates.</p>
           <a href="/dashboard/settings/templates" className="text-blue-600 hover:underline">View More</a>
        </div>
      </div>

      {/* Pre-Footer Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Have a question?</h4>
          <p className="text-gray-600 mb-2">Write to us at support.robobooks.com</p>
          <a href="https://www.youtube.com/@" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Watch a video</a>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Searching for an accountant?</h4>
          <p className="text-gray-600 mb-2">Find Robo Books certified financial advisors who can help you grow your business efficiently using Robo Books.</p>
          <a href="/contact" className="text-blue-600 hover:underline">Find a Robo Books Advisor</a>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Learn more from our webinars</h4>
          <p className="text-gray-600 mb-2">Stay in-depth understanding from our webinars of Robo Books webinars.</p>
          <a href="https://www.youtube.com/results?search_query=robobooks+webinar" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Watch a webinar</a>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Follow us and stay up to date</h4>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">f</div>
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-sm">t</div>
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm">in</div>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm">▶</div>
          </div>
        </div>
      </div>
    </div>
  )
} 