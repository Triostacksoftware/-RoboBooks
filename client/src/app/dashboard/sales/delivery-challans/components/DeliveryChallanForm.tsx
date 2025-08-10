'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  TrashIcon,
  DocumentPlusIcon,
  XMarkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { deliveryChallanService } from '../services/deliveryChallanService';
import CustomerSelector from './CustomerSelector';
import toast, { Toaster } from 'react-hot-toast';

import { generateCurrentYearChallanId, formatChallanIdForDisplay } from '../utils/challanIdGenerator';
import { Customer as CustomerType } from '../services/customerService';

//import { useToast } from '../../../../contexts/ToastContext';



interface DeliveryChallanFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
  mode: 'create' | 'edit';
  initialData?: any;
}

interface Item {
  itemId?: string;
  itemName: string;
  hsn: string;
  quantity: number;
  uom: string;
  rate: number;
  amount: number;
  notes?: string;
}

interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}





const UOM_OPTIONS = [
  'kg', 'g', 'L', 'mL', 'metre', 'cm', 'piece', 'box', 'set', 'NOS'
];

const CHALLAN_TYPES = [
  'Job Work',
  'Stock Transfer',
  'liquids, gas, bulk',
  'Parts',
  'Other'
];

const DeliveryChallanForm: React.FC<DeliveryChallanFormProps> = ({
  onSubmit,
  onCancel,
  loading,
  mode,
  initialData
}) => {
  //const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    challanId: '',
    customerId: '',
    challanDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
    challanType: 'Job Work',
    placeOfSupply: '',
    shipTo: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: ''
    },
    dispatchFrom: {
      name: 'TRIOOSTACK TECHNOLOGIES PVT LTD',
      address: 'Uttar Pradesh, India',
      city: 'Uttar Pradesh',
      state: 'Uttar Pradesh',
      country: 'India',
      zipCode: ''
    },
    items: [{
      itemId: '',
      itemName: '',
      hsn: '',
      quantity: 1,
      uom: 'piece',
      rate: 0,
      amount: 0,
      notes: ''
    }],
    subTotal: 0,
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    discountAmount: 0,
    adjustment: 0,
    total: 0,
    notes: '',
    terms: '',
    attachments: [] as string[]
  });

  const [customUOM, setCustomUOM] = useState('');
  const [showCustomUOM, setShowCustomUOM] = useState(false);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);

  useEffect(() => {
    // Load customers
    loadCustomers();
    
    // If editing, populate form with initial data
    if (mode === 'edit' && initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure items have the correct structure
        items: initialData.items?.map((item: any) => ({
          itemId: item.itemId || '',
          itemName: item.itemName || '',
          hsn: item.hsn || '',
          quantity: item.quantity || 0,
          uom: item.uom || 'piece',
          rate: item.rate || 0,
          amount: item.amount || 0,
          notes: item.notes || ''
        })) || prev.items
      }));
    } else {
      generateChallanId();
    }
  }, [mode, initialData]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discount, formData.discountType, formData.adjustment]);

  const loadCustomers = useCallback(async () => {
    try {
      // This would be replaced with actual customer service call
      setCustomers([
        { 
          _id: '1', 
          customerType: 'Business' as const,
          salutation: 'Mr.',
          firstName: 'Sample',
          lastName: 'Customer 1',
          companyName: 'Sample Company 1',
          displayName: 'Sample Customer 1', 
          email: 'customer1@example.com',
          workPhone: '',
          mobile: '',
          pan: '',
          currency: 'INR',
          openingBalance: 0,
          paymentTerms: 'Due on Receipt',
          portalEnabled: false,
          portalLanguage: 'English',
          billingAddress: {},
          shippingAddress: {},
          contactPersons: [],
          receivables: 0,
          unusedCredits: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          _id: '2', 
          customerType: 'Individual' as const,
          salutation: 'Ms.',
          firstName: 'Sample',
          lastName: 'Customer 2',
          companyName: '',
          displayName: 'Sample Customer 2', 
          email: 'customer2@example.com',
          workPhone: '',
          mobile: '',
          pan: '',
          currency: 'INR',
          openingBalance: 0,
          paymentTerms: 'Due on Receipt',
          portalEnabled: false,
          portalLanguage: 'English',
          billingAddress: {},
          shippingAddress: {},
          contactPersons: [],
          receivables: 0,
          unusedCredits: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  }, []);

  const generateChallanId = useCallback(() => {
    // Generate a unique challan ID for the current year
    const currentYear = new Date().getFullYear();
    const result = generateCurrentYearChallanId('DC', 1); // You can get the actual sequence from backend
    
    setFormData(prev => ({
      ...prev,
      challanId: result.challanId
    }));
  }, []);

  const regenerateChallanId = useCallback(() => {
    // Generate a new challan ID with incremented sequence
    const currentYear = new Date().getFullYear();
    const currentSequence = Math.floor(Math.random() * 1000) + 1; // In real app, get from backend
    const result = generateCurrentYearChallanId('DC', currentSequence);
    
    setFormData(prev => ({
      ...prev,
      challanId: result.challanId
    }));
  }, []);

  const copyChallanIdToClipboard = useCallback(async () => {
    if (formData.challanId) {
      try {
        await navigator.clipboard.writeText(formData.challanId);
        toast.success('Challan ID copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error('Failed to copy challan ID');
      }
    }
  }, [formData.challanId]);



  const calculateTotals = useCallback(() => {
    const subTotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = (subTotal * formData.discount) / 100;
    } else {
      discountAmount = formData.discount;
    }

    const total = subTotal - discountAmount + formData.adjustment;

    setFormData(prev => ({
      ...prev,
      subTotal,
      discountAmount,
      total
    }));
  }, [formData.items, formData.discount, formData.discountType, formData.adjustment]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCustomerChange = useCallback((customerId: string, customer?: CustomerType) => {
    setFormData(prev => ({
      ...prev,
      customerId
    }));
    setSelectedCustomer(customer || null);
    
    // Auto-fill shipping address if customer has shipping address
    if (customer?.shippingAddress) {
      const shipping = customer.shippingAddress;
      setFormData(prev => ({
        ...prev,
        shipTo: {
          name: customer.displayName,
          address: shipping.street || '',
          city: shipping.city || '',
          state: shipping.state || '',
          country: shipping.country || 'India',
          zipCode: shipping.zipCode || ''
        }
      }));
    }
  }, []);

  const handleAddressChange = (type: 'shipTo' | 'dispatchFrom', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const rate = field === 'rate' ? value : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };



  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        itemId: '', // Add the missing itemId property
        itemName: '',
        hsn: '',
        quantity: 1,
        uom: 'piece',
        rate: 0,
        amount: 0,
        notes: ''
      }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleUOMChange = (index: number, value: string) => {
    if (value === 'custom') {
      setShowCustomUOM(true);
    } else {
      handleItemChange(index, 'uom', value);
    }
  };

  const addCustomUOM = () => {
    if (customUOM.trim()) {
      UOM_OPTIONS.push(customUOM.trim());
      setCustomUOM('');
      setShowCustomUOM(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.customerId) {
        toast.error('Please select a customer');
        return;
      }

      if (formData.items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }

      if (formData.items.some(item => !item.itemName || !item.quantity || !item.uom)) {
        toast.error('Please fill in all required item fields');
        return;
      }

      if (formData.items.some(item => item.quantity <= 0)) {
        toast.error('Quantity must be greater than 0');
        return;
      }

      if (formData.items.some(item => item.rate < 0)) {
        toast.error('Rate cannot be negative');
        return;
      }

      if (formData.discount < 0) {
        toast.error('Discount cannot be negative');
        return;
      }

      if (formData.adjustment < 0 && Math.abs(formData.adjustment) > formData.subTotal) {
        toast.error('Adjustment cannot reduce total below zero');
        return;
      }

      // Validate required address fields
      if (!formData.shipTo.name || !formData.shipTo.address || !formData.shipTo.city || !formData.shipTo.state) {
        toast.error('Please fill in all required shipping address fields');
        return;
      }

      if (!formData.dispatchFrom.name || !formData.dispatchFrom.address || !formData.dispatchFrom.city || !formData.dispatchFrom.state) {
        toast.error('Please fill in all required dispatch address fields');
        return;
      }

      // Validate other required fields
      if (!formData.challanType) {
        toast.error('Please select a challan type');
        return;
      }

      if (!formData.placeOfSupply) {
        toast.error('Please enter place of supply');
        return;
      }

      // Get next challan number
      const currentYear = new Date().getFullYear();
      const fy = `${currentYear}-${currentYear + 1}`;
      
      let nextNumberResponse;
      try {
        nextNumberResponse = await deliveryChallanService.getNextChallanNumber(
          'org123', // This should come from user context
          fy,
          'DC'
        );
      } catch (error) {
        console.error('Failed to get next challan number:', error);
        toast.error('Failed to get next challan number. Please try again.');
        return;
      }

      if (nextNumberResponse.success && nextNumberResponse.data?.nextChallanNumber) {
        // Map items to match the backend service interface
        const mappedItems = formData.items.map(item => ({
          itemId: item.itemName, // Use itemName as itemId for now
          quantity: item.quantity,
          uom: item.uom,
          rate: item.rate,
          notes: item.notes
        }));

        const challanData = {
          ...formData,
          items: mappedItems,
          challanNo: formData.challanId || nextNumberResponse.data.nextChallanNumber,
          fy,
          numberingSeries: 'DC'
        };

        let response;
        try {
          if (mode === 'edit') {
            response = await deliveryChallanService.update(initialData._id, challanData);
          } else {
            response = await deliveryChallanService.create(challanData);
          }
        } catch (error) {
          console.error('API call failed:', error);
          const action = mode === 'edit' ? 'update' : 'create';
          toast.error(`Failed to ${action} delivery challan. Please try again.`);
          return;
        }
        
        if (response.success) {
          const action = mode === 'edit' ? 'updated' : 'created';
          toast.success(`Delivery Challan ${action} successfully!`);
          onSubmit(response.data);
        } else {
          const action = mode === 'edit' ? 'update' : 'create';
          toast.error(response.error || `Failed to ${action} delivery challan`);
        }
      } else {
        toast.error('Failed to get next challan number');
      }
    } catch (error) {
      toast.error('An error occurred while creating the delivery challan');
      console.error('Submit error:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challan ID
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
                          <input
              type="text"
              value={formData.challanId ? formatChallanIdForDisplay(formData.challanId) : ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed font-mono text-sm shadow-sm transition-all duration-200"
              readOnly
              placeholder="DC-2024-0001"
            />
            </div>
            <button
              type="button"
              onClick={regenerateChallanId}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              title="Generate new challan ID"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
            </button>
            {formData.challanId && (
              <button
                type="button"
                onClick={copyChallanIdToClipboard}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                title="Copy challan ID to clipboard"
              >
                <DocumentPlusIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {formData.challanId && (
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated unique identifier
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <CustomerSelector
            value={formData.customerId}
            onChange={handleCustomerChange}
            placeholder="Search and select customer..."
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challan Date *
          </label>
          <input
            type="date"
            value={formData.challanDate}
            onChange={(e) => handleInputChange('challanDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference No.
          </label>
          <input
            type="text"
            value={formData.referenceNo}
            onChange={(e) => handleInputChange('referenceNo', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
            placeholder="Optional reference number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challan Type *
          </label>
          <select
            value={formData.challanType}
            onChange={(e) => handleInputChange('challanType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
            required
          >
            {CHALLAN_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Place of Supply
          </label>
          <input
            type="text"
            value={formData.placeOfSupply}
            onChange={(e) => handleInputChange('placeOfSupply', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
            placeholder="e.g., Uttar Pradesh"
            required
          />
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ship To */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Ship To</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                placeholder="Name"
                value={formData.shipTo.name}
                onChange={(e) => handleAddressChange('shipTo', 'name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                placeholder="Address"
                value={formData.shipTo.address}
                onChange={(e) => handleAddressChange('shipTo', 'address', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.shipTo.city}
                  onChange={(e) => handleAddressChange('shipTo', 'city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.shipTo.state}
                  onChange={(e) => handleAddressChange('shipTo', 'state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.shipTo.country}
                  onChange={(e) => handleAddressChange('shipTo', 'country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={formData.shipTo.zipCode}
                  onChange={(e) => handleAddressChange('shipTo', 'zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch From */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dispatch From</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                placeholder="Name"
                value={formData.dispatchFrom.name}
                onChange={(e) => handleAddressChange('dispatchFrom', 'name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                placeholder="Address"
                value={formData.dispatchFrom.address}
                onChange={(e) => handleAddressChange('dispatchFrom', 'address', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.dispatchFrom.city}
                  onChange={(e) => handleAddressChange('dispatchFrom', 'city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.dispatchFrom.state}
                  onChange={(e) => handleAddressChange('dispatchFrom', 'state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.dispatchFrom.country}
                  onChange={(e) => handleAddressChange('dispatchFrom', 'country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={formData.dispatchFrom.zipCode}
                  onChange={(e) => handleAddressChange('dispatchFrom', 'zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item *
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity *
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UOM *
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                      placeholder="Enter Item Name"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                      placeholder="HSN Code"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                      min="0"
                      step="0.01"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={item.uom}
                      onChange={(e) => handleUOMChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                      required
                    >
                      {UOM_OPTIONS.map((uom) => (
                        <option key={uom} value={uom}>
                          {uom}
                        </option>
                      ))}
                      <option value="custom">Custom...</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.amount}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 shadow-sm"
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                      placeholder="Notes"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom UOM Modal */}
      {showCustomUOM && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom UOM</h3>
              <input
                type="text"
                value={customUOM}
                onChange={(e) => setCustomUOM(e.target.value)}
                placeholder="Enter custom UOM"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200 mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomUOM(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addCustomUOM}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all duration-200 shadow-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Notes & Terms</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
              placeholder="Additional notes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
              placeholder="Terms and conditions..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Totals</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sub Total:</span>
              <span className="font-medium">₹{formData.subTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={formData.discountType}
                onChange={(e) => handleInputChange('discountType', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
              >
                <option value="percentage">%</option>
                <option value="amount">₹</option>
              </select>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                min="0"
                step="0.01"
                placeholder="Discount"
              />
            </div>
            
            {formData.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-₹{formData.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <span className="text-gray-600">Adjustment:</span>
              <input
                type="number"
                value={formData.adjustment}
                onChange={(e) => handleInputChange('adjustment', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:border-gray-300 transition-all duration-200"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update' : 'Save as Draft')}
        </button>
      </div>
      </form>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </div>
  );
};

export default DeliveryChallanForm;
