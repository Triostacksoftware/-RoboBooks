# Accountant Features Documentation

## Overview

The Accountant module provides professional accounting tools for managing financial data with precision and control. This module includes three main features:

1. **Manual Journals** - Create and manage manual journal entries
2. **Bulk Update** - Update account information across multiple transactions
3. **Budgets** - Create and manage business budgets

## Backend API Endpoints

### Manual Journals

#### Base URL: `/api/manual-journals`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/` | Get all manual journals with pagination and filters | Required |
| POST | `/` | Create a new manual journal | Required |
| GET | `/:id` | Get a single manual journal by ID | Required |
| PUT | `/:id` | Update a manual journal | Required |
| POST | `/:id/post` | Post a manual journal | Required |
| DELETE | `/:id` | Delete a manual journal | Required |
| GET | `/stats` | Get journal statistics | Required |

#### Query Parameters for GET `/`
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `status` (string): Filter by status (draft, posted, cancelled)
- `dateFrom` (string): Filter by start date (ISO format)
- `dateTo` (string): Filter by end date (ISO format)
- `search` (string): Search in journal number, description, or reference

#### Manual Journal Schema
```javascript
{
  journalNumber: String,        // Auto-generated (JRN-0001, JRN-0002, etc.)
  journalDate: Date,           // Required
  reference: String,           // Optional
  description: String,         // Required
  entries: [                   // Array of journal entries
    {
      account: String,         // Required
      description: String,     // Required
      debit: Number,          // Default: 0
      credit: Number,         // Default: 0
      reference: String       // Optional
    }
  ],
  totalDebit: Number,         // Auto-calculated
  totalCredit: Number,        // Auto-calculated
  status: String,             // draft, posted, cancelled
  createdBy: String,          // User ID
  postedBy: String,           // User ID (when posted)
  postedAt: Date,             // When posted
  notes: String               // Optional
}
```

### Budgets

#### Base URL: `/api/budgets`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/` | Get all budgets with pagination and filters | Required |
| POST | `/` | Create a new budget | Required |
| GET | `/:id` | Get a single budget by ID | Required |
| PUT | `/:id` | Update a budget | Required |
| POST | `/:id/activate` | Activate a budget | Required |
| DELETE | `/:id` | Delete a budget | Required |
| GET | `/stats` | Get budget statistics | Required |
| POST | `/actuals` | Update budget actual amounts | Required |

#### Query Parameters for GET `/`
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `status` (string): Filter by status (draft, active, completed, cancelled)
- `fiscalYear` (string): Filter by fiscal year
- `budgetType` (string): Filter by budget type (monthly, quarterly, yearly)
- `search` (string): Search in name or description

#### Budget Schema
```javascript
{
  name: String,               // Required
  description: String,        // Optional
  fiscalYear: String,        // Required
  startDate: Date,           // Required
  endDate: Date,             // Required
  budgetType: String,        // monthly, quarterly, yearly
  items: [                   // Array of budget items
    {
      account: String,       // Required
      budgetedAmount: Number, // Required
      actualAmount: Number,   // Default: 0
      variance: Number,       // Auto-calculated
      variancePercentage: Number // Auto-calculated
    }
  ],
  totalBudgeted: Number,     // Auto-calculated
  totalActual: Number,       // Auto-calculated
  totalVariance: Number,     // Auto-calculated
  status: String,            // draft, active, completed, cancelled
  createdBy: String,         // User ID
  approvedBy: String,        // User ID (when activated)
  approvedAt: Date,          // When activated
  notes: String              // Optional
}
```

### Bulk Updates

#### Base URL: `/api/bulk-updates`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/` | Get all bulk updates with pagination and filters | Required |
| POST | `/` | Create a new bulk update | Required |
| GET | `/:id` | Get a single bulk update by ID | Required |
| PUT | `/:id` | Update a bulk update | Required |
| POST | `/:id/execute` | Execute a bulk update | Required |
| DELETE | `/:id` | Delete a bulk update | Required |
| GET | `/stats` | Get bulk update statistics | Required |
| POST | `/preview` | Preview transactions to be updated | Required |

#### Query Parameters for GET `/`
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `status` (string): Filter by status (draft, running, completed, failed, cancelled)
- `search` (string): Search in name or description

#### Bulk Update Schema
```javascript
{
  name: String,              // Required
  description: String,       // Optional
  filterCriteria: {          // Filter criteria for transactions
    transactionTypes: [String], // Array of transaction types
    dateFrom: Date,          // Optional
    dateTo: Date,            // Optional
    accounts: [String],      // Array of account names
    amountRange: {           // Optional
      min: Number,
      max: Number
    }
  },
  updateData: {              // Update configuration
    oldAccount: String,      // Required
    newAccount: String       // Required
  },
  items: [                   // Array of update items
    {
      transactionId: String, // Required
      transactionType: String, // Required
      oldAccount: String,    // Required
      newAccount: String,    // Required
      amount: Number,        // Required
      status: String,        // pending, updated, failed
      errorMessage: String   // Optional
    }
  ],
  totalTransactions: Number, // Auto-calculated
  updatedTransactions: Number, // Auto-calculated
  failedTransactions: Number, // Auto-calculated
  status: String,            // draft, running, completed, failed, cancelled
  createdBy: String,         // User ID
  startedAt: Date,           // When execution started
  completedAt: Date,         // When execution completed
  notes: String              // Optional
}
```

## Frontend Components

### Accountant Dashboard (`/dashboard/accountant`)
- Main navigation hub for all accountant features
- Quick overview cards for each module
- Statistics dashboard

### Manual Journals (`/dashboard/accountant/manual-journals`)
- List view with search and filtering
- Create new journal entries
- Post/unpost journals
- View journal details
- Delete journals (draft only)

### Bulk Update (`/dashboard/accountant/bulk-update`)
- List view with search and filtering
- Create bulk update operations
- Preview transactions before updating
- Execute bulk updates
- Track progress and results
- Warning banner for data safety

### Budgets (`/dashboard/accountant/budgets`)
- List view with search and filtering
- Create new budgets
- Activate budgets
- Track budget vs actual performance
- Variance analysis with visual indicators
- Budget item management

## Database Models

### ManualJournal Model
- **Collection**: `manualjournals`
- **Indexes**: journalNumber, journalDate, status, createdBy
- **Validation**: Total debits must equal total credits
- **Auto-calculation**: Total debit/credit amounts

### Budget Model
- **Collection**: `budgets`
- **Indexes**: name, fiscalYear, status, createdBy
- **Auto-calculation**: Totals and variance percentages
- **Validation**: Date ranges and budget amounts

### BulkUpdate Model
- **Collection**: `bulkupdates`
- **Indexes**: name, status, createdBy, createdAt
- **Auto-calculation**: Transaction counts and progress
- **Validation**: Filter criteria and update data

## Security Features

### Authentication
- All endpoints require authentication via `authGuard` middleware
- Uses HTTP-only cookies (`rb_session`) for session management
- Supports both cookie and Bearer token authentication

### Authorization
- Users can only access their own created records
- Status-based permissions (e.g., only draft items can be edited)
- Audit trail for important actions (posting, activation)

### Data Validation
- Input validation on all endpoints
- Business rule validation (e.g., debits = credits)
- Type checking and sanitization

## Error Handling

### Backend Error Responses
```javascript
{
  success: false,
  message: "Error description"
}
```

### Frontend Error Handling
- Toast notifications for user feedback
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Graceful fallbacks for network errors

## Usage Examples

### Creating a Manual Journal
```javascript
const journalData = {
  journalDate: new Date(),
  description: "Monthly rent payment",
  reference: "RENT-2025-01",
  entries: [
    {
      account: "Rent Expense",
      description: "Office rent for January",
      debit: 2000,
      credit: 0
    },
    {
      account: "Bank Account",
      description: "Payment for rent",
      debit: 0,
      credit: 2000
    }
  ]
};

const response = await fetch('/api/manual-journals', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(journalData)
});
```

### Creating a Budget
```javascript
const budgetData = {
  name: "2025 Operating Budget",
  description: "Annual operating budget for 2025",
  fiscalYear: "2025",
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-12-31"),
  budgetType: "yearly",
  items: [
    {
      account: "Office Supplies",
      budgetedAmount: 12000
    },
    {
      account: "Utilities",
      budgetedAmount: 24000
    }
  ]
};

const response = await fetch('/api/budgets', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(budgetData)
});
```

### Creating a Bulk Update
```javascript
const bulkUpdateData = {
  name: "Update Old Account References",
  description: "Update all references from old account to new account",
  filterCriteria: {
    transactionTypes: ["invoice", "bill"],
    dateFrom: new Date("2024-01-01"),
    dateTo: new Date("2024-12-31"),
    accounts: ["Old Account Name"]
  },
  updateData: {
    oldAccount: "Old Account Name",
    newAccount: "New Account Name"
  }
};

const response = await fetch('/api/bulk-updates', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bulkUpdateData)
});
```

## Future Enhancements

### Planned Features
1. **Journal Templates** - Pre-defined journal entry templates
2. **Recurring Journals** - Automatically create journals on schedule
3. **Budget Templates** - Pre-defined budget structures
4. **Advanced Filtering** - More sophisticated search and filter options
5. **Export/Import** - CSV/Excel export and import functionality
6. **Audit Trail** - Detailed logging of all changes
7. **Approval Workflows** - Multi-level approval for sensitive operations
8. **Integration** - Connect with external accounting systems

### Technical Improvements
1. **Real-time Updates** - WebSocket integration for live updates
2. **Offline Support** - Service worker for offline functionality
3. **Advanced Analytics** - Charts and graphs for budget analysis
4. **Mobile Optimization** - Responsive design improvements
5. **Performance Optimization** - Caching and lazy loading
6. **Testing** - Comprehensive unit and integration tests

## Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**
   - Check if backend server is running
   - Verify authentication is working
   - Check network connectivity

2. **Validation errors**
   - Ensure all required fields are provided
   - Check data types (numbers vs strings)
   - Verify business rules (e.g., debits = credits)

3. **Permission errors**
   - Verify user is authenticated
   - Check if user has required permissions
   - Ensure record belongs to current user

### Debug Information
- Backend logs include detailed error information
- Frontend console shows API request/response details
- Network tab in browser dev tools shows HTTP requests
- Database queries can be logged for debugging

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.
