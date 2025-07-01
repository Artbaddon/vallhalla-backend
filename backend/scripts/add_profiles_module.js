import { connect } from "../config/db/connectMysql.js";

async function addProfilesModule() {
  try {
    console.log("Adding profiles module to the database...");
    
    // Check if profiles module already exists
    const [existingModule] = await connect.query(
      "SELECT * FROM module WHERE module_name = 'profiles'"
    );
    
    if (existingModule.length > 0) {
      console.log("Profiles module already exists.");
    } else {
      // Add profiles module
      await connect.query(
        "INSERT INTO module (module_name, module_description) VALUES ('profiles', 'Profile management module')"
      );
      console.log("Profiles module added successfully.");
    }
    
    // Get module ID
    const [moduleResult] = await connect.query(
      "SELECT module_id FROM module WHERE module_name = 'profiles'"
    );
    const moduleId = moduleResult[0].module_id;
    
    // Add module-role associations for Admin
    const [adminRole] = await connect.query(
      "SELECT Role_id FROM role WHERE Role_name = 'Admin'"
    );
    const adminRoleId = adminRole[0].Role_id;
    
    // Check if admin association already exists
    const [existingAdminAssoc] = await connect.query(
      "SELECT * FROM module_role WHERE Role_FK_ID = ? AND Module_FK_ID = ?",
      [adminRoleId, moduleId]
    );
    
    if (existingAdminAssoc.length === 0) {
      await connect.query(
        "INSERT INTO module_role (Role_FK_ID, Module_FK_ID) VALUES (?, ?)",
        [adminRoleId, moduleId]
      );
      console.log("Admin role associated with profiles module.");
      
      // Get the module_role ID
      const [moduleRoleResult] = await connect.query(
        "SELECT Module_role_id FROM module_role WHERE Role_FK_ID = ? AND Module_FK_ID = ?",
        [adminRoleId, moduleId]
      );
      const moduleRoleId = moduleRoleResult[0].Module_role_id;
      
      // Add all permissions for Admin
      const [permissions] = await connect.query("SELECT Permissions_id FROM permissions");
      
      for (const permission of permissions) {
        await connect.query(
          "INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID) VALUES (?, ?)",
          [moduleRoleId, permission.Permissions_id]
        );
      }
      console.log("Admin permissions added for profiles module.");
    } else {
      console.log("Admin role already associated with profiles module.");
    }
    
    // Add module-role associations for Owner
    const [ownerRole] = await connect.query(
      "SELECT Role_id FROM role WHERE Role_name = 'Owner'"
    );
    const ownerRoleId = ownerRole[0].Role_id;
    
    // Check if owner association already exists
    const [existingOwnerAssoc] = await connect.query(
      "SELECT * FROM module_role WHERE Role_FK_ID = ? AND Module_FK_ID = ?",
      [ownerRoleId, moduleId]
    );
    
    if (existingOwnerAssoc.length === 0) {
      await connect.query(
        "INSERT INTO module_role (Role_FK_ID, Module_FK_ID) VALUES (?, ?)",
        [ownerRoleId, moduleId]
      );
      console.log("Owner role associated with profiles module.");
      
      // Get the module_role ID
      const [moduleRoleResult] = await connect.query(
        "SELECT Module_role_id FROM module_role WHERE Role_FK_ID = ? AND Module_FK_ID = ?",
        [ownerRoleId, moduleId]
      );
      const moduleRoleId = moduleRoleResult[0].Module_role_id;
      
      // Add read and update permissions for Owner
      const [readPermission] = await connect.query(
        "SELECT Permissions_id FROM permissions WHERE Permissions_name = 'read'"
      );
      const [updatePermission] = await connect.query(
        "SELECT Permissions_id FROM permissions WHERE Permissions_name = 'update'"
      );
      
      await connect.query(
        "INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID) VALUES (?, ?)",
        [moduleRoleId, readPermission[0].Permissions_id]
      );
      await connect.query(
        "INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID) VALUES (?, ?)",
        [moduleRoleId, updatePermission[0].Permissions_id]
      );
      console.log("Owner read/update permissions added for profiles module.");
    } else {
      console.log("Owner role already associated with profiles module.");
    }
    
    console.log("Profiles module setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addProfilesModule(); 