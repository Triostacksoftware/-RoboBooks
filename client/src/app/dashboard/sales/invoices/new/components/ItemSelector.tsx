/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import AddItemModal from "./AddItemModal";

interface Item {
  _id: string;
  name: string;
  sku?: string;
  sellingPrice: number;
  unit?: string;
  description?: string;
  category?: string;
  brand?: string;
  hsnCode?: string;
  sacCode?: string;
  gstRate?: number;
}

interface ItemSelectorProps {
  value: string;
  onChange: (itemId: string, itemDetails: Partial<Item>) => void;
  placeholder?: string;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  value,
  onChange,
  placeholder = "Type or click to select an item",
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const fetchItems = async (q = "") => {
    try {
      setIsLoading(true);
      const url = q
        ? `${backendUrl}/api/items?search=${encodeURIComponent(q)}&limit=50`
        : `${backendUrl}/api/items?limit=50`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("ItemSelector fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems("");
    setIsMounted(true);
  }, []);

  // Debounced remote search
  useEffect(() => {
    const id = setTimeout(() => {
      fetchItems(searchTerm);
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const selectedItem = items.find((it) => it._id === value) || null;

  const filtered = items.filter((it) =>
    it.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close on outside click (ignore clicks inside popover)
  useEffect(() => {
    const handleDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleDocMouseDown);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleDocMouseDown);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Keep anchored to the select: update position on ancestor scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      if (triggerRef.current)
        setTriggerRect(triggerRef.current.getBoundingClientRect());
    };

    updateRect();
    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && popoverRef.current && popoverRef.current.contains(target)) {
        return; // ignore internal list scrolling
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

  const openDropdown = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen((prev) => !prev);
  };

  // Compute popover geometry (flip up when needed)
  const geometry = (() => {
    if (!triggerRect) return null;
    const viewportPadding = 8;
    const preferredMax = 320; // px panel max height
    const gap = 6;
    const spaceBelow =
      window.innerHeight - triggerRect.bottom - viewportPadding;
    const spaceAbove = triggerRect.top - viewportPadding;
    const placeAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      180,
      Math.min(preferredMax, (placeAbove ? spaceAbove : spaceBelow) - gap)
    );
    const top = placeAbove
      ? Math.max(viewportPadding, triggerRect.top - maxHeight - gap)
      : Math.min(
          triggerRect.bottom + gap,
          window.innerHeight - maxHeight - viewportPadding
        );
    const left = Math.max(
      viewportPadding,
      Math.min(
        triggerRect.left,
        window.innerWidth - triggerRect.width - viewportPadding
      )
    );
    const width = Math.min(
      triggerRect.width,
      window.innerWidth - viewportPadding * 2
    );
    const itemsMax = Math.max(120, maxHeight - 88); // subtract search + add-new headers
    return { top, left, width, maxHeight, itemsMax };
  })();

  const handleSelect = (item: Item) => {
    onChange(item._id, {
      name: item.name,
      sku: item.sku,
      sellingPrice: item.sellingPrice,
      unit: item.unit,
      description: item.description,
      category: item.category,
      brand: item.brand,
      hsnCode: item.hsnCode,
      sacCode: item.sacCode,
      gstRate: item.gstRate,
    });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="w-full relative" ref={rootRef}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        className="w-full min-h-[32px] px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex items-center justify-between"
        onClick={openDropdown}
      >
        <span className={selectedItem ? "text-gray-900" : "text-gray-500"}>
          {selectedItem
            ? `${selectedItem.name} - ₹${
                selectedItem.sellingPrice?.toFixed(2) || "0.00"
              }`
            : isLoading
            ? "Loading items..."
            : placeholder}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Anchored popover via portal (no backdrop) */}
      {isMounted &&
        isOpen &&
        triggerRect &&
        geometry &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed item-selector-dropdown bg-white border border-gray-300 rounded-md shadow-xl"
            style={{
              top: geometry.top,
              left: geometry.left,
              width: geometry.width,
              maxHeight: geometry.maxHeight,
            }}
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Add New */}
            <div
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center"
              onClick={() => {
                setShowAddModal(true);
                setIsOpen(false);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Add New Item
            </div>

            {/* Items list */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: geometry.itemsMax }}
            >
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Loading items...
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? "No items found" : "No items available"}
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item._id}
                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      ₹{item.sellingPrice?.toFixed(2) || "0.00"} •{" "}
                      {item.sku || "No SKU"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onItemCreated={(newItem) => {
          setItems((prev) => [newItem, ...prev]);
          onChange(newItem._id, {
            name: newItem.name,
            sku: newItem.sku,
            sellingPrice: newItem.sellingPrice,
            unit: newItem.unit,
            description: newItem.description,
            category: newItem.category,
            brand: newItem.brand,
            hsnCode: newItem.hsnCode,
            sacCode: newItem.sacCode,
            gstRate: newItem.gstRate,
          });
        }}
      />
    </div>
  );
};

export default ItemSelector;
