# 🚀 Deploy Spotify Clone lên Serverless Platforms

Hướng dẫn deploy dự án lên các nền tảng serverless phổ biến (MIỄN PHÍ hoặc giá rẻ).

---

## 📊 SO SÁNH CÁC NỀN TẢNG

| Platform | Frontend | Backend | WebSocket | MongoDB | Free Tier | Khuyến nghị |
|----------|----------|---------|-----------|---------|-----------|-------------|
| **Railway** | ✅ | ✅ | ✅ | ✅ Built-in | $5/tháng | ⭐⭐⭐⭐⭐ |
| **Render** | ✅ | ✅ | ✅ | ❌ Cần Atlas | Free tier tốt | ⭐⭐⭐⭐⭐ |
| **Fly.io** | ✅ | ✅ | ✅ | ❌ Cần Atlas | Free tier tốt | ⭐⭐⭐⭐ |
| **Vercel** | ✅ | ⚠️ Giới hạn | ❌ | ❌ Cần Atlas | Free unlimited | ⭐⭐⭐ |
| **Netlify** | ✅ | ⚠️ Functions | ❌ | ❌ Cần Atlas | Free unlimited | ⭐⭐⭐ |
| **Heroku** | ✅ | ✅ | ✅ | ❌ Cần Atlas | ❌ Không còn free | ⭐⭐ |

**Khuyến nghị:** **Railway** hoặc **Render** (dễ nhất, đầy đủ tính năng)

---

## 🎯 PHƯƠNG ÁN 1: RAILWAY (Khuyến nghị nhất)

✅ **Ưu điểm:**
- Hỗ trợ đầy đủ WebSocket & Socket.io
- MongoDB built-in (không cần Atlas)
- Deploy tự động từ GitHub
- Logs & monitoring tốt
- $5 trial credit (đủ dùng 1 tháng)

### Bước 1: Chuẩn bị dự án

Tạo file `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Tạo file `Procfile` (nếu cần):
```
web: cd backend && npm start
```

### Bước 2: Push code lên GitHub

```bash
cd E:\spotify
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Bước 3: Deploy trên Railway

1. **Truy cập:** https://railway.app
2. **Đăng nhập** bằng GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Chọn repository:** spotify-clone
5. **Add services:**
   - **MongoDB:** Railway tự động cung cấp
   - **Backend:** Deploy từ `/backend`
   - **Frontend:** Deploy từ `/frontend`

### Bước 4: Cấu hình biến môi trường

**MongoDB Service:**
- Railway tự động tạo và cung cấp `MONGO_URL`

**Backend Service:**
```bash
PORT=5000
MONGODB_URI=${{MongoDB.MONGO_URL}}  # Reference từ MongoDB service
NODE_ENV=production
ADMIN_EMAIL=your@email.com

# Clerk
CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Frontend Service:**
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
VITE_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

### Bước 5: Deploy Settings

**Backend:**
- **Start Command:** `npm start`
- **Build Command:** `npm install`
- **Root Directory:** `/backend`

**Frontend:**
- **Start Command:** `npm run preview` (hoặc serve dist)
- **Build Command:** `npm install && npm run build`
- **Root Directory:** `/frontend`

### Bước 6: Lấy URL

```
Frontend: https://your-frontend.up.railway.app
Backend: https://your-backend.up.railway.app
```

**Chi phí:** ~$5/tháng với trial credit

---

## 🎯 PHƯƠNG ÁN 2: RENDER (Miễn phí)

✅ **Ưu điểm:**
- Free tier rất tốt
- Hỗ trợ WebSocket
- Deploy tự động từ GitHub
- Dễ cấu hình

⚠️ **Lưu ý:** Free tier sleep sau 15 phút không hoạt động

### Bước 1: Chuẩn bị MongoDB Atlas

1. **Truy cập:** https://www.mongodb.com/cloud/atlas
2. **Tạo cluster miễn phí** (512MB)
3. **Lấy connection string**

### Bước 2: Tạo `render.yaml`

```yaml
services:
  # Backend Service
  - type: web
    name: spotify-backend
    env: node
    region: singapore
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: PORT
        value: 5000
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false  # Nhập thủ công
      - key: ADMIN_EMAIL
        value: admin@example.com
      - key: CLERK_PUBLISHABLE_KEY
        sync: false
      - key: CLERK_SECRET_KEY
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false

  # Frontend Service
  - type: web
    name: spotify-frontend
    env: static
    region: singapore
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    envVars:
      - key: VITE_CLERK_PUBLISHABLE_KEY
        sync: false
      - key: VITE_API_URL
        value: https://spotify-backend.onrender.com
```

### Bước 3: Deploy trên Render

1. **Truy cập:** https://render.com
2. **Sign up** với GitHub
3. **New** → **Blueprint**
4. **Connect repository**
5. **Nhập biến môi trường**
6. **Deploy**

### Bước 4: Cấu hình CORS

Cập nhật `backend/src/index.js`:
```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://spotify-frontend.onrender.com" // Thêm domain của bạn
    ],
    credentials: true,
  })
);
```

**Chi phí:** MIỄN PHÍ (với giới hạn sleep)

---

## 🎯 PHƯƠNG ÁN 3: VERCEL + SERVERLESS FUNCTIONS

✅ **Ưu điểm:**
- Free unlimited
- Deploy cực nhanh
- CDN toàn cầu

⚠️ **Hạn chế:** 
- Không hỗ trợ WebSocket đầy đủ (cần tách Socket.io ra)
- Backend phải chuyển sang Serverless Functions

### Cấu trúc mới (Serverless)

```
spotify/
├── api/                      # Backend API (Serverless Functions)
│   ├── albums.js
│   ├── songs.js
│   ├── auth.js
│   └── ...
├── frontend/                 # React app
└── vercel.json              # Config
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "CLERK_SECRET_KEY": "@clerk-secret-key",
    "CLOUDINARY_CLOUD_NAME": "@cloudinary-cloud-name"
  }
}
```

### Deploy Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd E:\spotify
vercel

# Thêm secrets
vercel secrets add mongodb-uri "mongodb+srv://..."
vercel secrets add clerk-secret-key "sk_..."
```

**Lưu ý:** Socket.io cần deploy riêng lên Railway/Render

**Chi phí:** MIỄN PHÍ

---

## 🎯 PHƯƠNG ÁN 4: FLY.IO

✅ **Ưu điểm:**
- Free tier tốt (3 VMs)
- Hỗ trợ đầy đủ WebSocket
- Gần Việt Nam (Singapore region)

### Bước 1: Cài Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### Bước 2: Tạo Dockerfile

**Backend Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
EXPOSE 5000
CMD ["node", "src/index.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Bước 3: Deploy

```bash
# Login
fly auth login

# Backend
cd backend
fly launch --name spotify-backend --region sin
fly secrets set MONGODB_URI="..." CLERK_SECRET_KEY="..."
fly deploy

# Frontend
cd ../frontend
fly launch --name spotify-frontend --region sin
fly deploy
```

**Chi phí:** MIỄN PHÍ (3 VMs)

---

## 🎯 PHƯƠNG ÁN 5: NETLIFY + SEPARATE BACKEND

✅ **Frontend trên Netlify (Free)**
✅ **Backend trên Railway/Render**

### Deploy Frontend lên Netlify

1. **Push lên GitHub**
2. **Netlify:** https://netlify.com
3. **New site from Git**
4. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. **Environment variables:**
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_...
   VITE_API_URL=https://backend.railway.app
   ```

### Deploy Backend lên Railway

(Xem Phương án 1)

**Chi phí:** Frontend FREE + Backend $5/tháng

---

## 📋 CHECKLIST DEPLOY

### Chuẩn bị
- [ ] Push code lên GitHub
- [ ] Đăng ký Clerk (production keys)
- [ ] Đăng ký Cloudinary
- [ ] Đăng ký MongoDB Atlas (nếu cần)

### Deploy
- [ ] Chọn platform phù hợp
- [ ] Tạo file config cần thiết
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Cấu hình biến môi trường
- [ ] Test ứng dụng

### Post-deploy
- [ ] Setup custom domain
- [ ] Cấu hình SSL (tự động)
- [ ] Monitor logs
- [ ] Setup backup (nếu cần)

---

## 🎯 KHUYẾN NGHỊ THEO NHU CẦU

### 🆓 Hoàn toàn miễn phí
**Render** (Backend + Frontend)
- ✅ Free tier tốt
- ⚠️ Sleep sau 15 phút
- 💡 Dùng MongoDB Atlas free

### 💰 Sẵn sàng trả $5/tháng
**Railway** (All-in-one)
- ✅ Không sleep
- ✅ MongoDB built-in
- ✅ Deploy đơn giản nhất

### ⚡ Tốc độ tối đa
**Vercel** (Frontend) + **Railway** (Backend)
- ✅ CDN toàn cầu
- ✅ Deploy nhanh nhất
- 💰 ~$5/tháng

### 🌏 Gần Việt Nam
**Fly.io** (Singapore region)
- ✅ Latency thấp nhất
- ✅ Free tier tốt
- 💡 Cần biết Docker

---

## 🛠️ CẤU HÌNH CORS CHO PRODUCTION

Cập nhật `backend/src/index.js`:

```javascript
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  "https://your-domain.com"
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
```

Thêm biến môi trường:
```
FRONTEND_URL=https://your-frontend.railway.app
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Đổi tất cả keys sang production (không dùng `test_`)
- [ ] Thêm domain vào Clerk allowed origins
- [ ] Cấu hình CORS đúng
- [ ] Set `NODE_ENV=production`
- [ ] Không commit `.env` lên Git
- [ ] Enable rate limiting
- [ ] Setup monitoring & alerts

---

## 📊 SO SÁNH CHI PHÍ

| Setup | Platform | Chi phí/tháng | Sleep? |
|-------|----------|---------------|--------|
| **Economy** | Render Free | $0 | ✅ Có |
| **Balanced** | Railway | $5 | ❌ Không |
| **Premium** | Vercel + Railway | $5 | ❌ Không |
| **Enterprise** | AWS/GCP | $15+ | ❌ Không |

**MongoDB:**
- Atlas Free: $0 (512MB)
- Atlas Shared: $9 (2GB)
- Railway MongoDB: Include trong $5

---

## 🚀 QUICK START - RAILWAY (Nhanh nhất)

```bash
# 1. Push lên GitHub
git add .
git commit -m "Deploy to Railway"
git push

# 2. Truy cập Railway
# https://railway.app

# 3. New Project → Deploy from GitHub

# 4. Add MongoDB service

# 5. Set environment variables

# 6. Deploy!
```

**⏱️ Thời gian:** 10-15 phút

---

## 📞 HỖ TRỢ

- 🎥 **Railway Tutorial:** https://docs.railway.app
- 📖 **Render Docs:** https://render.com/docs
- 🚀 **Vercel Docs:** https://vercel.com/docs
- ✈️ **Fly.io Docs:** https://fly.io/docs

---

## 🎉 KẾT LUẬN

**Khuyến nghị:**
1. **Mới bắt đầu:** Dùng **Render** (free)
2. **Dùng lâu dài:** Dùng **Railway** ($5)
3. **Tốc độ cao:** Dùng **Vercel + Railway**

Tất cả đều dễ deploy và có hỗ trợ tốt!

Made with ❤️ for Vietnamese developers

