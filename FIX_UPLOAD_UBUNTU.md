# 🐛 Fix Lỗi Upload Khi Deploy Lên Ubuntu

## 📋 Tổng Quan

Document này mô tả các lỗi nghiêm trọng được phát hiện trong phần upload khi deploy lên Ubuntu và cách khắc phục.

**Ngày fix:** 2025-10-30
**Files đã sửa:**
- `backend/src/index.js` - Fix __dirname và cron job cleanup
- `setup-upload-permissions.sh` - Script mới cho permissions

---

## ❌ LỖI #1: __dirname Không Đúng Trong ES Modules (CRITICAL)

### 🔍 Vấn Đề

**File:** `backend/src/index.js:25`

```javascript
// ❌ SAI - path.resolve() trả về CWD, KHÔNG phải file directory
const __dirname = path.resolve();
```

**Nguyên nhân:**
- Project dùng ES Modules (`"type": "module"` trong package.json)
- Trong ES modules, `__dirname` KHÔNG TỒN TẠI tự động như CommonJS
- `path.resolve()` trả về **current working directory** (CWD), không phải directory của file

**Hậu quả trên Ubuntu:**

1. **Tmp folder path SAI:**
   ```javascript
   const tmpDir = path.join(__dirname, "tmp"); // Sai!
   ```
   - Khi chạy: `node src/index.js` từ `/var/www/niemadidaphat/backend`
   - Expected: `/var/www/niemadidaphat/backend/src/tmp`
   - Actual: `/var/www/niemadidaphat/backend/tmp` ❌
   - express-fileupload tạo temp files ở path sai

2. **Frontend dist path SAI:**
   ```javascript
   app.use(express.static(path.join(__dirname, "../frontend/dist")));
   ```
   - Expected: `/var/www/niemadidaphat/backend/src/../frontend/dist`
   - Actual: `/var/www/niemadidaphat/backend/../frontend/dist` ❌

### ✅ Giải Pháp

```javascript
// ✅ ĐÚNG - Cách lấy __dirname trong ES modules
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// → __dirname = "/var/www/niemadidaphat/backend/src" ✅
```

**Đã fix trong:** `backend/src/index.js:27-29`

---

## ❌ LỖI #2: Race Condition với Cron Job Cleanup (CRITICAL)

### 🔍 Vấn Đề

**File:** `backend/src/index.js:67-84` (trước khi fix)

```javascript
// ❌ SAI - Xóa TẤT CẢ files mỗi giờ
cron.schedule("0 * * * *", () => {
    fs.readdir(tmpDir, (err, files) => {
        for (const file of files) {
            fs.unlink(path.join(tmpDir, file)); // Xóa hết!
        }
    });
});
```

**Nguyên nhân:**
- Cron job chạy **mỗi giờ** (0 * * * *)
- Xóa **TẤT CẢ** temp files không phân biệt tuổi
- Upload file lớn (500MB) có thể mất 3-5 phút

**Scenario xảy ra lỗi:**

```
09:58:00 - User bắt đầu upload file 400MB
09:58:30 - express-fileupload tạo file: tmp/upload_abc123.mp3
09:59:00 - File đang được upload lên Cloudinary...
10:00:00 - ⚠️ CRON JOB CHẠY → XÓA tmp/upload_abc123.mp3
10:00:01 - ❌ Cloudinary upload FAILED: File not found
```

**Triệu chứng:**
```
Error: ENOENT: no such file or directory, open '/var/www/.../tmp/upload_xyz.mp3'
Failed to upload audio.mp3 after 3 attempts: ENOENT: no such file or directory
```

### ✅ Giải Pháp

```javascript
// ✅ ĐÚNG - Chỉ xóa files cũ hơn 1 giờ
cron.schedule("0 * * * *", () => {
    const now = Date.now();
    const MAX_AGE = 60 * 60 * 1000; // 1 giờ

    for (const file of files) {
        const filePath = path.join(tmpDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        // Chỉ xóa nếu file cũ hơn 1 giờ
        if (fileAge > MAX_AGE) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted old temp file: ${file}`);
        }
    }
});
```

**Logic:**
- Check modification time (`stats.mtimeMs`) của mỗi file
- Chỉ xóa nếu file cũ hơn MAX_AGE (1 giờ)
- Files đang upload (< 1 giờ) được giữ lại ✅

**Đã fix trong:** `backend/src/index.js:70-111`

---

## ⚠️ LỖI #3: Permission Issues Trên Ubuntu (MEDIUM)

### 🔍 Vấn Đề

**Triệu chứng trên Ubuntu:**
```bash
Error: EACCES: permission denied, mkdir '/var/www/niemadidaphat/backend/src/tmp'
Error: EACCES: permission denied, open '/var/www/niemadidaphat/backend/src/tmp/upload_xyz.mp3'
```

**Nguyên nhân:**

1. **User mismatch:**
   - Backend chạy bởi user `pm2user` hoặc `www-data`
   - Folder `/var/www/niemadidaphat/backend` owned by `root` hoặc user khác
   - Không có quyền write vào folder

2. **Folder không tồn tại:**
   - Lần đầu deploy, folder `src/tmp` chưa được tạo
   - Code cố tạo nhưng không có permission

3. **Chmod không đủ:**
   ```javascript
   fs.mkdirSync(tmpDir, { recursive: true, mode: 0o777 });
   ```
   - Mode 777 có thể bị block bởi umask của system
   - Trên Ubuntu, umask mặc định là 022 → actual permission = 755

### ✅ Giải Pháp

**Tạo script setup permissions:**

```bash
#!/bin/bash
# File: setup-upload-permissions.sh

BACKEND_PATH="/var/www/niemadidaphat/backend"
TMP_DIR="$BACKEND_PATH/src/tmp"
BACKEND_USER="pm2user" # Hoặc user chạy backend

# Tạo tmp folder
mkdir -p "$TMP_DIR"

# Set owner
chown -R "${BACKEND_USER}:${BACKEND_USER}" "$TMP_DIR"

# Set permissions (rwxrwxr-x)
chmod 775 "$TMP_DIR"
```

**Chạy sau khi deploy:**
```bash
sudo bash setup-upload-permissions.sh
```

**File:** `setup-upload-permissions.sh` (mới tạo)

---

## 📊 So Sánh Trước/Sau Fix

| Vấn đề | Trước Fix ❌ | Sau Fix ✅ |
|--------|-------------|-----------|
| **__dirname path** | `/var/www/backend` (CWD) | `/var/www/backend/src` (correct) |
| **Tmp folder** | `/var/www/backend/tmp` (sai) | `/var/www/backend/src/tmp` (đúng) |
| **Cron cleanup** | Xóa TẤT CẢ files mỗi giờ | Chỉ xóa files > 1 giờ |
| **Race condition** | Upload bị ngắt giữa chừng | Upload an toàn |
| **Permissions** | Manual setup, hay lỗi | Script tự động setup |

---

## 🚀 Hướng Dẫn Deploy Lên Ubuntu (Cập Nhật)

### Bước 1: Pull code mới (đã có fixes)

```bash
cd /var/www/niemadidaphat/backend
git pull origin main
```

### Bước 2: Setup permissions

```bash
# Copy script lên server (nếu chưa có)
sudo bash setup-upload-permissions.sh

# Hoặc manual:
sudo mkdir -p /var/www/niemadidaphat/backend/src/tmp
sudo chown -R $USER:$USER /var/www/niemadidaphat/backend/src/tmp
sudo chmod 775 /var/www/niemadidaphat/backend/src/tmp
```

### Bước 3: Kiểm tra Nginx config

```bash
# Đảm bảo có config này
sudo grep "client_max_body_size" /etc/nginx/sites-available/spotify

# Phải thấy:
# client_max_body_size 550M;
```

Nếu chưa có, chạy:
```bash
sudo bash fix-nginx-upload-limit.sh
```

### Bước 4: Restart backend

```bash
# Nếu dùng PM2
pm2 restart backend

# Hoặc systemd
sudo systemctl restart backend
```

### Bước 5: Test upload

```bash
# Test upload nhỏ (1MB)
curl -X POST http://localhost:5000/api/admin/songs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audioFile=@test.mp3" \
  -F "imageFile=@test.jpg" \
  -F "title=Test Song" \
  -F "artist=Test Artist" \
  -F "duration=180"
```

### Bước 6: Monitor logs

```bash
# Backend logs
pm2 logs backend

# Nginx logs
sudo tail -f /var/log/nginx/spotify-error.log

# System logs
sudo journalctl -u backend -f
```

---

## 🧪 Test Cases Để Verify Fix

### Test 1: __dirname path đúng
```bash
# Chạy backend và check console log khi tạo tmp folder
pm2 logs backend | grep "tmp"

# Expected output:
# Tmp directory created at: /var/www/niemadidaphat/backend/src/tmp ✅
```

### Test 2: Cron job không xóa files đang upload
```bash
# 1. Upload file lớn (100MB+)
# 2. Đợi cron job chạy (top of the hour)
# 3. Check logs

# Expected output:
# 🔍 Checking 1 temp files for cleanup...
# ✓ No old temp files to clean up (file mới, không xóa) ✅
```

### Test 3: Upload file lớn thành công
```bash
# Upload file 500MB
curl -X POST https://yourdomain.com/api/admin/songs \
  -F "audioFile=@large-audio-500mb.mp3" \
  -F "imageFile=@cover.jpg" \
  -F "title=Large Song" \
  -F "artist=Test" \
  -F "duration=1800"

# Expected: 201 Created ✅
```

### Test 4: Permissions OK
```bash
# Check tmp folder permissions
ls -la /var/www/niemadidaphat/backend/src/

# Expected output:
# drwxrwxr-x 2 pm2user pm2user 4096 Oct 30 10:00 tmp ✅
```

---

## 🐛 Troubleshooting

### Lỗi: "EACCES: permission denied"
```bash
# Kiểm tra owner
ls -la /var/www/niemadidaphat/backend/src/tmp

# Fix:
sudo chown -R $USER:$USER /var/www/niemadidaphat/backend/src/tmp
sudo chmod 775 /var/www/niemadidaphat/backend/src/tmp
```

### Lỗi: "ENOENT: no such file or directory" (tmp folder)
```bash
# Tạo lại folder
mkdir -p /var/www/niemadidaphat/backend/src/tmp
sudo chown $USER:$USER /var/www/niemadidaphat/backend/src/tmp
```

### Lỗi: "Failed to upload after 3 attempts"
```bash
# Check Cloudinary credentials
cat /var/www/niemadidaphat/backend/.env | grep CLOUDINARY

# Check network
curl https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload

# Check logs
pm2 logs backend --lines 100
```

### Upload bị ngắt giữa chừng
```bash
# Check disk space
df -h

# Check if cron job đang xóa files
sudo tail -f /var/log/syslog | grep cron

# Verify fix đã apply:
cat /var/www/niemadidaphat/backend/src/index.js | grep -A 10 "MAX_AGE"
# Phải thấy logic check fileAge
```

---

## 📝 Notes Quan Trọng

### ES Modules vs CommonJS

```javascript
// CommonJS (CJS) - __dirname có sẵn
const __dirname = __dirname; // Có sẵn ✅

// ES Modules (ESM) - phải tự tạo
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url)); // Phải làm thủ công
```

Project này dùng ESM (`"type": "module"`), nên PHẢI dùng cách thứ 2.

### Cron Job Best Practices

```javascript
// ❌ SAI - Xóa hết
fs.unlinkSync(file);

// ✅ ĐÚNG - Check age trước
if (now - stats.mtimeMs > MAX_AGE) {
    fs.unlinkSync(file);
}
```

Luôn check file age trước khi xóa để tránh xóa files đang được sử dụng.

### Permissions Trên Linux

```bash
# Chmod meanings:
# 7 = rwx (read, write, execute)
# 5 = r-x (read, execute)

# 775 = rwxrwxr-x
# Owner: rwx (read/write/execute)
# Group: rwx (read/write/execute)
# Others: r-x (read/execute only)
```

Folder cần **execute permission** (x) để có thể cd vào.

---

## 🔗 Files Liên Quan

- **backend/src/index.js** - Main fixes cho __dirname và cron job
- **setup-upload-permissions.sh** - Script setup permissions
- **fix-nginx-upload-limit.sh** - Script fix Nginx 413 error
- **FIX_UPLOAD_413_ERROR.md** - Docs về Nginx upload limits
- **HUONG_DAN_UPLOAD_UBUNTU.md** - Hướng dẫn deploy lên Ubuntu

---

## ✅ Checklist Sau Khi Deploy

- [ ] Pull code mới có fixes
- [ ] Chạy `setup-upload-permissions.sh`
- [ ] Verify tmp folder: `ls -la /var/www/.../backend/src/tmp`
- [ ] Restart backend: `pm2 restart backend`
- [ ] Test upload file nhỏ (1-10MB)
- [ ] Test upload file lớn (100-500MB)
- [ ] Monitor logs trong 1 giờ đầu
- [ ] Test upload khi cron job chạy (top of the hour)
- [ ] Verify không có lỗi EACCES hoặc ENOENT

---

**Tác giả:** Claude Code
**Ngày:** 2025-10-30
**Version:** 1.0

Nếu gặp vấn đề, kiểm tra logs:
```bash
pm2 logs backend
sudo tail -f /var/log/nginx/spotify-error.log
```
