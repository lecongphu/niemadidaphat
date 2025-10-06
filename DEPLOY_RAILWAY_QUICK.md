# 🚀 Deploy Nhanh lên Railway (10 phút)

Hướng dẫn deploy **Spotify Clone** lên **Railway** - nền tảng dễ nhất và đầy đủ tính năng nhất.

---

## ⭐ TẠI SAO CHỌN RAILWAY?

- ✅ **Hỗ trợ đầy đủ:** WebSocket, Socket.io
- ✅ **MongoDB built-in:** Không cần MongoDB Atlas
- ✅ **Deploy tự động:** Push GitHub là deploy
- ✅ **Free trial:** $5 credit dùng được 1 tháng
- ✅ **Không sleep:** App chạy 24/7
- ✅ **Logs tốt:** Real-time monitoring

**Chi phí:** ~$5/tháng (sau khi hết trial)

---

## 📋 CHUẨN BỊ (5 phút)

### 1. Đăng ký các dịch vụ miễn phí

#### 🔐 Clerk (Authentication)
1. Truy cập: https://clerk.com
2. Sign up → Create application
3. Vào **API Keys** → Copy:
   - `Publishable Key` (pk_live_xxx)
   - `Secret Key` (sk_live_xxx)

#### ☁️ Cloudinary (Media Storage)
1. Truy cập: https://cloudinary.com
2. Sign up (Free 25GB)
3. Vào **Dashboard** → Copy:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

### 2. Push code lên GitHub

```bash
cd E:\spotify

# Thêm .gitignore nếu chưa có
echo "node_modules/
.env
.env.local
backend/tmp/
dist/" > .gitignore

# Commit & push
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

---

## 🚀 DEPLOY LÊN RAILWAY (5 phút)

### Bước 1: Tạo Project

1. Truy cập: https://railway.app
2. Click **Start a New Project**
3. Chọn **Deploy from GitHub repo**
4. Authorize Railway → Chọn repository `spotify-clone`
5. Click **Deploy Now**

### Bước 2: Thêm MongoDB Service

1. Click **+ New** trong project
2. Chọn **Database** → **Add MongoDB**
3. Railway tự động tạo MongoDB instance

### Bước 3: Cấu hình Backend

1. Click vào **backend** service
2. Vào tab **Variables**
3. Thêm các biến môi trường:

```bash
# Port
PORT=5000

# MongoDB (Reference từ MongoDB service)
MONGODB_URI=${{MongoDB.MONGO_URL}}

# Node Environment
NODE_ENV=production

# Admin Email
ADMIN_EMAIL=admin@yourdomain.com

# Clerk (từ bước chuẩn bị)
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxx

# Cloudinary (từ bước chuẩn bị)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Vào tab **Settings** → **Service Settings:**
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
   - **Build Command:** `npm install`

5. Click **Generate Domain** để có public URL

### Bước 4: Cấu hình Frontend

1. Click vào **frontend** service
2. Vào tab **Variables**
3. Thêm biến:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
VITE_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

4. Vào tab **Settings** → **Service Settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve dist -s -p $PORT`

5. Click **Generate Domain** để có public URL

### Bước 5: Deploy

1. Railway sẽ tự động build và deploy
2. Xem logs để theo dõi quá trình deploy
3. Chờ 2-3 phút cho build hoàn tất

---

## 🌐 TRUY CẬP ỨNG DỤNG

### Lấy URLs

1. **Frontend URL:** `https://frontend-production-xxxx.up.railway.app`
2. **Backend URL:** `https://backend-production-xxxx.up.railway.app`

### Cấu hình CORS

Cập nhật `backend/src/index.js`:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://frontend-production-xxxx.up.railway.app", // Thay bằng URL của bạn
      "https://your-custom-domain.com" // Nếu có custom domain
    ],
    credentials: true,
  })
);
```

Commit và push:
```bash
git add .
git commit -m "Update CORS for Railway"
git push
```

Railway sẽ tự động deploy lại.

---

## 🎯 CUSTOM DOMAIN (Optional)

### Thêm domain riêng

1. Vào **frontend** service → **Settings** → **Domains**
2. Click **+ Custom Domain**
3. Nhập domain của bạn: `spotify.yourdomain.com`
4. Railway sẽ cung cấp DNS records
5. Thêm records vào DNS provider của bạn:
   ```
   CNAME spotify -> frontend-production-xxxx.up.railway.app
   ```
6. Đợi DNS propagate (~5-10 phút)
7. Railway tự động cấp SSL certificate

### Cấu hình Clerk cho custom domain

1. Vào **Clerk Dashboard** → **Domains**
2. Thêm `https://spotify.yourdomain.com`
3. Save changes

---

## 📊 MONITORING & LOGS

### Xem Logs Real-time

1. Click vào service (backend hoặc frontend)
2. Vào tab **Deployments**
3. Click vào deployment mới nhất
4. Xem **Logs** tab

### Metrics & Analytics

1. Tab **Metrics** hiển thị:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### Alerts (Optional)

1. **Settings** → **Alerts**
2. Cấu hình webhook hoặc email alerts

---

## 🔧 TROUBLESHOOTING

### Backend không start

**Kiểm tra logs:**
```
Click backend service → Deployments → View Logs
```

**Các lỗi thường gặp:**

1. **MongoDB connection failed**
   - Kiểm tra biến `MONGODB_URI` đã reference đúng chưa
   - Format: `${{MongoDB.MONGO_URL}}`

2. **Clerk authentication failed**
   - Kiểm tra `CLERK_SECRET_KEY` đúng chưa
   - Dùng production key (sk_live_xxx) không phải test key

3. **Port already in use**
   - Kiểm tra biến `PORT` đã set là `5000`

### Frontend build failed

**Kiểm tra:**
1. File `frontend/.env` có đúng format không
2. `VITE_CLERK_PUBLISHABLE_KEY` phải có prefix `VITE_`
3. Build command: `npm install && npm run build`

### CORS error

Thêm frontend domain vào CORS whitelist (xem bước trên).

---

## 💰 QUẢN LÝ CHI PHÍ

### Xem usage

1. Click **Settings** ở project level
2. Vào **Usage**
3. Xem chi tiết:
   - Compute time
   - Memory usage
   - Network egress

### Free trial

- **$5 credit** khi đăng ký
- Đủ dùng ~1 tháng với traffic vừa phải

### Pricing sau trial

- **Hobby Plan:** $5/month
  - Unlimited projects
  - Unlimited services
  - Pay for usage beyond included credits

### Optimize costs

1. **Reduce instances:** 1 instance mỗi service
2. **Optimize memory:** 512MB là đủ
3. **Dùng MongoDB Atlas:** Nếu cần scale
4. **CDN:** Dùng Cloudinary cho static assets

---

## 🚀 AUTO DEPLOY

### Setup CI/CD

Railway tự động deploy khi:
- ✅ Push code lên branch `main`
- ✅ Merge pull request
- ✅ Create new tag

### Manual deploy

1. Vào service → **Deployments**
2. Click **Deploy** button
3. Chọn branch/commit

### Rollback

1. **Deployments** tab
2. Chọn deployment cũ
3. Click **Redeploy**

---

## 📋 CHECKLIST

### Chuẩn bị
- [ ] Đăng ký Clerk → Lấy keys
- [ ] Đăng ký Cloudinary → Lấy credentials
- [ ] Push code lên GitHub

### Deploy
- [ ] Tạo Railway project
- [ ] Thêm MongoDB service
- [ ] Cấu hình backend variables
- [ ] Cấu hình frontend variables
- [ ] Generate domains
- [ ] Deploy thành công

### Post-deploy
- [ ] Test frontend URL
- [ ] Test backend API
- [ ] Cập nhật CORS
- [ ] Thêm custom domain (optional)
- [ ] Monitor logs

---

## 📞 HỖ TRỢ

### Railway Documentation
- 📖 Docs: https://docs.railway.app
- 💬 Discord: https://discord.gg/railway
- 🐦 Twitter: @railway

### Project Support
- 📧 Email: support@railway.app
- 💬 GitHub Issues: https://github.com/burakorkmez/realtime-spotify-clone/issues

---

## 🎉 HOÀN TẤT!

Sau 10 phút, bạn đã có:
- ✅ Spotify Clone chạy trên Railway
- ✅ MongoDB database riêng
- ✅ HTTPS với SSL certificate
- ✅ Auto deploy từ GitHub
- ✅ Real-time monitoring

**Frontend:** `https://frontend-production-xxxx.up.railway.app`

**Chúc bạn thành công! 🚀🎵**

---

## 💡 PRO TIPS

1. **Environment Groups:** Tạo shared variables cho nhiều services
2. **Railway CLI:** Deploy nhanh hơn từ terminal
3. **Staged Deployments:** Test trước khi deploy production
4. **Health Checks:** Setup để Railway tự restart khi crash
5. **Backup MongoDB:** Railway có snapshot tự động

---

Made with ❤️ for Vietnamese developers

