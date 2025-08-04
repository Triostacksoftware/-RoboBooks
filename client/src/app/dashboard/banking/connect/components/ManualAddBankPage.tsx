"use client";

import { useEffect, useRef, useState } from "react";

export default function ManualAddBankPage() {
  const [form, setForm] = useState({
    type: "bank",
    accountName: "",
    accountCode: "",
    currency: "INR",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    description: "",
    isPrimary: false,
  });

  const accountNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    accountNameRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;
    if (type === "checkbox" && "checked" in e.target) {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", form);
    alert("Account saved successfully!");
  };

  const inputUnderline =
    "w-full border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 rounded-none px-0 py-2";

  return (
    <div className="w-full bg-white p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">
        Add Bank or Credit Card
      </h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Account Type */}
        <div className="flex items-center gap-6">
          <label className="text-sm font-medium text-red-600">
            Select Account Type*
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="bank"
              checked={form.type === "bank"}
              onChange={handleChange}
            />
            <span>Bank</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="credit"
              checked={form.type === "credit"}
              onChange={handleChange}
            />
            <span>Credit Card</span>
          </label>
        </div>

        {/* Account Name */}
        <div>
          <label className="text-red-600 text-sm font-medium">
            Account Name*
          </label>
          <input
            ref={accountNameRef}
            required
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            className={inputUnderline}
          />
        </div>

        {/* Account Code */}
        <div>
          <label className="text-sm font-medium">Account Code</label>
          <input
            name="accountCode"
            value={form.accountCode}
            onChange={handleChange}
            className={inputUnderline}
          />
        </div>

        {/* Currency */}
        <div>
          <label className="text-red-600 text-sm font-medium">Currency*</label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className={inputUnderline}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="text-sm font-medium">Account Number</label>
          <input
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            className={inputUnderline}
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="text-sm font-medium">Bank Name</label>
          <input
            name="bankName"
            value={form.bankName}
            onChange={handleChange}
            className={inputUnderline}
          />
        </div>

        {/* IFSC */}
        <div>
          <label className="text-sm font-medium">IFSC</label>
          <input
            name="ifsc"
            value={form.ifsc}
            onChange={handleChange}
            className={inputUnderline}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            placeholder="Max. 500 characters"
            className={`${inputUnderline} resize-none`}
          />
        </div>

        {/* Primary Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPrimary"
            checked={form.isPrimary}
            onChange={handleChange}
            className="cursor-pointer"
          />
          <label className="text-sm">Make this primary</label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
