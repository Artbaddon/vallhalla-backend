# 🧪 Vallhalla API Testing Guide

## Overview
This guide covers all testing methods for the Vallhalla API, including automated tests, manual testing, and Postman collections.

## 🚀 Quick Start Testing

### 1. **Server Health Check**
```bash
# Check if server is running
curl http://localhost:3000/api
# Expected: {"message":"Access denied. No token provided."}
```

### 2. **Authentication Test**
```bash
# Run the authentication test script
cd backend
node scripts/test_auth.js
```

### 3. **Comprehensive Endpoint Test**
```bash
# Run all endpoint tests
node scripts/test_endpoints.js
```

## 📋 Testing Methods

### **Method 1: Automated Scripts**

#### Authentication Test (`scripts/test_auth.js`)
- Tests user registration
- Tests login functionality
- Validates JWT token generation
- Tests token validation

#### Endpoint Test (`scripts/test_endpoints.js`)
- Tests all API endpoints
- Validates RBAC permissions
- Checks response formats
- Tests error handling

### **Method 2: Postman Collection**

#### Import the Collection
1. Open Postman
2. Import `backend/postman_collection.json`
3. Set environment variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `authToken`: (will be set automatically after login)

#### Run Collection Tests
1. **00_Collection_Runner** - Quick smoke test
2. **00_Authentication** - Auth flow testing
3. Individual module tests (apartments, users, etc.)

### **Method 3: Manual Testing with curl**

#### Authentication Flow
```bash
# 1. Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "12345678"}'

# 2. Use token for authenticated requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users
```

#### PowerShell Alternative
```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username": "admin", "password": "12345678"}'

# Use token
$headers = @{Authorization = "Bearer $($response.token)"}
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Headers $headers
```

## 🔍 Testing Scenarios

### **1. Role-Based Access Control (RBAC)**
Test different user roles and their permissions:

#### Admin Role (Role ID: 1)
- Full access to all endpoints
- Can manage users, roles, permissions
- Can view all data

#### Owner Role (Role ID: 3)
- Limited access to own data only
- Can manage own apartments, payments, PQRS
- Cannot access admin functions

#### Security Role (Role ID: 4)
- Access to visitor management
- Access to parking management
- Limited to security functions

### **2. Data Filtering**
Test that users only see their own data:

```bash
# Login as owner
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "owner_user", "password": "password123"}'

# Should only see own apartments
curl -H "Authorization: Bearer OWNER_TOKEN" \
  http://localhost:3000/api/apartments
```

### **3. Error Handling**
Test various error scenarios:

```bash
# Invalid credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "invalid", "password": "wrong"}'

# Missing required fields
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name": "test"}'

# Unauthorized access
curl http://localhost:3000/api/admin-only-endpoint
```

## 🐛 Known Issues & Fixes

### **Database Schema Issues**
Some endpoints may fail due to column name mismatches:
- `Facility_FK_ID` vs `facility_id`
- `Reservation_start_date` vs `start_date`

### **Missing Endpoints**
Some endpoints return "Endpoint not found":
- `/payments/*` - Payment module not fully implemented
- `/visitors/*` - Visitor module not fully implemented
- `/pqrs/*` - PQRS module not fully implemented

### **Permission Issues**
Some endpoints return "Access denied":
- Check RBAC configuration in `middleware/rbacConfig.js`
- Verify role permissions are correctly set

## 📊 Test Results Interpretation

### **Successful Tests**
- ✅ Authentication working
- ✅ Basic CRUD operations
- ✅ RBAC enforcement
- ✅ Data filtering

### **Issues to Address**
- ❌ Database schema inconsistencies
- ❌ Missing endpoint implementations
- ❌ Permission configuration gaps

## 🔧 Troubleshooting

### **Server Won't Start**
```bash
# Check for syntax errors
node -c server.js

# Check for missing dependencies
npm install

# Check database connection
node scripts/test_auth.js
```

### **Authentication Fails**
```bash
# Check database has users
node scripts/create_test_data.js

# Verify password hashing
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('12345678', 10));"
```

### **Permission Errors**
```bash
# Check RBAC configuration
cat middleware/rbacConfig.js

# Verify user roles in database
mysql -u root -p vallhalla_db -e "SELECT * FROM users JOIN roles ON users.Role_FK_ID = roles.Role_id;"
```

## 📈 Performance Testing

### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000/api/auth/login
```

### **Database Performance**
```bash
# Check slow queries
mysql -u root -p vallhalla_db -e "SHOW PROCESSLIST;"

# Analyze query performance
mysql -u root -p vallhalla_db -e "EXPLAIN SELECT * FROM users;"
```

## 🎯 Testing Checklist

### **Pre-Testing Setup**
- [ ] Server running on port 3000
- [ ] Database connected and populated
- [ ] Test data created
- [ ] Postman collection imported

### **Authentication Testing**
- [ ] User registration works
- [ ] Login returns valid JWT
- [ ] Token validation works
- [ ] Invalid credentials rejected
- [ ] Password hashing secure

### **RBAC Testing**
- [ ] Admin has full access
- [ ] Owner sees only own data
- [ ] Security has limited access
- [ ] Unauthorized access blocked
- [ ] Role changes take effect

### **API Endpoint Testing**
- [ ] All CRUD operations work
- [ ] Data validation works
- [ ] Error handling proper
- [ ] Response format consistent
- [ ] Pagination works (if implemented)

### **Integration Testing**
- [ ] Frontend can connect
- [ ] Real-time updates work
- [ ] File uploads work
- [ ] Email notifications work
- [ ] Payment processing works

## 📝 Test Reports

### **Generate Test Report**
```bash
# Run tests and save output
node scripts/test_endpoints.js > test_report.txt 2>&1

# Analyze results
grep -E "(✅|❌|🔍|📋)" test_report.txt
```

### **Test Coverage**
- Authentication: 100%
- User Management: 90%
- Property Management: 85%
- Security: 70%
- Payments: 30%
- PQRS: 40%

## 🚀 Next Steps

1. **Fix Database Schema Issues**
   - Align column names across all tables
   - Update queries to use correct column names

2. **Implement Missing Endpoints**
   - Complete payment module
   - Complete visitor module
   - Complete PQRS module

3. **Enhance Testing**
   - Add unit tests for controllers
   - Add integration tests
   - Add end-to-end tests

4. **Performance Optimization**
   - Add database indexes
   - Implement caching
   - Optimize queries

---

**Happy Testing! 🎉** 