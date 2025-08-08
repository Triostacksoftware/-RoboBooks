import React from "react";
import {
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

type TaxMode = "GST" | "IGST" | "NON_TAXABLE" | "NO_GST" | "EXPORT";

interface InvoiceItem {
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
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onUpdateItem: (id: number, field: string, value: string | number) => void;
  isIntraState: () => boolean;
  companySettings: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
    state: string;
    website: string;
  };
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  isIntraState,
  companySettings,
}) => {
  // Function to get the appropriate tax mode based on intra/inter-state
  const getAppropriateTaxMode = (currentMode: TaxMode): TaxMode => {
    if (currentMode === "GST" || currentMode === "IGST") {
      return isIntraState() ? "GST" : "IGST";
    }
    return currentMode;
  };

  // Function to get tax mode display text
  const getTaxModeDisplayText = (mode: TaxMode): string => {
    switch (mode) {
      case "GST":
        return "GST";
      case "IGST":
        return "IGST";
      case "NON_TAXABLE":
        return "Non-Tax";
      case "NO_GST":
        return "No GST";
      case "EXPORT":
        return "Export";
      default:
        return "GST";
    }
  };

  const getTaxDisplay = (item: InvoiceItem) => {
    const effectiveTaxMode = getAppropriateTaxMode(item.taxMode);

    if (effectiveTaxMode === "GST") {
      return (
        <div className="text-xs text-gray-600">
          <div>CGST: ₹{item.cgst?.toFixed(2)}</div>
          <div>SGST: ₹{item.sgst?.toFixed(2)}</div>
        </div>
      );
    } else if (effectiveTaxMode === "IGST") {
      return (
        <div className="text-xs text-gray-600">
          IGST: ₹{item.igst?.toFixed(2)}
        </div>
      );
    } else if (effectiveTaxMode === "EXPORT") {
      return (
        <div className="text-xs text-green-600">
          <div>Export (0% GST)</div>
          {item.taxRemark && (
            <div className="text-gray-500 italic">{item.taxRemark}</div>
          )}
        </div>
      );
    } else if (effectiveTaxMode === "NON_TAXABLE") {
      return (
        <div className="text-xs text-amber-600">
          <div>No Tax</div>
          {item.taxRemark && (
            <div className="text-gray-500 italic">{item.taxRemark}</div>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-xs text-amber-600">
          <div>No GST</div>
          {item.taxRemark && (
            <div className="text-gray-500 italic">{item.taxRemark}</div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-sm font-semibold text-gray-900">
          Items & Services
        </h2>
        <button
          onClick={onAddItem}
          className="flex items-center px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Details
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax & Remarks
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Type or click to select an item"
                    className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    value={item.details}
                    onChange={(e) =>
                      onUpdateItem(item.id, "details", e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-1">
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem(
                          item.id,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <select
                      className="px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      value={item.unit}
                      onChange={(e) =>
                        onUpdateItem(item.id, "unit", e.target.value)
                      }
                    >
                      <option value="pcs">pcs</option>
                      <option value="hrs">hrs</option>
                      <option value="days">days</option>
                      <option value="kg">kg</option>
                      <option value="m">m</option>
                    </select>
                  </div>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    value={item.rate}
                    onChange={(e) =>
                      onUpdateItem(
                        item.id,
                        "rate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </td>
                <td className="px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600">
                      ₹{item.amount?.toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1">
                  <div className="flex space-x-1">
                    <select
                      className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none"
                      value={getAppropriateTaxMode(item.taxMode)}
                      onChange={(e) => {
                        const newMode = e.target.value as TaxMode;
                        // If user selects GST/IGST, automatically apply the appropriate one based on state
                        const finalMode =
                          newMode === "GST" || newMode === "IGST"
                            ? isIntraState()
                              ? "GST"
                              : "IGST"
                            : newMode;
                        onUpdateItem(item.id, "taxMode", finalMode);
                      }}
                    >
                      <option value={isIntraState() ? "GST" : "IGST"}>
                        {isIntraState() ? "GST" : "IGST"}
                      </option>
                      <option value="NON_TAXABLE">No Tax</option>
                      <option value="NO_GST">No GST</option>
                      <option value="EXPORT">Export</option>
                    </select>
                    {(getAppropriateTaxMode(item.taxMode) === "GST" ||
                      getAppropriateTaxMode(item.taxMode) === "IGST") && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="18"
                        className="w-10 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        value={item.taxRate}
                        onChange={(e) =>
                          onUpdateItem(
                            item.id,
                            "taxRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    )}
                  </div>
                  {/* Tax Remarks */}
                  {(getAppropriateTaxMode(item.taxMode) === "NON_TAXABLE" ||
                    getAppropriateTaxMode(item.taxMode) === "NO_GST" ||
                    getAppropriateTaxMode(item.taxMode) === "EXPORT") && (
                    <div className="mt-1">
                      <input
                        type="text"
                        placeholder={
                          getAppropriateTaxMode(item.taxMode) === "EXPORT"
                            ? "Export reason"
                            : getAppropriateTaxMode(item.taxMode) ===
                              "NON_TAXABLE"
                            ? "No tax reason"
                            : "No GST reason"
                        }
                        className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        value={item.taxRemark || ""}
                        onChange={(e) =>
                          onUpdateItem(item.id, "taxRemark", e.target.value)
                        }
                      />
                    </div>
                  )}
                </td>
                <td className="px-2 py-1">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-0.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    disabled={items.length === 1}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsTable;
