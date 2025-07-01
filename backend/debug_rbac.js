import { hasApiAccess } from "./middleware/rbacConfig.js";

// Test different endpoint patterns
const testEndpoints = [
  '/api/payments',
  '/api/payments/',
  '/api/payments?page=1',
  '/api/reservations',
  '/api/reservations/',
  '/api/reservations?page=1',
  '/api/users',
  '/api/users/',
  '/api/users?page=1'
];

console.log('🔍 Testing RBAC path matching...\n');

testEndpoints.forEach(endpoint => {
  console.log(`Testing endpoint: ${endpoint}`);
  console.log(`  GET - ADMIN: ${hasApiAccess(endpoint, 'GET', 1)}`);
  console.log(`  GET - STAFF: ${hasApiAccess(endpoint, 'GET', 2)}`);
  console.log(`  GET - OWNER: ${hasApiAccess(endpoint, 'GET', 3)}`);
  console.log(`  POST - ADMIN: ${hasApiAccess(endpoint, 'POST', 1)}`);
  console.log('');
});

// Test the regex pattern matching
console.log('🔍 Testing regex patterns...\n');

const patterns = [
  '/api/payments',
  '/api/payments/:id',
  '/api/reservations',
  '/api/reservations/:id'
];

patterns.forEach(pattern => {
  const regexPattern = pattern
    .replace(/:\w+/g, '[^/]+')
    .replace(/\//g, '\\/');
  
  console.log(`Pattern: ${pattern}`);
  console.log(`Regex: ^${regexPattern}$`);
  
  const regex = new RegExp(`^${regexPattern}$`);
  console.log(`Matches '/api/payments': ${regex.test('/api/payments')}`);
  console.log(`Matches '/api/payments/': ${regex.test('/api/payments/')}`);
  console.log(`Matches '/api/payments/123': ${regex.test('/api/payments/123')}`);
  console.log('');
}); 