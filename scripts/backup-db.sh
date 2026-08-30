#!/bin/bash

# Database Backup Script
# Run this regularly to backup your database

set -e

BACKUP_DIR="/var/backups/investment-v2"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

echo "🗄️  Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
docker-compose exec -T postgres pg_dump -U postgres investment_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up"
echo "📊 Current backups:"
ls -lh $BACKUP_DIR
