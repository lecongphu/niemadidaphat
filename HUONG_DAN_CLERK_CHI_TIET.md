# 🔐 HƯỚNG DẪN THIẾT LẬP CLERK.COM CHI TIẾT

## 📑 MỤC LỤC
1. [Phần 1: Thiết lập cơ bản](#phần-1-thiết-lập-cơ-bản)
2. [Phần 2: Cấu hình nâng cao](#phần-2-cấu-hình-nâng-cao)
3. [Phần 3: Giải quyết vấn đề Token Expiry (60 giây)](#phần-3-giải-quyết-vấn-đề-token-expiry)
4. [Phần 4: Tối ưu hóa Production](#phần-4-tối-ưu-hóa-production)

---

## 📌 PHẦN 1: THIẾT LẬP Cơ BẢN

### Bước 1: Tạo tài khoản Clerk

1. **Truy cập Clerk:**
   - Vào https://clerk.com
   - Click **"Start building for free"** hoặc **"Sign up"**

2. **Đăng ký tài khoản:**
   - Chọn đăng ký bằng **GitHub** (khuyến nghị) hoặc **Google**
   - Hoặc sử dụng email thông thường
   - Xác nhận email nếu cần

3. **Tạo Application:**
   ```
   Application Name: Spotify Clone (hoặc tên bạn muốn)
   ```

### Bước 2: Cấu hình Application

1. **Chọn phương thức đăng nhập:**
   - ✅ **Email address** (khuyến nghị)
   - ✅ **Google OAuth** (khuyến nghị cho UX tốt)
   - ❌ Phone number (tùy chọn, tốn phí)
   - ✅ **Username** (tùy chọn)

2. **Cấu hình Social Login (OAuth):**
   - Click vào **SSO Connections** trong sidebar
   - Chọn **Google**
   - Click **Enable**
   - Không cần tạo OAuth app riêng, Clerk sẽ tự xử lý ở môi trường development

### Bước 3: Lấy API Keys

1. **Vào API Keys:**
   - Sidebar → **API Keys**
   - Bạn sẽ thấy 2 loại keys:

   ```
   📝 PUBLISHABLE KEY (Public - an toàn để public)
   Ví dụ: pk_test_xxxxxxxxxxxxxxxxxxxxx
   
   🔐 SECRET KEY (Private - TUYỆT ĐỐI không public)
   Ví dụ: sk_test_xxxxxxxxxxxxxxxxxxxxx
   ```

2. **Copy keys:**
   - Click vào icon **Copy** bên cạnh mỗi key
   - Lưu tạm vào Notepad

### Bước 4: Tạo file .env

#### 🔹 Backend (.env trong folder backend/)

Tạo file `backend/.env`:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/spotify-clone
# hoặc MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spotify-clone

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Clerk - Backend
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Admin
ADMIN_EMAIL=your-email@gmail.com

# Server
PORT=5000
NODE_ENV=development
```

#### 🔹 Frontend (.env trong folder frontend/)

Tạo file `frontend/.env`:

```bash
# Clerk - Frontend
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Không cần CLERK_SECRET_KEY ở frontend!
```

⚠️ **LƯU Ý:** 
- Frontend chỉ cần `PUBLISHABLE_KEY`
- Backend cần cả `PUBLISHABLE_KEY` và `SECRET_KEY`
- Không bao giờ commit `.env` lên Git!

### Bước 5: Cài đặt Dependencies (đã có trong project)

Các package đã được cài:

```json
// Frontend
"@clerk/clerk-react": "^5.14.0"

// Backend
"@clerk/express": "^1.3.4"
```

### Bước 6: Cấu hình Clerk Provider trong Frontend

File `frontend/src/main.tsx` cần wrap App với ClerkProvider:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
```

---

## 📌 PHẦN 2: CẤU HÌNH NÂNG CAO

### Bước 1: Cấu hình JWT Template (QUAN TRỌNG!)

Đây là bước **CỰC KỲ QUAN TRỌNG** để tránh token expiry 60 giây!

1. **Vào Dashboard Clerk:**
   - Sidebar → **JWT Templates**
   - Click **+ New template**

2. **Tạo Custom Template:**
   ```
   Name: default
   Template type: Blank
   ```

3. **Cấu hình Claims:**
   
   Trong phần **Claims**, thêm:
   ```json
   {
     "userId": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "firstName": "{{user.first_name}}",
     "lastName": "{{user.last_name}}",
     "imageUrl": "{{user.image_url}}"
   }
   ```

4. **⚠️ CẤU HÌNH TOKEN LIFETIME (QUAN TRỌNG NHẤT):**
   
   Scroll xuống phần **Token Lifetime**:
   ```
   Session token lifetime: 3600 seconds (1 giờ)
   hoặc: 86400 seconds (24 giờ) - khuyến nghị cho development
   ```

   📝 **Giải thích:**
   - Mặc định Clerk set lifetime = 60 giây (1 phút)
   - Bạn cần tăng lên ít nhất 3600 giây (1 giờ)
   - Cho production: 3600-7200 giây (1-2 giờ)
   - Cho development: 86400 giờ (24 giờ) để dễ test

5. **Cấu hình Session:**
   - Sidebar → **Sessions**
   - **Inactive lifetime**: 7 days (mặc định)
   - **Maximum lifetime**: 7 days
   - **Multi-session handling**: Multiple sessions (cho phép đăng nhập nhiều thiết bị)

6. **Apply JWT Template:**
   - Vào **API Keys**
   - Tìm phần **Advanced**
   - Chọn **JWT Template**: `default` (template vừa tạo)
   - Click **Save**

### Bước 2: Cấu hình Domains & URLs

1. **Development URLs:**
   
   Vào **Paths** trong dashboard:
   ```
   Sign-in URL: /sign-in
   Sign-up URL: /sign-up
   After sign-in URL: /
   After sign-up URL: /auth-callback
   ```

2. **Allowed Origins (CORS):**
   
   Vào **Settings** → **Allowed origins**:
   ```
   Development:
   - http://localhost:3000
   - http://localhost:5000
   - http://127.0.0.1:3000
   ```

3. **Webhook URLs (Tùy chọn):**
   
   Nếu cần sync user data:
   ```
   Endpoint: https://yourdomain.com/api/webhooks/clerk
   Events: user.created, user.updated
   ```

### Bước 3: Cấu hình Email & Branding

1. **Email Templates:**
   - Sidebar → **Email, SMS & Phone**
   - Customize email templates cho:
     - Verification email
     - Password reset
     - Welcome email

2. **Branding:**
   - Sidebar → **Customization**
   - Upload logo của bạn
   - Chọn theme colors
   - Customize layout

---

## 📌 PHẦN 3: GIẢI QUYẾT VẤN ĐỀ TOKEN EXPIRY

### Vấn đề: Token chỉ live 60 giây

**Nguyên nhân:**
1. JWT Template không được cấu hình đúng
2. Token lifetime mặc định = 60 giây
3. Không có cơ chế refresh token tự động

### ✅ Giải pháp 1: Tăng Token Lifetime (Đã làm ở Phần 2)

Xem lại **Phần 2 → Bước 1 → Bước 4** để cấu hình lại.

### ✅ Giải pháp 2: Implement Token Refresh (Project của bạn đã có!)

Dự án của bạn đã implement sẵn cơ chế refresh token tự động trong file:

**`frontend/src/lib/axios.ts`** - Response Interceptor:
```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu gặp 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Lấy token mới từ Clerk
      if (getTokenCallback) {
        const newToken = await getTokenCallback();
        
        if (newToken) {
          // Cập nhật token mới vào axios headers
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          
          // Retry request với token mới
          return axiosInstance(originalRequest);
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Cách hoạt động:**
1. Khi API trả về lỗi 401 (Unauthorized)
2. Interceptor tự động gọi `getToken()` từ Clerk
3. Clerk SDK tự động refresh token (sử dụng session token)
4. Token mới được set vào headers
5. Request được retry với token mới

### ✅ Giải pháp 3: Proactive Token Refresh

Thêm cơ chế refresh token trước khi hết hạn:

**Tạo file mới:** `frontend/src/hooks/useTokenRefresh.ts`

```typescript
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { axiosInstance } from '@/lib/axios';

export const useTokenRefresh = () => {
  const { getToken } = useAuth();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Refresh token mỗi 50 phút (trước khi hết hạn 60 phút)
    const refreshToken = async () => {
      try {
        const token = await getToken({ template: 'default' });
        if (token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('✅ Token refreshed proactively');
        }
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
      }
    };

    // Refresh ngay lập tức khi mount
    refreshToken();

    // Refresh mỗi 50 phút
    refreshIntervalRef.current = setInterval(refreshToken, 50 * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [getToken]);
};
```

**Sử dụng trong** `frontend/src/providers/AuthProvider.tsx`:

```typescript
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ... existing code ...
  
  // Thêm dòng này
  useTokenRefresh();
  
  // ... rest of code ...
};
```

### ✅ Giải pháp 4: Cấu hình getToken() đúng cách

Khi gọi `getToken()`, luôn truyền `template` name:

```typescript
// ❌ SAI - sử dụng template mặc định (60s)
const token = await getToken();

// ✅ ĐÚNG - sử dụng custom template
const token = await getToken({ template: 'default' });
```

**Update file** `frontend/src/providers/AuthProvider.tsx`:

```typescript
const initAuth = async () => {
  try {
    // Thêm { template: 'default' }
    const token = await getToken({ template: 'default' });
    updateApiToken(token);
    // ... rest
  } catch (error) {
    // ...
  }
};
```

### ⚙️ Cấu hình Backend Token Verification

File `backend/src/index.js` đã có:

```javascript
app.use(clerkMiddleware());
```

Để verify token chính xác, cấu hình thêm:

```javascript
import { clerkMiddleware } from "@clerk/express";

app.use(
  clerkMiddleware({
    // Tự động verify JWT token trong Authorization header
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    
    // Cho phép unauthenticated requests (middleware không block)
    // Chỉ verify nếu có token
    authorizedParties: undefined,
  })
);
```

---

## 📌 PHẦN 4: TỐI ƯU HÓA PRODUCTION

### Bước 1: Chuyển sang Production Keys

Khi deploy lên production:

1. **Tạo Production Instance:**
   - Dashboard → Top menu → Switch to **Production**
   - Copy **Production API Keys**

2. **Update .env cho Production:**
   ```bash
   # Production keys (bắt đầu với pk_live và sk_live)
   CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Cấu hình Production Domains:**
   - **Allowed origins:**
     ```
     https://yourdomain.com
     https://www.yourdomain.com
     ```
   
   - **After sign-in URL:**
     ```
     https://yourdomain.com/auth-callback
     ```

### Bước 2: Google OAuth Production Setup

Development: Clerk tự xử lý
Production: Cần tạo OAuth app riêng

1. **Tạo Google OAuth App:**
   - Vào https://console.cloud.google.com
   - **APIs & Services** → **Credentials**
   - **Create Credentials** → **OAuth 2.0 Client ID**
   
   ```
   Application type: Web application
   Name: Spotify Clone
   
   Authorized JavaScript origins:
   - https://yourdomain.com
   
   Authorized redirect URIs:
   - https://accounts.clerk.dev/v1/oauth_callback
   ```

2. **Copy Client ID và Secret:**
   - Lưu lại `Client ID` và `Client Secret`

3. **Cấu hình trong Clerk:**
   - Dashboard → **SSO Connections** → **Google**
   - Enable **Custom credentials**
   - Paste `Client ID` và `Client Secret`
   - Click **Save**

### Bước 3: Rate Limiting & Security

1. **Implement Rate Limiting:**

Tạo file `backend/src/middleware/rateLimit.js`:

```javascript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests/15 phút
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Tối đa 5 login attempts/15 phút
  message: 'Too many login attempts, please try again later.',
});
```

**Install package:**
```bash
cd backend
npm install express-rate-limit
```

**Apply trong** `backend/src/index.js`:

```javascript
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

2. **Security Headers:**

```bash
cd backend
npm install helmet
```

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: false, // Tắt CSP nếu gặp vấn đề với assets
}));
```

### Bước 4: Monitoring & Logging

1. **Clerk Dashboard:**
   - **Users** → Xem users đã đăng ký
   - **Sessions** → Monitor active sessions
   - **Events** → Track authentication events

2. **Backend Logging:**

```javascript
// backend/src/middleware/logger.js
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

Apply:
```javascript
app.use(requestLogger);
```

### Bước 5: Error Handling

**Update** `backend/src/index.js` error handler:

```javascript
app.use((err, req, res, next) => {
  // Log error
  console.error('Error:', err);
  
  // Clerk authentication errors
  if (err.message?.includes('Clerk')) {
    return res.status(401).json({ 
      message: 'Authentication failed', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
  
  // General errors
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

---

## 🧪 TESTING & VERIFICATION

### Test 1: Kiểm tra Token Lifetime

```javascript
// Thêm vào frontend/src/providers/AuthProvider.tsx để debug
useEffect(() => {
  const testToken = async () => {
    const token = await getToken({ template: 'default' });
    
    if (token) {
      // Decode JWT để xem expiry time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      const minutesUntilExpiry = (expiryDate - now) / 1000 / 60;
      
      console.log('🔍 Token Debug:');
      console.log('Expires at:', expiryDate.toLocaleString());
      console.log('Minutes until expiry:', minutesUntilExpiry.toFixed(2));
    }
  };
  
  testToken();
}, [getToken]);
```

Nếu cấu hình đúng, bạn sẽ thấy:
```
🔍 Token Debug:
Expires at: [thời gian sau 1 giờ]
Minutes until expiry: 60.00
```

### Test 2: Test Token Refresh

1. Đăng nhập vào app
2. Mở DevTools → Console
3. Đợi 61 giây (nếu token lifetime = 60s)
4. Thực hiện action gọi API
5. Xem console log:
   ```
   🔄 [Axios] Token expired, refreshing...
   ✅ [Axios] Token refreshed successfully
   ```

### Test 3: Test Multi-device

1. Đăng nhập trên Chrome
2. Đăng nhập cùng account trên Firefox
3. Cả 2 trình duyệt phải hoạt động bình thường

---

## 🚨 TROUBLESHOOTING

### Lỗi 1: "Missing Clerk Publishable Key"

**Nguyên nhân:** Không có VITE_CLERK_PUBLISHABLE_KEY trong `.env`

**Giải pháp:**
```bash
# frontend/.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

Restart dev server:
```bash
npm run dev
```

### Lỗi 2: Token vẫn expire sau 60 giây

**Checklist:**
- ✅ Đã tạo JWT Template?
- ✅ Đã set Token Lifetime = 3600?
- ✅ Đã apply template trong API Keys?
- ✅ Có gọi `getToken({ template: 'default' })`?

**Debug:**
```javascript
// Check token expiry
const token = await getToken({ template: 'default' });
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires in seconds:', payload.exp - Math.floor(Date.now() / 1000));
```

Nếu kết quả < 3600, JWT template chưa apply đúng.

### Lỗi 3: CORS errors

**Giải pháp:**
1. Check **Allowed origins** trong Clerk Dashboard
2. Update backend CORS:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:3000', 'https://yourdomain.com'],
     credentials: true,
   }));
   ```

### Lỗi 4: 401 Unauthorized liên tục

**Debug steps:**

1. Check token trong browser:
   ```javascript
   // DevTools Console
   localStorage.getItem('__clerk_session_token')
   ```

2. Check Authorization header:
   ```javascript
   console.log(axiosInstance.defaults.headers.common['Authorization']);
   ```

3. Check backend middleware order:
   ```javascript
   // Đúng:
   app.use(express.json());
   app.use(clerkMiddleware());
   app.use('/api/users', userRoutes);
   ```

### Lỗi 5: "Invalid token signature"

**Nguyên nhân:** Mismatch giữa frontend và backend keys

**Giải pháp:**
- Đảm bảo frontend và backend dùng cùng `CLERK_PUBLISHABLE_KEY`
- Check không nhầm lẫn giữa test/production keys

---

## 📚 TÀI LIỆU THAM KHẢO

- **Clerk Documentation:** https://clerk.com/docs
- **JWT Template Guide:** https://clerk.com/docs/backend-requests/making/jwt-templates
- **React SDK:** https://clerk.com/docs/references/react/overview
- **Express SDK:** https://clerk.com/docs/references/backend/overview

---

## ✅ CHECKLIST HOÀN THÀNH

Đánh dấu ✅ khi hoàn thành:

### Cơ bản:
- [ ] Tạo tài khoản Clerk
- [ ] Tạo Application
- [ ] Copy API Keys
- [ ] Tạo file .env (frontend + backend)
- [ ] Test đăng nhập thành công

### Nâng cao:
- [ ] Tạo JWT Template với lifetime >= 3600s
- [ ] Apply JWT Template vào API Keys
- [ ] Cấu hình Session settings
- [ ] Cấu hình Allowed Origins
- [ ] Test token không expire sau 60s

### Production:
- [ ] Chuyển sang Production keys
- [ ] Setup Google OAuth production
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Setup monitoring

---

## 🎯 KẾT LUẬN

Sau khi hoàn thành hướng dẫn này:

✅ Token sẽ live ít nhất 1 giờ (hoặc custom lifetime của bạn)
✅ Token tự động refresh khi hết hạn
✅ Không bị logout giữa chừng
✅ Multi-device login hoạt động tốt
✅ Production-ready với security tốt

**Nếu gặp vấn đề gì, hãy:**
1. Check lại từng bước trong Checklist
2. Xem phần Troubleshooting
3. Check Console logs (cả frontend và backend)
4. Verify JWT token lifetime bằng debug code

Chúc bạn setup thành công! 🚀

