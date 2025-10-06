#!/bin/bash

# Script cấu hình Nginx cho Spotify Clone

echo "=================================================="
echo "  🔧 CẤU HÌNH NGINX  "
echo "=================================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Vui lòng chạy script với quyền sudo: sudo bash setup-nginx.sh${NC}"
    exit 1
fi

echo -e "${BLUE}Nhập thông tin cấu hình Nginx:${NC}"
echo ""

read -p "Nhập domain của bạn (vd: spotify.example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "❌ Domain không được để trống!"
    exit 1
fi

read -p "Nhập backend port (mặc định: 5000): " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-5000}

# ============================================
# TẠO NGINX CONFIGURATION
# ============================================
echo ""
echo -e "${YELLOW}Đang tạo cấu hình Nginx...${NC}"

cat > /etc/nginx/sites-available/spotify << EOF
# Spotify Clone - Nginx Configuration

# Redirect HTTP to HTTPS (sẽ được setup sau khi cài SSL)
# server {
#     listen 80;
#     server_name $DOMAIN;
#     return 301 https://\$host\$request_uri;
# }

server {
    listen 80;
    # listen 443 ssl http2; # Uncomment sau khi cài SSL
    server_name $DOMAIN;

    # SSL Configuration (Uncomment sau khi chạy certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client max body size (cho upload files)
    client_max_body_size 20M;

    # Frontend - Serve static files
    location / {
        root /var/www/niemadidaphat/backend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.io WebSocket
    location /socket.io {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Logs
    access_log /var/log/nginx/spotify-access.log;
    error_log /var/log/nginx/spotify-error.log;
}
EOF

# ============================================
# KÍCH HOẠT CẤU HÌNH
# ============================================
echo -e "${YELLOW}Kích hoạt cấu hình...${NC}"

# Xóa default site nếu tồn tại
rm -f /etc/nginx/sites-enabled/default

# Tạo symbolic link
ln -sf /etc/nginx/sites-available/spotify /etc/nginx/sites-enabled/

# Test cấu hình
echo -e "${YELLOW}Kiểm tra cấu hình Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Cấu hình Nginx hợp lệ${NC}"
    
    # Restart Nginx
    systemctl restart nginx
    echo -e "${GREEN}✅ Nginx đã được restart${NC}"
else
    echo -e "${RED}❌ Cấu hình Nginx có lỗi!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=================================================="
echo "  ✅ CẤU HÌNH NGINX HOÀN TẤT!"
echo "==================================================${NC}"
echo ""
echo "🌐 Domain: $DOMAIN"
echo "🔌 Backend Port: $BACKEND_PORT"
echo ""
echo "📋 Bước tiếp theo:"
echo ""
echo "1️⃣  Trỏ domain $DOMAIN về IP server của bạn"
echo ""
echo "2️⃣  Cài đặt SSL certificate (Let's Encrypt):"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
echo "3️⃣  Kiểm tra website:"
echo "   http://$DOMAIN"
echo ""
echo "📊 Xem logs Nginx:"
echo "   sudo tail -f /var/log/nginx/spotify-access.log"
echo "   sudo tail -f /var/log/nginx/spotify-error.log"
echo ""


