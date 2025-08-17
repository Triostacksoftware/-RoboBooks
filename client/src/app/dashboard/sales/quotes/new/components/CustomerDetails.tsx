"use client";

import React, { useState } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

interface Customer {
  firstName: string;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  lastName: string;
  mobile?: string;
  workPhone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

interface CustomerDetailsProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  searchTerm: string;
  showCustomerDropdown: boolean;
  onCustomerSelect: (customer: Customer) => void;
  onSearchChange: (term: string) => void;
  onDropdownToggle: (show: boolean) => void;
  onPlaceOfSupplyChange: (state: string) => void;
  companyState: string;
  formData: {
    billingAddress: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    shippingAddress: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    placeOfSupplyState?: string;
  };
  onFormDataChange: (data: {
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    shippingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    placeOfSupplyState?: string;
  }) => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customers,
  selectedCustomer,
  searchTerm,
  showCustomerDropdown,
  onCustomerSelect,
  onSearchChange,
  onDropdownToggle,
  onPlaceOfSupplyChange,
  companyState,
  formData,
  onFormDataChange,
}) => {
  const [showBillingDetails, setShowBillingDetails] = useState(false);
  const [showShippingDetails, setShowShippingDetails] = useState(false);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaceOfSupplyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    onPlaceOfSupplyChange(selectedState);
    onFormDataChange({ placeOfSupplyState: selectedState });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Customer Details
      </h2>

      <div className="space-y-3">
        {/* Customer Selection */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Select Customer
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onDropdownToggle(true)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => onDropdownToggle(!showCustomerDropdown)}
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
            >
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Customer Dropdown */}
          {showCustomerDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer._id}
                    onClick={() => onCustomerSelect(customer)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    <div className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-gray-600 text-xs">{customer.email}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No customers found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Customer Info */}
        {selectedCustomer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <div className="font-medium text-green-900 text-sm">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </div>
                <div className="text-green-700 text-xs">
                  {selectedCustomer.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Place of Supply */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Place of Supply
          </label>
          <select
            value={formData.placeOfSupplyState || ""}
            onChange={handlePlaceOfSupplyChange}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Select State</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Delhi">Delhi</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            <option value="Ladakh">Ladakh</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
            <option value="Daman and Diu">Daman and Diu</option>
            <option value="Lakshadweep">Lakshadweep</option>
            <option value="Puducherry">Puducherry</option>
            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Company State: {companyState}
          </p>
        </div>

        {/* Billing Address */}
        <div>
          <button
            onClick={() => setShowBillingDetails(!showBillingDetails)}
            className="flex items-center text-xs font-medium text-gray-700 mb-2"
          >
            <ChevronDownIcon
              className={`h-3 w-3 mr-1 transition-transform ${
                showBillingDetails ? "rotate-180" : ""
              }`}
            />
            Billing Address
          </button>
          {showBillingDetails && (
            <div className="space-y-2 pl-4">
              <input
                type="text"
                placeholder="Street Address"
                value={formData.billingAddress.street || ""}
                onChange={(e) =>
                  onFormDataChange({
                    billingAddress: {
                      ...formData.billingAddress,
                      street: e.target.value,
                    },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.billingAddress.city || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      billingAddress: {
                        ...formData.billingAddress,
                        city: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.billingAddress.state || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      billingAddress: {
                        ...formData.billingAddress,
                        state: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.billingAddress.country || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      billingAddress: {
                        ...formData.billingAddress,
                        country: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={formData.billingAddress.zipCode || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      billingAddress: {
                        ...formData.billingAddress,
                        zipCode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Shipping Address */}
        <div>
          <button
            onClick={() => setShowShippingDetails(!showShippingDetails)}
            className="flex items-center text-xs font-medium text-gray-700 mb-2"
          >
            <ChevronDownIcon
              className={`h-3 w-3 mr-1 transition-transform ${
                showShippingDetails ? "rotate-180" : ""
              }`}
            />
            Shipping Address
          </button>
          {showShippingDetails && (
            <div className="space-y-2 pl-4">
              <input
                type="text"
                placeholder="Street Address"
                value={formData.shippingAddress.street || ""}
                onChange={(e) =>
                  onFormDataChange({
                    shippingAddress: {
                      ...formData.shippingAddress,
                      street: e.target.value,
                    },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.shippingAddress.city || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      shippingAddress: {
                        ...formData.shippingAddress,
                        city: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.shippingAddress.state || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      shippingAddress: {
                        ...formData.shippingAddress,
                        state: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.shippingAddress.country || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      shippingAddress: {
                        ...formData.shippingAddress,
                        country: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={formData.shippingAddress.zipCode || ""}
                  onChange={(e) =>
                    onFormDataChange({
                      shippingAddress: {
                        ...formData.shippingAddress,
                        zipCode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
