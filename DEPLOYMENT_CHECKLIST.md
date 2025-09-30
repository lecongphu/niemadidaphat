# ✅ Deployment Checklist - niemadidaphat.com

## Pre-Deployment

### Server Setup
- [ ] Ubuntu 18.04+ server ready
- [ ] Root/sudo access configured
- [ ] SSH key authentication setup
- [ ] Firewall (UFW) configured (ports 22, 80, 443)
- [ ] Domain niemadidaphat.com DNS pointing to server IP

### Cloudflare Setup
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] DNS records ready to configure

### Credentials Ready
- [ ] Supabase URL and keys
- [ ] Cloudflare R2 credentials
- [ ] Server IP address

---

## Server Installation

### Step 1: Basic Setup
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Create deploy user: `adduser deploy`
- [ ] Add to sudo group: `usermod -aG sudo deploy`

### Step 2: Install Dependencies
- [ ] Node.js 18.x installed
- [ ] Git installed
- [ ] PM2 installed globally
- [ ] Nginx installed and running
- [ ] Certbot installed

### Step 3: Verify Installations
```bash
node --version    # Should show v18.x.x
npm --version
git --version
pm2 --version
nginx -v
certbot --version
```

---

## Code Deployment

### Backend
- [ ] Code cloned to `/var/www/niemadidaphat`
- [ ] Backend dependencies installed: `cd server && npm install --production`
- [ ] `.env` file created in `server/` directory
- [ ] Environment variables filled correctly
- [ ] Test backend: `node src/index.js` (should run without errors)
- [ ] Logs directory created: `mkdir -p server/logs`

### Frontend
- [ ] Frontend dependencies installed: `npm install`
- [ ] `.env.production` file created
- [ ] Environment variables filled correctly
- [ ] Frontend built successfully: `npm run build`
- [ ] Logs directory created: `mkdir -p logs`

---

## PM2 Configuration

### Backend
- [ ] `ecosystem.config.cjs` created in `server/`
- [ ] Started with PM2: `pm2 start ecosystem.config.cjs`
- [ ] Verify running: `pm2 status`
- [ ] Check logs: `pm2 logs niemadidaphat-backend`
- [ ] Save PM2 config: `pm2 save`

### Frontend
- [ ] `ecosystem.frontend.config.js` created
- [ ] Started with PM2: `pm2 start ecosystem.frontend.config.js`
- [ ] Verify running: `pm2 status`
- [ ] Check logs: `pm2 logs niemadidaphat-frontend`

### PM2 Startup
- [ ] Configure startup: `pm2 startup`
- [ ] Run the generated command
- [ ] Verify: reboot server and check `pm2 status`

---

## Nginx Configuration

### Backend API (api.niemadidaphat.com)
- [ ] Config file created: `/etc/nginx/sites-available/api.niemadidaphat.com`
- [ ] Symlink created: `ln -s /etc/nginx/sites-available/api.niemadidaphat.com /etc/nginx/sites-enabled/`
- [ ] Test config: `nginx -t`
- [ ] Reload: `systemctl reload nginx`

### Frontend (niemadidaphat.com)
- [ ] Config file created: `/etc/nginx/sites-available/niemadidaphat.com`
- [ ] Symlink created: `ln -s /etc/nginx/sites-available/niemadidaphat.com /etc/nginx/sites-enabled/`
- [ ] Test config: `nginx -t`
- [ ] Reload: `systemctl reload nginx`

---

## SSL Certificates

### Temporary: Disable Cloudflare Proxy
- [ ] Go to Cloudflare DNS settings
- [ ] Click orange cloud icons (turn grey - DNS only)
- [ ] Wait 2-3 minutes for propagation

### Get Certificates
- [ ] Frontend SSL: `certbot --nginx -d niemadidaphat.com -d www.niemadidaphat.com`
- [ ] Backend SSL: `certbot --nginx -d api.niemadidaphat.com`
- [ ] Test renewal: `certbot renew --dry-run`

### Re-enable Cloudflare Proxy
- [ ] Back to Cloudflare DNS settings
- [ ] Click grey clouds (turn orange - Proxied)

---

## Cloudflare DNS Configuration

### DNS Records
- [ ] A record: `@` → `YOUR_SERVER_IP` (Proxied - Orange)
- [ ] CNAME record: `www` → `niemadidaphat.com` (Proxied - Orange)
- [ ] A record: `api` → `YOUR_SERVER_IP` (Proxied - Orange)

### SSL/TLS Settings
- [ ] SSL/TLS mode: **Full (strict)**
- [ ] Always Use HTTPS: **ON**
- [ ] Minimum TLS: **TLS 1.2**
- [ ] Automatic HTTPS Rewrites: **ON**

### Security (Optional but Recommended)
- [ ] WAF: Enabled
- [ ] Security level: Medium
- [ ] Bot Fight Mode: ON
- [ ] Page Rules configured (if needed)

---

## Testing

### Backend API
```bash
# Local
curl http://localhost:5000/health

# Via Nginx
curl http://YOUR_SERVER_IP/health

# Via domain (HTTP)
curl http://api.niemadidaphat.com/health

# Via domain (HTTPS)
curl https://api.niemadidaphat.com/health
```
- [ ] All tests return `{"status":"OK",...}`

### Frontend
```bash
# Local
curl http://localhost:3000

# Via Nginx
curl http://YOUR_SERVER_IP

# Via domain (HTTP)
curl http://niemadidaphat.com

# Via domain (HTTPS)
curl https://niemadidaphat.com
```
- [ ] All tests return HTML

### Browser Tests
- [ ] https://niemadidaphat.com loads correctly
- [ ] https://www.niemadidaphat.com redirects to https://niemadidaphat.com
- [ ] https://api.niemadidaphat.com/health returns JSON
- [ ] SSL certificates valid (green padlock in browser)
- [ ] No mixed content warnings
- [ ] Login/authentication works
- [ ] File upload works
- [ ] Audio player works

---

## Monitoring & Maintenance

### Setup Monitoring
- [ ] PM2 monitoring: `pm2 monit`
- [ ] Check PM2 logs location
- [ ] Check Nginx logs location
- [ ] Disk space monitoring setup

### Backup Setup
- [ ] Backup script created
- [ ] Cron job configured for daily backup
- [ ] Test backup: run backup script manually
- [ ] Verify backup files created

### Auto-deployment (Optional)
- [ ] `deploy.sh` script created and executable
- [ ] Test deployment: `./deploy.sh`
- [ ] GitHub webhook configured (optional)

---

## Documentation

- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Credentials stored securely (password manager)
- [ ] Team members have access to necessary info
- [ ] Rollback procedure documented

---

## Post-Deployment

### Verification
- [ ] Website accessible worldwide (use https://www.whatsmydns.net)
- [ ] SSL valid on all browsers
- [ ] All features working
- [ ] Performance acceptable
- [ ] No errors in logs

### Optimization (Optional)
- [ ] Cloudflare caching rules configured
- [ ] CDN working properly
- [ ] Gzip compression enabled
- [ ] Image optimization working
- [ ] Database queries optimized

### Security Audit
- [ ] Update all system packages
- [ ] Configure automatic security updates
- [ ] Set up fail2ban (optional)
- [ ] Regular backup verified
- [ ] Access logs reviewed

---

## Emergency Contacts & Info

### Server Info
```
Server IP: _________________
Server Provider: _________________
SSH User: deploy
SSH Port: 22
```

### Services Ports
```
Backend: 5000
Frontend: 3000
Nginx HTTP: 80
Nginx HTTPS: 443
```

### Important Commands
```bash
# Restart services
pm2 restart all
sudo systemctl restart nginx

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Update code
cd /var/www/niemadidaphat
./deploy.sh
```

### Support Links
- Deployment Guide: DEPLOYMENT_UBUNTU.md
- Quick Start: QUICKSTART.md
- Migration Guide: MIGRATION_GUIDE.md

---

## Sign-off

- [ ] Deployment completed successfully
- [ ] All tests passed
- [ ] Monitoring active
- [ ] Backup configured
- [ ] Documentation updated

**Deployed by:** _________________  
**Date:** _________________  
**Notes:** _________________

---

🎉 **Deployment Complete!**

Live URLs:
- Frontend: https://niemadidaphat.com
- Backend API: https://api.niemadidaphat.com
- API Health: https://api.niemadidaphat.com/health
