# Customer & Invoice Database Integration

This module demonstrates how to fetch customers and invoices from their respective databases and integrate them into the Payments Received component.

## Overview

The integration provides:
- **Customer Database**: Fetches customer information including business details, contact info, and financial data
- **Invoice Database**: Retrieves invoice data with line items, amounts, and payment status
- **Real-time Status**: Shows loading states, error handling, and data refresh capabilities
- **Type Safety**: Full TypeScript interfaces for all data structures

## Components

### 1. PaymentsReceivedHeader.tsx
The main header component that now includes:
- Customer and invoice data fetching
- Real-time status indicators
- Data refresh functionality
- Error handling and loading states

### 2. CustomerInvoiceDataDemo.tsx
A demonstration component that showcases:
- Tabbed view of customers and invoices
- Data visualization with cards and grids
- Summary statistics
- Responsive design

### 3. customerInvoiceService.ts
A service layer that provides:
- API calls to customer and invoice endpoints
- Type-safe interfaces
- Error handling and response formatting
- Search and filtering capabilities

## Database Models

### Customer Model
```typescript
interface Customer {
  _id: string;
  customerType: 'Business' | 'Individual';
  firstName: string;
  lastName: string;
  companyName?: string;
  displayName: string;
  email: string;
  workPhone?: string;
  mobile?: string;
  pan?: string;
  currency: string;
  openingBalance: number;
  paymentTerms: string;
  receivables: number;
  unusedCredits: number;
  isActive: boolean;
  // ... additional fields
}
```

### Invoice Model
```typescript
interface Invoice {
  _id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subTotal: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Unpaid' | 'Paid' | 'Overdue' | 'Partially Paid' | 'Cancelled' | 'Void';
  amountPaid: number;
  balanceDue: number;
  // ... additional fields
}
```

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers with pagination and filtering
- `GET /api/customers/:id` - Get customer by ID
- `GET /api/customers/search?q=query` - Search customers
- `GET /api/customers/type/:type` - Get customers by type (Business/Individual)
- `GET /api/customers/stats` - Get customer statistics

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

## Usage

### Basic Integration
```typescript
import CustomerInvoiceService from '@/lib/services/customerInvoiceService';

// Fetch customers
const customers = await CustomerInvoiceService.getCustomers({
  status: 'active',
  limit: 100
});

// Fetch invoices
const invoices = await CustomerInvoiceService.getInvoices();

// Search customers
const searchResults = await CustomerInvoiceService.searchCustomers('John Doe');
```

### In React Components
```typescript
const [customers, setCustomers] = useState<Customer[]>([]);
const [invoices, setInvoices] = useState<Invoice[]>([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [customersRes, invoicesRes] = await Promise.all([
        CustomerInvoiceService.getCustomers(),
        CustomerInvoiceService.getInvoices()
      ]);
      setCustomers(customersRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  
  fetchData();
}, []);
```

## Features

### Data Status Indicators
- Real-time loading states with spinners
- Error handling with user-friendly messages
- Success indicators showing data counts
- Manual refresh button

### Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages
- Retry mechanisms
- Loading state management

### Performance
- Efficient data fetching with pagination
- Optimized re-renders
- Memory management for large datasets
- Background refresh capabilities

## Configuration

### Environment Variables
Ensure these are set in your `.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Backend Requirements
The backend must have:
- MongoDB connection with Customer and Invoice models
- JWT authentication middleware
- CORS configuration for frontend access
- Proper error handling and response formatting

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has proper CORS configuration
2. **Authentication Errors**: Check JWT token validity and localStorage
3. **Database Connection**: Verify MongoDB connection in backend
4. **API Endpoints**: Confirm all routes are properly registered

### Debug Mode
Enable console logging by checking the browser console for:
- ✅ Success messages with data counts
- ❌ Error messages with details
- 📊 Customer loading status
- 📄 Invoice loading status

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: Service worker for offline data access
- **Data Caching**: Redis integration for improved performance
- **Advanced Filtering**: Complex search and filter capabilities
- **Data Export**: CSV/Excel export functionality
- **Bulk Operations**: Mass update and delete operations

## Contributing

When adding new features:
1. Update TypeScript interfaces
2. Add proper error handling
3. Include loading states
4. Add console logging for debugging
5. Update this documentation

## License

This integration is part of the RoboBooks project and follows the same licensing terms.
