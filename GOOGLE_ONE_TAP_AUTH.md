# 🔐 Google One-Tap Authentication

## Tổng quan

Project sử dụng **Google One-Tap** làm phương thức authentication duy nhất.

- ✅ **Không cần email/password**
- ✅ **Không cần form đăng ký**
- ✅ **Đơn giản, nhanh, an toàn**
- ✅ **JWT session management**

---

## 🏗️ Architecture

```
User clicks "Sign in with Google"
    ↓
Google One-Tap popup
    ↓
User chọn tài khoản Google
    ↓
Google returns credential (JWT)
    ↓
Frontend gửi credential → Backend /api/auth/google
    ↓
Backend verify Google token
    ↓
Backend tạo/update user trong database
    ↓
Backend returns JWT token
    ↓
Frontend lưu token → Authenticated
```

---

## 📋 Database Schema

### user_profiles table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  google_id VARCHAR(255),  -- 👈 Google user ID
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_google_id ON user_profiles(google_id);
```

### Migration
```bash
psql -U niemadidaphat_user -d niemadidaphat -f migrations/add_google_id_column.sql
```

---

## 🔧 Backend Setup

### Environment Variables
```env
# Backend .env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
JWT_SECRET=your_random_32_character_secret_key
JWT_EXPIRES_IN=7d
```

### Dependencies
```json
{
  "google-auth-library": "^9.0.0",
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.6",
  "pg": "^8.11.3"
}
```

### API Endpoints

#### POST /api/auth/google
Authenticate với Google credential

**Request:**
```json
{
  "credential": "eyJhbGc..."  // Google JWT token
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "role": "user"
    },
    "token": "eyJhbGc..."  // Your JWT token
  }
}
```

#### POST /api/auth/logout
Đăng xuất

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
Lấy thông tin user hiện tại (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "role": "user"
  }
}
```

#### PUT /api/auth/profile
Cập nhật profile (requires auth)

**Request:**
```json
{
  "full_name": "New Name",
  "avatar_url": "https://..."
}
```

---

## 🎨 Frontend Integration

### 1. Setup Google One-Tap

`src/components/GoogleOneTap.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/apiConfig';

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleOneTap() {
  useEffect(() => {
    // Load Google script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'outline', 
            size: 'large',
            text: 'signin_with',
            locale: 'vi'
          }
        );

        // Show One-Tap prompt
        window.google.accounts.id.prompt();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await apiClient.post('/auth/google', {
        credential: response.credential
      });

      const { user, token } = result.data;

      // Store token
      localStorage.setItem('auth_token', token);

      // Reload or redirect
      window.location.href = '/';
    } catch (error) {
      console.error('Login failed:', error);
      alert('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return <div id="google-signin-button"></div>;
}
```

### 2. Auth Service

`src/lib/auth.ts`:
```typescript
import { apiClient } from './apiConfig';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;
    
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      this.token = null;
      localStorage.removeItem('auth_token');
      return null;
    }
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    this.token = null;
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();
```

### 3. API Interceptor (Add Token)

`src/lib/apiConfig.ts`:
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. Protected Page Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user.full_name}</h1>
      <button onClick={() => authService.logout()}>
        Logout
      </button>
    </div>
  );
}
```

---

## ✅ Migration Checklist

### Database
- [ ] Add google_id column: `psql -f migrations/add_google_id_column.sql`
- [ ] Verify indexes created

### Backend
- [ ] Install dependencies: `npm install`
- [ ] Update .env với GOOGLE_CLIENT_ID
- [ ] Test endpoint: `curl -X POST http://localhost:5000/api/auth/google`

### Frontend
- [ ] Update GoogleOneTap component
- [ ] Create auth service
- [ ] Add token interceptor
- [ ] Remove old Supabase auth code
- [ ] Test login flow

---

## 🔒 Security

### Backend validates everything
- ✅ Google token verified với `google-auth-library`
- ✅ JWT signed với secret key
- ✅ HTTP-only cookies (optional)
- ✅ CORS configured
- ✅ Rate limiting

### Frontend
- ✅ Token stored in localStorage
- ✅ Auto-logout on 401
- ✅ Protected routes check authentication

---

## 🧪 Testing

### Test Backend
```bash
# Start server
cd server
npm run dev

# Test health
curl http://localhost:5000/health

# Test auth (need real Google credential)
# Get credential from browser console after Google login
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential":"GOOGLE_CREDENTIAL_HERE"}'
```

### Test Frontend
1. Visit `/login` page
2. Click "Sign in with Google"
3. Choose Google account
4. Verify redirect to homepage
5. Check localStorage for `auth_token`
6. Visit protected page
7. Click logout
8. Verify token removed

---

## 📚 References

- [Google One-Tap Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

## 💡 Tips

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Debug Google Token
```javascript
// In browser console after Google login
google.accounts.id.initialize({
  client_id: 'YOUR_CLIENT_ID',
  callback: (response) => {
    console.log('Google credential:', response.credential);
  }
});
```

### Check Token in Backend
```javascript
// Add to authGoogle.js for debugging
const payload = ticket.getPayload();
console.log('Google user:', {
  id: payload.sub,
  email: payload.email,
  name: payload.name,
  picture: payload.picture
});
```

