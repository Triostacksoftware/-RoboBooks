"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InvoicePreview from "../../components/InvoicePreview";

interface InvoiceItem {
  id: number;
  itemId?: string;
  details: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderNumber?: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  salesperson?: string;
  subject?: string;
  project?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  // Buyer Details
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerGstin?: string;
  buyerAddress?: string;
  // Seller Details
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerGstin?: string;
  sellerAddress?: string;
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  shippingCharges: number;
  adjustment: number;
  roundOff: number;
  total: number;
  paymentTerms?: string;
  paymentMethod?: string;
  amountPaid: number;
  balanceDue: number;
  customerNotes?: string;
  termsConditions?: string;
  internalNotes?: string;
  status: string;
  currency: string;
  exchangeRate: number;
  signature?: {
    fileName: string;
    filePath: string;
    fileSize: number;
  };
  createdAt: string;
  updatedAt: string;
  placeOfSupplyState?: string;
  additionalTaxAmount?: number;
  additionalTaxType?: string;
  additionalTaxRate?: number;
}

const InvoicePrintPage = () => {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setInvoice(result.data);
          } else {
            setError(result.error || "Failed to fetch invoice");
          }
        } else {
          setError("Failed to fetch invoice");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Error fetching invoice");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push("/dashboard/sales/invoices");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Invoice not found"}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="print-root">
      {/* Print Controls - Hidden when printing */}
      <div className="print-controls no-print bg-gray-100 p-4 border-b" data-print-control="true">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            &lt; Back
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700"
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Content - Print Optimized */}
      <div className="invoice-content max-w-4xl mx-auto bg-white p-8">
        <InvoicePreview invoice={invoice} isPrintMode={true} />
      </div>
    </div>
  );
};

export default InvoicePrintPage;