# Invoice UI to P&L and Balance Sheet Integration

This document describes the implementation of connecting Invoice UI to Profit & Loss and Balance Sheet reports in the RoboBooks system.

## Overview

The integration automatically updates P&L and Balance Sheet reports based on invoice actions, following standard accounting principles:

- **Draft invoices**: No impact on reports
- **Posted invoices (Unpaid)**: Updates both P&L and Balance Sheet
- **Payment received**: Updates Balance Sheet and P&L (cash basis)
- **GST remitted**: Updates Balance Sheet
- **Void/Cancel invoices**: Reverses all previous entries

## Implementation Details

### Backend Services

#### 1. Profit & Loss Service (`backend/services/profitLossService.js`)

**Key Functions:**

- `getProfitLossReport()`: Generates P&L report for date range
- `updatePLOnInvoicePosted()`: Updates P&L when invoice is posted (accrual basis)
- `updatePLOnPaymentReceived()`: Updates P&L when payment received (cash basis)
- `reversePLOnInvoiceVoided()`: Reverses P&L entries when invoice voided

**P&L Updates:**

- **Invoice Posted**: Increases Sales/Direct Income by invoice subtotal
- **Payment Received**: Increases Sales by paid amount (cash basis only)
- **Invoice Voided**: Decreases Sales by invoice subtotal

#### 2. Balance Sheet Service (`backend/services/balanceSheetService.js`)

**Key Functions:**

- `getBalanceSheetReport()`: Generates Balance Sheet as of specific date
- `updateBalanceSheetOnInvoicePosted()`: Updates BS when invoice posted
- `updateBalanceSheetOnPaymentReceived()`: Updates BS when payment received
- `updateBalanceSheetOnGSTRemitted()`: Updates BS when GST remitted
- `reverseBalanceSheetOnInvoiceVoided()`: Reverses BS entries when invoice voided

**Balance Sheet Updates:**

- **Invoice Posted**:
  - Increases Accounts Receivable by invoice total
  - Increases Duties & Taxes by GST amount
- **Payment Received**:
  - Decreases Accounts Receivable by payment amount
  - Increases Bank/Cash by payment amount
- **GST Remitted**:
  - Decreases Duties & Taxes by remitted amount
  - Decreases Bank/Cash by remitted amount
- **Invoice Voided**: Reverses all posted invoice entries

#### 3. Enhanced Invoice Service (`backend/services/invoiceservice.js`)

**New Functions:**

- `recordPayment()`: Records payment against invoice and updates reports
- Enhanced `updateInvoiceStatus()`: Updates reports when invoice status changes

**Integration Points:**

- Invoice status changes trigger report updates
- Payment recording updates both P&L and Balance Sheet
- All updates use database transactions for data consistency

### Frontend Components

#### 1. Profit & Loss Report Page (`client/src/app/dashboard/accountant/profit-loss/page.tsx`)

**Features:**

- Date range selection for report period
- Real-time report generation
- Income and expense breakdown
- Net profit calculation
- Cash vs accrual basis display

#### 2. Balance Sheet Report Page (`client/src/app/dashboard/accountant/balance-sheet/page.tsx`)

**Features:**

- As-of-date selection
- Assets, liabilities, and equity sections
- Account balance details
- Financial position summary

#### 3. Payment Modal (`client/src/app/dashboard/sales/invoices/[id]/components/PaymentModal.tsx`)

**Features:**

- Payment amount validation
- Payment method selection
- Date and reference tracking
- Automatic report updates

#### 4. GST Remittance Modal (`client/src/app/dashboard/accountant/components/GSTRemittanceModal.tsx`)

**Features:**

- GST amount input
- Payment method selection
- Reference tracking
- Balance Sheet updates

### API Endpoints

#### Accounting Reports Routes (`backend/routes/accountingReportsRoutes.js`)

```
GET /api/accounting-reports/profit-loss?startDate=&endDate=
GET /api/accounting-reports/balance-sheet?asOfDate=
POST /api/accounting-reports/gst-remittance
```

#### Invoice Routes (`backend/routes/invoiceRoutes.js`)

```
POST /api/invoices/:id/record-payment
```

### Database Schema Requirements

#### Chart of Accounts Structure

The system requires these accounts in the Chart of Accounts:

**Income Accounts:**

- Sales/Direct Income (subtype: 'sales')

**Asset Accounts:**

- Accounts Receivable (subtype: 'accounts_receivable')
- Bank Accounts (subtype: 'bank')
- Cash in Hand (subtype: 'cash')

**Liability Accounts:**

- Duties & Taxes (subtype: 'current_liability', name contains 'duties' or 'taxes')

**Equity Accounts:**

- Various equity accounts for net profit calculation

## Usage Workflow

### 1. Invoice Creation and Posting

1. Create invoice in draft status (no report impact)
2. Change status to "Unpaid" (triggers report updates)
3. P&L: Sales increases by invoice subtotal
4. Balance Sheet: AR increases by total, Duties & Taxes increases by GST

### 2. Payment Recording

1. Use Payment Modal to record payment
2. Select payment method and amount
3. Balance Sheet: AR decreases, Bank/Cash increases
4. P&L: Sales increases (cash basis only)

### 3. GST Remittance

1. Use GST Remittance Modal
2. Enter remitted amount and details
3. Balance Sheet: Duties & Taxes decreases, Bank/Cash decreases

### 4. Report Generation

1. Navigate to Accountant → Profit & Loss or Balance Sheet
2. Select date range/date
3. Generate report to see updated figures
4. Reports automatically reflect all invoice actions

## Configuration

### Cash vs Accrual Basis

The system defaults to **cash basis** accounting:

- P&L only shows income when payments are received
- Balance Sheet shows AR for unpaid invoices

To switch to **accrual basis**:

- Modify `profitLossService.js` to count all posted invoices
- Update the `cashBasis` flag in report generation

### Account Mapping

Ensure your Chart of Accounts includes the required accounts:

- Sales account with subtype 'sales'
- AR account with subtype 'accounts_receivable'
- Bank/Cash accounts with appropriate subtypes
- Duties & Taxes liability account

## Error Handling

The implementation includes comprehensive error handling:

- Database transaction rollback on errors
- Validation of payment amounts and dates
- Account existence verification
- Toast notifications for user feedback

## Testing

### Test Scenarios

1. **Draft Invoice**: Verify no report impact
2. **Post Invoice**: Verify P&L and BS updates
3. **Record Payment**: Verify payment updates
4. **GST Remittance**: Verify GST updates
5. **Void Invoice**: Verify all entries reversed

### Sample Data

Create test invoices with:

- Subtotal: ₹10,000
- GST: ₹1,800 (18%)
- Total: ₹11,800

Expected updates:

- P&L Sales: +₹10,000
- BS AR: +₹11,800
- BS Duties & Taxes: +₹1,800

## Future Enhancements

1. **Multi-currency support**: Handle different currencies
2. **Advanced reporting**: Comparative periods, trends
3. **Export functionality**: PDF, Excel exports
4. **Audit trail**: Track all report changes
5. **Custom date ranges**: Flexible period selection

## Troubleshooting

### Common Issues

1. **Reports not updating**: Check account existence in Chart of Accounts
2. **Payment errors**: Verify invoice status and amounts
3. **GST calculation**: Ensure tax amounts are properly calculated
4. **Date issues**: Check date format and timezone settings

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database transactions
4. Validate account balances manually

## Conclusion

This implementation provides a complete integration between invoice management and financial reporting, ensuring accurate and real-time updates to P&L and Balance Sheet reports based on all invoice-related actions.
