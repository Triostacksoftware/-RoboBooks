# Expense History System Documentation

## Overview

The Expense History System provides comprehensive tracking and auditing capabilities for all expense-related operations in the RoboBooks application. It automatically captures and stores detailed information about every action performed on expenses, including creation, updates, deletions, and other operations.

## Features

### 🔍 **Comprehensive Tracking**
- **Creation Tracking**: Records when expenses are created with full initial data
- **Update Tracking**: Captures all field changes with before/after values
- **Deletion Tracking**: Logs soft deletions with complete expense data
- **Clone Tracking**: Records when expenses are cloned from existing ones
- **Receipt Operations**: Tracks receipt uploads and removals
- **Invoice Conversion**: Logs when expenses are converted to invoices

### 📊 **Rich Metadata**
- **User Information**: Who performed the action (name, email, ID)
- **Timestamps**: Precise timing with relative time calculations
- **IP Address & User Agent**: Security and audit trail information
- **Change Details**: Field-by-field change tracking with old/new values
- **Custom Metadata**: Additional context for specific operations

### 🚀 **Performance Optimized**
- **Indexed Queries**: Optimized database indexes for fast retrieval
- **Pagination Support**: Efficient handling of large history datasets
- **Aggregation Pipelines**: Fast statistics and summary calculations
- **Selective Loading**: Only load necessary data for better performance

## Architecture

### Database Schema

#### ExpenseHistory Model
```javascript
{
  expenseId: ObjectId,           // Reference to the expense
  action: String,               // Type of action performed
  description: String,          // Human-readable description
  changes: Object,              // Detailed change information
  previousValues: Object,       // Values before the change
  newValues: Object,            // Values after the change
  performedBy: ObjectId,        // User who performed the action
  performedByName: String,      // User's name
  performedByEmail: String,     // User's email
  ipAddress: String,            // IP address of the request
  userAgent: String,            // Browser/client information
  metadata: Object,             // Additional context data
  timestamp: Date               // When the action occurred
}
```

### Action Types
- `created` - Expense was created
- `updated` - General update to expense
- `status_changed` - Status field was modified
- `amount_changed` - Amount field was modified
- `vendor_changed` - Vendor field was modified
- `category_changed` - Category field was modified
- `payment_method_changed` - Payment method was modified
- `customer_changed` - Customer field was modified
- `project_changed` - Project field was modified
- `notes_changed` - Notes field was modified
- `billable_changed` - Billable status was modified
- `deleted` - Expense was deleted
- `cloned` - Expense was cloned
- `receipt_uploaded` - Receipt was uploaded
- `receipt_removed` - Receipt was removed
- `converted_to_invoice` - Expense was converted to invoice

## API Endpoints

### Get Expense History
```
GET /api/expense-history/:expenseId
```
**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `sortBy` - Sort field (default: 'timestamp')
- `sortOrder` - Sort direction ('asc' or 'desc', default: 'desc')
- `action` - Filter by action type

### Get Activity Summary
```
GET /api/expense-history/:expenseId/summary
```
Returns aggregated statistics about actions performed on an expense.

### Get History Statistics
```
GET /api/expense-history/:expenseId/stats
```
Returns detailed statistics including total actions, unique users, and time ranges.

### Get Recent Activity
```
GET /api/expense-history/activity/recent
```
**Query Parameters:**
- `limit` - Number of recent activities (default: 20)

### Get All Expense History (Admin)
```
GET /api/expense-history/activity/all
```
**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder` - Pagination and sorting
- `action` - Filter by action type
- `expenseId` - Filter by specific expense
- `userId` - Filter by specific user
- `dateFrom`, `dateTo` - Date range filter

### Get History by Action
```
GET /api/expense-history/action/:action
```
Returns all history entries for a specific action type.

### Export Expense History
```
GET /api/expense-history/:expenseId/export
```
**Query Parameters:**
- `format` - Export format ('json' or 'csv', default: 'json')

## Frontend Integration

### ExpenseHistoryPanel Component
The `ExpenseHistoryPanel` component provides a rich UI for displaying expense history:

- **Real-time Data**: Fetches live data from the API
- **Loading States**: Shows loading indicators during data fetch
- **Error Handling**: Graceful error handling with retry options
- **Rich Display**: Color-coded action types with appropriate icons
- **Detailed Information**: Shows user, timestamp, and change details
- **Responsive Design**: Works well in the three-panel layout

### Service Integration
The `expenseService` includes comprehensive methods for history operations:

```typescript
// Get expense history with pagination
expenseService.getExpenseHistory(expenseId, options)

// Get activity summary
expenseService.getExpenseHistorySummary(expenseId)

// Get history statistics
expenseService.getExpenseHistoryStats(expenseId)

// Get recent activity
expenseService.getRecentActivity(limit)

// Get all history (admin)
expenseService.getAllExpenseHistory(options)

// Export history
expenseService.exportExpenseHistory(expenseId, format)
```

## Automatic Tracking

The system automatically tracks history for all expense operations:

### Expense Creation
- Triggered when `createExpense` is called
- Captures all initial expense data
- Records user information and request metadata

### Expense Updates
- Triggered when `updateExpense` is called
- Compares previous and new values
- Identifies specific field changes
- Determines the primary action type

### Expense Deletion
- Triggered when `deleteExpense` is called
- Captures complete expense data before deletion
- Records deletion timestamp and user

### Additional Operations
- **Cloning**: Tracks when expenses are cloned
- **Receipt Operations**: Monitors receipt uploads/removals
- **Invoice Conversion**: Logs conversion to invoices

## Security & Privacy

### Data Protection
- **IP Address Logging**: For security audit trails
- **User Agent Tracking**: For client identification
- **Metadata Storage**: Additional context without exposing sensitive data

### Access Control
- **Authentication Required**: All endpoints require valid authentication
- **Admin Endpoints**: Some endpoints require admin privileges
- **Organization Isolation**: Data is isolated by organization

### Data Retention
- **Permanent Storage**: History is never automatically deleted
- **Audit Compliance**: Maintains complete audit trails
- **Export Capabilities**: Supports data export for compliance

## Performance Considerations

### Database Optimization
- **Compound Indexes**: Optimized for common query patterns
- **Pagination**: Efficient handling of large datasets
- **Selective Fields**: Only load necessary data

### Caching Strategy
- **Frontend Caching**: Client-side caching for better UX
- **API Response Caching**: Server-side caching for frequently accessed data

### Scalability
- **Horizontal Scaling**: Designed to work with MongoDB sharding
- **Query Optimization**: Efficient aggregation pipelines
- **Index Management**: Proper indexing for fast queries

## Testing

### Test Coverage
The system includes comprehensive tests:

```bash
# Run expense history tests
node test-expense-history.js
```

### Test Scenarios
- History entry creation
- Expense operation tracking
- Data retrieval and pagination
- Statistics and summaries
- Error handling

## Monitoring & Analytics

### Key Metrics
- **Action Frequency**: Most common expense operations
- **User Activity**: Who is performing what actions
- **Change Patterns**: Common field modifications
- **System Performance**: API response times and error rates

### Alerts & Notifications
- **Failed Tracking**: Alerts when history tracking fails
- **Performance Issues**: Monitoring for slow queries
- **Data Integrity**: Validation of history data

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live history
- **Advanced Filtering**: More sophisticated query capabilities
- **Bulk Operations**: History tracking for bulk expense operations
- **Integration Hooks**: Webhook support for external systems
- **Advanced Analytics**: Machine learning insights on expense patterns

### API Improvements
- **GraphQL Support**: More flexible query capabilities
- **Webhook Integration**: Real-time notifications
- **Batch Operations**: Efficient bulk history operations

## Troubleshooting

### Common Issues

#### History Not Being Tracked
1. Check if the expense operation is calling the history service
2. Verify user authentication and permissions
3. Check for errors in the history service logs

#### Performance Issues
1. Review database indexes
2. Check query patterns and optimization
3. Monitor memory usage and connection pools

#### Data Inconsistencies
1. Validate history data integrity
2. Check for concurrent modification issues
3. Review error handling in tracking methods

### Debug Mode
Enable debug logging by setting:
```javascript
process.env.EXPENSE_HISTORY_DEBUG = 'true'
```

## Support

For issues or questions about the Expense History System:

1. Check the logs for error messages
2. Review the API documentation
3. Test with the provided test scripts
4. Contact the development team for assistance

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: RoboBooks Development Team
