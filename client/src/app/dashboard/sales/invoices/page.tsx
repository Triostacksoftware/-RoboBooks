"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  CheckIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon,
  CreditCardIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";

const AllInvoicesPage = () => {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-900">
              All Invoices
            </h1>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/sales/invoices/new">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2 inline" />
                New
              </button>
            </Link>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Books Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <PlayIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Books</h2>
                <p className="text-sm text-gray-600">
                  Learn how to create your first Invoice.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              It&rsquo;s time to get paid!
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We don&lsquo;t want to boast too much, but sending amazing
              invoices and getting paid is easier than ever. Go ahead! Try it
              yourself.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/dashboard/sales/invoices/new">
                <button className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium">
                  NEW INVOICE
                </button>
              </Link>
              <button className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium">
                NEW RECURRING INVOICE
              </button>
            </div>

            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Import Invoices
            </button>
          </div>

          {/* Lifecycle Diagram */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
              Life cycle of an Invoice
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap justify-center items-center space-x-4 md:space-x-8">
                {/* Draft */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    DRAFT
                  </span>
                  <CheckIcon className="h-4 w-4 text-green-500 mt-1" />
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                </div>

                {/* Sent */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    SENT
                  </span>
                  <CheckIcon className="h-4 w-4 text-green-500 mt-1" />
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                </div>

                {/* Unpaid */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    UNPAID
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                </div>

                {/* Overdue */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-red-600" />
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    OVERDUE
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                </div>

                {/* Partially Paid */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-orange-600" />
                      <ArrowPathIcon className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    PARTIALLY PAID
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                </div>

                {/* Paid */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    PAID
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Brand Your Invoices */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Brand Your Invoices
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Choose your favourite theme from our gallery of templates and
                personalize your invoice to reflect your brand.
              </p>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Learn More
              </button>
            </div>

            {/* Collect Online Payments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <CreditCardIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Collect Online Payments
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configure a payment gateway and collect online payments from
                your customer with ease.
              </p>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Learn More
              </button>
            </div>

            {/* Customer Portal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Square3Stack3DIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Customer Portal
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Enable Customer Portal for your customers and allow them to
                accept quotes, keep track of invoices and make payments.
              </p>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Icons */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white border-l border-gray-200 p-2 space-y-2">
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            1
          </span>
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <QuestionMarkCircleIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <UserCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default AllInvoicesPage;
