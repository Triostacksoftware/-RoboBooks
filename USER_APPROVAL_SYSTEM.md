# User Approval System

This document describes the user approval system implemented for the RoboBooks application.

## Overview

The user approval system requires admin approval before new users can access the application. When users register, their accounts are created in a "pending" state and must be approved by an administrator before they can log in.

## Features

### 1. Registration Flow

- Users fill out the registration form
- Account is created in `PendingUser` collection with status "pending"
- User receives confirmation that approval is required
- User cannot login until approved

### 2. Admin Dashboard

- Shows pending user approvals with company name, email, and phone
- Displays approval statistics (pending, approved, rejected counts)
- Provides approve/reject buttons for each pending user
- Shows user approval status in real-time

### 3. Approval Process

- **Approve**: Creates user in main `User` collection with "approved" status
- **Reject**: Updates pending user status to "rejected" with reason
- Admin can provide rejection reasons
- All actions are logged with admin details

### 4. Login Restrictions

- Users with "pending" status cannot login
- Users with "rejected" status cannot login
- Only "approved" users can access the application

## Database Models

### User Model (Updated)

```javascript
{
  // ... existing fields
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date },
  rejectionReason: { type: String }
}
```

### PendingUser Model (New)

```javascript
{
  companyName: String,
  email: String,
  phone: String,
  phoneDialCode: String,
  phoneIso2: String,
  passwordHash: String,
  country: String,
  state: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  reviewedAt: Date,
  rejectionReason: String
}
```

## API Endpoints

### Admin User Approval Routes

- `GET /api/admin/user-approval/pending-users` - Get all pending users
- `GET /api/admin/user-approval/users` - Get all users with pagination
- `POST /api/admin/user-approval/approve-user/:pendingUserId` - Approve a user
- `POST /api/admin/user-approval/reject-user/:pendingUserId` - Reject a user
- `PATCH /api/admin/user-approval/update-user-status/:userId` - Update user status
- `GET /api/admin/user-approval/approval-stats` - Get approval statistics

### Updated Auth Routes

- `POST /api/auth/register` - Creates pending user instead of active user
- `POST /api/auth/login` - Checks approval status before allowing login

## Frontend Components

### Admin Dashboard

- **PendingApprovals**: Shows list of pending users with approve/reject buttons
- **ApprovalStats**: Displays approval statistics
- Real-time updates when approvals are processed

### Registration Form

- Shows success message about admin approval requirement
- Redirects to signin page after registration

## Testing

Run the test script to verify the system:

```bash
cd backend
node test-user-approval.js
```

This will:

1. Create a test admin
2. Create a test pending user
3. Approve the user
4. Verify the approval process works correctly

## Security Features

- Admin authentication required for all approval actions
- Rejection reasons are required when rejecting users
- All approval actions are logged with admin details
- Users cannot bypass approval by directly accessing endpoints

## Usage Instructions

### For Admins

1. Access the admin dashboard
2. View pending user approvals in the "Pending User Approvals" section
3. Click "Approve" to approve a user or "Reject" to reject with a reason
4. Monitor approval statistics in the "User Approval Statistics" section

### For Users

1. Register through the registration form
2. Wait for admin approval (you'll receive a confirmation message)
3. Once approved, you can login normally
4. If rejected, contact support for more information

## Configuration

The system uses the existing admin authentication middleware and database connections. No additional configuration is required beyond the standard application setup.
