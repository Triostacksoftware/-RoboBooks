"use client";
import React, { useState } from "react";
import UploadDocumentModal from "./UploadDocumentModal";
import { useToast } from "../../../../contexts/ToastContext";

interface DocumentsOverviewProps {
  onDocumentUploaded?: () => void;
}

export default function DocumentsOverview({
  onDocumentUploaded,
}: DocumentsOverviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleUpload = async (formData: FormData) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/documents/upload`, {
        method: "POST",
        credentials: "include", // Use HTTP-only cookies for authentication
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.message || `Upload failed with status ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      showToast("Document uploaded successfully!", "success");

      // Notify parent component to refresh documents list
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        error instanceof Error ? error.message : "Upload failed",
        "error"
      );
      throw error;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Manage documents with Robo Books
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Organize, store, and access all your business documents in one
              secure location. Upload, categorize, and share documents
              effortlessly with Robo Books document management.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Upload Documents
            </button>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Document Management Overview
              </h3>
              <p className="text-sm text-gray-600">
                Learn how to organize and manage your documents effectively
              </p>
            </div>
          </div>
        </div>
      </div>

      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </>
  );
}
