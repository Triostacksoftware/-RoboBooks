"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Calendar,
  FileText,
  User
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CurrencyAdjustment {
  _id: string;
  accountId?: string;
  accountName: string;
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  adjustmentDate: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  adjustmentType: 'gain' | 'loss' | 'neutral';
  amount: number;
  referenceNumber?: string;
  userId: string;
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const ViewCurrencyAdjustmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [adjustment, setAdjustment] = useState<CurrencyAdjustment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadAdjustment();
    }
  }, [params.id]);

  const loadAdjustment = async () => {
    try {
      setLoading(true);
      const response = await api<{ success: boolean; data: CurrencyAdjustment }>(`/api/currency/adjustments/${params.id}`);
      if (response.success) {
        setAdjustment(response.data);
      } else {
        setError('Failed to load currency adjustment');
      }
    } catch (error) {
      console.error('Error loading adjustment:', error);
      setError('Failed to load currency adjustment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case 'gain':
        return 'bg-green-100 text-green-800';
      case 'loss':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading currency adjustment...</p>
        </div>
      </div>
    );
  }

  if (error || !adjustment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Currency adjustment not found'}</p>
          <button
            onClick={() => router.push('/dashboard/accountant/currency-adjustments')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Adjustments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/accountant/currency-adjustments')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Currency Adjustments
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Currency Adjustment Details</h1>
              <p className="text-gray-600 mt-2">Reference: {adjustment.referenceNumber}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(adjustment.status)}`}>
                {getStatusIcon(adjustment.status)}
                <span className="ml-2 capitalize">{adjustment.status}</span>
              </span>
              
              {adjustment.status === 'pending' && (
                <button
                  onClick={() => router.push(`/dashboard/accountant/currency-adjustments/edit/${adjustment._id}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Currency Conversion Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Currency Conversion
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Currency</label>
                  <p className="mt-1 text-sm text-gray-900">{adjustment.fromCurrency}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Currency</label>
                  <p className="mt-1 text-sm text-gray-900">{adjustment.toCurrency}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Original Amount</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {adjustment.originalAmount.toLocaleString()} {adjustment.fromCurrency}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exchange Rate</label>
                  <p className="mt-1 text-sm text-gray-900">{adjustment.exchangeRate.toFixed(4)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Converted Amount</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {adjustment.convertedAmount.toLocaleString()} {adjustment.toCurrency}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAdjustmentTypeColor(adjustment.adjustmentType)}`}>
                    {adjustment.adjustmentType.charAt(0).toUpperCase() + adjustment.adjustmentType.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Description
              </h2>
              <p className="text-sm text-gray-900">{adjustment.description}</p>
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account</label>
                <p className="mt-1 text-sm text-gray-900">{adjustment.accountName}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Dates
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adjustment Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(adjustment.adjustmentDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(adjustment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {adjustment.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Approved</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(adjustment.approvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Information */}
            {adjustment.status !== 'pending' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Approval Information
                </h2>
                
                {adjustment.status === 'approved' && adjustment.approvedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Approved By</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {adjustment.approvedBy.firstName} {adjustment.approvedBy.lastName}
                    </p>
                  </div>
                )}
                
                {adjustment.status === 'rejected' && adjustment.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <p className="mt-1 text-sm text-gray-900">{adjustment.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCurrencyAdjustmentPage;
