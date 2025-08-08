"use client";

import React, { useState, useEffect } from 'react';
import ReportsSidebar from './components/ReportsSidebar';
import ReportsList from './components/ReportsList';
import CreateReportModal from './components/CreateReportModal';
import { useToast } from '../../../contexts/ToastContext';

interface Report {
  _id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  category: string;
  subCategory?: string;
  isFavorite: boolean;
  isPublic: boolean;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const { showToast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (filterType !== 'all') params.append('type', filterType);
      if (searchQuery) params.append('search', searchQuery);
      if (showFavorites) params.append('favorite', 'true');

      const response = await fetch(`${backendUrl}/api/reports?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error('Fetch reports error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (reportData: any) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create report');
      }

      const result = await response.json();
      showToast('Report created successfully!', 'success');
      setShowCreateModal(false);
      fetchReports();
    } catch (error) {
      console.error('Create report error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create report', 'error');
    }
  };

  const handleToggleFavorite = async (reportId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/reports/${reportId}/favorite`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update favorite status');
      }

      const result = await response.json();
      showToast(result.message, 'success');
      fetchReports();
    } catch (error) {
      console.error('Toggle favorite error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update favorite status', 'error');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete report');
      }

      showToast('Report deleted successfully!', 'success');
      fetchReports();
    } catch (error) {
      console.error('Delete report error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete report', 'error');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, filterType, showFavorites]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <ReportsSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            showFavorites={showFavorites}
            onShowFavoritesChange={setShowFavorites}
            onCreateReport={() => setShowCreateModal(true)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Generate and manage your business reports
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create New Report
              </button>
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-auto">
            <ReportsList
              reports={reports}
              loading={loading}
              error={error}
              onToggleFavorite={handleToggleFavorite}
              onDeleteReport={handleDeleteReport}
              onRefresh={fetchReports}
            />
          </div>
        </div>
      </div>

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateReport={handleCreateReport}
      />
    </div>
  );
}
