# Audit Trail & File Upload System - Robo Books Backend

This document describes the comprehensive audit trail system and file upload functionality that has been implemented to sync history with the backend.

## 🎯 Overview

The system now provides:
- **Complete audit logging** of all user actions
- **File upload management** with proper storage and tracking
- **Activity history** accessible via API and frontend components
- **Real-time tracking** of document changes and user activities

## 📁 File Upload System

### Features
- **Multiple file types** supported (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, images)
- **File size limits** (10MB maximum)
- **Secure storage** in dedicated uploads directory
- **Metadata tracking** (file size, MIME type, original filename)
- **User association** (who uploaded what and when)

### API Endpoints
```
POST /api/documents/upload          - Upload a new document
GET  /api/documents                 - List all documents
GET  /api/documents/:id             - Get document details
PUT  /api/documents/:id             - Update document metadata
DELETE /api/documents/:id           - Delete document
GET  /api/documents/:id/download    - Download document
GET  /api/documents/stats           - Get document statistics
```

### File Storage
- Files are stored in `backend/uploads/` directory
- Unique filenames generated using timestamp + random number
- Original filenames preserved in database
- File paths stored for download functionality

## 🔍 Audit Trail System

### What Gets Logged
- **Document operations**: upload, update, delete, download
- **User actions**: login, logout, profile changes
- **System activities**: account creation, settings changes
- **Business operations**: invoice creation, payment processing

### Audit Data Captured
- **User information**: who performed the action
- **Action details**: what was done
- **Entity information**: what was affected
- **Timestamps**: when it happened
- **IP addresses**: where it came from
- **User agents**: browser/device information
- **Status**: success/failure/pending
- **Error messages**: if something went wrong

### API Endpoints
```
GET /api/audit-trail                    - Get all audit trail entries
GET /api/audit-trail/entity/:type/:id   - Get audit trail for specific entity
GET /api/audit-trail/user/:id/summary   - Get user activity summary
GET /api/audit-trail/my-activity        - Get current user's activity
```

### Filtering & Pagination
- Filter by user, entity type, action, date range
- Pagination support for large datasets
- Real-time filtering and search

## 🗄️ Database Models

### Document Model
```javascript
{
  title: String,           // Document title
  description: String,      // Optional description
  fileName: String,         // Stored filename
  originalName: String,     // Original filename
  filePath: String,         // File system path
  fileSize: Number,         // File size in bytes
  mimeType: String,         // MIME type
  documentType: String,     // Category (invoice, receipt, etc.)
  category: String,         // Business category
  tags: [String],           // Searchable tags
  uploadedBy: ObjectId,     // User reference
  isActive: Boolean,        // Soft delete flag
  isPublic: Boolean,        // Public visibility
  version: Number,          // Document version
  metadata: Map             // Additional metadata
}
```

### AuditTrail Model
```javascript
{
  user: ObjectId,           // User who performed action
  action: String,           // Action type (create, update, delete, etc.)
  entity: String,           // Entity type (document, invoice, user, etc.)
  entityId: ObjectId,       // Specific entity ID
  details: Object,          // Action details and metadata
  ipAddress: String,        // IP address of request
  userAgent: String,        // Browser/device information
  timestamp: Date,          // When action occurred
  status: String,           // Success/failure/pending
  errorMessage: String      // Error details if failed
}
```

## 🎨 Frontend Components

### ActivityHistory Component
- **Global activity feed** showing recent system activities
- **Advanced filtering** by entity type, action, date range
- **Real-time updates** with refresh capability
- **Responsive design** for all screen sizes

### AuditTrailPanel Component
- **Entity-specific history** for individual items
- **Expandable/collapsible** interface
- **Detailed action information** with timestamps
- **User attribution** for all actions

### Integration Points
- **Dashboard**: Shows recent system activity
- **Documents**: Individual document history
- **User profiles**: Personal activity summary
- **Admin panel**: Comprehensive system audit

## 🚀 Getting Started

### Backend Setup
1. Ensure MongoDB is running
2. Install dependencies: `npm install`
3. Set environment variables (see `.env.example`)
4. Start server: `npm run dev`

### Frontend Integration
1. Import components where needed:
```javascript
import ActivityHistory from './components/ActivityHistory';
import AuditTrailPanel from './components/AuditTrailPanel';
```

2. Use in your components:
```javascript
// Global activity feed
<ActivityHistory title="Recent Activity" maxItems={10} />

// Entity-specific history
<AuditTrailPanel entityId="123" entityType="document" />
```

### Testing
Run the test script to verify functionality:
```bash
node test-file-upload.js
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGO_URI=mongodb://localhost:27017/robobooks

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOADS_DIR=./uploads   # Upload directory path

# CORS
CLIENT_ORIGIN=http://localhost:3000
```

### File Upload Limits
- **Maximum file size**: 10MB
- **Allowed file types**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, images
- **Storage location**: `backend/uploads/`
- **File naming**: `{fieldname}-{timestamp}-{random}.{extension}`

## 📊 Monitoring & Analytics

### Audit Trail Insights
- **User activity patterns** and peak usage times
- **Most common actions** and entity types
- **System performance** metrics
- **Security monitoring** for suspicious activities

### Document Statistics
- **Storage usage** by file type and category
- **Upload patterns** and user behavior
- **File type distribution** and trends
- **Storage optimization** recommendations

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based authentication** for all endpoints
- **Role-based access control** (admin, accountant, user)
- **User isolation** (users can only see their own data)
- **Admin oversight** (admins can view all activities)

### Data Protection
- **Secure file storage** with controlled access
- **Audit trail integrity** (immutable logs)
- **IP address tracking** for security monitoring
- **User agent logging** for device fingerprinting

## 🚨 Troubleshooting

### Common Issues

#### File Upload Fails
1. Check file size (must be under 10MB)
2. Verify file type is supported
3. Ensure uploads directory exists and is writable
4. Check authentication token is valid

#### Audit Trail Not Showing
1. Verify user has proper permissions
2. Check database connection
3. Ensure AuditTrail model is properly imported
4. Verify API endpoints are registered

#### Port Mismatch
- Frontend configured for port 4000
- Backend should run on port 4000
- Check `NEXT_PUBLIC_BACKEND_URL` environment variable

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=true
NODE_ENV=development
```

## 🔮 Future Enhancements

### Planned Features
- **Real-time notifications** for important activities
- **Advanced analytics** and reporting
- **Export functionality** for audit logs
- **Integration** with external monitoring tools
- **Machine learning** for anomaly detection

### Performance Optimizations
- **Database indexing** for faster queries
- **Caching layer** for frequently accessed data
- **Batch processing** for large audit datasets
- **Compression** for long-term storage

## 📚 Additional Resources

- [API Documentation](./PROJECT_API.md)
- [Authentication Guide](./utils/authreadme.md)
- [Database Schema](./models/)
- [Frontend Components](./client/src/app/dashboard/components/)

---

**Note**: This system provides comprehensive tracking and history synchronization. All user actions are logged for security, compliance, and audit purposes. Ensure your privacy policy reflects this data collection.
