"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import DocumentsOverview from "./components/DocumentsOverview";
import DocumentTypes from "./components/DocumentTypes";
import DocumentFeatures from "./components/DocumentFeatures";

interface DocumentData {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadDate: string;
  userId: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { showToast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/documents`, {
        credentials: "include", // Use HTTP-only cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data.data || []);
    } catch (error) {
      console.error("Fetch documents error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch documents"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include", // Use HTTP-only cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete document");
      }

      // Remove the document from the list
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      alert("Document deleted successfully! success");
    } catch (error) {
      console.error("Delete document error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete document"
      );
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(
        `${backendUrl}/api/documents/${id}/download`,
        {
          credentials: "include", // Use HTTP-only cookies for authentication
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download document");
      }

      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ""; // The server will set the filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download document error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to download document"
      );
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-sm text-gray-600">
                Manage your business documents and files
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentsOverview />
        <DocumentTypes />
        <DocumentFeatures />
      </div>
    </div>
  );
}
