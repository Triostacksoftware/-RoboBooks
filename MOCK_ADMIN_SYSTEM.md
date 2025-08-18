# Mock Admin System

This document describes the mock admin system for testing and development purposes.

## Overview

The mock admin system provides a complete set of test admin users with different roles and permissions for testing the admin panel functionality.

## Mock Admin Users

### 1. Super Administrator
- **Email**: `superadmin@robobooks.com`
- **Password**: `super123`
- **Role**: `super_admin`
- **Department**: System Administration
- **Permissions**: All permissions (manage_users, manage_admins, view_analytics, manage_content, manage_settings, view_reports, manage_billing)
- **Status**: Active

### 2. Admin Manager
- **Email**: `admin@robobooks.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Department**: IT Administration
- **Permissions**: manage_users, view_analytics, manage_content, manage_settings, view_reports, manage_billing
- **Status**: Active

### 3. Content Moderator
- **Email**: `moderator@robobooks.com`
- **Password**: `mod123`
- **Role**: `moderator`
- **Department**: Content Management
- **Permissions**: view_analytics, manage_content, view_reports
- **Status**: Active

### 4. Support Admin
- **Email**: `support@robobooks.com`
- **Password**: `support123`
- **Role**: `admin`
- **Department**: Customer Support
- **Permissions**: manage_users, view_analytics, view_reports
- **Status**: Active

### 5. Finance Manager
- **Email**: `finance@robobooks.com`
- **Password**: `finance123`
- **Role**: `admin`
- **Department**: Finance
- **Permissions**: view_analytics, view_reports, manage_billing
- **Status**: Active

### 6. Inactive Admin
- **Email**: `inactive@robobooks.com`
- **Password**: `inactive123`
- **Role**: `admin`
- **Department**: Testing
- **Permissions**: view_analytics
- **Status**: Inactive (for testing inactive account scenarios)

## Setup Instructions

### 1. Create Mock Admins
Run the following command to create all mock admin users:

```bash
cd backend
node create-mock-admin.js
```

### 2. Access Admin Panel
1. Start your application
2. Navigate to `/admin/login`
3. Login with any of the mock admin credentials above

### 3. Test Different Roles
- **Super Admin**: Full access to all features
- **Admin**: Standard administrative access
- **Moderator**: Limited access (content management only)
- **Support**: User management and analytics
- **Finance**: Billing and financial reports
- **Inactive**: Should not be able to login

## Mock Dashboard

### URL: `/admin/mock-dashboard`

A mock dashboard is available at `/admin/mock-dashboard` that shows:
- Sample statistics and metrics
- Mock pending user approvals
- Mock recent activity
- Mock system health status

This dashboard is useful for:
- UI/UX testing
- Demo purposes
- Development without real data

## Testing Scenarios

### 1. Role-Based Access Testing
- Login with different admin roles
- Test permission restrictions
- Verify role-specific features

### 2. User Approval Testing
- Use admin accounts to approve/reject users
- Test approval workflow
- Verify approval statistics

### 3. Admin Management Testing
- Create new admin users
- Test admin creation workflow
- Verify admin permissions

### 4. Session Management Testing
- Test login/logout functionality
- Test session expiration
- Test authentication guards

## Quick Links

### Admin Panel URLs
- **Admin Login**: `http://localhost:3000/admin/login`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **Mock Dashboard**: `http://localhost:3000/admin/mock-dashboard`
- **Create Admin**: `http://localhost:3000/admin/create-admin`

### User Panel URLs
- **User Login**: `http://localhost:3000/signin`
- **User Registration**: `http://localhost:3000/register`

## Admin Roles and Permissions

### Super Admin
- Full system access
- Can manage all admin users
- Can access all features and settings

### Admin
- Standard administrative access
- Can manage users and view analytics
- Can access most features

### Moderator
- Limited administrative access
- Can manage content and view reports
- Restricted access to user management

## Security Features

### Authentication
- Password hashing with bcrypt
- Session management with HTTP-only cookies
- Role-based access control
- Permission-based authorization

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure password requirements

## Development Workflow

### 1. Initial Setup
```bash
# Create mock admin users
cd backend
node create-mock-admin.js
```

### 2. Testing
```bash
# Start development server
npm run dev

# Access admin panel
# http://localhost:3000/admin/login
```

### 3. Development
- Use mock admin accounts for testing
- Test different permission levels
- Verify admin functionality
- Test user approval workflow

## Troubleshooting

### Common Issues
1. **Login fails**: Check if admin account exists and is active
2. **Permission denied**: Verify admin role and permissions
3. **Session issues**: Clear browser cookies and try again
4. **Database errors**: Check MongoDB connection

### Debug Steps
1. Check browser console for errors
2. Verify API endpoint responses
3. Check server logs for authentication errors
4. Validate database connection and admin records

## Best Practices

### Testing
- Use different admin roles for comprehensive testing
- Test both positive and negative scenarios
- Verify permission restrictions work correctly
- Test edge cases and error conditions

### Security
- Never use mock credentials in production
- Regularly rotate test passwords
- Monitor admin login activity
- Implement proper session management

### Development
- Use mock data for development and testing
- Keep mock data separate from production data
- Document any changes to mock data structure
- Maintain consistent test scenarios

## Cleanup

To remove mock data from the database:

```bash
# Remove all mock admins
cd backend
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
dotenv.config();

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Admin.deleteMany({ email: { \$regex: /@robobooks\.com$/ } });
  console.log('Mock admins removed');
  await mongoose.disconnect();
}
cleanup();
"
```

## Support

For issues with the mock admin system:
1. Check the database connection
2. Verify admin model schema
3. Check authentication middleware
4. Review server logs for errors
