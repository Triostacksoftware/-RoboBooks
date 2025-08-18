# Admin Login System

This document describes the admin login system for the RoboBooks application.

## Overview

The admin login system provides secure access to the administrative panel where administrators can manage users, view analytics, and control system settings.

## Features

### 1. Secure Authentication

- Email and password-based login
- Session management with HTTP-only cookies
- Automatic session validation
- Secure logout functionality

### 2. Admin Roles and Permissions

- **Super Admin**: Full system access
- **Admin**: Standard administrative access
- **Moderator**: Limited administrative access
- Role-based permission system

### 3. User Management

- Create new admin users
- Manage existing admin accounts
- View admin activity and login history

## Admin Login Page

### URL: `/admin/login`

The admin login page features:

- Clean, professional design with purple theme
- Email and password fields with validation
- Show/hide password functionality
- Loading states and error handling
- Automatic redirect if already authenticated
- Security notice and branding

### Login Form Fields

- **Email**: Admin email address
- **Password**: Admin password (minimum 6 characters)
- **Submit**: Sign in button with loading state

## Test Admin Credentials

For testing purposes, a default admin account is created:

```
Email: admin@robobooks.com
Password: admin123
```

### Creating Test Admin

Run the following command to create the test admin:

```bash
cd backend
node create-test-admin.js
```

## Admin Dashboard

### URL: `/admin/dashboard`

After successful login, admins are redirected to the dashboard which includes:

- User approval management
- System statistics
- Quick actions
- Recent activity
- Navigation sidebar

## Creating New Admins

### URL: `/admin/create-admin`

Admins can create new admin users through:

1. **Admin Creation Form**: Complete form with validation
2. **Role Selection**: Choose admin role (admin, moderator, super_admin)
3. **Permission Management**: Set appropriate permissions
4. **Security Validation**: Password confirmation and validation

### Form Fields

- First Name (required)
- Last Name (required)
- Email Address (required)
- Department (optional)
- Role (required)
- Password (required, minimum 6 characters)
- Confirm Password (required)

## API Endpoints

### Authentication

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile

### Admin Management

- `POST /api/admin/create-simple` - Create new admin
- `GET /api/admin/profile` - Get admin profile
- `PATCH /api/admin/profile` - Update admin profile
- `PATCH /api/admin/change-password` - Change admin password

### User Approval (Admin Only)

- `GET /api/admin/user-approval/pending-users` - Get pending users
- `POST /api/admin/user-approval/approve-user/:id` - Approve user
- `POST /api/admin/user-approval/reject-user/:id` - Reject user
- `GET /api/admin/user-approval/approval-stats` - Get approval statistics

## Security Features

### Authentication Security

- Password hashing with bcrypt
- HTTP-only cookies for session management
- CSRF protection
- Rate limiting on login attempts
- Session timeout and validation

### Authorization

- Role-based access control
- Permission-based authorization
- Admin session validation
- Secure middleware for protected routes

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure password requirements

## Usage Instructions

### For Administrators

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Access the admin dashboard
4. Manage users, view reports, and control system settings
5. Use logout to end session

### For System Administrators

1. Create initial admin account using the test script
2. Access admin panel and create additional admin users
3. Set appropriate roles and permissions
4. Monitor admin activity and manage accounts

## Error Handling

### Common Error Messages

- "Invalid email or password" - Authentication failed
- "Account is deactivated" - Admin account disabled
- "Session expired" - Login session expired
- "Permission denied" - Insufficient permissions

### Error Display

- User-friendly error messages
- Visual error indicators
- Loading states during operations
- Success confirmations

## Configuration

### Environment Variables

- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

### Cookie Settings

- **Development**: `sameSite: 'lax'`, `secure: false`
- **Production**: `sameSite: 'strict'`, `secure: true`
- **Max Age**: 7 days
- **HttpOnly**: true

## Testing

### Manual Testing

1. Create test admin: `node create-test-admin.js`
2. Login with test credentials
3. Test user approval functionality
4. Test admin creation
5. Test logout and session management

### Automated Testing

- API endpoint testing
- Authentication flow testing
- Permission validation testing
- Error handling testing

## Troubleshooting

### Common Issues

1. **Login fails**: Check credentials and admin account status
2. **Session expires**: Re-login required
3. **Permission denied**: Check admin role and permissions
4. **Database errors**: Verify MongoDB connection

### Debug Steps

1. Check browser console for errors
2. Verify API endpoint responses
3. Check server logs for authentication errors
4. Validate database connection and admin records

## Best Practices

### Security

- Use strong passwords for admin accounts
- Regularly rotate admin credentials
- Monitor admin login activity
- Implement proper session management
- Use HTTPS in production

### User Management

- Create admin accounts with minimal required permissions
- Regularly review admin access and permissions
- Implement proper approval workflows
- Maintain audit logs of admin actions

### System Maintenance

- Regular security updates
- Database backup and maintenance
- Monitor system performance
- Update admin documentation
