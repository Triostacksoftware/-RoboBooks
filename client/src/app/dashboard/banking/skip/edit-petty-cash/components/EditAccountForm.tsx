'use client';

import React, { useState } from 'react';

export default function EditAccountForm() {
  const [form, setForm] = useState({
    name: 'Petty Cash',
    code: '',
    description: 'It is a small amount of cash that is used to pay your minor or casual',
  });
  const [touched, setTouched] = useState<{ name?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API
    setTimeout(() => {
      setSubmitting(false);
      alert('Saved!');
    }, 800);
  };

  const handleCancel = () => {
    // You can add your cancel logic here, like navigating back
    alert('Cancelled');
  };

  const nameError = touched.name && !form.name.trim();

  return (
    <div className="w-full min-h-screen bg-white px-2 py-2 md:px-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 mt-5">Edit Account</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Labels */}
          <div className="flex flex-col gap-6 w-full md:w-1/4">
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 text-gray-900 flex items-center"
            >
              <span className={nameError ? "text-red-600" : ""}>Account Name</span>
              <span className="text-red-600 ml-1 text-base">*</span>
            </label>
            <label
              htmlFor="code"
              className="block text-sm font-medium mb-1 text-gray-900"
            >
              Account Code
            </label>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1 text-gray-900"
            >
              Description
            </label>
          </div>
          {/* Inputs */}
          <div className="flex flex-col gap-4 w-full md:w-2/3">
            {/* Account Name */}
            <div>
              <input
                name="name"
                id="name"
                type="text"
                className={`block w-full border rounded px-3 py-1.5 text-sm bg-white outline-none transition
                  ${nameError ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-blue-500'}
                  `}
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoFocus
              />
              {nameError && (
                <div className="text-red-500 mt-1 text-xs">
                  Account Name is required.
                </div>
              )}
            </div>
            {/* Account Code */}
            <div>
              <input
                name="code"
                id="code"
                type="text"
                className="block w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500 transition"
                value={form.code}
                onChange={handleChange}
              />
            </div>
            {/* Description */}
            <div>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="block w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500 transition resize-vertical"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="mt-8 flex items-center gap-3 pl-0 md:pl-[160px]">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-1.5 rounded transition shadow disabled:opacity-60"
            disabled={submitting || !form.name.trim()}
          >
            Save
          </button>
          <button
            type="button"
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 text-sm font-semibold px-5 py-1.5 rounded transition"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
