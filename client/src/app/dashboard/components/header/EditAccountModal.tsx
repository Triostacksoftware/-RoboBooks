"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { createPortal } from "react-dom";

interface EditAccountModalProps {
  open: boolean;
  onClose: () => void;
}

interface EditFormData {
  companyName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
}

export default function EditAccountModal({
  open,
  onClose,
}: EditAccountModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EditFormData>({
    companyName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user && open) {
      setFormData({
        companyName: user.companyName || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        state: user.state || "",
      });
    }
  }, [user, open]);

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to update user details
      // const response = await api('/api/auth/update-profile', {
      //   method: 'PUT',
      //   json: formData
      // });

      // Mock success for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to update account:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100vw);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Success Toast - Fixed to screen */}
      {showSuccess && (
        <div
          className="fixed top-4 left-4 bg-green-100 border border-green-200 rounded-lg p-3 flex items-center gap-2 shadow-lg z-[99999] max-w-sm"
          style={{
            animation: "slideInLeft 0.3s ease-out forwards",
          }}
        >
          <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="text-green-800 font-medium">
            Account Updated Successfully
          </span>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Account Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter country"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter state"
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.companyName.trim() ||
                  !formData.email.trim()
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
