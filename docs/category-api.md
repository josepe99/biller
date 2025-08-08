# Category API Documentation

## Overview
The Category API provides full CRUD operations for managing product categories with soft delete functionality.

## Files Created
- `lib/datasources/category.datasource.ts` - Data access layer
- `lib/controllers/category.controller.ts` - Business logic layer
- `app/api/categories/route.ts` - GET all categories, POST new category
- `app/api/categories/[id]/route.ts` - GET, PUT, DELETE, PATCH operations for individual categories

## API Endpoints

### GET /api/categories
Get all categories (excluding soft deleted by default)

**Query Parameters:**
- `includeDeleted` (boolean, optional) - Include soft deleted categories
- `search` (string, optional) - Search categories by name

**Response:**
```json
[
  {
    "id": "category_id",
    "name": "Category Name",
    "color": "#ff0000",
    "createdAt": "2025-08-07T...",
    "updatedAt": "2025-08-07T...",
    "deletedAt": null,
    "_count": {
      "products": 5
    }
  }
]
```

### POST /api/categories
Create a new category

**Request Body:**
```json
{
  "name": "New Category",
  "color": "#ff0000" // optional
}
```

**Response:**
```json
{
  "id": "category_id",
  "name": "New Category",
  "color": "#ff0000",
  "createdAt": "2025-08-07T...",
  "updatedAt": "2025-08-07T...",
  "deletedAt": null
}
```

### GET /api/categories/[id]
Get a specific category by ID

**Query Parameters:**
- `includeDeleted` (boolean, optional) - Include soft deleted categories

**Response:**
```json
{
  "id": "category_id",
  "name": "Category Name",
  "color": "#ff0000",
  "createdAt": "2025-08-07T...",
  "updatedAt": "2025-08-07T...",
  "deletedAt": null,
  "_count": {
    "products": 5
  }
}
```

### PUT /api/categories/[id]
Update a category

**Request Body:**
```json
{
  "name": "Updated Category Name", // optional
  "color": "#00ff00" // optional
}
```

**Response:**
```json
{
  "id": "category_id",
  "name": "Updated Category Name",
  "color": "#00ff00",
  "createdAt": "2025-08-07T...",
  "updatedAt": "2025-08-07T...",
  "deletedAt": null
}
```

### DELETE /api/categories/[id]
Soft delete a category (sets deletedAt to current date)

**Response:**
```json
{
  "message": "Category deleted successfully",
  "data": {
    "id": "category_id",
    "name": "Category Name",
    "color": "#ff0000",
    "createdAt": "2025-08-07T...",
    "updatedAt": "2025-08-07T...",
    "deletedAt": "2025-08-07T..."
  }
}
```

### PATCH /api/categories/[id]
Restore a soft deleted category

**Request Body:**
```json
{
  "action": "restore"
}
```

**Response:**
```json
{
  "message": "Category restored successfully",
  "data": {
    "id": "category_id",
    "name": "Category Name",
    "color": "#ff0000",
    "createdAt": "2025-08-07T...",
    "updatedAt": "2025-08-07T...",
    "deletedAt": null
  }
}
```

## Features

### Soft Delete
- Categories are never permanently deleted
- DELETE operation sets `deletedAt` to current date
- Soft deleted categories are excluded from normal queries by default
- Use `includeDeleted=true` query parameter to include soft deleted categories
- Use PATCH with `action: "restore"` to restore soft deleted categories

### Validation
- Category name is required and cannot be empty
- Category names must be unique (case-insensitive)
- Duplicate name validation excludes soft deleted categories
- Color field is optional

### Search
- Search categories by name (case-insensitive)
- Use the `search` query parameter with GET /api/categories

### Product Count
- All category responses include a count of associated products
- Count only includes active (non-deleted) products

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Usage Examples

### Create a category
```javascript
const response = await fetch('/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Electronics',
    color: '#007bff'
  })
})
```

### Get all categories
```javascript
const response = await fetch('/api/categories')
const categories = await response.json()
```

### Update a category
```javascript
const response = await fetch('/api/categories/category_id', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Electronics',
    color: '#28a745'
  })
})
```

### Soft delete a category
```javascript
const response = await fetch('/api/categories/category_id', {
  method: 'DELETE'
})
```

### Restore a category
```javascript
const response = await fetch('/api/categories/category_id', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'restore'
  })
})
```
