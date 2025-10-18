# 🌱 Seeders Guide

## Overview

The seeders folder contains scripts to populate your database with comprehensive test data. All seeders are numbered to run in the correct order based on foreign key dependencies.

## Quick Start

### 1. Run Migration First
```bash
node migrate.js
```

### 2. Run All Seeders
```bash
node seed_all.js
```

That's it! Your database is now fully populated with test data.

## What Gets Created

### 01 - Towers (6 items)
- Tower A, Tower B, Tower C, Tower D
- North, South

### 02 - Users (16 items)
- 1 Admin (admin)
- 9 Owners (testowner, owner2, owner3, etc.)
- 5 Security Guards (testsecurity, guard1, guard2, etc.)
- 1 Demo admin, owner, security
- Users with different statuses (active, inactive, pending, blocked)

**All passwords:** `password123`

### 03 - Profiles (16 items)
- Full profile information for all users
- Document types, numbers, phone numbers

### 04 - Owners & Guards
- 9 Owners (some are tenants, some own)
- 5 Guards (with ARL, EPS, shift information)

### 05 - Apartments (13 items)
- Apartments across all towers
- Mix of available and occupied status
- Linked to owners

### 06 - Facilities & Reservations
- 7 Facilities (Pool, Gym, Party Room, BBQ Area, Tennis Court, Playground, Coworking)
- 4 Reservations (past, current, future)

### 07 - Parking & Pets
- 8 Vehicle Types (Car, Motorcycle, SUV, Electric Car, etc.)
- 9 Parking Spots (regular, visitor, disabled)
- 8 Pets (dogs and cats with vaccination cards)

### 08 - PQRS & Payments
- 5 PQRS Records (various priorities and categories)
- 6 Payments (different statuses and methods)

### 09 - Surveys & Visitors
- 5 Surveys (active and draft)
- 8 Questions (various types)
- 5 Answers (sample responses)
- 5 Visitors (with enter/exit dates)

### 10 - Notifications (14 items)
- System notifications
- User-specific notifications
- Various types (payment, security, events, etc.)

## Test Scenarios Covered

### User Management
- ✅ Active users
- ✅ Inactive users
- ✅ Pending approval users
- ✅ Blocked users
- ✅ Different roles (Admin, Owner, Security)

### Apartment Management
- ✅ Available apartments
- ✅ Occupied apartments
- ✅ Multiple towers
- ✅ Owner relationships

### Parking
- ✅ Occupied spots
- ✅ Available spots
- ✅ Visitor parking
- ✅ Disabled parking
- ✅ Different vehicle types

### Facilities & Reservations
- ✅ Various facilities
- ✅ Pending reservations
- ✅ Confirmed reservations
- ✅ Completed reservations
- ✅ Future and past dates

### PQRS System
- ✅ Different categories
- ✅ Different priorities (LOW, MEDIUM, HIGH)
- ✅ With and without answers
- ✅ With and without attachments

### Payments
- ✅ Pending payments
- ✅ Completed payments
- ✅ Failed payments
- ✅ Different payment methods
- ✅ Payment history

### Surveys
- ✅ Active surveys
- ✅ Draft surveys
- ✅ Multiple question types
- ✅ Sample answers

### Pets
- ✅ Dogs and cats
- ✅ Different breeds
- ✅ Vaccination records
- ✅ Photos

### Visitors
- ✅ Current visitors (no exit date)
- ✅ Past visitors (with exit date)
- ✅ Different hosts

### Notifications
- ✅ System-wide notifications
- ✅ User-specific notifications
- ✅ Various notification types

## Individual Seeder Files

Located in `backend/migrations/seeders/`:

1. `01_seed_towers.js` - Building towers
2. `02_seed_users.js` - User accounts
3. `03_seed_profiles.js` - User profiles
4. `04_seed_owners_guards.js` - Owners and security guards
5. `05_seed_apartments.js` - Apartment units
6. `06_seed_facilities_reservations.js` - Facilities and reservations
7. `07_seed_parking_pets.js` - Parking spots and pets
8. `08_seed_pqrs_payments.js` - PQRS records and payments
9. `09_seed_surveys_visitors.js` - Surveys and visitors
10. `10_seed_notifications.js` - Notifications

## Running Specific Seeders

If you only need specific data:

```bash
# Only create towers and apartments
node seeders/01_seed_towers.js
node seeders/05_seed_apartments.js

# Only create users and profiles
node seeders/02_seed_users.js
node seeders/03_seed_profiles.js
```

**Note:** Make sure to run seeders in order to avoid foreign key errors!

## Test Data vs Production

### For Testing (use seed_all.js)
- Comprehensive test data
- Multiple scenarios
- Sample records
- Test credentials

### For Production (use seed_basic_data.js)
- Only reference data
- No test users (except admin)
- No sample records
- Minimal data

## Login Credentials

After running `seed_all.js`:

### Admin User
- **Username:** admin
- **Password:** password123
- **Role:** Admin
- **Status:** Active

### Test Owner
- **Username:** testowner
- **Password:** password123
- **Role:** Owner
- **Status:** Active

### Test Security
- **Username:** testsecurity
- **Password:** password123
- **Role:** Security
- **Status:** Active

### Other Test Users
All users created by seeders use password: `password123`

Available usernames:
- owner2, owner3
- guard1, guard2, security2
- demo_admin, demo_owner, demo_security
- john_doe, jane_smith
- inactive_user, pending_user, blocked_user

## Adding Custom Seeders

To create a new seeder:

1. Create a file in `seeders/` folder
2. Follow the naming convention: `##_seed_description.js`
3. Export an async function
4. Add it to `seed_all.js`

Example:

```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

export async function seedMyData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🌱 Seeding my data...');

    // Your seeding logic here

    console.log('   ✓ Data created');
    return { success: true };
  } catch (error) {
    console.error('   ❌ Error:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}
```

## Troubleshooting

### Error: Foreign key constraint fails
Run seeders in the correct order. The numbered prefixes indicate the order.

### Error: Duplicate entry
Drop and recreate the database, then run migrations before seeders.

### Error: Connection refused
Check your database is running and `.env` credentials are correct.

### Need to reset everything
```bash
node migrate.js    # Drops and recreates database
node seed_all.js   # Populates with test data
```

## Summary

- **Total Seeders:** 10
- **Total Records Created:** 150+
- **Time to Run:** ~5-10 seconds
- **Dependencies:** mysql2, bcrypt, dotenv

---

**Created:** October 13, 2025  
**Purpose:** Comprehensive test data for Vallhalla API
