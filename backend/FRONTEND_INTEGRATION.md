# Frontend Integration Guide

This document provides guidance for frontend developers on how to integrate with the Vallhalla API's role-based access control (RBAC) system.

## User Roles

The system has the following user roles:

1. **Admin (Role ID: 1)** - Full access to all system features
2. **Staff (Role ID: 2)** - Administrative staff with limited permissions
3. **Owner (Role ID: 3)** - Property owners with access to their own resources
4. **Security (Role ID: 4)** - Security personnel with specific access to visitor and parking management

## Role-Based Access

### Admin Access
- **Full CRUD access** to all resources in the system
- Can manage users, roles, permissions, apartments, owners, payments, etc.
- Has access to all administrative dashboards and reports

### Owner Access
- **Dashboard:** Can view main dashboard with news and announcements
- **Profile:** Can view and update their own profile
- **Apartments:** Can view apartment information but not modify it
- **Parking:** 
  - Can view all parking spaces
  - Can view detailed info only for unoccupied spaces
  - Can reserve and pay for parking spaces
- **Payments:** Can view and make payments for their properties
- **Pets:** Can create, read, update, and delete their own pets
- **Tenants:** Can create, read, update, and delete their own tenants
- **PQRS:** Can create and view their own petitions, complaints, and claims
- **Reservations:** 
  - Can make reservations for facilities
  - Can view all reservations in a calendar
  - Can view and delete their own reservations
- **Surveys:** Can view and respond to surveys

### Security/Guard Access
- **Visitors:** Can register and manage visitors
- **Parking:** Can view and assign parking spaces
- **Profile:** Can view and update their own profile

## Frontend Module Structure

The frontend is organized into three main sections:

### Admin Section (`/admin/*`)
- Dashboard
- Apartments management
- Owner management
- User management
- Payment management
- PQRS management
- Reservation management
- Visitor management
- Survey management
- Parking management
- Pet management
- Tenant management
- Role and permission management

### Owner Section (`/owner/*`)
- Dashboard
- Profile management
- Parking management
- Payment management
- Pet management
- Tenant management
- PQRS management
- Reservation management
- Survey responses

### Security/Guard Section (`/guard/*`)
- Dashboard
- Profile management
- Visitor management
- Parking management

## Authentication Flow

1. **Login:** Users authenticate via `/api/auth/login` to receive a JWT token
2. **Token Storage:** Store the token securely (HTTP-only cookies or secure localStorage)
3. **API Requests:** Include the token in the Authorization header for all API requests
   ```
   Authorization: Bearer <token>
   ```
4. **Token Validation:** The server validates the token and checks permissions for each request
5. **Token Refresh:** Implement token refresh logic if tokens expire

## Resource Access Control

### Owner Resource Access
Owners can only access their own resources. The API enforces this by:

1. Filtering list endpoints to only return resources owned by the requesting user
2. Validating ownership on single-resource endpoints
3. Automatically associating created resources with the authenticated owner

### Examples:

#### Owner viewing their reservations:
```javascript
// Frontend code
async function getMyReservations() {
  const response = await fetch('/api/reservations/my/reservations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}
```

#### Owner creating a new pet:
```javascript
// Frontend code
async function createPet(petData) {
  const response = await fetch('/api/pets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(petData)
  });
  return response.json();
}
```

## Error Handling

The API returns standard HTTP status codes for access control:

- **401 Unauthorized:** Missing or invalid token
- **403 Forbidden:** Valid token but insufficient permissions
- **404 Not Found:** Resource doesn't exist or user doesn't have access

Frontend applications should handle these errors appropriately, such as:
- Redirecting to login page for 401 errors
- Showing permission denied messages for 403 errors
- Displaying appropriate "not found" messages for 404 errors

## Testing Access Control

You can test the access control system using the Postman collection included with the API. The collection includes:

1. Authentication requests to get tokens for different user roles
2. Examples of accessing protected resources
3. Tests for permission validation

## Additional Resources

- See `backend/middleware/rbacConfig.js` for the complete mapping of API endpoints to roles
- See `backend/RBAC_IMPLEMENTATION.md` for details on the backend implementation 