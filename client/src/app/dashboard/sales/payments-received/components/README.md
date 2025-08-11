# Payments Received Components

This directory contains the components for the Payments Received module in the RoboBooks application.

## Components

### PaymentHistoryModal
A modal component that displays the payment history for a customer. It shows a chronological list of payment entries with details like customer name, timestamp, description, and amount.

**Features:**
- Clean, minimalist design matching the application's UI
- Displays payment history entries with green document icons
- Shows customer name, timestamp, and payment description in a bubble format
- Responsive design with proper scrolling for long payment histories
- Navigation arrow at the bottom for pagination (future enhancement)

**Usage:**
```tsx
<PaymentHistoryModal
  isOpen={showPaymentHistoryModal}
  onClose={() => setShowPaymentHistoryModal(false)}
  paymentHistory={samplePaymentHistory}
/>
```

### PaymentDetailsPanel
The main panel that displays payment details and includes the Payment History button.

**New Features:**
- Payment History button in the header that opens the PaymentHistoryModal
- Upload files button that opens the AttachmentsModal
- Both buttons are now functional and properly integrated

### Sample Data
The `paymentHistoryData.ts` file contains sample payment history entries for testing and demonstration purposes.

## How to Use

1. **View Payment History:**
   - Click on any payment in the PaymentsReceivedTable
   - In the PaymentDetailsPanel, click the "Payment History" button
   - The PaymentHistoryModal will open showing the payment history

2. **Upload Files:**
   - Click the "Upload files" button in the PaymentDetailsPanel
   - The AttachmentsModal will open for file management

## Design Notes

The PaymentHistoryModal follows the design shown in the reference image:
- White background with clean borders
- Green document icons for payment entries
- Gray description bubbles with rounded corners
- Proper spacing and typography
- Navigation elements (up arrow and close button in header, right arrow at bottom)

## Future Enhancements

- Add pagination functionality to the navigation arrow
- Implement real-time payment history updates
- Add filtering and search capabilities
- Integrate with backend API for real payment data
- Add export functionality for payment history reports
