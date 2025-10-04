# 🔧 Khắc phục lỗi: no pg_hba.conf entry

## ❌ Lỗi gặp phải:
```
no pg_hba.conf entry for host "163.223.211.78", user "niemadidaphat_user", 
database "niemadidaphat", no encryption
```

## 🎯 Nguyên nhân:
PostgreSQL không cho phép kết nối từ địa chỉ IP này hoặc yêu cầu mã hóa SSL.

---

## ✅ Giải pháp 1: Sử dụng localhost (Khuyến nghị)

Nếu backend và PostgreSQL chạy trên **cùng server**, dùng `localhost`:

### Bước 1: Kiểm tra file .env
```bash
cd /var/www/niemadidaphat/server
nano .env
```

### Bước 2: Đảm bảo DB_HOST là localhost
```env
# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=niemadidaphat
DB_USER=niemadidaphat_user
DB_PASSWORD=your_secure_password_here
```

### Bước 3: Cấu hình pg_hba.conf
```bash
# Tìm file pg_hba.conf (PostgreSQL 14/15/16)
sudo find /etc/postgresql -name pg_hba.conf

# Edit file (thay 16 bằng version của bạn)
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

### Bước 4: Thêm các dòng sau (nếu chưa có)
```conf
# TYPE  DATABASE        USER                    ADDRESS         METHOD
# IPv4 local connections:
host    niemadidaphat   niemadidaphat_user      127.0.0.1/32    md5
# IPv6 local connections:
host    niemadidaphat   niemadidaphat_user      ::1/128         md5
```

### Bước 5: Restart PostgreSQL
```bash
sudo systemctl restart postgresql
```

### Bước 6: Test kết nối
```bash
# Test từ terminal
psql -h localhost -U niemadidaphat_user -d niemadidaphat -W

# Test từ backend
cd /var/www/niemadidaphat/server
node -e "import('./src/config/database.js').then(db => db.default.query('SELECT NOW()')).then(console.log).catch(console.error)"
```

### Bước 7: Restart backend
```bash
pm2 restart niemadidaphat-backend
pm2 logs niemadidaphat-backend
```

---

## ✅ Giải pháp 2: Cho phép Remote Connection (Nếu backend khác server)

Nếu backend chạy trên server khác với PostgreSQL:

### Bước 1: Cấu hình PostgreSQL cho remote connection
```bash
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Tìm và thay đổi:
```conf
# Cho phép lắng nghe trên tất cả interfaces
listen_addresses = '*'
```

### Bước 2: Cấu hình pg_hba.conf với SSL
```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Thêm dòng này (thay `163.223.211.78` bằng IP backend của bạn):
```conf
# TYPE  DATABASE        USER                    ADDRESS                 METHOD
# Remote connection từ backend server (YÊU CẦU SSL)
hostssl niemadidaphat   niemadidaphat_user      163.223.211.78/32       md5
```

**Lưu ý:** Sử dụng `hostssl` thay vì `host` để yêu cầu kết nối mã hóa.

### Bước 3: Enable SSL trong PostgreSQL
```bash
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Thêm/uncomment:
```conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
```

### Bước 4: Restart PostgreSQL
```bash
sudo systemctl restart postgresql
```

### Bước 5: Update backend database config
```bash
cd /var/www/niemadidaphat/server
nano src/config/database.js
```

Thêm SSL config:
```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'niemadidaphat',
  user: process.env.DB_USER || 'niemadidaphat_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Thêm SSL config
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});
```

### Bước 6: Update .env
```bash
nano /var/www/niemadidaphat/server/.env
```

Thêm:
```env
DB_HOST=your_postgresql_server_ip
DB_SSL=true
```

### Bước 7: Cấu hình Firewall
```bash
# Cho phép backend IP kết nối đến PostgreSQL
sudo ufw allow from 163.223.211.78 to any port 5432
```

### Bước 8: Restart backend
```bash
pm2 restart niemadidaphat-backend
pm2 logs niemadidaphat-backend
```

---

## 🔍 Debug và Kiểm tra

### 1. Kiểm tra PostgreSQL đang lắng nghe trên port nào
```bash
sudo netstat -plnt | grep postgres
# Hoặc
sudo ss -tlnp | grep postgres
```

### 2. Kiểm tra pg_hba.conf syntax
```bash
sudo -u postgres /usr/lib/postgresql/16/bin/pg_ctl reload -D /etc/postgresql/16/main
```

### 3. Xem PostgreSQL logs
```bash
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### 4. Test connection từ backend server
```bash
# Từ backend server
psql -h your_db_host -U niemadidaphat_user -d niemadidaphat -W
```

### 5. Kiểm tra backend logs
```bash
pm2 logs niemadidaphat-backend --lines 100
```

---

## 🎯 Khuyến nghị Security

1. **Sử dụng localhost** nếu backend và PostgreSQL cùng server
2. **Bắt buộc SSL** nếu remote connection: dùng `hostssl` thay vì `host`
3. **Giới hạn IP**: Chỉ cho phép specific IPs trong pg_hba.conf
4. **Strong password**: Dùng password mạnh cho database user
5. **Firewall**: Chỉ mở port 5432 cho trusted IPs

---

## ✅ Checklist

- [ ] Kiểm tra DB_HOST trong `.env` (localhost hay remote IP?)
- [ ] Cấu hình `pg_hba.conf` phù hợp
- [ ] Restart PostgreSQL
- [ ] Enable SSL nếu dùng remote connection
- [ ] Update database.js config (thêm SSL nếu cần)
- [ ] Cấu hình firewall
- [ ] Test connection
- [ ] Restart backend với PM2
- [ ] Kiểm tra logs
- [ ] Test API endpoints

---

## 📞 Troubleshooting thêm

### Lỗi: "password authentication failed"
```bash
# Reset password
sudo -u postgres psql
ALTER USER niemadidaphat_user WITH ENCRYPTED PASSWORD 'new_password';
\q
```

### Lỗi: "could not connect to server"
```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Lỗi: "connection refused"
```bash
# Kiểm tra firewall
sudo ufw status
sudo ufw allow 5432/tcp  # Nếu cần remote connection
```

### Lỗi: "SSL off"
```bash
# Enable SSL
sudo nano /etc/postgresql/16/main/postgresql.conf
# ssl = on
sudo systemctl restart postgresql
```

