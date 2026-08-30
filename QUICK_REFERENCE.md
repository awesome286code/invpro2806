# Quick Reference - Investment V2 Deployment

## 🚀 First Time Setup

### 1. VPS Setup (One-time)
```bash
# SSH into your VPS
ssh root@your_vps_ip

# Run automated setup script
sudo bash scripts/vps-setup.sh

# Copy the private SSH key shown at the end
```

### 2. GitHub Secrets (One-time)
Go to: `GitHub Repo → Settings → Secrets → Actions → New secret`

Add these 7 secrets:
- `VPS_HOST` → Your VPS IP or domain
- `VPS_USERNAME` → SSH username (e.g., `root`)
- `VPS_SSH_KEY` → Private key from step 1
- `GOOGLE_CLIENT_ID` → From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` → From Google Cloud Console
- `JWT_SECRET` → Run: `openssl rand -base64 32`
- `DATABASE_PASSWORD` → Run: `openssl rand -base64 24`

### 3. Clone Repository on VPS
```bash
cd /var/www/investment-v2
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### 4. Setup Nginx (Optional - for custom domain)
```bash
# Copy Nginx config
sudo cp nginx/investment-v2.conf /etc/nginx/sites-available/investment-v2

# Edit the file and replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/investment-v2

# Enable site
sudo ln -s /etc/nginx/sites-available/investment-v2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 5. First Deployment
```bash
# Push to main branch
git push origin main

# GitHub Actions will automatically deploy!
```

---

## 📝 Daily Usage

### Deploy Changes
```bash
git add .
git commit -m "Your changes"
git push origin main
# ✅ Automatic deployment!
```

### Manual Deployment (if needed)
```bash
ssh your_username@your_vps_ip
cd /var/www/investment-v2
bash scripts/deploy.sh
```

### View Logs
```bash
ssh your_username@your_vps_ip
cd /var/www/investment-v2

# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backup Database
```bash
ssh your_username@your_vps_ip
cd /var/www/investment-v2
bash scripts/backup-db.sh
```

### Restart Services
```bash
ssh your_username@your_vps_ip
cd /var/www/investment-v2
docker-compose restart
```

---

## 🔧 Troubleshooting

### Deployment Failed
```bash
# Check GitHub Actions logs
# Go to: GitHub → Actions → Latest workflow

# Or SSH to VPS and check
ssh your_username@your_vps_ip
cd /var/www/investment-v2
docker-compose logs --tail=100
```

### Application Not Working
```bash
# Check container status
docker-compose ps

# Restart all services
docker-compose restart

# Rebuild if needed
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Issues
```bash
# Check database
docker-compose exec postgres psql -U postgres -d investment_db

# Restart database
docker-compose restart postgres
```

---

## 📋 Useful Commands

| Task | Command |
|------|---------|
| View running containers | `docker-compose ps` |
| Stop all services | `docker-compose down` |
| Start all services | `docker-compose up -d` |
| View logs | `docker-compose logs -f` |
| Restart service | `docker-compose restart backend` |
| Access database | `docker-compose exec postgres psql -U postgres -d investment_db` |
| Backup database | `bash scripts/backup-db.sh` |
| Clean Docker | `docker system prune -a` |

---

## 🌐 Access URLs

- **Local Development**: http://localhost:3000
- **Production (IP)**: http://your_vps_ip:3000
- **Production (Domain)**: https://yourdomain.com

---

## 📞 Support

For detailed instructions, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [README.md](README.md) - Application overview
