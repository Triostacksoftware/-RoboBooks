# Timesheet System

A comprehensive timesheet management system built with Next.js and Node.js, featuring modern UI design inspired by Zoho Books.

## Features

### 🕒 Core Functionality
- **Time Entry Management**: Create, edit, and delete time entries
- **Real-time Timer**: Start/stop timer with live tracking
- **Billable/Non-billable Tracking**: Separate billable and non-billable hours
- **Project Association**: Link time entries to specific projects
- **User Management**: Track time for different users

### 📊 Advanced Features
- **Multiple View Modes**: List view and calendar view
- **Advanced Filtering**: Filter by period, customer, project, user, and status
- **Statistics Dashboard**: Real-time metrics and insights
- **Bulk Operations**: Update and delete multiple entries
- **Export Functionality**: Export data to CSV format

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface similar to Zoho Books
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live timer and status updates
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Accessibility**: Keyboard navigation and screen reader support

## File Structure

```
timesheet/
├── page.tsx                    # Main timesheet page
├── components/
│   ├── TimesheetHeader.tsx     # Header with actions and search
│   ├── TimesheetFilters.tsx    # Filter controls
│   ├── TimesheetTable.tsx      # Data table with list/calendar views
│   ├── NewTimeEntryModal.tsx   # Create/edit entry modal
│   ├── TimerWidget.tsx         # Active timer display
│   └── TimesheetStats.tsx      # Statistics dashboard
├── hooks/
│   └── useTimesheet.ts         # Custom hook for data management
└── README.md                   # This file
```

## Components Overview

### TimesheetHeader
- Search functionality
- View mode toggle (list/calendar)
- Timer controls
- Action buttons (new entry, import/export)

### TimesheetFilters
- Period selection (today, this week, this month, etc.)
- Customer filter
- Project filter
- User filter
- Clear filters option

### TimesheetTable
- **List View**: Tabular data with sorting and selection
- **Calendar View**: Monthly calendar with entry indicators
- Action buttons for each entry (edit, delete, timer)
- Bulk selection and operations

### NewTimeEntryModal
- Comprehensive form with validation
- Project and user selection
- Date and time input
- Billable toggle
- Status selection

### TimerWidget
- Real-time timer display
- Pause/resume functionality
- Stop timer option
- Floating widget design

### TimesheetStats
- Total hours summary
- Billable vs non-billable breakdown
- This week's hours
- Active entries count
- Additional metrics

## Backend API

### Endpoints

#### Basic CRUD
- `POST /api/timesheets` - Create time entry
- `GET /api/timesheets` - Get timesheets with filtering
- `GET /api/timesheets/:id` - Get single entry
- `PUT /api/timesheets/:id` - Update entry
- `DELETE /api/timesheets/:id` - Delete entry

#### Timer Operations
- `POST /api/timesheets/:id/start-timer` - Start timer
- `POST /api/timesheets/:id/stop-timer` - Stop timer

#### Statistics
- `GET /api/timesheets/stats/overview` - Get statistics

#### Bulk Operations
- `POST /api/timesheets/bulk/update` - Bulk update
- `POST /api/timesheets/bulk/delete` - Bulk delete

#### Export
- `GET /api/timesheets/export/csv` - Export to CSV

### Data Model

```typescript
interface TimesheetEntry {
  _id: string;
  project_id: string;
  project_name?: string;
  task: string;
  user: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  status: 'active' | 'completed' | 'pending';
  timerStartedAt?: string;
  customer_id?: string;
  rate?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Usage Examples

### Creating a Time Entry
```typescript
const entryData = {
  project_id: 'project123',
  task: 'Frontend Development',
  user: 'John Doe',
  date: '2024-01-15T00:00:00.000Z',
  hours: 8.5,
  description: 'Working on responsive design',
  billable: true,
  status: 'completed'
};

await createTimeEntry(entryData);
```

### Filtering Timesheets
```typescript
const filters = {
  period: 'this_week',
  project: 'project123',
  user: 'John Doe',
  status: 'completed'
};

const timesheets = await getTimesheets(filters);
```

### Starting a Timer
```typescript
await startTimer('entry123');
// Timer widget will appear with live countdown
```

## Styling

The system uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue (#3B82F6) for primary actions
- **Success Colors**: Green (#10B981) for completed items
- **Warning Colors**: Yellow (#F59E0B) for pending items
- **Error Colors**: Red (#EF4444) for errors and delete actions
- **Neutral Colors**: Gray scale for text and backgrounds

## Responsive Design

- **Desktop**: Full feature set with side-by-side layouts
- **Tablet**: Optimized touch targets and simplified navigation
- **Mobile**: Stacked layouts and mobile-friendly interactions

## Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Memoization**: React.memo for expensive components
- **Debounced Search**: Search input with debouncing
- **Pagination**: Server-side pagination for large datasets
- **Caching**: Local storage for timer state and user preferences

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **High Contrast**: Support for high contrast mode
- **Focus Management**: Proper focus handling in modals
- **Alternative Text**: Descriptive alt text for images

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (for backend)

### Setup
1. Install dependencies: `npm install`
2. Set up environment variables
3. Start development server: `npm run dev`

### Testing
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
