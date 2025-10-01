# PostgreSQL Setup trên Ubuntu

## 📋 Hướng dẫn cài đặt PostgreSQL cho NiemADiDaPhat

### Bước 1: Cài đặt PostgreSQL

```bash
# Update package list
sudo apt update

# Cài đặt PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Kiểm tra version
psql --version

# Kiểm tra service đang chạy
sudo systemctl status postgresql
```

### Bước 2: Cấu hình PostgreSQL

```bash
# Switch sang postgres user
sudo -i -u postgres

# Truy cập PostgreSQL shell
psql
```

### Bước 3: Tạo Database và User

```sql
-- Tạo database
CREATE DATABASE niemadidaphat;

-- Tạo user
CREATE USER niemadidaphat_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE niemadidaphat TO niemadidaphat_user;

-- Grant schema privileges
\c niemadidaphat
GRANT ALL ON SCHEMA public TO niemadidaphat_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO niemadidaphat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO niemadidaphat_user;

-- Set default privileges cho tables mới
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO niemadidaphat_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO niemadidaphat_user;

-- Exit
\q
exit
```

### Bước 4: Cho phép Remote Connection (nếu cần)

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Tìm và uncomment/thay đổi:
```
listen_addresses = 'localhost'  # Hoặc '*' cho tất cả interfaces
```

Edit pg_hba.conf:
```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Thêm dòng (cho local connection):
```
# TYPE  DATABASE        USER                    ADDRESS         METHOD
host    niemadidaphat   niemadidaphat_user      127.0.0.1/32    md5
host    niemadidaphat   niemadidaphat_user      ::1/128         md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Bước 5: Test Connection

```bash
# Test từ local
psql -h localhost -U niemadidaphat_user -d niemadidaphat -W
```

### Bước 6: Import Database Schema

```bash
# Import từ file SQL
psql -h localhost -U niemadidaphat_user -d niemadidaphat -f complete_database_schema.sql
```

---

## 🔐 Environment Variables

Thêm vào `server/.env`:

```env
# PostgreSQL Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=niemadidaphat
DB_USER=niemadidaphat_user
DB_PASSWORD=your_secure_password_here

# JWT Secret (generate mới)
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d
```

---

## 🛠️ Useful Commands

```bash
# Start/Stop/Restart PostgreSQL
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql

# Check status
sudo systemctl status postgresql

# View logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Backup database
pg_dump -h localhost -U niemadidaphat_user niemadidaphat > backup_$(date +%Y%m%d).sql

# Restore database
psql -h localhost -U niemadidaphat_user niemadidaphat < backup_20250101.sql

# List databases
sudo -u postgres psql -c "\l"

# List users
sudo -u postgres psql -c "\du"
```

---

## 📊 Performance Tuning (Optional)

Edit `/etc/postgresql/16/main/postgresql.conf`:

```conf
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB

# Connections
max_connections = 100

# Logging
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'all'  # Chỉ dùng khi debug
```

Restart sau khi thay đổi:
```bash
sudo systemctl restart postgresql
```

---

## 🔒 Security Best Practices

1. **Strong password** cho database user
2. **Firewall rules** - chỉ cho phép kết nối từ localhost hoặc specific IPs
3. **Regular backups** - setup cron job
4. **Update regularly** - `sudo apt update && sudo apt upgrade`
5. **Monitor logs** - check định kỳ

---

## 🚨 Troubleshooting

### Không connect được:
```bash
# Check PostgreSQL đang chạy
sudo systemctl status postgresql

# Check port
sudo netstat -plnt | grep postgres

# Check logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Permission denied:
```sql
-- Vào psql và grant lại permissions
sudo -u postgres psql
\c niemadidaphat
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO niemadidaphat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO niemadidaphat_user;
```

