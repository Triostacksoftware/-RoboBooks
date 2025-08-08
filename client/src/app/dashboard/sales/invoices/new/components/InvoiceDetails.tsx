/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Cog6ToothIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface InvoiceDetailsProps {
  formData: {
    invoiceNumber: string;
    orderNumber: string;
    invoiceDate: string;
    terms: string;
    dueDate: string;
    salesperson: string;
    subject: string;
  };
  onFormDataChange: (data: any) => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  formData,
  onFormDataChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <h2 className="text-xs font-semibold text-gray-900 mb-1.5">
        Invoice Details
      </h2>

      <div className="space-y-1.5">
        {/* Row 1: Invoice Number, Order Number, Invoice Date */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Invoice Number*
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.invoiceNumber}
                className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-xs"
                readOnly
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <Cog6ToothIcon className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Order Number
            </label>
            <input
              type="text"
              placeholder="Enter order number"
              className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
              value={formData.orderNumber}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  orderNumber: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Invoice Date*
            </label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  invoiceDate: e.target.value,
                })
              }
              className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Payment Terms
            </label>
            <div className="relative">
              <select
                className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none text-xs"
                value={formData.terms}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    terms: e.target.value,
                  })
                }
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Payment Terms, Due Date, Salesperson */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  dueDate: e.target.value,
                })
              }
              className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Salesperson
            </label>
            <input
              type="text"
              placeholder="Enter salesperson name"
              className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
              value={formData.salesperson}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  salesperson: e.target.value,
                })
              }
            />
          </div>

          {/* Row 3: Subject (full width) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Subject
            </label>
            <input
              type="text"
              placeholder="Enter invoice subject"
              className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
              value={formData.subject}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  subject: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
