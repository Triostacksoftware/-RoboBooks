"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import {
  XMarkIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Settings } from "lucide-react";

interface JournalEntry {
  id: number;
  account: string;
  description: string;
  contact: string;
  debit: number;
  credit: number;
}

interface Account {
  _id: string;
  name: string;
  type: string;
  code: string;
}

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface SelectOption {
  value: string;
  label: string;
  data?: any;
}

const NewManualJournalPage = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    journalDate: new Date().toISOString().split("T")[0],
    journalNumber: "1",
    reference: "",
    description: "",
    reportingMethod: "accrual_and_cash",
    currency: "INR",
    entries: [
      {
        id: 1,
        account: "",
        description: "",
        contact: "",
        debit: 0,
        credit: 0,
      } as JournalEntry,
      {
        id: 2,
        account: "",
        description: "",
        contact: "",
        debit: 0,
        credit: 0,
      } as JournalEntry,
    ],
  });

  // Calculate totals
  const totalDebit = formData.entries.reduce(
    (sum, entry) => sum + (entry.debit || 0),
    0
  );
  const totalCredit = formData.entries.reduce(
    (sum, entry) => sum + (entry.credit || 0),
    0
  );
  const difference = totalDebit - totalCredit;

  // Fetch accounts and contacts
  useEffect(() => {
    fetchAccounts();
    fetchContacts();
  }, []);

  const fetchAccounts = async () => {
    try {
      console.log("Fetching accounts...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        console.log("Raw accounts data:", result.data);
        
        // Clean the accounts data
        const cleanedAccounts = (result.data || []).filter((account: any) => 
          account && 
          account.name && 
          account.name.trim() !== "" && 
          !account.name.includes("Sub Total") &&
          !account.name.includes("Debits:") &&
          !account.name.includes("Credits:") &&
          !account.name.includes("Unknown Type")
        );
        
        console.log("Cleaned accounts:", cleanedAccounts);
        setAccounts(cleanedAccounts);
      } else {
        console.log("Failed to fetch accounts:", response.status);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setContacts(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const addNewRow = () => {
    const newId = Math.max(...formData.entries.map((e) => e.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          id: newId,
          account: "",
          description: "",
          contact: "",
          debit: 0,
          credit: 0,
        },
      ],
    }));
  };

  const removeRow = (id: number) => {
    if (formData.entries.length > 2) {
      setFormData((prev) => ({
        ...prev,
        entries: prev.entries.filter((entry) => entry.id !== id),
      }));
    }
  };

  const updateEntry = (
    id: number,
    field: keyof JournalEntry,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      }),
    }));
  };

  const handleSave = async (asDraft = false) => {
    try {
      setLoading(true);

      // Validate that debits equal credits
      if (Math.abs(difference) > 0.01) {
        alert(
          "Total debits must equal total credits. Current difference: " +
            difference.toFixed(2)
        );
        return;
      }

      // Validate that at least two entries have accounts
      const entriesWithAccounts = formData.entries.filter((entry) =>
        entry.account.trim()
      );
      if (entriesWithAccounts.length < 2) {
        alert("At least two entries must have accounts selected.");
        return;
      }

      const journalData = {
        journalDate: new Date(formData.journalDate),
        reference: formData.reference,
        description: formData.description,
        reportingMethod: formData.reportingMethod,
        currency: formData.currency,
        entries: formData.entries
          .filter((entry) => entry.account.trim()) // Only include entries with accounts
          .map((entry) => ({
            account: entry.account,
            description: entry.description,
            contact: entry.contact,
            debit: entry.debit || 0,
            credit: entry.credit || 0,
          })),
        status: asDraft ? "draft" : "posted",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/manual-journals`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(journalData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          asDraft
            ? "Journal saved as draft successfully!"
            : "Journal posted successfully!"
        );
        router.push("/dashboard/accountant/manual-journals");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Error saving journal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Convert accounts to react-select options
  const accountOptions: SelectOption[] = accounts
    .filter((account) => 
      account.name && 
      account.name.trim() !== "" && 
      !account.name.includes("Sub Total") &&
      !account.name.includes("Debits:") &&
      !account.name.includes("Credits:") &&
      !account.name.includes("Unknown Type")
    ) // Filter out empty names and malformed data
    .map((account) => ({
      value: account.name,
      label: `${account.name} (${account.code || "No Code"})`,
      data: account,
    }));

  // Convert contacts to react-select options
  const contactOptions: SelectOption[] = contacts.map((contact) => ({
    value: `${contact.firstName} ${contact.lastName}`,
    label: `${contact.firstName} ${contact.lastName} - ${contact.email}`,
    data: contact,
  }));

  // Add some dummy data for testing if no accounts/contacts are loaded
  const dummyAccountOptions: SelectOption[] = [
    {
      value: "Cash",
      label: "Cash (1001)",
      data: { name: "Cash", code: "1001", type: "asset" },
    },
    {
      value: "Bank Account",
      label: "Bank Account (1002)",
      data: { name: "Bank Account", code: "1002", type: "asset" },
    },
    {
      value: "Accounts Receivable",
      label: "Accounts Receivable (1100)",
      data: { name: "Accounts Receivable", code: "1100", type: "asset" },
    },
    {
      value: "Inventory",
      label: "Inventory (1200)",
      data: { name: "Inventory", code: "1200", type: "asset" },
    },
    {
      value: "Fixed Assets",
      label: "Fixed Assets (1500)",
      data: { name: "Fixed Assets", code: "1500", type: "asset" },
    },
    {
      value: "Accounts Payable",
      label: "Accounts Payable (2000)",
      data: { name: "Accounts Payable", code: "2000", type: "liability" },
    },
    {
      value: "Sales Revenue",
      label: "Sales Revenue (4000)",
      data: { name: "Sales Revenue", code: "4000", type: "revenue" },
    },
    {
      value: "Cost of Goods Sold",
      label: "Cost of Goods Sold (5000)",
      data: { name: "Cost of Goods Sold", code: "5000", type: "expense" },
    },
    {
      value: "Office Supplies",
      label: "Office Supplies (5100)",
      data: { name: "Office Supplies", code: "5100", type: "expense" },
    },
    {
      value: "Utilities",
      label: "Utilities (5200)",
      data: { name: "Utilities", code: "5200", type: "expense" },
    },
  ];

  const dummyContactOptions: SelectOption[] = [
    {
      value: "John Doe",
      label: "John Doe - john@example.com",
      data: { firstName: "John", lastName: "Doe", email: "john@example.com" },
    },
    {
      value: "Jane Smith",
      label: "Jane Smith - jane@example.com",
      data: { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    },
  ];

  // Use dummy data if no real data is loaded
  const finalAccountOptions =
    accountOptions.length > 0 ? accountOptions : dummyAccountOptions;
  const finalContactOptions =
    contactOptions.length > 0 ? contactOptions : dummyContactOptions;

  // Custom styles for react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#9ca3af",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#f3f4f6",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: "120px", // Reduced height to show only 3-4 items
      minWidth: "350px", // Increased minimum width
    }),
  };

  // Custom option component for accounts with settings icon
  const AccountOption = ({ data, innerProps }: any) => (
    <div
      {...innerProps}
      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="font-medium break-words">{data.label}</div>
        <div className="text-xs text-gray-500 break-words">
          {data.data?.code || "No Code"} - {data.data?.type || "Unknown Type"}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.open("/dashboard/accountant/chart-of-accounts", "_blank");
        }}
        className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
        title="Edit Account"
      >
        <Settings className="h-3 w-3" />
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                router.push("/dashboard/accountant/manual-journals")
              }
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                < Back to Manual Journals
            </button>
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">New Journal</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Posting..." : "Save and Post"}
            </button>
            <button
              onClick={() =>
                router.push("/dashboard/accountant/manual-journals")
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date*
                </label>
                <input
                  type="date"
                  value={formData.journalDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      journalDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Journal#*
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.journalNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        journalNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="ml-2 p-2 text-gray-400 hover:text-gray-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference#
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reference: e.target.value,
                    }))
                  }
                  placeholder="Enter reference number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes*
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Max. 500 characters"
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                Reporting Method
                <InformationCircleIcon className="h-4 w-4 ml-1 text-gray-400" />
              </label>
              <div className="flex flex-row space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="accrual_and_cash"
                    checked={formData.reportingMethod === "accrual_and_cash"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reportingMethod: e.target.value,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Accrual and Cash</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="accrual_only"
                    checked={formData.reportingMethod === "accrual_only"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reportingMethod: e.target.value,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Accrual Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cash_only"
                    checked={formData.reportingMethod === "cash_only"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reportingMethod: e.target.value,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Cash Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Journal Entries Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Journal Entries
            </h3>

            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                      ACCOUNT
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                      DESCRIPTION
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                      CONTACT ({formData.currency})
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                      DEBITS
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                      CREDITS
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.entries.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <Select
                          options={finalAccountOptions}
                          value={
                            entry.account
                              ? finalAccountOptions.find(
                                  (opt) => opt.value === entry.account
                                )
                              : null
                          }
                          onChange={(selectedOption: any) => {
                            updateEntry(
                              entry.id,
                              "account",
                              selectedOption?.value || ""
                            );
                          }}
                          placeholder="Select an account"
                          isClearable
                          isSearchable
                          components={{
                            Option: AccountOption,
                          }}
                          styles={customStyles}
                          className="min-w-[300px]"
                        />
                      </td>

                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) =>
                            updateEntry(entry.id, "description", e.target.value)
                          }
                          placeholder="Description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>

                      <td className="py-3 px-2">
                        <Select
                          options={finalContactOptions}
                          value={
                            entry.contact
                              ? finalContactOptions.find(
                                  (opt) => opt.value === entry.contact
                                )
                              : null
                          }
                          onChange={(selectedOption: any) => {
                            updateEntry(
                              entry.id,
                              "contact",
                              selectedOption?.value || ""
                            );
                          }}
                          placeholder="Select Contact"
                          isClearable
                          isSearchable
                          styles={customStyles}
                          className="min-w-[250px]"
                        />
                      </td>

                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.debit || ""}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "debit",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>

                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.credit || ""}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "credit",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>

                      <td className="py-3 px-2">
                        <button
                          onClick={() => removeRow(entry.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Remove row"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={addNewRow}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Row
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Sub Total
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Debits:</span>
                    <span className="font-medium">
                      ₹{totalDebit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Credits:</span>
                    <span className="font-medium">
                      ₹{totalCredit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Total (₹)
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Debits:</span>
                    <span className="font-medium">
                      ₹{totalDebit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Credits:</span>
                    <span className="font-medium">
                      ₹{totalCredit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Difference
                </h4>
                <div
                  className={`text-lg font-bold ${
                    Math.abs(difference) < 0.01
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{difference.toFixed(2)}
                </div>
                {Math.abs(difference) < 0.01 && (
                  <div className="text-xs text-green-600 mt-1">✓ Balanced</div>
                )}
                {Math.abs(difference) >= 0.01 && (
                  <div className="text-xs text-red-600 mt-1">✗ Unbalanced</div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attachments
            </h3>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload File
              <ChevronDownIcon className="h-4 w-4 ml-2" />
            </button>
            <p className="text-xs text-gray-500 mt-2">
              You can upload a maximum of 5 files, 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={loading || Math.abs(difference) >= 0.01}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Save and Post"}
            </button>
            <button
              onClick={() =>
                router.push("/dashboard/accountant/manual-journals")
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                Difference: ₹{difference.toFixed(2)}
              </span>
              {Math.abs(difference) < 0.01 && (
                <span className="ml-2 text-green-600">✓ Balanced</span>
              )}
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800 underline">
              Make Recurring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewManualJournalPage;
