# 📜 Hướng Dẫn Sử Dụng Scripts

Repo này chứa các script tự động hóa giúp bạn dễ dàng cài đặt Spotify Clone trên Ubuntu Server.

---

## 🚀 CÀI ĐẶT NHANH (Khuyến nghị)

### Cách 1: Cài đặt tự động toàn bộ
```bash
# Chạy trên Ubuntu Server
sudo bash quick-install.sh
```

Script này sẽ tự động:
- ✅ Cài đặt Node.js, MongoDB, PM2, Nginx, Certbot
- ✅ Clone repository
- ✅ Cài đặt dependencies
- ✅ Cấu hình firewall

---

## 📋 CÀI ĐẶT TỪNG BƯỚC (Có kiểm soát)

### Bước 1: Cài đặt các công cụ cần thiết
```bash
sudo bash setup-ubuntu.sh
```

### Bước 2: Clone repository (nếu chưa)
```bash
cd /var/www/spotify
git clone https://github.com/burakorkmez/realtime-spotify-clone .
cd backend && npm install
cd ../frontend && npm install
```

### Bước 3: Thiết lập MongoDB
```bash
bash setup-mongodb.sh
```
Lưu lại MongoDB URI để dùng ở bước tiếp theo.

### Bước 4: Đăng ký các dịch vụ (MIỄN PHÍ)

#### 🔐 Clerk (Authentication)
1. Truy cập: https://clerk.com
2. Đăng ký và tạo application
3. Vào **API Keys** → Copy:
   - `CLERK_PUBLISHABLE_KEY` (pk_test_...)
   - `CLERK_SECRET_KEY` (sk_test_...)

#### ☁️ Cloudinary (Media Storage)
1. Truy cập: https://cloudinary.com
2. Đăng ký miễn phí (25GB)
3. Vào **Dashboard** → Copy:
   - Cloud Name
   - API Key
   - API Secret

### Bước 5: Tạo file .env
```bash
bash create-env.sh
```
Nhập thông tin từ bước 3 và 4.

### Bước 6: Chạy production
```bash
bash run-production.sh
```

### Bước 7: Cấu hình Nginx (Optional)
```bash
sudo bash setup-nginx.sh
```

### Bước 8: Cài đặt SSL (Optional)
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📚 MÔ TẢ CÁC SCRIPT

| Script | Mô tả | Quyền cần thiết |
|--------|-------|----------------|
| `quick-install.sh` | Cài đặt tự động toàn bộ | sudo |
| `setup-ubuntu.sh` | Cài đặt Node.js, MongoDB, PM2, Nginx | sudo |
| `setup-mongodb.sh` | Tạo database và user MongoDB | user |
| `create-env.sh` | Tạo file .env tương tác | user |
| `run-production.sh` | Build và chạy app với PM2 | user |
| `setup-nginx.sh` | Cấu hình Nginx reverse proxy | sudo |

---

## 🔧 QUẢN LÝ ỨNG DỤNG

### PM2 Commands
```bash
# Xem status
pm2 status

# Xem logs
pm2 logs spotify-backend

# Restart
pm2 restart spotify-backend

# Stop
pm2 stop spotify-backend

# Monitor real-time
pm2 monit
```

### Nginx Commands
```bash
# Test cấu hình
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Xem logs
sudo tail -f /var/log/nginx/spotify-access.log
sudo tail -f /var/log/nginx/spotify-error.log
```

### MongoDB Commands
```bash
# Kết nối MongoDB
mongosh mongodb://user:pass@localhost:27017/spotify-clone

# Backup
mongodump --uri="mongodb://user:pass@localhost:27017/spotify-clone" --out=/backup

# Restore
mongorestore --uri="mongodb://user:pass@localhost:27017/spotify-clone" /backup
```

---

## 🐛 TROUBLESHOOTING

### Backend không khởi động
```bash
# Kiểm tra logs
pm2 logs spotify-backend

# Kiểm tra .env
cat /var/www/spotify/backend/.env

# Kiểm tra MongoDB
sudo systemctl status mongod
```

### Frontend không hiển thị
```bash
# Kiểm tra build
ls /var/www/spotify/backend/dist

# Rebuild nếu cần
cd /var/www/spotify/frontend
npm run build
cp -r dist /var/www/spotify/backend/
pm2 restart spotify-backend
```

### Port đã được sử dụng
```bash
# Tìm process đang dùng port 5000
sudo netstat -tulpn | grep 5000

# Kill process
sudo kill -9 <PID>
```

---

## 📁 CẤU TRÚC THƯ MỤC

```
/var/www/spotify/
├── backend/
│   ├── src/
│   ├── .env          # ← File cấu hình backend
│   └── dist/         # ← Build files từ frontend
├── frontend/
│   ├── src/
│   └── .env          # ← File cấu hình frontend
├── ecosystem.config.js  # ← PM2 config
├── setup-ubuntu.sh
├── setup-mongodb.sh
├── create-env.sh
├── run-production.sh
├── setup-nginx.sh
└── quick-install.sh
```

---

## ✅ CHECKLIST

- [ ] Chạy `sudo bash setup-ubuntu.sh`
- [ ] Chạy `bash setup-mongodb.sh` và lưu MongoDB URI
- [ ] Đăng ký Clerk và lấy API keys
- [ ] Đăng ký Cloudinary và lấy credentials
- [ ] Chạy `bash create-env.sh` và nhập thông tin
- [ ] Chạy `bash run-production.sh`
- [ ] (Optional) Trỏ domain về server IP
- [ ] (Optional) Chạy `sudo bash setup-nginx.sh`
- [ ] (Optional) Chạy `sudo certbot --nginx -d domain.com`

---

## 🆘 HỖ TRỢ

- 📖 Hướng dẫn đầy đủ: [SETUP_UBUNTU.md](./SETUP_UBUNTU.md)
- 🎥 Video tutorial: https://youtu.be/4sbklcQ0EXc
- 💬 GitHub Issues: https://github.com/burakorkmez/realtime-spotify-clone/issues

---

## 📝 GHI CHÚ

- Tất cả scripts đều được test trên **Ubuntu 20.04 LTS** và **Ubuntu 22.04 LTS**
- Clerk và Cloudinary đều có **gói miễn phí** đủ cho development và small projects
- MongoDB có thể chạy local hoặc dùng **MongoDB Atlas** (cloud miễn phí)
- Khuyến nghị cấu hình **SSL certificate** cho production

---

**Made with ❤️ for Vietnamese developers**


