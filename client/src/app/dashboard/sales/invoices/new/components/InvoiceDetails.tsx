/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cog6ToothIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import AddSalespersonModal from "./AddSalespersonModal";

interface InvoiceDetailsProps {
  formData: {
    invoiceNumber: string;
    orderNumber: string;
    invoiceDate: string;
    terms: string;
    dueDate: string;
    salesperson: string;
  };
  onFormDataChange: (data: any) => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  formData,
  onFormDataChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [salespersons, setSalespersons] = useState<
    { _id: string; name: string; email: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const url =
          (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") +
          (search
            ? `/api/salespersons?search=${encodeURIComponent(search)}`
            : "/api/salespersons");
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json();
        setSalespersons(json.data || []);
      } catch {
        setSalespersons([]);
      } finally {
        setIsLoading(false);
      }
    };
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [search]);

  const position = useMemo(() => {
    if (!rect) return null;
    const viewportPadding = 8;
    const gap = 6;
    const preferredMax = 280;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const placeAbove = spaceBelow < 200 && spaceAbove > spaceBelow;

    const maxH = Math.max(
      160,
      Math.min(preferredMax, (placeAbove ? spaceAbove : spaceBelow) - gap)
    );

    const top = placeAbove
      ? Math.max(viewportPadding, rect.top - maxH - gap)
      : Math.min(
          rect.bottom + gap,
          window.innerHeight - maxH - viewportPadding
        );

    const left = Math.max(
      viewportPadding,
      Math.min(rect.left, window.innerWidth - rect.width - viewportPadding)
    );

    const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
    return { top, left, width, maxH };
  }, [rect]);

  // Keep the dropdown anchored to the trigger while open
  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      if (triggerRef.current) {
        setRect(triggerRef.current.getBoundingClientRect());
      }
    };

    updateRect();

    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && popoverRef.current && popoverRef.current.contains(target)) {
        return; // ignore internal scrolling
      }
      updateRect();
    };

    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Invoice Details
      </h2>

      <div className="space-y-4">
        {/* 6 fields in 3-column layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number*
            </label>
            <div className="relative max-w-xs">
              <input
                type="text"
                value={formData.invoiceNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    invoiceNumber: e.target.value,
                  })
                }
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Cog6ToothIcon
                  className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => {
                    // Auto-generate next invoice number
                    const currentNumber = parseInt(
                      formData.invoiceNumber.replace(/\D/g, "")
                    );
                    const nextNumber = currentNumber + 1;
                    const prefix = formData.invoiceNumber.replace(/\d+$/, "");
                    onFormDataChange({
                      ...formData,
                      invoiceNumber: `${prefix}${nextNumber
                        .toString()
                        .padStart(6, "0")}`,
                    });
                  }}
                  title="Auto-generate next invoice number"
                />
              </div>
            </div>
          </div>

          {/* Order Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Number
            </label>
            <div className="max-w-xs">
              <input
                type="text"
                placeholder="Enter order number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                value={formData.orderNumber}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    orderNumber: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date*
            </label>
            <div className="max-w-xs">
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => {
                  const newInvoiceDate = e.target.value;
                  let dueDate = newInvoiceDate;

                  // Recalculate due date based on current terms
                  if (formData.terms !== "Due on Receipt") {
                    const invoiceDate = new Date(newInvoiceDate);
                    const days = parseInt(formData.terms.replace(/\D/g, ""));
                    if (!isNaN(days)) {
                      invoiceDate.setDate(invoiceDate.getDate() + days);
                      dueDate = invoiceDate.toISOString().split("T")[0];
                    }
                  }

                  onFormDataChange({
                    ...formData,
                    invoiceDate: newInvoiceDate,
                    dueDate: dueDate,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Terms
            </label>
            <div className="relative max-w-xs">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm transition-colors"
                value={formData.terms}
                onChange={(e) => {
                  const selectedTerms = e.target.value;
                  let dueDate = formData.invoiceDate;

                  // Calculate due date based on terms
                  if (selectedTerms !== "Due on Receipt") {
                    const invoiceDate = new Date(formData.invoiceDate);
                    const days = parseInt(selectedTerms.replace(/\D/g, ""));
                    if (!isNaN(days)) {
                      invoiceDate.setDate(invoiceDate.getDate() + days);
                      dueDate = invoiceDate.toISOString().split("T")[0];
                    }
                  }

                  onFormDataChange({
                    ...formData,
                    terms: selectedTerms,
                    dueDate: dueDate,
                  });
                }}
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Salesperson */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salesperson
            </label>
            <div className="max-w-xs">
              <div
                ref={triggerRef}
                onClick={() => setIsOpen((v) => !v)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
              >
                <span
                  className={
                    formData.salesperson ? "text-gray-800" : "text-gray-400"
                  }
                >
                  {formData.salesperson || "Select or Add Salesperson"}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {isOpen &&
              position &&
              createPortal(
                <div
                  ref={popoverRef}
                  className="fixed salesperson-dropdown bg-white border border-gray-200 rounded-md shadow-xl"
                  style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                  }}
                >
                  <div className="p-2 border-b border-gray-200">
                    <input
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Search salesperson..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div
                    className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      onFormDataChange({
                        ...formData,
                        salesperson: "",
                      });
                      setIsOpen(false);
                    }}
                  >
                    Clear Selection
                  </div>
                  <div
                    className="px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center"
                    onClick={() => {
                      setIsOpen(false);
                      setShowAddModal(true);
                    }}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    + New Salesperson
                  </div>
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: position.maxH }}
                  >
                    {isLoading ? (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        Loading...
                      </div>
                    ) : salespersons.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No results
                      </div>
                    ) : (
                      salespersons.map((sp) => (
                        <div
                          key={sp._id}
                          className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            onFormDataChange({
                              ...formData,
                              salesperson: sp.name,
                            });
                            setIsOpen(false);
                          }}
                        >
                          <div className="font-medium text-gray-900">
                            {sp.name}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {sp.email}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>,
                document.body
              )}
            <AddSalespersonModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onCreated={(sp) => {
                setSalespersons((prev) => [sp, ...prev]);
                onFormDataChange({ ...formData, salesperson: sp.name });
              }}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="max-w-xs">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    dueDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
