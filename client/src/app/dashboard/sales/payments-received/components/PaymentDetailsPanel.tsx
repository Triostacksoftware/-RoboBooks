'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon,
  PencilIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  DocumentIcon,
  Cog6ToothIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Payment } from '@/services/paymentService';
import PaymentHistoryModal from './PaymentHistoryModal';
import { samplePaymentHistory } from './paymentHistoryData';
import UploadFilesModal from './UploadFilesModal';

interface PaymentDetailsPanelProps {
  payment: Payment;
  onClose: () => void;
  onEdit: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: Date;
}

export default function PaymentDetailsPanel({ 
  payment, 
  onClose, 
  onEdit, 
  onDelete 
}: PaymentDetailsPanelProps) {
  const [showSendDropdown, setShowSendDropdown] = useState(false);
  const [showPdfDropdown, setShowPdfDropdown] = useState(false);
  const [showMoreActionsDropdown, setShowMoreActionsDropdown] = useState(false);
  const [showPaymentHistoryDropdown, setShowPaymentHistoryDropdown] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showUploadFilesDropdown, setShowUploadFilesDropdown] = useState(false);
  const [showUploadFilesModal, setShowUploadFilesModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  
  const sendDropdownRef = useRef<HTMLDivElement>(null);
  const pdfDropdownRef = useRef<HTMLDivElement>(null);
  const moreActionsDropdownRef = useRef<HTMLDivElement>(null);
  const paymentHistoryDropdownRef = useRef<HTMLDivElement>(null);
  const uploadFilesDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sendDropdownRef.current && !sendDropdownRef.current.contains(event.target as Node)) {
        setShowSendDropdown(false);
      }
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(event.target as Node)) {
        setShowPdfDropdown(false);
      }
      if (moreActionsDropdownRef.current && !moreActionsDropdownRef.current.contains(event.target as Node)) {
        setShowMoreActionsDropdown(false);
      }
      if (paymentHistoryDropdownRef.current && !paymentHistoryDropdownRef.current.contains(event.target as Node)) {
        setShowPaymentHistoryDropdown(false);
      }
      if (uploadFilesDropdownRef.current && !uploadFilesDropdownRef.current.contains(event.target as Node)) {
        setShowUploadFilesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // File upload handlers with ss2 features
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const validateFile = (file: File): string | null => {
    // File size validation (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return `File ${file.name} exceeds 10MB limit`;
    }
    
    // File type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    
    return null;
  };

  const simulateUploadProgress = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 500);
      }
      setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(progress, 100) }));
    }, 200);
  };

  const handleFiles = (files: File[]) => {
    // Clear previous errors
    setUploadErrors([]);
    
    // Check file count limit
    if (uploadedFiles.length + files.length > 5) {
      setUploadErrors(['Maximum 5 files allowed']);
      return;
    }

    const errors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
      if (validFiles.length === 0) return;
    }

    // Process valid files
    const newFiles: UploadedFile[] = validFiles.map(file => {
      const fileId = Date.now() + Math.random().toString(36).substr(2, 9);
      // Simulate upload progress
      simulateUploadProgress(fileId);
      
      return {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date()
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setShowUploadFilesDropdown(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getAmountInWords = (amount: number): string => {
    // Simple implementation - you can enhance this
    const words = [
      'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (amount === 0) return 'Zero';
    if (amount < 20) return words[amount];
    if (amount < 100) return tens[Math.floor(amount / 10)] + (amount % 10 > 0 ? ' ' + words[amount % 10] : '');
    if (amount < 1000) return words[Math.floor(amount / 100)] + ' Hundred' + (amount % 100 > 0 ? ' and ' + getAmountInWords(amount % 100) : '');
    if (amount < 100000) return getAmountInWords(Math.floor(amount / 1000)) + ' Thousand' + (amount % 1000 > 0 ? ' ' + getAmountInWords(amount % 1000) : '');
    
    return 'Indian Rupee ' + getAmountInWords(Math.floor(amount)) + ' Only';
  };

  const clearErrors = () => {
    setUploadErrors([]);
  };

  return (
    <div className="h-full w-full max-w-none flex flex-col bg-white">
      {/* Header - Static */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* Upload Files Dropdown */}
          <div className="relative" ref={uploadFilesDropdownRef}>
            <button 
              onClick={() => setShowUploadFilesDropdown(!showUploadFilesDropdown)}
              className="inline-flex items-center px-3 py-2 text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Upload files
              {uploadedFiles.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {uploadedFiles.length}
                </span>
              )}
              <ChevronDownIcon className="w-3 h-3 ml-1" />
            </button>
            {showUploadFilesDropdown && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Upload Files</h4>
                </div>
                <div className="p-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Upload your Files</p>
                      <p className="text-xs text-gray-500 mt-1">You can upload a maximum of 5 files, 10MB each</p>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      Choose Files
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Vertical Separator */}
          <div className="w-px h-6 bg-gray-300"></div>
          
          {/* Payment History Dropdown */}
          <div className="relative" ref={paymentHistoryDropdownRef}>
            <button 
              onClick={() => setShowPaymentHistoryDropdown(!showPaymentHistoryDropdown)}
              className="inline-flex items-center px-3 py-2 text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Payment History</span>
              <ChevronDownIcon className="w-3 h-3 ml-1" />
            </button>
            {showPaymentHistoryDropdown && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10 max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Payment History</h4>
                </div>
                <div className="py-2">
                  {samplePaymentHistory.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No payment history available
                    </div>
                  ) : (
                    samplePaymentHistory.map((entry) => (
                      <div key={entry.id} className="px-3 py-2 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          {/* Payment Icon */}
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 border border-green-200 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>

                          {/* Payment Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {entry.customerName}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(entry.timestamp).toLocaleDateString('en-GB') + ' ' + new Date(entry.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </div>
                            
                            {/* Payment Description */}
                            <div className="bg-gray-100 rounded px-2 py-1">
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {entry.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setShowPaymentHistoryModal(true);
                      setShowPaymentHistoryDropdown(false);
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Full History
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons - Static */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(payment)}
            className="flex items-center justify-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
          </button>

          {/* Send Dropdown */}
          <div className="relative" ref={sendDropdownRef}>
            <button
              onClick={() => setShowSendDropdown(!showSendDropdown)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Send</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {showSendDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <button className="w-full text-left px-4 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Send Email</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">💬</span>
                    </div>
                    <span>Send SMS</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* PDF/Print Dropdown */}
          <div className="relative" ref={pdfDropdownRef}>
            <button
              onClick={() => setShowPdfDropdown(!showPdfDropdown)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>PDF/Print</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {showPdfDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <button className="w-full text-left px-4 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    <span>PDF</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 text-gray-600">🖨️</div>
                    <span>Print</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refund</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative" ref={moreActionsDropdownRef}>
            <button 
              onClick={() => setShowMoreActionsDropdown(!showMoreActionsDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {showMoreActionsDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <button className="w-full text-left px-4 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <span>View Journal</span>
                </button>
                <button 
                  onClick={() => onDelete(payment._id)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Receipt - Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 h-full">
          <div className="w-full max-w-none">
            {/* Company Info */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {payment.customerName}
              </h3>
              <p className="text-sm text-gray-600">Bihar, India</p>
              <p className="text-sm text-gray-600">farziemailthisis@gmail.com</p>
            </div>

            <hr className="border-gray-300 mb-6" />

            {/* Receipt Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">PAYMENT RECEIPT</h2>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-medium">{formatDate(payment.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium">{payment.referenceNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-medium">{payment.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Received In Words:</span>
                <span className="font-medium text-sm">{getAmountInWords(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Received From:</span>
                <span className="font-medium">{payment.customerName}</span>
              </div>
            </div>

            {/* Amount Box */}
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center mb-6">
              <div className="text-sm text-green-700 mb-1">Amount Received</div>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(payment.amount)}
              </div>
            </div>

            {/* Signature */}
            <div className="text-center">
              <div className="border-t border-gray-300 pt-4">
                <span className="text-sm text-gray-500">Authorized Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Files Modal */}
      <UploadFilesModal
        isOpen={showUploadFilesModal}
        onClose={() => setShowUploadFilesModal(false)}
        uploadedFiles={uploadedFiles}
        onRemoveFile={removeFile}
        onUploadFiles={handleFiles}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={showPaymentHistoryModal}
        onClose={() => setShowPaymentHistoryModal(false)}
        paymentHistory={samplePaymentHistory}
      />
    </div>
  );
}
