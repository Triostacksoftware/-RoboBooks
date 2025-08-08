"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminReports() {
  interface Report {
    id: number;
    name: string;
    type: string;
    lastGenerated: string;
    status: "completed" | "processing" | "failed" | string;
    size: string;
    description: string;
  }
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dateRange, setDateRange] = useState("last_30_days");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api<{ success: boolean; reports: Report[] }>(
        "/api/admin/reports"
      );
      if (response.success) {
        setReports(response.reports || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Fallback to mock data
      const mockReports = [
        {
          id: 1,
          name: "User Activity Report",
          type: "Analytics",
          lastGenerated: "2024-01-15",
          status: "completed",
          size: "2.3 MB",
          description: "Detailed user activity and engagement metrics"
        },
        {
          id: 2,
          name: "Revenue Summary",
          type: "Financial",
          lastGenerated: "2024-01-14",
          status: "completed",
          size: "1.8 MB",
          description: "Revenue, expenses, and profit analysis"
        },
        {
          id: 3,
          name: "System Performance",
          type: "Technical",
          lastGenerated: "2024-01-13",
          status: "processing",
          size: "0.5 MB",
          description: "Performance and uptime statistics"
        },
        {
          id: 4,
          name: "Security Audit",
          type: "Security",
          lastGenerated: "2024-01-12",
          status: "completed",
          size: "1.2 MB",
          description: "Security events and access logs"
        },
        {
          id: 5,
          name: "Usage Statistics",
          type: "Analytics",
          lastGenerated: "2024-01-11",
          status: "completed",
          size: "3.1 MB",
          description: "Feature usage and adoption rates"
        },
        {
          id: 6,
          name: "Error Logs",
          type: "Technical",
          lastGenerated: "2024-01-10",
          status: "failed",
          size: "0.8 MB",
          description: "System errors and debugging information"
        }
      ];
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReportType) return;
    
    try {
      // Mock report generation
      const newReport = {
        id: reports.length + 1,
        name: `${selectedReportType} Report`,
        type: selectedReportType,
        lastGenerated: new Date().toISOString().split('T')[0],
        status: "processing",
        size: "0 MB",
        description: `Generated ${selectedReportType.toLowerCase()} report`
      };
      
      setReports([newReport, ...reports]);
      setShowGenerateModal(false);
      setSelectedReportType("");
      
      // Simulate processing completion
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === newReport.id 
            ? { ...r, status: "completed", size: "1.5 MB" }
            : r
        ));
      }, 3000);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const getStatusIcon = (status: Report["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "processing":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ReportCard = ({ report }: { report: Report }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <DocumentTextIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
            <p className="text-sm text-gray-600">{report.type}</p>
            <p className="text-xs text-gray-500">Last generated: {report.lastGenerated}</p>
            <p className="text-xs text-gray-500 mt-1">{report.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(report.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
            {report.status}
          </span>
          <span className="text-xs text-gray-500">{report.size}</span>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
          <EyeIcon className="h-4 w-4" />
          <span>View</span>
        </button>
        {report.status === "completed" && (
          <button className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg">
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Download</span>
          </button>
        )}
        {report.status === "failed" && (
          <button className="flex items-center space-x-1 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );

  const GenerateReportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select report type</option>
              <option value="Analytics">Analytics Report</option>
              <option value="Financial">Financial Report</option>
              <option value="Technical">Technical Report</option>
              <option value="Security">Security Report</option>
              <option value="Custom">Custom Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
              <option value="last_year">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setShowGenerateModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={!selectedReportType}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const completedReports = reports.filter(r => r.status === 'completed').length;
  const processingReports = reports.filter(r => r.status === 'processing').length;
  const failedReports = reports.filter(r => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and manage system reports</p>
        </div>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedReports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">{processingReports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{failedReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "User Analytics", description: "Detailed user activity and engagement metrics", type: "Analytics" },
            { name: "Financial Summary", description: "Revenue, expenses, and profit analysis", type: "Financial" },
            { name: "System Health", description: "Performance and uptime statistics", type: "Technical" },
            { name: "Security Audit", description: "Security events and access logs", type: "Security" },
            { name: "Usage Statistics", description: "Feature usage and adoption rates", type: "Analytics" },
            { name: "Custom Report", description: "Create your own custom report", type: "Custom" },
          ].map((template, index) => (
            <div 
              key={index} 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedReportType(template.type);
                setShowGenerateModal(true);
              }}
            >
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {template.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showGenerateModal && <GenerateReportModal />}
    </div>
  );
}
