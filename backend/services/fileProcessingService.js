import csv from 'csv-parser';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

class FileProcessingService {
  constructor() {
    this.supportedFormats = {
      csv: ['.csv'],
      excel: ['.xlsx', '.xls'],
      pdf: ['.pdf'],
      ofx: ['.ofx'],
      qif: ['.qif'],
      camt: ['.xml']
    };
  }

  // Detect file type based on extension
  detectFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    for (const [type, extensions] of Object.entries(this.supportedFormats)) {
      if (extensions.includes(ext)) {
        return type;
      }
    }
    throw new Error('Unsupported file format');
  }

  // Process CSV files
  async processCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Process Excel files
  async processExcel(filePath) {
    try {
      console.log('📊 Excel - Reading file:', filePath);
      const workbook = xlsx.readFile(filePath);
      console.log('📊 Excel - Workbook sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      console.log('📊 Excel - Processing sheet:', sheetName);
      
      // Try different parsing methods
      let data;
      try {
        // First try with header: 1 (array format)
        data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length < 2) {
          throw new Error('Not enough data rows');
        }

        const headers = data[0];
        const rows = data.slice(1);
        
        const processedRows = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        
        console.log('📊 Excel - Processed rows count:', processedRows.length);
        console.log('📊 Excel - First few rows:', processedRows.slice(0, 3));
        console.log('📊 Excel - Headers:', headers);
        
        return processedRows;
      } catch (arrayError) {
        // Fallback to object format
        console.log('Array format failed, trying object format:', arrayError.message);
        data = xlsx.utils.sheet_to_json(worksheet);
        
        if (data.length === 0) {
          throw new Error('No data found in Excel file');
        }

        const processedRows = data.map(row => {
          // Clean up the data and ensure proper types
          const cleanedRow = {};
          Object.keys(row).forEach(key => {
            if (row[key] !== undefined && row[key] !== null) {
              cleanedRow[key] = row[key];
            }
          });
          return cleanedRow;
        });
        
        console.log('📊 Excel - Object format processed rows count:', processedRows.length);
        console.log('📊 Excel - Object format first few rows:', processedRows.slice(0, 3));
        
        return processedRows;
      }
    } catch (error) {
      console.error('❌ Excel - Processing error:', error);
      console.error('❌ Excel - Error message:', error.message);
      console.error('❌ Excel - Error stack:', error.stack);
      throw new Error(`Error processing Excel file: ${error.message}`);
    }
  }

  // Process PDF files (basic text extraction)
  async processPDF(filePath) {
    // This would require a PDF parsing library like pdf-parse
    // For now, return a placeholder
    throw new Error('PDF processing not yet implemented');
  }

  // Process OFX files
  async processOFX(filePath) {
    // OFX parsing would require a specific library
    // For now, return a placeholder
    throw new Error('OFX processing not yet implemented');
  }

  // Process QIF files
  async processQIF(filePath) {
    // QIF parsing would require custom logic
    // For now, return a placeholder
    throw new Error('QIF processing not yet implemented');
  }

  // Process CAMT files
  async processCAMT(filePath) {
    // CAMT parsing would require XML parsing
    // For now, return a placeholder
    throw new Error('CAMT processing not yet implemented');
  }

  // Main processing method
  async processFile(filePath, fileType = null) {
    try {
      if (!fileType) {
        fileType = this.detectFileType(filePath);
      }

      switch (fileType) {
        case 'csv':
          return await this.processCSV(filePath);
        case 'excel':
          return await this.processExcel(filePath);
        case 'pdf':
          return await this.processPDF(filePath);
        case 'ofx':
          return await this.processOFX(filePath);
        case 'qif':
          return await this.processQIF(filePath);
        case 'camt':
          return await this.processCAMT(filePath);
        default:
          throw new Error('Unsupported file type');
      }
    } catch (error) {
      throw new Error(`File processing failed: ${error.message}`);
    }
  }

  // Validate file size
  validateFileSize(filePath, maxSizeMB = 5) {
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > maxSizeMB) {
      throw new Error(`File size exceeds maximum limit of ${maxSizeMB}MB`);
    }
    
    return true;
  }

  // Extract headers from processed data
  extractHeaders(data) {
    if (data.length === 0) {
      console.log('📋 No data to extract headers from');
      return [];
    }
    const headers = Object.keys(data[0]);
    console.log('📋 Extracted headers from data:', headers);
    console.log('📋 First data row:', data[0]);
    return headers;
  }

  // Auto-map fields based on common patterns
  autoMapFields(headers) {
    console.log('🔍 Auto-mapping headers:', headers);
    const mapping = {};
    const headerLower = headers.map(h => h.toLowerCase().trim());
    console.log('🔍 Lowercase headers:', headerLower);
    
    console.log('🔍 Headers detected:', headers);
    console.log('🔍 Headers (lowercase):', headerLower);
    
    // Date mapping - more comprehensive
    const dateFields = [
      'date', 'transaction date', 'txn date', 'posting date', 'value date',
      'transaction_date', 'txn_date', 'posting_date', 'value_date',
      'tran date', 'tran_date', 'processed date', 'processed_date',
      'transaction time', 'transaction_time', 'date of transaction',
      'date_of_transaction', 'tdate', 't_date'
    ];
    const dateField = headerLower.find(h => dateFields.includes(h));
    if (dateField) mapping.date = headers[headerLower.indexOf(dateField)];

    // Description mapping - more comprehensive
    const descFields = [
      'description', 'narration', 'particulars', 'details', 'memo', 'remarks',
      'transaction description', 'transaction_details', 'transaction_details',
      'narrative', 'purpose', 'reference description', 'transaction type',
      'transaction_type', 'description of transaction', 'description_of_transaction',
      'transaction info', 'transaction_info', 'remarks', 'comments', 'note'
    ];
    const descField = headerLower.find(h => descFields.includes(h));
    if (descField) mapping.description = headers[headerLower.indexOf(descField)];

    // Payee mapping - more comprehensive
    const payeeFields = [
      'payee', 'beneficiary', 'to', 'from', 'party', 'counterparty',
      'beneficiary name', 'payee name', 'party name', 'customer name',
      'beneficiary_name', 'payee_name', 'party_name', 'customer_name',
      'payee/beneficiary', 'payee_beneficiary', 'beneficiary/payee',
      'beneficiary_payee', 'merchant', 'vendor', 'supplier', 'client'
    ];
    const payeeField = headerLower.find(h => payeeFields.includes(h));
    if (payeeField) mapping.payee = headers[headerLower.indexOf(payeeField)];

    // Reference mapping - more comprehensive
    const refFields = [
      'reference', 'ref', 'reference number', 'cheque no', 'transaction id',
      'reference_no', 'ref_no', 'cheque_no', 'transaction_id', 'txn_id',
      'chq no', 'chq_no', 'check no', 'check_no', 'cheque number',
      'cheque_number', 'transaction reference', 'transaction_reference',
      'reference code', 'reference_code', 'ref code', 'ref_code',
      'transaction no', 'transaction_no', 'txn no', 'txn_no',
      'cheque ref', 'cheque_ref', 'chq ref', 'chq_ref'
    ];
    const refField = headerLower.find(h => refFields.includes(h));
    if (refField) mapping.referenceNumber = headers[headerLower.indexOf(refField)];

    // Withdrawals mapping - more comprehensive
    const withdrawalFields = [
      'withdrawals', 'debit', 'withdrawal', 'out', 'paid', 'debit amount',
      'withdrawal_amount', 'debit_amount', 'paid_amount', 'out_amount',
      'withdrawal_amt', 'debit_amt', 'paid_amt', 'out_amt', 'dr', 'dr amount',
      'dr_amount', 'expense', 'expense amount', 'expense_amount', 'debit (₹)',
      'debit(₹)', 'debit (inr)', 'debit(inr)', 'debit (rs)', 'debit(rs)',
      'debit (inr)', 'debit(inr)', 'debit (rs)', 'debit(rs)', 'debit amount (₹)',
      'debit amount(inr)', 'debit amount(rs)', 'debit amt (₹)', 'debit amt(inr)',
      'debit amt(rs)', 'debit amt (₹)', 'debit amt(inr)', 'debit amt(rs)',
      'withdrawal (₹)', 'withdrawal(₹)', 'withdrawal (inr)', 'withdrawal(inr)',
      'withdrawal (rs)', 'withdrawal(rs)', 'out (₹)', 'out(₹)', 'out (inr)',
      'out(inr)', 'out (rs)', 'out(rs)', 'paid (₹)', 'paid(₹)', 'paid (inr)',
      'paid(inr)', 'paid (rs)', 'paid(rs)', 'expense (₹)', 'expense(₹)',
      'expense (inr)', 'expense(inr)', 'expense (rs)', 'expense(rs)'
    ];
    const withdrawalField = headerLower.find(h => withdrawalFields.includes(h));
    if (withdrawalField) mapping.withdrawals = headers[headerLower.indexOf(withdrawalField)];

    // Deposits mapping - more comprehensive
    const depositFields = [
      'deposits', 'credit', 'deposit', 'in', 'received', 'credit amount',
      'deposit_amount', 'credit_amount', 'received_amount', 'in_amount',
      'deposit_amt', 'credit_amt', 'received_amt', 'in_amt', 'cr', 'cr amount',
      'cr_amount', 'income', 'income amount', 'income_amount', 'credit (₹)',
      'credit(₹)', 'credit (inr)', 'credit(inr)', 'credit (rs)', 'credit(rs)',
      'deposit (₹)', 'deposit(₹)', 'deposit (inr)', 'deposit(inr)', 'deposit (rs)',
      'deposit(rs)', 'in (₹)', 'in(₹)', 'in (inr)', 'in(inr)', 'in (rs)',
      'in(rs)', 'received (₹)', 'received(₹)', 'received (inr)', 'received(inr)',
      'received (rs)', 'received(rs)', 'income (₹)', 'income(₹)', 'income (inr)',
      'income(inr)', 'income (rs)', 'income(rs)'
    ];
    const depositField = headerLower.find(h => depositFields.includes(h));
    if (depositField) mapping.deposits = headers[headerLower.indexOf(depositField)];

    // Balance mapping (optional)
    const balanceFields = [
      'balance', 'running balance', 'available balance', 'account balance',
      'running_balance', 'available_balance', 'account_balance', 'bal',
      'current balance', 'current_balance', 'closing balance', 'closing_balance',
      'opening balance', 'opening_balance', 'balance (₹)', 'balance(₹)',
      'balance (inr)', 'balance(inr)', 'balance (rs)', 'balance(rs)'
    ];
    const balanceField = headerLower.find(h => balanceFields.includes(h));
    if (balanceField) mapping.balance = headers[headerLower.indexOf(balanceField)];

    // Category mapping
    const categoryFields = [
      'category', 'transaction category', 'transaction_category', 'type', 'transaction type',
      'transaction_type', 'classification', 'transaction classification', 'transaction_classification',
      'subcategory', 'transaction subcategory', 'transaction_subcategory', 'class', 'transaction class',
      'transaction_class', 'group', 'transaction group', 'transaction_group'
    ];
    const categoryField = headerLower.find(h => categoryFields.includes(h));
    if (categoryField) mapping.category = headers[headerLower.indexOf(categoryField)];

    // Status mapping
    const statusFields = [
      'status', 'transaction status', 'transaction_status', 'state', 'transaction state',
      'transaction_state', 'condition', 'transaction condition', 'transaction_condition'
    ];
    const statusField = headerLower.find(h => statusFields.includes(h));
    if (statusField) mapping.status = headers[headerLower.indexOf(statusField)];

    // If no specific withdrawal/deposit fields found, look for amount fields
    if (!mapping.withdrawals && !mapping.deposits) {
      const amountFields = [
        'amount', 'transaction amount', 'transaction_amount', 'txn amount',
        'txn_amount', 'amount (₹)', 'amount(₹)', 'amount (inr)', 'amount(inr)',
        'amount (rs)', 'amount(rs)', 'value', 'transaction value', 'transaction_value',
        'net amount', 'net_amount', 'gross amount', 'gross_amount'
      ];
      const amountField = headerLower.find(h => amountFields.includes(h));
      if (amountField) mapping.amount = headers[headerLower.indexOf(amountField)];
    }

    console.log('🔍 Final mapping result:', mapping);
    console.log('🔍 Final mapping JSON:', JSON.stringify(mapping, null, 2));
    return mapping;
  }

  // Enhanced amount parsing for Indian banking formats
  parseAmount(amountStr) {
    if (!amountStr) return 0;
    
    // Convert to string and clean
    let cleanedStr = String(amountStr).trim();
    
    // Remove currency symbols and common prefixes
    cleanedStr = cleanedStr.replace(/[₹$€£¥,\s]/g, '');
    
    // Handle different decimal formats
    if (cleanedStr.includes(',')) {
      // Check if comma is decimal separator (European format) or thousands separator
      const parts = cleanedStr.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // European decimal format: 1234,56
        cleanedStr = parts[0] + '.' + parts[1];
      } else {
        // Thousands separator: 1,234,567
        cleanedStr = cleanedStr.replace(/,/g, '');
      }
    }
    
    // Handle negative amounts in parentheses or with minus sign
    const isNegative = cleanedStr.includes('(') && cleanedStr.includes(')') || 
                      cleanedStr.startsWith('-') || 
                      cleanedStr.startsWith('(');
    
    if (isNegative) {
      cleanedStr = cleanedStr.replace(/[()]/g, '').replace(/^-/, '');
    }
    
    // Parse the number
    const amount = parseFloat(cleanedStr);
    const result = isNaN(amount) ? 0 : amount;
    
    return isNegative ? -result : result;
  }

  // Generate meaningful transaction descriptions
  generateDescription(row, mapping) {
    const description = row[mapping.description] || '';
    const payee = row[mapping.payee] || '';
    const ref = row[mapping.referenceNumber] || '';
    
    // If we have a good description, use it
    if (description && description.trim() && description !== '0' && description !== '') {
      return description.trim();
    }
    
    // Try to build from other fields
    let parts = [];
    if (payee && payee.trim()) parts.push(payee.trim());
    if (ref && ref.trim()) parts.push(`Ref: ${ref.trim()}`);
    
    if (parts.length > 0) {
      return parts.join(' - ');
    }
    
    return 'Bank Transaction';
  }
}

export default new FileProcessingService();


