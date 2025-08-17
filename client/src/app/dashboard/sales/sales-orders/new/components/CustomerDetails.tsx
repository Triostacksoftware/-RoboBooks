/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Select from "react-select";
import { indianStates } from "@/utils/indianStates";
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
  onCustomerSelect: (customer: Customer | null) => void;
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
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [lastPlaceOfSupplyState, setLastPlaceOfSupplyState] =
    useState<string>("");
  const [showPlaceOfSupplyDropdown, setShowPlaceOfSupplyDropdown] =
    useState(false);
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

  // Update local state when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      // Update billing address from customer data immediately
      const newBillingAddress: AddressFormData = {
        street: selectedCustomer.billingAddress?.street || "",
        city: selectedCustomer.billingAddress?.city || "",
        state: selectedCustomer.billingAddress?.state || "",
        country: selectedCustomer.billingAddress?.country || "India",
        zipCode: selectedCustomer.billingAddress?.zipCode || "",
      };
      setBillingAddress(newBillingAddress);

      // Update shipping address from customer data immediately
      const newShippingAddress: AddressFormData = {
        street: selectedCustomer.shippingAddress?.street || "",
        city: selectedCustomer.shippingAddress?.city || "",
        state: selectedCustomer.shippingAddress?.state || "",
        country: selectedCustomer.shippingAddress?.country || "India",
        zipCode: selectedCustomer.shippingAddress?.zipCode || "",
      };
      setShippingAddress(newShippingAddress);

      // Update form data with customer addresses
      onFormDataChange({
        billingAddress: newBillingAddress,
        shippingAddress: newShippingAddress,
        placeOfSupplyState:
          newShippingAddress.state || companyState || "Karnataka",
      });

      // Trigger place of supply change callback only if state has actually changed
      if (
        onPlaceOfSupplyChange &&
        newShippingAddress.state &&
        newShippingAddress.state !== lastPlaceOfSupplyState
      ) {
        setLastPlaceOfSupplyState(newShippingAddress.state);
        onPlaceOfSupplyChange(newShippingAddress.state);
      }

      // Show success message if addresses were loaded
      if (newBillingAddress.street || newShippingAddress.street) {
        setAddressesLoaded(true);
        console.log(
          "Addresses loaded successfully for customer:",
          selectedCustomer.firstName
        );
      }
    } else {
      // Reset addresses when no customer is selected
      setBillingAddress({
        street: "",
        city: "",
        state: "",
        country: "India",
        zipCode: "",
      });
      setShippingAddress({
        street: "",
        city: "",
        state: "",
        country: "India",
        zipCode: "",
      });
      setAddressesLoaded(false);
      setLastPlaceOfSupplyState(""); // Reset place of supply state
    }
  }, [selectedCustomer, companyState, onFormDataChange, onPlaceOfSupplyChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".place-of-supply-dropdown")) {
        setShowPlaceOfSupplyDropdown(false);
      }
    };

    if (showPlaceOfSupplyDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPlaceOfSupplyDropdown]);

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
        placeOfSupplyState:
          shippingAddress.state || companyState || "Karnataka",
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
        placeOfSupplyState: billingAddress.state || companyState || "Karnataka",
      });
    }
  };

  // Helper function to format address for display
  const formatAddress = (address: AddressFormData | undefined) => {
    if (!address || !address.street) {
      return "No address set";
    }

    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  // Helper function to check if address is complete
  const isAddressComplete = (address: AddressFormData | undefined) => {
    return address && address.street && address.city && address.state;
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
              } else {
                // When X is clicked (option is null), clear the customer
                onCustomerSelect(null);
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
                zIndex: 1000,
                className: "dropdown-menu",
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
            <div className="mt-2 p-1.5 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-green-900">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <span className="text-green-600 text-xs">✓ Selected</span>
                </div>
                <p className="text-green-700">{selectedCustomer.email}</p>
                {(selectedCustomer.workPhone || selectedCustomer.mobile) && (
                  <p className="text-green-700">
                    {selectedCustomer.workPhone || selectedCustomer.mobile}
                  </p>
                )}
                <div className="mt-1 pt-1 border-t border-green-200">
                  <p className="text-green-600 text-xs">
                    📍 Addresses loaded automatically
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Address Sections - Right Side */}
        {selectedCustomer ? (
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
                  {isAddressComplete(billingAddress) ? (
                    <div>
                      {addressesLoaded && (
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-green-600 text-xs">✓</span>
                          <span className="text-green-600 text-xs">
                            Loaded from customer
                          </span>
                        </div>
                      )}
                      <p className="font-medium">{billingAddress.street}</p>
                      <p>
                        {billingAddress.city}
                        {billingAddress.state && `, ${billingAddress.state}`}
                        {billingAddress.zipCode && ` ${billingAddress.zipCode}`}
                      </p>
                      <p>{billingAddress.country}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">
                        No billing address set
                      </p>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        onClick={() => setShowBillingPopup(true)}
                      >
                        + Add Billing Address
                      </button>
                    </div>
                  )}
                </div>
                {isAddressComplete(shippingAddress) && (
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleUseSameAddress("billing")}
                  >
                    Use Shipping
                  </button>
                )}
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
                  {isAddressComplete(shippingAddress) ? (
                    <div>
                      {addressesLoaded && (
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-green-600 text-xs">✓</span>
                          <span className="text-green-600 text-xs">
                            Loaded from customer
                          </span>
                        </div>
                      )}
                      <p className="font-medium">{shippingAddress.street}</p>
                      <p>
                        {shippingAddress.city}
                        {shippingAddress.state && `, ${shippingAddress.state}`}
                        {shippingAddress.zipCode &&
                          ` ${shippingAddress.zipCode}`}
                      </p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">
                        No shipping address set
                      </p>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        onClick={() => setShowShippingPopup(true)}
                      >
                        + Add Shipping Address
                      </button>
                    </div>
                  )}
                </div>
                {isAddressComplete(billingAddress) && (
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleUseSameAddress("shipping")}
                  >
                    Use Billing
                  </button>
                )}
              </div>
            </div>

            {/* Place of Supply and Origin of Supply */}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Place of Supply */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Place of Supply
                  </label>
                  <div className="relative place-of-supply-dropdown">
                    <div
                      onClick={() =>
                        setShowPlaceOfSupplyDropdown(!showPlaceOfSupplyDropdown)
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white text-sm cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span
                        className={
                          formData.placeOfSupplyState
                            ? "text-gray-900"
                            : "text-gray-500"
                        }
                      >
                        {formData.placeOfSupplyState ||
                          "Choose from shipping or select state"}
                      </span>
                      <ChevronDownIcon className="h-3 w-3 text-gray-400" />
                    </div>

                    {showPlaceOfSupplyDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {/* Auto-set from shipping option */}
                        {formData.shippingAddress?.state && (
                          <div
                            className="px-3 py-2 text-sm text-green-600 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                            onClick={() => {
                              const shippingState =
                                formData.shippingAddress?.state;
                              if (shippingState) {
                                onFormDataChange({
                                  ...formData,
                                  placeOfSupplyState: shippingState,
                                });
                                if (onPlaceOfSupplyChange) {
                                  onPlaceOfSupplyChange(shippingState);
                                }
                              }
                              setShowPlaceOfSupplyDropdown(false);
                            }}
                          >
                            <div className="font-medium">
                              📍 Use Shipping Address State
                            </div>
                            <div className="text-xs text-green-500">
                              {formData.shippingAddress.state}
                            </div>
                          </div>
                        )}

                        {/* All Indian states */}
                        {indianStates.map((state) => (
                          <div
                            key={state}
                            className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              onFormDataChange({
                                ...formData,
                                placeOfSupplyState: state,
                              });
                              if (onPlaceOfSupplyChange) {
                                onPlaceOfSupplyChange(state);
                              }
                              setShowPlaceOfSupplyDropdown(false);
                            }}
                          >
                            {state}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    📍{" "}
                    {formData.placeOfSupplyState
                      ? `Selected: ${formData.placeOfSupplyState}`
                      : "Choose from shipping or select any state"}
                    {formData.placeOfSupplyState ===
                      formData.shippingAddress?.state && (
                      <span className="ml-1">✓ Auto-set</span>
                    )}
                  </p>
                </div>

                {/* Origin of Supply */}
                <div>
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
                    📍 Company&#39;s office location - Origin of all goods
                    dispatch
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Address Edit Popups */}
      {showBillingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center address-edit-popup">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center address-edit-popup">
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
