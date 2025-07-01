# Development Guide

Complete development guide for the Vallhalla Property Management System.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Environment](#development-environment)
- [Coding Standards](#coding-standards)
- [API Development](#api-development)
- [Database Development](#database-development)
- [Testing](#testing)
- [Frontend Development](#frontend-development)
- [Debugging](#debugging)
- [Version Control](#version-control)
- [Code Review Process](#code-review-process)

## Getting Started

### Prerequisites

#### Required Software
- **Node.js**: v18.0.0 or higher
- **MySQL**: v8.0.0 or higher
- **Git**: Latest version
- **VS Code** (recommended) or any code editor
- **Postman** or similar API testing tool

#### Optional Software
- **Docker**: For containerized development
- **Redis**: For caching (if implementing)
- **MongoDB Compass**: If using MongoDB features

### Initial Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd vallhalla-api
```

#### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies (if using a build system)
cd ../frontend
npm install
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Development Environment Variables:**
```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vallhalla_dev
DB_PORT=3306

# JWT Configuration
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=./data/uploads
MAX_FILE_SIZE=5242880

# Development Settings
DEBUG=true
LOG_LEVEL=debug
```

#### 4. Database Setup
```bash
# Create development database
mysql -u root -p
CREATE DATABASE vallhalla_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations
npm run migrate

# Seed development data
npm run seed
```

#### 5. Start Development Server
```bash
# Start with nodemon for auto-reload
npm run dev

# Or start normally
npm start
```

## Project Structure

### Backend Structure
```
backend/
├── app/
│   └── app.js                 # Main application setup
├── config/
│   └── db/
│       └── connectMysql.js    # Database connection
├── controllers/               # Business logic layer
│   ├── user.controller.js
│   ├── apartment.controller.js
│   ├── payment.controller.js
│   └── ...
├── middleware/                # Custom middleware
│   ├── authMiddleware.js      # Authentication
│   ├── rbacConfig.js         # RBAC configuration
│   └── permissionMiddleware.js
├── models/                    # Data models
│   ├── user.model.js
│   ├── apartment.model.js
│   └── ...
├── routers/                   # Route definitions
│   ├── user.router.js
│   ├── apartment.router.js
│   └── ...
├── scripts/                   # Utility scripts
│   ├── create_test_data.js
│   └── test_endpoints.js
├── test/                      # Test files
│   └── permission_system_test.js
├── utils/                     # Utility functions
│   └── fileUpload.js
├── data/                      # Data storage
│   └── uploads/              # File uploads
├── package.json
└── server.js                 # Entry point
```

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/                # Page components
│   │   ├── admin/           # Admin pages
│   │   ├── owner/           # Owner pages
│   │   └── guard/           # Security pages
│   ├── components/          # Reusable components
│   │   ├── common/          # Common components
│   │   ├── navbar/          # Navigation
│   │   └── footer/          # Footer
│   ├── scripts/             # JavaScript files
│   │   ├── components/      # Component scripts
│   │   └── pages/           # Page scripts
│   ├── styles/              # CSS files
│   │   ├── components/      # Component styles
│   │   ├── pages/           # Page styles
│   │   └── utilities/       # Utility classes
│   └── assets/              # Static assets
│       ├── images/          # Images
│       ├── icons/           # Icons
│       └── fonts/           # Fonts
```

## Development Environment

### VS Code Configuration

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-node-debug2"
  ]
}
```

#### Workspace Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/data/uploads": false
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/data/uploads": true
  }
}
```

### Development Tools

#### Nodemon Configuration
```json
{
  "watch": [
    "*.js",
    "controllers/",
    "models/",
    "routers/",
    "middleware/"
  ],
  "ext": "js,json",
  "ignore": [
    "node_modules/",
    "data/uploads/",
    "test/"
  ],
  "env": {
    "NODE_ENV": "development"
  }
}
```

#### ESLint Configuration
```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "warn"
  }
}
```

## Coding Standards

### JavaScript/Node.js Standards

#### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'john';
const getUserById = (id) => { /* ... */ };

// Classes: PascalCase
class UserController { /* ... */ }

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880;
const API_BASE_URL = '/api/v1';

// Database columns: snake_case
const userData = {
  user_name: 'john',
  created_at: new Date()
};
```

#### File Organization
```javascript
// 1. Imports (external libraries first)
import express from 'express';
import jwt from 'jsonwebtoken';

// 2. Internal imports
import UserModel from '../models/user.model.js';
import { ROLES } from '../middleware/rbacConfig.js';

// 3. Constants
const ROUTER_PREFIX = '/users';

// 4. Class/Function definitions
class UserController {
  // Static methods first
  static async getAllUsers(req, res) {
    // Implementation
  }

  // Instance methods
  async createUser(req, res) {
    // Implementation
  }
}

// 5. Export
export default UserController;
```

#### Error Handling
```javascript
// Use try-catch blocks for async operations
async function getUserById(req, res) {
  try {
    const user = await UserModel.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}
```

#### Input Validation
```javascript
// Use express-validator for input validation
import { body, validationResult } from 'express-validator';

const validateUser = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    next();
  }
];
```

### Database Standards

#### Model Structure
```javascript
// models/user.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db/connectMysql.js';

const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user_status',
      key: 'id'
    }
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
UserModel.associate = (models) => {
  UserModel.belongsTo(models.UserStatus, {
    foreignKey: 'user_status_id',
    as: 'status'
  });
  UserModel.belongsTo(models.Role, {
    foreignKey: 'role_id',
    as: 'role'
  });
  UserModel.hasOne(models.Profile, {
    foreignKey: 'user_id',
    as: 'profile'
  });
};

export default UserModel;
```

#### Query Best Practices
```javascript
// Use includes for related data
const users = await UserModel.findAll({
  include: [
    {
      model: UserStatus,
      as: 'status',
      attributes: ['id', 'name']
    },
    {
      model: Profile,
      as: 'profile',
      attributes: ['first_name', 'last_name', 'email']
    }
  ],
  where: {
    role_id: ROLES.OWNER
  },
  order: [['created_at', 'DESC']],
  limit: 10,
  offset: 0
});

// Use transactions for complex operations
const transaction = await sequelize.transaction();
try {
  const user = await UserModel.create(userData, { transaction });
  const profile = await ProfileModel.create(profileData, { transaction });
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## API Development

### RESTful API Design

#### URL Structure
```
GET    /api/users              # Get all users
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user

GET    /api/users/:id/profile  # Get user profile
PUT    /api/users/:id/profile  # Update user profile
```

#### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {
      // Additional error details
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Controller Pattern
```javascript
class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role_id } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (role_id) whereClause.role_id = role_id;
      
      const users = await UserModel.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: UserStatus,
            as: 'status',
            attributes: ['id', 'name']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          users: users.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.count,
            pages: Math.ceil(users.count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch users'
        }
      });
    }
  }
  
  // Get user by ID
  static async getUserById(req, res) {
    try {
      const user = await UserModel.findByPk(req.params.id, {
        include: [
          {
            model: UserStatus,
            as: 'status'
          },
          {
            model: Profile,
            as: 'profile'
          }
        ]
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user'
        }
      });
    }
  }
}
```

### Middleware Development

#### Custom Middleware
```javascript
// middleware/logger.js
export const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors
      }
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists'
      }
    });
  }
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
};
```

## Database Development

### Migration Development

#### Creating Migrations
```javascript
// migrations/001_create_users_table.js
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    user_status_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'user_status',
        key: 'id'
      }
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });
  
  // Add indexes
  await queryInterface.addIndex('users', ['username']);
  await queryInterface.addIndex('users', ['role_id']);
  await queryInterface.addIndex('users', ['user_status_id']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('users');
};
```

#### Running Migrations
```bash
# Run all pending migrations
npm run migrate

# Run specific migration
npm run migrate:up -- --to 001_create_users_table.js

# Rollback last migration
npm run migrate:down

# Check migration status
npm run migrate:status
```

### Seeding Data

#### Creating Seeders
```javascript
// scripts/seed.js
import bcrypt from 'bcrypt';
import UserModel from '../models/user.model.js';
import RoleModel from '../models/role.model.js';
import UserStatusModel from '../models/userStatus.model.js';

export const seedDatabase = async () => {
  try {
    // Create roles
    const roles = await RoleModel.bulkCreate([
      { name: 'Admin', description: 'System administrator' },
      { name: 'Staff', description: 'Administrative staff' },
      { name: 'Owner', description: 'Property owner' },
      { name: 'Security', description: 'Security personnel' }
    ]);
    
    // Create user statuses
    const statuses = await UserStatusModel.bulkCreate([
      { name: 'Active', description: 'Active user account' },
      { name: 'Inactive', description: 'Inactive user account' },
      { name: 'Suspended', description: 'Suspended user account' }
    ]);
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await UserModel.create({
      username: 'admin',
      password: hashedPassword,
      role_id: roles[0].id, // Admin role
      user_status_id: statuses[0].id // Active status
    });
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
```

## Testing

### Unit Testing

#### Test Structure
```javascript
// test/user.test.js
import request from 'supertest';
import app from '../app/app.js';
import UserModel from '../models/user.model.js';
import { ROLES } from '../middleware/rbacConfig.js';

describe('User API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup test data
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    
    authToken = loginResponse.body.data.token;
  });
  
  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should return 403 for non-admin users', async () => {
      // Test with owner token
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${ownerToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        role_id: ROLES.OWNER
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(userData.username);
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
```

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/user.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Testing

#### API Testing
```javascript
// test/integration/auth.test.js
import request from 'supertest';
import app from '../../app/app.js';

describe('Authentication Integration', () => {
  describe('POST /api/auth/login', () => {
    it('should authenticate valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
    
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Frontend Development

### HTML Structure
```html
<!-- pages/admin/dashboard.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Vallhalla</title>
    <link rel="stylesheet" href="../../styles/bootstrap/bootstrap.min.css">
    <link rel="stylesheet" href="../../styles/components/admin/admin_dashboard.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <!-- Navigation content -->
    </nav>
    
    <!-- Main Content -->
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
                <!-- Sidebar content -->
            </nav>
            
            <!-- Main Content Area -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <!-- Dashboard content -->
            </main>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="../../scripts/components/navbarToggle.js"></script>
    <script src="../../scripts/pages/admin/dashboard.js"></script>
</body>
</html>
```

### JavaScript Development
```javascript
// scripts/pages/admin/dashboard.js
class AdminDashboard {
  constructor() {
    this.apiBaseUrl = '/api';
    this.authToken = localStorage.getItem('authToken');
    this.init();
  }
  
  async init() {
    await this.checkAuth();
    this.loadDashboardData();
    this.setupEventListeners();
  }
  
  async checkAuth() {
    if (!this.authToken) {
      window.location.href = '/login.html';
      return;
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/validate-token`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      
      if (!response.ok) {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/login.html';
    }
  }
  
  async loadDashboardData() {
    try {
      const [users, apartments, payments] = await Promise.all([
        this.fetchUsers(),
        this.fetchApartments(),
        this.fetchPayments()
      ]);
      
      this.updateDashboardStats(users, apartments, payments);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      this.showError('Failed to load dashboard data');
    }
  }
  
  async fetchUsers() {
    const response = await fetch(`${this.apiBaseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  }
  
  updateDashboardStats(users, apartments, payments) {
    document.getElementById('total-users').textContent = users.data.length;
    document.getElementById('total-apartments').textContent = apartments.data.length;
    document.getElementById('total-payments').textContent = payments.data.length;
  }
  
  setupEventListeners() {
    // Add event listeners for dashboard interactions
    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.loadDashboardData();
    });
  }
  
  showError(message) {
    // Show error message to user
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger';
    alertDiv.textContent = message;
    document.querySelector('.main-content').prepend(alertDiv);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdminDashboard();
});
```

### CSS Development
```css
/* styles/components/admin/admin_dashboard.css */
.dashboard-container {
  padding: 20px;
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.stats-label {
  font-size: 1rem;
  opacity: 0.9;
}

.chart-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recent-activity {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-time {
  color: #666;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .stats-card {
    margin-bottom: 15px;
  }
  
  .stats-number {
    font-size: 2rem;
  }
}
```

## Debugging

### Backend Debugging

#### Logging
```javascript
// utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

#### Debugging Tools
```javascript
// Add debugging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Use Node.js debugger
// Add this line where you want to break
debugger;
```

### Frontend Debugging

#### Browser Developer Tools
```javascript
// Console logging
console.log('Debug info:', data);
console.error('Error:', error);
console.warn('Warning:', warning);

// Performance monitoring
console.time('operation');
// ... operation code ...
console.timeEnd('operation');

// Group related logs
console.group('User Operations');
console.log('Creating user...');
console.log('User created successfully');
console.groupEnd();
```

#### Error Handling
```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send error to logging service
});

// Promise error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});
```

## Version Control

### Git Workflow

#### Branch Strategy
```bash
# Main branches
main          # Production-ready code
develop       # Development integration branch

# Feature branches
feature/user-management
feature/payment-system
feature/api-authentication

# Hotfix branches
hotfix/critical-bug-fix
```

#### Commit Standards
```bash
# Commit message format
<type>(<scope>): <description>

# Examples
feat(auth): add JWT token validation
fix(api): resolve user creation error
docs(readme): update installation instructions
style(ui): improve button styling
refactor(controllers): simplify user controller
test(api): add user endpoint tests
```

#### Git Commands
```bash
# Create feature branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit changes
git commit -m "feat(api): add user management endpoints"

# Push to remote
git push origin feature/new-feature

# Create pull request
# Merge to develop branch
```

### Code Review Process

#### Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance impact evaluated
- [ ] Error handling implemented
- [ ] No sensitive data exposed

#### Review Comments
```javascript
// Good review comment
// Consider adding input validation for the email field
// to prevent SQL injection attacks

// Better review comment
// The email validation should include:
// 1. Format validation using regex
// 2. Length limits (max 255 characters)
// 3. XSS prevention by escaping special characters
// See: https://owasp.org/www-community/OWASP_Validation_Regex_Repository
```

This development guide provides comprehensive information for developers working on the Vallhalla Property Management System, covering all aspects from initial setup to advanced debugging techniques. 