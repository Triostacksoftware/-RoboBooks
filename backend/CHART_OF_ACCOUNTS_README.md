# Chart of Accounts Backend Implementation

This document describes the complete Chart of Accounts backend implementation for the RoboBooks accounting system.

## Overview

The Chart of Accounts is a fundamental component of any accounting system that organizes financial transactions into categories. This implementation provides a complete CRUD API for managing accounts with hierarchical structure, filtering, and advanced features.

## Features

- ✅ **Complete CRUD Operations** - Create, Read, Update, Delete accounts
- ✅ **Hierarchical Structure** - Support for parent-child account relationships
- ✅ **Advanced Filtering** - Filter by category, subtype, search terms
- ✅ **Pagination** - Efficient data loading for large datasets
- ✅ **Account Codes** - Automatic code generation with category prefixes
- ✅ **GST Support** - India-specific GST treatment and rates
- ✅ **Soft Delete** - Preserve data integrity with soft deletion
- ✅ **Bulk Operations** - Update multiple accounts at once
- ✅ **Export/Import** - CSV export and import functionality
- ✅ **Statistics** - Account statistics and balance summaries
- ✅ **Validation** - Comprehensive validation and error handling

## Database Schema

### Account Model (`backend/models/Account.js`)

```javascript
{
  code: String,                    // Account code (e.g., "1001")
  name: String,                    // Account name (e.g., "Cash")
  category: String,                // asset, liability, equity, income, expense
  subtype: String,                 // bank, cash, accounts_receivable, etc.
  parent: ObjectId,                // Reference to parent account
  opening_balance: Number,         // Opening balance when created
  balance: Number,                 // Current running balance
  currency: String,                // Currency code (default: "INR")
  is_active: Boolean,              // Active status (for soft delete)
  gst_treatment: String,           // taxable, exempt, nil_rated, non_gst
  gst_rate: Number,                // GST rate (0, 5, 12, 18, 28)
  description: String,             // Account description
  createdAt: Date,                 // Creation timestamp
  updatedAt: Date                  // Last update timestamp
}
```

### Account Categories

- **Asset** (1xxx) - Resources owned by the business
- **Liability** (2xxx) - Debts and obligations
- **Equity** (3xxx) - Owner's investment and retained earnings
- **Income** (4xxx) - Revenue and income sources
- **Expense** (5xxx) - Costs and expenses

### Account Subtypes

#### Assets

- `bank` - Bank accounts
- `cash` - Cash on hand
- `accounts_receivable` - Money owed by customers
- `fixed_asset` - Equipment, buildings, etc.
- `inventory` - Stock and inventory
- `other_asset` - Other assets

#### Liabilities

- `accounts_payable` - Money owed to suppliers
- `credit_card` - Credit card balances
- `current_liability` - Short-term obligations
- `long_term_liability` - Long-term debts

#### Equity

- `owner_equity` - Owner's investment
- `retained_earnings` - Accumulated profits

#### Income

- `sales` - Sales revenue
- `other_income` - Other income sources

#### Expenses

- `cost_of_goods_sold` - Direct costs
- `operating_expense` - Operating expenses
- `other_expense` - Other expenses

## API Endpoints

### Base URL: `/api/chart-of-accounts`

#### GET `/` - Get All Accounts

**Query Parameters:**

- `category` - Filter by account category
- `subtype` - Filter by account subtype
- `search` - Search in name, code, or description
- `is_active` - Filter by active status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `sortBy` - Sort field (default: "code")
- `sortOrder` - Sort direction (asc/desc, default: "asc")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "account_id",
      "code": "1001",
      "name": "Cash",
      "category": "asset",
      "subtype": "cash",
      "parent": null,
      "opening_balance": 0,
      "balance": 10000,
      "currency": "INR",
      "is_active": true,
      "gst_treatment": "taxable",
      "gst_rate": 0,
      "description": "Cash on hand and in bank accounts"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 20,
    "pages": 1
  },
  "stats": {
    "asset": { "count": 8, "totalBalance": 50000 },
    "liability": { "count": 3, "totalBalance": 20000 }
  }
}
```

#### GET `/:id` - Get Account by ID

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "account_id",
    "code": "1001",
    "name": "Cash",
    "category": "asset",
    "subtype": "cash",
    "parent": null,
    "opening_balance": 0,
    "balance": 10000,
    "currency": "INR",
    "is_active": true,
    "gst_treatment": "taxable",
    "gst_rate": 0,
    "description": "Cash on hand and in bank accounts"
  }
}
```

#### POST `/` - Create New Account

**Request Body:**

```json
{
  "name": "New Account",
  "code": "1002",
  "category": "asset",
  "subtype": "bank",
  "parent": null,
  "opening_balance": 0,
  "currency": "INR",
  "gst_treatment": "taxable",
  "gst_rate": 0,
  "description": "Account description"
}
```

#### PUT `/:id` - Update Account

**Request Body:** Same as POST, all fields optional

#### DELETE `/:id` - Delete Account (Soft Delete)

**Validation:**

- Cannot delete accounts with child accounts
- Cannot delete accounts with non-zero balance

#### GET `/categories` - Get Categories and Subtypes

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": ["asset", "liability", "equity", "income", "expense"],
    "subtypes": ["bank", "cash", "accounts_receivable", ...]
  }
}
```

#### GET `/hierarchy` - Get Account Hierarchy

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "parent_id",
      "name": "Current Assets",
      "children": [
        {
          "_id": "child_id",
          "name": "Cash",
          "children": []
        }
      ]
    }
  ]
}
```

#### POST `/bulk-update` - Bulk Update Accounts

**Request Body:**

```json
{
  "accounts": [
    {
      "id": "account_id",
      "name": "Updated Name",
      "is_active": false
    }
  ]
}
```

## Service Layer

### Chart of Accounts Service (`backend/services/chartOfAccountsService.js`)

#### Key Functions:

1. **`getNextAccountCode(category)`** - Generate next available account code
2. **`updateAccountBalance(accountId, amount, session)`** - Update account balance
3. **`validateAccountHierarchy(accountId, parentId)`** - Validate parent-child relationships
4. **`getAccountStatistics()`** - Get account statistics
5. **`exportAccountsToCSV(filters)`** - Export accounts to CSV format
6. **`importAccountsFromCSV(csvData, session)`** - Import accounts from CSV

## Controller Layer

### Chart of Accounts Controller (`backend/controllers/chartOfAccountsController.js`)

#### Key Functions:

1. **`getAllAccounts(req, res)`** - Get accounts with filtering and pagination
2. **`getAccountById(req, res)`** - Get specific account
3. **`createAccount(req, res)`** - Create new account
4. **`updateAccount(req, res)`** - Update existing account
5. **`deleteAccount(req, res)`** - Soft delete account
6. **`getCategories(req, res)`** - Get available categories
7. **`getAccountHierarchy(req, res)`** - Get hierarchical structure
8. **`bulkUpdateAccounts(req, res)`** - Bulk update accounts

## Routes

### Chart of Accounts Routes (`backend/routes/chartOfAccountsRoutes.js`)

All routes are protected with `authenticateToken` middleware.

## Frontend Integration

### Updated Frontend (`client/src/app/dashboard/accountant/chart-of-accounts/page.tsx`)

The frontend has been updated to use the new Chart of Accounts API:

- **API Endpoints**: Updated to use `/api/chart-of-accounts`
- **Categories**: Fetched dynamically from backend
- **Error Handling**: Improved error handling and user feedback
- **Real-time Updates**: Automatic refresh after operations

## Usage Examples

### Creating a New Account

```javascript
const newAccount = {
  name: "Bank Account",
  code: "1002",
  category: "asset",
  subtype: "bank",
  opening_balance: 50000,
  currency: "INR",
  description: "Main business bank account",
};

const response = await fetch("/api/chart-of-accounts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newAccount),
});
```

### Filtering Accounts

```javascript
const response = await fetch(
  "/api/chart-of-accounts?category=asset&search=cash&page=1&limit=10"
);
```

### Updating Account Balance

```javascript
import { updateAccountBalance } from "../services/chartOfAccountsService.js";

await updateAccountBalance(accountId, 1000); // Add 1000 to balance
```

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request** - Invalid input data
- **404 Not Found** - Account not found
- **409 Conflict** - Duplicate account name/code
- **500 Internal Server Error** - Server errors

Error responses include detailed messages:

```json
{
  "success": false,
  "message": "Account with this name already exists",
  "error": "Validation failed"
}
```

## Security

- **Authentication**: All endpoints require valid JWT token
- **Authorization**: Token-based access control
- **Input Validation**: Comprehensive validation of all inputs
- **SQL Injection Protection**: MongoDB parameterized queries
- **XSS Protection**: Input sanitization

## Performance Considerations

- **Indexing**: Database indexes on frequently queried fields
- **Pagination**: Efficient data loading for large datasets
- **Caching**: Consider Redis caching for frequently accessed data
- **Aggregation**: MongoDB aggregation for statistics

## Testing

### Manual Testing

1. **Create Account**: Test account creation with various data
2. **Update Account**: Test account updates and validation
3. **Delete Account**: Test soft delete and validation rules
4. **Filtering**: Test all filter combinations
5. **Hierarchy**: Test parent-child relationships
6. **Bulk Operations**: Test bulk update functionality

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Get all accounts
curl -X GET "http://localhost:5000/api/chart-of-accounts" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create account
curl -X POST "http://localhost:5000/api/chart-of-accounts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Account","category":"asset"}'
```

## Future Enhancements

1. **Multi-currency Support** - Enhanced currency handling
2. **Account Templates** - Predefined account structures
3. **Audit Trail** - Track all account changes
4. **Advanced Reporting** - Account analysis and reports
5. **Integration** - Connect with other accounting modules
6. **API Rate Limiting** - Prevent abuse
7. **Webhooks** - Real-time notifications
8. **Bulk Import/Export** - Enhanced data migration tools

## Dependencies

- **MongoDB** - Database
- **Mongoose** - ODM
- **Express.js** - Web framework
- **JWT** - Authentication
- **CORS** - Cross-origin requests

## Configuration

Environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/robobooks
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Deployment

1. **Database Setup**: Ensure MongoDB is running
2. **Environment Variables**: Set required environment variables
3. **Dependencies**: Install with `npm install`
4. **Start Server**: Run with `npm start` or `npm run dev`
5. **Health Check**: Verify `/api/health` endpoint

## Support

For issues and questions:

1. Check the error logs
2. Verify API documentation
3. Test with Postman/curl
4. Review database connections
5. Check authentication tokens

---

This implementation provides a robust, scalable Chart of Accounts system that integrates seamlessly with the existing RoboBooks accounting platform.
