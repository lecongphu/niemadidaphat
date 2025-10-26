# 🔧 Fix Lỗi 413 Request Entity Too Large

## ❌ Vấn đề
Khi upload file lớn (>20MB), bạn gặp lỗi:
```
413 Request Entity Too Large
nginx/1.24.0 (Ubuntu)
```

## 🎯 Nguyên nhân
- Backend đã hỗ trợ upload **500MB**
- Nhưng **Nginx** mặc định chỉ cho phép upload **1MB** (hoặc 20MB nếu đã config)
- Cần tăng giới hạn Nginx lên **550MB**

---

## ✅ Giải pháp

### 🚀 Cách 1: Chạy script tự động (KHUYẾN NGHỊ)

```bash
# Chạy script fix
sudo bash fix-nginx-upload-limit.sh
```

Script này sẽ tự động:
- ✅ Backup config hiện tại
- ✅ Tăng `client_max_body_size` lên 550MB
- ✅ Tăng timeout lên 300s (5 phút)
- ✅ Tắt proxy buffering (tối ưu cho upload lớn)
- ✅ Test và reload Nginx

---

### ⚙️ Cách 2: Fix thủ công

#### Bước 1: Tìm file config Nginx
```bash
# Kiểm tra file nào đang được dùng
sudo nginx -t

# Thường là một trong các file sau:
ls -la /etc/nginx/sites-available/spotify
ls -la /etc/nginx/nginx.conf
```

#### Bước 2: Backup file config
```bash
sudo cp /etc/nginx/sites-available/spotify /etc/nginx/sites-available/spotify.backup
```

#### Bước 3: Sửa file config
```bash
sudo nano /etc/nginx/sites-available/spotify
```

Tìm và sửa các dòng sau:

**A. Tăng giới hạn upload (thêm vào trong block `server {}`)**
```nginx
# Tìm dòng này:
client_max_body_size 20M;

# Sửa thành:
client_max_body_size 550M;
```

**B. Tăng timeout cho API (trong block `location /api {}`)**
```nginx
# Tìm dòng:
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# Sửa thành:
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;

# Thêm dòng này (sau các proxy_*_timeout):
proxy_request_buffering off;
```

#### Bước 4: Test và reload
```bash
# Test cấu hình
sudo nginx -t

# Nếu OK, reload Nginx
sudo systemctl reload nginx

# Hoặc restart nếu reload không work
sudo systemctl restart nginx
```

---

## 📊 Kiểm tra cấu hình

### Xem config hiện tại:
```bash
# Kiểm tra client_max_body_size
sudo grep -r "client_max_body_size" /etc/nginx/

# Kiểm tra timeout
sudo grep -A 10 "location /api" /etc/nginx/sites-available/spotify
```

### Kiểm tra Nginx status:
```bash
# Xem status
sudo systemctl status nginx

# Xem error log
sudo tail -f /var/log/nginx/error.log

# Test upload sau khi fix
curl -X POST http://your-domain.com/api/test \
  -F "file=@large-file.mp3" \
  -v
```

---

## 🎵 Giới hạn sau khi fix

| Loại file | Giới hạn Backend | Giới hạn Nginx | Timeout |
|-----------|------------------|----------------|---------|
| Audio     | 500 MB          | 550 MB         | 300s    |
| Image     | 10 MB           | 550 MB         | 300s    |

---

## 🐛 Troubleshooting

### 1. Vẫn gặp lỗi 413 sau khi fix?

**Kiểm tra config có được áp dụng chưa:**
```bash
# Xem config đang active
sudo nginx -T | grep client_max_body_size

# Nếu vẫn hiển thị 20M, thử restart thay vì reload
sudo systemctl restart nginx
```

**Kiểm tra có file config nào khác override không:**
```bash
# Tìm tất cả file config
find /etc/nginx -name "*.conf" -exec grep -l "client_max_body_size" {} \;

# Xem nginx.conf có giới hạn không
sudo grep "client_max_body_size" /etc/nginx/nginx.conf
```

### 2. Lỗi 504 Gateway Timeout?

Có thể timeout quá ngắn, tăng thêm:
```nginx
# Thêm vào /etc/nginx/nginx.conf trong block http {}
client_body_timeout 300s;
send_timeout 300s;

# Hoặc thêm vào location /api
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;
```

### 3. Nginx không khởi động được?

```bash
# Xem lỗi chi tiết
sudo nginx -t

# Restore backup
sudo cp /etc/nginx/sites-available/spotify.backup /etc/nginx/sites-available/spotify
sudo systemctl restart nginx
```

### 4. Upload chậm hoặc bị treo?

**Kiểm tra disk space:**
```bash
df -h
```

**Kiểm tra temp folder:**
```bash
ls -lh /tmp
# Hoặc folder tmp của app
ls -lh /var/www/niemadidaphat/backend/tmp
```

**Xóa temp files cũ:**
```bash
# Xóa files trong /tmp cũ hơn 1 ngày
find /tmp -type f -mtime +1 -delete
```

---

## 📝 Notes

- **550MB** cao hơn 500MB một chút để có buffer
- **300s** timeout = 5 phút, đủ để upload file 500MB với connection chậm
- `proxy_request_buffering off` giúp stream upload thay vì buffer hết rồi mới gửi
- Nếu bạn muốn giới hạn thấp hơn, sửa cả backend (`backend/src/index.js`) và Nginx

---

## 🔗 Liên quan

- [setup-nginx.sh](./setup-nginx.sh) - Script cài đặt Nginx ban đầu
- [backend/src/index.js](./backend/src/index.js) - Backend file upload config
- [backend/src/controller/admin.controller.js](./backend/src/controller/admin.controller.js) - Upload handler

---

## ✅ Checklist sau khi fix

- [ ] Script chạy thành công hoặc đã sửa thủ công
- [ ] `sudo nginx -t` pass
- [ ] Nginx đã reload/restart
- [ ] `client_max_body_size 550M` trong config
- [ ] Timeout >= 300s trong location /api
- [ ] Test upload file nhỏ (1-10MB) thành công
- [ ] Test upload file lớn (100-500MB) thành công

---

**Cần trợ giúp?** Kiểm tra logs:
```bash
# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Backend log (nếu dùng PM2)
pm2 logs spotify-backend

# System log
sudo journalctl -u nginx -f
```

