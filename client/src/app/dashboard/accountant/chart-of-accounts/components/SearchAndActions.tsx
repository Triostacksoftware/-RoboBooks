import React from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Upload,
} from "lucide-react";
import { chartOfAccountsAPI } from "../../../../../lib/api";

interface SearchAndActionsProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  onCreateAccount: () => void;
  onUploadExcel: () => void;
}

const SearchAndActions: React.FC<SearchAndActionsProps> = ({
  searchTerm,
  onSearch,
  onCreateAccount,
  onUploadExcel,
}) => {
  const handleExport = async () => {
    try {
      const blob = await chartOfAccountsAPI.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chart-of-accounts-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Bar */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onCreateAccount}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Account
        </button>

        <button
          onClick={onUploadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Import Excel
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export (csv)
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <ArrowUpDown className="h-4 w-4" />
          Sort By
        </button>
      </div>
    </div>
  );
};

export default SearchAndActions;
