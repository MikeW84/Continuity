# Personal Life Management System - Ubuntu Server Deployment Documentation

## Project Overview

This document provides comprehensive architecture and deployment details for setting up the Personal Life Management System on an Ubuntu Linux server. The system is designed as a production-ready personal development and life tracking platform with scalable infrastructure.

## Server Architecture

### Technology Stack
- **Operating System**: Ubuntu 20.04 LTS or 22.04 LTS
- **Runtime**: Node.js 18+ with npm/yarn
- **Database**: PostgreSQL 14+
- **Process Manager**: PM2 for production deployment
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt with Certbot
- **Monitoring**: Optional - Prometheus + Grafana
- **Backup**: Automated PostgreSQL backups

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: Stable internet connection

#### Recommended Production Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD with backup storage
- **Network**: High-bandwidth connection

## Initial Server Setup

### 1. System Update and Basic Security

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Create application user
sudo adduser --system --group --home /opt/continuity continuity

# Setup basic firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable root login and setup SSH keys (recommended)
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 2. Node.js Installation

```bash
# Install Node.js 18 LTS via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install global process manager
sudo npm install -g pm2
```

### 3. PostgreSQL Installation and Configuration

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE continuity_db;"
sudo -u postgres psql -c "CREATE USER continuity_user WITH ENCRYPTED PASSWORD 'secure_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE continuity_db TO continuity_user;"
sudo -u postgres psql -c "ALTER USER continuity_user CREATEDB;"

# Configure PostgreSQL for application access
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add line: local continuity_db continuity_user md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4. Nginx Installation and Configuration

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application configuration
sudo nano /etc/nginx/sites-available/continuity
```

**Nginx Configuration** (`/etc/nginx/sites-available/continuity`):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be configured with Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Application proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:5000;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/continuity /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Application Deployment

### 1. Application Setup

```bash
# Switch to application user
sudo su - continuity

# Clone the repository (or upload files)
cd /opt/continuity
git clone https://github.com/your-username/continuity-app.git app
cd app

# Install dependencies
npm install --production

# Create environment configuration
nano .env
```

**Environment Configuration** (`.env`):
```bash
# Database configuration
DATABASE_URL=postgresql://continuity_user:secure_password_here@localhost:5432/continuity_db

# Application configuration
NODE_ENV=production
PORT=5000

# Session configuration
SESSION_SECRET=your-super-secure-session-secret-here

# Optional: Additional configuration
PGHOST=localhost
PGPORT=5432
PGUSER=continuity_user
PGPASSWORD=secure_password_here
PGDATABASE=continuity_db

# Security
CORS_ORIGIN=https://your-domain.com
```

### 2. Database Schema Setup

```bash
# Run database migrations/setup
npm run db:push

# Seed initial data if needed
npm run db:seed
```

### 3. Build Application

```bash
# Build the frontend assets
npm run build

# Verify build completed successfully
ls -la dist/
```

### 4. PM2 Process Management

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**PM2 Configuration** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'continuity-app',
    script: 'npm',
    args: 'start',
    cwd: '/opt/continuity/app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/continuity/error.log',
    out_file: '/var/log/continuity/output.log',
    log_file: '/var/log/continuity/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/continuity
sudo chown continuity:continuity /var/log/continuity

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by the command

# Monitor application
pm2 status
pm2 logs continuity-app
```

## SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 2. Configure Automatic Renewal

```bash
# Add renewal cron job
sudo crontab -e

# Add this line to renew certificates twice daily:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### 1. System Monitoring Setup

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup log rotation for application logs
sudo nano /etc/logrotate.d/continuity
```

**Log Rotation Configuration** (`/etc/logrotate.d/continuity`):
```
/var/log/continuity/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 continuity continuity
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
```

### 2. Database Monitoring

```bash
# Create database monitoring script
sudo nano /opt/continuity/scripts/db-monitor.sh
```

**Database Monitor Script** (`/opt/continuity/scripts/db-monitor.sh`):
```bash
#!/bin/bash

# Database connection check
PGPASSWORD=secure_password_here psql -h localhost -U continuity_user -d continuity_db -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "$(date): Database connection successful"
else
    echo "$(date): Database connection failed" >&2
    # Send alert (email, slack, etc.)
fi

# Check database size
DB_SIZE=$(PGPASSWORD=secure_password_here psql -h localhost -U continuity_user -d continuity_db -t -c "SELECT pg_size_pretty(pg_database_size('continuity_db'));")
echo "$(date): Database size: $DB_SIZE"

# Log to monitoring file
echo "$(date): DB_CHECK=OK SIZE=$DB_SIZE" >> /var/log/continuity/db-monitor.log
```

```bash
# Make script executable
chmod +x /opt/continuity/scripts/db-monitor.sh

# Add to crontab for regular monitoring
sudo -u continuity crontab -e
# Add: */15 * * * * /opt/continuity/scripts/db-monitor.sh
```

## Backup Strategy

### 1. Database Backup Setup

```bash
# Create backup directory
sudo mkdir -p /opt/continuity/backups
sudo chown continuity:continuity /opt/continuity/backups

# Create backup script
nano /opt/continuity/scripts/backup-db.sh
```

**Database Backup Script** (`/opt/continuity/scripts/backup-db.sh`):
```bash
#!/bin/bash

BACKUP_DIR="/opt/continuity/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="continuity_db_backup_$DATE.sql"

# Create database dump
PGPASSWORD=secure_password_here pg_dump -h localhost -U continuity_user -d continuity_db > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "continuity_db_backup_*.sql.gz" -mtime +30 -delete

echo "$(date): Database backup completed: $BACKUP_FILE.gz"
```

```bash
# Make script executable
chmod +x /opt/continuity/scripts/backup-db.sh

# Setup automated backups
sudo -u continuity crontab -e
# Add: 0 2 * * * /opt/continuity/scripts/backup-db.sh >> /var/log/continuity/backup.log 2>&1
```

### 2. Application Backup

```bash
# Create application backup script
nano /opt/continuity/scripts/backup-app.sh
```

**Application Backup Script** (`/opt/continuity/scripts/backup-app.sh`):
```bash
#!/bin/bash

BACKUP_DIR="/opt/continuity/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_BACKUP="continuity_app_backup_$DATE.tar.gz"

# Create application backup (excluding node_modules and logs)
tar -czf "$BACKUP_DIR/$APP_BACKUP" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.git' \
    -C /opt/continuity app

# Remove app backups older than 7 days
find "$BACKUP_DIR" -name "continuity_app_backup_*.tar.gz" -mtime +7 -delete

echo "$(date): Application backup completed: $APP_BACKUP"
```

```bash
# Make script executable
chmod +x /opt/continuity/scripts/backup-app.sh

# Setup weekly app backups
sudo -u continuity crontab -e
# Add: 0 3 * * 0 /opt/continuity/scripts/backup-app.sh >> /var/log/continuity/backup.log 2>&1
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW for specific access
sudo ufw deny ssh
sudo ufw allow from YOUR_IP_ADDRESS to any port 22
sudo ufw allow 80
sudo ufw allow 443

# Enable logging
sudo ufw logging on

# Check status
sudo ufw status verbose
```

### 2. Fail2Ban Setup

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure fail2ban for SSH and Nginx
sudo nano /etc/fail2ban/jail.local
```

**Fail2Ban Configuration** (`/etc/fail2ban/jail.local`):
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 6
```

```bash
# Start and enable fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. System Updates

```bash
# Configure automatic security updates
sudo apt install -y unattended-upgrades

# Configure unattended upgrades
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

**Auto-Update Configuration**:
```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
```

## Performance Optimization

### 1. PostgreSQL Tuning

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**PostgreSQL Optimization** (adjust based on server specs):
```
# Memory settings
shared_buffers = 256MB                # 25% of RAM for 1GB+ systems
effective_cache_size = 1GB            # 75% of RAM
work_mem = 4MB                        # For sorting and hash operations
maintenance_work_mem = 64MB           # For maintenance operations

# Connection settings
max_connections = 100                 # Adjust based on expected load

# Checkpoint settings
checkpoint_completion_target = 0.7
wal_buffers = 16MB

# Query planner
random_page_cost = 1.1               # For SSD storage
effective_io_concurrency = 200       # For SSD storage

# Logging
log_min_duration_statement = 1000    # Log slow queries (1 second)
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

```bash
# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql
```

### 2. Node.js Application Tuning

**Package.json Scripts Update**:
```json
{
  "scripts": {
    "start": "NODE_ENV=production node --max-old-space-size=4096 server/index.js",
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "db:push": "drizzle-kit push:pg"
  }
}
```

### 3. Nginx Caching

```bash
# Add caching configuration to Nginx
sudo nano /etc/nginx/nginx.conf
```

**Nginx Caching Configuration** (add to http block):
```nginx
# Proxy cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m use_temp_path=off;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
```

**Update site configuration** (`/etc/nginx/sites-available/continuity`):
```nginx
# Add to server block
location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:5000;
    # ... other proxy settings
}

location /auth {
    limit_req zone=login burst=5 nodelay;
    proxy_pass http://localhost:5000;
    # ... other proxy settings
}

# Static file caching with proxy cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    proxy_cache app_cache;
    proxy_cache_valid 200 1y;
    proxy_cache_use_stale error timeout invalid_header updating http_500 http_502 http_503 http_504;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Cache-Status $upstream_cache_status;
    proxy_pass http://localhost:5000;
}
```

## Deployment Scripts

### 1. Deployment Automation

```bash
# Create deployment script
nano /opt/continuity/scripts/deploy.sh
```

**Deployment Script** (`/opt/continuity/scripts/deploy.sh`):
```bash
#!/bin/bash

APP_DIR="/opt/continuity/app"
BACKUP_DIR="/opt/continuity/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment at $(date)"

# Create backup before deployment
echo "Creating pre-deployment backup..."
/opt/continuity/scripts/backup-db.sh
/opt/continuity/scripts/backup-app.sh

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install/update dependencies
echo "Installing dependencies..."
npm ci --production

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Build application
echo "Building application..."
npm run build

# Restart application with PM2
echo "Restarting application..."
pm2 restart continuity-app

# Wait for app to start
sleep 10

# Health check
echo "Performing health check..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/projects)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "Deployment successful! Application is responding."
    echo "Deployment completed at $(date)"
else
    echo "Health check failed! HTTP status: $HEALTH_CHECK"
    echo "Rolling back..."
    # Implement rollback logic here
    exit 1
fi
```

```bash
# Make script executable
chmod +x /opt/continuity/scripts/deploy.sh
```

### 2. Health Check Script

```bash
# Create health monitoring script
nano /opt/continuity/scripts/health-check.sh
```

**Health Check Script** (`/opt/continuity/scripts/health-check.sh`):
```bash
#!/bin/bash

LOG_FILE="/var/log/continuity/health-check.log"

# Check application response
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/projects)

# Check database connection
DB_STATUS=$(PGPASSWORD=secure_password_here psql -h localhost -U continuity_user -d continuity_db -c "SELECT 1;" > /dev/null 2>&1 && echo "OK" || echo "FAILED")

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')

# Log results
echo "$(date): APP=$APP_STATUS DB=$DB_STATUS DISK=${DISK_USAGE}% MEM=${MEMORY_USAGE}%" >> $LOG_FILE

# Alert if issues detected
if [ "$APP_STATUS" != "200" ] || [ "$DB_STATUS" != "OK" ] || [ "$DISK_USAGE" -gt 90 ]; then
    echo "$(date): ALERT - System health issues detected" >> $LOG_FILE
    # Send alert notification here (email, webhook, etc.)
fi
```

```bash
# Make script executable
chmod +x /opt/continuity/scripts/health-check.sh

# Add to crontab for regular health checks
sudo -u continuity crontab -e
# Add: */5 * * * * /opt/continuity/scripts/health-check.sh
```

## Maintenance Procedures

### 1. Regular Maintenance Tasks

**Weekly Maintenance Script** (`/opt/continuity/scripts/weekly-maintenance.sh`):
```bash
#!/bin/bash

echo "Starting weekly maintenance at $(date)"

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean package cache
sudo apt autoremove -y
sudo apt autoclean

# Restart services
sudo systemctl restart nginx
pm2 restart all

# Clean application logs older than 30 days
find /var/log/continuity -name "*.log" -mtime +30 -delete

# Vacuum PostgreSQL database
PGPASSWORD=secure_password_here psql -h localhost -U continuity_user -d continuity_db -c "VACUUM ANALYZE;"

echo "Weekly maintenance completed at $(date)"
```

### 2. Troubleshooting Commands

```bash
# Check application status
pm2 status
pm2 logs continuity-app --lines 50

# Check system resources
htop
df -h
free -h

# Check network connections
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :80

# Check database connections
sudo -u postgres psql -c "SELECT datname, numbackends FROM pg_stat_database;"

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check SSL certificate status
sudo certbot certificates

# View system logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

## Environment-Specific Configuration

### Development Environment
```bash
# .env.development
NODE_ENV=development
DATABASE_URL=postgresql://continuity_user:password@localhost:5432/continuity_dev_db
SESSION_SECRET=dev-secret
PORT=5000
```

### Staging Environment
```bash
# .env.staging
NODE_ENV=staging
DATABASE_URL=postgresql://continuity_user:password@localhost:5432/continuity_staging_db
SESSION_SECRET=staging-secret
PORT=5000
```

### Production Environment
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://continuity_user:secure_password@localhost:5432/continuity_db
SESSION_SECRET=super-secure-production-secret
PORT=5000
```

This comprehensive documentation provides everything needed to deploy and maintain the Personal Life Management System on an Ubuntu server, including security hardening, monitoring, backup strategies, and maintenance procedures.