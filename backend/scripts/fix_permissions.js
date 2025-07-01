import { connect } from "../config/db/connectMysql.js";

/**
 * This script ensures that the Admin role has all permissions in the system
 * It fixes permission issues for the regular users table (not web_users or api_users)
 */
async function fixAdminPermissions() {
  try {
    console.log("🔧 Starting permission fix for Admin role...");
    
    // 1. Check if the Admin role exists
    console.log("🔍 Checking for Admin role...");
    const [adminRoles] = await connect.query("SELECT Role_id FROM role WHERE Role_name = 'Admin'");
    
    if (adminRoles.length === 0) {
      console.log("❌ Admin role not found in the roles table");
      return;
    }
    
    const adminRoleId = adminRoles[0].Role_id;
    console.log(`✅ Found Admin role with ID: ${adminRoleId}`);
    
    // 2. Get all modules
    console.log("🔍 Fetching all modules...");
    const [modules] = await connect.query("SELECT Module_id, Module_name FROM module");
    console.log(`✅ Found ${modules.length} modules`);
    
    // 3. Get all permissions
    console.log("🔍 Fetching all permissions...");
    const [permissions] = await connect.query("SELECT Permissions_id, Permissions_name FROM permissions");
    console.log(`✅ Found ${permissions.length} permissions`);
    
    // 4. Clear existing permissions for Admin role to avoid duplicates
    console.log("🧹 Clearing existing permissions for Admin role...");
    await connect.query("DELETE FROM permissions_module_role WHERE Role_FK_ID = ?", [adminRoleId]);
    console.log("✅ Cleared existing permissions");
    
    // 5. Assign all permissions to Admin role for each module
    console.log("📝 Assigning all permissions to Admin role...");
    let assignedCount = 0;
    
    for (const module of modules) {
      for (const permission of permissions) {
        try {
          await connect.query(
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
    const [count] = await connect.query(
      "SELECT COUNT(*) as count FROM permissions_module_role WHERE Role_FK_ID = ?", 
      [adminRoleId]
    );
    
    console.log(`✅ Verification: Admin role now has ${count[0].count} permissions`);
    
    // 7. Make sure testadmin user has Admin role
    console.log("🔍 Checking if testadmin user exists and has Admin role...");
    const [testAdminUsers] = await connect.query(
      "SELECT Users_id, Role_FK_ID FROM users WHERE Users_name = 'testadmin'"
    );
    
    if (testAdminUsers.length > 0) {
      const testAdminUser = testAdminUsers[0];
      
      if (testAdminUser.Role_FK_ID === adminRoleId) {
        console.log("✅ testadmin user already has Admin role");
      } else {
        // Update the user's role to Admin
        await connect.query(
          "UPDATE users SET Role_FK_ID = ? WHERE Users_id = ?",
          [adminRoleId, testAdminUser.Users_id]
        );
        console.log("✅ Updated testadmin user to have Admin role");
      }
    } else {
      console.log("⚠️ testadmin user not found in the database");
    }
    
    console.log("");
    console.log("🎉 Permission fix completed successfully!");
    
  } catch (error) {
    console.error("❌ Error fixing permissions:", error);
    throw error;
  } finally {
    // Close the database connection
    await connect.end();
  }
}

// Run the script
fixAdminPermissions()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 