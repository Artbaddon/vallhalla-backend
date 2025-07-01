import { connect } from "../config/db/connectMysql.js";
import { hasPermission, isAdmin, ownsResource } from "./rbacConfig.js";

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
      const userId = req.user.userId;
      console.log(`Checking if user ${userId} has permission: ${permissionName} on module: ${moduleName}`);

      // Check permission (hasPermission already includes admin check)
      const hasUserPermission = await hasPermission(connect, userId, moduleName, permissionName);
      if (hasUserPermission) {
        console.log(`✅ User has permission: ${permissionName} on module: ${moduleName}`);
        next();
      } else {
        console.log(`❌ User lacks permission: ${permissionName} on module: ${moduleName}`);
        res.status(403).json({ error: `Permission denied: ${permissionName} required for ${moduleName}` });
      }
    } catch (error) {
      console.error("❌ Permission check error:", error);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

// Middleware to check resource ownership
export const requireOwnership = (resourceType, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const resourceId = req.params[idParam];
      
      // Check ownership (ownsResource already includes admin check)
      const owns = await ownsResource(connect, userId, resourceType, resourceId);
      if (owns) {
        console.log(`✅ User has access to ${resourceType}`);
        next();
      } else {
        console.log(`❌ User does not have access to ${resourceType}`);
        res.status(403).json({ error: `Access denied: You don't have access to this ${resourceType}` });
      }
    } catch (error) {
      console.error("❌ Access check error:", error);
      res.status(500).json({ error: "Access check failed" });
    }
  };
};

// Middleware to check multiple permissions at once
export const requirePermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;

      // First check if user is admin
      const isUserAdmin = await isAdmin(connect, userId);
      if (isUserAdmin) {
        console.log("✅ User is admin, allowing access");
        return next();
      }

      // Check each permission
      for (const { module: moduleName, permission: permissionName } of permissions) {
        const hasUserPermission = await hasPermission(connect, userId, moduleName, permissionName);
        if (!hasUserPermission) {
          console.log(`❌ User lacks permission: ${permissionName} on module: ${moduleName}`);
          return res.status(403).json({ 
            error: `Permission denied: ${permissionName} required for ${moduleName}` 
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

