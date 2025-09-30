# ⚡ Deploy Quick Start - niemadidaphat.com

> Hướng dẫn deploy nhanh nhất lên Ubuntu server với domain niemadidaphat.com

## 📋 Cần chuẩn bị

- ✅ Ubuntu 18.04+ server (VPS/Cloud)
- ✅ Domain niemadidaphat.com đã trỏ về Cloudflare
- ✅ SSH access vào server
- ✅ Supabase credentials
- ✅ Cloudflare R2 credentials

---

## 🚀 5 Bước Deploy

### Bước 1: Setup Server (10 phút)
```bash
# SSH vào server
ssh root@YOUR_SERVER_IP

# Update & install
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git nginx certbot python3-certbot-nginx
npm install -g pm2

# Tạo user deploy
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Bước 2: Clone & Setup Code (15 phút)
```bash
# Clone code
cd /var/www
sudo mkdir niemadidaphat
sudo chown deploy:deploy niemadidaphat
cd niemadidaphat
git clone YOUR_REPO_URL .

# Backend .env
cd server
nano .env
```

Paste và điền:
```env
PORT=5000
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
R2_ACCOUNT_ID=your_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_URL=your_url
CLIENT_URL=https://niemadidaphat.com
```

```bash
# Frontend .env
cd ..
nano .env.production
```

Paste:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.niemadidaphat.com/api
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Bước 3: Install & Start (20 phút)
```bash
# Backend
cd /var/www/niemadidaphat/server
npm install --production
mkdir logs
pm2 start ecosystem.config.cjs
pm2 save

# Frontend
cd /var/www/niemadidaphat
npm install
npm run build
mkdir logs
pm2 start ecosystem.frontend.config.js
pm2 save

# Auto-start on boot
pm2 startup
# Chạy lệnh được generate

# Verify
pm2 status
```

### Bước 4: Nginx & SSL (20 phút)
```bash
# Copy Nginx configs
sudo cp /var/www/niemadidaphat/nginx/niemadidaphat.com.conf /etc/nginx/sites-available/
sudo cp /var/www/niemadidaphat/nginx/api.niemadidaphat.com.conf /etc/nginx/sites-available/

# Enable
sudo ln -s /etc/nginx/sites-available/niemadidaphat.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.niemadidaphat.com /etc/nginx/sites-enabled/

# Test & reload
sudo nginx -t
sudo systemctl reload nginx
```

**Cloudflare: Tạm thời disable proxy (grey cloud)**

```bash
# Get SSL
sudo certbot --nginx -d niemadidaphat.com -d www.niemadidaphat.com
sudo certbot --nginx -d api.niemadidaphat.com
```

**Cloudflare: Enable lại proxy (orange cloud)**

### Bước 5: Cloudflare DNS (10 phút)

Vào Cloudflare Dashboard → DNS:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | @ | YOUR_SERVER_IP | 🟠 Proxied |
| CNAME | www | niemadidaphat.com | 🟠 Proxied |
| A | api | YOUR_SERVER_IP | 🟠 Proxied |

SSL/TLS Settings:
- Mode: **Full (strict)**
- Always Use HTTPS: **ON**

---

## ✅ Test

```bash
# Backend
curl https://api.niemadidaphat.com/health

# Frontend  
curl https://niemadidaphat.com
```

Open browser:
- https://niemadidaphat.com ← Frontend
- https://api.niemadidaphat.com/health ← Backend

---

## 🔄 Update sau này

```bash
cd /var/www/niemadidaphat
./scripts/deploy.sh
```

Hoặc:
```bash
git pull
cd server && npm install && pm2 restart niemadidaphat-backend
cd .. && npm install && npm run build && pm2 restart niemadidaphat-frontend
```

---

## 📚 Chi tiết

- 📖 [DEPLOYMENT_UBUNTU.md](DEPLOYMENT_UBUNTU.md) - Hướng dẫn đầy đủ
- ✅ [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Checklist
- 📊 [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Tóm tắt

---

## 🆘 Troubleshooting

**PM2 không chạy:**
```bash
pm2 logs
pm2 restart all
```

**Nginx lỗi:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**SSL lỗi:**
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

**🎉 Done! Website đã live tại https://niemadidaphat.com**
