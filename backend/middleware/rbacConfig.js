/**
 * Role-Based Access Control Configuration
 * 
 * This file defines the mapping between frontend modules and backend endpoints,
 * specifying which roles have access to which resources.
 */

// Define role constants
export const ROLES = {
  ADMIN: 1,
  STAFF: 2,
  OWNER: 3,
  SECURITY: 4
};

// Define module access by role
export const MODULE_ACCESS = {
  // Admin modules - Admin can access everything
  'admin/dashboard': [ROLES.ADMIN],
  'admin/apartments': [ROLES.ADMIN],
  'admin/guard': [ROLES.ADMIN],
  'admin/notifications': [ROLES.ADMIN],
  'admin/owners': [ROLES.ADMIN],
  'admin/payments': [ROLES.ADMIN],
  'admin/pqrs': [ROLES.ADMIN],
  'admin/reservations': [ROLES.ADMIN],
  'admin/users': [ROLES.ADMIN],
  'admin/roles': [ROLES.ADMIN],
  'admin/permissions': [ROLES.ADMIN],
  'admin/surveys': [ROLES.ADMIN],
  'admin/pets': [ROLES.ADMIN],
  'admin/tenants': [ROLES.ADMIN],
  'admin/parking': [ROLES.ADMIN],
  'admin/visitors': [ROLES.ADMIN],
  
  // Owner modules
  'owner/dashboard': [ROLES.ADMIN, ROLES.OWNER],
  'owner/parking': [ROLES.ADMIN, ROLES.OWNER],
  'owner/payments': [ROLES.ADMIN, ROLES.OWNER],
  'owner/pets': [ROLES.ADMIN, ROLES.OWNER],
  'owner/tenants': [ROLES.ADMIN, ROLES.OWNER],
  'owner/pqrs': [ROLES.ADMIN, ROLES.OWNER],
  'owner/profile': [ROLES.ADMIN, ROLES.OWNER],
  'owner/reservations': [ROLES.ADMIN, ROLES.OWNER],
  'owner/surveys': [ROLES.ADMIN, ROLES.OWNER],
  
  // Security/Guard modules
  'guard/dashboard': [ROLES.ADMIN, ROLES.SECURITY],
  'guard/parking': [ROLES.ADMIN, ROLES.SECURITY],
  'guard/profile': [ROLES.ADMIN, ROLES.SECURITY],
  'guard/visitors': [ROLES.ADMIN, ROLES.SECURITY]
};

// Define API endpoint access by role
export const API_ACCESS = {
  // User management
  '/api/users': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN],
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/users/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER, ROLES.SECURITY], // With owner resource access
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/users/me/profile': {
    'GET': [ROLES.ADMIN, ROLES.OWNER, ROLES.SECURITY]
  },
  
  // Owner management
  '/api/owners': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN],
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/owners/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'DELETE': [ROLES.ADMIN]
  },
  '/api/owners/me/profile': {
    'GET': [ROLES.ADMIN, ROLES.OWNER]
  },
  
  // Apartment management
  '/api/apartments': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // Filtered for owners
    'POST': [ROLES.ADMIN],
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/apartments/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  
  // Reservation management
  '/api/reservations': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN, ROLES.OWNER],
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/reservations/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'DELETE': [ROLES.ADMIN, ROLES.OWNER] // Owners can delete their own reservations
  },
  '/api/reservations/my/reservations': {
    'GET': [ROLES.ADMIN, ROLES.OWNER]
  },
  '/api/reservations/date-range': {
    'GET': [ROLES.ADMIN, ROLES.OWNER]
  },
  
  // Payment management
  '/api/payments': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN, ROLES.OWNER], // Owners can make payments
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/payments/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/payments/owner/:owner_id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER] // Owners can view their own payments
  },
  
  // PQRS management
  '/api/pqrs': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN, ROLES.OWNER], // Owners can create PQRS
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/pqrs/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access for updates
    'DELETE': [ROLES.ADMIN]
  },
  '/api/pqrs/owner/:owner_id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER] // Owners can view their own PQRS
  },
  
  // Visitor management
  '/api/visitors': {
    'GET': [ROLES.ADMIN, ROLES.SECURITY],
    'POST': [ROLES.ADMIN, ROLES.SECURITY], // Security can register visitors
    'PUT': [ROLES.ADMIN, ROLES.SECURITY],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/visitors/:id': {
    'GET': [ROLES.ADMIN, ROLES.SECURITY, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN, ROLES.SECURITY],
    'DELETE': [ROLES.ADMIN]
  },
  
  // Parking management
  '/api/parking': {
    'GET': [ROLES.ADMIN, ROLES.SECURITY, ROLES.OWNER], // All can view parking
    'POST': [ROLES.ADMIN],
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/parking/:id': {
    'GET': [ROLES.ADMIN, ROLES.SECURITY, ROLES.OWNER], // All can view specific parking
    'PUT': [ROLES.ADMIN, ROLES.SECURITY], // Security can assign parking
    'DELETE': [ROLES.ADMIN]
  },
  '/api/parking/reserve': {
    'POST': [ROLES.ADMIN, ROLES.OWNER] // Owners can reserve parking
  },
  '/api/parking/available': {
    'GET': [ROLES.ADMIN, ROLES.SECURITY, ROLES.OWNER] // All can view available parking
  },
  
  // Pet management
  '/api/pets': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN, ROLES.OWNER], // Owners can register pets
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/pets/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN, ROLES.OWNER], // Owners can update their pets
    'DELETE': [ROLES.ADMIN, ROLES.OWNER] // Owners can delete their pets
  },
  '/api/pets/owner/:owner_id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER] // Owners can view their own pets
  },
  
  // Tenant management
  '/api/tenants': {
    'GET': [ROLES.ADMIN],
    'POST': [ROLES.ADMIN, ROLES.OWNER], // Owners can register tenants
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/tenants/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // With owner resource access
    'PUT': [ROLES.ADMIN, ROLES.OWNER], // Owners can update their tenants
    'DELETE': [ROLES.ADMIN, ROLES.OWNER] // Owners can delete their tenants
  },
  '/api/tenants/owner/:owner_id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER] // Owners can view their own tenants
  },
  
  // Survey management
  '/api/surveys': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // Owners can view surveys
    'POST': [ROLES.ADMIN],
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/surveys/:id': {
    'GET': [ROLES.ADMIN, ROLES.OWNER], // Owners can view specific surveys
    'PUT': [ROLES.ADMIN],
    'DELETE': [ROLES.ADMIN]
  },
  '/api/surveys/:id/respond': {
    'POST': [ROLES.ADMIN, ROLES.OWNER] // Owners can respond to surveys
  }
};

// Helper function to check if a role has access to a specific API endpoint and method
export function hasApiAccess(endpoint, method, roleId) {
  // Find the most specific matching endpoint pattern
  const matchingEndpoint = Object.keys(API_ACCESS)
    .filter(pattern => {
      // Convert pattern to regex by replacing :id with any character match
      const regexPattern = pattern
        .replace(/:\w+/g, '[^/]+')
        .replace(/\//g, '\\/');
      
      return new RegExp(`^${regexPattern}$`).test(endpoint);
    })
    .sort((a, b) => b.length - a.length)[0]; // Sort by specificity (length)
  
  if (!matchingEndpoint) return false;
  
  const methodAccess = API_ACCESS[matchingEndpoint][method.toUpperCase()];
  return methodAccess && methodAccess.includes(roleId);
}

// Helper function to check if a role has access to a specific frontend module
export function hasModuleAccess(module, roleId) {
  return MODULE_ACCESS[module] && MODULE_ACCESS[module].includes(roleId);
} 