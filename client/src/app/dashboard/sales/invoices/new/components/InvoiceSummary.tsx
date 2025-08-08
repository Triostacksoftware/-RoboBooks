import React from "react";

interface InvoiceSummaryProps {
  formData: {
    subTotal: number;
    discount: number;
    discountType: "percentage" | "amount";
    discountAmount: number;
    taxAmount: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    shippingCharges: number;
    adjustment: number;
    roundOff: number;
    total: number;
  };
  onFormDataChange: (data: any) => void;
  isIntraState: () => boolean;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  formData,
  onFormDataChange,
  isIntraState,
}) => {
  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value) || 0;
    const discountAmount =
      formData.discountType === "percentage"
        ? (formData.subTotal * discount) / 100
        : discount;

    const total =
      formData.subTotal -
      discountAmount +
      formData.taxAmount +
      formData.shippingCharges +
      formData.adjustment +
      formData.roundOff;

    onFormDataChange({
      ...formData,
      discount: discount,
      discountAmount: discountAmount,
      total: total,
    });
  };

  const handleAdjustmentChange = (value: string) => {
    const adjustment = parseFloat(value) || 0;
    const total =
      formData.subTotal -
      formData.discountAmount +
      formData.taxAmount +
      formData.shippingCharges +
      adjustment +
      formData.roundOff;

    onFormDataChange({
      ...formData,
      adjustment: adjustment,
      total: total,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Invoice Summary
      </h2>

      <div className="space-y-2">
        {/* Sub Total */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Sub Total</span>
          <span className="font-medium text-gray-900 text-sm">
            ₹{(formData.subTotal || 0).toFixed(2)}
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Discount</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              step="0.01"
              className="w-14 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.discount || 0}
              onChange={(e) => handleDiscountChange(e.target.value)}
            />
            <select
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.discountType}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  discountType: e.target.value as "percentage" | "amount",
                })
              }
            >
              <option value="percentage">%</option>
              <option value="amount">₹</option>
            </select>
            <span className="font-medium text-gray-900 min-w-[45px] text-right text-sm">
              ₹{(formData.discountAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="py-1.5 border-b border-gray-100">
          <div className="text-sm text-gray-600 mb-1.5">Tax</div>
          {isIntraState() ? (
            <div className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">CGST</span>
                <span className="text-gray-700">
                  ₹{(formData.cgstTotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">SGST</span>
                <span className="text-gray-700">
                  ₹{(formData.sgstTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">IGST</span>
              <span className="text-gray-700">
                ₹{(formData.igstTotal || 0).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-gray-100">
            <span className="text-sm text-gray-600">Total Tax</span>
            <span className="font-medium text-gray-900 text-sm">
              ₹{(formData.taxAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Shipping Charges */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Shipping</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              step="0.01"
              className="w-18 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.shippingCharges || 0}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  shippingCharges: parseFloat(e.target.value) || 0,
                })
              }
            />
            <span className="text-sm text-gray-500">₹</span>
          </div>
        </div>

        {/* Adjustment */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Adjustment</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              step="0.01"
              className="w-18 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.adjustment || 0}
              onChange={(e) => handleAdjustmentChange(e.target.value)}
            />
            <span className="text-sm text-gray-500">₹</span>
          </div>
        </div>

        {/* Round Off */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Round Off</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              step="0.01"
              className="w-18 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.roundOff || 0}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  roundOff: parseFloat(e.target.value) || 0,
                })
              }
            />
            <span className="text-sm text-gray-500">₹</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-2 border-t-2 border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-gray-900">
            ₹{(formData.total || 0).toFixed(2)}
          </span>
        </div>

        {/* Place of Supply Info */}
        <div className="mt-2 p-1.5 bg-blue-50 rounded text-xs">
          <div className="text-blue-900 font-medium mb-0.5">
            Place of Supply
          </div>
          <div className="text-blue-700">
            {isIntraState() ? (
              <span>Intra-state: CGST + SGST applied</span>
            ) : (
              <span>Inter-state: IGST applied</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
