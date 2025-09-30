# 🚀 Hướng dẫn Deploy Full Stack lên Ubuntu 18.04

## Mục lục
1. [Chuẩn bị Server](#1-chuẩn-bị-server)
2. [Cài đặt Dependencies](#2-cài-đặt-dependencies)
3. [Deploy Backend](#3-deploy-backend)
4. [Deploy Frontend](#4-deploy-frontend)
5. [Cấu hình Nginx](#5-cấu-hình-nginx)
6. [Cấu hình SSL](#6-cấu-hình-ssl)
7. [Cấu hình Cloudflare DNS](#7-cấu-hình-cloudflare-dns)
8. [PM2 Process Manager](#8-pm2-process-manager)
9. [Maintenance & Monitoring](#9-maintenance--monitoring)

---

## 1. Chuẩn bị Server

### 1.1. Kết nối SSH
```bash
ssh root@your_server_ip
```

### 1.2. Update hệ thống
```bash
apt update && apt upgrade -y
```

### 1.3. Tạo user deploy (khuyến nghị)
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```
```bash
sudo apt install -y ufw
```
### 1.4. Cấu hình Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 2. Cài đặt Dependencies

### 2.1. Cài đặt Node.js 18.x (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash - 
sudo apt-get install -y nodejs
node --version  # Kiểm tra: v18.x.x
npm --version
```

### 2.2. Cài đặt Git
```bash
sudo apt install -y git
git --version
```

### 2.3. Cài đặt PM2
```bash
sudo npm install -g pm2
pm2 --version
```

### 2.4. Cài đặt Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### 2.5. Cài đặt Certbot (cho SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3. Deploy Backend

### 3.1. Clone repository
```bash
cd /var/www
sudo mkdir -p niemadidaphat
sudo chown -R deploy:deploy niemadidaphat
cd niemadidaphat

git clone https://github.com/lecongphu/niemadidaphat.git .
# Hoặc upload code bằng SFTP/rsync
```

### 3.2. Cài đặt backend dependencies
```bash
cd server
npm install --production
```

### 3.3. Tạo file .env cho backend
```bash
cd /var/www/niemadidaphat/server
nano .env
```

Nội dung `.env`:
```env
PORT=5000
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-r2-public-url.com

# Frontend URL
CLIENT_URL=https://niemadidaphat.com
```

Lưu: `Ctrl+X`, `Y`, `Enter`

### 3.4. Test backend
```bash
cd /var/www/niemadidaphat/server
node src/index.js
# Nếu thấy: "🚀 Server đang chạy tại http://localhost:5000" => OK
# Ctrl+C để dừng
```

### 3.5. Tạo PM2 config cho backend
```bash
cd /var/www/niemadidaphat/server
nano ecosystem.config.cjs
```

Nội dung:
```javascript
module.exports = {
  apps: [{
    name: 'niemadidaphat-backend',
    script: './src/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 3.6. Tạo thư mục logs
```bash
mkdir -p /var/www/niemadidaphat/server/logs
```

### 3.7. Chạy backend với PM2
```bash
cd /var/www/niemadidaphat/server
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Copy và chạy lệnh hiển thị
```

### 3.8. Kiểm tra backend
```bash
pm2 status
pm2 logs niemadidaphat-backend
curl http://localhost:5000/health
```

---

## 4. Deploy Frontend

### 4.1. Tạo file .env.production
```bash
cd /var/www/niemadidaphat
nano .env.production
```

Nội dung:
```env
# API Backend URL
NEXT_PUBLIC_API_BASE_URL=https://api.niemadidaphat.com/api

# Supabase (for auth only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Cloudflare R2 Public URL
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-r2-public-url.com
```

### 4.2. Build frontend
```bash
cd /var/www/niemadidaphat
npm install
npm run build
```

### 4.3. Tạo PM2 config cho frontend
```bash
cd /var/www/niemadidaphat
nano ecosystem.frontend.config.js
```

Nội dung:
```javascript
module.exports = {
  apps: [{
    name: 'niemadidaphat-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/frontend-err.log',
    out_file: './logs/frontend-out.log',
    log_file: './logs/frontend-combined.log',
    time: true
  }]
};
```

### 4.4. Tạo thư mục logs
```bash
mkdir -p /var/www/niemadidaphat/logs
```

### 4.5. Chạy frontend với PM2
```bash
cd /var/www/niemadidaphat
pm2 start ecosystem.frontend.config.js
pm2 save
```

### 4.6. Kiểm tra
```bash
pm2 status
curl http://localhost:3000
```

---

## 5. Cấu hình Nginx

### 5.1. Tạo config cho Backend API
```bash
sudo nano /etc/nginx/sites-available/api.niemadidaphat.com
```

Nội dung:
```nginx
server {
    listen 80;
    server_name api.niemadidaphat.com;

    # Logs
    access_log /var/log/nginx/api.niemadidaphat.access.log;
    error_log /var/log/nginx/api.niemadidaphat.error.log;

    # Proxy to backend
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

### 5.2. Tạo config cho Frontend
```bash
sudo nano /etc/nginx/sites-available/niemadidaphat.com
```

Nội dung:
```nginx
server {
    listen 80;
    server_name niemadidaphat.com www.niemadidaphat.com;

    # Logs
    access_log /var/log/nginx/niemadidaphat.access.log;
    error_log /var/log/nginx/niemadidaphat.error.log;

    # Client max body size (cho upload)
    client_max_body_size 100M;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (Next.js)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Public files
    location /public {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### 5.3. Enable sites
```bash
sudo ln -s /etc/nginx/sites-available/niemadidaphat.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.niemadidaphat.com /etc/nginx/sites-enabled/
```

### 5.4. Test và reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Cấu hình SSL

### 6.1. Tạm thời disable Cloudflare Proxy
Trên Cloudflare Dashboard:
1. Vào DNS settings
2. Click vào cloud icon bên cạnh record (chuyển thành grey/DNS only)
3. Đợi vài phút để DNS propagate

### 6.2. Tạo SSL certificate
```bash
# Frontend
sudo certbot --nginx -d niemadidaphat.com -d www.niemadidaphat.com

# Backend API
sudo certbot --nginx -d api.niemadidaphat.com
```

Chọn:
- Email: your-email@example.com
- Agree terms: Yes
- Redirect HTTP to HTTPS: Yes (option 2)

### 6.3. Auto-renewal
```bash
sudo certbot renew --dry-run
```

Certbot sẽ tự động renew certificate khi hết hạn.

### 6.4. Kiểm tra SSL
```bash
curl https://niemadidaphat.com
curl https://api.niemadidaphat.com/health
```

---

## 7. Cấu hình Cloudflare DNS

### 7.1. Truy cập Cloudflare Dashboard
1. Đăng nhập https://dash.cloudflare.com
2. Chọn domain `niemadidaphat.com`

### 7.2. Thêm DNS Records
Vào **DNS** tab:

#### Record 1: Root domain
- Type: `A`
- Name: `@`
- IPv4 address: `YOUR_SERVER_IP`
- Proxy status: **Proxied** (orange cloud)
- TTL: Auto

#### Record 2: www subdomain
- Type: `CNAME`
- Name: `www`
- Target: `niemadidaphat.com`
- Proxy status: **Proxied** (orange cloud)
- TTL: Auto

#### Record 3: API subdomain
- Type: `A`
- Name: `api`
- IPv4 address: `YOUR_SERVER_IP`
- Proxy status: **Proxied** (orange cloud)
- TTL: Auto

### 7.3. Cấu hình SSL/TLS
1. Vào **SSL/TLS** tab
2. Chọn mode: **Full (strict)**
3. Vào **Edge Certificates**:
   - Always Use HTTPS: **ON**
   - Minimum TLS Version: **TLS 1.2**
   - Automatic HTTPS Rewrites: **ON**

### 7.4. Cấu hình Page Rules (Optional)
Vào **Rules** > **Page Rules**:

#### Rule 1: Force HTTPS
- URL: `http://*niemadidaphat.com/*`
- Setting: Always Use HTTPS

#### Rule 2: Cache API responses (optional)
- URL: `api.niemadidaphat.com/*`
- Settings:
  - Cache Level: Standard
  - Edge Cache TTL: 1 hour (cho GET requests)

### 7.5. Cấu hình Firewall (Optional)
Vào **Security** > **WAF**:
- Enable WAF
- Set security level: Medium

---

## 8. PM2 Process Manager

### 8.1. Các lệnh PM2 thường dùng

#### Xem status
```bash
pm2 status
pm2 list
```

#### Xem logs
```bash
pm2 logs
pm2 logs niemadidaphat-backend
pm2 logs niemadidaphat-frontend
pm2 logs --lines 100
```

#### Restart services
```bash
pm2 restart all
pm2 restart niemadidaphat-backend
pm2 restart niemadidaphat-frontend
```

#### Stop services
```bash
pm2 stop all
pm2 stop niemadidaphat-backend
```

#### Delete services
```bash
pm2 delete niemadidaphat-backend
pm2 delete niemadidaphat-frontend
```

#### Monitor
```bash
pm2 monit
```

### 8.2. PM2 Web Dashboard (Optional)
```bash
pm2 install pm2-server-monit
```

---

## 9. Maintenance & Monitoring

### 9.1. Update Code

#### Backend
```bash
cd /var/www/niemadidaphat
git pull origin main
cd server
npm install --production
pm2 restart niemadidaphat-backend
```

#### Frontend
```bash
cd /var/www/niemadidaphat
git pull origin main
npm install
npm run build
pm2 restart niemadidaphat-frontend
```

### 9.2. Script tự động update
```bash
nano /var/www/niemadidaphat/deploy.sh
```

Nội dung:
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest code
cd /var/www/niemadidaphat
git pull origin main

# Update backend
echo "📡 Updating backend..."
cd server
npm install --production
pm2 restart niemadidaphat-backend

# Update frontend
echo "🎨 Updating frontend..."
cd ..
npm install
npm run build
pm2 restart niemadidaphat-frontend

echo "✅ Deployment complete!"
pm2 status
```

Chmod:
```bash
chmod +x /var/www/niemadidaphat/deploy.sh
```

Chạy:
```bash
/var/www/niemadidaphat/deploy.sh
```

### 9.3. Monitoring & Logs

#### Xem Nginx logs
```bash
sudo tail -f /var/log/nginx/niemadidaphat.access.log
sudo tail -f /var/log/nginx/niemadidaphat.error.log
sudo tail -f /var/log/nginx/api.niemadidaphat.access.log
```

#### Xem PM2 logs
```bash
pm2 logs --lines 200
```

#### Check disk space
```bash
df -h
```

#### Check memory
```bash
free -m
```

#### Check processes
```bash
htop
```

### 9.4. Backup

#### Tạo script backup
```bash
nano /home/deploy/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup code
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /var/www/niemadidaphat

# Backup env files
cp /var/www/niemadidaphat/server/.env $BACKUP_DIR/backend_env_$DATE
cp /var/www/niemadidaphat/.env.production $BACKUP_DIR/frontend_env_$DATE

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Cron job (chạy hàng ngày 2AM):
```bash
crontab -e
```

Thêm:
```
0 2 * * * /home/deploy/backup.sh >> /home/deploy/backup.log 2>&1
```

---

## 10. Troubleshooting

### 10.1. Backend không chạy
```bash
pm2 logs niemadidaphat-backend
# Kiểm tra .env file
cat /var/www/niemadidaphat/server/.env
# Test manual
cd /var/www/niemadidaphat/server
node src/index.js
```

### 10.2. Frontend không build
```bash
cd /var/www/niemadidaphat
rm -rf .next node_modules
npm install
npm run build
```

### 10.3. Nginx error
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### 10.4. SSL issues
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### 10.5. Port already in use
```bash
# Check port 5000
sudo lsof -i :5000
sudo kill -9 PID

# Check port 3000
sudo lsof -i :3000
sudo kill -9 PID
```

---

## 📝 Checklist Deployment

- [ ] Server Ubuntu 18.04 ready
- [ ] Node.js 18.x installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Code cloned/uploaded
- [ ] Backend .env configured
- [ ] Frontend .env.production configured
- [ ] Backend running on PM2
- [ ] Frontend built and running on PM2
- [ ] Nginx configured for both domains
- [ ] SSL certificates installed
- [ ] Cloudflare DNS records added
- [ ] Cloudflare SSL set to Full (strict)
- [ ] Test https://niemadidaphat.com
- [ ] Test https://api.niemadidaphat.com/health
- [ ] PM2 startup configured
- [ ] Backup script setup

---

## 🎉 Kết quả

Sau khi hoàn thành:
- ✅ **Frontend**: https://niemadidaphat.com
- ✅ **Backend API**: https://api.niemadidaphat.com
- ✅ **SSL**: Valid certificates
- ✅ **CDN**: Cloudflare proxy enabled
- ✅ **Auto-restart**: PM2 on server reboot
- ✅ **Monitoring**: PM2 + Nginx logs

**Chúc mừng! Website đã live! 🚀**
