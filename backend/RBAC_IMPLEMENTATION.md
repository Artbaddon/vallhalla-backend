# Role-Based Access Control (RBAC) Implementation

This document describes the implementation of the role-based access control (RBAC) system in the Vallhalla API.

## Overview

The RBAC system is designed to control access to API endpoints based on user roles. It provides:

1. **Authentication**: Verifying user identity through JWT tokens
2. **Authorization**: Controlling access to resources based on user roles
3. **Resource Filtering**: Ensuring users only see data they're authorized to access

## User Roles

The system defines four primary roles:

1. **Admin (Role ID: 1)** - Full access to all system features
2. **Staff (Role ID: 2)** - Administrative staff with limited permissions
3. **Owner (Role ID: 3)** - Property owners with access to their own resources
4. **Security (Role ID: 4)** - Security personnel with specific access to visitor and parking management

## Role-Based Permissions

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

## Implementation Components

### 1. Authentication Middleware (`authMiddleware.js`)

The authentication middleware:

- Verifies JWT tokens using `verifyToken` function
- Provides role-based access control through `authMiddleware` function
- Ensures owners can only access their own resources with `ownerResourceAccess` middleware

```javascript
// Example of using authMiddleware to protect a route
router.get('/protected-route', authMiddleware([ROLES.ADMIN]), (req, res) => {
  // Only admins can access this route
});
```

### 2. RBAC Configuration (`rbacConfig.js`)

The RBAC configuration file:

- Defines role constants (ADMIN, STAFF, OWNER, SECURITY)
- Maps frontend modules to allowed roles
- Maps API endpoints to allowed roles and HTTP methods
- Provides helper functions for checking access permissions

```javascript
// Example of API access configuration
export const API_ACCESS = {
  '/api/users': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN],
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  }
};
```

### 3. API Access Middleware

The API access middleware:

- Centralizes permission checking for all API endpoints
- Uses the RBAC configuration to determine access rights
- Is applied globally to all routes in `app.js`

### 4. Controller-Level Filtering

Controllers implement additional filtering to ensure users only see authorized data:

- List endpoints filter data based on user role and ID
- Detail endpoints verify resource ownership before returning data
- Update/delete endpoints verify ownership before allowing modifications

Example:

```javascript
// Example of controller-level filtering
export const getReservations = async (req, res) => {
  try {
    let reservations;
    
    if (req.user.roleId === ROLES.ADMIN) {
      // Admins see all reservations
      reservations = await Reservation.findAll();
    } else if (req.user.roleId === ROLES.OWNER) {
      // Owners see only their reservations
      reservations = await Reservation.findAll({
        where: { owner_id: req.user.userId }
      });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

## Two-Tier Authorization Approach

The system implements a two-tier authorization approach:

### 1. Router-Level Authorization

- Applied at the router level using `authMiddleware`
- Provides coarse-grained access control based on user roles
- Prevents unauthorized access to entire routes or endpoints

Example:
```javascript
// Only admins can access user management
router.get('/users', authMiddleware([ROLES.ADMIN]), userController.getAllUsers);

// Admins and owners can view apartments
router.get('/apartments', authMiddleware([ROLES.ADMIN, ROLES.OWNER]), apartmentController.getAllApartments);
```

### 2. Controller-Level Authorization

- Applied within controller functions
- Provides fine-grained access control based on resource ownership
- Filters data to ensure users only see what they're authorized to access

Example:
```javascript
export const getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findByPk(req.params.id);
    
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    
    // If user is an owner, verify they own this apartment
    if (req.user.roleId === ROLES.OWNER && apartment.owner_id !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

## Testing the RBAC System

The system can be tested using:

1. The Postman collection included with the API
2. The test scripts in the `backend/test` directory
3. Manual testing with different user roles

## Best Practices

1. **Always apply both tiers of authorization**:
   - Use `authMiddleware` at the router level
   - Implement filtering at the controller level

2. **Verify ownership before modifications**:
   - Check resource ownership before allowing updates or deletes
   - Return 403 Forbidden if ownership verification fails

3. **Use consistent role checking**:
   - Always use the ROLES constants from rbacConfig.js
   - Avoid hardcoding role IDs in controllers or routes

4. **Log access control decisions**:
   - Log when access is denied for debugging purposes
   - Include the user ID, role, and requested resource in logs 