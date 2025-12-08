# Vallhalla API - Property Management System

A comprehensive property management API system with role-based access control (RBAC) for managing apartments, owners, payments, reservations, and more.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Database Schema](#database-schema)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🏗️ Overview

Vallhalla API is a Node.js-based property management system designed to handle:

- **Property Management**: Apartments, towers, and building management
- **User Management**: Multi-role user system (Admin, Owner, Security)
- **Financial Management**: Payments, billing, and financial tracking
- **Facility Management**: Reservations, facilities, and scheduling
- **Communication**: PQRS (Petitions, Complaints, Claims), notifications
- **Security**: Visitor management, parking, and access control

## ✨ Features

### Core Features
- 🔐 **Role-Based Access Control (RBAC)**: Secure multi-role authentication
- 🏢 **Property Management**: Complete apartment and building management
- 👥 **User Management**: Multi-tier user system with profiles
- 💰 **Payment Processing**: Payment tracking and management
- 📅 **Reservation System**: Facility booking and scheduling
- 🚗 **Parking Management**: Parking space allocation and tracking
- 🐕 **Pet Management**: Pet registration and tracking
- 👥 **Tenant Management**: Tenant registration and management
- 📝 **PQRS System**: Petition, complaint, and claim management
- 📊 **Survey System**: Survey creation and response management
- 🚪 **Visitor Management**: Visitor registration and tracking
- 🔔 **Notification System**: Real-time notifications
- 📈 **Reporting**: Comprehensive reporting and analytics

### Technical Features
- 🚀 **RESTful API**: Clean, RESTful API design
- 🔒 **JWT Authentication**: Secure token-based authentication
- 📊 **MySQL Database**: Robust relational database
- 🛡️ **Input Validation**: Comprehensive data validation
- 📝 **File Upload**: Image and document upload capabilities
- 🔍 **Search & Filter**: Advanced search and filtering
- 📱 **CORS Support**: Cross-origin resource sharing
- 🧪 **Testing**: Comprehensive test suite

## 🏛️ Architecture

### Project Structure
```
vallhalla-api/
├── backend/
│   ├── app/
│   │   └── app.js                 # Main application setup
│   ├── config/
│   │   └── db/
│   │       └── connectMysql.js    # Database connection
│   ├── controllers/               # Business logic layer
│   ├── middleware/                # Authentication & authorization
│   ├── models/                    # Data models
│   ├── routers/                   # Route definitions
│   ├── scripts/                   # Utility scripts
│   ├── test/                      # Test files
│   └── utils/                     # Utility functions
├── frontend/                      # Frontend application
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   ├── scripts/               # JavaScript files
│   │   └── styles/                # CSS files
└── docs/                          # Documentation
```

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Frontend**: HTML, CSS, JavaScript
- **Testing**: Jest, Supertest

## 👥 User Roles & Permissions

### Role Hierarchy

#### 1. **Admin (Role ID: 1)**
- **Full system access** - Can manage all aspects of the system
- **User management** - Create, read, update, delete all users
- **System configuration** - Manage roles, permissions, and settings
- **Financial oversight** - Access to all payment and financial data
- **Reporting** - Generate comprehensive system reports

#### 2. **Owner (Role ID: 3)**
- **Dashboard access** - View main dashboard with news and announcements
- **Profile management** - Update personal information
- **Property viewing** - View apartment information (read-only)
- **Parking management**:
  - View all parking spaces
  - View detailed info for unoccupied spaces only
  - Reserve and pay for parking spaces
- **Payment management** - View and make payments for properties
- **Pet management** - Full CRUD for their own pets
- **Tenant management** - Full CRUD for their own tenants
- **PQRS system** - Create and view their own petitions/complaints
- **Reservation system**:
  - Make facility reservations
  - View all reservations in calendar
  - View and delete their own reservations
- **Survey participation** - View and respond to surveys

#### 3. **Security/Guard (Role ID: 4)**
- **Visitor management** - Register and manage visitors
- **Parking oversight** - View and assign parking spaces
- **Profile management** - Update personal information
- **Access control** - Monitor building access

### Permission Matrix

| Feature | Admin | Owner | Security |
|---------|-------|-------|----------|
| User Management | ✅ Full | ❌ | ❌ |
| Property Management | ✅ Full | ✅ View Only | ❌ |
| Payment Management | ✅ Full | ✅ Own Only | ❌ |
| Reservation Management | ✅ Full | ✅ Own + Create | ❌ |
| PQRS Management | ✅ Full | ✅ Own Only | ❌ |
| Pet Management | ✅ Full | ✅ Own Only | ❌ |
| Tenant Management | ✅ Full | ✅ Own Only | ❌ |
| Visitor Management | ✅ Full | ❌ | ✅ Full |
| Parking Management | ✅ Full | ✅ Limited | ✅ Assign |
| Survey Management | ✅ Full | ✅ Respond | ❌ |

## 🔌 API Documentation

### Swagger / OpenAPI
- `docs/openapi.yaml` contiene la especificación completa generada a partir de `backend/postman_collection.json`.
- Ejecuta `npm run openapi:generate` desde `backend/` para regenerar la especificación (usa las variables `SWAGGER_BASE_URL` y `SWAGGER_ROOT_URL` si necesitas apuntar a otro entorno).
- Importa el archivo YAML en Swagger UI, Stoplight, Insomnia o cualquier visor compatible para obtener documentación navegable y probar los endpoints.
- Puedes versionar el archivo en pipelines o adjuntarlo a portales externos para mantener la documentación sincronizada con la colección Postman.

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "12345678"
}
```

#### Validate Token
```http
GET /api/auth/validate-token
Authorization: Bearer <token>
```

### Core Endpoints

#### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

#### Apartments
- `GET /api/apartments` - Get all apartments
- `POST /api/apartments` - Create apartment (Admin only)
- `GET /api/apartments/:id` - Get apartment by ID
- `PUT /api/apartments/:id` - Update apartment (Admin only)
- `DELETE /api/apartments/:id` - Delete apartment (Admin only)

#### Payments
- `GET /api/payments` - Get all payments (Admin) / Own payments (Owner)
- `POST /api/payments` - Create payment (Admin, Owner)
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id` - Update payment (Admin only)
- `DELETE /api/payments/:id` - Delete payment (Admin only)

#### Reservations
- `GET /api/reservations` - Get all reservations (Admin) / Own reservations (Owner)
- `POST /api/reservations` - Create reservation (Admin, Owner)
- `GET /api/reservations/:id` - Get reservation by ID
- `PUT /api/reservations/:id` - Update reservation (Admin, Owner)
- `DELETE /api/reservations/:id` - Delete reservation (Admin, Owner)

### Complete API Reference

For a complete list of all endpoints, see the [Postman Collection](backend/postman_collection.json) or run the server and visit the API documentation.

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd vallhalla-api
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=vallhalla_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=./data/uploads
MAX_FILE_SIZE=5242880
```

4. **Database Setup**
```bash
# Create database
mysql -u root -p
CREATE DATABASE vallhalla_db;

# Run migrations
npm run migrate
```

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Vallhalla API** - Building the future of property management, one API call at a time. 🏢✨ 
