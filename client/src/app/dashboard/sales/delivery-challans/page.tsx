'use client';

import React, { useState, useEffect } from 'react';
import DeliveryChallanList from './components/DeliveryChallanList';
import DeliveryChallanFilters from './components/DeliveryChallanFilters';
import DeliveryChallanSearch from './components/DeliveryChallanSearch';
import { useDeliveryChallans } from './hooks/useDeliveryChallans';

// Define the filters type to match what the hook expects
interface Filters {
  status: string;
  dateFrom: string;
  dateTo: string;
  customerId: string;
}

const DeliveryChallansPage = () => {
  const [filters, setFilters] = useState<Filters>({
    status: 'All',
    dateFrom: '',
    dateTo: '',
    customerId: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { 
    deliveryChallans, 
    loading, 
    error, 
    pagination,
    refetch 
  } = useDeliveryChallans({
    filters,
    search: searchQuery,
    page: currentPage,
    sortBy,
    sortOrder
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Transform deliveryChallans to match the component's expected type
  const transformedDeliveryChallans = deliveryChallans.map(challan => ({
    ...challan,
    customerId: typeof challan.customerId === 'string' 
      ? { _id: challan.customerId, displayName: 'Unknown Customer', email: '' }
      : challan.customerId
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Challans</h1>
          <p className="text-gray-600 mt-1">Manage and track delivery of goods</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <DeliveryChallanSearch 
                onSearch={handleSearch}
                placeholder="Search by DC#, customer, reference..."
              />
            </div>
            <div className="lg:w-80">
              <DeliveryChallanFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DeliveryChallanList
            deliveryChallans={transformedDeliveryChallans}
            loading={loading}
            error={error}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onRefresh={refetch}
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallansPage;
