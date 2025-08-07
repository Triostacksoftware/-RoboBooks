# RoboBooks Admin Panel

A modern admin panel for managing the RoboBooks application with secure authentication and comprehensive user management.

## Features

### 🔐 Authentication
- **Secure Admin Login**: Email and password-based authentication
- **Role-based Access Control**: Super admin, admin, and moderator roles
- **Permission System**: Granular permissions for different admin functions
- **Session Management**: Secure cookie-based sessions

### 📊 Dashboard
- **Real-time Statistics**: User counts, revenue, growth metrics
- **Activity Overview**: Recent system activities and events
- **Quick Actions**: Direct access to common admin functions
- **Responsive Design**: Works on desktop and mobile devices

### 👥 User Management
- **User Overview**: View all registered users
- **Search & Filter**: Find users by company name, email, or status
- **User Details**: View comprehensive user information
- **Status Management**: Activate/deactivate user accounts

### 🛡️ Security Features
- **Password Hashing**: Secure bcrypt password hashing
- **JWT Tokens**: Secure token-based authentication
- **Admin-only Routes**: Protected admin endpoints
- **Permission Validation**: Role and permission-based access control

## Quick Start

### 1. Setup Admin Account

The super admin account is automatically created when you run the setup script:

```bash
cd backend
node setup-admin.js
```

**Default Credentials:**
- Email: `admin@robobooks.com`
- Password: `admin123`

⚠️ **Important**: Change the password after first login!

### 2. Start the Servers

**Backend (Port 5000):**
```bash
cd backend
npm start
```

**Frontend (Port 3000):**
```bash
cd client
npm run dev
```

### 3. Access Admin Panel

Navigate to: `http://localhost:3000/admin/login`

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile

### Admin Management (Super Admin Only)
- `GET /api/admin/admins` - Get all admins
- `POST /api/admin/admins` - Create new admin
- `PUT /api/admin/admins/:id` - Update admin
- `DELETE /api/admin/admins/:id` - Delete admin

### Dashboard & Analytics
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/reports` - Get reports

## Admin Roles & Permissions

### Super Admin
- Full system access
- Can manage other admins
- All permissions enabled

### Admin
- Standard admin access
- User management
- Analytics and reports

### Moderator
- Limited access
- Basic user management
- View-only analytics

## Permissions

- `manage_users` - Manage user accounts
- `manage_admins` - Manage admin accounts
- `view_analytics` - View analytics and statistics
- `manage_content` - Manage system content
- `manage_settings` - Manage system settings
- `view_reports` - View system reports
- `manage_billing` - Manage billing and payments

## Database Schema

### Admin Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  passwordHash: String,
  role: String (enum: ['super_admin', 'admin', 'moderator']),
  permissions: [String],
  isActive: Boolean,
  lastLogin: Date,
  profileImage: String,
  phone: String,
  department: String,
  createdAt: Date
}
```

## Frontend Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Main dashboard
- `/admin/users` - User management
- `/admin/reports` - Reports and analytics
- `/admin/billing` - Billing management
- `/admin/settings` - System settings

## Security Considerations

1. **Password Security**: All passwords are hashed using bcrypt
2. **Session Security**: HTTP-only cookies with secure flags
3. **CORS Protection**: Configured for production security
4. **Input Validation**: All inputs are validated and sanitized
5. **Rate Limiting**: Implement rate limiting for login attempts
6. **Audit Trail**: Log all admin actions for security

## Development

### Adding New Admin Features

1. **Backend**: Add routes in `backend/routes/adminRoutes.js`
2. **Controller**: Add logic in `backend/controllers/adminController.js`
3. **Middleware**: Add auth checks in `backend/middleware/adminAuth.js`
4. **Frontend**: Add pages in `client/src/app/admin/`

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/robobooks

# JWT Secret
JWT_SECRET=your-secret-key

# Client Origin (for CORS)
CLIENT_ORIGIN=http://localhost:3000
```

## Troubleshooting

### Common Issues

1. **Login Fails**: Check if admin account exists and credentials are correct
2. **Permission Denied**: Verify admin role and permissions
3. **Session Expired**: Clear cookies and login again
4. **Database Connection**: Ensure MongoDB is running

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=admin:*
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## License

This admin panel is part of the RoboBooks application.
