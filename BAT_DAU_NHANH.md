# 🚀 BẮT ĐẦU NHANH - SPOTIFY CLONE TRÊN UBUNTU

## 📦 ĐÃ CÓ GÌ?

Bạn đã có đầy đủ công cụ để deploy Spotify Clone lên Ubuntu server:

### ✅ Scripts tự động hóa (7 files)
1. **quick-install.sh** - Cài đặt TẤT CẢ chỉ với 1 lệnh
2. **setup-ubuntu.sh** - Cài Node.js, MongoDB, PM2, Nginx
3. **setup-mongodb.sh** - Tạo database MongoDB
4. **create-env.sh** - Tạo file cấu hình .env
5. **run-production.sh** - Build và chạy app với PM2
6. **setup-nginx.sh** - Cấu hình Nginx reverse proxy
7. **prepare-scripts.sh** - Chuẩn bị scripts để upload

### 📖 Tài liệu hướng dẫn (4 files)
1. **SETUP_UBUNTU.md** - Hướng dẫn chi tiết từng bước
2. **README_SCRIPTS.md** - Mô tả và cách dùng scripts
3. **HUONG_DAN_UPLOAD_UBUNTU.md** - Cách upload từ Windows lên Ubuntu
4. **BAT_DAU_NHANH.md** - File này!

---

## ⚡ KHỞI ĐỘNG NHANH 3 BƯỚC

### 🎯 BƯỚC 1: Upload lên Ubuntu (Chọn 1 trong 4 cách)

#### Cách A: Git (Dễ nhất - Khuyến nghị)
```bash
# Trên Ubuntu server
cd /var/www/spotify
git clone https://github.com/burakorkmez/realtime-spotify-clone .
chmod +x *.sh
```

#### Cách B: SCP từ Windows
```powershell
# Trên Windows PowerShell
scp *.sh *.md user@server-ip:/var/www/spotify/
```

#### Cách C: WinSCP (GUI)
- Download: https://winscp.net
- Kéo thả files lên server

#### Cách D: Copy-Paste
- SSH vào Ubuntu
- Tạo file bằng `nano filename.sh`
- Paste nội dung, save

---

### 🎯 BƯỚC 2: Chạy Quick Install

```bash
# SSH vào Ubuntu server
ssh user@your-server-ip

# Chạy cài đặt tự động
cd /var/www/spotify
sudo bash quick-install.sh
```

**⏱️ Thời gian: 5-10 phút**

Script sẽ tự động cài:
- ✅ Node.js 20.x
- ✅ MongoDB 7.0
- ✅ PM2
- ✅ Nginx
- ✅ Certbot
- ✅ Clone repository
- ✅ Install dependencies

---

### 🎯 BƯỚC 3: Cấu hình & Chạy

#### 3.1. Setup MongoDB
```bash
bash setup-mongodb.sh
```
➡️ Lưu lại **MongoDB URI** để dùng bước tiếp

#### 3.2. Đăng ký dịch vụ (MIỄN PHÍ)

**🔐 Clerk** (Authentication)
1. ➡️ https://clerk.com
2. Tạo app → Copy keys:
   - `CLERK_PUBLISHABLE_KEY` (pk_test_...)
   - `CLERK_SECRET_KEY` (sk_test_...)

**☁️ Cloudinary** (Media - 25GB miễn phí)
1. ➡️ https://cloudinary.com
2. Dashboard → Copy:
   - Cloud Name
   - API Key
   - API Secret

#### 3.3. Tạo file .env
```bash
bash create-env.sh
```
➡️ Nhập thông tin từ bước 3.1 và 3.2

#### 3.4. Chạy production
```bash
bash run-production.sh
```

**🎉 XONG! Ứng dụng đã chạy!**

---

## 🌐 TRUY CẬP ỨNG DỤNG

### Local (Không có domain)
```
http://your-server-ip
```

### Với Domain + SSL (Khuyến nghị)

#### 1. Trỏ domain về server
```
A Record: @ → your-server-ip
```

#### 2. Cấu hình Nginx
```bash
sudo bash setup-nginx.sh
```

#### 3. Cài SSL miễn phí
```bash
sudo certbot --nginx -d your-domain.com
```

**➡️ Truy cập: `https://your-domain.com`**

---

## 📊 QUẢN LÝ ỨNG DỤNG

### Xem logs
```bash
pm2 logs spotify-backend
```

### Restart app
```bash
pm2 restart spotify-backend
```

### Monitor real-time
```bash
pm2 monit
```

### Xem status
```bash
pm2 status
```

---

## 🎬 VIDEO HƯỚNG DẪN

📺 **Xem video tutorial gốc:**
https://youtu.be/4sbklcQ0EXc

---

## 🔥 TẤT CẢ LỆNH QUAN TRỌNG

```bash
# 1. Upload scripts (nếu dùng SCP)
scp *.sh *.md user@server:/var/www/spotify/

# 2. SSH vào server
ssh user@server-ip

# 3. Cài đặt tự động
cd /var/www/spotify
chmod +x *.sh
sudo bash quick-install.sh

# 4. Setup MongoDB
bash setup-mongodb.sh

# 5. Tạo .env (cần Clerk & Cloudinary keys)
bash create-env.sh

# 6. Chạy app
bash run-production.sh

# 7. Setup Nginx + domain (optional)
sudo bash setup-nginx.sh
sudo certbot --nginx -d domain.com
```

---

## ⏱️ TIMELINE

| Bước | Thời gian | Mô tả |
|------|-----------|-------|
| Upload files | 1-2 phút | SCP hoặc Git |
| Quick Install | 5-10 phút | Tự động cài các tools |
| Đăng ký Clerk + Cloudinary | 5 phút | Lấy API keys |
| Setup MongoDB | 1 phút | Tạo DB & user |
| Tạo .env | 2 phút | Nhập credentials |
| Build & Deploy | 3-5 phút | PM2 start |
| Nginx + SSL (optional) | 5 phút | Domain & HTTPS |
| **TỔNG** | **~20-30 phút** | ⚡ |

---

## 📋 CHECKLIST HOÀN CHỈNH

### Chuẩn bị
- [ ] Có Ubuntu server (20.04+)
- [ ] Có quyền sudo
- [ ] Có SSH access

### Cài đặt
- [ ] Upload scripts lên server
- [ ] Chạy `quick-install.sh`
- [ ] Setup MongoDB với `setup-mongodb.sh`

### Dịch vụ
- [ ] Đăng ký Clerk → Lấy keys
- [ ] Đăng ký Cloudinary → Lấy credentials

### Cấu hình
- [ ] Chạy `create-env.sh`
- [ ] Nhập MongoDB URI
- [ ] Nhập Clerk keys
- [ ] Nhập Cloudinary credentials

### Deploy
- [ ] Chạy `run-production.sh`
- [ ] Kiểm tra `pm2 status`
- [ ] Test app: `http://server-ip`

### Production (Optional)
- [ ] Trỏ domain về server
- [ ] Chạy `setup-nginx.sh`
- [ ] Cài SSL: `certbot --nginx`
- [ ] Test HTTPS: `https://domain.com`

---

## 💡 MẸO HAY

### 1. Nhanh hơn với MongoDB Atlas (Cloud)
Thay vì MongoDB local:
- ➡️ https://www.mongodb.com/cloud/atlas
- Đăng ký miễn phí 512MB
- Copy connection string
- Dùng luôn trong `.env`

### 2. Dùng GitHub để sync code
```bash
# Lưu thay đổi
git add .
git commit -m "Update"
git push

# Update trên server
cd /var/www/spotify
git pull
bash run-production.sh
```

### 3. Auto backup MongoDB
```bash
# Thêm vào crontab
crontab -e

# Backup hàng ngày 2AM
0 2 * * * mongodump --uri="mongodb://..." --out=/backup/$(date +\%Y\%m\%d)
```

---

## 🐛 LỖI THƯỜNG GẶP

### Backend không start
```bash
# Kiểm tra .env
cat backend/.env

# Kiểm tra MongoDB
sudo systemctl status mongod

# Xem logs
pm2 logs
```

### Port 5000 đã dùng
```bash
# Tìm process
sudo lsof -i :5000

# Kill
sudo kill -9 <PID>
```

### Clerk authentication lỗi
- Kiểm tra `CLERK_PUBLISHABLE_KEY` đúng chưa
- Kiểm tra domain trong Clerk dashboard

---

## 📞 HỖ TRỢ & TÀI LIỆU

| Tài liệu | Link |
|----------|------|
| 📖 Hướng dẫn đầy đủ | [SETUP_UBUNTU.md](./SETUP_UBUNTU.md) |
| 📜 Mô tả scripts | [README_SCRIPTS.md](./README_SCRIPTS.md) |
| 📤 Hướng dẫn upload | [HUONG_DAN_UPLOAD_UBUNTU.md](./HUONG_DAN_UPLOAD_UBUNTU.md) |
| 🎥 Video tutorial | https://youtu.be/4sbklcQ0EXc |
| 💬 GitHub Issues | https://github.com/burakorkmez/realtime-spotify-clone/issues |
| 🔐 Clerk Docs | https://clerk.com/docs |
| ☁️ Cloudinary Docs | https://cloudinary.com/documentation |
| 🗄️ MongoDB Docs | https://www.mongodb.com/docs |

---

## 🎯 KẾT LUẬN

Bạn đã có đầy đủ công cụ để:
- ✅ Deploy Spotify Clone lên Ubuntu trong 20 phút
- ✅ Tự động hóa với scripts
- ✅ Quản lý với PM2
- ✅ Serve qua Nginx với SSL
- ✅ Scale và monitor

**Chúc bạn thành công! 🚀**

---

**P/S:** Nếu gặp vấn đề, đọc file `SETUP_UBUNTU.md` để biết chi tiết hoặc tham khảo phần Troubleshooting.

Made with ❤️ for Vietnamese developers


