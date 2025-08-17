export interface PaymentHistoryEntry {
  id: string;
  customerName: string;
  timestamp: string;
  description: string;
  amount: number;
  invoiceNumber: string;
}

export const samplePaymentHistory: PaymentHistoryEntry[] = [
  {
    id: '1',
    customerName: 'Try',
    timestamp: '2025-08-10T18:22:00Z',
    description: 'Payment of amount ₹1,833.75 received and applied for INV-000002',
    amount: 1833.75,
    invoiceNumber: 'INV-000002'
  },
  {
    id: '2',
    customerName: 'ABC Corporation',
    timestamp: '2025-08-09T14:30:00Z',
    description: 'Payment of amount ₹5,000.00 received and applied for INV-000001',
    amount: 5000.00,
    invoiceNumber: 'INV-000001'
  },
  {
    id: '3',
    customerName: 'XYZ Industries',
    timestamp: '2025-08-08T11:15:00Z',
    description: 'Payment of amount ₹3,250.50 received and applied for INV-000003',
    amount: 3250.50,
    invoiceNumber: 'INV-000003'
  },
  {
    id: '4',
    customerName: 'Tech Solutions Ltd',
    timestamp: '2025-08-07T16:45:00Z',
    description: 'Payment of amount ₹7,800.25 received and applied for INV-000004',
    amount: 7800.25,
    invoiceNumber: 'INV-000004'
  },
  {
    id: '5',
    customerName: 'Global Enterprises',
    timestamp: '2025-08-06T09:20:00Z',
    description: 'Payment of amount ₹2,150.00 received and applied for INV-000005',
    amount: 2150.00,
    invoiceNumber: 'INV-000005'
  }
];
