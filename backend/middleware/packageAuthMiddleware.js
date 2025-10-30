import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import OwnerModel from '../models/owner.model.js';
import dotenv from 'dotenv';

dotenv.config();

class PackageAuthMiddleware {
  
  // Authenticate user using existing JWT system
  static async authenticateUser(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Access denied. No token provided.' 
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user from MySQL to ensure they still exist and are active
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (user.User_status_FK_ID !== 1) {
        return res.status(401).json({ error: 'User account is not active' });
      }

      // Add user info to request (matching existing auth structure)
      req.user = {
        userId: user.Users_id,
        username: user.Users_name,
        roleId: user.Role_FK_ID,
        roleName: user.Role_name
      };

      // If user is an owner, add Owner_id for compatibility
      if (decoded.Role_name === 'OWNER') {
        const owner = await OwnerModel.findByUserId(decoded.userId);
        if (owner) {
          req.user.Owner_id = owner.Owners_id;
        }
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Check if user has guard role
  static checkGuardRole(req, res, next) {
    try {
      // Check role based on role ID (more reliable than name)
      const isAdmin = req.user.roleId === 1;
      const isGuard = req.user.roleId === 3;
      
      // Admins can do everything guards can do
      if (!isGuard && !isAdmin) {
        return res.status(403).json({ 
          error: 'Access denied. Only guards and admins can perform this action.' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Guard role check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  }

  // Check if user is owner or guard
  static checkOwnerOrGuardAccess(req, res, next) {
    try {
      // Use role IDs for more reliable checking
      const isAdmin = req.user.roleId === 1;
      const isOwner = req.user.roleId === 2;
      const isGuard = req.user.roleId === 3;
      
      if (!isGuard && !isOwner && !isAdmin) {
        return res.status(403).json({ 
          error: 'Access denied. Only guards, owners, and admins can access packages.' 
        });
      }

      // Add access info to request for use in controllers
      req.userAccess = {
        isGuard,
        isOwner,
        isAdmin,
        canSeeAll: isGuard || isAdmin
      };
      
      next();
    } catch (error) {
      console.error('Access check error:', error);
      res.status(500).json({ error: 'Access check failed' });
    }
  }

  // Check if user can access specific owner's data
  static async checkOwnerDataAccess(req, res, next) {
    try {
      const { owner_id } = req.params;
      const { isGuard, isAdmin } = req.userAccess;
      
      // Guards and admins can access all owner data
      if (isGuard || isAdmin) {
        return next();
      }
      
      // Owners can only access their own data
      if (req.user.Owner_id && req.user.Owner_id === parseInt(owner_id)) {
        return next();
      }
      
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own data.' 
      });
    } catch (error) {
      console.error('Owner data access check error:', error);
      res.status(500).json({ error: 'Access check failed' });
    }
  }

  // Validate package data before creation
  static validatePackageData(req, res, next) {
    try {
      const requiredFields = [
        'recipient_owner_id',
        'recipient_apartment', 
        'recipient_tower',
        'sender_name',
        'description'
      ];
      
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Missing required fields',
          missing_fields: missingFields
        });
      }
      
      // Validate package type if provided
      const validTypes = ['package', 'bill', 'letter', 'food_delivery', 'other'];
      if (req.body.package_type && !validTypes.includes(req.body.package_type)) {
        return res.status(400).json({
          error: 'Invalid package type',
          valid_types: validTypes
        });
      }
      
      // Validate size if provided
      const validSizes = ['small', 'medium', 'large', 'extra_large'];
      if (req.body.size && !validSizes.includes(req.body.size)) {
        return res.status(400).json({
          error: 'Invalid package size',
          valid_sizes: validSizes
        });
      }
      
      // Validate weight if provided
      if (req.body.weight && (req.body.weight < 0 || req.body.weight > 100)) {
        return res.status(400).json({
          error: 'Invalid weight. Must be between 0 and 100 kg.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Package validation error:', error);
      res.status(500).json({ error: 'Validation failed' });
    }
  }

  // Validate status update
  static validateStatusUpdate(req, res, next) {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'notified', 'delivered', 'returned'];
      
      if (!status) {
        return res.status(400).json({
          error: 'Status is required'
        });
      }
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          valid_statuses: validStatuses
        });
      }
      
      // If marking as delivered, ensure proper fields are provided
      if (status === 'delivered') {
        const { isOwner } = req.userAccess;
        if (isOwner && !req.body.recipient_signature) {
          return res.status(400).json({
            error: 'Recipient signature is required when marking as delivered'
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Status validation error:', error);
      res.status(500).json({ error: 'Status validation failed' });
    }
  }
}

export default PackageAuthMiddleware;
