# Clerk API Update - req.auth() Function

## Thay doi

Clerk da update API tu version moi:
- **Cu (deprecated):** `req.auth.userId`
- **Moi:** `await req.auth()` - tra ve object voi userId

## Cac file da cap nhat

### 1. backend/src/middleware/auth.middleware.js

**Truoc:**
```javascript
export const protectRoute = async (req, res, next) => {
    if (!req.auth.userId) {  // Deprecated
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
```

**Sau:**
```javascript
export const protectRoute = async (req, res, next) => {
    const { userId } = await req.auth();  // Moi
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
```

---

### 2. backend/src/controller/user.controller.js

**Truoc:**
```javascript
export const getAllUsers = async (req, res, next) => {
    const currentUserId = req.auth.userId;  // Deprecated
    // ...
};

export const getMessages = async (req, res, next) => {
    const myId = req.auth.userId;  // Deprecated
    // ...
};
```

**Sau:**
```javascript
export const getAllUsers = async (req, res, next) => {
    const { userId: currentUserId } = await req.auth();  // Moi
    // ...
};

export const getMessages = async (req, res, next) => {
    const { userId: myId } = await req.auth();  // Moi
    // ...
};
```

---

## Cach su dung moi

### Co ban:
```javascript
// Lay userId
const { userId } = await req.auth();

// Lay tat ca thong tin
const auth = await req.auth();
console.log(auth.userId);
console.log(auth.sessionId);
```

### Voi destructuring:
```javascript
// Dat ten khac
const { userId: myId } = await req.auth();

// Lay nhieu field
const { userId, sessionId } = await req.auth();
```

---

## Kiem tra version Clerk

Trong `backend/package.json`:
```json
{
  "dependencies": {
    "@clerk/express": "^1.3.4"
  }
}
```

Version >= 1.3.0 can dung `req.auth()` thay vi `req.auth`.

---

## Migration Guide

Neu ban co middleware/controller tu viet:

### Tim tat ca req.auth:
```bash
grep -r "req\.auth\." backend/src/
```

### Thay the:
1. `req.auth.userId` → `const { userId } = await req.auth()`
2. Them `await` vi `req.auth()` la async function
3. Kiem tra function phai la `async`

### Vi du:
```javascript
// SAI - Thieu await
export const myController = (req, res) => {
    const { userId } = req.auth();  // Error!
};

// DUNG - Co await va async
export const myController = async (req, res) => {
    const { userId } = await req.auth();  // OK!
};
```

---

## Breaking Changes

**Luu y quan trong:**
- `req.auth()` la **async function** - PHAI dung `await`
- Function chua no PHAI la `async`
- Khong the dung trong synchronous code

---

## Rollback (neu can)

Neu gap van de, rollback ve version cu:

```bash
cd backend
npm install @clerk/express@1.2.0
```

Nhung khuyen dung version moi de tranh deprecation.

---

## Testing

Sau khi cap nhat, test cac API:
- Login
- Protected routes
- Admin routes
- Chat/Messages

Tat ca nen hoat dong binh thuong.

---

Da cap nhat thanh cong! Khong con deprecation warning.

