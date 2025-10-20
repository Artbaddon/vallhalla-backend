/**
 * Permission-Based Access Control Configuration (Static)
 * Temporary fix: defines role capabilities without touching the database.
 */

// Define role constants for easier reference
export const ROLES = {
  ADMIN: 1,
  OWNER: 2,
  SECURITY: 3,
};

const normalize = (value) => (value ? String(value).trim().toLowerCase() : "");

const OWNER_RULES = {
  owners: ["read", "update"],
  tenants: ["create", "read", "update", "delete"],
  reservations: ["create", "read", "update", "delete"],
  reservation: ["create", "read", "update", "delete"], // Add singular form with full permissions
  facilities: ["read"],
  facility: ["read"], // Add singular form
  "reservation-types": ["read"],
  "reservation-type": ["read"], // Add singular form
  reservationtypes: ["read"], // Add without hyphen
  reservationtype: ["read"], // Add singular without hyphen
  "reservation-status": ["read"],
  reservationstatus: ["read"], // Add without hyphen
  parking: ["read", "update"],
  pets: ["create", "read", "update", "delete"],
  pqrs: ["create", "read", "update"],
  surveys: ["read", "create"],
  payments: ["create", "read", "update"],
  payment: ["create", "read", "update"], // Add singular form

  notifications: ["read"],
  profile: ["read", "update"], // Singular form
  profiles: ["read", "update"],
  questions: ["read"],
  answers: ["create", "read", "update"],
  pqrscategories: ["read"],
  pqrs: ["create", "read", "update"],
  pqrscategory: ["read"],
  parking: ["read", "update"],
  "vehicle-type": ["read"],
  "vehicle-types": ["read"],


};
const SECURITY_RULES = {
  visitors: ["create", "read", "update", "delete"],
  parking: ["read"],
  profile: ["read", "update"], // Singular form
  profiles: ["read", "update"],
   owners: ["read"],
};

const RAW_RULES = {
  [ROLES.OWNER]: OWNER_RULES,
  [ROLES.SECURITY]: SECURITY_RULES,
};

const buildPermissionIndex = (rules) => {
  const index = {};
  Object.entries(rules || {}).forEach(([moduleName, permissions]) => {
    const moduleKey = normalize(moduleName);
    if (!moduleKey) return;
    index[moduleKey] = new Set((permissions || []).map(normalize));
  });
  return index;
};

const ROLE_PERMISSION_INDEX = Object.fromEntries(
  Object.entries(RAW_RULES).map(([roleId, rules]) => [roleId, buildPermissionIndex(rules)])
);

const ALL_DECLARED_PERMISSIONS = (() => {
  const entries = [];
  Object.values(RAW_RULES).forEach((rules) => {
    Object.entries(rules).forEach(([moduleName, permissions]) => {
      permissions.forEach((permission) => {
        entries.push({
          module_name: normalize(moduleName),
          Permissions_name: normalize(permission),
        });
      });
    });
  });
  return entries;
})();

const extractRoleId = (userContext) => {
  if (userContext == null) return null;
  if (typeof userContext === "number") return userContext;
  if (typeof userContext === "string" && !Number.isNaN(Number(userContext))) {
    return Number(userContext);
  }
  if (typeof userContext === "object") {
    if (userContext.roleId != null) return Number(userContext.roleId);
    if (userContext.Role_id != null) return Number(userContext.Role_id);
    if (userContext.Role_FK_ID != null) return Number(userContext.Role_FK_ID);
  }
  return null;
};

export function isAdmin(userContext) {
  return extractRoleId(userContext) === ROLES.ADMIN;
}

export function getUserRoleId(userContext) {
  return extractRoleId(userContext);
}

export function hasPermission(userContext, moduleName, permissionName) {
  const roleId = extractRoleId(userContext);
  const moduleKey = normalize(moduleName);
  const permissionKey = normalize(permissionName);

  // Debug logging
  console.log('🔒 RBAC Check:', {
    roleId,
    moduleKey,
    permissionKey,
    userContext: JSON.stringify(userContext)
  });

  if (!roleId || !moduleKey || !permissionKey) {
    console.log('❌ Missing required data');
    return false;
  }
  if (roleId === ROLES.ADMIN) {
    console.log('✅ Admin access granted');
    return true;
  }

  const permissions = ROLE_PERMISSION_INDEX[roleId];
  if (!permissions) {
    console.log('❌ No permissions found for roleId:', roleId);
    return false;
  }

  const modulePermissions = permissions[moduleKey];
  if (!modulePermissions) {
    console.log('❌ No module permissions found for:', moduleKey);
    console.log('Available modules:', Object.keys(permissions));
    return false;
  }

  const hasAccess = modulePermissions.has(permissionKey);
  console.log(hasAccess ? '✅ Access granted' : '❌ Access denied');
  return hasAccess;
}

export function getUserPermissions(userContext) {
  const roleId = extractRoleId(userContext);
  if (!roleId) return [];
  if (roleId === ROLES.ADMIN) {
    return [
      {
        module_name: "*",
        Permissions_name: "*",
      },
    ];
  }

  const permissions = ROLE_PERMISSION_INDEX[roleId];
  if (!permissions) return [];

  return Object.entries(permissions).flatMap(([moduleName, permissionSet]) =>
    Array.from(permissionSet).map((perm) => ({ module_name: moduleName, Permissions_name: perm }))
  );
}

export function ownsResource(userContext, resourceType, resourceId, options = {}) {
  const roleId = extractRoleId(userContext);
  if (!roleId) return false;
  if (roleId === ROLES.ADMIN) return true;

  const { bypassRoles = [], bypassResources = [] } = options;
  const normalizedResource = normalize(resourceType);

  if (bypassRoles.includes(roleId) && bypassResources.map(normalize).includes(normalizedResource)) {
    return true;
  }

  if (roleId === ROLES.OWNER) {
    // Without DB checks we rely on basic heuristics.
    if (normalizedResource === "user") {
      return String(resourceId) === String(userContext?.userId ?? userContext?.Users_id);
    }

    const ownerIdFromToken = userContext?.Owner_id ?? userContext?.ownerId;
    if (normalizedResource === "owner" && ownerIdFromToken != null) {
      return String(resourceId) === String(ownerIdFromToken);
    }

    // Fallback: owners can access their related resources; controllers must enforce detail filtering.
    return true;
  }

  if (roleId === ROLES.SECURITY) {
    // Security staff generally shouldn't own non-security resources.
    return false;
  }

  return false;
}

// Expose helper for debugging purposes
export function listDeclaredPermissions() {
  return ALL_DECLARED_PERMISSIONS;
}

