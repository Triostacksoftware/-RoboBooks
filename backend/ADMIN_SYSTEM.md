# RoboBooks Admin System

A comprehensive admin dashboard and management system for the RoboBooks platform.

## 🚀 Features

### Core Admin Features
- **Multi-role Admin System**: Super Admin, Admin, and Moderator roles
- **Permission-based Access Control**: Granular permissions for different admin actions
- **Secure Authentication**: JWT-based authentication with session management
- **Real-time Analytics**: Dashboard with live statistics and insights
- **User Management**: Complete user lifecycle management
- **Billing Management**: Subscription and payment tracking
- **Report Generation**: Automated and manual report creation
- **System Settings**: Comprehensive configuration management

### Dashboard Analytics
- User growth and activity metrics
- Revenue tracking and analysis
- Project and timesheet statistics
- System health monitoring
- Recent activity feed

### Security Features
- Role-based access control (RBAC)
- Permission validation
- Session management
- Rate limiting
- Audit logging
- Two-factor authentication support

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis (optional, for session storage)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd robobooks-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/robobooks

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Configuration
ADMIN_SESSION_SECRET=your-admin-session-secret
```

### 4. Setup Admin System
```bash
# Run the admin setup script
node setup-admin.js
```

This will create:
- Super admin account
- Sample admin accounts
- Admin roles and permissions
- Database indexes

## 👥 Admin Roles & Permissions

### Super Administrator
- **Role**: `super_admin`
- **Permissions**: All permissions
- **Default Email**: `admin@robobooks.com`
- **Default Password**: `admin123`

### Administrator
- **Role**: `admin`
- **Permissions**:
  - `manage_users`
  - `view_analytics`
  - `manage_content`
  - `view_reports`
  - `manage_billing`

### Moderator
- **Role**: `moderator`
- **Permissions**:
  - `view_analytics`
  - `view_reports`

## 🔐 Authentication

### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@robobooks.com",
  "password": "admin123"
}
```

### Response
```json
{
  "success": true,
  "admin": {
    "id": "admin_id",
    "firstName": "Super",
    "lastName": "Admin",
    "fullName": "Super Admin",
    "email": "admin@robobooks.com",
    "role": "super_admin",
    "permissions": ["manage_users", "manage_admins", ...],
    "department": "Administration",
    "lastLogin": "2024-01-20T10:30:00Z"
  }
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/change-password` - Change password

### Dashboard & Analytics
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users/stats` - User statistics

### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

### Admin Management (Super Admin Only)
- `GET /api/admin/admins` - Get all admins
- `POST /api/admin/admins` - Create new admin
- `PUT /api/admin/admins/:id` - Update admin
- `DELETE /api/admin/admins/:id` - Delete admin

### Reports
- `GET /api/admin/reports` - Get available reports

### Billing
- `GET /api/admin/billing` - Get billing data

### Settings
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

## 🎯 Usage Examples

### Creating a New Admin
```javascript
const response = await fetch('/api/admin/admins', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    firstName: "John",
    lastName: "Manager",
    email: "john@company.com",
    password: "secure123",
    role: "admin",
    permissions: ["manage_users", "view_analytics"],
    department: "Management"
  })
});
```

### Getting Dashboard Stats
```javascript
const response = await fetch('/api/admin/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const stats = await response.json();
console.log(stats);
// {
//   totalUsers: 1250,
//   activeUsers: 890,
//   totalRevenue: 45000,
//   monthlyGrowth: 12.5,
//   totalProjects: 45,
//   activeProjects: 23,
//   totalHours: 1250
// }
```

### Updating User Status
```javascript
const response = await fetch('/api/admin/users/user_id/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    isActive: false
  })
});
```

## 🔧 Configuration

### Environment Variables
```env
# Required
MONGODB_URI=mongodb://localhost:27017/robobooks
JWT_SECRET=your-jwt-secret

# Optional
ADMIN_SESSION_SECRET=your-session-secret
ADMIN_SESSION_TIMEOUT=3600000
ADMIN_RATE_LIMIT=100
ADMIN_RATE_LIMIT_WINDOW=900000
```

### Admin Settings
The admin system supports various configuration options:

```javascript
// System Settings
{
  general: {
    siteName: "RoboBooks Admin",
    siteDescription: "Business management platform",
    timezone: "UTC",
    language: "English"
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: "strong"
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    reportFrequency: "weekly"
  },
  system: {
    maintenanceMode: false,
    debugMode: false,
    backupFrequency: "daily",
    logRetention: 30
  }
}
```

## 🛡️ Security Features

### Authentication Flow
1. Admin submits credentials
2. Server validates credentials
3. JWT token generated with admin claims
4. Token stored in httpOnly cookie
5. Subsequent requests validated via middleware

### Permission System
- **Role-based**: Admins have specific roles with predefined permissions
- **Permission-based**: Individual permissions can be assigned/revoked
- **Hierarchical**: Super admins have all permissions
- **Granular**: Specific permissions for different actions

### Security Middleware
- `adminAuthGuard` - Validates admin authentication
- `superAdminGuard` - Ensures super admin access
- `requirePermission` - Checks specific permissions
- `adminRateLimit` - Rate limiting for admin endpoints
- `adminAuditLog` - Logs admin actions for audit

## 📈 Analytics & Reporting

### Dashboard Metrics
- **User Analytics**: Registration, activity, growth
- **Revenue Analytics**: Income, growth, top customers
- **Project Analytics**: Project count, status, progress
- **System Health**: Performance, uptime, storage

### Report Types
- **User Activity Report**: User engagement and activity
- **Revenue Summary**: Financial performance analysis
- **System Performance**: Technical metrics and health
- **Security Audit**: Security events and access logs

## 🔄 Database Schema

### Admin Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  passwordHash: String,
  role: String, // 'super_admin', 'admin', 'moderator'
  permissions: [String],
  isActive: Boolean,
  lastLogin: Date,
  profileImage: String,
  phone: String,
  department: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Error Handling

### Common Error Responses
```javascript
// Authentication Error
{
  "message": "Authentication required"
}

// Permission Error
{
  "message": "Permission denied: manage_users required"
}

// Validation Error
{
  "message": "Email is required"
}

// Not Found Error
{
  "message": "Admin not found"
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run admin-specific tests
npm test -- --grep "admin"

# Run with coverage
npm run test:coverage
```

### Test Admin Credentials
```javascript
// Super Admin
email: "admin@robobooks.com"
password: "admin123"

// Manager
email: "manager@robobooks.com"
password: "manager123"

// Analyst
email: "analyst@robobooks.com"
password: "analyst123"
```

## 🔧 Development

### Adding New Permissions
1. Add permission to `ADMIN_PERMISSIONS` in `adminAuth.js`
2. Update admin roles in `setup-admin.js`
3. Add permission checks in routes
4. Update frontend permission checks

### Adding New Admin Features
1. Create controller function
2. Add route with appropriate middleware
3. Update admin layout if needed
4. Add frontend components
5. Update documentation

### Database Migrations
```bash
# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback
```

## 📚 API Documentation

Complete API documentation is available at `/api/docs` when running in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This admin system is designed for production use with proper security measures. Always change default passwords and review security settings before deployment.
