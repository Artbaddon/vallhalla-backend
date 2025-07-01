import { connect } from "../config/db/connectMysql.js";

async function fixAdminPermissions() {
  try {
    console.log("Fixing admin permissions for all modules...");
    
    // Get admin role ID
    const [adminRole] = await connect.query(
      "SELECT Role_id FROM role WHERE Role_name = 'Admin'"
    );
    
    if (!adminRole || adminRole.length === 0) {
      console.error("Admin role not found!");
      process.exit(1);
    }
    
    const adminRoleId = adminRole[0].Role_id;
    console.log(`Found Admin role with ID: ${adminRoleId}`);
    
    // Get all modules
    const [modules] = await connect.query("SELECT * FROM module");
    console.log(`Found ${modules.length} modules in the database`);
    
    // Get all permissions
    const [permissions] = await connect.query("SELECT * FROM permissions");
    console.log(`Found ${permissions.length} permissions in the database`);
    
    // For each module, ensure admin has a module_role entry
    for (const module of modules) {
      console.log(`Processing module: ${module.module_name} (ID: ${module.module_id})`);
      
      // Check if module_role association exists
      const [existingModuleRole] = await connect.query(
        "SELECT * FROM module_role WHERE Role_FK_ID = ? AND Module_FK_ID = ?",
        [adminRoleId, module.module_id]
      );
      
      let moduleRoleId;
      
      if (existingModuleRole.length === 0) {
        // Create module_role association
        const [result] = await connect.query(
          "INSERT INTO module_role (Role_FK_ID, Module_FK_ID) VALUES (?, ?)",
          [adminRoleId, module.module_id]
        );
        moduleRoleId = result.insertId;
        console.log(`Created module_role association for ${module.module_name}`);
      } else {
        moduleRoleId = existingModuleRole[0].Module_role_id;
        console.log(`Found existing module_role association for ${module.module_name}`);
      }
      
      // For each permission, ensure admin has a permissions_module_role entry
      for (const permission of permissions) {
        // Check if permission association exists
        const [existingPermission] = await connect.query(
          "SELECT * FROM permissions_module_role WHERE Module_role_FK_ID = ? AND Permissions_FK_ID = ?",
          [moduleRoleId, permission.Permissions_id]
        );
        
        if (existingPermission.length === 0) {
          // Create permission association
          await connect.query(
            "INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID) VALUES (?, ?)",
            [moduleRoleId, permission.Permissions_id]
          );
          console.log(`Added ${permission.Permissions_name} permission for ${module.module_name}`);
        } else {
          console.log(`Permission ${permission.Permissions_name} already exists for ${module.module_name}`);
        }
      }
    }
    
    // Check for missing modules based on router files
    const moduleNames = modules.map(m => m.module_name);
    const expectedModules = [
      'profiles', 'users', 'owners', 'apartments', 'parking', 'pets', 'pqrs', 
      'reservations', 'payments', 'visitors', 'surveys', 'notifications', 
      'apartment-status', 'towers', 'questions', 'answers', 'reservation-status', 
      'reservation-type', 'role-permissions', 'modules', 'user-status', 
      'pqrs-categories', 'guards', 'facilities', 'permissions', 'roles',
      'vehicle-type'
    ];
    
    const missingModules = expectedModules.filter(name => !moduleNames.includes(name));
    
    if (missingModules.length > 0) {
      console.log(`Found ${missingModules.length} missing modules: ${missingModules.join(', ')}`);
      
      // Create missing modules
      for (const moduleName of missingModules) {
        // Add module
        const [result] = await connect.query(
          "INSERT INTO module (module_name, module_description) VALUES (?, ?)",
          [moduleName, `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} management module`]
        );
        
        const moduleId = result.insertId;
        console.log(`Created module: ${moduleName} with ID: ${moduleId}`);
        
        // Create module_role association for admin
        const [moduleRoleResult] = await connect.query(
          "INSERT INTO module_role (Role_FK_ID, Module_FK_ID) VALUES (?, ?)",
          [adminRoleId, moduleId]
        );
        
        const moduleRoleId = moduleRoleResult.insertId;
        
        // Add all permissions for this module
        for (const permission of permissions) {
          await connect.query(
            "INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID) VALUES (?, ?)",
            [moduleRoleId, permission.Permissions_id]
          );
        }
        
        console.log(`Added all permissions for module: ${moduleName}`);
      }
    }
    
    console.log("Admin permissions fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixAdminPermissions(); 