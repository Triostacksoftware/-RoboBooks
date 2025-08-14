import React from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ItemSelector from "./ItemSelector";

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
  onItemSelect: (
    id: number,
    itemId: string,
    itemDetails: {
      name?: string;
      sku?: string;
      sellingPrice?: number;
      unit?: string;
      description?: string;
      category?: string;
      brand?: string;
      hsnCode?: string;
      sacCode?: string;
      gstRate?: number;
    }
  ) => void;
  isIntraState: () => boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onItemSelect,
  isIntraState,
}) => {
  // Function to get the appropriate tax mode based on intra/inter-state
  const getAppropriateTaxMode = (currentMode: TaxMode): TaxMode => {
    if (currentMode === "GST" || currentMode === "IGST") {
      return isIntraState() ? "GST" : "IGST";
    }
    return currentMode;
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
              <tr
                key={item.id}
                className="hover:bg-gray-50 relative"
                style={{ zIndex: 10 }}
              >
                <td className="px-2 py-1 relative" style={{ zIndex: 10 }}>
                  <ItemSelector
                    value={item.itemId}
                    onChange={(itemId, itemDetails) => {
                      onItemSelect(item.id, itemId, itemDetails);
                    }}
                    placeholder="Type or click to select an item"
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
                      className="w-20 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none"
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
                      <select
                        className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        value={item.taxRate}
                        onChange={(e) =>
                          onUpdateItem(
                            item.id,
                            "taxRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
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
