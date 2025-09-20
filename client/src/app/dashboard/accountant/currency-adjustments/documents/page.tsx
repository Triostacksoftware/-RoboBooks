"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Folder,
  Image,
  File,
  BarChart3
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Document {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  description?: string;
  tags: string[];
  relatedEntity: {
    type: string;
    entityId?: string;
  };
  isPublic: boolean;
  accessLevel: string;
  version: number;
  checksum: string;
  uploadedBy: {
    name: string;
    email: string;
  };
  lastAccessed?: string;
  accessCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

const DocumentsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    category: 'other',
    description: '',
    tags: '',
    relatedEntityType: 'none',
    relatedEntityId: '',
    isPublic: false,
    accessLevel: 'private'
  });

  // Load documents
  const loadDocuments = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await api<{ success: boolean; data: Document[]; pagination: PaginationInfo }>(
        `/api/documents?${params.toString()}`
      );
      
      if (response.success) {
        setDocuments(response.data);
        setPagination(response.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadDocuments();
    }
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    loadDocuments(1);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description);
      formData.append('tags', uploadForm.tags);
      formData.append('relatedEntityType', uploadForm.relatedEntityType);
      formData.append('relatedEntityId', uploadForm.relatedEntityId);
      formData.append('isPublic', uploadForm.isPublic.toString());
      formData.append('accessLevel', uploadForm.accessLevel);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Document uploaded successfully');
        setShowUploadModal(false);
        setUploadForm({
          file: null,
          category: 'other',
          description: '',
          tags: '',
          relatedEntityType: 'none',
          relatedEntityId: '',
          isPublic: false,
          accessLevel: 'private'
        });
        await loadDocuments(currentPage);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  // Handle file download
  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download document');
    }
  };

  // Handle delete document
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setSuccess('Document deleted successfully');
        await loadDocuments(currentPage);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  // Handle archive document
  const handleArchiveDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const response = await api(`/api/documents/${documentId}/archive`, {
        method: 'PUT'
      });

      if (response.success) {
        setSuccess('Document archived successfully');
        await loadDocuments(currentPage);
      }
    } catch (error) {
      console.error('Error archiving document:', error);
      setError('Failed to archive document');
    } finally {
      setLoading(false);
    }
  };

  // Handle restore document
  const handleRestoreDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const response = await api(`/api/documents/${documentId}/restore`, {
        method: 'PUT'
      });

      if (response.success) {
        setSuccess('Document restored successfully');
        await loadDocuments(currentPage);
      }
    } catch (error) {
      console.error('Error restoring document:', error);
      setError('Failed to restore document');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) {
      setError('Please select documents to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
      return;
    }

    try {
      setLoading(true);
      const promises = selectedDocuments.map(id => 
        api(`/api/documents/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(promises);
      setSuccess(`${selectedDocuments.length} documents deleted successfully`);
      setSelectedDocuments([]);
      await loadDocuments(currentPage);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      setError('Failed to delete selected documents');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      invoice: 'bg-blue-100 text-blue-800',
      receipt: 'bg-green-100 text-green-800',
      contract: 'bg-purple-100 text-purple-800',
      statement: 'bg-yellow-100 text-yellow-800',
      certificate: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/accountant/currency-adjustments")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Currency Adjustments
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Folder className="h-6 w-6 text-blue-600" />
                  Document Management
                </h1>
                <p className="text-sm text-gray-600">
                  Upload, organize, and manage documents related to currency adjustments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadDocuments(currentPage)}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          {selectedDocuments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedDocuments.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="invoice">Invoice</option>
                  <option value="receipt">Receipt</option>
                  <option value="contract">Contract</option>
                  <option value="statement">Statement</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setCurrentPage(1);
                    loadDocuments(1);
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <div key={document._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(prev => [...prev, document._id]);
                        } else {
                          setSelectedDocuments(prev => prev.filter(id => id !== document._id));
                        }
                      }}
                      className="mr-3"
                    />
                    {getFileIcon(document.mimeType)}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleDownload(document._id, document.originalName)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingDocument(document)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {document.isArchived ? (
                      <button
                        onClick={() => handleRestoreDocument(document._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Restore"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchiveDocument(document._id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDocument(document._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate" title={document.originalName}>
                    {document.originalName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatFileSize(document.size)} • {formatDate(document.createdAt)}
                  </p>
                  
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(document.category)}`}>
                      {document.category}
                    </span>
                  </div>
                  
                  {document.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {document.description}
                    </p>
                  )}
                  
                  {document.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
                    <div>Uploaded by: {document.uploadedBy.name}</div>
                    <div>Access count: {document.accessCount}</div>
                    {document.lastAccessed && (
                      <div>Last accessed: {formatDate(document.lastAccessed)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} documents
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadDocuments(currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => loadDocuments(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => loadDocuments(currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="invoice">Invoice</option>
                        <option value="receipt">Receipt</option>
                        <option value="contract">Contract</option>
                        <option value="statement">Statement</option>
                        <option value="certificate">Certificate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                      <select
                        value={uploadForm.accessLevel}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, accessLevel: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="private">Private</option>
                        <option value="internal">Internal</option>
                        <option value="public">Public</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., important, 2024, q1"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={uploadForm.isPublic}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Make this document public</span>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !uploadForm.file}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Document
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
