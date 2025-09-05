"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const FAQ_ITEMS = [
  {
    id: 1,
    question: "How do I create my first invoice?",
    answer:
      "To create your first invoice, navigate to Sales > Invoices and click the 'Create New' button. Fill in the customer details, add items, set quantities and prices, then save and send to your customer.",
  },
  {
    id: 2,
    question: "How can I manage my customers?",
    answer:
      "Go to Sales > Customers to view, add, edit, or delete customer information. You can also import customer data from CSV files and categorize them for better organization.",
  },
  {
    id: 3,
    question: "What payment methods are supported?",
    answer:
      "We support various payment methods including bank transfers, credit cards, digital wallets, and cash payments. You can configure payment methods in the Banking section.",
  },
  {
    id: 4,
    question: "How do I generate financial reports?",
    answer:
      "Navigate to Reports section to access various financial reports including profit & loss statements, balance sheets, cash flow reports, and tax summaries.",
  },
  {
    id: 5,
    question: "Can I track time for projects?",
    answer:
      "Yes! Use the Time Tracking section to create projects, log time entries, and generate timesheet reports for billing or payroll purposes.",
  },
  {
    id: 6,
    question: "How do I backup my data?",
    answer:
      "Your data is automatically backed up daily. You can also manually export data from the Documents section or contact support for additional backup options.",
  },
];

const SUPPORT_OPTIONS = [
  {
    title: "Email Support",
    description: "Get detailed responses within 24 hours",
    icon: EnvelopeIcon,
    contact: "support@robobooks.com",
    action: "Send Email",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Phone Support",
    description: "Speak with our experts directly",
    icon: PhoneIcon,
    contact: "+1 (555) 123-4567",
    action: "Call Now",
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Live Chat",
    description: "Instant help during business hours",
    icon: ChatBubbleLeftRightIcon,
    contact: "Available 9 AM - 6 PM EST",
    action: "Start Chat",
    color: "bg-purple-50 text-purple-600",
  },
];

const RESOURCES = [
  {
    title: "User Manual",
    description: "Complete guide to all features",
    icon: BookOpenIcon,
    link: "#",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    icon: VideoCameraIcon,
    link: "#",
    color: "bg-red-50 text-red-600",
  },
  {
    title: "API Documentation",
    description: "Developer resources and APIs",
    icon: DocumentTextIcon,
    link: "#",
    color: "bg-gray-50 text-gray-600",
  },
];

export default function HelpSupportPage() {
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("faq");

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              < Back to Dashboard
            </button>
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 grid place-items-center">
              <QuestionMarkCircleIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Help & Support
              </h1>
              <p className="text-gray-600 mt-1">
                Get help with RoboBooks and find answers to common questions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 grid place-items-center">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-lg font-semibold text-green-600">
                  All Systems Operational
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                <InformationCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-lg font-semibold text-blue-600">
                  Under 24 Hours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-600 grid place-items-center">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Known Issues</p>
                <p className="text-lg font-semibold text-orange-600">
                  0 Active Issues
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("faq")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "faq"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Frequently Asked Questions
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "contact"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Contact Support
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "resources"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Resources
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* FAQ Tab */}
            {activeTab === "faq" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {FAQ_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg"
                    >
                      <button
                        onClick={() => toggleFAQ(item.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-inset"
                      >
                        <span className="font-medium text-gray-900">
                          {item.question}
                        </span>
                        {openFAQ === item.id ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {openFAQ === item.id && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Support Tab */}
            {activeTab === "contact" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SUPPORT_OPTIONS.map((option, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`h-10 w-10 rounded-lg ${option.color} grid place-items-center`}
                        >
                          <option.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {option.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          {option.contact}
                        </p>
                        <button className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition-colors">
                          {option.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Helpful Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {RESOURCES.map((resource, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`h-10 w-10 rounded-lg ${resource.color} grid place-items-center`}
                        >
                          <resource.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                      <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                        Access Resource
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you get the most out of
              RoboBooks. Don't hesitate to reach out if you can't find what
              you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-sky-600 text-white py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors">
                Contact Support Team
              </button>
              <button className="bg-white text-sky-600 py-3 px-6 rounded-lg border border-sky-200 hover:bg-sky-50 transition-colors">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
