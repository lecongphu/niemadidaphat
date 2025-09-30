# 📋 Deployment Summary - NiemADiDaPhat

## 🎯 Tổng quan

Deploy Full Stack application lên Ubuntu 18.04 server với domain **niemadidaphat.com** được quản lý trên Cloudflare.

## 🏗️ Kiến trúc Production

```
Internet
    ↓
Cloudflare CDN/Proxy (SSL, WAF, DDoS Protection)
    ↓
Your Ubuntu Server (YOUR_SERVER_IP)
    ↓
Nginx (Reverse Proxy + SSL Termination)
    ├── niemadidaphat.com → Next.js Frontend (port 3000)
    └── api.niemadidaphat.com → Node.js Backend (port 5000)
         ↓
    Supabase (Database) + Cloudflare R2 (Storage)
```

## 📁 Cấu trúc trên Server

```
/var/www/niemadidaphat/
├── server/                          # Backend Node.js
│   ├── src/
│   ├── .env                        # Environment variables
│   ├── ecosystem.config.cjs         # PM2 config
│   ├── logs/                       # Backend logs
│   └── package.json
│
├── .next/                          # Next.js build output
├── logs/                           # Frontend logs
├── ecosystem.frontend.config.js    # PM2 frontend config
├── .env.production                 # Frontend env
├── deploy.sh                       # Auto-deployment script
└── package.json
```

## 🔧 Tech Stack Production

| Component | Technology | Port/Location |
|-----------|-----------|---------------|
| **Frontend** | Next.js 15 | Port 3000 |
| **Backend** | Node.js + Express | Port 5000 |
| **Process Manager** | PM2 | - |
| **Web Server** | Nginx | Ports 80, 443 |
| **SSL** | Let's Encrypt (Certbot) | - |
| **CDN/Proxy** | Cloudflare | - |
| **Database** | Supabase | Cloud |
| **Storage** | Cloudflare R2 | Cloud |

## 📝 Files đã tạo

### 1. Documentation
- ✅ `DEPLOYMENT_UBUNTU.md` - Hướng dẫn chi tiết từng bước
- ✅ `DEPLOYMENT_CHECKLIST.md` - Checklist đầy đủ
- ✅ `DEPLOYMENT_SUMMARY.md` - Tóm tắt (file này)

### 2. Configuration Files
- ✅ `nginx/niemadidaphat.com.conf` - Nginx config cho frontend
- ✅ `nginx/api.niemadidaphat.com.conf` - Nginx config cho backend API
- ✅ `server/ecosystem.config.cjs` - PM2 config cho backend
- ✅ `ecosystem.frontend.config.js` - PM2 config cho frontend

### 3. Scripts
- ✅ `scripts/deploy.sh` - Auto-deployment script

### 4. Environment Templates
- ✅ `.env.production.example` - Frontend env template (blocked by gitignore)
- ✅ `server/.env.production.example` - Backend env template (blocked by gitignore)

## 🚀 Quick Deployment Commands

### 1. Initial Setup (First time only)
```bash
# SSH vào server
ssh root@YOUR_SERVER_IP

# Chạy lệnh setup (xem DEPLOYMENT_UBUNTU.md section 1-2)
# Sau đó clone code:
cd /var/www
git clone YOUR_REPO_URL niemadidaphat
```

### 2. Configure Environment
```bash
# Backend
cd /var/www/niemadidaphat/server
nano .env
# Copy từ server/.env.production.example và điền giá trị

# Frontend
cd /var/www/niemadidaphat
nano .env.production
# Copy từ .env.production.example và điền giá trị
```

### 3. Install & Build
```bash
# Backend
cd /var/www/niemadidaphat/server
npm install --production

# Frontend
cd /var/www/niemadidaphat
npm install
npm run build
```

### 4. Start with PM2
```bash
# Backend
cd /var/www/niemadidaphat/server
pm2 start ecosystem.config.cjs
pm2 save

# Frontend
cd /var/www/niemadidaphat
pm2 start ecosystem.frontend.config.js
pm2 save

# Startup on boot
pm2 startup
# Chạy lệnh được generate
```

### 5. Configure Nginx
```bash
# Copy configs
sudo cp /var/www/niemadidaphat/nginx/niemadidaphat.com.conf /etc/nginx/sites-available/
sudo cp /var/www/niemadidaphat/nginx/api.niemadidaphat.com.conf /etc/nginx/sites-available/

# Enable sites
sudo ln -s /etc/nginx/sites-available/niemadidaphat.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.niemadidaphat.com /etc/nginx/sites-enabled/

# Test & reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Get SSL Certificates
```bash
# Temporarily disable Cloudflare proxy (DNS only)
# Then run:
sudo certbot --nginx -d niemadidaphat.com -d www.niemadidaphat.com
sudo certbot --nginx -d api.niemadidaphat.com

# Re-enable Cloudflare proxy
```

## 🌐 Cloudflare Configuration

### DNS Records (Proxied - Orange Cloud)
| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | @ | YOUR_SERVER_IP | ✅ Proxied |
| CNAME | www | niemadidaphat.com | ✅ Proxied |
| A | api | YOUR_SERVER_IP | ✅ Proxied |

### SSL/TLS Settings
- **Mode**: Full (strict)
- **Always Use HTTPS**: ON
- **Minimum TLS**: TLS 1.2
- **Automatic HTTPS Rewrites**: ON

### Security
- **WAF**: Enabled
- **Security Level**: Medium
- **Bot Fight Mode**: ON

## 🔄 Update/Deploy Workflow

### Manual Update
```bash
cd /var/www/niemadidaphat
git pull origin main

# Backend
cd server
npm install --production
pm2 restart niemadidaphat-backend

# Frontend
cd ..
npm install
npm run build
pm2 restart niemadidaphat-frontend
```

### Auto-deployment Script
```bash
cd /var/www/niemadidaphat
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 📊 Monitoring

### PM2
```bash
pm2 status                    # Status overview
pm2 logs                      # All logs
pm2 logs niemadidaphat-backend
pm2 logs niemadidaphat-frontend
pm2 monit                     # Real-time monitoring
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/niemadidaphat.access.log
sudo tail -f /var/log/nginx/niemadidaphat.error.log
sudo tail -f /var/log/nginx/api.niemadidaphat.access.log
sudo tail -f /var/log/nginx/api.niemadidaphat.error.log
```

### System
```bash
htop                          # CPU/RAM monitoring
df -h                         # Disk space
free -m                       # Memory
```

## 🔐 Environment Variables

### Backend (.env in server/)
```env
PORT=5000
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
CLIENT_URL=https://niemadidaphat.com
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.niemadidaphat.com/api
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_R2_PUBLIC_URL=...
```

## ✅ Testing Checklist

```bash
# Backend health check
curl https://api.niemadidaphat.com/health

# Frontend
curl https://niemadidaphat.com

# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# Check SSL
curl -I https://niemadidaphat.com
curl -I https://api.niemadidaphat.com
```

## 🆘 Troubleshooting

### Service không chạy
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Xem logs lỗi
```bash
pm2 logs --err
sudo tail -f /var/log/nginx/error.log
```

### Port bị chiếm
```bash
sudo lsof -i :5000
sudo lsof -i :3000
# Kill process: sudo kill -9 PID
```

### Renew SSL
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## 📚 Tài liệu tham khảo

1. **DEPLOYMENT_UBUNTU.md** - Hướng dẫn chi tiết đầy đủ (10 sections)
2. **DEPLOYMENT_CHECKLIST.md** - Checklist từng bước
3. **QUICKSTART.md** - Quick start development
4. **MIGRATION_GUIDE.md** - Migration guide

## 🎯 URLs Production

- **Frontend**: https://niemadidaphat.com
- **Backend API**: https://api.niemadidaphat.com
- **Health Check**: https://api.niemadidaphat.com/health

---

## ⏱️ Estimated Time

- Server setup: 30-45 mins
- Code deployment: 15-20 mins
- Nginx & SSL: 20-30 mins
- Cloudflare config: 10-15 mins
- Testing: 15-20 mins

**Total: ~2-2.5 hours** (first time)

---

## 📞 Support

Nếu gặp vấn đề:
1. Xem **DEPLOYMENT_UBUNTU.md** section 10 (Troubleshooting)
2. Check PM2 logs: `pm2 logs`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify environment variables
5. Check Cloudflare settings

---

**🎉 Chúc deployment thành công!**
