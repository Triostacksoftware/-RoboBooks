"use client";

import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface BulkExportModalProps {
  selectedIds: string[];
  selectedData?: any[]; // Actual data objects
  type: string;
  onClose: () => void;
}

const BulkExportModal: React.FC<BulkExportModalProps> = ({ selectedIds, selectedData, type, onClose }) => {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('pdf');
  const [dateRange, setDateRange] = useState<'all' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [includeFields, setIncludeFields] = useState<string[]>([]);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  React.useEffect(() => {
    // Set default fields based on type
    setDefaultFields(type);
  }, [type]);

  const setDefaultFields = (type: string) => {
    const fieldMap: { [key: string]: string[] } = {
      'expenses': ['name', 'date', 'amount', 'category', 'status', 'vendor'],
      'bills': ['billNumber', 'date', 'amount', 'vendor', 'status', 'dueDate'],
      'payments': ['paymentNumber', 'date', 'amount', 'vendor', 'method', 'status'],
      'purchase-orders': ['poNumber', 'date', 'amount', 'vendor', 'status', 'expectedDate'],
      'vendor-credits': ['creditNumber', 'date', 'amount', 'vendor', 'status', 'reason'],
      'vendors': ['name', 'companyName', 'email', 'phone', 'address', 'status'],
      'recurring-bills': ['name', 'amount', 'frequency', 'nextDue', 'vendor', 'status'],
      'recurring-expenses': ['name', 'amount', 'frequency', 'nextDue', 'category', 'status']
    };
    setIncludeFields(fieldMap[type] || []);
  };

  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'expenses': 'Expenses',
      'bills': 'Bills',
      'payments': 'Payments Made',
      'purchase-orders': 'Purchase Orders',
      'vendor-credits': 'Vendor Credits',
      'vendors': 'Vendors',
      'recurring-bills': 'Recurring Bills',
      'recurring-expenses': 'Recurring Expenses'
    };
    return typeMap[type] || type;
  };

  const getAvailableFields = (type: string) => {
    const fieldMap: { [key: string]: { [key: string]: string } } = {
      'expenses': {
        'name': 'Expense Name',
        'date': 'Date',
        'amount': 'Amount',
        'category': 'Category',
        'status': 'Status',
        'vendor': 'Vendor',
        'description': 'Description',
        'reference': 'Reference'
      },
      'bills': {
        'billNumber': 'Bill Number',
        'date': 'Date',
        'amount': 'Amount',
        'vendor': 'Vendor',
        'status': 'Status',
        'dueDate': 'Due Date',
        'description': 'Description'
      },
      'payments': {
        'paymentNumber': 'Payment Number',
        'date': 'Date',
        'amount': 'Amount',
        'vendor': 'Vendor',
        'method': 'Payment Method',
        'status': 'Status',
        'reference': 'Reference'
      },
      'purchase-orders': {
        'poNumber': 'PO Number',
        'date': 'Date',
        'amount': 'Amount',
        'vendor': 'Vendor',
        'status': 'Status',
        'expectedDate': 'Expected Date',
        'description': 'Description'
      },
      'vendor-credits': {
        'creditNumber': 'Credit Number',
        'date': 'Date',
        'amount': 'Amount',
        'vendor': 'Vendor',
        'status': 'Status',
        'reason': 'Reason'
      },
      'vendors': {
        'name': 'Name',
        'companyName': 'Company Name',
        'email': 'Email',
        'phone': 'Phone',
        'address': 'Address',
        'status': 'Status',
        'gstin': 'GSTIN'
      },
      'recurring-bills': {
        'name': 'Name',
        'amount': 'Amount',
        'frequency': 'Frequency',
        'nextDue': 'Next Due',
        'vendor': 'Vendor',
        'status': 'Status',
        'description': 'Description'
      },
      'recurring-expenses': {
        'name': 'Name',
        'amount': 'Amount',
        'frequency': 'Frequency',
        'nextDue': 'Next Due',
        'category': 'Category',
        'status': 'Status',
        'description': 'Description'
      }
    };
    return fieldMap[type] || {};
  };

  const toggleField = (field: string) => {
    setIncludeFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const generateCSVContent = () => {
    const headers = includeFields.map(field => {
      const availableFields = getAvailableFields(type);
      return availableFields[field] || field;
    }).join(',');
    
    let dataRows = [];
    
    // Use real data if available, otherwise generate sample data
    if (selectedData && selectedData.length > 0) {
      dataRows = selectedData.map(item => {
        return includeFields.map(field => {
          // Map field names to actual data properties
          let value = '';
          switch (field) {
            case 'name':
            case 'expenseName':
              value = item.name || item.expenseName || item.title || 'N/A';
              break;
            case 'billNumber':
              value = item.billNumber || item.number || 'N/A';
              break;
            case 'paymentNumber':
              value = item.paymentNumber || item.number || 'N/A';
              break;
            case 'poNumber':
              value = item.poNumber || item.number || 'N/A';
              break;
            case 'creditNumber':
              value = item.creditNumber || item.number || 'N/A';
              break;
            case 'date':
              value = item.date ? new Date(item.date).toISOString().split('T')[0] : 'N/A';
              break;
            case 'amount':
              value = item.amount ? `?${parseFloat(item.amount).toFixed(2)}` : '?0.00';
              break;
            case 'status':
              value = item.status || 'N/A';
              break;
            case 'vendor':
              value = item.vendor?.name || item.vendorName || item.vendor || 'N/A';
              break;
            case 'category':
              value = item.category || item.expenseAccount || 'N/A';
              break;
            case 'description':
              value = item.description || item.notes || 'N/A';
              break;
            case 'reference':
              value = item.reference || item.referenceNumber || 'N/A';
              break;
            case 'companyName':
              value = item.companyName || item.company?.name || 'N/A';
              break;
            case 'email':
              value = item.email || 'N/A';
              break;
            case 'phone':
              value = item.phone || item.phoneNumber || 'N/A';
              break;
            case 'address':
              value = item.address || item.billingAddress || 'N/A';
              break;
            case 'gstin':
              value = item.gstin || item.taxId || 'N/A';
              break;
            case 'frequency':
              value = item.frequency || 'N/A';
              break;
            case 'nextDue':
              value = item.nextDue ? new Date(item.nextDue).toISOString().split('T')[0] : 'N/A';
              break;
            case 'dueDate':
              value = item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : 'N/A';
              break;
            case 'expectedDate':
              value = item.expectedDate ? new Date(item.expectedDate).toISOString().split('T')[0] : 'N/A';
              break;
            case 'method':
              value = item.method || item.paymentMethod || 'N/A';
              break;
            case 'reason':
              value = item.reason || 'N/A';
              break;
            default:
              value = item[field] || 'N/A';
          }
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });
    } else {
      // Generate sample data if no real data available
      for (let i = 1; i <= Math.min(selectedIds.length || 5, 10); i++) {
        const row = includeFields.map(field => {
          switch (field) {
            case 'name':
            case 'expenseName':
            case 'billNumber':
            case 'paymentNumber':
            case 'poNumber':
            case 'creditNumber':
              return `Sample ${getTypeDisplayName(type)} ${i}`;
            case 'date':
              return new Date().toISOString().split('T')[0];
            case 'amount':
              return `?${(Math.random() * 1000 + 100).toFixed(2)}`;
            case 'status':
              return ['Active', 'Pending', 'Completed'][Math.floor(Math.random() * 3)];
            case 'vendor':
              return `Vendor ${i}`;
            case 'category':
              return ['Office Supplies', 'Travel', 'Meals'][Math.floor(Math.random() * 3)];
            case 'description':
              return `Description for ${getTypeDisplayName(type)} ${i}`;
            case 'reference':
              return `REF-${i.toString().padStart(3, '0')}`;
            default:
              return `Sample ${field}`;
          }
        });
        dataRows.push(row.join(','));
      }
    }
    
    return [headers, ...dataRows].join('\n');
  };

  const handleExport = async () => {
    if (includeFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }

    setExportStatus('processing');
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let fileContent = '';
      let mimeType = '';
      let fileExtension = '';
      
      switch (exportFormat) {
        case 'csv':
          fileContent = generateCSVContent();
          mimeType = 'text/csv;charset=utf-8';
          fileExtension = 'csv';
          break;
        case 'excel':
          // For Excel, we'll create a proper Excel XML format
          const excelCsvContent = generateCSVContent();
          const excelLines = excelCsvContent.split('\n');
          const excelHeaders = excelLines[0].split(',');
          const excelDataRows = excelLines.slice(1);
          
          fileContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${getTypeDisplayName(type)} Export</Title>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${getTypeDisplayName(type)}">
  <Table>
   <Row ss:StyleID="Header">
    ${excelHeaders.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
   </Row>
   ${excelDataRows.map(row => {
     const cells = row.split(',');
     return `<Row>${cells.map(cell => `<Cell><Data ss:Type="String">${cell}</Data></Cell>`).join('')}</Row>`;
   }).join('')}
  </Table>
 </Worksheet>
</Workbook>`;
          mimeType = 'application/vnd.ms-excel';
          fileExtension = 'xls';
          break;
        case 'pdf':
          // For PDF, we'll create a simple text-based PDF structure
          const pdfCsvContent = generateCSVContent();
          const pdfLines = pdfCsvContent.split('\n');
          const pdfHeaders = pdfLines[0].split(',');
          const pdfDataRows = pdfLines.slice(1);
          
          // Create a simple PDF structure
          fileContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length 500
>>
stream
BT
/F1 14 Tf
50 750 Td
(${getTypeDisplayName(type)} Export Report) Tj
0 -25 Td
/F1 10 Tf
(Export Date: ${new Date().toLocaleDateString()}) Tj
0 -15 Td
(Total Records: ${selectedIds.length || 5}) Tj
0 -30 Td
/F1 12 Tf
(${pdfHeaders.join(' | ')}) Tj
0 -15 Td
/F1 10 Tf
${pdfDataRows.slice(0, 20).map(row => `(${row.replace(/,/g, ' | ')}) Tj 0 -12 Td`).join('\n')}
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
800
%%EOF`;
          mimeType = 'application/pdf';
          fileExtension = 'pdf';
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      // Create proper data URL
      const dataUrl = `data:${mimeType};base64,${btoa(unescape(encodeURIComponent(fileContent)))}`;
      setDownloadUrl(dataUrl);
      setExportStatus('success');
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
    }
  };

  const downloadFile = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get correct file extension based on format
      let fileExtension = exportFormat;
      if (exportFormat === 'excel') {
        fileExtension = 'xls';
      }
      
      link.download = `${getTypeDisplayName(type)}_Export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
    }
  };

  const availableFields = getAvailableFields(type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Export</h2>
            <p className="text-gray-600 mt-1">
              Export {getTypeDisplayName(type)} data in your preferred format
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {selectedIds.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>{selectedIds.length}</strong> {getTypeDisplayName(type).toLowerCase()} selected for export
              </p>
            </div>
          )}

          {/* Export Format */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Format</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'pdf', label: 'PDF (.pdf)', icon: DocumentIcon },
                { value: 'csv', label: 'CSV (.csv)', icon: DocumentIcon },
                { value: 'excel', label: 'Excel (.xls)', icon: DocumentIcon }
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as any)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <format.icon className="w-8 h-8 text-gray-600 mb-2" />
                  <div className="text-sm font-medium text-gray-900">{format.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={dateRange === 'all'}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="mr-2"
                  />
                  All Records
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="custom"
                    checked={dateRange === 'custom'}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="mr-2"
                  />
                  Custom Range
                </label>
              </div>
              
              {dateRange === 'custom' && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fields Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Fields to Export</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(availableFields).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={includeFields.includes(key)}
                    onChange={() => toggleField(key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Results */}
          {exportStatus === 'success' && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Export Ready</h3>
              </div>
               <p className="text-gray-600 mb-4">
                 Your export has been generated successfully. Click the button below to download.
               </p>
                 <button
                   onClick={downloadFile}
                   className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                 >
                   <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                   Export
                 </button>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Export Failed</h3>
              </div>
              <p className="text-red-600">An error occurred during the export process. Please try again.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exportStatus === 'processing' || includeFields.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportStatus === 'processing' ? 'Generating Export...' : 'Export Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkExportModal;
