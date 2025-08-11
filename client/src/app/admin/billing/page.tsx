"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface Subscription {
  id: number;
  companyName: string;
  plan: string;
  amount: number;
  status: string;
  nextBilling: string;
  email: string;
}

interface Invoice {
  id: string;
  companyName: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
}

interface Payment {
  id: string;
  companyName: string;
  amount: number;
  method: string;
  date: string;
}

interface BillingData {
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
}

export default function AdminBilling() {
  const [billingData, setBillingData] = useState<BillingData>({
    subscriptions: [],
    invoices: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const response = await api<{ success: boolean; billingData: BillingData }>(
        "/api/admin/billing"
      );
      if (response.success) {
        setBillingData(response.billingData);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      // Fallback to mock data
      const mockData = {
        subscriptions: [
          {
            id: 1,
            companyName: "TechCorp Inc",
            plan: "Premium",
            amount: 299,
            status: "active",
            nextBilling: "2024-02-15",
            email: "admin@techcorp.com"
          },
          {
            id: 2,
            companyName: "StartupXYZ",
            plan: "Basic",
            amount: 99,
            status: "active",
            nextBilling: "2024-02-20",
            email: "contact@startupxyz.com"
          },
          {
            id: 3,
            companyName: "Enterprise Ltd",
            plan: "Enterprise",
            amount: 599,
            status: "cancelled",
            nextBilling: "2024-02-10",
            email: "info@enterprise.com"
          },
          {
            id: 4,
            companyName: "Digital Solutions",
            plan: "Premium",
            amount: 299,
            status: "active",
            nextBilling: "2024-02-25",
            email: "hello@digitalsolutions.com"
          },
          {
            id: 5,
            companyName: "Innovation Hub",
            plan: "Basic",
            amount: 99,
            status: "active",
            nextBilling: "2024-02-28",
            email: "team@innovationhub.com"
          }
        ],
        invoices: [
          {
            id: "INV-001",
            companyName: "TechCorp Inc",
            amount: 299,
            status: "paid",
            dueDate: "2024-01-15",
            paidDate: "2024-01-14",
          },
          {
            id: "INV-002",
            companyName: "StartupXYZ",
            amount: 99,
            status: "paid",
            dueDate: "2024-01-20",
            paidDate: "2024-01-19",
          },
          {
            id: "INV-003",
            companyName: "Enterprise Ltd",
            amount: 599,
            status: "overdue",
            dueDate: "2024-01-10",
            paidDate: null,
          },
          {
            id: "INV-004",
            companyName: "Digital Solutions",
            amount: 299,
            status: "pending",
            dueDate: "2024-02-15",
            paidDate: null,
          },
        ],
        payments: [
          {
            id: "PAY-001",
            companyName: "TechCorp Inc",
            amount: 299,
            method: "Credit Card",
            date: "2024-01-14",
          },
          {
            id: "PAY-002",
            companyName: "StartupXYZ",
            amount: 99,
            method: "Bank Transfer",
            date: "2024-01-19",
          },
          {
            id: "PAY-003",
            companyName: "Digital Solutions",
            amount: 299,
            method: "Credit Card",
            date: "2024-01-25",
          },
        ],
      };
      setBillingData(mockData);
    } finally {
      setLoading(false);
    }
  };

  type UpdatableSection = 'subscriptions' | 'invoices';
  const handleStatusUpdate = async (
    type: UpdatableSection,
    id: string | number,
    newStatus: string
  ) => {
    try {
      // In production, this would make an API call to update the status
      setBillingData(prev => ({
        ...prev,
        [type]: prev[type].map(item => 
          item.id === id ? { ...item, status: newStatus } : item
        )
      }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const SubscriptionCard = ({
    subscription,
  }: {
    subscription: Subscription;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {subscription.companyName}
          </h3>
          <p className="text-sm text-gray-600">{subscription.plan} Plan</p>
          <p className="text-xs text-gray-500">
            Next billing: {subscription.nextBilling}
          </p>
          <p className="text-xs text-gray-500">{subscription.email}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            ${subscription.amount}
          </p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              subscription.status === "active"
                ? "bg-green-100 text-green-800"
                : subscription.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {subscription.status}
          </span>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
          <EyeIcon className="h-4 w-4" />
          <span>View</span>
        </button>
        <button className="flex items-center justify-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg" title="Edit">
          <PencilIcon className="h-4 w-4" />
        </button>
        {subscription.status === "active" && (
          <button 
            onClick={() => handleStatusUpdate("subscriptions", subscription.id, "cancelled")}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <XCircleIcon className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        )}
        {subscription.status === "cancelled" && (
          <button 
            onClick={() => handleStatusUpdate("subscriptions", subscription.id, "active")}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg"
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>Reactivate</span>
          </button>
        )}
      </div>
    </div>
  );

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {invoice.companyName}
          </h3>
          <p className="text-sm text-gray-600">Invoice #{invoice.id}</p>
          <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
          {invoice.paidDate && (
            <p className="text-xs text-green-600">Paid: {invoice.paidDate}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${invoice.amount}</p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              invoice.status === "paid"
                ? "bg-green-100 text-green-800"
                : invoice.status === "overdue"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {invoice.status}
          </span>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
          <EyeIcon className="h-4 w-4" />
          <span>View</span>
        </button>
        {invoice.status === "pending" && (
          <button className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-4 w-4" />
            <span>Mark Paid</span>
          </button>
        )}
      </div>
    </div>
  );

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {payment.companyName}
          </h3>
          <p className="text-sm text-gray-600">Payment #{payment.id}</p>
          <p className="text-xs text-gray-500">Date: {payment.date}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${payment.amount}</p>
          <span className="text-sm text-gray-600">{payment.method}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = billingData.subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);

  const activeSubscriptions = billingData.subscriptions.filter(
    (s) => s.status === "active"
  ).length;
  const paidInvoices = billingData.invoices.filter(
    (i) => i.status === "paid"
  ).length;
  const overdueInvoices = billingData.invoices.filter(
    (i) => i.status === "overdue"
  ).length;

  const tabs = [
    { id: "subscriptions", name: "Subscriptions", count: billingData.subscriptions.length },
    { id: "invoices", name: "Invoices", count: billingData.invoices.length },
    { id: "payments", name: "Payments", count: billingData.payments.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
          <p className="text-gray-600 mt-1">
            Manage subscriptions, invoices, and payments
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Subscriptions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeSubscriptions}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Overdue Invoices
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {overdueInvoices}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "subscriptions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {billingData.subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {billingData.invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {billingData.payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Methods
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Credit Card", icon: CreditCardIcon, status: "active" },
            { name: "Bank Transfer", icon: BanknotesIcon, status: "active" },
            { name: "PayPal", icon: CurrencyDollarIcon, status: "inactive" },
          ].map((method, index) => (
            <div
              key={index}
              className="flex items-center p-4 border border-gray-200 rounded-lg"
            >
              <method.icon className="h-6 w-6 text-gray-400 mr-3" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    method.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {method.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
