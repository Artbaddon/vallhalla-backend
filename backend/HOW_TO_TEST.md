# 🧪 How to Test the Vallhalla API

## 🚀 Quick Start

Your Vallhalla API is now running and ready for testing! Here are the different ways you can test it:

## 📋 Testing Methods

### **1. Quick Test (Recommended for first-time users)**
```bash
cd backend
node scripts/quick_test.js
```
This runs a quick health check and tests the core functionality.

### **2. Full Demonstration**
```bash
cd backend
node scripts/demo.js
```
This provides a comprehensive demonstration of all API features with detailed output.

### **3. Comprehensive Testing**
```bash
cd backend
node scripts/test_endpoints.js
```
This runs all endpoint tests and shows detailed results.

### **4. Authentication Testing**
```bash
cd backend
node scripts/test_auth.js
```
This specifically tests the authentication system.

## 🌐 Manual Testing with Postman

### **Step 1: Import Collection**
1. Open Postman
2. Click "Import"
3. Select `backend/postman_collection.json`
4. The collection will be imported with all endpoints organized by module

### **Step 2: Set Environment Variables**
1. Create a new environment in Postman
2. Add these variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `authToken`: (leave empty, will be set automatically)

### **Step 3: Run Tests**
1. **Start with "00_Collection_Runner"** - This runs a quick smoke test
2. **Then "00_Authentication"** - This tests the login flow
3. **Individual module tests** - Test specific functionality

## 🔧 Manual Testing with curl

### **Basic Authentication Flow**
```bash
# 1. Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "12345678"}'

# 2. Use the token for authenticated requests
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/users
```

### **PowerShell Alternative**
```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username": "admin", "password": "12345678"}'

# Use token
$headers = @{Authorization = "Bearer $($response.token)"}
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Headers $headers
```

## 🎯 What to Test

### **✅ Core Functionality (Working)**
- **Authentication**: Login, token validation, password hashing
- **User Management**: CRUD operations, role-based access
- **Property Management**: Apartments, owners, towers
- **RBAC**: Role-based access control enforcement
- **Error Handling**: Proper error responses

### **⚠️ Areas Needing Attention**
- **Payment Module**: Partially implemented
- **Visitor Management**: Partially implemented  
- **PQRS Module**: Partially implemented
- **Database Schema**: Some column name inconsistencies

## 🔍 Testing Scenarios

### **1. Authentication Testing**
```bash
# Test valid login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "12345678"}'

# Test invalid credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "invalid", "password": "wrong"}'
```

### **2. RBAC Testing**
```bash
# Test admin access (should work)
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/users

# Test restricted access (should be denied)
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/user-status
```

### **3. Data Filtering Testing**
```bash
# Test that users only see their own data
curl -H "Authorization: Bearer OWNER_TOKEN" \
  http://localhost:3000/api/apartments
```

## 📊 Expected Test Results

### **✅ Successful Tests Should Show**
- Authentication returns valid JWT tokens
- Users can access authorized endpoints
- Data is properly filtered by user role
- Error messages are clear and helpful
- Response formats are consistent

### **❌ Common Issues to Watch For**
- Database connection errors
- Missing authentication tokens
- Permission denied errors (expected for restricted endpoints)
- Column name mismatches in database queries

## 🛠️ Troubleshooting

### **Server Won't Start**
```bash
# Check for syntax errors
node -c server.js

# Check dependencies
npm install

# Check database connection
node scripts/test_auth.js
```

### **Authentication Fails**
```bash
# Create test data
node scripts/create_test_data.js

# Check database has users
mysql -u root -p vallhalla_db -e "SELECT * FROM users;"
```

### **Permission Errors**
```bash
# Check RBAC configuration
cat middleware/rbacConfig.js

# Verify user roles
mysql -u root -p vallhalla_db -e "SELECT * FROM users JOIN roles ON users.Role_FK_ID = roles.Role_id;"
```

## 📈 Performance Testing

### **Load Testing**
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000/api/auth/login
```

### **Database Performance**
```bash
# Check slow queries
mysql -u root -p vallhalla_db -e "SHOW PROCESSLIST;"
```

## 🎯 Testing Checklist

### **Pre-Testing**
- [ ] Server running on port 3000
- [ ] Database connected
- [ ] Test data created
- [ ] Postman collection imported

### **Core Testing**
- [ ] Authentication works
- [ ] RBAC enforcement works
- [ ] User management works
- [ ] Property management works
- [ ] Error handling works

### **Advanced Testing**
- [ ] Different user roles tested
- [ ] Data filtering verified
- [ ] Performance acceptable
- [ ] Security measures working

## 📝 Test Reports

### **Generate Test Report**
```bash
# Run tests and save output
node scripts/test_endpoints.js > test_report.txt 2>&1

# Analyze results
grep -E "(✅|❌|🔍|📋)" test_report.txt
```

## 🚀 Next Steps After Testing

1. **Fix any issues found** during testing
2. **Complete missing modules** (payments, visitors, PQRS)
3. **Integrate with frontend** application
4. **Add more comprehensive tests** (unit tests, integration tests)
5. **Optimize performance** based on test results

## 📚 Additional Resources

- **API Reference**: `docs/API_REFERENCE.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **Development Guide**: `docs/DEVELOPMENT_GUIDE.md`
- **Testing Guide**: `TESTING_GUIDE.md`

---

**Happy Testing! 🎉**

Your Vallhalla API is ready to be tested and integrated with your frontend application. The core functionality is working well, and you have a solid foundation to build upon. 