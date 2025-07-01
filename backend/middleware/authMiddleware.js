import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ROLES, hasApiAccess } from "./rbacConfig.js";

dotenv.config();

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
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
    verifyToken(req, res, () => {
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

      next();
    });
  };
};

// API endpoint access middleware - checks if the user has access to the specific endpoint and method
export const apiAccessMiddleware = (req, res, next) => {
  // First verify the token
  verifyToken(req, res, () => {
    const userRole = req.user.roleId;
    const endpoint = req.originalUrl;
    const method = req.method;
    
    // Check if user has access to this endpoint with this method
    if (!hasApiAccess(endpoint, method, userRole)) {
      console.log(`❌ API access denied. User role ${userRole} cannot ${method} ${endpoint}`);
      return res.status(403).json({ 
        message: "Access denied. You don't have permission to access this resource." 
      });
    }
    
    next();
  });
};

// Helper function to check specific permissions
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    // First verify the token
    verifyToken(req, res, async () => {
      try {
        const userRole = req.user.roleId;
        
        // Here you would typically check the role_permissions table
        // to see if the role has the required permission
        // This is a placeholder for the actual permission check logic
        const hasPermission = true; // Replace with actual permission check
        
        if (!hasPermission) {
          console.log(`❌ Missing permission: ${permission}`);
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
