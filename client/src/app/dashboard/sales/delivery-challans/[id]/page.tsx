/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "../../../../../contexts/ToastContext";
import DeliveryChallanDetail from "../components/DeliveryChallanDetail";
import DeliveryChallanPreview from "../components/DeliveryChallanPreview";
import { deliveryChallanService } from "../services/deliveryChallanService";

interface DeliveryChallan {
  _id: string;
  challanNo: string;
  challanDate: string;
  referenceNo?: string;
  customerId:
    | string
    | {
        _id: string;
        displayName: string;
        email: string;
        mobile?: string;
        workPhone?: string;
        billingAddress?: any;
        shippingAddress?: any;
      };
  customerName?: string;
  challanType: string;
  placeOfSupply: string;
  status: string;
  invoiceStatus: string;
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  adjustment: number;
  total: number;
  notes?: string;
  terms?: string;
  items: Array<{
    itemId: string;
    itemName: string;
    hsn: string;
    quantity: number;
    uom: string;
    rate: number;
    amount: number;
    notes?: string;
  }>;
  shipTo?: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  dispatchFrom?: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  audit: Array<{
    status: string;
    timestamp: string;
    userId: string;
    notes?: string;
  }>;
  emailLog: Array<{
    to: string;
    cc?: string;
    subject: string;
    message: string;
    messageId: string;
    status: string;
    timestamp: string;
  }>;
}

const DeliveryChallanDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [deliveryChallan, setDeliveryChallan] =
    useState<DeliveryChallan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadDeliveryChallan();
    }
  }, [params.id]);

  const loadDeliveryChallan = async () => {
    try {
      setLoading(true);
      const response = await deliveryChallanService.getById(
        params.id as string
      );
      if (response.success && response.data) {
        setDeliveryChallan(response.data);
      } else {
        setError(response.error || "Failed to load delivery challan");
        showToast("Failed to load delivery challan", "error");
      }
    } catch (error) {
      setError("An error occurred while loading the delivery challan");
      showToast("Failed to load delivery challan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    newStatus: string,
    additionalData?: any
  ) => {
    try {
      let response;
      switch (newStatus) {
        case "Open":
          response = await deliveryChallanService.openChallan(
            params.id as string
          );
          break;
        case "Delivered":
          response = await deliveryChallanService.markDelivered(
            params.id as string
          );
          break;
        case "Returned":
          response = await deliveryChallanService.markReturned(
            params.id as string,
            additionalData
          );
          break;
        default:
          response = await deliveryChallanService.updateStatus(
            params.id as string,
            newStatus
          );
      }

      if (response.success && response.data) {
        setDeliveryChallan(response.data);
        showToast(
          `Delivery Challan ${newStatus.toLowerCase()} successfully`,
          "success"
        );
      } else {
        showToast(
          response.error || `Failed to update status to ${newStatus}`,
          "error"
        );
      }
    } catch (error) {
      showToast(`Failed to update status to ${newStatus}`, "error");
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      const response = await deliveryChallanService.sendEmail(
        params.id as string,
        emailData
      );
      if (response.success) {
        showToast("Email sent successfully", "success");
        // Refresh the challan to get updated email log
        loadDeliveryChallan();
      } else {
        showToast(response.error || "Failed to send email", "error");
      }
    } catch (error) {
      showToast("Failed to send email", "error");
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await deliveryChallanService.duplicate(
        params.id as string
      );
      if (response.success && response.data) {
        showToast("Delivery Challan duplicated successfully", "success");
        // Navigate to the new challan
        router.push(`/dashboard/sales/delivery-challans/${response.data._id}`);
      } else {
        showToast(
          response.error || "Failed to duplicate delivery challan",
          "error"
        );
      }
    } catch (error) {
      showToast("Failed to duplicate delivery challan", "error");
    }
  };

  const handleDelete = async () => {
    if (!deliveryChallan || deliveryChallan.status !== "Draft") {
      showToast("Only Draft delivery challans can be deleted", "error");
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this delivery challan? This action cannot be undone."
      )
    ) {
      try {
        const response = await deliveryChallanService.delete(
          params.id as string
        );
        if (response.success) {
          showToast("Delivery Challan deleted successfully", "success");
          router.push("/dashboard/sales/delivery-challans");
        } else {
          showToast(
            response.error || "Failed to delete delivery challan",
            "error"
          );
        }
      } catch (error) {
        showToast("Failed to delete delivery challan", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery challan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Delivery Challan
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/sales/delivery-challans")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!deliveryChallan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Delivery Challan Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested delivery challan could not be found.
          </p>
          <button
            onClick={() => router.push("/dashboard/sales/delivery-challans")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header - RoboBooks Style (Screenshot 1) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">tt</span>
              <span className="text-sm font-medium text-gray-900">
                {deliveryChallan.challanNo} -{" "}
                {new Date(deliveryChallan.challanDate).toLocaleDateString()}
              </span>
            </div>

            <div className="text-sm font-medium text-gray-900">
              ₹{deliveryChallan.total.toLocaleString()}
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  deliveryChallan.status === "Draft"
                    ? "bg-gray-100 text-gray-800"
                    : deliveryChallan.status === "Open"
                    ? "bg-blue-100 text-blue-800"
                    : deliveryChallan.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {deliveryChallan.status.toUpperCase()}
              </div>

              {deliveryChallan.status === "Draft" && (
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/sales/delivery-challans/${params.id}/edit`
                    )
                  }
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                PDF/Print
              </button>

              {deliveryChallan.status === "Draft" && (
                <button
                  onClick={() => handleStatusUpdate("Open")}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                >
                  Convert to Open
                </button>
              )}

              <button className="inline-flex items-center px-2 py-1.5 text-gray-400 hover:text-gray-600">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Document */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
          {/* Draft Watermark */}
          {deliveryChallan.status === "Draft" && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 right-8 transform rotate-12 opacity-10">
                <span className="text-6xl font-bold text-gray-400">DRAFT</span>
              </div>
            </div>
          )}

          <DeliveryChallanPreview deliveryChallan={deliveryChallan} />
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanDetailPage;
