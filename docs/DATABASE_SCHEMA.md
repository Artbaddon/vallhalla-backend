# Database Schema Documentation

Complete database schema documentation for the Vallhalla Property Management System.

## Overview

The Vallhalla database is designed as a relational database using MySQL, with a focus on property management, user management, and financial tracking. The schema supports multi-role access control and maintains data integrity through foreign key relationships.

## Database Configuration

- **Database Engine**: MySQL 8.0+
- **Character Set**: UTF-8
- **Collation**: utf8mb4_unicode_ci
- **InnoDB Storage Engine**: For ACID compliance and foreign key support

## Core Tables

### User Management Tables

#### 1. `users` - Main User Accounts
Primary table for user authentication and basic information.

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_status_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_status_id) REFERENCES user_status(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

**Columns:**
- `id` - Primary key, auto-incrementing
- `username` - Unique username for login
- `password` - Hashed password (bcrypt)
- `user_status_id` - Reference to user status
- `role_id` - Reference to user role
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

#### 2. `user_status` - User Status Definitions
Defines possible user account statuses.

```sql
CREATE TABLE user_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Active
- `2` - Inactive
- `3` - Suspended
- `4` - Pending

#### 3. `roles` - User Roles
Defines system roles for access control.

```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Admin (Full system access)
- `2` - Staff (Limited administrative access)
- `3` - Owner (Property owner access)
- `4` - Security (Security personnel access)

#### 4. `profile` - User Profile Information
Extended user information and contact details.

```sql
CREATE TABLE profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    document_type_id INT,
    document_number VARCHAR(50),
    birth_date DATE,
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Property Management Tables

#### 5. `apartments` - Apartment Information
Core table for apartment/building unit management.

```sql
CREATE TABLE apartments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    apartment_number VARCHAR(20) NOT NULL,
    status_id INT NOT NULL,
    tower_id INT NOT NULL,
    owner_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES apartment_status(id),
    FOREIGN KEY (tower_id) REFERENCES towers(id),
    FOREIGN KEY (owner_id) REFERENCES owners(id)
);
```

**Columns:**
- `id` - Primary key
- `apartment_number` - Unique apartment identifier
- `status_id` - Current apartment status
- `tower_id` - Building tower reference
- `owner_id` - Current owner (nullable for unassigned)

#### 6. `apartment_status` - Apartment Status Definitions
Defines possible apartment statuses.

```sql
CREATE TABLE apartment_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Occupied
- `2` - Available
- `3` - Under Maintenance
- `4` - Reserved

#### 7. `towers` - Building Towers
Defines building towers or sections.

```sql
CREATE TABLE towers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    floors INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. `owners` - Property Owners
Links users to property ownership.

```sql
CREATE TABLE owners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    is_tenant BOOLEAN DEFAULT FALSE,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**
- `id` - Primary key
- `user_id` - Reference to user account
- `is_tenant` - Whether owner is also a tenant
- `birth_date` - Owner's birth date

#### 9. `tenants` - Property Tenants
Manages tenant information for rental properties.

```sql
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    document_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    owner_id BIGINT NOT NULL,
    apartment_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id),
    FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);
```

### Financial Management Tables

#### 10. `payments` - Payment Records
Tracks all financial transactions.

```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    status_id INT NOT NULL,
    owner_id BIGINT NOT NULL,
    reference_number VARCHAR(50),
    payment_method_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES payment_status(id),
    FOREIGN KEY (owner_id) REFERENCES owners(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);
```

**Columns:**
- `id` - Primary key
- `amount` - Payment amount
- `payment_date` - Date of payment
- `status_id` - Payment status
- `owner_id` - Property owner
- `reference_number` - Payment reference
- `payment_method_id` - Method of payment
- `description` - Payment description

#### 11. `payment_status` - Payment Status Definitions
Defines possible payment statuses.

```sql
CREATE TABLE payment_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Paid
- `2` - Pending
- `3` - Overdue
- `4` - Cancelled

#### 12. `payment_methods` - Payment Method Definitions
Defines available payment methods.

```sql
CREATE TABLE payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Cash
- `2` - Bank Transfer
- `3` - Credit Card
- `4` - Debit Card
- `5` - Check

### Facility Management Tables

#### 13. `facilities` - Available Facilities
Defines facilities available for reservation.

```sql
CREATE TABLE facilities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INT,
    status ENUM('available', 'maintenance', 'unavailable') DEFAULT 'available',
    hourly_rate DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 14. `reservations` - Facility Reservations
Tracks facility bookings and reservations.

```sql
CREATE TABLE reservations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status_id INT NOT NULL,
    total_cost DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (status_id) REFERENCES reservation_status(id)
);
```

#### 15. `reservation_status` - Reservation Status Definitions
Defines possible reservation statuses.

```sql
CREATE TABLE reservation_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Confirmed
- `2` - Pending
- `3` - Cancelled
- `4` - Completed

#### 16. `reservation_types` - Reservation Type Definitions
Defines types of reservations.

```sql
CREATE TABLE reservation_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Communication & Support Tables

#### 17. `pqrs` - Petitions, Complaints, Claims
Manages user petitions, complaints, and claims.

```sql
CREATE TABLE pqrs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    owner_id BIGINT NOT NULL,
    status_id INT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES pqrs_categories(id),
    FOREIGN KEY (owner_id) REFERENCES owners(id),
    FOREIGN KEY (status_id) REFERENCES pqrs_status(id)
);
```

#### 18. `pqrs_categories` - PQRS Categories
Defines categories for PQRS classification.

```sql
CREATE TABLE pqrs_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Maintenance
- `2` - Complaint
- `3` - Suggestion
- `4` - Information Request

#### 19. `pqrs_status` - PQRS Status Definitions
Defines possible PQRS statuses.

```sql
CREATE TABLE pqrs_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Open
- `2` - In Progress
- `3` - Resolved
- `4` - Closed

#### 20. `pqrs_tracking` - PQRS Status Tracking
Tracks status changes for PQRS items.

```sql
CREATE TABLE pqrs_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pqrs_id BIGINT NOT NULL,
    status_id INT NOT NULL,
    user_id BIGINT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pqrs_id) REFERENCES pqrs(id),
    FOREIGN KEY (status_id) REFERENCES pqrs_status(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 21. `notifications` - System Notifications
Manages system notifications and alerts.

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient_id BIGINT NOT NULL,
    recipient_type ENUM('user', 'owner', 'admin') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);
```

#### 22. `surveys` - Survey Management
Manages surveys and questionnaires.

```sql
CREATE TABLE surveys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 23. `questions` - Survey Questions
Defines questions for surveys.

```sql
CREATE TABLE questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    survey_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    type ENUM('text', 'rating', 'multiple_choice', 'yes_no') NOT NULL,
    options JSON,
    required BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);
```

### Security & Access Control Tables

#### 24. `visitors` - Visitor Records
Tracks visitor information and access.

```sql
CREATE TABLE visitors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    identification VARCHAR(50) NOT NULL,
    host_id BIGINT NOT NULL,
    visit_date DATE NOT NULL,
    enter_time TIME,
    exit_time TIME,
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES owners(id)
);
```

#### 25. `guards` - Security Personnel
Manages security guard information.

```sql
CREATE TABLE guards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    identification VARCHAR(50) NOT NULL,
    shift ENUM('morning', 'afternoon', 'night') NOT NULL,
    arl_number VARCHAR(50),
    eps_number VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 26. `parking` - Parking Management
Manages parking spaces and assignments.

```sql
CREATE TABLE parking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    space_number VARCHAR(20) NOT NULL,
    status_id INT NOT NULL,
    vehicle_type_id INT,
    user_id BIGINT,
    license_plate VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES parking_status(id),
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 27. `parking_status` - Parking Status Definitions
Defines possible parking space statuses.

```sql
CREATE TABLE parking_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Available
- `2` - Occupied
- `3` - Reserved
- `4` - Maintenance

#### 28. `vehicle_types` - Vehicle Type Definitions
Defines types of vehicles.

```sql
CREATE TABLE vehicle_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Default Values:**
- `1` - Car
- `2` - Motorcycle
- `3` - Truck
- `4` - Van

#### 29. `pets` - Pet Registration
Manages pet information for residents.

```sql
CREATE TABLE pets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    owner_id BIGINT NOT NULL,
    vaccination_card VARCHAR(255),
    photos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id)
);
```

### Permission System Tables

#### 30. `permissions` - System Permissions
Defines granular system permissions.

```sql
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    module VARCHAR(50),
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 31. `role_permissions` - Role-Permission Mappings
Links roles to specific permissions.

```sql
CREATE TABLE role_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);
```

#### 32. `modules` - System Modules
Defines system modules for permission organization.

```sql
CREATE TABLE modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Relationships

### Foreign Key Relationships

1. **User Hierarchy:**
   - `users` → `user_status` (user_status_id)
   - `users` → `roles` (role_id)
   - `profile` → `users` (user_id)

2. **Property Management:**
   - `apartments` → `apartment_status` (status_id)
   - `apartments` → `towers` (tower_id)
   - `apartments` → `owners` (owner_id)
   - `owners` → `users` (user_id)

3. **Financial Management:**
   - `payments` → `payment_status` (status_id)
   - `payments` → `owners` (owner_id)
   - `payments` → `payment_methods` (payment_method_id)

4. **Facility Management:**
   - `reservations` → `owners` (owner_id)
   - `reservations` → `facilities` (facility_id)
   - `reservations` → `reservation_status` (status_id)

5. **Communication:**
   - `pqrs` → `pqrs_categories` (category_id)
   - `pqrs` → `owners` (owner_id)
   - `pqrs` → `pqrs_status` (status_id)
   - `pqrs_tracking` → `pqrs` (pqrs_id)
   - `pqrs_tracking` → `pqrs_status` (status_id)
   - `pqrs_tracking` → `users` (user_id)

6. **Security:**
   - `visitors` → `owners` (host_id)
   - `parking` → `parking_status` (status_id)
   - `parking` → `vehicle_types` (vehicle_type_id)
   - `parking` → `users` (user_id)
   - `pets` → `owners` (owner_id)

7. **Permission System:**
   - `role_permissions` → `roles` (role_id)
   - `role_permissions` → `permissions` (permission_id)

## Indexes

### Primary Indexes
- All tables have auto-incrementing primary keys
- Unique constraints on username, email, apartment_number, space_number

### Performance Indexes
```sql
-- User authentication
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role_id);

-- Property queries
CREATE INDEX idx_apartments_owner ON apartments(owner_id);
CREATE INDEX idx_apartments_status ON apartments(status_id);
CREATE INDEX idx_apartments_tower ON apartments(tower_id);

-- Financial queries
CREATE INDEX idx_payments_owner ON payments(owner_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status_id);

-- Reservation queries
CREATE INDEX idx_reservations_owner ON reservations(owner_id);
CREATE INDEX idx_reservations_facility ON reservations(facility_id);
CREATE INDEX idx_reservations_date ON reservations(start_date, end_date);

-- PQRS queries
CREATE INDEX idx_pqrs_owner ON pqrs(owner_id);
CREATE INDEX idx_pqrs_status ON pqrs(status_id);
CREATE INDEX idx_pqrs_category ON pqrs(category_id);

-- Security queries
CREATE INDEX idx_visitors_host ON visitors(host_id);
CREATE INDEX idx_visitors_date ON visitors(visit_date);
CREATE INDEX idx_parking_user ON parking(user_id);
CREATE INDEX idx_parking_status ON parking(status_id);
```

## Data Integrity Constraints

### Check Constraints
```sql
-- Payment amounts must be positive
ALTER TABLE payments ADD CONSTRAINT chk_payment_amount CHECK (amount > 0);

-- Reservation dates must be valid
ALTER TABLE reservations ADD CONSTRAINT chk_reservation_dates CHECK (start_date < end_date);

-- Apartment numbers must be unique per tower
ALTER TABLE apartments ADD CONSTRAINT chk_unique_apartment_tower UNIQUE (apartment_number, tower_id);
```

### Triggers

#### Audit Trail Trigger
```sql
DELIMITER //
CREATE TRIGGER audit_user_changes
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.role_id != NEW.role_id THEN
        INSERT INTO audit_log (table_name, record_id, action, old_value, new_value, user_id)
        VALUES ('users', NEW.id, 'role_change', OLD.role_id, NEW.role_id, @current_user_id);
    END IF;
END//
DELIMITER ;
```

## Backup and Recovery

### Backup Strategy
```sql
-- Full database backup
mysqldump -u username -p vallhalla_db > backup_$(date +%Y%m%d_%H%M%S).sql

-- Incremental backup (using binary logs)
mysqlbinlog --start-datetime="2024-01-01 00:00:00" mysql-bin.* > incremental_backup.sql
```

### Recovery Procedures
```sql
-- Restore from full backup
mysql -u username -p vallhalla_db < backup_file.sql

-- Point-in-time recovery
mysqlbinlog --start-datetime="2024-01-01 00:00:00" --stop-datetime="2024-01-01 23:59:59" mysql-bin.* | mysql -u username -p
```

## Performance Optimization

### Query Optimization
- Use appropriate indexes for frequently queried columns
- Implement query caching for read-heavy operations
- Use connection pooling for better resource management
- Regular table maintenance and optimization

### Monitoring
- Monitor slow query log
- Track table sizes and growth
- Monitor index usage statistics
- Regular performance analysis

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use parameterized queries to prevent SQL injection
- Implement proper access controls
- Regular security audits

### Compliance
- GDPR compliance for personal data
- Data retention policies
- Audit trail maintenance
- Privacy protection measures 