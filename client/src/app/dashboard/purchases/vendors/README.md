# Vendors Module

This module provides complete vendor management functionality for the RoboBooks application, similar to the customers module but focused on managing vendors/suppliers.

## Features

### Backend Features

- **Complete CRUD Operations**: Create, Read, Update, Delete vendors
- **Search Functionality**: Search vendors by name, company, email, GSTIN, phone
- **Comprehensive Data Model**: Includes all vendor details like contact info, addresses, financial data
- **Validation**: Input validation using Joi schemas
- **Authentication**: Protected routes requiring user authentication

### Frontend Features

- **Vendor List View**: Display all vendors in a table format with search and filtering
- **Vendor Creation Form**: Comprehensive form with multiple tabs for different data categories
- **Vendor Details Modal**: View detailed vendor information
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Search**: Search vendors as you type

## File Structure

```
vendors/
├── page.tsx                    # Main vendors page
├── new/
│   └── page.tsx               # New vendor creation page
├── components/
│   ├── VendorsSection.tsx     # Main vendors list component
│   └── NewVendorForm.tsx      # Vendor creation form
└── README.md                  # This file
```

## API Endpoints

### Backend Routes (`/api/vendors`)

- `POST /` - Create a new vendor
- `GET /` - Get all vendors
- `GET /search?query=<search_term>` - Search vendors
- `GET /:id` - Get vendor by ID
- `PUT /:id` - Update vendor
- `DELETE /:id` - Delete vendor

## Data Model

### Vendor Schema

```javascript
{
  name: String (required),
  gstin: String (required, unique),
  companyName: String,
  displayName: String (required),
  email: String,
  phone: String,
  workPhone: String,
  mobile: String,
  address: String,
  contactInfo: String,
  type: 'business' | 'individual',
  salutation: String,
  firstName: String,
  lastName: String,
  pan: String,
  msmeRegistered: Boolean,
  currency: String,
  openingBalance: Number,
  paymentTerms: String,
  tds: String,
  enablePortal: Boolean,
  portalLanguage: String,
  status: 'active' | 'inactive',
  contactPersons: Array,
  billingAddress: Object,
  shippingAddress: Object,
  payables: Number,
  unusedCredits: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage

### Creating a New Vendor

1. Navigate to `/dashboard/vendors`
2. Click the "New Vendor" button
3. Fill in the required fields:
   - Display Name (required)
   - GSTIN (required)
   - Company Name
   - Email
   - Phone numbers
4. Use the tabs to add additional information:
   - **Other Details**: PAN, MSME status, currency, payment terms, TDS
   - **Address**: Billing and shipping addresses
   - **Contact Persons**: Additional contact information
   - **Custom Fields**: Future functionality
5. Click "Save" to create the vendor

### Managing Vendors

1. **View All Vendors**: The main page shows all vendors in a table format
2. **Search**: Use the search bar to find specific vendors
3. **Filter**: Use the dropdown to filter by status or type
4. **View Details**: Click on any vendor row to see detailed information
5. **Edit**: Click "Edit Vendor" in the details modal (future feature)
6. **Delete**: Use the actions menu (future feature)

## Components

### VendorsSection

- Displays the main vendors list
- Handles search and filtering
- Shows vendor details in a modal
- Manages loading and error states

### NewVendorForm

- Multi-tab form for vendor creation
- Handles form validation
- Manages complex form state
- Provides real-time feedback

## Styling

- Uses Tailwind CSS for styling
- Responsive design with mobile-first approach
- Consistent with the overall application design
- Uses Heroicons for icons

## Future Enhancements

- Vendor editing functionality
- Bulk import/export of vendors
- Vendor portal access
- Integration with billing and purchase modules
- Advanced filtering and sorting options
- Vendor performance analytics
- Document upload for vendor files

## Testing

Run the backend test script to verify API functionality:

```bash
cd backend
node test-vendors.js
```

This will test all CRUD operations and search functionality.
