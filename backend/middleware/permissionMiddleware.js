
// Unified RBAC Middleware
// NOTE: This file uses rbacConfig.js as the single source of truth.
// Do NOT reintroduce PermissionsModel or duplicate permission logic.
// If new patterns are needed, extend rbacConfig helpers.
import { hasPermission, isAdmin, ownsResource, getUserRoleId, ROLES } from "./rbacConfig.js";
import { connect } from "../config/db/connectMysql.js";

// Utility to normalize module names (lowercase)
export const normalizeModule = (m) => (m ? String(m).trim().toLowerCase() : '');

// Middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log("Checking if user", userId, "is admin");

    const isUserAdmin = await isAdmin(connect, userId);
    if (isUserAdmin) {
      console.log("✅ User is admin, allowing access");
      next();
    } else {
      console.log("❌ User is not admin, blocking access");
      res.status(403).json({ error: "Admin access required" });
    }
  } catch (error) {
    console.error("❌ Admin check error:", error);
    res.status(500).json({ error: "Permission check failed" });
  }
};

// Middleware to check for specific module permission
export const requirePermission = (moduleName, permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const mod = normalizeModule(moduleName);
      const perm = normalizeModule(permissionName);
      console.log(`Checking permission user=${userId} ${perm} on module: ${mod}`);

      // Check permission (hasPermission already includes admin check)
      const hasUserPermission = await hasPermission(connect, userId, mod, perm);
      if (hasUserPermission) {
        console.log(`✅ User has permission: ${perm} on module: ${mod}`);
        next();
      } else {
        console.log(`❌ User lacks permission: ${perm} on module: ${mod}`);
        res.status(403).json({ error: `Permission denied: ${perm} required for ${mod}` });
      }
    } catch (error) {
      console.error("❌ Permission check error:", error);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

// Middleware to check resource ownership with options
// options: { idParam, bypassRoles, bypassResources, allowSelfForUser }
export const requireOwnership = (resourceType, idParam = 'id', options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const resourceId = req.params[idParam];
      if (!resourceId) return res.status(400).json({ error: 'Missing resource id' });

      // Self-access for user resource (avoid separate DB hit)
      if (options.allowSelfForUser && resourceType === 'user' && String(resourceId) === String(userId)) {
        console.log('✅ Self user access allowed');
        return next();
      }

      const owns = await ownsResource(connect, userId, resourceType, resourceId, {
        bypassRoles: options.bypassRoles,
        bypassResources: options.bypassResources
      });
      if (owns) {
        console.log(`✅ User has access to ${resourceType}`);
        return next();
      }
      console.log(`❌ User does not have access to ${resourceType}`);
      return res.status(403).json({ error: `Access denied: You don't have access to this ${resourceType}` });
    } catch (error) {
      console.error('❌ Access check error:', error);
      res.status(500).json({ error: 'Access check failed' });
    }
  };
};

// Middleware to check multiple permissions at once
export const requirePermissions = (permissions) => {
  return async (req, res, next) => {
    try {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // First check if user is admin
      const isUserAdmin = await isAdmin(connect, userId);
      if (isUserAdmin) {
        console.log("✅ User is admin, allowing access");
        return next();
      }

      // Check each permission
      for (const { module: moduleName, permission: permissionName } of permissions) {
        const mod = normalizeModule(moduleName);
        const perm = normalizeModule(permissionName);
        const hasUserPermission = await hasPermission(connect, userId, mod, perm);
        if (!hasUserPermission) {
          console.log(`❌ User lacks permission: ${perm} on module: ${mod}`);
          return res.status(403).json({ 
            error: `Permission denied: ${perm} required for ${mod}` 
          });
        }
      }

      console.log("✅ User has all required permissions");
      next();
    } catch (error) {
      console.error("❌ Permission check error:", error);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

// Composite middleware: { module, permission, ownership: { resourceType, idParam, options } }
export const requireAccess = ({ module: moduleName, permission, ownership }) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const mod = normalizeModule(moduleName);
      const perm = normalizeModule(permission);

      const hasPerm = await hasPermission(connect, userId, mod, perm);
      if (!hasPerm) {
        return res.status(403).json({ error: `Permission denied: ${perm} required for ${mod}` });
      }

      if (ownership) {
        const { resourceType, idParam = 'id', options = {} } = ownership;
        const resourceId = req.params[idParam];
        if (!resourceId) return res.status(400).json({ error: 'Missing resource id' });
        const owns = await ownsResource(connect, userId, resourceType, resourceId, options);
        if (!owns) {
          return res.status(403).json({ error: `Access denied: Not owner of ${resourceType}` });
        }
      }
      next();
    } catch (e) {
      console.error('requireAccess error:', e);
      res.status(500).json({ error: 'Access check failed' });
    }
  };
};