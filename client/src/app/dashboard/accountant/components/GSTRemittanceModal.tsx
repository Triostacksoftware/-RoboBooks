"use client";

import React, { useState } from "react";
import { X, DollarSign, Calendar, Building2 } from "lucide-react";
import { useToast } from "../../../../contexts/ToastContext";

interface GSTRemittanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemittanceRecorded: () => void;
}

const GSTRemittanceModal: React.FC<GSTRemittanceModalProps> = ({
  isOpen,
  onClose,
  onRemittanceRecorded
}) => {
  const [remittedAmount, setRemittedAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [remittanceDate, setRemittanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (remittedAmount <= 0) {
      showToast('Remittance amount must be greater than 0', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounting-reports/gst-remittance`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            remittedAmount,
            paymentMethod,
            remittanceDate,
            reference
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to record GST remittance');
      }

      showToast('GST remittance recorded successfully', 'success');
      onRemittanceRecorded();
      onClose();
    } catch (error) {
      console.error('Error recording GST remittance:', error);
      showToast('Failed to record GST remittance', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            GST Remittance
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Amount Remitted *
            </label>
            <input
              type="number"
              step="0.01"
              value={remittedAmount}
              onChange={(e) => setRemittedAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bank">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remittance Date *
            </label>
            <input
              type="date"
              value={remittanceDate}
              onChange={(e) => setRemittanceDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="GST challan number, transaction ID, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Record Remittance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GSTRemittanceModal;
