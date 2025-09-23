import xlsx from 'xlsx';
import path from 'path';

// Create a test Excel file with proper banking format
const testData = [
  {
    'Date': '2025-09-22',
    'Narration': 'ATM Withdrawal',
    'Debit (₹)': '5000',
    'Credit (₹)': '',
    'Reference': 'REF-001'
  },
  {
    'Date': '2025-09-21',
    'Narration': 'Salary Credit',
    'Debit (₹)': '',
    'Credit (₹)': '50000',
    'Reference': 'REF-002'
  },
  {
    'Date': '2025-09-20',
    'Narration': 'Online Shopping',
    'Debit (₹)': '2500',
    'Credit (₹)': '',
    'Reference': 'REF-003'
  },
  {
    'Date': '2025-09-19',
    'Narration': 'Investment Returns',
    'Debit (₹)': '',
    'Credit (₹)': '15000',
    'Reference': 'REF-004'
  },
  {
    'Date': '2025-09-18',
    'Narration': 'Electricity Bill',
    'Debit (₹)': '3200',
    'Credit (₹)': '',
    'Reference': 'REF-005'
  }
];

// Create workbook and worksheet
const workbook = xlsx.utils.book_new();
const worksheet = xlsx.utils.json_to_sheet(testData);

// Add worksheet to workbook
xlsx.utils.book_append_sheet(workbook, worksheet, 'Transactions');

// Write file
const filePath = path.join('test-banking-transactions.xlsx');
xlsx.writeFile(workbook, filePath);

console.log('✅ Test Excel file created:', filePath);
console.log('📊 Test data:', testData);

