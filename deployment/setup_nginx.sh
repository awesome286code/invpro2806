#!/bin/bash

# Configuration paths
NGINX_CONF="/etc/nginx/nginx.conf"
SITE_AVAIL="/etc/nginx/sites-available/investment-v2"
SITE_ENAB="/etc/nginx/sites-enabled/investment-v2"
DEFAULT_ENAB="/etc/nginx/sites-enabled/default"

echo "🚀 Starting Nginx Automation for InvestmentV2..."

# Ensure we are running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use sudo)"
  exit
fi

# 1. Backup and Create clean /etc/nginx/nginx.conf
echo "📝 Updating main nginx.conf..."
mv $NGINX_CONF "${NGINX_CONF}.bak_$(date +%Y%m%d%H%M%S)"
cat > $NGINX_CONF << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Load project configs
    include /etc/nginx/sites-enabled/*;
}
EOF

# 2. Create the site configuration in sites-available
echo "📝 Creating site configuration..."
cat > $SITE_AVAIL << 'EOF'
server {
    listen 80;
    server_name _;
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    # SSL Certificates (ensure these exist on your VPS)
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;

    # SSL Optimizations
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend Proxy (Docker Port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Proxy (Docker Port 3001)
    location ~ ^/(auth|transactions|portfolios|alerts|settings|analytics) {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO Proxy
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 3. Enable site and remove default
echo "🔗 Enabling site and cleaning up..."
# Remove default if it exists
if [ -L "$DEFAULT_ENAB" ]; then
    rm "$DEFAULT_ENAB"
fi

# Link our new config
ln -sf "$SITE_AVAIL" "$SITE_ENAB"

# 4. Verify and Restart
echo "🔄 Verifying and Restarting Nginx..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo "✅ Nginx setup complete and restarted successfully!"
else
    echo "❌ Nginx configuration test failed. Please check the errors above."
fi
