# Package Delivery Module - Vallhalla API

This module provides a complete package delivery management system for the Vallhalla residential complex, integrating MongoDB for package storage with the existing MySQL user management system.

## Overview

The package delivery module allows:
- **Guards** to register and manage incoming packages, bills, and deliveries
- **Owners** to view their packages and mark them as received
- **Complete audit trail** of package delivery lifecycle
- **MongoDB aggregations** for analytics and reporting

## Database Architecture

- **MySQL**: User authentication, owner/guard management (existing system)
- **MongoDB**: Package storage with schema validation, CRUD operations, and aggregations

## Requirements Compliance

✅ **Schema Validation (MongoDB)**: Complete validation with required fields, enums, and constraints  
✅ **CRUD Operations**: Full Create, Read, Update, Delete functionality  
✅ **Aggregations**: Multiple aggregation pipelines for statistics and reporting

## API Endpoints

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Package Registration (Guards Only)
```http
POST /api/packages/register
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "recipient_owner_id": 123,
  "recipient_apartment": "502",
  "recipient_tower": "A",
  "sender_name": "Amazon",
  "sender_company": "Amazon Logistics",
  "description": "Electronics package",
  "package_type": "package",
  "size": "medium",
  "weight": 2.5,
  "guard_notes": "Left at main entrance"
}
```

### Get Packages (Guards see all, Owners see their own)
```http
GET /api/packages?status=pending&page=1&limit=10
Authorization: Bearer <jwt_token>
```

### Get Package by ID
```http
GET /api/packages/:id
Authorization: Bearer <jwt_token>
```

### Update Package Status
```http
PUT /api/packages/:id/status
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "status": "delivered",
  "delivery_notes": "Delivered to owner personally",
  "recipient_signature": "John Doe"
}
```

### Owner's Packages
```http
GET /api/packages/my-packages
Authorization: Bearer <jwt_token>
```

### Analytics (Guards Only)

#### Package Statistics
```http
GET /api/packages/stats
Authorization: Bearer <jwt_token>
```

#### Monthly Report
```http
GET /api/packages/monthly-report?year=2024
Authorization: Bearer <jwt_token>
```

#### Owner Summary
```http
GET /api/packages/owner-summary
Authorization: Bearer <jwt_token>
```

## Schema Validation

### Package Schema (MongoDB)
```javascript
{
  package_id: String (required, unique),
  package_type: Enum ['package', 'bill', 'letter', 'food_delivery', 'other'],
  recipient_owner_id: Number (required, references MySQL owners),
  recipient_apartment: String (required),
  recipient_tower: String (required),
  sender_name: String (required, max 100 chars),
  sender_company: String (optional, max 100 chars),
  description: String (required, max 500 chars),
  size: Enum ['small', 'medium', 'large', 'extra_large'],
  weight: Number (0-100 kg),
  received_by_guard: {
    guard_id: Number (required, references MySQL users),
    received_at: Date (required),
    notes: String (max 300 chars)
  },
  delivery_status: Enum ['pending', 'notified', 'delivered', 'returned'],
  delivered_to_owner: {
    delivered_at: Date,
    delivered_by_guard: Number (references MySQL users),
    recipient_signature: String,
    delivery_notes: String (max 300 chars)
  },
  photos: Array of {
    filename: String,
    url: String,
    uploaded_at: Date
  }
}
```

## MongoDB Aggregation Examples

### Status Statistics
```javascript
PackageDelivery.aggregate([
  {
    $group: {
      _id: '$delivery_status',
      count: { $sum: 1 },
      latest_delivery: { $max: '$received_by_guard.received_at' }
    }
  },
  { $sort: { count: -1 } }
])
```

### Monthly Delivery Report
```javascript
PackageDelivery.aggregate([
  {
    $group: {
      _id: {
        year: { $year: '$received_by_guard.received_at' },
        month: { $month: '$received_by_guard.received_at' }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
])
```

### Owner Package Summary
```javascript
PackageDelivery.aggregate([
  {
    $group: {
      _id: '$recipient_owner_id',
      total_packages: { $sum: 1 },
      pending_packages: {
        $sum: { $cond: [{ $eq: ['$delivery_status', 'pending'] }, 1, 0] }
      },
      delivered_packages: {
        $sum: { $cond: [{ $eq: ['$delivery_status', 'delivered'] }, 1, 0] }
      }
    }
  }
])
```

## Access Control

### Guards
- Register new packages
- View all packages
- Update package status
- Access analytics and reports
- Delete packages

### Owners
- View only their own packages
- Mark packages as received (delivered status)
- Cannot register or delete packages

### Validation
- Package data validation on registration
- Status update validation
- User role-based access control
- Owner data access restrictions

## Installation & Setup

1. **Install MongoDB dependency**:
   ```bash
   npm install mongoose
   ```

2. **Add environment variables**:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/vallhalla_packages
   ```

3. **Start MongoDB** (if local):
   ```bash
   mongod
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

## Files Structure

```
backend/
├── config/db/
│   ├── connectMysql.js      # Existing MySQL connection
│   └── connectMongoDB.js    # New MongoDB connection
├── models/
│   └── packages.model.js    # MongoDB package schema
├── controllers/
│   └── packageDelivery.controller.js  # Package CRUD + aggregations
├── middleware/
│   └── packageAuthMiddleware.js       # Authentication & validation
├── routers/
│   └── packageDelivery.router.js      # API routes
└── app/app.js               # Updated to include package routes
```

## Integration with Flutter Mobile App

This backend is designed to work seamlessly with a Flutter mobile application for guards to:
- Scan package barcodes
- Take photos of packages
- Register deliveries on the go
- Notify owners of package arrivals
- Track delivery status in real-time

The API returns JSON responses suitable for mobile consumption and includes proper error handling and validation for mobile clients.
