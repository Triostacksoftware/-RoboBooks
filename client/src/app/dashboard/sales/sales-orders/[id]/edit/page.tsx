"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
}

interface Item {
  _id: string;
  name: string;
  description?: string;
  price: number;
  taxRate: number;
}

interface SalesOrderItem {
  _id?: string;
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface SalesOrder {
  _id: string;
  salesOrderNumber: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  deliveryDate: string;
  items: SalesOrderItem[];
  subTotal: number;
  taxAmount: number;
  total: number;
  status: string;
  customerNotes?: string;
  termsConditions?: string;
}

const EditSalesOrderPage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [salesOrderItems, setSalesOrderItems] = useState<SalesOrderItem[]>([]);
  const [orderDate, setOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchSalesOrder(params.id as string);
      fetchCustomers();
      fetchItems();
    }
  }, [params.id]);

  const fetchSalesOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders/${id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const orderData = result.data || result;
        setSalesOrder(orderData);

        // Set form data
        setOrderDate(orderData.orderDate.split("T")[0]);
        setDeliveryDate(orderData.deliveryDate.split("T")[0]);
        setNotes(orderData.customerNotes || "");
        setTerms(orderData.termsConditions || "");

        // Set customer
        const customer = customers.find(
          (c) => c._id === orderData.customerId._id
        );
        setSelectedCustomer(customer || orderData.customerId);

        // Set items
        const formattedItems = orderData.items.map((item: any) => ({
          _id: item._id,
          itemId: item.itemId,
          itemName: item.details || "",
          description: item.description || "",
          quantity: item.quantity,
          unitPrice: item.rate,
          taxRate: item.taxRate,
          total: item.amount,
        }));
        setSalesOrderItems(formattedItems);
      } else {
        Swal.fire("Error", "Failed to fetch sales order", "error");
        router.push("/dashboard/sales/sales-orders");
      }
    } catch (error) {
      console.error("Error fetching sales order:", error);
      Swal.fire("Error", "Failed to fetch sales order", "error");
      router.push("/dashboard/sales/sales-orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCustomers(result.data || result);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setItems(result.data || result);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const addItem = () => {
    const newItem: SalesOrderItem = {
      itemId: "",
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      total: 0,
    };
    setSalesOrderItems([...salesOrderItems, newItem]);
  };

  const removeItem = (index: number) => {
    setSalesOrderItems(salesOrderItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof SalesOrderItem,
    value: any
  ) => {
    const updatedItems = [...salesOrderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Calculate total for this item
    const item = updatedItems[index];
    if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
      const subtotal = item.quantity * item.unitPrice;
      const taxAmount = subtotal * (item.taxRate / 100);
      item.total = subtotal + taxAmount;
    }

    // If itemId changed, update item details
    if (field === "itemId") {
      const selectedItem = items.find((i) => i._id === value);
      if (selectedItem) {
        item.itemName = selectedItem.name;
        item.description = selectedItem.description || "";
        item.unitPrice = selectedItem.price;
        item.taxRate = selectedItem.taxRate;
        const subtotal = item.quantity * item.unitPrice;
        const taxAmount = subtotal * (item.taxRate / 100);
        item.total = subtotal + taxAmount;
      }
    }

    setSalesOrderItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return salesOrderItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTax = () => {
    return salesOrderItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + subtotal * (item.taxRate / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      Swal.fire("Error", "Please select a customer", "error");
      return;
    }

    if (salesOrderItems.length === 0) {
      Swal.fire("Error", "Please add at least one item", "error");
      return;
    }

    setSaving(true);

    try {
      const salesOrderData = {
        customerId: selectedCustomer._id,
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.phone,
        orderDate,
        deliveryDate,
        items: salesOrderItems.map((item) => ({
          _id: item._id,
          itemId: item.itemId,
          details: item.itemName,
          description: item.description,
          quantity: item.quantity,
          rate: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: (item.quantity * item.unitPrice * item.taxRate) / 100,
        })),
        customerNotes: notes,
        termsConditions: terms,
        subTotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        total: calculateTotal(),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders/${params.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(salesOrderData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        Swal.fire({
          title: "Success!",
          text: "Sales order updated successfully",
          icon: "success",
          confirmButtonText: "View Sales Order",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/dashboard/sales/sales-orders/${params.id}`);
          } else {
            router.push("/dashboard/sales/sales-orders");
          }
        });
      } else {
        const errorData = await response.json();
        Swal.fire(
          "Error",
          errorData.message || "Failed to update sales order",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating sales order:", error);
      Swal.fire("Error", "Failed to update sales order", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales order...</p>
        </div>
      </div>
    );
  }

  if (!salesOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Sales order not found</p>
          <button
            onClick={() => router.push("/dashboard/sales/sales-orders")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Sales Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Sales Order #{salesOrder.salesOrderNumber}
            </h1>
            <p className="text-gray-600 mt-1">Update sales order details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Customer
              </label>
              <select
                value={selectedCustomer?._id || ""}
                onChange={(e) => {
                  const customer = customers.find(
                    (c) => c._id === e.target.value
                  );
                  setSelectedCustomer(customer || null);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Choose a customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.firstName} {customer.lastName}{" "}
                    {customer.company ? `(${customer.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {selectedCustomer && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Customer Details
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedCustomer.email}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedCustomer.phone}
                </p>
                {selectedCustomer.company && (
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.company}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Order Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Order Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          {salesOrderItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No items added yet. Click "Add Item" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {salesOrderItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item
                      </label>
                      <select
                        value={item.itemId}
                        onChange={(e) =>
                          updateItem(index, "itemId", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select an item</option>
                        {items.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "taxRate",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total
                        </label>
                        <div className="text-lg font-semibold text-gray-900">
                          ₹{item.total.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {item.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {salesOrderItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  ₹{calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  ₹{calculateTax().toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes and Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add any additional notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms & Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add terms and conditions..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-4 w-4" />
                <span>Update Sales Order</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Wrapped with access guard
const EditSalesOrderPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    <EditSalesOrderPage />
  </ModuleAccessGuard>
);

export default EditSalesOrderPageWithGuard;
