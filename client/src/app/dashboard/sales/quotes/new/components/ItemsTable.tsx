"use client";

import React from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

type TaxMode = "GST" | "IGST" | "NON_TAXABLE" | "NO_GST" | "EXPORT";

interface QuoteItem {
  id: number;
  itemId: string;
  details: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxMode: TaxMode;
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxRemark: string;
}

interface ItemsTableProps {
  items: QuoteItem[];
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onUpdateItem: (id: number, field: string, value: string | number) => void;
  isIntraState: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  isIntraState,
}) => {
  const taxModeOptions = [
    { value: "GST", label: "GST" },
    { value: "IGST", label: "IGST" },
    { value: "NON_TAXABLE", label: "Non-Taxable" },
    { value: "NO_GST", label: "No GST" },
    { value: "EXPORT", label: "Export" },
  ];

  const taxRateOptions = [
    { value: 0, label: "0%" },
    { value: 5, label: "5%" },
    { value: 12, label: "12%" },
    { value: 18, label: "18%" },
    { value: 28, label: "28%" },
  ];

  const unitOptions = [
    "pcs",
    "kg",
    "g",
    "l",
    "ml",
    "m",
    "cm",
    "sqft",
    "sqm",
    "hour",
    "day",
    "month",
    "year",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Items</h2>
        <button
          onClick={onAddItem}
          className="flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Item
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Description
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Qty
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Unit
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Rate
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Amount
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Tax Mode
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Tax Rate
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Tax Amount
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2 px-1">
                  <input
                    type="text"
                    value={item.details}
                    onChange={(e) =>
                      onUpdateItem(item.id, "details", e.target.value)
                    }
                    placeholder="Item name"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      onUpdateItem(item.id, "description", e.target.value)
                    }
                    placeholder="Description"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateItem(item.id, "quantity", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-1">
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      onUpdateItem(item.id, "unit", e.target.value)
                    }
                    className="w-20 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      onUpdateItem(item.id, "rate", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      onUpdateItem(item.id, "amount", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="py-2 px-1">
                  <select
                    value={item.taxMode}
                    onChange={(e) =>
                      onUpdateItem(item.id, "taxMode", e.target.value as TaxMode)
                    }
                    className="w-24 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {taxModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-1">
                  <select
                    value={item.taxRate}
                    onChange={(e) =>
                      onUpdateItem(item.id, "taxRate", Number(e.target.value))
                    }
                    className="w-16 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {taxRateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-1">
                  <span className="text-xs text-gray-600">
                    ₹{item.taxAmount.toFixed(2)}
                  </span>
                </td>
                <td className="py-2 px-1">
                  {items.length > 1 && (
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GST Distribution Info */}
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs text-blue-800">
          <div className="font-medium mb-1">GST Distribution:</div>
          <div className="text-blue-700">
            {isIntraState ? (
              <>
                <span className="font-medium">Same State:</span> CGST + SGST will be
                applied (divided equally)
              </>
            ) : (
              <>
                <span className="font-medium">Different State:</span> IGST will be
                applied (single rate)
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;
