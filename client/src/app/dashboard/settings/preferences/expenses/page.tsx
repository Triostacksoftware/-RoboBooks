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

interface Vehicle {
  _id: string;
  name: string;
  hint: string;
}

interface MileageRate {
  _id: string;
  startDate: string;
  rate: number;
}

export default function ExpensesPreferencesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'preferences' | 'vehicle' | 'custom-fields'>('preferences');
  
  // Preferences state
  const [associateEmployees, setAssociateEmployees] = useState(false);
  const [defaultMileageCategory, setDefaultMileageCategory] = useState('Fuel/Mileage Expenses');
  const [defaultUnit, setDefaultUnit] = useState<'km' | 'mile'>('km');
  const [mileageRates, setMileageRates] = useState<MileageRate[]>([]);
  
  // Vehicle state
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { _id: '1', name: 'fsdfs', hint: 'ffffa' }
  ]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Vehicle modal state
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleHint, setVehicleHint] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Custom Fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<CustomField | null>(null);
  const [customFieldForm, setCustomFieldForm] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text' as 'text' | 'number' | 'date' | 'select' | 'boolean',
    isRequired: false,
    defaultValue: '',
    options: [] as string[],
    validation: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      pattern: ''
    }
  });
  const [newOption, setNewOption] = useState('');
  
  // Mileage category dropdown state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  
  const mileageCategories = [
    'Purchase Discounts',
    'Raw Materials And Consumables',
    'Merchandise',
    'Transportation Expense',
    'Depreciation And Amortisation',
    'Contract Assets',
    'Fuel/Mileage Expenses',
  ];

  const filteredCategories = mileageCategories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSavePreferences = async () => {
    try {
      // Save preferences logic here
      console.log('Saving preferences:', {
        associateEmployees,
        defaultMileageCategory,
        defaultUnit,
        mileageRates
      });
      
      // Show success message
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences');
    }
  };

  const handleAddVehicle = async () => {
    if (!vehicleName.trim()) {
      alert('Vehicle name is required');
      return;
    }

    try {
      if (editingVehicle) {
        // Update existing vehicle
        setVehicles(prev => prev.map(vehicle => 
          vehicle._id === editingVehicle._id 
            ? { ...vehicle, name: vehicleName, hint: vehicleHint }
            : vehicle
        ));
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        // Add new vehicle
        const newVehicle: Vehicle = {
          _id: Date.now().toString(),
          name: vehicleName,
          hint: vehicleHint
        };
        setVehicles(prev => [...prev, newVehicle]);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }

      setShowVehicleModal(false);
      setVehicleName('');
      setVehicleHint('');
      setEditingVehicle(null);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Error saving vehicle');
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleName(vehicle.name);
    setVehicleHint(vehicle.hint);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(prev => prev.filter(vehicle => vehicle._id !== vehicleId));
    }
  };

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setVehicleName('');
    setVehicleHint('');
    setEditingVehicle(null);
  };

  const handleAddMileageRate = () => {
    const newRate: MileageRate = {
      _id: Date.now().toString(),
      startDate: '',
      rate: 0
    };
    setMileageRates(prev => [...prev, newRate]);
  };

  const handleMileageRateChange = (id: string, field: 'startDate' | 'rate', value: string | number) => {
    setMileageRates(prev => prev.map(rate => 
      rate._id === id ? { ...rate, [field]: value } : rate
    ));
  };

  const handleRemoveMileageRate = (id: string) => {
    setMileageRates(prev => prev.filter(rate => rate._id !== id));
  };

  // Custom Fields functions
  const fetchCustomFields = async () => {
    try {
      const fields = await preferencesService.getCustomFields('expenses');
      setCustomFields(fields);
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
        options: customFieldForm.fieldType === 'select' ? customFieldForm.options : undefined,
        validation: customFieldForm.validation.min || customFieldForm.validation.max || customFieldForm.validation.pattern ? customFieldForm.validation : undefined
      };

      if (editingCustomField) {
        await preferencesService.updateCustomField('expenses', editingCustomField._id!, fieldData);
      } else {
        await preferencesService.createCustomField('expenses', fieldData);
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
      validation: field.validation || { min: undefined, max: undefined, pattern: '' }
    });
    setShowCustomFieldModal(true);
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      try {
        await preferencesService.deleteCustomField('expenses', fieldId);
        await fetchCustomFields();
      } catch (error) {
        console.error('Error deleting custom field:', error);
        alert('Error deleting custom field');
      }
    }
  };

  const handleToggleCustomField = async (fieldId: string, isActive: boolean) => {
    try {
      await preferencesService.toggleCustomField('expenses', fieldId, isActive);
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
      validation: { min: undefined, max: undefined, pattern: '' }
    });
    setEditingCustomField(null);
    setNewOption('');
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

  // Load custom fields on component mount
  useEffect(() => {
    fetchCustomFields();
  }, []);

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
                        Expenses
                      </button>
                      {['Purchase Orders', 'Bills', 'Vendor Credits'].map((item) => (
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
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Expenses</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'preferences'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('vehicle')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'vehicle'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Vehicle
                </button>
                <button
                  onClick={() => setActiveTab('custom-fields')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'custom-fields'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manage Custom Fields
                </button>
              </nav>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800">Vehicle added successfully</span>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                {/* Associate Employees */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="associateEmployees"
                      checked={associateEmployees}
                      onChange={(e) => setAssociateEmployees(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="associateEmployees" className="ml-3 text-sm font-medium text-gray-700">
                      Associate employees to expenses
                    </label>
                  </div>
                </div>

                {/* Mileage Preference */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mileage Preference</h3>
                  
                  <div className="space-y-4">
                    {/* Default Mileage Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Mileage Category
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {defaultMileageCategory}
                        </button>
                        
                        {showCategoryDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="p-2">
                              <div className="relative mb-2">
                                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search"
                                  value={categorySearch}
                                  onChange={(e) => setCategorySearch(e.target.value)}
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredCategories.map((category) => (
                                  <button
                                    key={category}
                                    onClick={() => {
                                      setDefaultMileageCategory(category);
                                      setShowCategoryDropdown(false);
                                      setCategorySearch('');
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between"
                                  >
                                    <span>{category}</span>
                                    {category === defaultMileageCategory && (
                                      <CheckIcon className="h-4 w-4 text-blue-600" />
                                    )}
                                  </button>
                                ))}
                                <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                                  + New Category
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Default Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Unit
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="defaultUnit"
                            value="km"
                            checked={defaultUnit === 'km'}
                            onChange={(e) => setDefaultUnit(e.target.value as 'km' | 'mile')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Km</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="defaultUnit"
                            value="mile"
                            checked={defaultUnit === 'mile'}
                            onChange={(e) => setDefaultUnit(e.target.value as 'km' | 'mile')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Mile</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mileage Rates */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">MILEAGE RATES</h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Any mileage expense recorded on or after the start date will have the corresponding mileage rate. 
                    You can create a default rate (created without specifying a date), which will be applicable for 
                    mileage expenses recorded before the initial start date.
                  </p>

                  <div className="space-y-4">
                    {mileageRates.map((rate) => (
                      <div key={rate._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            START DATE
                          </label>
                          <input
                            type="text"
                            placeholder="dd/MM/yyyy"
                            value={rate.startDate}
                            onChange={(e) => handleMileageRateChange(rate._id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            MILEAGE RATE
                          </label>
                          <div className="flex items-center">
                            <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-700">
                              INR
                            </span>
                            <input
                              type="number"
                              value={rate.rate}
                              onChange={(e) => handleMileageRateChange(rate._id, 'rate', parseFloat(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMileageRate(rate._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleAddMileageRate}
                      className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Add Mileage Rate</span>
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Vehicle Tab */}
            {activeTab === 'vehicle' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicles</h3>
                  <button
                    onClick={() => setShowVehicleModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>New Vehicle</span>
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          VEHICLE NAME
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HINT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vehicle.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vehicle.hint}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditVehicle(vehicle)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit vehicle"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle._id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete vehicle"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Custom Fields Tab */}
            {activeTab === 'custom-fields' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Create custom fields to capture additional information for your expenses.
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
                      <p className="text-gray-500 mb-4">Get started by creating your first custom field.</p>
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
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'New Vehicle'}
              </h3>
              <button
                onClick={handleCloseVehicleModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-600 mb-1">
                  Vehicle Name*
                </label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter vehicle name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hint
                </label>
                <div className="text-xs text-gray-500 mb-2">(Max 50 chars)</div>
                <textarea
                  value={vehicleHint}
                  onChange={(e) => setVehicleHint(e.target.value)}
                  maxLength={50}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter hint"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseVehicleModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingVehicle ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    options: e.target.value === 'select' ? prev.options : []
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select (Dropdown)</option>
                  <option value="boolean">Yes/No</option>
                </select>
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
                ) : customFieldForm.fieldType === 'select' ? (
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
                ) : (
                  <input
                    type={customFieldForm.fieldType === 'number' ? 'number' : customFieldForm.fieldType === 'date' ? 'date' : 'text'}
                    value={customFieldForm.defaultValue}
                    onChange={(e) => setCustomFieldForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter default value"
                  />
                )}
              </div>

              {/* Options for Select Field */}
              {customFieldForm.fieldType === 'select' && (
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
                  {customFieldForm.fieldType === 'number' && (
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
                        />
                      </div>
                    </>
                  )}
                  {customFieldForm.fieldType === 'text' && (
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
                        placeholder="e.g., ^[A-Z0-9]+? for uppercase alphanumeric"
                      />
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
