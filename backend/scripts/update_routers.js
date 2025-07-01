import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routersDir = path.join(__dirname, '..', 'routers');

// Function to update a router file
function updateRouterFile(filePath) {
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if the file already uses the new middleware
    if (content.includes('requirePermission') && !content.includes('authMiddleware')) {
      console.log(`✅ ${path.basename(filePath)} already updated`);
      return;
    }
    
    // Extract the module name from the file name
    const fileName = path.basename(filePath);
    const moduleName = fileName.replace('.router.js', '').toLowerCase();
    
    // Replace imports
    content = content.replace(
      /import\s+{[^}]*authMiddleware[^}]*}\s+from\s+["']\.\.\/middleware\/authMiddleware\.js[""];/g,
      `import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";`
    );
    
    // Remove ROLES import if it exists
    content = content.replace(
      /import\s+{[^}]*ROLES[^}]*}\s+from\s+["']\.\.\/middleware\/rbacConfig\.js[""];/g,
      ''
    );
    
    // Replace authMiddleware with requirePermission for each CRUD operation
    content = content.replace(
      /authMiddleware\(\[[^\]]*\]\)/g,
      (match) => {
        if (match.includes('ADMIN') && !match.includes('OWNER') && !match.includes('STAFF')) {
          // Admin-only routes
          if (content.includes('router.post') || content.includes('.post')) {
            return `requirePermission("${moduleName}", "create")`;
          } else if (content.includes('router.get') || content.includes('.get')) {
            return `requirePermission("${moduleName}", "read")`;
          } else if (content.includes('router.put') || content.includes('.put')) {
            return `requirePermission("${moduleName}", "update")`;
          } else if (content.includes('router.delete') || content.includes('.delete')) {
            return `requirePermission("${moduleName}", "delete")`;
          }
        } else {
          // Mixed access routes
          if (content.includes('router.post') || content.includes('.post')) {
            return `requirePermission("${moduleName}", "create")`;
          } else if (content.includes('router.get') || content.includes('.get')) {
            return `requirePermission("${moduleName}", "read")`;
          } else if (content.includes('router.put') || content.includes('.put')) {
            return `requirePermission("${moduleName}", "update")`;
          } else if (content.includes('router.delete') || content.includes('.delete')) {
            return `requirePermission("${moduleName}", "delete")`;
          }
        }
        return match;
      }
    );
    
    // Replace ownerResourceAccess with requireOwnership
    content = content.replace(
      /ownerResourceAccess\([^)]*\)/g,
      `requireOwnership("${moduleName}")`
    );
    
    // Format the file for better readability
    content = formatRouterFile(content, moduleName);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error updating ${path.basename(filePath)}:`, error.message);
  }
}

// Function to format the router file for better readability
function formatRouterFile(content, moduleName) {
  // Split the content by lines
  const lines = content.split('\n');
  
  // Find the router declaration line index
  const routerDeclIndex = lines.findIndex(line => line.includes('const router ='));
  
  if (routerDeclIndex !== -1) {
    // Add a comment before routes
    lines.splice(routerDeclIndex + 1, 0, '', '// Protected routes');
  }
  
  // Format each route for better readability
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip if the line is already formatted
    if (line.includes('requirePermission') && line.includes(',')) {
      continue;
    }
    
    // Format routes
    if (line.includes('router.') && line.includes('requirePermission')) {
      const routePattern = /router\.(get|post|put|delete|patch)\(["']([^"']+)["'],\s*requirePermission\(["']([^"']+)["'],\s*["']([^"']+)["']\),\s*(\w+)\.(\w+)\);/;
      const match = line.match(routePattern);
      
      if (match) {
        const [, method, path, module, action, controller, handler] = match;
        
        // Replace with formatted version
        lines[i] = `router.${method}("${path}", \n  requirePermission("${module}", "${action}"),\n  ${controller}.${handler}\n);`;
      }
    }
  }
  
  return lines.join('\n');
}

// Process all router files
fs.readdir(routersDir, (err, files) => {
  if (err) {
    console.error('Error reading routers directory:', err);
    return;
  }
  
  // Filter only JavaScript files
  const routerFiles = files.filter(file => file.endsWith('.router.js') || file === 'rolesPermissions.js');
  
  // Update each router file
  routerFiles.forEach(file => {
    const filePath = path.join(routersDir, file);
    updateRouterFile(filePath);
  });
  
  console.log('\nRouter update complete!');
}); 