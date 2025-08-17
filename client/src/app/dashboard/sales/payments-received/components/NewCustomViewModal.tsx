import { useState } from 'react';
import {
  XMarkIcon,
  StarIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  LockClosedIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface NewCustomViewModalProps {
  onClose: () => void;
  onCustomViewCreated: (customView: any) => void;
}

export default function NewCustomViewModal({ onClose, onCustomViewCreated }: NewCustomViewModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    isFavorite: false,
    criteria: [{ field: '', comparator: '', value: '' }],
    selectedColumns: ['Date', 'Customer Name', 'Mode', 'Amount'],
    visibility: 'only-me',
    selectedUsers: [],
    selectedRoles: []
  });

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const availableColumns = [
    'Payment#',
    'Reference#',
    'Invoice#',
    'Unused Amount',
    'Payment Type',
    'Status',
    'Notes',
    'Created Date',
    'Modified Date'
  ];

  const comparators = [
    'equals',
    'not equals',
    'contains',
    'does not contain',
    'starts with',
    'ends with',
    'greater than',
    'less than',
    'is empty',
    'is not empty'
  ];

  const availableUsers = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Wilson',
    'David Brown'
  ];

  const availableRoles = [
    'Admin',
    'Manager',
    'Accountant',
    'Viewer',
    'Editor'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCriteriaChange = (index: number, field: string, value: string) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setFormData(prev => ({ ...prev, criteria: newCriteria }));
  };

  const addCriterion = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, { field: '', comparator: '', value: '' }]
    }));
  };

  const removeCriterion = (index: number) => {
    if (formData.criteria.length > 1) {
      const newCriteria = formData.criteria.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, criteria: newCriteria }));
    }
  };

  const toggleColumn = (column: string) => {
    const isSelected = formData.selectedColumns.includes(column);
    if (isSelected) {
      // Don't allow removing required columns
      if (['Date', 'Customer Name', 'Mode', 'Amount'].includes(column)) {
        return;
      }
      setFormData(prev => ({
        ...prev,
        selectedColumns: prev.selectedColumns.filter(col => col !== column)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedColumns: [...prev.selectedColumns, column]
      }));
    }
  };

  const toggleUser = (user: string) => {
    const isSelected = formData.selectedUsers.includes(user);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedUsers: prev.selectedUsers.filter(u => u !== user)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedUsers: [...prev.selectedUsers, user]
      }));
    }
  };

  const toggleRole = (role: string) => {
    const isSelected = formData.selectedRoles.includes(role);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedRoles: prev.selectedRoles.filter(r => r !== role)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedRoles: [...prev.selectedRoles, role]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name for the custom view.');
      return;
    }

    const customView = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    onCustomViewCreated(customView);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">New Custom View</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Name Section */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter custom view name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <button
                type="button"
                onClick={() => handleInputChange('isFavorite', !formData.isFavorite)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  formData.isFavorite
                    ? 'text-yellow-500 bg-yellow-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <StarIcon className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">Mark as Favorite</span>
            </div>
          </div>

          {/* Define Criteria Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Define the criteria (if any)</h3>
            <div className="space-y-3">
              {formData.criteria.map((criterion, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <select
                    value={criterion.field}
                    onChange={(e) => handleCriteriaChange(index, 'field', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a field</option>
                    {availableColumns.map(column => (
                      <option key={column} value={column}>{column}</option>
                    ))}
                  </select>
                  <select
                    value={criterion.comparator}
                    onChange={(e) => handleCriteriaChange(index, 'comparator', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a comparator</option>
                    {comparators.map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={criterion.value}
                    onChange={(e) => handleCriteriaChange(index, 'value', e.target.value)}
                    placeholder="Enter value"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeCriterion(index)}
                    disabled={formData.criteria.length === 1}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCriterion}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                + Add Criterion
              </button>
            </div>
          </div>

          {/* Columns Preference Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Columns Preference:</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Available Columns */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">AVAILABLE COLUMNS</h4>
                <div className="relative mb-3">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableColumns
                    .filter(col => !formData.selectedColumns.includes(col))
                    .map(column => (
                      <div
                        key={column}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => toggleColumn(column)}
                      >
                        <div className="text-gray-400 cursor-move">⋮⋮</div>
                        <span className="text-sm text-gray-700">{column}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Selected Columns */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-700">SELECTED COLUMNS</h4>
                  <CheckIcon className="w-4 h-4 text-green-500" />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.selectedColumns.map(column => (
                    <div
                      key={column}
                      className="flex items-center space-x-2 p-2 bg-blue-50 rounded"
                    >
                      <div className="text-gray-400 cursor-move">⋮⋮</div>
                      <span className="text-sm text-gray-700">
                        {column}
                        {['Date', 'Customer Name', 'Mode', 'Amount'].includes(column) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Preference Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibility Preference</h3>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Share this with</label>
              <div className="space-y-3">
                {[
                  { value: 'only-me', label: 'Only Me', icon: LockClosedIcon, description: 'Private access' },
                  { value: 'selected-users', label: 'Only Selected Users & Roles', icon: UserIcon, description: 'Specific access' },
                  { value: 'everyone', label: 'Everyone', icon: BuildingOfficeIcon, description: 'Public access' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={formData.visibility === option.value}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <option.icon className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* User/Role Selection Interface - Only show when "Only Selected Users & Roles" is selected */}
              {formData.visibility === 'selected-users' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">
                      You haven't shared this Custom View with any users yet. Select the users or roles to share it with and provide their access permissions.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Users Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Users</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowUserDropdown(!showUserDropdown)}
                          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <span className="text-gray-500">Select Users</span>
                          {showUserDropdown ? (
                            <ChevronUpIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        
                        {showUserDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {availableUsers.map(user => (
                              <button
                                key={user}
                                type="button"
                                onClick={() => toggleUser(user)}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-50 ${
                                  formData.selectedUsers.includes(user) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {user}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Selected Users Display */}
                      {formData.selectedUsers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.selectedUsers.map(user => (
                            <span
                              key={user}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {user}
                              <button
                                type="button"
                                onClick={() => toggleUser(user)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Roles Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <span className="text-gray-500">Select Roles</span>
                          {showRoleDropdown ? (
                            <ChevronUpIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        
                        {showRoleDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {availableRoles.map(role => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => toggleRole(role)}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-50 ${
                                  formData.selectedRoles.includes(role) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Selected Roles Display */}
                      {formData.selectedRoles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.selectedRoles.map(role => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                            >
                              {role}
                              <button
                                type="button"
                                onClick={() => toggleRole(role)}
                                className="ml-1 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      + Add Users
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-start space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
