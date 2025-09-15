"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { expenseService, Expense } from "@/services/expenseService";
import { useToast } from "@/contexts/ToastContext";

interface RecordExpensePageProps {
  initialData?: Expense;
  mode?: 'create' | 'edit';
}

export default function RecordExpensePage({ initialData, mode = 'create' }: RecordExpensePageProps) {
  const { addToast } = useToast();
  
  // Form state matching Zoho Books design
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paidThrough: '',
    expenseAccount: '',
    amount: '',
    vendor: '',
    invoiceNumber: '',
    customerName: '',
    project: '',
    billable: false,
    notes: '',
    currency: 'INR'
  });
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showUploadFilesDropdown, setShowUploadFilesDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showExpenseAccountDropdown, setShowExpenseAccountDropdown] = useState(false);
  const [showPaidThroughDropdown, setShowPaidThroughDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Tab and itemsize states
  const [activeTab, setActiveTab] = useState('record');
  const [isItemsized, setIsItemsized] = useState(false);
  const [showItemsizePanel, setShowItemsizePanel] = useState(false);
  const [showItemsizeAnimation, setShowItemsizeAnimation] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Initialize form with initial data when in edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        date: new Date(initialData.date).toISOString().split('T')[0],
        paidThrough: initialData.paymentMethod || '',
        expenseAccount: initialData.category || '',
        amount: initialData.amount.toString(),
        vendor: initialData.vendor || '',
        invoiceNumber: initialData.reference || '',
        customerName: initialData.customer || '',
        project: initialData.project || '',
        billable: initialData.billable || false,
        notes: initialData.description || '',
        currency: 'INR'
      });
    }
  }, [initialData, mode]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Close upload dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUploadFilesDropdown(false);
      }
    };

    if (showUploadFilesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUploadFilesDropdown]);

  const [expenseItems, setExpenseItems] = useState([
    { id: 1, account: '', notes: '', amount: '' }
  ]);

  // Bulk expense states
  const [bulkExpenses, setBulkExpenses] = useState([
    {
      id: 1,
      date: new Date().toISOString().split('T')[0],
      expenseAccount: '',
      amount: '',
      paidThrough: '',
      vendor: '',
      customerName: '',
      project: '',
      billable: false,
      currency: 'INR'
    }
  ]);

  // Mileage states
  const [mileageData, setMileageData] = useState({
    date: new Date().toISOString().split('T')[0],
    employee: '',
    calculateUsing: 'distance', // 'distance' or 'odometer'
    distance: '',
    odometerStart: '',
    odometerEnd: '',
    amount: '',
    paidThrough: '',
    vendor: '',
    invoiceNumber: '',
    notes: '',
    billable: false,
    currency: 'INR'
  });

  // Mileage preferences modal states
  const [showMileagePreferences, setShowMileagePreferences] = useState(false);
  const [mileagePreferences, setMileagePreferences] = useState({
    associateEmployees: false,
    defaultMileageCategory: 'Fuel/Mileage Expenses',
    defaultUnit: 'km', // 'km' or 'mile'
    mileageRates: [
      {
        id: 1,
        startDate: '',
        rate: '',
        currency: 'INR'
      }
    ]
  });

  const employees = [
    { value: 'emp1', label: 'John Doe' },
    { value: 'emp2', label: 'Jane Smith' },
    { value: 'emp3', label: 'Mike Johnson' },
  ];

  const mileageCategories = [
    'Fuel/Mileage Expenses',
    'Transportation Expense',
    'Meals and Entertainment',
    'Depreciation Expense',
    'Consultant Expense',
    'Repairs and Maintenance',
    'Other Expenses',
    'Lodging',
    'Purchase Discounts',
    'Raw Materials And Consumables',
    'Merchandise',
    'Contract Assets'
  ];

  const expenseAccounts = [
    "Cost Of Goods Sold",
    "Job Costing", 
    "Labor",
    "Materials",
    "Subcontractor",
    "Expense",
    "Office Supplies",
    "Travel Expense",
    "Meals & Entertainment",
    "Advertising & Marketing"
  ];

  const paymentAccounts = [
    "Cash",
    "Petty Cash", 
    "Undeposited Funds",
    "Bank Account",
    "Credit Card",
    "Other Current Asset"
  ];

  const vendors = [
    "Office Depot",
    "Amazon",
    "Local Supplier",
    "Travel Agency"
  ];

  const customers = [
    { value: "customer1", label: "John Doe" },
    { value: "customer2", label: "Jane Smith" },
    { value: "customer3", label: "ABC Company" },
  ];

  const projects = [
    { value: "project1", label: "Website Development" },
    { value: "project2", label: "Mobile App" },
    { value: "project3", label: "Marketing Campaign" },
  ];

  const invoices = [
    { value: "inv001", label: "INV-001" },
    { value: "inv002", label: "INV-002" },
    { value: "inv003", label: "INV-003" },
  ];

  // Form submission handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tab switching
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Itemsize functionality
  const handleItemsizeToggle = () => {
    const newItemsizeState = !isItemsized;
    setIsItemsized(newItemsizeState);

    if (newItemsizeState) {
      // Initialize with one item when enabling itemsize
      setExpenseItems([{ id: 1, account: '', notes: '', amount: '' }]);
      setShowItemsizePanel(true);
      setShowItemsizeAnimation(true);
      
      // Remove animation after 3 seconds
      setTimeout(() => {
        setShowItemsizeAnimation(false);
      }, 3000);
    } else {
      setShowItemsizePanel(false);
      setShowItemsizeAnimation(false);
    }
  };

  const getTotalAmount = () => {
    return expenseItems.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
  };

  // Bulk expense handlers
  const handleBulkExpenseChange = (id: number, field: string, value: any) => {
    setBulkExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const addBulkExpense = () => {
    const newId = Math.max(...bulkExpenses.map(expense => expense.id)) + 1;
    setBulkExpenses(prev => [...prev, {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      expenseAccount: '',
      amount: '',
      paidThrough: '',
      vendor: '',
      customerName: '',
      project: '',
      billable: false,
      currency: 'INR'
    }]);
  };

  const removeBulkExpense = (id: number) => {
    if (bulkExpenses.length > 1) {
      setBulkExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  const handleBulkSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validate bulk expenses
      const validExpenses = bulkExpenses.filter(expense => 
        expense.date && expense.expenseAccount && expense.amount && expense.paidThrough
      );

      if (validExpenses.length === 0) {
        throw new Error('Please fill in at least one complete expense record');
      }

      // Create all expenses
      const promises = validExpenses.map(expense => {
        const expenseData = {
          date: expense.date,
          description: `Bulk Expense - ${expense.vendor || 'Unknown Vendor'}`,
          amount: parseFloat(expense.amount),
          vendor: expense.vendor || 'Unknown Vendor',
          account: expense.expenseAccount,
          category: 'Other',
          paymentMethod: expense.paidThrough,
          reference: `BULK-${Date.now()}-${expense.id}`,
          notes: '',
          billable: expense.billable,
          customer: expense.customerName || undefined,
          project: expense.project || undefined,
          hasReceipt: false,
          attachments: [],
          status: 'unbilled'
        };
        return expenseService.createExpense(expenseData);
      });

      await Promise.all(promises);
      
      addToast({
        type: 'success',
        title: 'Bulk Expenses Created',
        message: `${validExpenses.length} expenses have been created successfully`
      });
      
      setSubmitSuccess(true);
      
      // Reset bulk expenses
      setBulkExpenses([{
        id: 1,
        date: new Date().toISOString().split('T')[0],
        expenseAccount: '',
        amount: '',
        paidThrough: '',
        vendor: '',
        customerName: '',
        project: '',
        billable: false,
        currency: 'INR'
      }]);

    } catch (error: any) {
      console.error('Error creating bulk expenses:', error);
      addToast({
        type: 'error',
        title: 'Bulk Expense Creation Failed',
        message: error.message || 'Failed to create bulk expenses'
      });
      setSubmitError(error.message || 'Failed to create bulk expenses');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mileage handlers
  const handleMileageChange = (field: string, value: any) => {
    setMileageData(prev => ({ ...prev, [field]: value }));
  };

  const handleMileagePreferencesChange = (field: string, value: any) => {
    setMileagePreferences(prev => ({ ...prev, [field]: value }));
  };

  const addMileageRate = () => {
    const newId = Math.max(...mileagePreferences.mileageRates.map(rate => rate.id)) + 1;
    setMileagePreferences(prev => ({
      ...prev,
      mileageRates: [...prev.mileageRates, {
        id: newId,
        startDate: '',
        rate: '',
        currency: 'INR'
      }]
    }));
  };

  const removeMileageRate = (id: number) => {
    if (mileagePreferences.mileageRates.length > 1) {
      setMileagePreferences(prev => ({
        ...prev,
        mileageRates: prev.mileageRates.filter(rate => rate.id !== id)
      }));
    }
  };

  const handleMileageRateChange = (id: number, field: string, value: any) => {
    setMileagePreferences(prev => ({
      ...prev,
      mileageRates: prev.mileageRates.map(rate =>
        rate.id === id ? { ...rate, [field]: value } : rate
      )
    }));
  };

  const handleMileageSubmit = async (action: 'save' | 'saveAndNew') => {
    try {
      console.log('💾 Starting mileage expense creation process');
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validate required fields
      if (!mileageData.date) {
        throw new Error('Please select a date');
      }
      
      if (!mileageData.calculateUsing) {
        throw new Error('Please select calculation method');
      }

      if (mileageData.calculateUsing === 'distance' && !mileageData.distance) {
        throw new Error('Please enter distance');
      }

      if (mileageData.calculateUsing === 'odometer' && (!mileageData.odometerStart || !mileageData.odometerEnd)) {
        throw new Error('Please enter both odometer readings');
      }

      if (!mileageData.amount || parseFloat(mileageData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!mileageData.paidThrough) {
        throw new Error('Please select a payment method');
      }

      // Calculate distance if using odometer
      let calculatedDistance = mileageData.distance;
      if (mileageData.calculateUsing === 'odometer') {
        calculatedDistance = (parseFloat(mileageData.odometerEnd) - parseFloat(mileageData.odometerStart)).toString();
      }

      // Prepare mileage expense data
      const expenseData = {
        date: mileageData.date,
        description: `Mileage Expense - ${calculatedDistance} ${mileagePreferences.defaultUnit}`,
        amount: parseFloat(mileageData.amount),
        vendor: mileageData.vendor || 'Mileage',
        account: mileagePreferences.defaultMileageCategory,
        category: 'Mileage',
        paymentMethod: mileageData.paidThrough,
        reference: mileageData.invoiceNumber || `MILEAGE-${Date.now()}`,
        notes: mileageData.notes,
        billable: mileageData.billable,
        customer: undefined,
        project: undefined,
        hasReceipt: false,
        attachments: [],
        status: 'unbilled',
        mileageData: {
          employee: mileageData.employee,
          calculateUsing: mileageData.calculateUsing,
          distance: calculatedDistance,
          odometerStart: mileageData.odometerStart,
          odometerEnd: mileageData.odometerEnd,
          unit: mileagePreferences.defaultUnit
        }
      };

      console.log('💾 Mileage expense data prepared:', expenseData);

      // Create mileage expense
      const newExpense = await expenseService.createExpense(expenseData);
      console.log('✅ Mileage expense created successfully:', newExpense);
      
      addToast({
        type: 'success',
        title: 'Mileage Expense Created',
        message: 'Mileage expense has been created successfully'
      });
      
      setSubmitSuccess(true);
      
      if (action === 'save') {
        // Redirect to expenses list
        window.location.href = '/dashboard/purchases/expenses';
      } else {
        // Reset form for new mileage expense
        setMileageData({
          date: new Date().toISOString().split('T')[0],
          employee: '',
          calculateUsing: 'distance',
          distance: '',
          odometerStart: '',
          odometerEnd: '',
          amount: '',
          paidThrough: '',
          vendor: '',
          invoiceNumber: '',
          notes: '',
          billable: false,
          currency: 'INR'
        });
        setSubmitSuccess(false);
      }
    } catch (error: any) {
      console.error('Error creating mileage expense:', error);
      addToast({
        type: 'error',
        title: 'Mileage Expense Creation Failed',
        message: error.message || 'Failed to create mileage expense'
      });
      setSubmitError(error.message || 'Failed to create mileage expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handlers
  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];

    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is 10MB.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File ${file.name} has an unsupported format.`;
    }

    return null;
  };

  const handleFiles = (files: File[] | React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.isArray(files) ? files : Array.from(files.target.files || []);
    const errors: string[] = [];
    const validFiles: any[] = [];

    // Validate each file
    fileList.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          file: file
        });
      }
    });

    if (errors.length > 0) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: errors.join(', ')
      });
      // Close the upload dropdown even when there are errors
      setShowUploadFilesDropdown(false);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      addToast({
        type: 'success',
        title: 'Files Added',
        message: `${validFiles.length} file(s) added successfully`
      });
      // Close the upload dropdown after successful file upload
      setShowUploadFilesDropdown(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (id: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  // Expense item handlers
  const handleExpenseItemChange = (id: number, field: string, value: string) => {
    setExpenseItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addExpenseItem = () => {
    const newId = Math.max(...expenseItems.map(item => item.id)) + 1;
    setExpenseItems(prev => [...prev, { id: newId, account: '', notes: '', amount: '' }]);
  };

  const removeExpenseItem = (id: number) => {
    if (expenseItems.length > 1) {
      setExpenseItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Three-dot menu handlers
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  // Debug effect to track openMenuId changes
  useEffect(() => {
    console.log('🔄 openMenuId state changed to:', openMenuId);
  }, [openMenuId]);
  
  const handleMenuToggle = (id: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('=== MENU TOGGLE CLICKED ===');
    console.log('Clicked id:', id);
    console.log('Current openMenuId state:', openMenuId);
    
    // Force close any open menu first
    if (openMenuId !== null) {
      console.log('Closing existing menu first');
      setOpenMenuId(null);
    }
    
    // Always open new menu
    console.log('Opening menu for id:', id);
    const rect = event.currentTarget.getBoundingClientRect();
    console.log('Button position:', rect);
    
    const x = rect.left;
    const y = rect.bottom + 5;
    
    console.log('Menu position:', { x, y });
    setMenuPosition({ x, y });
    
    // Use setTimeout to ensure state update happens after the close
    setTimeout(() => {
      console.log('Setting openMenuId to:', id);
      setOpenMenuId(id);
    }, 10);
  };

  const handleCloneItem = (id: number) => {
    console.log('Clone clicked for id:', id);
    const itemToClone = expenseItems.find(item => item.id === id);
    
    if (itemToClone) {
      const newId = Math.max(...expenseItems.map(item => item.id)) + 1;
      const clonedItem = {
        ...itemToClone,
        id: newId,
        amount: ''
      };
      
      setExpenseItems(prev => [...prev, clonedItem]);
      addToast({
        type: 'success',
        title: 'Item Cloned',
        message: 'Expense item has been cloned successfully'
      });
    }
    setOpenMenuId(null);
  };

  const handleInsertNewRow = (id: number) => {
    console.log('Inserting new row after id:', id);
    const newId = Math.max(...expenseItems.map(item => item.id)) + 1;
    const currentIndex = expenseItems.findIndex(item => item.id === id);
    const newItem = { id: newId, account: '', notes: '', amount: '' };
    
    setExpenseItems(prev => {
      const newItems = [...prev];
      newItems.splice(currentIndex + 1, 0, newItem);
      return newItems;
    });
    addToast({
      type: 'success',
      title: 'New Row Added',
      message: 'New expense row has been inserted successfully'
    });
    setOpenMenuId(null);
  };

  const handleShowAdditionalInfo = (id: number) => {
    // Show additional information modal or tooltip
    addToast({
      type: 'info',
      title: 'Additional Information',
      message: 'Additional information feature coming soon!'
    });
    setOpenMenuId(null);
  };

  const handleRemoveItem = (id: number) => {
    console.log('Removing item with id:', id);
    removeExpenseItem(id);
    addToast({
      type: 'success',
      title: 'Item Removed',
      message: 'Expense item has been removed successfully'
    });
    setOpenMenuId(null);
  };

  const handleSubmit = async (action: 'save' | 'saveAndNew') => {
    try {
      console.log(`💾 Starting expense ${mode} process`);
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validate required fields
      if (isItemsized) {
        // Validate itemsized expenses
        const validItems = expenseItems.filter(item => item.account && item.amount && parseFloat(item.amount) > 0);
        if (validItems.length === 0) {
          throw new Error('Please add at least one valid expense item');
        }
      } else {
        // Validate single expense
      if (!formData.expenseAccount) {
        throw new Error('Please select an expense account');
      }
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
        }
      }

      if (!formData.paidThrough) {
        throw new Error('Please select a payment method');
      }

      // Prepare expense data
      const totalAmount = isItemsized 
        ? expenseItems.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0)
        : parseFloat(formData.amount);

      const expenseData = {
        date: formData.date,
        description: isItemsized 
          ? `Itemsized Expense - ${expenseItems.length} items`
          : formData.notes || 'Expense',
        amount: totalAmount,
        vendor: formData.vendor || 'Unknown Vendor',
        account: isItemsized ? 'Itemsized Expenses' : formData.expenseAccount,
        category: 'Other',
        paymentMethod: formData.paidThrough,
        reference: formData.invoiceNumber || `REF-${Date.now()}`,
        notes: formData.notes,
        billable: formData.billable,
        customer: formData.customerName || undefined,
        project: formData.project || undefined,
        hasReceipt: uploadedFiles.length > 0,
        attachments: uploadedFiles.map(file => ({
          fileId: file.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: file.url
        })),
        status: 'unbilled',
        isItemsized: isItemsized,
        expenseItems: isItemsized ? expenseItems.map(item => ({
          account: item.account,
          notes: item.notes,
          amount: parseFloat(item.amount) || 0
        })) : undefined
      };

      console.log(`💾 Expense data prepared for ${mode}:`, expenseData);

      let result;
      if (mode === 'edit' && initialData) {
        // Update existing expense
        console.log('💾 Calling expenseService.updateExpense');
        result = await expenseService.updateExpense(initialData._id, expenseData);
        console.log('✅ Expense updated successfully:', result);
        
        addToast({
          type: 'success',
          title: 'Expense Updated',
          message: 'Expense has been updated successfully'
        });
      } else {
        // Create new expense
      console.log('💾 Calling expenseService.createExpense');
        result = await expenseService.createExpense(expenseData);
        console.log('✅ Expense created successfully:', result);
      
      addToast({
        type: 'success',
        title: 'Expense Created',
        message: 'Expense has been created successfully'
      });
      }
      
      setSubmitSuccess(true);
      
      if (action === 'save') {
        // Redirect to expenses list
        window.location.href = '/dashboard/purchases/expenses';
      } else {
        // Reset form for new expense
        setFormData({
          date: new Date().toISOString().split('T')[0],
          paidThrough: '',
          expenseAccount: '',
          amount: '',
          vendor: '',
          invoiceNumber: '',
          customerName: '',
          project: '',
          billable: false,
          notes: '',
          currency: 'INR'
        });
        setUploadedFiles([]);
        setSubmitSuccess(false);
      }
    } catch (error: any) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} expense:`, error);
      addToast({
        type: 'error',
        title: `Expense ${mode === 'edit' ? 'Update' : 'Creation'} Failed`,
        message: error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} expense`
      });
      setSubmitError(error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} expense`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/dashboard/purchases/expenses';
  };

  return (
      <>
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            display: none;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            display: none;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            display: none;
          }
          .custom-scrollbar::-webkit-scrollbar-corner {
            display: none;
          }
        `}</style>
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Expenses
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add New Expense</h1>
              <p className="text-gray-600">Record and manage your business expenses</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button 
            onClick={() => handleTabChange('record')}
            className={`py-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'record' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Record Expense
          </button>
          <button 
            onClick={() => handleTabChange('mileage')}
            className={`py-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'mileage' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Record Mileage
          </button>
          <button 
            onClick={() => handleTabChange('bulk')}
            className={`py-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'bulk' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bulk Add Expenses
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-6 mt-4">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">Expense created successfully!</span>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mt-4">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{submitError}</span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        {/* Main Form - Centered */}
        <div className="w-full max-w-4xl p-6">
            {/* Tab Content */}
            {activeTab === 'record' && (
              <>
                {/* Date and Paid Through */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date*
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Through*
                    </label>
                    <div className="relative">
                      <select 
                        value={formData.paidThrough}
                        onChange={(e) => handleInputChange('paidThrough', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="" className="text-gray-500">Select an account</option>
                        {paymentAccounts.map(account => (
                          <option key={account} value={account} className="text-gray-900">{account}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Expense Account and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Account*
                    </label>
                    <div className="relative">
                      <select
                        value={formData.expenseAccount}
                        onChange={(e) => handleInputChange('expenseAccount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="" className="text-gray-500">Select an account</option>
                        {expenseAccounts.map(account => (
                          <option key={account} value={account} className="text-gray-900">{account}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      type="button"
                      onClick={handleItemsizeToggle}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                  Itemsize
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount*
                    </label>
                    <div className="flex">
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

            {/* Itemsized Expenses Table */}
            {showItemsizePanel && (
              <div className={`mb-6 rounded-lg p-4 transition-all duration-3000 ${
                showItemsizeAnimation 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Expense Line Items</h3>
                  <button
                    type="button"
                    onClick={addExpenseItem}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add New Row
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EXPENSE ACCOUNT
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NOTES
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AMOUNT
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenseItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <select
                              value={item.account}
                              onChange={(e) => handleExpenseItemChange(item.id, 'account', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="">Select an account</option>
                              {expenseAccounts.map(account => (
                                <option key={account} value={account}>{account}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-4">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleExpenseItemChange(item.id, 'notes', e.target.value)}
                              placeholder="Max. 500 characters"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex">
                              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-sm text-gray-700">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount}
                                onChange={(e) => handleExpenseItemChange(item.id, 'amount', e.target.value)}
                                placeholder="0.00"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={(e) => handleMenuToggle(item.id, e)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Expense Total */}
                <div className="mt-4 flex justify-end">
                  <div className="bg-gray-100 px-4 py-2 rounded-md">
                    <span className="text-sm font-medium text-gray-700">Expense Total (₹): </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {expenseItems.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Three-dot Menu - Simple Version */}
            {openMenuId !== null && (
              <div className="fixed inset-0 z-50" onClick={() => {
                console.log('Backdrop clicked, closing menu');
                setOpenMenuId(null);
              }}>
                <div 
                  className="absolute bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-56"
                  style={{
                    top: `${menuPosition.y}px`,
                    left: `${menuPosition.x}px`
                  }}
                  onClick={(e) => {
                    console.log('Menu container clicked, preventing close');
                    e.stopPropagation();
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔥 Clone button clicked for item:', openMenuId);
                      handleCloneItem(openMenuId);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-3" />
                    Clone
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔥 Insert button clicked for item:', openMenuId);
                      handleInsertNewRow(openMenuId);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PlusIcon className="h-4 w-4 mr-3" />
                    Insert New Row
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔥 Info button clicked for item:', openMenuId);
                      handleShowAdditionalInfo(openMenuId);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <InformationCircleIcon className="h-4 w-4 mr-3" />
                    Show Additional Information
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔥 Remove button clicked for item:', openMenuId);
                      handleRemoveItem(openMenuId);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    disabled={expenseItems.length === 1}
                  >
                    <TrashIcon className="h-4 w-4 mr-3" />
                    Remove
                  </button>
                </div>
              </div>
            )}

                {/* Vendor and Invoice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Q Search"
                        value={formData.vendor}
                        onChange={(e) => handleInputChange('vendor', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice#
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Q Search"
                        value={formData.invoiceNumber}
                        onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Customer Name and Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <div className="relative">
                      <select 
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="" className="text-gray-500">Select or add a customer</option>
                        {customers.map(customer => (
                          <option key={customer.value} value={customer.value} className="text-gray-900">
                            {customer.label}
                          </option>
                        ))}
                      </select>
                      <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projects
                    </label>
                    <div className="relative">
                      <select 
                        value={formData.project}
                        onChange={(e) => handleInputChange('project', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="" className="text-gray-500">Select existing project</option>
                        {projects.map(project => (
                          <option key={project.value} value={project.value} className="text-gray-900">
                            {project.label}
                          </option>
                        ))}
                      </select>
                      <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Max. 500 characters"
                  />
                </div>

                {/* File Upload Section - Compact */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="space-y-3">
                    {/* Compact Upload Button */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowUploadFilesDropdown(!showUploadFilesDropdown)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <PaperClipIcon className="h-4 w-4 mr-2" />
                        Upload File
                        <ChevronDownIcon className="h-4 w-4 ml-2" />
                      </button>
                      {showUploadFilesDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          <button
                            type="button"
                            onClick={openFileInput}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200"
                          >
                            Choose Files
                          </button>
                          <div
                            className={`px-3 py-4 text-center text-sm text-gray-500 ${
                              isDragOver ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            Or drag and drop files here
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      onChange={handleFiles}
                      className="hidden"
                    />

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        <div className="space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                              <div className="flex items-center space-x-2">
                                <DocumentArrowUpIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Errors */}
                    {uploadErrors.length > 0 && (
                      <div className="text-red-600 text-sm">
                        {uploadErrors.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    )}
                  </div>
            </div>

                {/* Reporting Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Tags
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                    Associate Tags
                  </a>
                </div>

                {/* Billable Checkbox */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="billable"
                      checked={formData.billable}
                      onChange={(e) => handleInputChange('billable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="billable" className="text-sm font-medium text-gray-700">
                      Billable
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Mileage Tab Content */}
            {activeTab === 'mileage' && (
              <>
                {/* Mileage Preferences Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowMileagePreferences(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Set your mileage preferences
                  </button>
                </div>

                {/* Mileage Form */}
                <div className="space-y-6">
                  {/* Date and Employee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date*
                      </label>
                      <input
                        type="date"
                        value={mileageData.date}
                        onChange={(e) => handleMileageChange('date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
              </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee
                      </label>
                      <select
                        value={mileageData.employee}
                        onChange={(e) => handleMileageChange('employee', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select employee</option>
                        {employees.map(emp => (
                          <option key={emp.value} value={emp.value}>{emp.label}</option>
                        ))}
                      </select>
          </div>
        </div>

                  {/* Calculate mileage using */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calculate mileage using*
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="calculateUsing"
                          value="distance"
                          checked={mileageData.calculateUsing === 'distance'}
                          onChange={(e) => handleMileageChange('calculateUsing', e.target.value)}
                          className="mr-2"
                        />
                        Distance
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="calculateUsing"
                          value="odometer"
                          checked={mileageData.calculateUsing === 'odometer'}
                          onChange={(e) => handleMileageChange('calculateUsing', e.target.value)}
                          className="mr-2"
                        />
                        Odometer readings
                      </label>
                </div>
              </div>

                  {/* Distance or Odometer fields */}
                  {mileageData.calculateUsing === 'distance' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distance*
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          step="0.01"
                          value={mileageData.distance}
                          onChange={(e) => handleMileageChange('distance', e.target.value)}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-700">
                          {mileagePreferences.defaultUnit}
                        </span>
          </div>
        </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Odometer Start*
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={mileageData.odometerStart}
                          onChange={(e) => handleMileageChange('odometerStart', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Odometer End*
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={mileageData.odometerEnd}
                          onChange={(e) => handleMileageChange('odometerEnd', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount and Paid Through */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount*
                      </label>
                      <div className="flex">
                        <select
                          value={mileageData.currency}
                          onChange={(e) => handleMileageChange('currency', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          value={mileageData.amount}
                          onChange={(e) => handleMileageChange('amount', e.target.value)}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
              </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paid Through*
                      </label>
                      <select
                        value={mileageData.paidThrough}
                        onChange={(e) => handleMileageChange('paidThrough', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select an account</option>
                        {paymentAccounts.map(account => (
                          <option key={account} value={account}>{account}</option>
                        ))}
                      </select>
                    </div>
            </div>
            
                  {/* Vendor and Invoice */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor
                      </label>
                      <input
                        type="text"
                        value={mileageData.vendor}
                        onChange={(e) => handleMileageChange('vendor', e.target.value)}
                        placeholder="Vendor name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice#
                      </label>
                      <input
                        type="text"
                        value={mileageData.invoiceNumber}
                        onChange={(e) => handleMileageChange('invoiceNumber', e.target.value)}
                        placeholder="Invoice number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={mileageData.notes}
                      onChange={(e) => handleMileageChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add notes about this mileage expense"
                    />
                  </div>

                  {/* Billable Checkbox */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mileageBillable"
                        checked={mileageData.billable}
                        onChange={(e) => handleMileageChange('billable', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="mileageBillable" className="text-sm font-medium text-gray-700">
                        Billable
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bulk Add Expenses Tab Content - Zoho Books Style */}
            {activeTab === 'bulk' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-[148%] -ml-[24%]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Bulk Add Expenses</h3>
                      <button
                      onClick={addBulkExpense}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add More Expenses
                      </button>
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DATE*
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EXPENSE ACCOUNT*
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AMOUNT*
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PAID THROUGH*
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          VENDOR
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CUSTOMER NAME
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PROJECTS
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          BILLABLE
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bulkExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          {/* Date */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="date"
                              value={expense.date}
                              onChange={(e) => handleBulkExpenseChange(expense.id, 'date', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          
                          {/* Expense Account */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={expense.expenseAccount}
                              onChange={(e) => handleBulkExpenseChange(expense.id, 'expenseAccount', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select an account</option>
                              {expenseAccounts.map(account => (
                                <option key={account} value={account}>{account}</option>
                              ))}
                            </select>
                          </td>
                          
                          {/* Amount */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex">
                              <select
                                value={expense.currency}
                                onChange={(e) => handleBulkExpenseChange(expense.id, 'currency', e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                              </select>
                              <input
                                type="number"
                                step="0.01"
                                value={expense.amount}
                                onChange={(e) => handleBulkExpenseChange(expense.id, 'amount', e.target.value)}
                                placeholder="0.00"
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-r focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </td>
                          
                          {/* Paid Through */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={expense.paidThrough}
                              onChange={(e) => handleBulkExpenseChange(expense.id, 'paidThrough', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select an account</option>
                              {paymentAccounts.map(account => (
                                <option key={account} value={account}>{account}</option>
                              ))}
                            </select>
                          </td>
                          
                          {/* Vendor */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="text"
                              value={expense.vendor}
                              onChange={(e) => handleBulkExpenseChange(expense.id, 'vendor', e.target.value)}
                              placeholder="Vendor name"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          
                          {/* Customer Name */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={expense.customerName}
                              onChange={(e) => handleBulkExpenseChange(expense.id, 'customerName', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select customer</option>
                              {customers.map(customer => (
                                <option key={customer.value} value={customer.value}>{customer.label}</option>
                              ))}
                            </select>
                          </td>
                          
                          {/* Projects */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={expense.project}
                              onChange={(e) => handleBulkExpenseChange(expense.id, 'project', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select project</option>
                              {projects.map(project => (
                                <option key={project.value} value={project.value}>{project.label}</option>
                              ))}
                            </select>
                          </td>
                          
                          {/* Billable */}
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={expense.billable}
                              onChange={(e) => handleBulkExpenseChange(expense.id, 'billable', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          
                          {/* Actions */}
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <button
                              onClick={() => removeBulkExpense(expense.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Remove row"
                            >
                              <XMarkIcon className="h-4 w-4" />
                      </button>
                          </td>
                        </tr>
                ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-end space-x-4">
          <button 
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {activeTab === 'bulk' ? (
            <button 
              onClick={handleBulkSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          ) : activeTab === 'mileage' ? (
            <>
              <button 
                onClick={() => handleMileageSubmit('save')}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save (alt+s)'}
              </button>
              <button 
                onClick={() => handleMileageSubmit('saveAndNew')}
                disabled={isSubmitting}
                className="px-6 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save and New (alt+n)'}
              </button>
            </>
          ) : (
            <>
          <button 
            onClick={() => handleSubmit('save')}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save (alt+s)'}
          </button>
          <button 
            onClick={() => handleSubmit('saveAndNew')}
            disabled={isSubmitting}
            className="px-6 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save and New (alt+n)'}
          </button>
            </>
          )}
        </div>
      </div>

      {/* Mileage Preferences Modal */}
      {showMileagePreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-red-600">Set your mileage preferences</h3>
              <button
                onClick={() => setShowMileagePreferences(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
    </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Associate employees checkbox */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={mileagePreferences.associateEmployees}
                    onChange={(e) => handleMileagePreferencesChange('associateEmployees', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Associate employees to expenses</span>
                </label>
              </div>

              {/* Mileage Preference Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Mileage Preference</h4>
                <div className="space-y-4">
                  {/* Default Mileage Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Mileage Category
                    </label>
                    <select
                      value={mileagePreferences.defaultMileageCategory}
                      onChange={(e) => handleMileagePreferencesChange('defaultMileageCategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {mileageCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
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
                          checked={mileagePreferences.defaultUnit === 'km'}
                          onChange={(e) => handleMileagePreferencesChange('defaultUnit', e.target.value)}
                          className="mr-2"
                        />
                        Km
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="defaultUnit"
                          value="mile"
                          checked={mileagePreferences.defaultUnit === 'mile'}
                          onChange={(e) => handleMileagePreferencesChange('defaultUnit', e.target.value)}
                          className="mr-2"
                        />
                        Mile
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mileage Rates Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">MILEAGE RATES</h4>
                <p className="text-xs text-gray-600 mb-4">
                  Any mileage expense recorded on or after the start date will have the corresponding mileage rate. 
                  You can create a default rate (created without specifying a date), which will be applicable for 
                  mileage expenses recorded before the initial start date.
                </p>
                
                <div className="space-y-3">
                  {mileagePreferences.mileageRates.map((rate) => (
                    <div key={rate.id} className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={rate.startDate}
                        onChange={(e) => handleMileageRateChange(rate.id, 'startDate', e.target.value)}
                        placeholder="dd/MM/yyyy"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex">
                        <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-sm text-gray-700">
                          {rate.currency}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={rate.rate}
                          onChange={(e) => handleMileageRateChange(rate.id, 'rate', e.target.value)}
                          placeholder="Rate"
                          className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {mileagePreferences.mileageRates.length > 1 && (
                        <button
                          onClick={() => removeMileageRate(rate.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addMileageRate}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-2"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Mileage Rate
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowMileagePreferences(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMileagePreferences(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        )}
        </div>
      </>
  );
}