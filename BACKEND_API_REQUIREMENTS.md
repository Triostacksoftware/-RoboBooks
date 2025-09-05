# Backend API Requirements for Organizations

## Overview

This document outlines the required backend API endpoints for the Organization management feature.

## API Endpoints

### 1. Get All Organizations

**Endpoint:** `GET /api/organizations`  
**Description:** Retrieve all organizations for the authenticated user  
**Authentication:** Required

**Response:**

```json
{
  "data": [
    {
      "id": "12345678901",
      "name": "Acme Corp",
      "tier": "Standard",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Organizations retrieved successfully"
}
```

### 2. Get Single Organization

**Endpoint:** `GET /api/organizations/:id`  
**Description:** Retrieve a specific organization by ID  
**Authentication:** Required

**Response:**

```json
{
  "data": {
    "id": "12345678901",
    "name": "Acme Corp",
    "tier": "Standard",
    "active": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Organization retrieved successfully"
}
```

### 3. Create Organization

**Endpoint:** `POST /api/organizations`  
**Description:** Create a new organization  
**Authentication:** Required

**Request Body:**

```json
{
  "name": "New Company Inc",
  "tier": "Standard",
  "active": false
}
```

**Response:**

```json
{
  "data": {
    "id": "98765432109",
    "name": "New Company Inc",
    "tier": "Standard",
    "active": false,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Organization created successfully"
}
```

### 4. Update Organization

**Endpoint:** `PUT /api/organizations/:id`  
**Description:** Update an existing organization  
**Authentication:** Required

**Request Body:**

```json
{
  "name": "Updated Company Name",
  "tier": "Premium"
}
```

**Response:**

```json
{
  "data": {
    "id": "12345678901",
    "name": "Updated Company Name",
    "tier": "Premium",
    "active": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  "message": "Organization updated successfully"
}
```

### 5. Delete Organization

**Endpoint:** `DELETE /api/organizations/:id`  
**Description:** Delete an organization  
**Authentication:** Required

**Response:**

```json
{
  "message": "Organization deleted successfully"
}
```

### 6. Set Active Organization

**Endpoint:** `POST /api/organizations/:id/activate`  
**Description:** Set an organization as the active one (deactivates others)  
**Authentication:** Required

**Response:**

```json
{
  "data": {
    "id": "12345678901",
    "name": "Acme Corp",
    "tier": "Standard",
    "active": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  },
  "message": "Organization set as active successfully"
}
```

## Data Model

### Organization Schema

```javascript
{
  id: String,          // Unique identifier
  name: String,        // Organization name (required)
  tier: String,        // "Standard" | "Premium" | "Enterprise"
  active: Boolean,     // Whether this is the currently active organization
  userId: String,      // ID of the user who owns this organization
  createdAt: Date,     // Creation timestamp
  updatedAt: Date      // Last update timestamp
}
```

## Business Rules

1. **Single Active Organization**: Only one organization can be active per user at a time
2. **First Organization**: When a user creates their first organization, it should automatically be set as active
3. **Authentication**: All endpoints require user authentication
4. **Ownership**: Users can only access their own organizations
5. **Validation**: Organization names must be unique per user
6. **Soft Delete**: Consider implementing soft delete for organizations (optional)

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "message": "Organization name is required",
  "details": {
    "field": "name",
    "code": "REQUIRED"
  }
}
```

### 404 Not Found

```json
{
  "error": "Organization not found",
  "message": "Organization with ID 12345678901 not found"
}
```

### 409 Conflict

```json
{
  "error": "Organization already exists",
  "message": "An organization with this name already exists"
}
```

## Implementation Notes

1. **Database**: Use your preferred database (MongoDB, PostgreSQL, etc.)
2. **Middleware**: Implement authentication middleware for all routes
3. **Validation**: Use a validation library (Joi, express-validator, etc.)
4. **Logging**: Log all organization operations for audit purposes
5. **Rate Limiting**: Consider implementing rate limiting for creation endpoints
6. **Caching**: Cache active organization data for better performance

## Frontend Integration

The frontend `organizationService.js` is already configured to work with these endpoints. Make sure your backend API responses match the expected format.

## Testing

Create tests for:

- Organization CRUD operations
- Active organization switching
- User isolation (users can't access others' organizations)
- Validation rules
- Error handling
