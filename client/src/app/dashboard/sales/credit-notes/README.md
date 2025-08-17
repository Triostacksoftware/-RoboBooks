# Credit Notes Module

A comprehensive credit notes management system for handling customer refunds, returns, and credits in the RoboBooks application.

## Features

### 🎯 Core Functionality

- **Create Credit Notes**: Generate credit notes for customer refunds and returns
- **Unique Numbering**: Automatic generation of unique credit note numbers (CN-XXXXX format)
- **Status Management**: Track credit notes through draft, open, and void states
- **Item Management**: Add multiple items with quantities, rates, and automatic calculations
- **Customer Integration**: Link credit notes to customer accounts
- **Salesperson Assignment**: Assign credit notes to specific sales personnel

### 📊 Financial Features

- **Automatic Calculations**: Real-time calculation of subtotals, discounts, and totals
- **Tax Support**: TDS/TCS calculation and management
- **Discount Options**: Percentage or fixed amount discounts
- **Adjustments**: Manual adjustments for special circumstances
- **Currency Formatting**: Indian Rupee (INR) formatting throughout

### 🔍 Search & Filter

- **Advanced Search**: Search by customer name, credit note number, or reference
- **Status Filtering**: Filter by draft, open, or void status
- **Date Range Filtering**: Filter by creation or issue date
- **Bulk Operations**: Support for bulk actions on multiple credit notes

### 📄 Document Management

- **PDF Export**: Generate professional PDF credit notes
- **Print Support**: Direct printing functionality
- **Email Integration**: Send credit notes to customers via email
- **Digital Signatures**: Support for digital signing (future enhancement)

## File Structure

```
credit-notes/
├── page.tsx                    # Main credit notes list page
├── new/
│   └── page.tsx               # Create new credit note form
├── [id]/
│   ├── page.tsx               # Credit note detail view
│   ├── edit/
│   │   └── page.tsx           # Edit credit note form
│   └── print/
│       └── page.tsx           # Print view (future)
├── utils/
│   └── creditNoteIdGenerator.ts # Unique ID generation utility
├── services/
│   └── creditNoteService.ts   # API service layer
└── README.md                  # This file
```

## Components Overview

### Main List Page (`page.tsx`)

- Displays all credit notes in a table format
- Search and filter functionality
- Getting started section for new users
- Lifecycle flowchart visualization
- Module capabilities overview

### New Credit Note Form (`new/page.tsx`)

- Comprehensive form for creating credit notes
- Customer selection with search
- Item table with dynamic rows
- Real-time calculations
- Summary sidebar with totals

### Credit Note Detail View (`[id]/page.tsx`)

- Complete credit note information display
- Customer and credit note details
- Item breakdown
- Summary with financial totals
- Action buttons for operations

### Edit Credit Note Form (`[id]/edit/page.tsx`)

- Pre-populated form for editing existing credit notes
- Same functionality as new form
- Validation and error handling
- Status management

## Credit Note Lifecycle

```
Product Returned/Order Cancelled
           ↓
    Credit Note Created
           ↓
    [Draft Status]
           ↓
    [Open Status]
           ↓
    Refund Issued OR Credits Applied
           ↓
    [Void Status] (if needed)
```

## API Integration

The module uses a service layer (`creditNoteService.ts`) for all API operations:

### Endpoints

- `GET /api/credit-notes` - List all credit notes
- `GET /api/credit-notes/:id` - Get single credit note
- `POST /api/credit-notes` - Create new credit note
- `PUT /api/credit-notes/:id` - Update credit note
- `DELETE /api/credit-notes/:id` - Delete credit note
- `PATCH /api/credit-notes/:id/status` - Update status
- `GET /api/credit-notes/stats` - Get statistics
- `GET /api/credit-notes/:id/export/pdf` - Export to PDF
- `POST /api/credit-notes/:id/send` - Send to customer

### Data Models

#### CreditNote Interface

```typescript
interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  referenceNumber?: string;
  salesperson?: string;
  subject?: string;
  items: CreditNoteItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  tdsType: "TDS" | "TCS";
  selectedTax?: string;
  tdsAmount: number;
  adjustment: number;
  total: number;
  status: "draft" | "open" | "void";
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Unique Numbering System

Credit notes use a unique numbering system with the format `CN-XXXXX`:

- **Prefix**: "CN" for Credit Note
- **Format**: 5-digit zero-padded number
- **Auto-increment**: Automatically increments from the last used number
- **Validation**: Ensures no duplicate numbers

### Example Sequence

- CN-00001
- CN-00002
- CN-00003
- ...

## Usage Examples

### Creating a New Credit Note

```typescript
import { creditNoteService } from "./services/creditNoteService";

const newCreditNote = await creditNoteService.createCreditNote({
  customerName: "ABC Company Ltd",
  creditNoteDate: "2025-08-11",
  items: [
    {
      id: "1",
      itemDetails: "Product Return - Laptop",
      account: "Product Returns",
      quantity: 1,
      rate: 15000,
      amount: 15000,
    },
  ],
  discount: 0,
  discountType: "percentage",
  tdsType: "TDS",
  tdsAmount: 0,
  adjustment: 0,
});
```

### Generating Next Number

```typescript
import { creditNoteIdGenerator } from "./utils/creditNoteIdGenerator";

const nextNumber = creditNoteIdGenerator.generateNextNumber("CN-00001");
// Returns: 'CN-00002'
```

## Styling

The module uses Tailwind CSS for styling with a consistent design system:

- **Colors**: Blue primary (#2563eb), gray neutrals
- **Spacing**: Consistent 6-unit spacing system
- **Typography**: Inter font family
- **Components**: Reusable card and button components
- **Responsive**: Mobile-first responsive design

## Future Enhancements

### Planned Features

- [ ] Bulk import/export functionality
- [ ] Advanced reporting and analytics
- [ ] Integration with accounting systems
- [ ] Digital signature support
- [ ] Multi-currency support
- [ ] Automated email templates
- [ ] Credit note templates
- [ ] Approval workflows

### Technical Improvements

- [ ] Real-time collaboration
- [ ] Offline support
- [ ] Advanced caching
- [ ] Performance optimizations
- [ ] Accessibility improvements

## Contributing

When contributing to the credit notes module:

1. Follow the existing code structure and patterns
2. Add proper TypeScript types for all new features
3. Include error handling and validation
4. Write tests for new functionality
5. Update this README for any new features
6. Follow the established naming conventions

## Support

For issues or questions related to the credit notes module:

1. Check the existing documentation
2. Review the service layer for API integration
3. Test with the provided examples
4. Contact the development team for complex issues

---

**Version**: 1.0.0  
**Last Updated**: August 2025  
**Maintainer**: RoboBooks Development Team
