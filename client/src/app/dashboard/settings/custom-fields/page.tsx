"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { preferencesService, CustomField } from "@/services/preferencesService";

export default function CustomFieldsPage() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('expenses');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<CustomField | null>(null);
  const [customFieldForm, setCustomFieldForm] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text' as 'text' | 'number' | 'decimal' | 'amount' | 'date' | 'datetime' | 'time' | 'email' | 'url' | 'phone' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'currency' | 'percentage' | 'attachment' | 'lookup' | 'auto-generate-number' | 'checkbox' | 'text-box-multi-line',
    isRequired: false,
    defaultValue: '',
    options: [] as string[],
    helpText: '',
    inputFormat: '',
    dataPrivacy: {
      pii: false,
      ephi: false
    },
    validation: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      pattern: '' as string | undefined
    }
  });
  const [newOption, setNewOption] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [remainingFields, setRemainingFields] = useState(20);
  const [showCustomFormatOptions, setShowCustomFormatOptions] = useState(false);

  const modules = [
    { value: 'expenses', label: 'Expenses' },
    { value: 'bills', label: 'Bills' },
    { value: 'payments', label: 'Payments Made' },
    { value: 'purchase-orders', label: 'Purchase Orders' },
    { value: 'vendor-credits', label: 'Vendor Credits' },
    { value: 'vendors', label: 'Vendors' },
    { value: 'recurring-bills', label: 'Recurring Bills' },
    { value: 'recurring-expenses', label: 'Recurring Expenses' }
  ];

  // Fetch custom fields when module changes
  useEffect(() => {
    fetchCustomFields();
  }, [activeModule]);

  const fetchCustomFields = async () => {
    try {
      const fields = await preferencesService.getCustomFields(activeModule);
      setCustomFields(fields);
      // Calculate remaining fields (assuming max 20 fields per module)
      setRemainingFields(Math.max(0, 20 - fields.length));
    } catch (error) {
      console.error('Error fetching custom fields:', error);
    }
  };

  const handleAddCustomField = async () => {
    if (!customFieldForm.fieldName.trim() || !customFieldForm.fieldLabel.trim()) {
      alert('Field name and label are required');
      return;
    }

    try {
      const fieldData = {
        ...customFieldForm,
        fieldName: customFieldForm.fieldName.trim(),
        fieldLabel: customFieldForm.fieldLabel.trim(),
        isActive: true,
        options: (customFieldForm.fieldType === 'select' || customFieldForm.fieldType === 'multiselect') ? customFieldForm.options : undefined,
        validation: customFieldForm.validation.min || customFieldForm.validation.max || customFieldForm.validation.pattern ? customFieldForm.validation : undefined
      };

      if (editingCustomField) {
        await preferencesService.updateCustomField(activeModule, editingCustomField._id!, fieldData);
      } else {
        await preferencesService.createCustomField(activeModule, fieldData);
      }

      await fetchCustomFields();
      setShowCustomFieldModal(false);
      resetCustomFieldForm();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving custom field:', error);
      alert('Error saving custom field');
    }
  };

  const handleEditCustomField = (field: CustomField) => {
    setEditingCustomField(field);
    setCustomFieldForm({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      defaultValue: field.defaultValue || '',
      options: field.options || [],
      helpText: (field as any).helpText || '',
      inputFormat: (field as any).inputFormat || '',
      dataPrivacy: {
        pii: (field as any).dataPrivacy?.pii || false,
        ephi: (field as any).dataPrivacy?.ephi || false
      },
      validation: {
        min: field.validation?.min,
        max: field.validation?.max,
        pattern: field.validation?.pattern || ''
      }
    });
    // Show custom format options if the field has an input format set
    setShowCustomFormatOptions(!!(field as any).inputFormat);
    setShowCustomFieldModal(true);
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      try {
        await preferencesService.deleteCustomField(activeModule, fieldId);
        await fetchCustomFields();
      } catch (error) {
        console.error('Error deleting custom field:', error);
        alert('Error deleting custom field');
      }
    }
  };

  const handleToggleCustomField = async (fieldId: string, isActive: boolean) => {
    try {
      await preferencesService.toggleCustomField(activeModule, fieldId, isActive);
      await fetchCustomFields();
    } catch (error) {
      console.error('Error toggling custom field:', error);
      alert('Error updating custom field');
    }
  };

  const resetCustomFieldForm = () => {
    setCustomFieldForm({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      isRequired: false,
      defaultValue: '',
      options: [],
      helpText: '',
      inputFormat: '',
      dataPrivacy: {
        pii: false,
        ephi: false
      },
      validation: { min: undefined, max: undefined, pattern: '' as string | undefined }
    });
    setEditingCustomField(null);
    setNewOption('');
    setShowCustomFormatOptions(false);
  };

  const handleCloseCustomFieldModal = () => {
    setShowCustomFieldModal(false);
    resetCustomFieldForm();
  };

  const addOption = () => {
    if (newOption.trim() && !customFieldForm.options.includes(newOption.trim())) {
      setCustomFieldForm(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setCustomFieldForm(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt !== option)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span>All Settings</span>
              </button>
              <div className="text-sm text-gray-500">Triostack</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search settings (/)"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">All Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Organization Settings
                </h3>
                <div className="space-y-2">
                  {['Organization', 'Users & Roles', 'Taxes & Compliance', 'Setup & Configurations', 'Customisation'].map((item) => (
                    <button
                      key={item}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Module Settings
                </h3>
                <div className="space-y-2">
                  {['General', 'Online Payments', 'Sales'].map((item) => (
                    <button
                      key={item}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                  ))}
                  
                  <div>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between">
                      <span>Purchases</span>
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <div className="ml-4 mt-2 space-y-1">
                      <button className="w-full text-left px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg">
                        Custom Fields
                      </button>
                      {['Expenses', 'Purchase Orders', 'Bills', 'Vendor Credits'].map((item) => (
                        <button
                          key={item}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Custom Fields</h1>
            
            {/* Module Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Module
              </label>
              <select
                value={activeModule}
                onChange={(e) => setActiveModule(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {modules.map((module) => (
                  <option key={module.value} value={module.value}>
                    {module.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800">Custom field saved successfully</span>
              </div>
            )}

            {/* Custom Fields Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Custom Fields for {modules.find(m => m.value === activeModule)?.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create custom fields to capture additional information for your {activeModule}.
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomFieldModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New Custom Field</span>
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {customFields.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first custom field for {activeModule}.</p>
                    <button
                      onClick={() => setShowCustomFieldModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Custom Field
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          FIELD NAME
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          FIELD TYPE
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          REQUIRED
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customFields.map((field) => (
                        <tr key={field._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{field.fieldLabel}</div>
                              <div className="text-sm text-gray-500">{field.fieldName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {field.fieldType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {field.isRequired ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleCustomField(field._id!, !field.isActive)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                field.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {field.isActive ? (
                                <>
                                  <EyeIcon className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeSlashIcon className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCustomField(field)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit field"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomField(field._id!)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete field"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Field Modal */}
      {showCustomFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCustomField ? 'Edit Custom Field' : 'New Custom Field'}
              </h3>
              <button
                onClick={handleCloseCustomFieldModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Field Name */}
              <div>
                <label className="block text-sm font-medium text-red-600 mb-1">
                  Field Name*
                </label>
                <input
                  type="text"
                  value={customFieldForm.fieldName}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, fieldName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., project_code"
                />
                <p className="text-xs text-gray-500 mt-1">Internal field name (no spaces, lowercase)</p>
              </div>

              {/* Field Label */}
              <div>
                <label className="block text-sm font-medium text-red-600 mb-1">
                  Field Label*
                </label>
                <input
                  type="text"
                  value={customFieldForm.fieldLabel}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, fieldLabel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Project Code"
                />
                <p className="text-xs text-gray-500 mt-1">Display name for the field</p>
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type*
                </label>
                <select
                  value={customFieldForm.fieldType}
                  onChange={(e) => setCustomFieldForm(prev => ({ 
                    ...prev, 
                    fieldType: e.target.value as any,
                    options: (e.target.value === 'select' || e.target.value === 'multiselect') ? prev.options : []
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text Box (Single Line)</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="phone">Phone</option>
                  <option value="number">Number</option>
                  <option value="decimal">Decimal</option>
                  <option value="amount">Amount</option>
                  <option value="percentage">Percent</option>
                  <option value="date">Date</option>
                  <option value="datetime">Date and Time</option>
                  <option value="checkbox">Check Box</option>
                  <option value="auto-generate-number">Auto-Generate Number</option>
                  <option value="select">Dropdown</option>
                  <option value="multiselect">Multi-select</option>
                  <option value="lookup">Lookup</option>
                  <option value="text-box-multi-line">Text Box (Multi-line)</option>
                  <option value="attachment">Attachment</option>
                </select>
                <div className="mt-1 text-sm text-gray-500">
                  Remaining Fields: {remainingFields}
                </div>
              </div>

              {/* Help Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Help Text
                </label>
                <textarea
                  value={customFieldForm.helpText}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, helpText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter some text to help users understand the purpose of this custom field"
                  rows={3}
                />
              </div>

               {/* Input Format - Dynamic based on field type */}
               {(['text', 'email', 'url', 'phone'].includes(customFieldForm.fieldType)) && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Input Format
                     <span className="ml-1 text-gray-400 cursor-help" title="Choose a predefined format or configure a custom one">?</span>
                   </label>
                   
                   {customFieldForm.fieldType === 'email' ? (
                     // Email specific input format - simple text input
                     <input
                       type="text"
                       value={customFieldForm.inputFormat}
                       onChange={(e) => setCustomFieldForm(prev => ({ ...prev, inputFormat: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="Enter input format for email"
                     />
                   ) : customFieldForm.fieldType === 'text' ? (
                     // Text field - show dropdown with format options
                     <div className="space-y-2">
                       <select
                         value={customFieldForm.inputFormat}
                         onChange={(e) => setCustomFieldForm(prev => ({ ...prev, inputFormat: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       >
                         <option value="">Select Input Format</option>
                         <option value="numbers">Numbers</option>
                         <option value="alphanumeric-without-spaces">Alphanumeric Characters Without Spaces</option>
                         <option value="alphanumeric-with-spaces">Alphanumeric Characters With Spaces</option>
                         <option value="alphanumeric-with-hyphens-underscores">Alphanumeric Characters With Hyphens and Underscores</option>
                         <option value="alphabets-without-spaces">Alphabets Without Spaces</option>
                         <option value="alphabets-with-spaces">Alphabets With Spaces</option>
                       </select>
                       
                       {customFieldForm.inputFormat && (
                         <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                           {customFieldForm.inputFormat === 'numbers' && 'This format ensures that the custom field accepts only a combination of the numbers 0-9.'}
                           {customFieldForm.inputFormat === 'alphanumeric-without-spaces' && 'This format ensures that the custom field accepts only a combination of lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9).'}
                           {customFieldForm.inputFormat === 'alphanumeric-with-spaces' && 'This format ensures that the custom field accepts only a combination of lowercase letters (a-z), uppercase letters (A-Z), letters, numbers, and spaces.'}
                           {customFieldForm.inputFormat === 'alphanumeric-with-hyphens-underscores' && 'This format ensures that the custom field accepts only a combination of lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), hyphens (-), and underscores (-).'}
                           {customFieldForm.inputFormat === 'alphabets-without-spaces' && 'This format ensures that the custom field accepts only a combination of lowercase (a-z) and uppercase (A-Z) letters.'}
                           {customFieldForm.inputFormat === 'alphabets-with-spaces' && 'This format ensures that the custom field accepts only a combination of lowercase letters (a-z), uppercase letters (A-Z), and spaces.'}
                         </div>
                       )}
                     </div>
                   ) : customFieldForm.fieldType === 'url' ? (
                     // URL specific input format - simple text input
                     <input
                       type="text"
                       value={customFieldForm.inputFormat}
                       onChange={(e) => setCustomFieldForm(prev => ({ ...prev, inputFormat: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="Enter input format for URL"
                     />
                   ) : customFieldForm.fieldType === 'phone' ? (
                     // Phone specific input format - simple text input
                     <input
                       type="text"
                       value={customFieldForm.inputFormat}
                       onChange={(e) => setCustomFieldForm(prev => ({ ...prev, inputFormat: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="Enter input format for phone"
                     />
                   ) : null}
                 </div>
               )}

              {/* Data Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Privacy
                  <span className="ml-1 text-gray-400 cursor-help" title="Specify if this field contains sensitive information">?</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pii"
                      checked={customFieldForm.dataPrivacy.pii}
                      onChange={(e) => setCustomFieldForm(prev => ({ 
                        ...prev, 
                        dataPrivacy: { ...prev.dataPrivacy, pii: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pii" className="ml-2 text-sm text-gray-700">
                      PII (Personally Identifiable Information)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ephi"
                      checked={customFieldForm.dataPrivacy.ephi}
                      onChange={(e) => setCustomFieldForm(prev => ({ 
                        ...prev, 
                        dataPrivacy: { ...prev.dataPrivacy, ephi: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="ephi" className="ml-2 text-sm text-gray-700">
                      ePHI (Electronic Protected Health Information)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Data will be stored without encryption and will be visible to all users.
                  </p>
                </div>
              </div>

              {/* Required Field */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={customFieldForm.isRequired}
                  onChange={(e) => setCustomFieldForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="ml-3 text-sm font-medium text-gray-700">
                  Make this field required
                </label>
              </div>

              {/* Default Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Value
                </label>
                {customFieldForm.fieldType === 'boolean' ? (
                  <select
                    value={customFieldForm.defaultValue}
                    onChange={(e) => setCustomFieldForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No default</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (customFieldForm.fieldType === 'select' || customFieldForm.fieldType === 'multiselect') ? (
                  <select
                    value={customFieldForm.defaultValue}
                    onChange={(e) => setCustomFieldForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No default</option>
                    {customFieldForm.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (customFieldForm.fieldType === 'text-box-multi-line') ? (
                  <textarea
                    value={customFieldForm.defaultValue}
                    onChange={(e) => setCustomFieldForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter default value"
                    rows={3}
                  />
                ) : customFieldForm.fieldType === 'attachment' ? (
                  <div className="text-sm text-gray-500 italic">
                    Attachments cannot have default values
                  </div>
                ) : customFieldForm.fieldType === 'lookup' ? (
                  <div className="text-sm text-gray-500 italic">
                    Lookup fields use referenced data, no default values needed
                  </div>
                ) : customFieldForm.fieldType === 'auto-generate-number' ? (
                  <div className="text-sm text-gray-500 italic">
                    Auto-generated numbers are created automatically
                  </div>
                ) : (
                  <input
                    type={
                      ['number', 'decimal', 'amount', 'percentage'].includes(customFieldForm.fieldType) ? 'number' : 
                      customFieldForm.fieldType === 'date' ? 'date' : 
                      customFieldForm.fieldType === 'datetime' ? 'datetime-local' :
                      customFieldForm.fieldType === 'email' ? 'email' :
                      customFieldForm.fieldType === 'url' ? 'url' :
                      customFieldForm.fieldType === 'phone' ? 'tel' :
                      'text'
                    }
                    value={customFieldForm.defaultValue}
                    onChange={(e) => setCustomFieldForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter default value"
                    step={['percentage', 'decimal', 'amount'].includes(customFieldForm.fieldType) ? '0.01' : undefined}
                  />
                )}
              </div>

              {/* Options for Select Field */}
              {(customFieldForm.fieldType === 'select' || customFieldForm.fieldType === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options*
                  </label>
                  <div className="space-y-2">
                    {customFieldForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                          {option}
                        </span>
                        <button
                          onClick={() => removeOption(option)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addOption()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add new option"
                      />
                      <button
                        onClick={addOption}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Rules */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Validation Rules (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['number', 'decimal', 'amount', 'percentage'].includes(customFieldForm.fieldType)) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Value
                        </label>
                        <input
                          type="number"
                          value={customFieldForm.validation.min || ''}
                          onChange={(e) => setCustomFieldForm(prev => ({ 
                            ...prev, 
                            validation: { ...prev.validation, min: e.target.value ? parseFloat(e.target.value) : undefined }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Min value"
                          step={['percentage', 'decimal', 'amount'].includes(customFieldForm.fieldType) ? '0.01' : undefined}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Value
                        </label>
                        <input
                          type="number"
                          value={customFieldForm.validation.max || ''}
                          onChange={(e) => setCustomFieldForm(prev => ({ 
                            ...prev, 
                            validation: { ...prev.validation, max: e.target.value ? parseFloat(e.target.value) : undefined }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Max value"
                          step={['percentage', 'decimal', 'amount'].includes(customFieldForm.fieldType) ? '0.01' : undefined}
                        />
                      </div>
                    </>
                  )}
                  {(['text', 'text-box-multi-line', 'email', 'url', 'phone'].includes(customFieldForm.fieldType)) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pattern (Regex)
                      </label>
                      <input
                        type="text"
                        value={customFieldForm.validation.pattern}
                        onChange={(e) => setCustomFieldForm(prev => ({ 
                          ...prev, 
                          validation: { ...prev.validation, pattern: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., ^[A-Z0-9]+$ for uppercase alphanumeric"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {customFieldForm.fieldType === 'email' && 'Leave empty for standard email validation'}
                        {customFieldForm.fieldType === 'url' && 'Leave empty for standard URL validation'}
                        {customFieldForm.fieldType === 'phone' && 'Leave empty for standard phone validation'}
                        {customFieldForm.fieldType === 'text' && 'Custom regex pattern for text validation'}
                        {customFieldForm.fieldType === 'textarea' && 'Custom regex pattern for textarea validation'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseCustomFieldModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingCustomField ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
