import React, { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  ArrowUpDown,
} from "lucide-react";

interface SearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateAccount: () => void;
  onImportExcel: () => void;
  onExportExcel: () => void;
}

const SearchAndActions: React.FC<SearchAndActionsProps> = ({
  searchTerm,
  onSearchChange,
  onCreateAccount,
  onImportExcel,
  onExportExcel,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCreateAccount}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Account
        </button>

        <button
          onClick={onImportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Import Excel
        </button>

        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export (csv)
        </button>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowUpDown className="h-4 w-4" />
          Sort By
        </button>
      </div>
    </div>
  );
};

export default SearchAndActions;
