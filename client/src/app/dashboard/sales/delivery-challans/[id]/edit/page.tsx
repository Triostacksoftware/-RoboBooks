'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import DeliveryChallanForm from '../../components/DeliveryChallanForm';
import { deliveryChallanService } from '@/services/deliveryChallanService';

// Define the DeliveryChallan interface based on the service
interface DeliveryChallan {
  _id: string;
  challanNo: string;
  challanDate: string;
  referenceNo?: string;
  customerId: string;
  challanType: string;
  placeOfSupply: string;
  shipTo: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  dispatchFrom: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  items: Array<{
    itemId: string;
    itemName: string;
    hsn: string;
    quantity: number;
    uom: string;
    rate: number;
    amount: number;
    notes?: string;
  }>;
  subTotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  discountAmount: number;
  adjustment: number;
  total: number;
  notes?: string;
  terms?: string;
  status: string;
  invoiceStatus: string;
  attachments: string[];
  fy: string;
  numberingSeries: string;
  audit: Array<{
    status: string;
    timestamp: string;
    userId: string;
    notes?: string;
  }>;
  emailLog: Array<{
    to: string;
    cc?: string;
    subject: string;
    message: string;
    messageId: string;
    status: string;
    timestamp: string;
  }>;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

const EditDeliveryChallanPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [deliveryChallan, setDeliveryChallan] = useState<DeliveryChallan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadDeliveryChallan();
    }
  }, [params.id]);

  const loadDeliveryChallan = async () => {
    try {
      setLoading(true);
      const response = await deliveryChallanService.getById(params.id as string);
      if (response.success && response.data) {
        setDeliveryChallan(response.data);
      } else {
        setError(response.error || 'Failed to load delivery challan');
        showToast('Failed to load delivery challan', 'error');
      }
    } catch (error) {
      setError('An error occurred while loading the delivery challan');
      showToast('Failed to load delivery challan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const response = await deliveryChallanService.update(params.id as string, formData);
      if (response.success) {
        showToast('Delivery Challan updated successfully!', 'success');
        router.push(`/dashboard/sales/delivery-challans/${params.id}`);
      } else {
        showToast(response.error || 'Failed to update delivery challan', 'error');
      }
    } catch (error) {
      showToast('Failed to update delivery challan', 'error');
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/sales/delivery-challans/${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery challan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Delivery Challan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/sales/delivery-challans')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!deliveryChallan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Delivery Challan Not Found</h2>
          <p className="text-gray-600 mb-4">The requested delivery challan could not be found.</p>
          <button
            onClick={() => router.push('/dashboard/sales/delivery-challans')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  // Check if challan can be edited
  if (deliveryChallan.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-600 text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cannot Edit Delivery Challan</h2>
          <p className="text-gray-600 mb-4">
            Only Draft delivery challans can be edited. This challan is currently in "{deliveryChallan.status}" status.
          </p>
          <button
            onClick={() => router.push(`/dashboard/sales/delivery-challans/${params.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Delivery Challan #{deliveryChallan.challanNo}</h1>
              <p className="text-gray-600 mt-1">Modify the delivery challan details</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DeliveryChallanForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={false}
            mode="edit"
            initialData={deliveryChallan}
          />
        </div>
      </div>
    </div>
  );
};

export default EditDeliveryChallanPage;
