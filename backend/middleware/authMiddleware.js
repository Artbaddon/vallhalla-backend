import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ROLES } from "./rbacConfig.js";
import PermissionsModel from "../models/permissions.model.js";
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

        // Get user's permissions from the database
        const userPermissions = await PermissionsModel.getUserPermissions(userRole);
        req.userPermissions = userPermissions;

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
      const userRole = req.user.roleId;
      const endpoint = req.originalUrl;
      const method = req.method;
      
      // Extract module name from endpoint (e.g., /api/users -> users)
      const moduleName = endpoint.split('/')[2];
      
      // Map HTTP methods to permission names
      const methodPermissionMap = {
        'GET': 'read',
        'POST': 'create',
        'PUT': 'update',
        'DELETE': 'delete'
      };
      
      const permissionName = methodPermissionMap[method];
      
      // Check if user has the required permission for this module
      const hasPermission = await PermissionsModel.checkPermission(userRole, moduleName, permissionName);
      
      if (!hasPermission) {
        console.log(`❌ API access denied. User role ${userRole} cannot ${method} ${endpoint}`);
        return res.status(403).json({ 
          message: "Access denied. You don't have permission to access this resource." 
        });
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
        const userRole = req.user.roleId;
        
        // Check the permission in the database
        const hasPermission = await PermissionsModel.checkPermission(userRole, moduleName, permissionName);
        
        if (!hasPermission) {
          console.log(`❌ Missing permission: ${moduleName}:${permissionName}`);
          return res.status(403).json({ 
            message: "Access denied. Missing required permission." 
          });
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
