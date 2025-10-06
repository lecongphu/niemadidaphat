# 🚀 Hướng dẫn Setup Spotify Clone trên Ubuntu Server

## 📋 Yêu cầu hệ thống
- Ubuntu 20.04 trở lên
- Node.js 18+ và npm
- MongoDB
- Nginx (optional, cho production)
- PM2 (optional, cho quản lý process)

---

## 1️⃣ CÀI ĐẶT CÁC CÔNG CỤ CƠ BẢN

### Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

### Cài đặt Node.js và npm (phiên bản 20.x LTS)
```bash
# Cài đặt NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Cài đặt Node.js
sudo apt install -y nodejs

# Kiểm tra phiên bản
node --version  # Nên là v20.x.x
npm --version
```

### Cài đặt Git
```bash
sudo apt install git -y
```

---

## 2️⃣ CÀI ĐẶT MONGODB

### Cài đặt MongoDB Community Edition
```bash
# Import public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Tạo list file cho MongoDB
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Cập nhật package database
sudo apt update

# Cài đặt MongoDB
sudo apt install -y mongodb-org

# Khởi động MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Kiểm tra trạng thái
sudo systemctl status mongod
```

### Tạo database và user cho Spotify Clone
```bash
# Mở MongoDB shell
mongosh

# Trong MongoDB shell, chạy các lệnh sau:
use spotify-clone
db.createUser({
  user: "spotify_admin",
  pwd: "MatKhauManh123!@#",  # ĐỔI MẬT KHẨU NÀY
  roles: [{ role: "readWrite", db: "spotify-clone" }]
})
exit
```

---

## 3️⃣ CLONE VÀ CÀI ĐẶT DỰ ÁN

### Clone repository
```bash
cd /var/www  # hoặc thư mục bạn muốn
sudo mkdir -p spotify
sudo chown $USER:$USER spotify
cd spotify
git clone https://github.com/burakorkmez/realtime-spotify-clone .
```

### Cài đặt dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

---

## 4️⃣ ĐĂNG KÝ VÀ CẤU HÌNH DỊCH VỤ

### A. Clerk Authentication (Miễn phí)
1. Truy cập: https://clerk.com
2. Đăng ký tài khoản miễn phí
3. Tạo một application mới
4. Vào **API Keys**, copy:
   - `CLERK_PUBLISHABLE_KEY` (bắt đầu bằng `pk_`)
   - `CLERK_SECRET_KEY` (bắt đầu bằng `sk_`)

### B. Cloudinary (Miễn phí - 25GB storage)
1. Truy cập: https://cloudinary.com
2. Đăng ký tài khoản miễn phí
3. Vào **Dashboard**, lấy:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

---

## 5️⃣ TẠO FILE CẤU HÌNH .ENV

### Backend .env
```bash
cat > /var/www/spotify/backend/.env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://spotify_admin:MatKhauManh123!@#@localhost:27017/spotify-clone
ADMIN_EMAIL=admin@yourdomain.com
NODE_ENV=production

# Cloudinary - Lấy từ https://cloudinary.com/console
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Clerk - Lấy từ https://dashboard.clerk.com
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx
EOF
```

### Frontend .env
```bash
cat > /var/www/spotify/frontend/.env << 'EOF'
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
EOF
```

**⚠️ QUAN TRỌNG:** Thay thế tất cả các giá trị `your_xxx` và `pk_test_xxx` bằng thông tin thực của bạn!

---

## 6️⃣ CÀI ĐẶT PM2 (Quản lý Process)

```bash
# Cài đặt PM2 global
sudo npm install -g pm2

# Tạo file ecosystem cho PM2
cat > /var/www/spotify/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'spotify-backend',
      cwd: '/var/www/spotify/backend',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
EOF
```

---

## 7️⃣ CHẠY ỨNG DỤNG

### Phương án A: Chạy Development (cho test)
```bash
# Terminal 1 - Backend
cd /var/www/spotify/backend
npm run dev

# Terminal 2 - Frontend  
cd /var/www/spotify/frontend
npm run dev
```

### Phương án B: Chạy Production với PM2
```bash
# Build frontend
cd /var/www/spotify/frontend
npm run build

# Copy build files vào backend
cp -r dist /var/www/spotify/backend/

# Khởi động backend với PM2
cd /var/www/spotify
pm2 start ecosystem.config.js

# Lưu cấu hình PM2
pm2 save
pm2 startup

# Xem logs
pm2 logs spotify-backend
```

---

## 8️⃣ CẤU HÌNH NGINX (Optional - cho Production)

```bash
# Cài đặt Nginx
sudo apt install nginx -y

# Tạo cấu hình Nginx
sudo nano /etc/nginx/sites-available/spotify
```

Paste nội dung sau:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Thay bằng domain của bạn

    # Frontend (serve static files)
    location / {
        root /var/www/spotify/backend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket cho Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Kích hoạt cấu hình:
```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/spotify /etc/nginx/sites-enabled/

# Test cấu hình
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 9️⃣ CẤU HÌNH FIREWALL

```bash
# Cho phép Nginx
sudo ufw allow 'Nginx Full'

# Cho phép SSH (nếu chưa)
sudo ufw allow OpenSSH

# Kích hoạt firewall
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

---

## 🔟 CÀI ĐẶT SSL (HTTPS) với Let's Encrypt

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal đã được setup tự động
# Test renewal:
sudo certbot renew --dry-run
```

---

## 📊 QUẢN LÝ VÀ GIÁM SÁT

### PM2 Commands
```bash
# Xem trạng thái
pm2 status

# Xem logs real-time
pm2 logs spotify-backend

# Restart app
pm2 restart spotify-backend

# Stop app
pm2 stop spotify-backend

# Xóa app
pm2 delete spotify-backend

# Monitor
pm2 monit
```

### MongoDB Commands
```bash
# Kết nối MongoDB
mongosh mongodb://spotify_admin:MatKhauManh123!@#@localhost:27017/spotify-clone

# Backup database
mongodump --uri="mongodb://spotify_admin:MatKhauManh123!@#@localhost:27017/spotify-clone" --out=/backup/mongodb

# Restore database
mongorestore --uri="mongodb://spotify_admin:MatKhauManh123!@#@localhost:27017/spotify-clone" /backup/mongodb
```

---

## 🐛 TROUBLESHOOTING

### Kiểm tra logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Kiểm tra ports
```bash
# Kiểm tra port 5000 (backend)
sudo netstat -tulpn | grep 5000

# Kiểm tra port 80 (nginx)
sudo netstat -tulpn | grep 80

# Kiểm tra port 27017 (mongodb)
sudo netstat -tulpn | grep 27017
```

### Reset MongoDB password
```bash
# Stop MongoDB
sudo systemctl stop mongod

# Start MongoDB without auth
sudo mongod --port 27017 --dbpath /var/lib/mongodb --noauth &

# Connect và đổi password
mongosh
use spotify-clone
db.changeUserPassword("spotify_admin", "NewPassword123")
exit

# Kill mongod và restart normally
sudo killall mongod
sudo systemctl start mongod
```

---

## 🎯 CHECKLIST CÀI ĐẶT

- [ ] Cài đặt Node.js và npm
- [ ] Cài đặt MongoDB và tạo database
- [ ] Clone repository
- [ ] Cài đặt dependencies
- [ ] Đăng ký Clerk và lấy API keys
- [ ] Đăng ký Cloudinary và lấy credentials
- [ ] Tạo file .env với thông tin đúng
- [ ] Test chạy development mode
- [ ] Build frontend
- [ ] Cài đặt PM2
- [ ] Chạy production với PM2
- [ ] Cài đặt và cấu hình Nginx
- [ ] Cấu hình firewall
- [ ] Cài đặt SSL certificate

---

## 📚 TÀI LIỆU THAM KHẢO

- MongoDB Ubuntu: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
- Clerk Documentation: https://clerk.com/docs
- Cloudinary Documentation: https://cloudinary.com/documentation
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Documentation: https://nginx.org/en/docs/

---

## 🎉 HOÀN THÀNH

Sau khi hoàn tất các bước trên, ứng dụng của bạn sẽ:
- Chạy ở chế độ production với PM2
- Được serve qua Nginx
- Có SSL certificate (HTTPS)
- Tự động khởi động lại khi server reboot
- Có khả năng scale và monitor

**URL truy cập:**
- Production: `https://your-domain.com`
- Development: `http://your-server-ip:3000`

Chúc bạn thành công! 🚀


