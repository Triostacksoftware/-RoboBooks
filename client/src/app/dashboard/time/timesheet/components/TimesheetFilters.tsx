'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';

interface TimesheetFiltersProps {
  filters: {
    period: string;
    customer: string;
    project: string;
    user: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function TimesheetFilters({ filters, onFilterChange }: TimesheetFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');

  const clearAllFilters = () => {
    onFilterChange('period', 'all');
    onFilterChange('customer', '');
    onFilterChange('project', '');
    onFilterChange('user', '');
    onFilterChange('status', 'all');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Filters:</span>
          </div>

          {/* Period Filter */}
          <select
            value={filters.period}
            onChange={(e) => onFilterChange('period', e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Periods</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          {/* Customer Filter */}
          <select
            value={filters.customer}
            onChange={(e) => onFilterChange('customer', e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Customers</option>
            <option value="customer1">Customer A</option>
            <option value="customer2">Customer B</option>
            <option value="customer3">Customer C</option>
          </select>

          {/* Project Filter */}
          <select
            value={filters.project}
            onChange={(e) => onFilterChange('project', e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Projects</option>
            <option value="project1">Website Redesign</option>
            <option value="project2">Mobile App Development</option>
            <option value="project3">Database Migration</option>
          </select>

          {/* User Filter */}
          <select
            value={filters.user}
            onChange={(e) => onFilterChange('user', e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Users</option>
            <option value="user1">John Doe</option>
            <option value="user2">Jane Smith</option>
            <option value="user3">Mike Johnson</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
