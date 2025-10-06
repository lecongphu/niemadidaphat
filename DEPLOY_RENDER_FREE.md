# 🆓 Deploy Miễn Phí lên Render (15 phút)

Hướng dẫn deploy **Spotify Clone** lên **Render** - hoàn toàn **MIỄN PHÍ**.

---

## ⭐ TẠI SAO CHỌN RENDER?

- ✅ **Hoàn toàn miễn phí:** Free tier không giới hạn thời gian
- ✅ **Hỗ trợ WebSocket:** Socket.io hoạt động tốt
- ✅ **Deploy tự động:** Từ GitHub
- ✅ **SSL miễn phí:** HTTPS tự động
- ✅ **Dễ sử dụng:** UI thân thiện

⚠️ **Lưu ý:** Free tier có giới hạn:
- App sleep sau 15 phút không hoạt động
- Cold start ~30 giây khi wake up
- 750 giờ/tháng (đủ cho 1 app 24/7)

**Chi phí:** **MIỄN PHÍ** ✨

---

## 📋 CHUẨN BỊ (10 phút)

### 1. MongoDB Atlas (Miễn phí)

#### Tạo cluster miễn phí
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Sign up → Create free cluster
3. Chọn **Free Tier (M0):**
   - Cloud Provider: AWS
   - Region: Singapore (gần Việt Nam nhất)
4. Cluster Name: `spotify-cluster`
5. Click **Create**

#### Tạo Database User
1. **Security** → **Database Access**
2. **Add New Database User:**
   - Authentication: Password
   - Username: `spotify_user`
   - Password: `MatKhauManh123` (tự tạo)
   - Role: Read and write to any database
3. **Add User**

#### Whitelist IP
1. **Security** → **Network Access**
2. **Add IP Address:**
   - Click **Allow Access from Anywhere**
   - IP: `0.0.0.0/0`
   - Click **Confirm**

#### Lấy Connection String
1. **Databases** → Click **Connect**
2. Chọn **Connect your application**
3. Driver: **Node.js**
4. Copy connection string:
   ```
   mongodb+srv://spotify_user:<password>@spotify-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Thay `<password>` bằng password thực của bạn
6. Thêm database name: `/spotify-clone` trước `?`
   ```
   mongodb+srv://spotify_user:MatKhauManh123@spotify-cluster.xxxxx.mongodb.net/spotify-clone?retryWrites=true&w=majority
   ```

### 2. Clerk & Cloudinary

#### 🔐 Clerk
1. https://clerk.com → Create app
2. Copy keys:
   - `Publishable Key` (pk_live_xxx)
   - `Secret Key` (sk_live_xxx)

#### ☁️ Cloudinary
1. https://cloudinary.com → Sign up
2. Dashboard → Copy:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

### 3. Chuẩn bị Code

```bash
cd E:\spotify

# Tạo file render.yaml nếu chưa có (đã có rồi)

# Commit & push
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## 🚀 DEPLOY LÊN RENDER

### Bước 1: Tạo Account

1. Truy cập: https://render.com
2. **Sign Up** với GitHub
3. Authorize Render to access your repositories

### Bước 2: Deploy Backend

#### Tạo Web Service

1. Dashboard → **New +** → **Web Service**
2. **Connect a repository:**
   - Click **Configure account** (nếu cần)
   - Chọn repository `spotify-clone`
3. **Configure Service:**
   ```
   Name: spotify-backend
   Region: Singapore
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

#### Thêm Environment Variables

Scroll xuống **Environment Variables**, click **Add from .env**:

```bash
PORT=5000
NODE_ENV=production
ADMIN_EMAIL=admin@yourdomain.com

# MongoDB Atlas (từ bước chuẩn bị)
MONGODB_URI=mongodb+srv://spotify_user:MatKhauManh123@spotify-cluster.xxxxx.mongodb.net/spotify-clone?retryWrites=true&w=majority

# Clerk
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Deploy

1. Click **Create Web Service**
2. Render sẽ build và deploy (~3-5 phút)
3. Xem logs để theo dõi
4. Khi xong, lấy URL: `https://spotify-backend.onrender.com`

### Bước 3: Deploy Frontend

#### Tạo Static Site

1. Dashboard → **New +** → **Static Site**
2. **Connect repository:** `spotify-clone`
3. **Configure:**
   ```
   Name: spotify-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   Plan: Free
   ```

#### Thêm Environment Variables

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
VITE_API_URL=https://spotify-backend.onrender.com
```

#### Deploy

1. Click **Create Static Site**
2. Đợi build (~2-3 phút)
3. Lấy URL: `https://spotify-frontend.onrender.com`

### Bước 4: Cấu hình CORS

#### Cập nhật Backend

Sửa file `backend/src/index.js`:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://spotify-frontend.onrender.com", // Thêm domain frontend
      // Thêm custom domain nếu có
    ],
    credentials: true,
  })
);
```

#### Deploy lại

```bash
git add .
git commit -m "Update CORS for Render"
git push
```

Render tự động deploy lại backend.

---

## 🌐 TRUY CẬP ỨNG DỤNG

### URLs

- **Frontend:** `https://spotify-frontend.onrender.com`
- **Backend API:** `https://spotify-backend.onrender.com/api`

### Test

1. Mở frontend URL
2. Đăng ký/đăng nhập bằng Clerk
3. Test các tính năng:
   - Phát nhạc
   - Chat
   - Admin dashboard (nếu là admin)

---

## 🎯 CUSTOM DOMAIN (Optional)

### Thêm Domain

1. **Dashboard** → Chọn service
2. **Settings** → **Custom Domains**
3. Click **Add Custom Domain**
4. Nhập domain: `spotify.yourdomain.com`
5. Render cung cấp DNS records:
   ```
   CNAME spotify -> spotify-frontend.onrender.com
   ```
6. Thêm record vào DNS provider
7. Đợi DNS propagate (~5-10 phút)
8. Render tự động cấp SSL

### Cập nhật Clerk

1. Clerk Dashboard → **Domains**
2. Thêm `https://spotify.yourdomain.com`
3. Save

---

## ⚡ GIẢI QUYẾT SLEEP ISSUE

Free tier app sleep sau 15 phút. Có 2 cách giải quyết:

### Cách 1: Ping Service (Khuyến nghị)

Dùng **Cron Job** miễn phí để ping app 5 phút/lần:

#### UptimeRobot (Miễn phí)
1. Truy cập: https://uptimerobot.com
2. Sign up → **Add New Monitor:**
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Spotify Backend
   URL: https://spotify-backend.onrender.com/api/health
   Monitoring Interval: 5 minutes
   ```
3. Save

#### Cron-job.org (Miễn phí)
1. Truy cập: https://cron-job.org
2. Sign up → **Create Cronjob:**
   ```
   Title: Keep Spotify Alive
   Address: https://spotify-backend.onrender.com/api/health
   Schedule: */5 * * * * (Every 5 minutes)
   ```
3. Save

### Cách 2: Upgrade lên Paid Plan

- **Starter Plan:** $7/month
- Không sleep
- Faster performance

---

## 🔧 TROUBLESHOOTING

### Backend không start

**Kiểm tra logs:**
1. Dashboard → Backend service
2. **Logs** tab
3. Tìm error messages

**Lỗi thường gặp:**

1. **MongoDB connection failed**
   ```
   Kiểm tra:
   - Connection string đúng format
   - Password không có ký tự đặc biệt (hoặc encode)
   - IP đã whitelist (0.0.0.0/0)
   ```

2. **Module not found**
   ```
   Fix: Kiểm tra package.json
   Redeploy: Manual Deploy → Clear build cache
   ```

### Frontend build failed

1. **Logs** → Tìm error
2. Thường do:
   - Environment variables sai
   - Build command sai
   - Dependencies conflict

**Fix:**
```bash
# Test local
cd frontend
npm install
npm run build

# Nếu ok, push lại
git add .
git commit -m "Fix build"
git push
```

### App bị sleep

- Dùng UptimeRobot hoặc cron-job.org (xem trên)
- Hoặc upgrade lên paid plan

---

## 📊 MONITORING

### Render Dashboard

1. **Metrics:**
   - Request count
   - Response time
   - Bandwidth usage

2. **Logs:**
   - Real-time logs
   - Filter by level
   - Search logs

### MongoDB Atlas

1. **Metrics:**
   - Connections
   - Operations/sec
   - Storage

2. **Alerts:**
   - Setup email alerts
   - Threshold monitoring

---

## 💰 CHI PHÍ

### Free Tier Limits

| Service | Limit | Render Free | Paid Plan |
|---------|-------|-------------|-----------|
| Web Services | Hours | 750h/month | Unlimited |
| Static Sites | Sites | Unlimited | Unlimited |
| Bandwidth | GB | 100GB/month | Unlimited |
| Build Time | Minutes | 500min/month | Unlimited |
| Sleep After | Time | 15 minutes | Never |

### Khi nào nên upgrade?

- ✅ App cần chạy 24/7 không sleep
- ✅ Traffic cao (>100GB/month)
- ✅ Cần faster performance
- ✅ Production app quan trọng

**Starter Plan:** $7/month/service

---

## 🚀 AUTO DEPLOY

### Setup

Render tự động deploy khi:
- ✅ Push lên branch `main`
- ✅ Merge pull request

### Manual Deploy

1. Dashboard → Service
2. **Manual Deploy** → **Deploy latest commit**

### Rollback

1. **Deploys** tab
2. Chọn deploy cũ
3. Click **Rollback to this version**

---

## 📋 CHECKLIST

### Chuẩn bị
- [ ] Tạo MongoDB Atlas cluster
- [ ] Lấy connection string
- [ ] Đăng ký Clerk → Keys
- [ ] Đăng ký Cloudinary → Credentials
- [ ] Push code lên GitHub

### Deploy
- [ ] Deploy backend service
- [ ] Thêm environment variables
- [ ] Deploy thành công
- [ ] Deploy frontend
- [ ] Test URLs

### Post-deploy
- [ ] Cấu hình CORS
- [ ] Test toàn bộ features
- [ ] Setup UptimeRobot (anti-sleep)
- [ ] Monitor logs
- [ ] (Optional) Custom domain

---

## 🎉 HOÀN TẤT!

Bạn đã deploy thành công **Spotify Clone** lên Render **MIỄN PHÍ**! 🎵

**URLs:**
- Frontend: `https://spotify-frontend.onrender.com`
- Backend: `https://spotify-backend.onrender.com`

**Lưu ý:**
- Setup UptimeRobot để tránh sleep
- Monitor logs thường xuyên
- Backup MongoDB định kỳ

---

## 💡 PRO TIPS

1. **Performance:** Dùng Cloudinary cho tất cả media (không lưu trên server)
2. **Database:** MongoDB Atlas auto-backup
3. **Logs:** Dùng papertrail hoặc logtail cho log retention
4. **Monitoring:** Setup Sentry cho error tracking
5. **CDN:** Render tự động dùng CDN cho static sites

---

## 📞 HỖ TRỢ

- 📖 **Render Docs:** https://render.com/docs
- 💬 **Community:** https://community.render.com
- 📧 **Support:** support@render.com
- 🐦 **Twitter:** @render

---

**Made with ❤️ for Vietnamese developers**

Chúc bạn thành công với ứng dụng Spotify Clone! 🚀✨

