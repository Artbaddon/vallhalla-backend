import fs from 'fs';
import path from 'path';

const RBAC_CONFIG_PATH = path.join(process.cwd(), 'backend', 'middleware', 'rbacConfig.js');

async function fixRbacConfig() {
  try {
    console.log("🔧 Starting RBAC configuration fix...");
    
    // Read the current rbacConfig.js file
    console.log(`🔍 Reading RBAC config from: ${RBAC_CONFIG_PATH}`);
    let rbacContent = fs.readFileSync(RBAC_CONFIG_PATH, 'utf8');
    
    // Make a backup of the original file
    const backupPath = `${RBAC_CONFIG_PATH}.backup`;
    fs.writeFileSync(backupPath, rbacContent);
    console.log(`✅ Created backup at: ${backupPath}`);
    
    // Update the API_ACCESS object to include Admin role (1) in all endpoints
    console.log("🔧 Modifying API_ACCESS to grant Admin access to all endpoints...");
    
    // Find the API_ACCESS object in the file
    const apiAccessRegex = /export const API_ACCESS = \{([\s\S]*?)\};/;
    const apiAccessMatch = rbacContent.match(apiAccessRegex);
    
    if (!apiAccessMatch) {
      console.log("❌ Could not find API_ACCESS object in the file");
      return;
    }
    
    // Get the content of the API_ACCESS object
    const apiAccessContent = apiAccessMatch[1];
    
    // Replace all endpoint method definitions to ensure Admin role (1) is included
    let updatedApiAccessContent = apiAccessContent.replace(
      /'(GET|POST|PUT|DELETE|PATCH)': \[(.*?)\]/g, 
      (match, method, roles) => {
        // If ROLES.ADMIN or 1 is already in the list, don't modify it
        if (roles.includes('ROLES.ADMIN') || roles.includes('1')) {
          return match;
        }
        // Otherwise, add ROLES.ADMIN to the list
        return `'${method}': [ROLES.ADMIN, ${roles}]`;
      }
    );
    
    // Replace the API_ACCESS object in the file
    const updatedRbacContent = rbacContent.replace(apiAccessRegex, `export const API_ACCESS = {${updatedApiAccessContent}};`);
    
    // Write the updated content back to the file
    fs.writeFileSync(RBAC_CONFIG_PATH, updatedRbacContent);
    console.log("✅ Updated RBAC configuration");
    
    // Add a debugging function to test the updated configuration
    const debugCode = `
// Add this to the end of the file to test the updated configuration
export function testAdminAccess() {
  console.log('🔍 Testing Admin access to all endpoints...');
  
  const testEndpoints = [
    '/api/users',
    '/api/roles',
    '/api/permissions',
    '/api/modules',
    '/api/apartments',
    '/api/owners',
    '/api/payments',
    '/api/pqrs',
    '/api/reservations',
    '/api/visitors',
    '/api/guards',
    '/api/notifications',
    '/api/facilities',
    '/api/user-status',
    '/api/apartment-status',
    '/api/reservation-status',
    '/api/reservation-types',
    '/api/pqrs-categories',
    '/api/profile'
  ];
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  for (const endpoint of testEndpoints) {
    for (const method of methods) {
      const hasAccess = hasApiAccess(endpoint, method, ROLES.ADMIN);
      console.log(\`Admin access to \${method} \${endpoint}: \${hasAccess ? '✅' : '❌'}\`);
    }
  }
}

// Uncomment to run the test
// testAdminAccess();
`;
    
    // Append the debug code to the file
    fs.appendFileSync(RBAC_CONFIG_PATH, debugCode);
    console.log("✅ Added debugging function to test the configuration");
    
    console.log("");
    console.log("🎉 RBAC configuration fix completed successfully!");
    console.log("");
    console.log("To test the updated configuration:");
    console.log("1. Restart your server");
    console.log("2. Run the test_endpoints.js script again");
    console.log("");
    console.log("To test the Admin access specifically:");
    console.log("1. Import and call the testAdminAccess() function from rbacConfig.js");
    console.log("2. Or uncomment the testAdminAccess() call at the bottom of rbacConfig.js");
    
  } catch (error) {
    console.error("❌ Error fixing RBAC configuration:", error);
    throw error;
  }
}

// Run the script
fixRbacConfig()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 