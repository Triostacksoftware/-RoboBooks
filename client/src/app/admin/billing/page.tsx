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
} from "@heroicons/react/24/outline";

interface Subscription {
  id: number;
  companyName: string;
  plan: string;
  amount: number;
  status: string;
  nextBilling: string;
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

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData = {
        subscriptions: [
          {
            id: 1,
            companyName: "TechCorp Inc",
            plan: "Premium",
            amount: 299,
            status: "active",
            nextBilling: "2024-02-15",
          },
          {
            id: 2,
            companyName: "StartupXYZ",
            plan: "Basic",
            amount: 99,
            status: "active",
            nextBilling: "2024-02-20",
          },
          {
            id: 3,
            companyName: "Enterprise Ltd",
            plan: "Enterprise",
            amount: 599,
            status: "cancelled",
            nextBilling: "2024-02-10",
          },
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
        ],
      };
      setBillingData(mockData);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
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
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            ${subscription.amount}
          </p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              subscription.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {subscription.status}
          </span>
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
        <p className="text-gray-600 mt-1">
          Manage subscriptions, invoices, and payments
        </p>
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
                ${totalRevenue}
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
            <div className="p-3 bg-orange-500 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  billingData.invoices.filter((i) => i.status === "overdue")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Active Subscriptions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {billingData.subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
            />
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Invoices
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {billingData.invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
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
