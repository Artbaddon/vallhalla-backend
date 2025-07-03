# Vallhalla API Reference

Complete API documentation for the Vallhalla Property Management System.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication unless specified as public. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Authentication Endpoints

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "12345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "roleId": 1,
      "roleName": "Admin"
    }
  },
  "message": "Login successful"
}
```

### Validate Token
**GET** `/auth/validate-token`

Validate current JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": 1,
      "username": "admin",
      "roleId": 1
    }
  }
}
```

### Register
**POST** `/auth/register`

Register a new user (Admin only).

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role_id": 3
}
```

## User Management

### Get All Users
**GET** `/users`

Get all users in the system (Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role_id": 1,
      "status_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get User by ID
**GET** `/users/:id`

Get specific user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role_id": 1,
    "status_id": 1,
    "profile": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  }
}
```

### Create User
**POST** `/users`

Create a new user (Admin only).

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role_id": 3,
  "status_id": 1,
  "profile": {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone": "555-123-4567"
  }
}
```

### Update User
**PUT** `/users/:id`

Update user information (Admin only).

**Request Body:**
```json
{
  "username": "updateduser",
  "role_id": 3,
  "status_id": 1
}
```

### Delete User
**DELETE** `/users/:id`

Delete user (Admin only).

## Apartment Management

### Get All Apartments
**GET** `/apartments`

Get all apartments (filtered by user role).

**Query Parameters:**
- `status_id` - Filter by status
- `tower_id` - Filter by tower
- `owner_id` - Filter by owner

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "apartment_number": "101",
      "status_id": 1,
      "tower_id": 1,
      "owner_id": 1,
      "status": {
        "id": 1,
        "name": "Occupied"
      },
      "tower": {
        "id": 1,
        "name": "Tower A"
      },
      "owner": {
        "id": 1,
        "user": {
          "username": "owner1"
        }
      }
    }
  ]
}
```

### Get Apartment by ID
**GET** `/apartments/:id`

Get specific apartment by ID.

### Create Apartment
**POST** `/apartments`

Create new apartment (Admin only).

**Request Body:**
```json
{
  "apartment_number": "102",
  "status_id": 1,
  "tower_id": 1,
  "owner_id": 1
}
```

### Update Apartment
**PUT** `/apartments/:id`

Update apartment information (Admin only).

### Delete Apartment
**DELETE** `/apartments/:id`

Delete apartment (Admin only).

## Owner Management

### Get All Owners
**GET** `/owners`

Get all owners (Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "is_tenant": false,
      "birth_date": "1990-01-01",
      "user": {
        "username": "owner1",
        "profile": {
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    }
  ]
}
```

### Get Owner by ID
**GET** `/owners/:id`

Get specific owner by ID.

### Create Owner
**POST** `/owners`

Create new owner with user and profile (Admin only).

**Request Body:**
```json
{
  "username": "newowner",
  "password": "password123",
  "user_status_id": 1,
  "role_id": 3,
  "is_tenant": false,
  "birth_date": "1990-01-01",
  "first_name": "John",
  "last_name": "Doe",
  "document_type": "CC",
  "document_number": "1234567890",
  "phone": "555-123-4567"
}
```

### Update Owner
**PUT** `/owners/:id`

Update owner information.

### Delete Owner
**DELETE** `/owners/:id`

Delete owner (Admin only).

## Payment Management

### Get All Payments
**GET** `/payments`

Get payments (Admin: all, Owner: own only).

**Query Parameters:**
- `owner_id` - Filter by owner
- `status_id` - Filter by status
- `date_from` - Filter from date
- `date_to` - Filter to date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 1000.00,
      "payment_date": "2024-01-01",
      "status_id": 1,
      "owner_id": 1,
      "reference_number": "PAY-001",
      "status": {
        "id": 1,
        "name": "Pending"
      },
      "owner": {
        "id": 1,
        "user": {
          "username": "owner1"
        }
      }
    }
  ]
}
```

### Get Payment by ID
**GET** `/payments/:id`

Get specific payment by ID.

### Create Payment
**POST** `/payments`

Create new payment (Admin, Owner). Creates a payment with status "Pending".

**Request Body:**
```json
{
  "amount": 1000.00,
  "owner_id": 1,
  "reference_number": "PAY-001"
}
```

### Process Payment
**POST** `/payments/:id/process`

Process a pending payment (Admin, Owner).

**Request Body:**
```json
{
  "method": "Credit Card",
  "payment_date": "2024-01-01"
}
```

### Update Payment Status
**PUT** `/payments/:id`

Update payment status (Admin only). Valid status transitions:
- From Pending (1) → Completed (2) or Failed (3)
- From Failed (3) → Pending (1)
- From Completed (2) → No changes allowed

**Request Body:**
```json
{
  "status_id": 2
}
```

### Get Owner Payments
**GET** `/payments/owner/:owner_id`

Get all payments for a specific owner.

### Get Pending Payments
**GET** `/payments/owner/:owner_id/pending`

Get all pending payments for a specific owner.

### Get Payment Statistics
**GET** `/payments/stats`

Get payment statistics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "total_payments": 10,
    "pending_count": 3,
    "completed_count": 6,
    "failed_count": 1,
    "total_amount": 10000.00,
    "collected_amount": 6000.00
  }
}
```

### Delete Payment
**DELETE** `/payments/:id`

Delete payment (Admin only).

## Reservation Management

### Get All Reservations
**GET** `/reservations`

Get reservations (Admin: all, Owner: own only).

**Query Parameters:**
- `owner_id` - Filter by owner
- `facility_id` - Filter by facility
- `date_from` - Filter from date
- `date_to` - Filter to date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "owner_id": 1,
      "facility_id": 1,
      "start_date": "2024-01-01T10:00:00.000Z",
      "end_date": "2024-01-01T12:00:00.000Z",
      "status_id": 1,
      "owner": {
        "id": 1,
        "user": {
          "username": "owner1"
        }
      },
      "facility": {
        "id": 1,
        "name": "Conference Room"
      }
    }
  ]
}
```

### Get My Reservations
**GET** `/reservations/my/reservations`

Get current user's reservations (Owner only).

### Get Reservation by ID
**GET** `/reservations/:id`

Get specific reservation by ID.

### Create Reservation
**POST** `/reservations`

Create new reservation (Admin, Owner).

**Request Body:**
```json
{
  "owner_id": 1,
  "facility_id": 1,
  "start_date": "2024-01-01T10:00:00.000Z",
  "end_date": "2024-01-01T12:00:00.000Z"
}
```

### Update Reservation
**PUT** `/reservations/:id`

Update reservation information (Admin, Owner).

### Delete Reservation
**DELETE** `/reservations/:id`

Delete reservation (Admin, Owner).

## PQRS Management

### Get All PQRS
**GET** `/pqrs`

Get PQRS records (Admin: all, Owner: own only).

**Query Parameters:**
- `owner_id` - Filter by owner
- `category_id` - Filter by category
- `status_id` - Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Maintenance Request",
      "description": "Need plumbing repair",
      "category_id": 1,
      "owner_id": 1,
      "status_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Maintenance"
      },
      "status": {
        "id": 1,
        "name": "Open"
      }
    }
  ]
}
```

### Get PQRS by ID
**GET** `/pqrs/:id`

Get specific PQRS by ID.

### Create PQRS
**POST** `/pqrs`

Create new PQRS (Admin, Owner).

**Request Body:**
```json
{
  "title": "Maintenance Request",
  "description": "Need plumbing repair",
  "category_id": 1,
  "owner_id": 1
}
```

### Update PQRS
**PUT** `/pqrs/:id`

Update PQRS information (Admin, Owner).

### Delete PQRS
**DELETE** `/pqrs/:id`

Delete PQRS (Admin only).

## Pet Management

### Get All Pets
**GET** `/pets`

Get pets (Admin: all, Owner: own only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Buddy",
      "species": "Dog",
      "breed": "Golden Retriever",
      "owner_id": 1,
      "vaccination_card": "vaccination_card.jpg",
      "photos": ["photo1.jpg", "photo2.jpg"],
      "owner": {
        "id": 1,
        "user": {
          "username": "owner1"
        }
      }
    }
  ]
}
```

### Get Pet by ID
**GET** `/pets/:id`

Get specific pet by ID.

### Create Pet
**POST** `/pets`

Create new pet (Admin, Owner).

**Request Body:**
```json
{
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "owner_id": 1
}
```

### Update Pet
**PUT** `/pets/:id`

Update pet information (Admin, Owner).

### Delete Pet
**DELETE** `/pets/:id`

Delete pet (Admin, Owner).

## Tenant Management

### Get All Tenants
**GET** `/tenants`

Get tenants (Admin: all, Owner: own only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jane Smith",
      "document_number": "1234567890",
      "phone": "555-123-4567",
      "owner_id": 1,
      "apartment_id": 1,
      "owner": {
        "id": 1,
        "user": {
          "username": "owner1"
        }
      }
    }
  ]
}
```

### Get Tenant by ID
**GET** `/tenants/:id`

Get specific tenant by ID.

### Create Tenant
**POST** `/tenants`

Create new tenant (Admin, Owner).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "document_number": "1234567890",
  "phone": "555-123-4567",
  "owner_id": 1,
  "apartment_id": 1
}
```

### Update Tenant
**PUT** `/tenants/:id`

Update tenant information (Admin, Owner).

### Delete Tenant
**DELETE** `/tenants/:id`

Delete tenant (Admin, Owner).

## Visitor Management

### Get All Visitors
**GET** `/visitors`

Get visitors (Admin, Security).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Visitor",
      "identification": "1234567890",
      "host_id": 1,
      "visit_date": "2024-01-01",
      "enter_time": "10:00:00",
      "exit_time": "18:00:00",
      "host": {
        "id": 1,
        "user": {
          "username": "owner1"
        }
      }
    }
  ]
}
```

### Get Visitor by ID
**GET** `/visitors/:id`

Get specific visitor by ID.

### Create Visitor
**POST** `/visitors`

Create new visitor (Admin, Security).

**Request Body:**
```json
{
  "name": "John Visitor",
  "identification": "1234567890",
  "host_id": 1,
  "visit_date": "2024-01-01"
}
```

### Update Visitor
**PUT** `/visitors/:id`

Update visitor information (Admin, Security).

### Delete Visitor
**DELETE** `/visitors/:id`

Delete visitor (Admin only).

## Parking Management

### Get All Parking
**GET** `/parking`

Get parking spaces (Admin, Security, Owner).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "space_number": "A1",
      "status_id": 1,
      "vehicle_type_id": 1,
      "user_id": 1,
      "status": {
        "id": 1,
        "name": "Available"
      },
      "vehicle_type": {
        "id": 1,
        "name": "Car"
      }
    }
  ]
}
```

### Get Parking by ID
**GET** `/parking/:id`

Get specific parking space by ID.

### Reserve Parking
**POST** `/parking/reserve`

Reserve parking space (Admin, Owner).

**Request Body:**
```json
{
  "space_id": 1,
  "user_id": 1,
  "vehicle_type_id": 1
}
```

### Update Parking
**PUT** `/parking/:id`

Update parking information (Admin, Security).

### Delete Parking
**DELETE** `/parking/:id`

Delete parking space (Admin only).

## Notification Management

### Get All Notifications
**GET** `/notifications`

Get all notifications (Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type_id": 2,
      "type_name": "Payment",
      "description": "Payment status updated: PAY-001 is now COMPLETED",
      "user_id": 5,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get My Notifications
**GET** `/notifications/me`

Get notifications for the current user.

### Get Notification by ID
**GET** `/notifications/:id`

Get specific notification by ID.

### Create Notification
**POST** `/notifications`

Create new notification (Admin only).

**Request Body:**
```json
{
  "type_id": 2,
  "description": "New payment reminder",
  "user_id": 5  // Set to 0 for system-wide notification
}
```

### Update Notification
**PUT** `/notifications/:id`

Update notification (Admin only).

### Delete Notification
**DELETE** `/notifications/:id`

Delete notification (Admin only).

### Get Notification Statistics
**GET** `/notifications/stats`

Get notification statistics by type (Admin only).

## Survey Management

### Get All Surveys
**GET** `/surveys`

Get surveys (Admin: all, Owner: available).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Satisfaction Survey",
      "description": "Rate your experience",
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "questions": [
        {
          "id": 1,
          "question": "How satisfied are you?",
          "type": "rating",
          "options": ["1", "2", "3", "4", "5"]
        }
      ]
    }
  ]
}
```

### Get Survey by ID
**GET** `/surveys/:id`

Get specific survey by ID.

### Respond to Survey
**POST** `/surveys/:id/respond`

Submit survey response (Admin, Owner).

**Request Body:**
```json
{
  "responses": [
    {
      "question_id": 1,
      "answer": "5"
    }
  ]
}
```

## Profile Management

### Get My Profile
**GET** `/profile/me`

Get current user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "address": "123 Main St",
    "document_type_id": 1,
    "document_number": "1234567890",
    "birth_date": "1990-01-01",
    "photo_url": "profile.jpg"
  }
}
```

### Update Profile
**PUT** `/profile/:id`

Update profile information.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-123-4567"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `DATABASE_ERROR` | Database operation failed |
| `FILE_UPLOAD_ERROR` | File upload failed |
| `DUPLICATE_ENTRY` | Resource already exists |

## Rate Limiting

API endpoints are subject to rate limiting:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## File Upload

For endpoints that support file uploads:

**Content-Type:** `multipart/form-data`

**Supported file types:**
- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Maximum file size: 5MB

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "uploaded_file.jpg",
    "url": "/uploads/uploaded_file.jpg",
    "size": 1024000
  }
}
``` 