import { Permission, ModuleRole, PermissionModuleRole } from '../models/permissions.model.js';
import { Role } from '../models/roles.model.js';
import { Module } from '../models/modules.model.js';
import { sequelize } from '../config/db/connectMysql.js';

/**
 * This script ensures that the Admin role has all permissions in the system
 * It uses the correct database tables: permissions, permissions_module_role, module
 */
async function fixPermissionsDb() {
  try {
    console.log("🔧 Starting permission fix for Admin role using database tables...");
    
    // 1. Check if the Admin role exists
    console.log("🔍 Checking for Admin role...");
    const [adminRoles] = await sequelize.query("SELECT Role_id FROM role WHERE Role_name = 'Admin'");
    
    if (adminRoles.length === 0) {
      console.log("❌ Admin role not found in the roles table");
      return;
    }
    
    const adminRoleId = adminRoles[0].Role_id;
    console.log(`✅ Found Admin role with ID: ${adminRoleId}`);
    
    // 2. Get all modules
    console.log("🔍 Fetching all modules...");
    const [modules] = await sequelize.query("SELECT Module_id, Module_name FROM module");
    console.log(`✅ Found ${modules.length} modules`);
    
    // 3. Get all permissions
    console.log("🔍 Fetching all permissions...");
    const [permissions] = await sequelize.query("SELECT Permissions_id, Permissions_name FROM permissions");
    console.log(`✅ Found ${permissions.length} permissions`);
    
    // 4. Clear existing permissions for Admin role to avoid duplicates
    console.log("🧹 Clearing existing permissions for Admin role...");
    await sequelize.query("DELETE FROM permissions_module_role WHERE Role_FK_ID = ?", [adminRoleId]);
    console.log("✅ Cleared existing permissions");
    
    // 5. Assign all permissions to Admin role for each module
    console.log("📝 Assigning all permissions to Admin role...");
    let assignedCount = 0;
    
    for (const module of modules) {
      for (const permission of permissions) {
        try {
          await sequelize.query(
            "INSERT INTO permissions_module_role (Permissions_FK_ID, Module_FK_ID, Role_FK_ID) VALUES (?, ?, ?)",
            [permission.Permissions_id, module.Module_id, adminRoleId]
          );
          assignedCount++;
        } catch (error) {
          console.log(`⚠️ Error assigning permission ${permission.Permissions_id} for module ${module.Module_id}: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Assigned ${assignedCount} permissions to Admin role`);
    
    // 6. Verify the permissions were assigned
    const [count] = await sequelize.query(
      "SELECT COUNT(*) as count FROM permissions_module_role WHERE Role_FK_ID = ?", 
      [adminRoleId]
    );
    
    console.log(`✅ Verification: Admin role now has ${count[0].count} permissions`);
    
    // 7. Make sure testadmin user has Admin role
    console.log("🔍 Checking if testadmin user exists and has Admin role...");
    const [testAdminUsers] = await sequelize.query(
      "SELECT Users_id, Role_FK_ID FROM users WHERE Users_name = 'testadmin'"
    );
    
    if (testAdminUsers.length > 0) {
      const testAdminUser = testAdminUsers[0];
      
      if (testAdminUser.Role_FK_ID === adminRoleId) {
        console.log("✅ testadmin user already has Admin role");
      } else {
        // Update the user's role to Admin
        await sequelize.query(
          "UPDATE users SET Role_FK_ID = ? WHERE Users_id = ?",
          [adminRoleId, testAdminUser.Users_id]
        );
        console.log("✅ Updated testadmin user to have Admin role");
      }
    } else {
      console.log("⚠️ testadmin user not found in the database");
    }
    
    // 8. Create a custom middleware that uses these tables
    console.log("📝 Creating a custom permission middleware...");
    
    const middlewareCode = `
// Custom permission middleware that checks permissions_module_role table
// Save this to backend/middleware/dbPermissionMiddleware.js

import { sequelize } from "../config/db/connectMysql.js";

/**
 * Middleware to check if a user has permission to access a specific module and action
 * @param {string} moduleName - The name of the module to check
 * @param {string} permissionName - The name of the permission to check
 * @returns {function} - Express middleware function
 */
export const checkDbPermission = (moduleName, permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const roleId = req.user.roleId;
      
      console.log(\`Checking if user \${userId} with role \${roleId} has permission \${permissionName} for module \${moduleName}\`);
      
      // Query to check if the user's role has the required permission for the module
      const query = \`
        SELECT pmr.* 
        FROM permissions_module_role pmr
        JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
        JOIN module m ON pmr.Module_FK_ID = m.Module_id
        JOIN role r ON pmr.Role_FK_ID = r.Role_id
        WHERE r.Role_id = ? 
        AND m.Module_name = ?
        AND p.Permissions_name = ?
      \`;
      
      const [result] = await sequelize.query(query, [roleId, moduleName, permissionName]);
      
      if (result.length > 0) {
        console.log("✅ Permission granted");
        next();
      } else {
        console.log("❌ Permission denied");
        res.status(403).json({ 
          message: "Access denied. You don't have permission to access this resource." 
        });
      }
    } catch (error) {
      console.error("❌ Permission check error:", error);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

/**
 * Middleware to check if a user has admin permissions
 * @returns {function} - Express middleware function
 */
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    
    console.log(\`Checking if user \${userId} with role \${roleId} is admin\`);
    
    // Query to check if the user's role is Admin
    const query = \`
      SELECT r.* 
      FROM role r
      WHERE r.Role_id = ? 
      AND r.Role_name = 'Admin'
    \`;
    
    const [result] = await sequelize.query(query, [roleId]);
    
    if (result.length > 0) {
      console.log("✅ User is admin");
      next();
    } else {
      console.log("❌ User is not admin");
      res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
      });
    }
  } catch (error) {
    console.error("❌ Admin check error:", error);
    res.status(500).json({ error: "Permission check failed" });
  }
};
`;
    
    // Write the middleware to a file
    const fs = require('fs');
    const path = require('path');
    const middlewarePath = path.join(process.cwd(), 'backend', 'middleware', 'dbPermissionMiddleware.js');
    fs.writeFileSync(middlewarePath, middlewareCode);
    
    console.log(`✅ Created custom permission middleware at: ${middlewarePath}`);
    
    // 9. Create a usage example
    const usageExample = `
// Example of how to use the new permission middleware
// This can be added to any router file

import { checkDbPermission, isAdmin } from "../middleware/dbPermissionMiddleware.js";

// Example 1: Check if user has 'read' permission for 'users' module
router.get("/users", 
  verifyToken,
  checkDbPermission('users', 'read'), 
  UserController.getUsers
);

// Example 2: Check if user has 'create' permission for 'payments' module
router.post("/payments", 
  verifyToken,
  checkDbPermission('payments', 'create'), 
  PaymentController.createPayment
);

// Example 3: Admin-only route
router.delete("/users/:id", 
  verifyToken,
  isAdmin, 
  UserController.deleteUser
);
`;
    
    const usageExamplePath = path.join(process.cwd(), 'backend', 'middleware', 'permission_usage_example.js');
    fs.writeFileSync(usageExamplePath, usageExample);
    
    console.log(`✅ Created usage example at: ${usageExamplePath}`);
    
    console.log("");
    console.log("🎉 Permission fix completed successfully!");
    console.log("");
    console.log("To use the new permission system:");
    console.log("1. Import the middleware in your router files");
    console.log("2. Apply the middleware to your routes");
    console.log("3. Restart your server");
    
  } catch (error) {
    console.error("❌ Error fixing permissions:", error);
    throw error;
  } finally {
    // Close the database connection
    await sequelize.end();
  }
}

// Run the script
fixPermissionsDb()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

// Basic CRUD permissions
const BASIC_PERMISSIONS = [
  { name: 'create', description: 'Create new records' },
  { name: 'read', description: 'Read records' },
  { name: 'update', description: 'Update existing records' },
  { name: 'delete', description: 'Delete records' }
];

// Module definitions
const MODULES = [
  { name: 'users', description: 'User management' },
  { name: 'owners', description: 'Owner management' },
  { name: 'apartments', description: 'Apartment management' },
  { name: 'parking', description: 'Parking management' },
  { name: 'pets', description: 'Pet management' },
  { name: 'pqrs', description: 'PQRS management' },
  { name: 'reservations', description: 'Reservation management' },
  { name: 'payments', description: 'Payment management' },
  { name: 'visitors', description: 'Visitor management' },
  { name: 'surveys', description: 'Survey management' }
];

// Role-Module-Permission mappings
const ROLE_PERMISSIONS = {
  // Admin has all permissions on all modules
  ADMIN: MODULES.map(module => ({
    module: module.name,
    permissions: ['create', 'read', 'update', 'delete']
  })),

  // Owner permissions
  OWNER: [
    {
      module: 'owners',
      permissions: ['read', 'update'] // Can view and update their own profile
    },
    {
      module: 'apartments',
      permissions: ['read'] // Can only view apartments
    },
    {
      module: 'parking',
      permissions: ['read', 'create'] // Can view and reserve parking
    },
    {
      module: 'pets',
      permissions: ['create', 'read', 'update', 'delete'] // Full control over their pets
    },
    {
      module: 'pqrs',
      permissions: ['create', 'read', 'update'] // Can create and manage their PQRS
    },
    {
      module: 'reservations',
      permissions: ['create', 'read', 'update', 'delete'] // Full control over their reservations
    },
    {
      module: 'payments',
      permissions: ['create', 'read'] // Can make and view payments
    },
    {
      module: 'surveys',
      permissions: ['read', 'create'] // Can view and respond to surveys
    }
  ],

  // Security/Guard permissions
  SECURITY: [
    {
      module: 'visitors',
      permissions: ['create', 'read', 'update'] // Can manage visitors
    },
    {
      module: 'parking',
      permissions: ['read', 'update'] // Can view and update parking status
    }
  ]
};

async function populatePermissions() {
  const t = await sequelize.transaction();

  try {
    console.log('Starting permission population...');

    // Create basic permissions
    const permissions = await Promise.all(
      BASIC_PERMISSIONS.map(async (perm) => {
        const [permission] = await Permission.findOrCreate({
          where: { Permissions_name: perm.name },
          defaults: {
            Permissions_description: perm.description
          },
          transaction: t
        });
        return permission;
      })
    );

    // Create modules
    const modules = await Promise.all(
      MODULES.map(async (mod) => {
        const [module] = await Module.findOrCreate({
          where: { module_name: mod.name },
          defaults: {
            module_description: mod.description
          },
          transaction: t
        });
        return module;
      })
    );

    // Get roles
    const roles = await Role.findAll({ transaction: t });
    const roleMap = roles.reduce((map, role) => {
      map[role.Role_name.toUpperCase()] = role;
      return map;
    }, {});

    // Create module-role associations and permissions
    for (const [roleName, modulePermissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = roleMap[roleName];
      if (!role) {
        console.log(`Role ${roleName} not found, skipping...`);
        continue;
      }

      for (const { module: moduleName, permissions: permNames } of modulePermissions) {
        const module = modules.find(m => m.module_name === moduleName);
        if (!module) {
          console.log(`Module ${moduleName} not found, skipping...`);
          continue;
        }

        // Create or find module-role association
        const [moduleRole] = await ModuleRole.findOrCreate({
          where: {
            Role_FK_ID: role.Role_id,
            Module_FK_ID: module.module_id
          },
          transaction: t
        });

        // Create permission-module-role associations
        for (const permName of permNames) {
          const permission = permissions.find(p => p.Permissions_name === permName);
          if (!permission) {
            console.log(`Permission ${permName} not found, skipping...`);
            continue;
          }

          await PermissionModuleRole.findOrCreate({
            where: {
              Module_role_FK_ID: moduleRole.Module_role_id,
              Permissions_FK_ID: permission.Permissions_id
            },
            transaction: t
          });
        }
      }
    }

    await t.commit();
    console.log('Successfully populated permissions!');
  } catch (error) {
    await t.rollback();
    console.error('Error populating permissions:', error);
    throw error;
  }
}

// Run the script
populatePermissions()
  .then(() => {
    console.log('Finished populating permissions');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to populate permissions:', error);
    process.exit(1);
  }); 