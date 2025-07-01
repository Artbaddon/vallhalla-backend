import { connect } from "../config/db/connectMysql.js";

async function checkAdminPermissions() {
  try {
    console.log("Checking admin permissions for all modules...");
    
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
    console.log(`Found ${modules.length} modules in the database:`);
    modules.forEach(m => console.log(`- ${m.module_name} (ID: ${m.module_id})`));
    
    // Check module_role associations for admin
    const [moduleRoles] = await connect.query(
      "SELECT mr.Module_role_id, m.module_name FROM module_role mr " +
      "JOIN module m ON mr.Module_FK_ID = m.module_id " +
      "WHERE mr.Role_FK_ID = ?",
      [adminRoleId]
    );
    
    console.log(`\nAdmin has access to ${moduleRoles.length} modules:`);
    moduleRoles.forEach(mr => console.log(`- ${mr.module_name}`));
    
    // Find missing modules
    const adminModuleNames = moduleRoles.map(mr => mr.module_name);
    const missingModules = modules.filter(m => !adminModuleNames.includes(m.module_name));
    
    if (missingModules.length > 0) {
      console.log(`\nWARNING: Admin is missing access to ${missingModules.length} modules:`);
      missingModules.forEach(m => console.log(`- ${m.module_name}`));
    } else {
      console.log("\nAdmin has access to all modules!");
    }
    
    // Check permissions for each module
    console.log("\nChecking permissions for each module:");
    
    for (const moduleRole of moduleRoles) {
      const [permissions] = await connect.query(
        "SELECT p.Permissions_name FROM permissions_module_role pmr " +
        "JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id " +
        "WHERE pmr.Module_role_FK_ID = ?",
        [moduleRole.Module_role_id]
      );
      
      console.log(`Module ${moduleRole.module_name} has ${permissions.length} permissions: ${permissions.map(p => p.Permissions_name).join(', ')}`);
    }
    
    console.log("\nAdmin permissions check completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkAdminPermissions(); 