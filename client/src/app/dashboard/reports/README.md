# Reports Center

This is the Reports Center section of Robo Books, inspired by Zoho Books' comprehensive reporting system.

## Features

### 📊 **Report Categories**
- **Business Overview**: Profit & Loss, Cash Flow, Balance Sheet, etc.
- **Sales**: Sales by Customer, Sales by Item, AR Aging, etc.
- **Purchases & Expenses**: Vendor reports, AP Aging, Bills, etc.
- **Banking**: Bank Reconciliation, Bank Statement, Cash Flow
- **Accounting**: General Ledger, Trial Balance, Journal Entries
- **Time Tracking**: Time by Project, Time by Employee
- **Inventory**: Stock Summary, Stock Movement, Low Stock Items
- **Budgets**: Budget vs Actual, Budget Summary
- **Currency**: Exchange Rate History, Currency Gain/Loss
- **Activity**: User Activity, System Logs
- **Advanced Financial**: Financial Ratios, Trend Analysis
- **TDS Reports**: TDS Summary, TDS Details
- **GST Reports**: GST Summary, GST Details, GST Reconciliation

### 🔍 **Search & Filtering**
- Search reports by name or description
- Filter by report type (System Generated vs Custom)
- Filter by category
- Show favorites only
- Real-time search results

### ⭐ **Favorites System**
- Mark/unmark reports as favorites
- Quick access to favorite reports
- Visual star indicators

### 📋 **Report Management**
- Create custom reports
- Edit existing reports
- Delete reports
- Generate report data
- View report history

## Components

### `ReportsPage.tsx`
Main page component that orchestrates the entire reports interface.

### `ReportsSidebar.tsx`
Left sidebar with:
- Search functionality
- Category navigation
- Type filters
- Favorites toggle
- Create report button

### `ReportsList.tsx`
Main content area displaying reports in a table format with:
- Report name and description
- Category and type badges
- Last run information
- Action buttons (View, Generate, Delete)
- Favorite toggle functionality

### `CreateReportModal.tsx`
Modal for creating new custom reports with:
- Report name and description
- Category selection
- Date range filters
- Public/private settings

## Backend API

### Models
- `Report.js`: Mongoose schema for report data

### Controllers
- `reportController.js`: Business logic for CRUD operations and report generation

### Routes
- `reportRoutes.js`: API endpoints for report management

### API Endpoints
- `GET /api/reports` - Get all reports with filtering
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/generate` - Generate report data
- `PATCH /api/reports/:id/favorite` - Toggle favorite status

## Database Schema

```javascript
{
  name: String,           // Report name
  description: String,    // Report description
  type: String,          // 'system' or 'custom'
  category: String,      // Report category
  subCategory: String,   // Sub-category
  parameters: Map,       // Report parameters
  filters: Object,       // Date range, customers, items, etc.
  isFavorite: Boolean,   // Favorite status
  isPublic: Boolean,     // Public/private
  createdBy: String,     // User ID
  lastRun: Date,         // Last generation time
  schedule: Object,      // Scheduling settings
  createdAt: Date,       // Creation timestamp
  updatedAt: Date        // Last update timestamp
}
```

## Usage

1. **Viewing Reports**: Navigate to the Reports section to see all available reports
2. **Filtering**: Use the sidebar to filter by category, type, or search terms
3. **Favorites**: Click the star icon to mark/unmark reports as favorites
4. **Creating Reports**: Click "Create New Report" to create custom reports
5. **Generating Data**: Click "Generate" to run reports and get data
6. **Managing Reports**: Use the action buttons to view, edit, or delete reports

## System Reports

The system comes pre-loaded with 63 standard reports covering all major business areas, similar to Zoho Books. These reports are automatically available to all users and can be customized as needed.

## Future Enhancements

- Report scheduling and automation
- Export functionality (PDF, Excel, CSV)
- Advanced charting and visualization
- Report templates
- Collaborative reporting
- Real-time data updates
