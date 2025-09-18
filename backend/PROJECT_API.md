# Project API Documentation

## Overview

The Project API provides comprehensive functionality for managing projects, tasks, time entries, invoices, and expenses. It follows RESTful principles and includes full CRUD operations for all entities.

## Models

### Project Model
```javascript
{
  user_id: String (required),
  name: String (required),
  client: String (required),
  description: String,
  status: 'active' | 'completed' | 'on-hold' | 'cancelled',
  progress: Number (0-100),
  budget: Number,
  spent: Number,
  revenue: Number,
  startDate: Date (required),
  endDate: Date (required),
  teamMembers: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  project_id: ObjectId (required),
  name: String (required),
  description: String,
  status: 'pending' | 'in-progress' | 'completed',
  assignedTo: String (required),
  estimatedHours: Number,
  actualHours: Number,
  dueDate: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

### TimeEntry Model
```javascript
{
  project_id: ObjectId (required),
  task: String (required),
  user: String (required),
  date: Date (required),
  hours: Number (required),
  description: String,
  billable: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice Model
```javascript
{
  project_id: ObjectId (required),
  number: String (required),
  date: Date (required),
  amount: Number (required),
  status: 'draft' | 'sent' | 'paid' | 'overdue',
  dueDate: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Model
```javascript
{
  project_id: ObjectId (required),
  description: String (required),
  amount: Number (required),
  date: Date (required),
  category: 'travel' | 'meals' | 'supplies' | 'equipment' | 'other',
  status: 'pending' | 'approved' | 'rejected',
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Project CRUD Operations

#### GET /api/projects
Get all projects for the authenticated user
```javascript
Response: Project[]
```

#### POST /api/projects
Create a new project
```javascript
Request: {
  name: string,
  client: string,
  description?: string,
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled',
  progress?: number,
  budget?: number,
  spent?: number,
  revenue?: number,
  startDate: string,
  endDate: string,
  teamMembers?: string[]
}
Response: Project
```

#### GET /api/projects/:id
Get project details with all related data
```javascript
Response: {
  ...Project,
  tasks: Task[],
  timeEntries: TimeEntry[],
  invoices: Invoice[],
  expenses: Expense[]
}
```

#### PUT /api/projects/:id
Update project
```javascript
Request: Partial<Project>
Response: Project
```

#### DELETE /api/projects/:id
Delete project
```javascript
Response: 204 No Content
```

#### GET /api/projects/:id/stats
Get project statistics
```javascript
Response: {
  totalEstimatedHours: number,
  totalActualHours: number,
  totalTimeEntries: number,
  totalInvoiced: number,
  totalExpenses: number,
  paidInvoices: number,
  netProfit: number,
  profitMargin: number
}
```

### Task Operations

#### GET /api/projects/:projectId/tasks
Get all tasks for a project
```javascript
Response: Task[]
```

#### POST /api/projects/:projectId/tasks
Create a new task
```javascript
Request: {
  name: string,
  description?: string,
  status?: 'pending' | 'in-progress' | 'completed',
  assignedTo: string,
  estimatedHours?: number,
  actualHours?: number,
  dueDate: string
}
Response: Task
```

#### PUT /api/projects/:projectId/tasks/:taskId
Update a task
```javascript
Request: Partial<Task>
Response: Task
```

#### DELETE /api/projects/:projectId/tasks/:taskId
Delete a task
```javascript
Response: 204 No Content
```

### Time Entry Operations

#### GET /api/projects/:projectId/time-entries
Get all time entries for a project
```javascript
Response: TimeEntry[]
```

#### POST /api/projects/:projectId/time-entries
Create a new time entry
```javascript
Request: {
  task: string,
  user: string,
  date: string,
  hours: number,
  description?: string,
  billable?: boolean
}
Response: TimeEntry
```

#### PUT /api/projects/:projectId/time-entries/:timeEntryId
Update a time entry
```javascript
Request: Partial<TimeEntry>
Response: TimeEntry
```

#### DELETE /api/projects/:projectId/time-entries/:timeEntryId
Delete a time entry
```javascript
Response: 204 No Content
```

### Invoice Operations

#### GET /api/projects/:projectId/invoices
Get all invoices for a project
```javascript
Response: Invoice[]
```

#### POST /api/projects/:projectId/invoices
Create a new invoice
```javascript
Request: {
  number: string,
  date: string,
  amount: number,
  status?: 'draft' | 'sent' | 'paid' | 'overdue',
  dueDate: string
}
Response: Invoice
```

#### PUT /api/projects/:projectId/invoices/:invoiceId
Update an invoice
```javascript
Request: Partial<Invoice>
Response: Invoice
```

#### DELETE /api/projects/:projectId/invoices/:invoiceId
Delete an invoice
```javascript
Response: 204 No Content
```

### Expense Operations

#### GET /api/projects/:projectId/expenses
Get all expenses for a project
```javascript
Response: Expense[]
```

#### POST /api/projects/:projectId/expenses
Create a new expense
```javascript
Request: {
  description: string,
  amount: number,
  date: string,
  category?: 'travel' | 'meals' | 'supplies' | 'equipment' | 'other',
  status?: 'pending' | 'approved' | 'rejected'
}
Response: Expense
```

#### PUT /api/projects/:projectId/expenses/:expenseId
Update an expense
```javascript
Request: Partial<Expense>
Response: Expense
```

#### DELETE /api/projects/:projectId/expenses/:expenseId
Delete an expense
```javascript
Response: 204 No Content
```

## Authentication

All project endpoints require authentication. Include the session cookie in requests:

```javascript
fetch('/api/projects', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  // ... other options
})
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a message:
```javascript
{
  error: "Error message"
}
```

## Testing

Run the test script to verify API functionality:

```bash
cd backend
node test-project-api.js
```

This will test all CRUD operations and verify the API is working correctly.

## Frontend Integration

The frontend uses the `projectApi` object from `@/lib/api` to interact with the backend:

```javascript
import { projectApi } from '@/lib/api';

// Get project details
const project = await projectApi.getById(projectId);

// Create a task
const task = await projectApi.createTask(projectId, taskData);

// Update an invoice
const invoice = await projectApi.updateInvoice(projectId, invoiceId, invoiceData);
```

## Database Schema

The API uses MongoDB with the following collections:
- `projects` - Project data
- `tasks` - Task data with project reference
- `timeentries` - Time entry data with project reference
- `invoices` - Invoice data with project reference
- `expenses` - Expense data with project reference

All models include timestamps and proper indexing for efficient queries. 
