#!/bin/bash

# Script fix Nginx upload limit cho Spotify Clone
# Tăng giới hạn upload lên 550MB (để upload file 500MB)

echo "=================================================="
echo "  🔧 FIX NGINX UPLOAD LIMIT (550MB)"
echo "=================================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Vui lòng chạy script với quyền sudo${NC}"
    echo -e "${YELLOW}Chạy lại với: sudo bash fix-nginx-upload-limit.sh${NC}"
    exit 1
fi

# Kiểm tra Nginx đã cài chưa
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx chưa được cài đặt!${NC}"
    exit 1
fi

# Tìm file config Nginx
NGINX_CONFIG=""
if [ -f "/etc/nginx/sites-available/spotify" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/spotify"
elif [ -f "/etc/nginx/nginx.conf" ]; then
    NGINX_CONFIG="/etc/nginx/nginx.conf"
else
    echo -e "${RED}❌ Không tìm thấy file cấu hình Nginx${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Tìm thấy config: $NGINX_CONFIG${NC}"
echo ""

# Backup file cũ
echo -e "${YELLOW}💾 Backup file config...${NC}"
cp $NGINX_CONFIG "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Đã backup: ${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)${NC}"
echo ""

# Cập nhật client_max_body_size
echo -e "${YELLOW}🔧 Cập nhật client_max_body_size...${NC}"

if grep -q "client_max_body_size" $NGINX_CONFIG; then
    # Thay thế giá trị cũ
    sed -i 's/client_max_body_size [0-9]*[MG];/client_max_body_size 550M;/g' $NGINX_CONFIG
    echo -e "${GREEN}✅ Đã cập nhật client_max_body_size từ giá trị cũ lên 550M${NC}"
else
    # Thêm mới vào http block
    sed -i '/http {/a \    client_max_body_size 550M;' $NGINX_CONFIG
    echo -e "${GREEN}✅ Đã thêm client_max_body_size 550M${NC}"
fi

# Cập nhật timeout cho /api location
echo -e "${YELLOW}🔧 Cập nhật API timeouts...${NC}"

if grep -q "location /api" $NGINX_CONFIG; then
    # Kiểm tra và update timeout
    if grep -A 20 "location /api" $NGINX_CONFIG | grep -q "proxy_read_timeout"; then
        sed -i '/location \/api/,/}/ s/proxy_read_timeout [0-9]*s;/proxy_read_timeout 300s;/' $NGINX_CONFIG
        sed -i '/location \/api/,/}/ s/proxy_send_timeout [0-9]*s;/proxy_send_timeout 300s;/' $NGINX_CONFIG
        sed -i '/location \/api/,/}/ s/proxy_connect_timeout [0-9]*s;/proxy_connect_timeout 300s;/' $NGINX_CONFIG
        echo -e "${GREEN}✅ Đã cập nhật timeouts lên 300s${NC}"
    else
        # Thêm timeout vào location /api
        sed -i '/location \/api/a \        proxy_connect_timeout 300s;\n        proxy_send_timeout 300s;\n        proxy_read_timeout 300s;' $NGINX_CONFIG
        echo -e "${GREEN}✅ Đã thêm timeouts 300s${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}🧪 Kiểm tra cấu hình Nginx...${NC}"

# Test cấu hình
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Cấu hình Nginx hợp lệ!${NC}"
    echo ""
    
    # Reload Nginx
    echo -e "${YELLOW}♻️  Reload Nginx...${NC}"
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx đã được reload thành công!${NC}"
    else
        echo -e "${RED}❌ Lỗi khi reload Nginx${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Cấu hình Nginx có lỗi!${NC}"
    echo ""
    echo -e "${YELLOW}Đang restore backup...${NC}"
    cp "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)" $NGINX_CONFIG
    echo -e "${GREEN}✅ Đã restore backup${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=================================================="
echo "  ✅ FIX HOÀN TẤT!"
echo "==================================================${NC}"
echo ""
echo "📋 Các thay đổi:"
echo "  • client_max_body_size: 550MB"
echo "  • proxy timeouts: 300s (5 phút)"
echo ""
echo "🎵 Bạn có thể upload file audio lên đến 500MB!"
echo ""
echo "📊 Kiểm tra config:"
echo "  sudo nginx -t"
echo ""
echo "📝 Xem file config:"
echo "  sudo cat $NGINX_CONFIG | grep -A 5 client_max_body_size"
echo ""
echo "🔄 Nếu vẫn gặp lỗi, restart Nginx:"
echo "  sudo systemctl restart nginx"
echo ""

