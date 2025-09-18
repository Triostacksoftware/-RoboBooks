# Preferences System Documentation

## Overview
The Preferences System provides a comprehensive way to manage user-specific settings and configurations across different modules in the RoboBooks application. It supports both individual module preferences and global user preferences.

## Database Schema

### UserPreferences Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  organizationId: ObjectId (ref: 'Organization'),
  module: String (enum: supported modules),
  preferences: {
    // General display preferences
    defaultSortBy: String,
    defaultSortOrder: 'asc' | 'desc',
    itemsPerPage: Number,
    showFilters: Boolean,
    showEmptyStates: Boolean,
    
    // Column management
    showColumns: Map<String, Boolean>,
    columnWidths: Map<String, Number>,
    columnOrder: [String],
    
    // Auto refresh settings
    autoRefresh: Boolean,
    refreshInterval: Number, // in minutes
    
    // Filter preferences
    defaultFilters: [Mixed],
    savedFilters: [{
      name: String,
      filters: Mixed,
      isDefault: Boolean
    }],
    
    // UI preferences
    theme: 'light' | 'dark' | 'auto',
    compactMode: Boolean,
    showTooltips: Boolean,
    
    // Module-specific preferences
    moduleSettings: Map<String, Mixed>,
    
    // Notification preferences
    notifications: {
      email: Boolean,
      browser: Boolean,
      sound: Boolean,
      types: [String]
    },
    
    // Export/Import preferences
    exportFormat: 'excel' | 'csv' | 'pdf',
    includeHeaders: Boolean,
    
    // Advanced settings
    advanced: Map<String, Mixed>
  }
}
```

## Supported Modules
- `general` - General application preferences
- `sales` - Sales module preferences
- `purchases` - Purchase module preferences
- `organization` - Organization-wide preferences
- `users` - User management preferences
- `reports` - Report preferences
- `payments` - Payment preferences
- `setup` - Setup and configuration preferences
- `customization` - UI customization preferences
- `expenses` - Expense module preferences
- `bills` - Bills module preferences
- `payments-made` - Payments made preferences
- `purchase-orders` - Purchase orders preferences
- `vendor-credits` - Vendor credits preferences
- `vendors` - Vendors preferences
- `recurring-bills` - Recurring bills preferences
- `recurring-expenses` - Recurring expenses preferences
- `recurring-invoices` - Recurring invoices preferences
- `invoices` - Invoices preferences
- `estimates` - Estimates preferences
- `quotes` - Quotes preferences
- `sales-orders` - Sales orders preferences
- `delivery-challans` - Delivery challans preferences
- `credit-notes` - Credit notes preferences
- `debit-notes` - Debit notes preferences
- `banking` - Banking preferences
- `accountant` - Accountant preferences
- `time-tracking` - Time tracking preferences
- `documents` - Documents preferences

## API Endpoints

### 1. Get Preferences for a Module
```
GET /api/preferences/:module
```
**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "organizationId": "507f1f77bcf86cd799439012",
    "module": "bills",
    "preferences": { ... }
  }
}
```

### 2. Update Preferences for a Module
```
PUT /api/preferences/:module
```
**Request Body:**
```json
{
  "defaultSortBy": "createdAt",
  "defaultSortOrder": "desc",
  "itemsPerPage": 25,
  "showColumns": {
    "billNumber": true,
    "vendorName": true,
    "status": true
  }
}
```

### 3. Reset Preferences to Defaults
```
DELETE /api/preferences/:module
```
**Response:**
```json
{
  "success": true,
  "message": "Preferences reset to defaults successfully",
  "data": { ... }
}
```

### 4. Get All Preferences
```
GET /api/preferences
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "organizationId": "507f1f77bcf86cd799439012",
      "module": "bills",
      "preferences": { ... }
    },
    {
      "userId": "507f1f77bcf86cd799439011",
      "organizationId": "507f1f77bcf86cd799439012",
      "module": "expenses",
      "preferences": { ... }
    }
  ]
}
```

### 5. Bulk Update Preferences
```
PUT /api/preferences
```
**Request Body:**
```json
{
  "updates": {
    "bills": {
      "defaultSortBy": "createdAt",
      "itemsPerPage": 50
    },
    "expenses": {
      "defaultSortBy": "expenseDate",
      "itemsPerPage": 25
    }
  }
}
```

## Frontend Integration

### Using the Preferences Service
```typescript
import { preferencesService } from '@/services/preferencesService';

// Get preferences for bills module
const billsPrefs = await preferencesService.getPreferences('bills');

// Update preferences
await preferencesService.savePreferences('bills', {
  defaultSortBy: 'createdAt',
  itemsPerPage: 50
});

// Reset to defaults
await preferencesService.resetPreferences('bills');

// Get all preferences
const allPrefs = await preferencesService.getAllPreferences();
```

### React Hook Example
```typescript
import { useState, useEffect } from 'react';
import { preferencesService } from '@/services/preferencesService';

export const usePreferences = (module: string) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, [module]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await preferencesService.getPreferences(module);
      setPreferences(prefs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates) => {
    try {
      const updated = await preferencesService.savePreferences(module, updates);
      setPreferences(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetPreferences = async () => {
    try {
      const reset = await preferencesService.resetPreferences(module);
      setPreferences(reset);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    reload: loadPreferences
  };
};
```

## Default Preferences

Each module has its own set of default preferences. The system automatically creates default preferences when a user first accesses a module.

### Bills Module Defaults
```javascript
{
  defaultSortBy: 'createdAt',
  defaultSortOrder: 'desc',
  itemsPerPage: 25,
  showFilters: true,
  showEmptyStates: true,
  autoRefresh: false,
  refreshInterval: 5,
  theme: 'light',
  compactMode: false,
  showTooltips: true,
  showColumns: {
    billNumber: true,
    vendorName: true,
    billDate: true,
    dueDate: true,
    status: true,
    totalAmount: true,
    currency: true,
    notes: false,
    createdAt: true
  },
  columnWidths: {
    billNumber: 120,
    vendorName: 200,
    billDate: 120,
    dueDate: 120,
    status: 100,
    totalAmount: 120,
    currency: 80,
    notes: 200,
    createdAt: 120
  }
}
```

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common error scenarios:
- Invalid module name (400)
- Unauthorized access (401)
- User not found (404)
- Server error (500)

## Testing

Run the test script to verify API functionality:
```bash
node test-preferences-api.js
```

Make sure to update the test script with valid user ID, organization ID, and authentication token before running.

## Security

- All endpoints require authentication via JWT token
- Users can only access their own preferences
- Organization isolation is enforced
- Input validation is performed on all requests

## Performance Considerations

- Preferences are cached in memory for frequently accessed modules
- Database indexes are optimized for user/organization/module queries
- Bulk operations are supported for efficient updates
- Default preferences are generated on-demand to reduce storage
