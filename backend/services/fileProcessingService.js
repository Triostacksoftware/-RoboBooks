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
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        throw new Error('Excel file must have at least headers and one data row');
      }

      const headers = data[0];
      const rows = data.slice(1);
      
      return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
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
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }

  // Auto-map fields based on common patterns
  autoMapFields(headers) {
    const mapping = {};
    const headerLower = headers.map(h => h.toLowerCase());
    
    // Date mapping
    const dateFields = ['date', 'transaction date', 'txn date', 'posting date'];
    const dateField = headerLower.find(h => dateFields.includes(h));
    if (dateField) mapping.date = headers[headerLower.indexOf(dateField)];

    // Description mapping
    const descFields = ['description', 'narration', 'particulars', 'details', 'memo'];
    const descField = headerLower.find(h => descFields.includes(h));
    if (descField) mapping.description = headers[headerLower.indexOf(descField)];

    // Payee mapping
    const payeeFields = ['payee', 'beneficiary', 'to', 'from', 'party'];
    const payeeField = headerLower.find(h => payeeFields.includes(h));
    if (payeeField) mapping.payee = headers[headerLower.indexOf(payeeField)];

    // Reference mapping
    const refFields = ['reference', 'ref', 'reference number', 'cheque no', 'transaction id'];
    const refField = headerLower.find(h => refFields.includes(h));
    if (refField) mapping.referenceNumber = headers[headerLower.indexOf(refField)];

    // Withdrawals mapping
    const withdrawalFields = ['withdrawals', 'debit', 'withdrawal', 'out', 'paid'];
    const withdrawalField = headerLower.find(h => withdrawalFields.includes(h));
    if (withdrawalField) mapping.withdrawals = headers[headerLower.indexOf(withdrawalField)];

    // Deposits mapping
    const depositFields = ['deposits', 'credit', 'deposit', 'in', 'received'];
    const depositField = headerLower.find(h => depositFields.includes(h));
    if (depositField) mapping.deposits = headers[headerLower.indexOf(depositField)];

    return mapping;
  }
}

export default new FileProcessingService();


