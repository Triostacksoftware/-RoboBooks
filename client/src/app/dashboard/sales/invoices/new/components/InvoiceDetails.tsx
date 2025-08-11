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
    subject: string;
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
            <div
              ref={triggerRef}
              onClick={() => setIsOpen((v) => !v)}
              className="w-full px-1.5 py-1 border border-gray-300 rounded-md text-xs bg-white cursor-pointer flex items-center justify-between"
            >
              <span
                className={
                  formData.salesperson ? "text-gray-800" : "text-gray-400"
                }
              >
                {formData.salesperson || "Select or Add Salesperson"}
              </span>
              <ChevronDownIcon className="h-3 w-3 text-gray-400" />
            </div>
            {isOpen &&
              position &&
              createPortal(
                <div
                  ref={popoverRef}
                  className="fixed z-[100000] bg-white border border-gray-200 rounded-md shadow-xl"
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
                    className="px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      setIsOpen(false);
                      setShowAddModal(true);
                    }}
                  >
                    + Manage Salespersons
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
