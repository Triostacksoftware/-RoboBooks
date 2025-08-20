/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DeliveryChallanForm from "../components/DeliveryChallanForm";
import { useToast } from "../../../../../contexts/ToastContext";

const NewDeliveryChallanPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);

      // Add default values
      const data = {
        ...formData,
        status: "Draft",
        invoiceStatus: "Not Invoiced",
        fy: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        numberingSeries: "DC",
      };

      // API call will be handled in the form component
      showToast("Delivery Challan created successfully!", "success");
      router.push("/dashboard/sales/delivery-challans");
    } catch (error) {
      showToast("Failed to create delivery challan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/sales/delivery-challans");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                New Delivery Challan
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new delivery challan for goods movement
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                ← Back to Delivery Challans
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DeliveryChallanForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            mode="create"
          />
        </div>
      </div>
    </div>
  );
};

export default NewDeliveryChallanPage;
