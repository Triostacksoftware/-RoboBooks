/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  CalendarIcon,
  ArrowPathIcon as RepeatIcon,
} from "@heroicons/react/24/outline";

interface RecurrenceSettingsProps {
  formData: {
    frequency: string;
    startDate: string;
    endDate: string;
    neverExpires: boolean;
  };
  onFormDataChange: (data: any) => void;
}

const RecurrenceSettings: React.FC<RecurrenceSettingsProps> = ({
  formData,
  onFormDataChange,
}) => {
  const handleInputChange = (field: string, value: string | boolean) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <h2 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center">
        <RepeatIcon className="h-3 w-3 mr-1" />
        Recurrence Settings
      </h2>

      <div className="space-y-1.5">
        {/* Row 1: Frequency and Start Date */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Repeat Every*
            </label>
            <div className="relative">
              <select
                className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none text-xs"
                value={formData.frequency}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <RepeatIcon className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Start On*
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <CalendarIcon className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: End Date and Never Expires */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Ends On
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                disabled={formData.neverExpires}
                className={`w-full px-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs ${
                  formData.neverExpires ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <CalendarIcon className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <label className="flex items-center text-xs text-gray-700">
              <input
                type="checkbox"
                checked={formData.neverExpires}
                onChange={(e) =>
                  handleInputChange("neverExpires", e.target.checked)
                }
                className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Never Expires
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-2 p-2 bg-blue-50 rounded-md">
          <div className="text-xs text-blue-800">
            <div className="font-medium">Recurrence Summary:</div>
            <div className="mt-1">
              This profile will generate invoices {formData.frequency} starting
              from{" "}
              {formData.startDate
                ? new Date(formData.startDate).toLocaleDateString()
                : "selected date"}
              {formData.neverExpires
                ? " and will continue indefinitely."
                : ` until ${
                    formData.endDate
                      ? new Date(formData.endDate).toLocaleDateString()
                      : "selected end date"
                  }.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurrenceSettings;
