// components/AdvancedSearchModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface AdvancedSearchData {
  entity: string;
  filter: string;
  displayName: string;
  companyName: string;
  lastName: string;
  status: string;
  address: string;
  notes: string;
  customerType: string;
  firstName: string;
  email: string;
  phone: string;
  pan: string;
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (data: AdvancedSearchData) => void;
}

const entityOptions = [
  'Customers','Items','Banking','Quotes','Sales Orders','Delivery Challans',
  'Invoices','Credit Notes','Vendors','Projects','Timesheet',
  'Chart of Accounts','Documents','Tasks',
];

const filterOptions = [
  'All Customers','Active Customers','CRM Customers','Duplicate Customers',
  'Inactive Customers','Customer Portal Enabled','Customer Portal Disabled',
  'Overdue Customers','Unpaid Customers',
];

export default function AdvancedSearchModal({
  isOpen,
  onClose,
  onSearch,
}: AdvancedSearchModalProps) {
  const [data, setData] = useState<AdvancedSearchData>({
    entity: entityOptions[0],
    filter: filterOptions[0],
    displayName: '',
    companyName: '',
    lastName: '',
    status: 'All',
    address: '',
    notes: '',
    customerType: '',
    firstName: '',
    email: '',
    phone: '',
    pan: '',
  });

  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(data);
    onClose();
  };

  // shared modern input/select classes
  const formControlClass = `
    mt-1 w-full rounded-lg border border-gray-300 bg-white
    text-gray-800
    px-3 py-2
    hover:border-gray-400
    focus:outline-none focus:border-blue-600
    transition
  `;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">Search</span>
            <div className="relative">
              <select
                name="entity"
                value={data.entity}
                onChange={handleChange}
                className={`${formControlClass} appearance-none pr-8`}
              >
                {entityOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">Filter</span>
            <div className="relative">
              <select
                name="filter"
                value={data.filter}
                onChange={handleChange}
                className={`${formControlClass} appearance-none pr-8`}
              >
                {filterOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-4">
            {[
              { label: 'Display Name', name: 'displayName' },
              { label: 'Company Name', name: 'companyName' },
              { label: 'Last Name', name: 'lastName' },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block text-sm text-gray-600">{label}</label>
                <input
                  name={name}
                  value={(data as any)[name]}
                  onChange={handleChange}
                  className={formControlClass}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-600">Status</label>
              <select
                name="status"
                value={data.status}
                onChange={handleChange}
                className={`${formControlClass} appearance-none`}
              >
                {['All', 'Active', 'Inactive'].map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {['address', 'notes'].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-600">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  name={field}
                  value={(data as any)[field]}
                  onChange={handleChange}
                  className={formControlClass}
                />
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Customer Type</label>
              <select
                name="customerType"
                value={data.customerType}
                onChange={handleChange}
                className={`${formControlClass} appearance-none`}
              >
                <option value="">Select type</option>
                <option>Business</option>
                <option>Individual</option>
              </select>
            </div>

            {[
              { label: 'First Name', name: 'firstName', type: 'text' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Phone', name: 'phone', type: 'text' },
              { label: 'PAN', name: 'pan', type: 'text' },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-sm text-gray-600">{label}</label>
                <input
                  name={name}
                  type={type}
                  value={(data as any)[name]}
                  onChange={handleChange}
                  className={formControlClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 px-6 py-4 border-t">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
