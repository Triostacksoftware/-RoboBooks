import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Select from "react-select";
import { Customer } from "@/services/customerService";

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface CustomerDetailsProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  searchTerm: string;
  showCustomerDropdown: boolean;
  onCustomerSelect: (customer: Customer) => void;
  onSearchChange: (value: string) => void;
  onDropdownToggle: (show: boolean) => void;
  onPlaceOfSupplyChange?: (state: string) => void;
  companyState?: string;
  formData: {
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
  const [showBillingPopup, setShowBillingPopup] = useState(false);
  const [showShippingPopup, setShowShippingPopup] = useState(false);
  const [billingAddress, setBillingAddress] = useState<AddressFormData>({
    street: formData.billingAddress?.street || "",
    city: formData.billingAddress?.city || "",
    state: formData.billingAddress?.state || "",
    country: formData.billingAddress?.country || "India",
    zipCode: formData.billingAddress?.zipCode || "",
  });
  const [shippingAddress, setShippingAddress] = useState<AddressFormData>({
    street: formData.shippingAddress?.street || "",
    city: formData.shippingAddress?.city || "",
    state: formData.shippingAddress?.state || "",
    country: formData.shippingAddress?.country || "India",
    zipCode: formData.shippingAddress?.zipCode || "",
  });

  // Convert customers to react-select options
  const customerOptions = customers.map((customer) => ({
    value: customer._id,
    label: `${customer.firstName} ${customer.lastName}`,
    customer: customer,
  }));

  // Find selected option
  const selectedOption = selectedCustomer
    ? customerOptions.find((option) => option.value === selectedCustomer._id)
    : null;

  const handleAddressSave = (type: "billing" | "shipping") => {
    if (type === "billing") {
      onFormDataChange({
        billingAddress: billingAddress,
      });
      setShowBillingPopup(false);
    } else {
      onFormDataChange({
        shippingAddress: shippingAddress,
      });
      setShowShippingPopup(false);
    }
  };

  const handleUseSameAddress = (type: "billing" | "shipping") => {
    if (type === "billing") {
      setBillingAddress(shippingAddress);
      onFormDataChange({
        billingAddress: shippingAddress,
      });
    } else {
      setShippingAddress(billingAddress);
      onFormDataChange({
        shippingAddress: billingAddress,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <h2 className="text-sm font-semibold text-gray-900 mb-2">
        Customer Details
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Customer Selection - Left Side */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Customer Name*
          </label>
          <Select
            value={selectedOption}
            onChange={(option) => {
              if (option?.customer) {
                onCustomerSelect(option.customer);
              }
            }}
            options={customerOptions}
            placeholder="Search customers..."
            isClearable
            isSearchable
            className="text-xs"
            styles={{
              control: (provided) => ({
                ...provided,
                minHeight: "32px",
                fontSize: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                boxShadow: "none",
                backgroundColor: "white",
                "&:hover": {
                  border: "1px solid #d1d5db",
                },
                "&:focus-within": {
                  border: "1px solid #3b82f6",
                  boxShadow: "0 0 0 1px #3b82f6",
                },
              }),
              menu: (provided) => ({
                ...provided,
                fontSize: "12px",
                zIndex: 9999,
              }),
              option: (provided, state) => ({
                ...provided,
                fontSize: "12px",
                padding: "6px 12px",
                backgroundColor: state.isSelected
                  ? "#3b82f6"
                  : state.isFocused
                  ? "#f3f4f6"
                  : "white",
                color: state.isSelected ? "white" : "#374151",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: state.isSelected ? "#3b82f6" : "#f3f4f6",
                },
              }),
              singleValue: (provided) => ({
                ...provided,
                fontSize: "12px",
                color: "#374151",
              }),
              input: (provided) => ({
                ...provided,
                fontSize: "12px",
                color: "#374151",
              }),
              placeholder: (provided) => ({
                ...provided,
                fontSize: "12px",
                color: "#9ca3af",
              }),
              valueContainer: (provided) => ({
                ...provided,
                padding: "2px 8px",
              }),
              indicatorsContainer: (provided) => ({
                ...provided,
                height: "28px",
              }),
              indicatorSeparator: (provided) => ({
                ...provided,
                display: "none",
              }),
              clearIndicator: (provided) => ({
                ...provided,
                padding: "2px",
                cursor: "pointer",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
                padding: "2px",
                cursor: "pointer",
              }),
            }}
          />

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <div className="mt-2 p-1.5 bg-gray-50 rounded-lg">
              <div className="text-xs">
                <h3 className="font-medium text-gray-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h3>
                <p className="text-gray-600">{selectedCustomer.email}</p>
                            {(selectedCustomer.workPhone || selectedCustomer.mobile) && (
              <p className="text-gray-600">{selectedCustomer.workPhone || selectedCustomer.mobile}</p>
            )}
              </div>
            </div>
          )}
        </div>

        {/* Address Sections - Right Side */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Billing Address */}
            <div className="border rounded-lg p-1.5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-gray-900">
                  Billing Address
                </h3>
                <button
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setShowBillingPopup(true)}
                >
                  + Edit
                </button>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                {formData.billingAddress?.street && (
                  <p>{formData.billingAddress.street}</p>
                )}
                {formData.billingAddress?.city && (
                  <p>
                    {formData.billingAddress.city}
                    {formData.billingAddress?.state &&
                      `, ${formData.billingAddress.state}`}
                    {formData.billingAddress?.zipCode &&
                      ` ${formData.billingAddress.zipCode}`}
                  </p>
                )}
                {formData.billingAddress?.country && (
                  <p>{formData.billingAddress.country}</p>
                )}
                {!formData.billingAddress?.street && (
                  <p className="text-gray-400 text-xs">
                    No billing address set
                  </p>
                )}
              </div>
              <button
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => handleUseSameAddress("billing")}
              >
                Use Shipping
              </button>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-1.5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-gray-900">
                  Shipping Address
                </h3>
                <button
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setShowShippingPopup(true)}
                >
                  + Edit
                </button>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                {formData.shippingAddress?.street && (
                  <p>{formData.shippingAddress.street}</p>
                )}
                {formData.shippingAddress?.city && (
                  <p>
                    {formData.shippingAddress.city}
                    {formData.shippingAddress?.state &&
                      `, ${formData.shippingAddress.state}`}
                    {formData.shippingAddress?.zipCode &&
                      ` ${formData.shippingAddress.zipCode}`}
                  </p>
                )}
                {formData.shippingAddress?.country && (
                  <p>{formData.shippingAddress.country}</p>
                )}
                {!formData.shippingAddress?.street && (
                  <p className="text-gray-400 text-xs">
                    No shipping address set
                  </p>
                )}
              </div>
              <button
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => handleUseSameAddress("shipping")}
              >
                Use Billing
              </button>
            </div>
          </div>

          {/* Origin of Supply */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Origin of Supply
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md bg-blue-50 text-blue-800 font-medium text-sm cursor-not-allowed"
              value={companyState || "Karnataka"}
              readOnly
              disabled
              title="Origin of Supply is the company's office location (unchangeable)"
              placeholder="Office Location"
            />
            <p className="text-xs text-blue-600 mt-1 font-medium">
              📍 Company&#39;s office location - Origin of all goods dispatch
            </p>
          </div>
        </div>
      </div>

      {/* Address Edit Popups */}
      {showBillingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-2 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Edit Billing Address
              </h3>
              <button
                onClick={() => setShowBillingPopup(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Street
                </label>
                <input
                  type="text"
                  value={billingAddress.street}
                  onChange={(e) =>
                    setBillingAddress({
                      ...billingAddress,
                      street: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={billingAddress.state}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        state: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={billingAddress.zipCode}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        zipCode: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Country
                </label>
                <input
                  type="text"
                  value={billingAddress.country}
                  onChange={(e) =>
                    setBillingAddress({
                      ...billingAddress,
                      country: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-1 mt-2">
              <button
                onClick={() => setShowBillingPopup(false)}
                className="px-2 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddressSave("billing")}
                className="px-2 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showShippingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-2 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Edit Shipping Address
              </h3>
              <button
                onClick={() => setShowShippingPopup(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Street
                </label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      street: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        state: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        zipCode: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Country
                </label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      country: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-1 mt-2">
              <button
                onClick={() => setShowShippingPopup(false)}
                className="px-2 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddressSave("shipping")}
                className="px-2 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
