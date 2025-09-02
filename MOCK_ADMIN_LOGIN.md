# 🔐 Mock Admin Login for RoboBooks

## 📧 Admin Credentials

**Email:** `admin@robobooks.com`  
**Password:** `admin123`  
**Role:** `super_admin`

## 🚀 How to Login

### 1. **Access Admin Login Page**
Navigate to: `http://localhost:3000/admin/login`

### 2. **Backend API**
The backend API is running on: `http://localhost:5050`

### 2. **Enter Credentials**
- **Email:** `admin@robobooks.com`
- **Password:** `admin123`

### 3. **Click "Sign in to Admin Panel"**
After successful login, you'll be redirected to the admin dashboard.

## 🎯 Admin Features Available

As a **super_admin**, you have access to:

### **User Management**
- ✅ View all users
- ✅ Approve/reject user registrations
- ✅ Manage user statuses
- ✅ Delete users

### **Admin Management**
- ✅ Create new admin users
- ✅ Manage admin roles and permissions
- ✅ Update admin profiles

### **System Analytics**
- ✅ View system statistics
- ✅ Monitor user activity
- ✅ Track revenue and growth metrics

### **Content Management**
- ✅ Manage system content
- ✅ Update system settings
- ✅ View audit logs

### **Reports & Billing**
- ✅ Generate system reports
- ✅ Manage billing information
- ✅ View financial analytics

## 🔧 Creating Additional Admin Users

If you want to create more admin users, you can:

### **Option 1: Use the API Endpoint**
```bash
POST /api/admin/create-simple
{
  "firstName": "New Admin",
  "lastName": "User",
  "email": "newadmin@robobooks.com",
  "password": "password123",
  "role": "admin",
  "permissions": ["view_analytics", "manage_users"],
  "department": "IT"
}
```

### **Option 2: Run the Script**
```bash
cd backend
node scripts/createMockAdmin.js
```

## 🛡️ Security Notes

- **This is a development environment** - use strong passwords in production
- **Admin sessions expire** after 7 days
- **All admin actions are logged** for audit purposes
- **Role-based access control** is enforced

## 🚨 Troubleshooting

### **Login Issues**
1. Ensure backend server is running (`npm start` in backend directory)
2. Check MongoDB connection
3. Verify admin user exists in database

### **Permission Issues**
1. Check admin role and permissions
2. Ensure admin account is active
3. Verify session hasn't expired

### **Database Issues**
1. Check MongoDB connection string in `.env`
2. Ensure Admin collection exists
3. Verify admin user was created successfully

## 📱 Admin Dashboard Access

After login, you can access:
- **Main Dashboard:** `/admin/dashboard`
- **User Management:** `/admin/users`
- **Admin Management:** `/admin/admins`
- **System Settings:** `/admin/settings`

---

**Happy Administering! 🎉**
