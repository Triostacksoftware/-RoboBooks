# Documents API Documentation

## Overview

The Documents API provides comprehensive document management functionality for the RoboBooks application. It supports file uploads, document organization, search, and secure storage.

## Features

- **File Upload**: Support for multiple file types (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, images)
- **Document Organization**: Categorize documents by type and category
- **Search & Filter**: Full-text search and filtering capabilities
- **Security**: Authentication required for all operations
- **File Management**: Download and delete documents
- **Statistics**: Document analytics and usage statistics

## API Endpoints

### Base URL
```
http://localhost:5000/api/documents
```

### Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Upload Document
**POST** `/api/documents/upload`

Upload a new document with metadata.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `document` (file): The document file
  - `title` (string, required): Document title
  - `description` (string, optional): Document description
  - `documentType` (string, optional): Type of document (invoice, receipt, contract, agreement, certificate, license, other)
  - `category` (string, optional): Document category (financial, legal, compliance, business, other)
  - `tags` (string, optional): Comma-separated tags
  - `isPublic` (boolean, optional): Whether document is public

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "document_id",
    "title": "Document Title",
    "description": "Document description",
    "fileName": "generated_filename.pdf",
    "originalName": "original_filename.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "documentType": "invoice",
    "category": "financial",
    "tags": ["important", "tax"],
    "uploadedBy": "user_id",
    "isPublic": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get Documents
**GET** `/api/documents`

Retrieve documents with pagination and filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search term for full-text search
- `documentType` (string, optional): Filter by document type
- `category` (string, optional): Filter by category
- `sortBy` (string, optional): Sort field (default: createdAt)
- `sortOrder` (string, optional): Sort order - "asc" or "desc" (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "document_id",
      "title": "Document Title",
      "description": "Document description",
      "fileName": "filename.pdf",
      "originalName": "original.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "documentType": "invoice",
      "category": "financial",
      "tags": ["important"],
      "uploadedBy": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "isPublic": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDocuments": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Get Document by ID
**GET** `/api/documents/:id`

Retrieve a specific document by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "document_id",
    "title": "Document Title",
    "description": "Document description",
    "fileName": "filename.pdf",
    "originalName": "original.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "documentType": "invoice",
    "category": "financial",
    "tags": ["important"],
    "uploadedBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "isPublic": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Document
**PUT** `/api/documents/:id`

Update document metadata (file cannot be changed).

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "documentType": "receipt",
  "category": "financial",
  "tags": "updated,tags",
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    // Updated document object
  }
}
```

### 5. Delete Document
**DELETE** `/api/documents/:id`

Delete a document and its associated file.

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### 6. Download Document
**GET** `/api/documents/:id/download`

Download the document file.

**Response:**
- File stream with appropriate headers
- Content-Disposition header for filename

### 7. Get Document Statistics
**GET** `/api/documents/stats`

Get document statistics and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalDocuments": 150,
      "totalSize": 52428800
    },
    "byType": [
      {
        "_id": "invoice",
        "count": 45,
        "totalSize": 15728640
      }
    ],
    "byCategory": [
      {
        "_id": "financial",
        "count": 80,
        "totalSize": 26214400
      }
    ]
  }
}
```

## File Types Supported

- **PDF**: `application/pdf`
- **Word Documents**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Excel Spreadsheets**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **PowerPoint**: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- **Text Files**: `text/plain`
- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

## File Size Limits

- Maximum file size: 10MB
- Files are stored in the `uploads/` directory
- Unique filenames are generated to prevent conflicts

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Auth token missing"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to update this document"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Document not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error uploading document",
  "error": "Error details"
}
```

## Frontend Integration

The frontend includes:

1. **Upload Modal**: Drag-and-drop file upload with metadata form
2. **Documents List**: Display uploaded documents with search and filter
3. **Download/Delete**: Actions for document management
4. **Real-time Updates**: Automatic refresh after upload

## Security Features

- Authentication required for all operations
- File type validation
- File size limits
- User authorization for document operations
- Secure file storage with unique naming

## Database Schema

The Document model includes:

- `title`: Document title (required)
- `description`: Optional description
- `fileName`: Generated filename
- `originalName`: Original filename
- `filePath`: Server file path
- `fileSize`: File size in bytes
- `mimeType`: File MIME type
- `documentType`: Document classification
- `category`: Document category
- `tags`: Array of tags
- `uploadedBy`: User reference
- `isActive`: Soft delete flag
- `isPublic`: Public visibility flag
- `version`: Document version
- `metadata`: Additional metadata
- `createdAt`/`updatedAt`: Timestamps

## Usage Examples

### Upload a Document
```javascript
const formData = new FormData();
formData.append('document', file);
formData.append('title', 'Invoice #123');
formData.append('description', 'Monthly invoice');
formData.append('documentType', 'invoice');
formData.append('category', 'financial');
formData.append('tags', 'important,monthly');
formData.append('isPublic', 'false');

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ?{token}`,
  },
  body: formData,
});
```

### Get Documents with Search
```javascript
const response = await fetch('/api/documents?search=invoice&page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ?{token}`,
  },
});
```

### Download a Document
```javascript
const response = await fetch(`/api/documents/?{documentId}/download`, {
  headers: {
    'Authorization': `Bearer ?{token}`,
  },
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = '';
a.click();
```
