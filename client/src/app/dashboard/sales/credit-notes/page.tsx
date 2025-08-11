"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Play,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  User,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerName: string;
  date: string;
  amount: number;
  status: "draft" | "open" | "void";
  reference?: string;
  subject?: string;
}

const CreditNotesPage = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    const mockCreditNotes: CreditNote[] = [
      {
        id: "1",
        creditNoteNumber: "CN-00001",
        customerName: "ABC Company Ltd",
        date: "2025-08-11",
        amount: 15000.0,
        status: "open",
        reference: "REF-001",
        subject: "Product return - Damaged goods",
      },
      {
        id: "2",
        creditNoteNumber: "CN-00002",
        customerName: "XYZ Corporation",
        date: "2025-08-10",
        amount: 8500.0,
        status: "draft",
        reference: "REF-002",
        subject: "Order cancellation",
      },
    ];

    setTimeout(() => {
      setCreditNotes(mockCreditNotes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCreditNotes = creditNotes.filter((note) => {
    const matchesSearch =
      note.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || note.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "void":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Credit Notes</h1>
          <p className="text-gray-600 mt-1">
            Manage customer refunds and credits
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/sales/credit-notes/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE NEW CREDIT NOTE</span>
          </Link>
        </div>
      </div>

      {/* Getting Started Section */}
      {creditNotes.length === 0 && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="max-w-md mx-auto space-y-6">
            {/* Video Tutorial Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Zoho Books</div>
                  <div className="text-sm text-gray-600">
                    How to create a credit note
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard/sales/credit-notes/new"
                className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium"
              >
                CREATE NEW CREDIT NOTE
              </Link>
              <button className="block w-full text-blue-600 hover:text-blue-700 font-medium">
                Import Credit Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Life Cycle Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Life cycle of a Credit Note
        </h2>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">✓</span>
            </div>
            <span className="font-medium">PRODUCT RETURNED</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600">✗</span>
            </div>
            <span className="font-medium">ORDER CANCELLED</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">CREDIT NOTES</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">REFUND</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">CREDITS</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">APPLY TO FUTURE INVOICES</span>
          </div>
        </div>
      </div>

      {/* Module Capabilities */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          In the Credit Notes module, you can:
        </h2>
        <ul className="space-y-2">
          <li className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span>
              Issue refunds and credits to your customers and apply them to
              invoices
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span>
              Record and manage excess payments as credits.{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Learn More
              </a>
            </span>
          </li>
        </ul>
      </div>

      {/* Credit Notes List */}
      {creditNotes.length > 0 && (
        <div className="bg-white rounded-lg border">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search credit notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="void">Void</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Note #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCreditNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/sales/credit-notes/${note.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {note.creditNoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {note.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(note.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(note.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          note.status
                        )}`}
                      >
                        {note.status.charAt(0).toUpperCase() +
                          note.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/sales/credit-notes/${note.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/sales/credit-notes/${note.id}/edit`}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditNotesPage;
