# Deployment Guide

Complete deployment guide for the Vallhalla Property Management System.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [Production Configuration](#production-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Security Hardening](#security-hardening)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS / CentOS 9 / Windows Server 2022

### Software Requirements

#### Required Software
- **Node.js**: v18.0.0 or higher
- **MySQL**: v8.0.0 or higher
- **Nginx**: v1.18.0 or higher (for production)
- **PM2**: For process management
- **Git**: For version control

#### Optional Software
- **Redis**: For caching and sessions
- **Docker**: For containerized deployment
- **Certbot**: For SSL certificates
- **Fail2ban**: For security

### Network Requirements
- **Port 80**: HTTP (redirected to HTTPS)
- **Port 443**: HTTPS
- **Port 3000**: Application (internal)
- **Port 3306**: MySQL (internal)

## Environment Setup

### 1. Server Preparation

#### Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### Install Node.js
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install MySQL
```bash
# Ubuntu/Debian
sudo apt install mysql-server -y

# CentOS/RHEL
sudo yum install mysql-server -y

# Start and enable MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

#### Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Install PM2
```bash
sudo npm install -g pm2
```

### 2. Firewall Configuration

#### Ubuntu/Debian (UFW)
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### CentOS/RHEL (Firewalld)
```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Database Setup

### 1. MySQL Configuration

#### Secure MySQL Installation
```bash
sudo mysql_secure_installation
```

#### Create Database and User
```sql
-- Connect to MySQL as root
sudo mysql -u root -p

-- Create database
CREATE DATABASE vallhalla_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'vallhalla_user'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON vallhalla_db.* TO 'vallhalla_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

#### MySQL Configuration Optimization
```bash
# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add/update these settings
[mysqld]
# Performance settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Connection settings
max_connections = 200
max_allowed_packet = 64M

# Query cache (if using MySQL 5.7)
query_cache_type = 1
query_cache_size = 64M

# Restart MySQL
sudo systemctl restart mysqld
```

### 2. Database Migration

#### Run Migrations
```bash
cd /path/to/vallhalla-api/backend
npm run migrate
```

#### Seed Initial Data
```bash
# Create initial admin user and basic data
npm run seed
```

## Application Deployment

### 1. Application Setup

#### Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www/vallhalla-api
sudo chown $USER:$USER /var/www/vallhalla-api

# Clone repository
git clone <repository-url> /var/www/vallhalla-api
cd /var/www/vallhalla-api
```

#### Install Dependencies
```bash
cd backend
npm install --production
```

#### Environment Configuration
```bash
# Create environment file
cp .env.example .env
nano .env
```

**Production Environment Variables:**
```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_USER=vallhalla_user
DB_PASSWORD=strong_password_here
DB_NAME=vallhalla_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=/var/www/vallhalla-api/backend/data/uploads
MAX_FILE_SIZE=5242880

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_here

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/vallhalla-api/app.log

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

#### Create Upload Directory
```bash
mkdir -p /var/www/vallhalla-api/backend/data/uploads
chmod 755 /var/www/vallhalla-api/backend/data/uploads
```

### 2. PM2 Configuration

#### Create PM2 Ecosystem File
```bash
# Create ecosystem file
nano ecosystem.config.js
```

**PM2 Ecosystem Configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'vallhalla-api',
    script: 'server.js',
    cwd: '/var/www/vallhalla-api/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/vallhalla-api/err.log',
    out_file: '/var/log/vallhalla-api/out.log',
    log_file: '/var/log/vallhalla-api/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

#### Create Log Directory
```bash
sudo mkdir -p /var/log/vallhalla-api
sudo chown $USER:$USER /var/log/vallhalla-api
```

#### Start Application with PM2
```bash
cd /var/www/vallhalla-api/backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Nginx Configuration

#### Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/vallhalla-api
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Client Max Body Size
    client_max_body_size 10M;
    
    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Static Files
    location /uploads {
        alias /var/www/vallhalla-api/backend/data/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend (if serving static files)
    location / {
        root /var/www/vallhalla-api/frontend/src;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }
    
    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### Enable Site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/vallhalla-api /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. SSL Certificate Setup

#### Install Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

#### Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Set up Auto-renewal
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Production Configuration

### 1. Performance Optimization

#### Node.js Optimization
```bash
# Set Node.js environment variables
export NODE_OPTIONS="--max-old-space-size=1024"
export UV_THREADPOOL_SIZE=64
```

#### Database Optimization
```sql
-- Optimize tables
OPTIMIZE TABLE users, apartments, payments, reservations;

-- Analyze table statistics
ANALYZE TABLE users, apartments, payments, reservations;
```

#### Redis Setup (Optional)
```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis
sudo nano /etc/redis/redis.conf

# Add to application
npm install redis
```

### 2. Monitoring Setup

#### Install Monitoring Tools
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Install PM2 monitoring
pm2 install pm2-server-monit
pm2 install pm2-logrotate
```

#### Configure PM2 Monitoring
```bash
# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 3. Backup Configuration

#### Database Backup Script
```bash
# Create backup script
nano /var/www/vallhalla-api/scripts/backup.sh
```

**Backup Script:**
```bash
#!/bin/bash

# Configuration
DB_NAME="vallhalla_db"
DB_USER="vallhalla_user"
DB_PASS="your_password"
BACKUP_DIR="/var/backups/vallhalla"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# File uploads backup
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/www/vallhalla-api/backend/data/uploads

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

#### Set up Automated Backups
```bash
# Make script executable
chmod +x /var/www/vallhalla-api/scripts/backup.sh

# Add to crontab
crontab -e
# Add this line for daily backups at 2 AM:
0 2 * * * /var/www/vallhalla-api/scripts/backup.sh
```

## Monitoring & Logging

### 1. Application Monitoring

#### PM2 Monitoring Commands
```bash
# View application status
pm2 status

# Monitor resources
pm2 monit

# View logs
pm2 logs vallhalla-api

# Restart application
pm2 restart vallhalla-api

# Reload application (zero downtime)
pm2 reload vallhalla-api
```

#### System Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor disk usage
df -h
du -sh /var/www/vallhalla-api/*

# Monitor memory usage
free -h
```

### 2. Log Management

#### Log Rotation Configuration
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/vallhalla-api
```

**Logrotate Configuration:**
```
/var/log/vallhalla-api/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Log Analysis
```bash
# View recent errors
tail -f /var/log/vallhalla-api/err.log

# Search for specific errors
grep "ERROR" /var/log/vallhalla-api/combined.log

# Monitor API requests
tail -f /var/log/nginx/access.log | grep "/api"
```

## Security Hardening

### 1. Server Security

#### Update System Regularly
```bash
# Set up automatic updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### Configure Fail2ban
```bash
# Install Fail2ban
sudo apt install fail2ban -y

# Configure for SSH and Nginx
sudo nano /etc/fail2ban/jail.local
```

**Fail2ban Configuration:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
```

#### Secure SSH
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

**SSH Security Settings:**
```
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers your_username
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

### 2. Application Security

#### Environment Security
```bash
# Secure environment file
chmod 600 /var/www/vallhalla-api/backend/.env

# Set proper file permissions
find /var/www/vallhalla-api -type f -exec chmod 644 {} \;
find /var/www/vallhalla-api -type d -exec chmod 755 {} \;
chmod +x /var/www/vallhalla-api/backend/server.js
```

#### Database Security
```sql
-- Remove unnecessary users
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Flush privileges
FLUSH PRIVILEGES;
```

## Backup & Recovery

### 1. Backup Strategy

#### Database Backup
```bash
# Full backup
mysqldump -u vallhalla_user -p vallhalla_db > backup_full.sql

# Incremental backup (using binary logs)
mysqlbinlog --start-datetime="2024-01-01 00:00:00" mysql-bin.* > incremental_backup.sql
```

#### File Backup
```bash
# Backup uploads
tar -czf uploads_backup.tar.gz /var/www/vallhalla-api/backend/data/uploads

# Backup configuration
tar -czf config_backup.tar.gz /var/www/vallhalla-api/backend/.env
```

### 2. Recovery Procedures

#### Database Recovery
```bash
# Restore from full backup
mysql -u vallhalla_user -p vallhalla_db < backup_full.sql

# Point-in-time recovery
mysqlbinlog --start-datetime="2024-01-01 00:00:00" --stop-datetime="2024-01-01 23:59:59" mysql-bin.* | mysql -u vallhalla_user -p
```

#### Application Recovery
```bash
# Restore application files
tar -xzf application_backup.tar.gz -C /var/www/vallhalla-api/

# Restore uploads
tar -xzf uploads_backup.tar.gz -C /

# Restart application
pm2 restart vallhalla-api
```

## Troubleshooting

### 1. Common Issues

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs vallhalla-api

# Check application logs
tail -f /var/log/vallhalla-api/err.log

# Check port availability
netstat -tlnp | grep :3000

# Restart PM2
pm2 kill
pm2 start ecosystem.config.js
```

#### Database Connection Issues
```bash
# Test database connection
mysql -u vallhalla_user -p -h localhost vallhalla_db

# Check MySQL status
sudo systemctl status mysqld

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

#### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### 2. Performance Issues

#### High CPU Usage
```bash
# Check process usage
top
htop

# Check Node.js processes
pm2 monit

# Check for memory leaks
pm2 logs vallhalla-api --lines 100
```

#### High Memory Usage
```bash
# Check memory usage
free -h

# Check swap usage
swapon --show

# Restart application
pm2 restart vallhalla-api
```

#### Slow Database Queries
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

### 3. Security Issues

#### Unauthorized Access Attempts
```bash
# Check SSH logs
sudo tail -f /var/log/auth.log

# Check Fail2ban status
sudo fail2ban-client status

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

#### SSL Certificate Issues
```bash
# Check certificate validity
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### 4. Maintenance Commands

#### Regular Maintenance
```bash
# Update application
cd /var/www/vallhalla-api
git pull origin main
npm install --production
pm2 reload vallhalla-api

# Update system
sudo apt update && sudo apt upgrade -y

# Clean up logs
pm2 flush

# Optimize database
mysql -u vallhalla_user -p vallhalla_db -e "OPTIMIZE TABLE users, apartments, payments, reservations;"
```

#### Emergency Procedures
```bash
# Emergency restart
pm2 kill
pm2 start ecosystem.config.js

# Emergency database restart
sudo systemctl restart mysqld

# Emergency web server restart
sudo systemctl restart nginx
```

This deployment guide provides a comprehensive approach to deploying the Vallhalla API in a production environment with proper security, monitoring, and maintenance procedures. 