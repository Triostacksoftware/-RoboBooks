'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { customerService, Customer } from '../services/customerService';

interface CustomerSelectorProps {
  value: string;
  onChange: (customerId: string, customer?: Customer) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search customers...",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  // Set selected customer when value changes
  useEffect(() => {
    if (value && customers.length > 0) {
      const customer = customers.find(c => c._id === value);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [value, customers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getActiveCustomers();
      
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        setError('Failed to load customers');
      }
    } catch (err) {
      setError('Error loading customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onChange(customer._id, customer);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    onChange('', undefined);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getDisplayText = (customer: Customer) => {
    if (customer.customerType === 'Business' && customer.companyName) {
      return `${customer.companyName} (${customer.email})`;
    }
    return `${customer.firstName} ${customer.lastName} (${customer.email})`;
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Selected Customer Display */}
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {getDisplayText(selectedCustomer)}
            </div>
            <div className="text-xs text-gray-500">
              {selectedCustomer.customerType} • {selectedCustomer.currency}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Placeholder Button */
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <span className="text-gray-500">{placeholder}</span>
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search customers..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading customers...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={loadCustomers}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Retry
                </button>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No customers found' : 'No customers available'}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  key={customer._id}
                  type="button"
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {customer.displayName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {customer.email}
                      </div>
                      {customer.customerType === 'Business' && customer.companyName && (
                        <div className="text-xs text-gray-400 truncate">
                          {customer.companyName}
                        </div>
                      )}
                    </div>
                    <div className="ml-2 text-xs text-gray-400">
                      {customer.customerType}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
