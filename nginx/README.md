# Nginx Configuration Files

Các file cấu hình Nginx cho production deployment.

## Files

### 1. `niemadidaphat.com.conf`
Cấu hình cho **Frontend** (Next.js)

**Features:**
- Reverse proxy đến Next.js (port 3000)
- Gzip compression
- Static files caching
- Security headers
- www → non-www redirect

**Domain:** niemadidaphat.com, www.niemadidaphat.com

### 2. `api.niemadidaphat.com.conf`
Cấu hình cho **Backend API** (Node.js/Express)

**Features:**
- Reverse proxy đến Node.js backend (port 5000)
- Large file upload support (100MB)
- Extended timeouts (5 minutes)
- WebSocket support
- Health check endpoint (no logging)
- Security headers

**Domain:** api.niemadidaphat.com

## Installation

### 1. Copy configs to Nginx
```bash
sudo cp niemadidaphat.com.conf /etc/nginx/sites-available/
sudo cp api.niemadidaphat.com.conf /etc/nginx/sites-available/
```

### 2. Enable sites
```bash
sudo ln -s /etc/nginx/sites-available/niemadidaphat.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.niemadidaphat.com /etc/nginx/sites-enabled/
```

### 3. Test configuration
```bash
sudo nginx -t
```

### 4. Reload Nginx
```bash
sudo systemctl reload nginx
```

## SSL Configuration

Sau khi cài đặt configs, chạy Certbot để thêm SSL:

```bash
# Frontend
sudo certbot --nginx -d niemadidaphat.com -d www.niemadidaphat.com

# Backend API
sudo certbot --nginx -d api.niemadidaphat.com
```

Certbot sẽ tự động:
- Thêm SSL certificate
- Cấu hình HTTPS redirect
- Auto-renewal setup

## Customization

### Tăng upload size limit
Trong file config, tìm và sửa:
```nginx
client_max_body_size 100M;  # Thay đổi theo nhu cầu
```

### Điều chỉnh timeouts
```nginx
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
```

### Thêm cache cho API responses
```nginx
location /api/products {
    proxy_pass http://localhost:5000;
    proxy_cache_valid 200 5m;
    add_header Cache-Control "public, max-age=300";
}
```

## Logs Location

### Frontend logs
```bash
/var/log/nginx/niemadidaphat.access.log
/var/log/nginx/niemadidaphat.error.log
```

### Backend API logs
```bash
/var/log/nginx/api.niemadidaphat.access.log
/var/log/nginx/api.niemadidaphat.error.log
```

### View logs
```bash
# Access logs
sudo tail -f /var/log/nginx/niemadidaphat.access.log

# Error logs
sudo tail -f /var/log/nginx/niemadidaphat.error.log

# Backend API access
sudo tail -f /var/log/nginx/api.niemadidaphat.access.log
```

## Troubleshooting

### Test Nginx configuration
```bash
sudo nginx -t
```

### Reload after changes
```bash
sudo systemctl reload nginx
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Check Nginx status
```bash
sudo systemctl status nginx
```

### View error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

## Security Headers

Cả 2 configs đều bao gồm:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Performance Optimization

### Gzip compression
Enabled cho frontend với các file types:
- text/plain
- text/css
- text/xml
- text/javascript
- application/javascript
- application/json
- application/xml+rss

### Static files caching
- `_next/static`: 1 year
- `_next/image`: 60 days
- `/public`: 30 days
- `favicon.ico`: 1 day

## Notes

- Configs được tối ưu cho production
- WebSocket support enabled
- Large file upload support
- Extended timeouts cho upload lớn
- Security headers included
- Logging configured
- Health check endpoint không log (reduce noise)

## Reference

Xem thêm:
- [DEPLOYMENT_UBUNTU.md](../DEPLOYMENT_UBUNTU.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Deployment checklist
