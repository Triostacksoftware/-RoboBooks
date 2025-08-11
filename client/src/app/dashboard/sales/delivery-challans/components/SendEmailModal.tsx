'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: any) => void;
  deliveryChallan: any;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  onSend,
  deliveryChallan
}) => {
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && deliveryChallan) {
      // Prefill email data
      setEmailData({
        to: deliveryChallan.customerEmail || '',
        cc: '',
        subject: `Delivery Challan ${deliveryChallan.challanNo}`,
        message: `Dear Customer (ID: ${deliveryChallan.customerId}),

Please find attached the Delivery Challan ${deliveryChallan.challanNo} dated ${new Date(deliveryChallan.challanDate).toLocaleDateString()}.

Delivery Challan Details:
- Challan Number: ${deliveryChallan.challanNo}
- Reference: ${deliveryChallan.referenceNo || 'N/A'}
- Challan Type: ${deliveryChallan.challanType}
- Total Amount: ₹${deliveryChallan.total?.toFixed(2) || '0.00'}

Please review the attached document and let us know if you have any questions.

Best regards,
Your Company Name`
      });
    }
  }, [isOpen, deliveryChallan]);

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.to.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    if (!emailData.subject.trim()) {
      alert('Please enter a subject');
      return;
    }

    try {
      setLoading(true);
      await onSend(emailData);
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Send Delivery Challan</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="recipient@example.com"
                required
              />
            </div>

            {/* CC Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CC
              </label>
              <input
                type="email"
                value={emailData.cc}
                onChange={(e) => handleInputChange('cc', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cc@example.com (optional)"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={emailData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                placeholder="Email message"
              />
            </div>

            {/* Attachment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center">
                <PaperClipIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Delivery Challan PDF will be attached automatically
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    The system will generate and attach the PDF version of this delivery challan.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendEmailModal;
