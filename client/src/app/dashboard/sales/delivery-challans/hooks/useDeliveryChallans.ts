import { useState, useEffect, useCallback } from 'react';
import { deliveryChallanService } from '../services/deliveryChallanService';

interface DeliveryChallan {
  _id: string;
  challanNo: string;
  challanDate: string;
  referenceNo?: string;
  customerId: string | {
    _id: string;
    displayName: string;
    email: string;
  };
  status: string;
  invoiceStatus: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface UseDeliveryChallansProps {
  filters: {
    status: string;
    dateFrom: string;
    dateTo: string;
    customerId: string;
  };
  search: string;
  page: number;
  sortBy: string;
  sortOrder: string;
}

interface UseDeliveryChallansReturn {
  deliveryChallans: DeliveryChallan[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  refetch: () => void;
}

export const useDeliveryChallans = ({
  filters,
  search,
  page,
  sortBy,
  sortOrder
}: UseDeliveryChallansProps): UseDeliveryChallansReturn => {
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchDeliveryChallans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      // Add filters
      if (filters.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters.customerId) {
        params.append('customerId', filters.customerId);
      }
      
      // Add search
      if (search) {
        params.append('search', search);
      }
      
      // Add pagination
      params.append('page', page.toString());
      params.append('limit', '25');
      
      // Add sorting
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await deliveryChallanService.getAll(params.toString());
      
      if (response.success && response.data) {
        setDeliveryChallans(response.data.deliveryChallans ?? []);
        setPagination(response.data.pagination ?? null);
      } else {
        setError(response.error || 'Failed to fetch delivery challans');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, search, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchDeliveryChallans();
  }, [fetchDeliveryChallans]);

  const refetch = useCallback(() => {
    fetchDeliveryChallans();
  }, [fetchDeliveryChallans]);

  return {
    deliveryChallans,
    loading,
    error,
    pagination,
    refetch
  };
};
