# 🎵 SPOTIFY CLONE - BẮT ĐẦU TẠI ĐÂY

## 📦 BẠN ĐANG Ở ĐÂU?

Bạn đã clone thành công repository **Realtime Spotify Clone** và có đầy đủ các công cụ tự động để deploy lên Ubuntu server!

---

## 🚀 CHỌN CON ĐƯỜNG CỦA BẠN

### 🖥️ A. ĐANG Ở WINDOWS (Hiện tại)

**Frontend đã chạy thành công** trên `http://localhost:3000/` ✅

Backend cần các dịch vụ sau để chạy:
- MongoDB (cơ sở dữ liệu)
- Clerk (xác thực)
- Cloudinary (lưu trữ media)

**➡️ Đọc file:** [`BAT_DAU_NHANH.md`](./BAT_DAU_NHANH.md)

### ☁️ B. DEPLOY LÊN SERVERLESS (Nhanh nhất - Khuyến nghị)

Không cần server, deploy trong 10-15 phút!

#### 🆓 Miễn phí: **Render**
```bash
10-15 phút | Free forever | Auto-sleep sau 15 phút
```
**➡️ Hướng dẫn:** [`DEPLOY_RENDER_FREE.md`](./DEPLOY_RENDER_FREE.md)

#### 💰 $5/tháng: **Railway** (Dễ nhất)
```bash
10 phút | $5/tháng | MongoDB built-in | Không sleep
```
**➡️ Hướng dẫn:** [`DEPLOY_RAILWAY_QUICK.md`](./DEPLOY_RAILWAY_QUICK.md)

#### 📊 So sánh tất cả platforms
**➡️ Xem chi tiết:** [`DEPLOY_SERVERLESS.md`](./DEPLOY_SERVERLESS.md)

### 🐧 C. DEPLOY LÊN UBUNTU SERVER (Advanced)

Bạn đã có **7 scripts tự động** và **4 tài liệu hướng dẫn** sẵn sàng!

**➡️ Làm theo 3 bước:**

#### Bước 1: Upload lên Ubuntu
Xem: [`HUONG_DAN_UPLOAD_UBUNTU.md`](./HUONG_DAN_UPLOAD_UBUNTU.md)

#### Bước 2: Chạy trên Ubuntu
```bash
cd /var/www/spotify
sudo bash quick-install.sh
```

#### Bước 3: Cấu hình & Deploy
```bash
bash setup-mongodb.sh      # Tạo DB
bash create-env.sh         # Tạo .env
bash run-production.sh     # Chạy app
```

**➡️ Chi tiết:** [`BAT_DAU_NHANH.md`](./BAT_DAU_NHANH.md)

---

## 📚 TÀI LIỆU HƯỚNG DẪN

| File | Mô tả | Dành cho |
|------|-------|----------|
| **[BAT_DAU_NHANH.md](./BAT_DAU_NHANH.md)** | 🔥 **ĐỌC ĐẦU TIÊN!** Timeline & checklist | Tất cả |
| [SETUP_UBUNTU.md](./SETUP_UBUNTU.md) | Hướng dẫn chi tiết từng bước | Ubuntu |
| [README_SCRIPTS.md](./README_SCRIPTS.md) | Mô tả các scripts & commands | Ubuntu |
| [HUONG_DAN_UPLOAD_UBUNTU.md](./HUONG_DAN_UPLOAD_UBUNTU.md) | 4 cách upload từ Windows | Windows→Ubuntu |

---

## 🛠️ SCRIPTS TỰ ĐỘNG HÓA

| Script | Chức năng | Thời gian |
|--------|-----------|-----------|
| **quick-install.sh** | 🚀 Cài tất cả chỉ 1 lệnh | 5-10 phút |
| setup-ubuntu.sh | Cài Node.js, MongoDB, PM2, Nginx | 5-7 phút |
| setup-mongodb.sh | Tạo database & user | 1 phút |
| create-env.sh | Tạo file .env tương tác | 2 phút |
| run-production.sh | Build & deploy với PM2 | 3-5 phút |
| setup-nginx.sh | Cấu hình Nginx + domain | 2 phút |
| prepare-scripts.sh | Chuẩn bị upload (Windows) | <1 phút |

---

## ⚡ QUICK START (20 phút)

### 1. Trên Ubuntu Server
```bash
# Clone repo
cd /var/www/spotify
git clone https://github.com/burakorkmez/realtime-spotify-clone .

# Cài đặt tự động
sudo bash quick-install.sh

# Setup MongoDB
bash setup-mongodb.sh

# Lưu MongoDB URI để dùng bước sau
```

### 2. Đăng ký dịch vụ (MIỄN PHÍ)

**Clerk** (Authentication)
- ➡️ https://clerk.com
- Tạo app → Copy `CLERK_PUBLISHABLE_KEY` và `CLERK_SECRET_KEY`

**Cloudinary** (Media Storage - 25GB free)
- ➡️ https://cloudinary.com  
- Dashboard → Copy Cloud Name, API Key, API Secret

### 3. Cấu hình & Chạy
```bash
# Tạo .env với thông tin từ bước 1 & 2
bash create-env.sh

# Deploy
bash run-production.sh

# Kiểm tra
pm2 status
pm2 logs
```

### 4. Truy cập
```
http://your-server-ip
```

### 5. Setup Domain + SSL (Optional)
```bash
# Trỏ domain A record → server IP
# Sau đó chạy:
sudo bash setup-nginx.sh
sudo certbot --nginx -d your-domain.com
```

**➡️ Truy cập:** `https://your-domain.com` 🎉

---

## 📊 KIẾN TRÚC DỰ ÁN

```
📁 E:\spotify\
│
├── 📂 backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controller/      # API controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── lib/             # Database, Socket.io
│   └── .env                 # Backend config
│
├── 📂 frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # App pages
│   │   ├── stores/         # Zustand state
│   │   └── layout/         # App layout
│   └── .env                # Frontend config
│
├── 🚀 quick-install.sh     # Install all in one
├── ⚙️ setup-ubuntu.sh       # Setup tools
├── 🗄️ setup-mongodb.sh      # Setup MongoDB
├── 📝 create-env.sh         # Create .env
├── ▶️ run-production.sh     # Deploy app
├── 🌐 setup-nginx.sh        # Setup Nginx
│
└── 📚 Documentation/
    ├── BAT_DAU_NHANH.md
    ├── SETUP_UBUNTU.md
    ├── README_SCRIPTS.md
    └── HUONG_DAN_UPLOAD_UBUNTU.md
```

---

## 🎯 TÍNH NĂNG CHÍNH

- 🎸 **Phát nhạc** - Play, next, previous
- 🔈 **Điều chỉnh âm lượng** - Volume slider
- 🎧 **Admin dashboard** - Tạo albums & songs
- 💬 **Real-time Chat** - Tích hợp chat
- 👨🏼‍💼 **Online/Offline** - User status
- 👀 **Activity feed** - Xem người khác đang nghe gì
- 📊 **Analytics** - Thống kê dữ liệu
- 🔐 **Authentication** - Clerk OAuth

---

## 🔧 CÔNG NGHỆ SỬ DỤNG

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (Real-time)
- Clerk (Authentication)
- Cloudinary (Media storage)

### Frontend
- React + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- Zustand (State management)
- Radix UI (Components)

### DevOps (Ubuntu)
- PM2 (Process manager)
- Nginx (Reverse proxy)
- Certbot (SSL certificates)
- MongoDB (Database)

---

## 🎓 HỌC TỪ VIDEO

📺 **Full Tutorial:**
https://youtu.be/4sbklcQ0EXc

---

## 📞 HỖ TRỢ

- 💬 **GitHub Issues:** https://github.com/burakorkmez/realtime-spotify-clone/issues
- 📖 **Clerk Docs:** https://clerk.com/docs
- ☁️ **Cloudinary Docs:** https://cloudinary.com/documentation
- 🗄️ **MongoDB Docs:** https://www.mongodb.com/docs

---

## ✅ CHECKLIST TỔNG QUAN

### Windows (Development)
- [x] Clone repository ✅
- [x] Cài dependencies ✅
- [x] Frontend chạy thành công ✅
- [ ] Cài MongoDB local hoặc dùng Atlas
- [ ] Đăng ký Clerk
- [ ] Đăng ký Cloudinary
- [ ] Tạo .env
- [ ] Chạy backend

### Ubuntu (Production)
- [ ] Upload scripts lên server
- [ ] Chạy `quick-install.sh`
- [ ] Setup MongoDB
- [ ] Đăng ký Clerk & Cloudinary
- [ ] Tạo .env
- [ ] Deploy với PM2
- [ ] (Optional) Setup Nginx
- [ ] (Optional) Cài SSL

---

## 🎯 BƯỚC TIẾP THEO

### 1. Đọc ngay: [`BAT_DAU_NHANH.md`](./BAT_DAU_NHANH.md)
### 2. Nếu có Ubuntu server: Follow [`HUONG_DAN_UPLOAD_UBUNTU.md`](./HUONG_DAN_UPLOAD_UBUNTU.md)
### 3. Chi tiết kỹ thuật: Xem [`SETUP_UBUNTU.md`](./SETUP_UBUNTU.md)

---

## 💡 PRO TIPS

1. **Dùng MongoDB Atlas** thay vì local MongoDB (dễ hơn)
2. **Free tier Clerk & Cloudinary** đủ cho development
3. **PM2** giúp app tự restart khi crash
4. **Let's Encrypt SSL** miễn phí trọn đời
5. **Backup MongoDB** định kỳ bằng cron

---

## 🏆 KẾT QUẢ CUỐI CÙNG

Sau khi hoàn thành, bạn sẽ có:

✅ Web app Spotify clone hoàn chỉnh  
✅ Chạy trên Ubuntu server  
✅ Quản lý với PM2  
✅ Serve qua Nginx  
✅ HTTPS với SSL certificate  
✅ Real-time chat & activity  
✅ Admin dashboard  
✅ Authentication & authorization  

**Timeline: ~20-30 phút** ⚡

---

## 🎉 CHÚC BẠN THÀNH CÔNG!

Nếu có vấn đề, hãy đọc phần **Troubleshooting** trong các file hướng dẫn.

**Made with ❤️ for Vietnamese developers**

---

**P/S:** Nhớ star ⭐ repository gốc nếu thấy hữu ích!  
https://github.com/burakorkmez/realtime-spotify-clone


