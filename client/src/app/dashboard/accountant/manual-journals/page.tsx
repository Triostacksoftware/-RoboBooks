"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Download,
  Settings,
  Check,
} from "lucide-react";
import { useToast } from "../../../../contexts/ToastContext";

interface JournalEntry {
  account: string;
  description: string;
  debit: number;
  credit: number;
  reference?: string;
}

interface ManualJournal {
  _id: string;
  journalNumber: string;
  journalDate: string;
  reference?: string;
  description: string;
  entries: JournalEntry[];
  totalDebit: number;
  totalCredit: number;
  status: "draft" | "posted" | "cancelled";
  createdBy: string;
  postedBy?: string;
  postedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ManualJournalsPage = () => {
  const router = useRouter();
  const [journals, setJournals] = useState<ManualJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<ManualJournal | null>(
    null
  );
  const { showToast } = useToast();

  // Fetch journals
  const fetchJournals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/manual-journals?${params}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch journals");
      }

      const data = await response.json();
      setJournals(data.data || []);
    } catch (error) {
      console.error("Error fetching journals:", error);
      showToast("Failed to fetch journals", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [searchTerm, statusFilter]);

  // Delete journal
  const handleDelete = async (journalId: string) => {
    if (!confirm("Are you sure you want to delete this journal?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/manual-journals/${journalId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete journal");
      }

      showToast("Journal deleted successfully", "success");
      fetchJournals();
    } catch (error) {
      console.error("Error deleting journal:", error);
      showToast("Failed to delete journal", "error");
    }
  };

  // Post journal
  const handlePost = async (journalId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/manual-journals/${journalId}/post`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post journal");
      }

      showToast("Journal posted successfully", "success");
      fetchJournals();
    } catch (error) {
      console.error("Error posting journal:", error);
      showToast("Failed to post journal", "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "posted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // If no journals exist, show the empty state with video and features
  if (journals.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                          <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/accountant')}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                ← Back to Accountant
              </button>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  All Manual Journals
                </h1>
              </div>
            </div>
              <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Find Accountants
                </button>
                <div className="relative">
                  <button
                    onClick={() =>
                      (window.location.href =
                        "/dashboard/accountant/manual-journals/new")
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </button>
                </div>
                <button className="text-gray-600 hover:text-gray-900">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Video Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center">
              {/* Video Thumbnail */}
              <div className="relative w-64 h-48 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                  Zoho Books How to create manual journals
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start making journal entries.
              </h2>
              <p className="text-gray-600 mb-6">
                You can transfer & adjust money between accounts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/dashboard/accountant/manual-journals/new")
                  }
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  CREATE NEW JOURNAL
                </button>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Import Journals
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              In the Manual Journals module, you can:
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-900">
                    Create journals from the templates you create to save time.
                  </span>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 ml-1"
                  >
                    Learn More
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-900">
                    Customize journals to suit your branding.
                  </span>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 ml-1"
                  >
                    Learn More
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-900">
                    Control journal publishing by customizing roles and
                    permissions.
                  </span>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 ml-1"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                All Manual Journals
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Find Accountants
              </button>
              <div className="relative">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/dashboard/accountant/manual-journals/new")
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </button>
              </div>
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search journals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Journals List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Manual Journals ({journals.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading journals...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {journals.map((journal) => (
                <div key={journal._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {journal.journalNumber}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            journal.status
                          )}`}
                        >
                          {journal.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {journal.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>
                          Date:{" "}
                          {new Date(journal.journalDate).toLocaleDateString()}
                        </span>
                        <span>Debit: ${journal.totalDebit.toFixed(2)}</span>
                        <span>Credit: ${journal.totalCredit.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedJournal(journal)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedJournal(journal)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {journal.status === "draft" && (
                        <button
                          onClick={() => handlePost(journal._id)}
                          className="p-2 text-green-400 hover:text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(journal._id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualJournalsPage;
