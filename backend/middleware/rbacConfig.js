/**
 * Permission-Based Access Control Configuration
 * This file defines the core permission checking logic based on the database schema
 */

import { connect } from "../config/db/connectMysql.js";

// Define role constants for easier reference
export const ROLES = {
  ADMIN: 1,
  OWNER: 2,
  SECURITY: 3
};

// Helper function to check if a user has a specific permission on a module
export async function hasPermission(connection, userId, moduleName, permissionName) {
  try {
    // First check if user is admin - admins have all permissions
    const adminQuery = `
      SELECT COUNT(*) as count
      FROM users u
      JOIN role r ON u.Role_FK_ID = r.Role_id
      WHERE u.Users_id = ?
        AND r.Role_id = ?
        AND u.User_status_FK_ID = 1  -- Active status
    `;

    const [adminRows] = await connect.query(adminQuery, [userId, ROLES.ADMIN]);
    if (adminRows[0].count > 0) {
      return true;
    }

    // If not admin, check specific permissions
    const permQuery = `
      SELECT COUNT(*) as count
      FROM users u
      JOIN role r ON u.Role_FK_ID = r.Role_id
      JOIN module_role mr ON r.Role_id = mr.Role_FK_ID
      JOIN module m ON mr.Module_FK_ID = m.module_id
      JOIN permissions_module_role pmr ON mr.Module_role_id = pmr.Module_role_FK_ID
      JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
      WHERE u.Users_id = ?
        AND m.module_name = ?
        AND p.Permissions_name = ?
        AND u.User_status_FK_ID = 1  
    `;

    const [permRows] = await connect.query(permQuery, [userId, moduleName, permissionName]);
    return permRows[0].count > 0;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

// Helper function to get all permissions for a user
export async function getUserPermissions(connection, userId) {
  try {
    // If user is admin, return all possible permissions
    const isUserAdmin = await isAdmin(connection, userId);
    if (isUserAdmin) {
      const query = `
        SELECT DISTINCT 
          m.module_name,
          p.Permissions_name
        FROM module m
        CROSS JOIN permissions p
        ORDER BY m.module_name, p.Permissions_name
      `;
      const [rows] = await connection.query(query);
      return rows;
    }

    // For non-admin users, get their specific permissions
    const query = `
      SELECT DISTINCT 
        m.module_name,
        p.Permissions_name
      FROM users u
      JOIN role r ON u.Role_FK_ID = r.Role_id
      JOIN module_role mr ON r.Role_id = mr.Role_FK_ID
      JOIN module m ON mr.Module_FK_ID = m.module_id
      JOIN permissions_module_role pmr ON mr.Module_role_id = pmr.Module_role_FK_ID
      JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
      WHERE u.Users_id = ?
        AND u.User_status_FK_ID = 1  -- Active status
      ORDER BY m.module_name, p.Permissions_name
    `;

    const [rows] = await connection.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Helper function to check if user is admin
export async function isAdmin(connection, userId) {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM users u
      JOIN role r ON u.Role_FK_ID = r.Role_id
      WHERE u.Users_id = ?
        AND r.Role_id = ?
        AND u.User_status_FK_ID = 1  -- Active status
    `;

    const [rows] = await connect.query(query, [userId, ROLES.ADMIN]);
    return rows[0].count > 0;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// Helper function to check if user owns a resource
export async function ownsResource(connection, userId, resourceType, resourceId) {
  try {
    // First check if user is admin - admins can access all resources
    const isUserAdmin = await isAdmin(connection, userId);
    if (isUserAdmin) {
      return true;
    }

    let query;
    switch (resourceType) {
      case 'apartment':
        query = `
          SELECT COUNT(*) as count
          FROM apartment a
          JOIN owner o ON a.Owner_FK_ID = o.Owner_id
          WHERE o.User_FK_ID = ? AND a.Apartment_id = ?
        `;
        break;
      case 'pet':
        query = `
          SELECT COUNT(*) as count
          FROM pet p
          JOIN owner o ON p.Owner_FK_ID = o.Owner_id
          WHERE o.User_FK_ID = ? AND p.Pet_id = ?
        `;
        break;
      case 'pqrs':
        query = `
          SELECT COUNT(*) as count
          FROM pqrs p
          JOIN owner o ON p.Owner_FK_ID = o.Owner_id
          WHERE o.User_FK_ID = ? AND p.PQRS_id = ?
        `;
        break;
      case 'reservation':
        query = `
          SELECT COUNT(*) as count
          FROM reservation r
          JOIN owner o ON r.Owner_FK_ID = o.Owner_id
          WHERE o.User_FK_ID = ? AND r.Reservation_id = ?
        `;
        break;
      case 'payment':
        query = `
          SELECT COUNT(*) as count
          FROM payment p
          JOIN owner o ON p.Owner_ID_FK = o.Owner_id
          WHERE o.User_FK_ID = ? AND p.payment_id = ?
        `;
        break;
      case 'tenant':
        query = `
          SELECT COUNT(*) as count
          FROM tenant t
          JOIN owner o ON t.Owner_FK_ID = o.Owner_id
          WHERE o.User_FK_ID = ? AND t.Tenant_id = ?
        `;
        break;
      case 'profile':
        query = `
          SELECT COUNT(*) as count
          FROM profile p
          WHERE p.User_FK_ID = ? AND p.Profile_id = ?
        `;
        break;
      default:
        return false;
    }

    const [rows] = await connection.query(query, [userId, resourceId]);
    return rows[0].count > 0;
  } catch (error) {
    console.error('Resource ownership check error:', error);
    return false;
  }
}

