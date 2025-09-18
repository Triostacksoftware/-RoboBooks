# Items API Documentation

## Overview
The Items API provides comprehensive CRUD operations for managing inventory items, including goods and services with GST compliance features.

## Base URL
```
http://localhost:5000/api/items
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Item
**POST** `/api/items`

Creates a new item with validation for HSN/SAC codes based on item type.

**Request Body:**
```json
{
  "type": "Goods",
  "name": "Utsav Mattress",
  "unit": "Piece",
  "hsnCode": "9401",
  "salesEnabled": true,
  "purchaseEnabled": true,
  "sellingPrice": "15000.00",
  "costPrice": "12000.00",
  "salesAccount": "Sales",
  "purchaseAccount": "Cost of Goods Sold",
  "salesDescription": "Premium mattress for home use",
  "purchaseDescription": "Wholesale mattress purchase",
  "preferredVendor": "Mattress Co.",
  "description": "High-quality mattress with memory foam",
  "category": "Furniture",
  "brand": "Utsav",
  "currentStock": 50,
  "reorderPoint": 10,
  "gstRate": 18
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "Goods",
    "name": "Utsav Mattress",
    "sku": "GDS-123456",
    "hsnCode": "9401",
    "sellingPrice": 15000,
    "costPrice": 12000,
    "currentStock": 50,
    "isActive": true,
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Items
**GET** `/api/items`

Retrieves all items with pagination, filtering, and sorting options.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for name, SKU, barcode, category, brand
- `type` (string): Filter by type ("Goods" or "Service")
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status
- `sortBy` (string): Sort field (default: "createdAt")
- `sortOrder` (string): Sort order ("asc" or "desc", default: "desc")

**Example Request:**
```
GET /api/items?page=1&limit=10&search=mattress&type=Goods&sortBy=name&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "Goods",
      "name": "Utsav Mattress",
      "sku": "GDS-123456",
      "hsnCode": "9401",
      "sellingPrice": 15000,
      "currentStock": 50,
      "category": "Furniture",
      "isActive": true,
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Get Item by ID
**GET** `/api/items/:id`

Retrieves a specific item by its ID.

**Example Request:**
```
GET /api/items/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "Goods",
    "name": "Utsav Mattress",
    "unit": "Piece",
    "hsnCode": "9401",
    "salesEnabled": true,
    "purchaseEnabled": true,
    "sellingPrice": 15000,
    "costPrice": 12000,
    "salesAccount": "Sales",
    "purchaseAccount": "Cost of Goods Sold",
    "salesDescription": "Premium mattress for home use",
    "purchaseDescription": "Wholesale mattress purchase",
    "preferredVendor": "Mattress Co.",
    "description": "High-quality mattress with memory foam",
    "sku": "GDS-123456",
    "barcode": "1234567890123",
    "category": "Furniture",
    "brand": "Utsav",
    "currentStock": 50,
    "reorderPoint": 10,
    "gstRate": 18,
    "isActive": true,
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "updatedBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Item
**PUT** `/api/items/:id` or **PATCH** `/api/items/:id`

Updates an existing item. PUT replaces the entire item, PATCH allows partial updates.

**Example Request:**
```
PUT /api/items/64f8a1b2c3d4e5f6a7b8c9d0
Content-Type: application/json

{
  "sellingPrice": "16000.00",
  "currentStock": 45,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Utsav Mattress",
    "sellingPrice": 16000,
    "currentStock": 45,
    "description": "Updated description",
    "updatedBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### 5. Delete Item (Soft Delete)
**DELETE** `/api/items/:id`

Soft deletes an item by setting `isActive` to false.

**Example Request:**
```
DELETE /api/items/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

### 6. Hard Delete Item
**DELETE** `/api/items/:id/permanent`

Permanently deletes an item from the database.

**Example Request:**
```
DELETE /api/items/64f8a1b2c3d4e5f6a7b8c9d0/permanent
```

**Response:**
```json
{
  "success": true,
  "message": "Item permanently deleted"
}
```

### 7. Get Items by Type
**GET** `/api/items/type/:type`

Retrieves items filtered by type (Goods or Service).

**Example Request:**
```
GET /api/items/type/Goods?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "Goods",
      "name": "Utsav Mattress",
      "hsnCode": "9401",
      "sellingPrice": 15000
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### 8. Get Low Stock Items
**GET** `/api/items/low-stock`

Retrieves items where current stock is at or below reorder point.

**Example Request:**
```
GET /api/items/low-stock?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Utsav Mattress",
      "currentStock": 5,
      "reorderPoint": 10,
      "isLowStock": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10
  }
}
```

### 9. Search Items
**GET** `/api/items/search`

Advanced search functionality with multiple search criteria.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Filter by type
- `category` (string): Filter by category
- `page` (number): Page number
- `limit` (number): Items per page

**Example Request:**
```
GET /api/items/search?q=mattress&type=Goods&category=Furniture&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Utsav Mattress",
      "type": "Goods",
      "category": "Furniture",
      "sku": "GDS-123456"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

### 10. Get Item Statistics
**GET** `/api/items/stats`

Retrieves comprehensive statistics about items.

**Example Request:**
```
GET /api/items/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 150,
    "goodsCount": 120,
    "servicesCount": 30,
    "lowStockCount": 15,
    "categoryStats": [
      {
        "_id": "Furniture",
        "count": 45
      },
      {
        "_id": "Electronics",
        "count": 30
      }
    ],
    "priceStats": {
      "avgSellingPrice": 12500.50,
      "minSellingPrice": 100.00,
      "maxSellingPrice": 50000.00,
      "totalValue": 1875075.00
    }
  }
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "HSN code is required for goods",
    "Selling price is required when sales is enabled"
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Item not found"
}
```

### Duplicate Error
```json
{
  "success": false,
  "message": "An item with this name already exists"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Error creating item",
  "error": "Database connection failed"
}
```

## Data Models

### Item Schema
```javascript
{
  type: "Goods" | "Service",
  name: String (required),
  unit: String,
  hsnCode: String (required for goods),
  sacCode: String (required for services),
  salesEnabled: Boolean (default: true),
  purchaseEnabled: Boolean (default: true),
  sellingPrice: Number,
  costPrice: Number,
  salesAccount: String,
  purchaseAccount: String,
  salesDescription: String,
  purchaseDescription: String,
  preferredVendor: String,
  description: String,
  sku: String (auto-generated),
  barcode: String,
  category: String,
  brand: String,
  currentStock: Number (default: 0),
  reorderPoint: Number (default: 0),
  gstRate: Number (default: 18),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## Features

### GST Compliance
- **HSN Codes**: Required for goods (8-digit codes)
- **SAC Codes**: Required for services (6-digit codes)
- **GST Rate**: Configurable tax rate per item

### Inventory Management
- **Stock Tracking**: Current stock levels
- **Reorder Points**: Automatic low stock alerts
- **SKU Generation**: Auto-generated unique identifiers
- **Barcode Support**: Optional barcode tracking

### Advanced Features
- **Soft Delete**: Items are marked inactive rather than deleted
- **Audit Trail**: Track who created and updated items
- **Search & Filter**: Advanced search with multiple criteria
- **Pagination**: Efficient data loading
- **Statistics**: Comprehensive item analytics

## Usage Examples

### Creating a Service Item
```javascript
const serviceItem = {
  type: "Service",
  name: "Consulting Services",
  unit: "Hour",
  sacCode: "998314",
  salesEnabled: true,
  sellingPrice: "500.00",
  salesAccount: "Services",
  description: "Professional consulting services"
};
```

### Creating a Goods Item
```javascript
const goodsItem = {
  type: "Goods",
  name: "Office Chair",
  unit: "Piece",
  hsnCode: "9401",
  salesEnabled: true,
  purchaseEnabled: true,
  sellingPrice: "2500.00",
  costPrice: "1800.00",
  category: "Furniture",
  brand: "OfficeMax",
  currentStock: 25,
  reorderPoint: 5
};
```

### Search and Filter
```javascript
// Search for items containing "chair"
GET /api/items?search=chair

// Get only goods items
GET /api/items?type=Goods

// Get items in furniture category
GET /api/items?category=Furniture

// Sort by name ascending
GET /api/items?sortBy=name&sortOrder=asc
``` 
