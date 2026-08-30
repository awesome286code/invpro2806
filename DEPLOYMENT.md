# Deployment Guide - Investment V2

This guide covers deploying the Investment V2 application to a VPS using GitHub Actions CI/CD.

## 📋 Prerequisites

### VPS Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- SSH access with public key authentication
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ storage
- Open ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)

### GitHub Repository
- Code pushed to GitHub
- Admin access to repository settings

## 🚀 Initial VPS Setup

### 1. Connect to Your VPS

```bash
ssh your_username@your_vps_ip
```

### 2. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Create Deployment Directory

```bash
# Create directory for the application
sudo mkdir -p /var/www/investment-v2
sudo chown -R $USER:$USER /var/www/investment-v2
cd /var/www/investment-v2
```

### 4. Clone Repository

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Or if using SSH
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git .
```

### 5. Setup SSH Key for GitHub Actions

```bash
# Generate SSH key pair (if you don't have one)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Display the public key (add this to ~/.ssh/authorized_keys)
cat ~/.ssh/github_actions.pub

# Display the private key (add this to GitHub Secrets as VPS_SSH_KEY)
cat ~/.ssh/github_actions

# Add public key to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 🔐 GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | Your VPS IP or domain | `123.45.67.89` or `app.yourdomain.com` |
| `VPS_USERNAME` | SSH username | `ubuntu` or `root` |
| `VPS_SSH_KEY` | Private SSH key | Contents of `~/.ssh/github_actions` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console |
| `JWT_SECRET` | Production JWT secret | Generate with `openssl rand -base64 32` |
| `DATABASE_PASSWORD` | PostgreSQL password | Strong random password |

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

## 🌐 Domain and SSL Setup (Optional but Recommended)

### 1. Point Domain to VPS

Add an A record in your domain DNS settings:
- Type: `A`
- Name: `@` (or subdomain like `app`)
- Value: Your VPS IP address
- TTL: 3600

### 2. Install Nginx and Certbot

```bash
# Install Nginx
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 3. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/investment-v2`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API and WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /auth/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/investment-v2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 Deployment Workflow

### Automatic Deployment

Every time you push or merge code to the `main` branch:

1. GitHub Actions triggers automatically
2. Connects to your VPS via SSH
3. Pulls latest code
4. Builds Docker images
5. Deploys with Docker Compose
6. Runs health checks
7. Notifies you of success/failure

### Manual Deployment

You can also trigger deployment manually:

1. Go to GitHub → Actions → Deploy to VPS
2. Click "Run workflow"
3. Select `main` branch
4. Click "Run workflow"

## 🔍 Monitoring and Logs

### View Application Logs

```bash
# SSH into VPS
ssh your_username@your_vps_ip

# Navigate to app directory
cd /var/www/investment-v2

# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

### Check Container Status

```bash
# List running containers
docker-compose ps

# Check container health
docker-compose ps -a

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Database Access

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d investment_db

# Backup database
docker-compose exec postgres pg_dump -U postgres investment_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres investment_db < backup.sql
```

## 🐛 Troubleshooting

### Deployment Fails

1. **Check GitHub Actions logs**: Go to Actions tab in GitHub
2. **SSH into VPS**: Check application logs
3. **Verify secrets**: Ensure all GitHub Secrets are set correctly
4. **Check disk space**: `df -h`
5. **Check Docker**: `docker-compose ps`

### Application Not Accessible

```bash
# Check if containers are running
docker-compose ps

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
docker-compose restart
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL container
docker-compose logs postgres

# Verify database is running
docker-compose exec postgres pg_isready -U postgres

# Restart database
docker-compose restart postgres
```

### Google OAuth Not Working

1. Update Google Cloud Console:
   - Add your production domain to Authorized JavaScript origins
   - Add callback URL: `https://yourdomain.com/auth/google/callback`
2. Verify environment variables in GitHub Secrets
3. Check backend logs: `docker-compose logs backend`

## 🔄 Updating the Application

### Update Code

```bash
# Simply push to main branch
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions will automatically deploy
```

### Manual Update

```bash
# SSH into VPS
ssh your_username@your_vps_ip
cd /var/www/investment-v2

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Security Best Practices

1. **Use strong passwords** for database and JWT secrets
2. **Enable firewall**: `sudo ufw enable`
3. **Allow only necessary ports**:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
4. **Regular updates**: `sudo apt update && sudo apt upgrade`
5. **Monitor logs** regularly
6. **Backup database** regularly
7. **Use SSL/HTTPS** in production

## 📊 Performance Optimization

### Enable Docker Logging Limits

Add to `docker-compose.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Database Optimization

```bash
# Vacuum database
docker-compose exec postgres psql -U postgres -d investment_db -c "VACUUM ANALYZE;"
```

## 🆘 Support

If you encounter issues:

1. Check application logs
2. Review GitHub Actions logs
3. Verify all secrets are configured
4. Ensure VPS has sufficient resources
5. Check firewall and port settings

---

**🎉 Your application should now be deployed and accessible!**

Visit: `https://yourdomain.com` or `http://your_vps_ip:3000`
