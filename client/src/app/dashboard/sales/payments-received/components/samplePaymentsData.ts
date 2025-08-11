export interface Payment {
  id: string;
  date: string;
  paymentNumber: string;
  referenceNumber: string;
  customerName: string;
  invoiceNumber: string;
  mode: string;
  amount: number;
  unusedAmount: number;
}

export const samplePayments: Payment[] = [
  {
    id: '1',
    date: '2025-08-10',
    paymentNumber: '1',
    referenceNumber: 'REF-001',
    customerName: 'triostack',
    invoiceNumber: 'INV-000002',
    mode: 'Cash',
    amount: 1833.75,
    unusedAmount: 0.00
  },
  {
    id: '2',
    date: '2025-08-09',
    paymentNumber: '2',
    referenceNumber: 'REF-002',
    customerName: 'Tech Solutions Ltd',
    invoiceNumber: 'INV-000003',
    mode: 'Bank Transfer',
    amount: 5000.00,
    unusedAmount: 250.00
  },
  {
    id: '3',
    date: '2025-08-08',
    paymentNumber: '3',
    referenceNumber: '',
    customerName: 'Global Enterprises',
    invoiceNumber: 'INV-000004',
    mode: 'Cheque',
    amount: 7500.50,
    unusedAmount: 0.00
  },
  {
    id: '4',
    date: '2025-08-07',
    paymentNumber: '4',
    referenceNumber: 'REF-004',
    customerName: 'Innovation Corp',
    invoiceNumber: 'INV-000005',
    mode: 'Credit Card',
    amount: 3200.25,
    unusedAmount: 0.00
  },
  {
    id: '5',
    date: '2025-08-06',
    paymentNumber: '5',
    referenceNumber: 'REF-005',
    customerName: 'Digital Solutions',
    invoiceNumber: 'INV-000006',
    mode: 'UPI',
    amount: 4500.00,
    unusedAmount: 500.00
  }
];
