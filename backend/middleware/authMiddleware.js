import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ROLES, hasPermission, getUserPermissions } from "./rbacConfig.js";
import { connect } from "../config/db/connectMysql.js";

dotenv.config();

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;

    // Debug logging
    console.log('Decoded token:', decoded);
    console.log('User object after decode:', req.user);

    // If user is an owner, fetch their owner_id
    if (decoded.Role_name === 'OWNER') {
      const [rows] = await connect.query(
        'SELECT Owner_id FROM owner WHERE User_FK_ID = ?',
        [decoded.userId]
      );
      if (rows && rows[0]) {
        req.user.Owner_id = rows[0].Owner_id;
      }
    }

    // More debug logging
    console.log('Final user object:', req.user);

    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    res.status(400).json({ message: "Invalid token." });
  }
};

// Role-based authentication middleware
export const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // First verify the token
    verifyToken(req, res, async () => {
      try {
        // If no specific roles are required, just having a valid token is enough
        if (!allowedRoles.length) {
          return next();
        }

        const userRole = req.user.roleId;
        
        // Check if user's role is in the allowed roles list
        if (!allowedRoles.includes(userRole)) {
          console.log(`❌ Access denied. User role ${userRole} not in allowed roles: [${allowedRoles}]`);
          return res.status(403).json({ 
            message: "Access denied. You don't have permission to access this resource." 
          });
        }

      // Prefetch user permissions (by userId not role) for downstream use
      req.userPermissions = await getUserPermissions(connect, req.user.userId);

        next();
      } catch (error) {
        console.error('Error in auth middleware:', error);
        res.status(500).json({ message: "Internal server error during authorization." });
      }
    });
  };
};

// API endpoint access middleware - checks if the user has access to the specific endpoint and method
export const apiAccessMiddleware = (req, res, next) => {
  // First verify the token
  verifyToken(req, res, async () => {
    try {
      const endpoint = req.originalUrl.split('?')[0];
      const method = req.method;
      // Expect /api/<module>/...
      const parts = endpoint.split('/').filter(Boolean);
      const moduleName = (parts[1] || '').toLowerCase(); // parts[0] == 'api'
      const methodPermissionMap = { GET: 'read', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' };
      const permissionName = methodPermissionMap[method];
      if (!moduleName || !permissionName) {
        return res.status(400).json({ message: 'Cannot derive module/permission from request' });
      }
      const ok = await hasPermission(connect, req.user.userId, moduleName, permissionName);
      if (!ok) {
        console.log(`❌ API access denied. userId ${req.user.userId} lacks ${permissionName}:${moduleName}`);
        return res.status(403).json({ message: `Access denied. Need ${permissionName} on ${moduleName}` });
      }
      next();
    } catch (error) {
      console.error('Error in API access middleware:', error);
      res.status(500).json({ message: "Internal server error during authorization." });
    }
  });
};

// Helper function to check specific permissions
export const checkPermission = (moduleName, permissionName) => {
  return async (req, res, next) => {
    // First verify the token
    verifyToken(req, res, async () => {
      try {
        const ok = await hasPermission(connect, req.user.userId, moduleName.toLowerCase(), permissionName.toLowerCase());
        if (!ok) {
          console.log(`❌ Missing permission: ${moduleName}:${permissionName} for user ${req.user.userId}`);
          return res.status(403).json({ message: "Access denied. Missing required permission." });
        }
        next();
      } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({ message: "Error checking permissions." });
      }
    });
  };
};

// Owner resource access middleware - ensures owners can only access their own data
export const ownerResourceAccess = (paramIdField = 'id', userIdField = 'userId') => {
  return (req, res, next) => {
    // This middleware should be used after verifyToken
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const resourceId = req.params[paramIdField];
    const userId = req.user[userIdField];
    const roleId = req.user.roleId;
    
    // Admins can access any resource
    if (roleId === ROLES.ADMIN) {
      return next();
    }
    
    // For owners, check if they're accessing their own resource
    if (roleId === ROLES.OWNER) {
      // Store the user ID for later use in the controller
      req.ownerId = userId;
      
      // If there's no specific resource ID in the URL, let the controller handle filtering
      if (!resourceId) {
        return next();
      }
      
      // For specific resource access, the controller should verify ownership
      return next();
    }
    
    // For other roles, let the controller decide
    next();
  };
};
