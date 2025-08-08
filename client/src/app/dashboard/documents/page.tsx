"use client";

import React, { useState, useEffect } from 'react';
import DocumentsOverview from './components/DocumentsOverview';
import DocumentTypes from './components/DocumentTypes';
import DocumentFeatures from './components/DocumentFeatures';
import DocumentsList from './components/DocumentsList';
import { useToast } from '../../../contexts/ToastContext';

interface Document {
  _id: string;
  title: string;
  description?: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  category: string;
  tags: string[];
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/documents`, {
        credentials: 'include', // Use HTTP-only cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.data || []);
    } catch (error) {
      console.error('Fetch documents error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Use HTTP-only cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete document');
      }

      // Remove the document from the list
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      showToast('Document deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete document error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete document', 'error');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/documents/${id}/download`, {
        credentials: 'include', // Use HTTP-only cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download document');
      }

      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ''; // The server will set the filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download document error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to download document', 'error');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentsOverview onDocumentUploaded={fetchDocuments} />
        
        {/* Documents List Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
            <button
              onClick={fetchDocuments}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchDocuments}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          ) : (
            <DocumentsList
              documents={documents}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          )}
        </div>

        <DocumentTypes />
        <DocumentFeatures />
      </div>
    </div>
  );
} 