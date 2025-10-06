#!/bin/bash

# Script để chuẩn bị tất cả các scripts cho Ubuntu
# Chạy trên Windows trước khi upload lên Ubuntu

echo "Chuẩn bị các scripts cho Ubuntu..."

# Chuyển line endings từ CRLF sang LF (Windows -> Linux)
if command -v dos2unix &> /dev/null; then
    dos2unix *.sh 2>/dev/null
    echo "✓ Đã chuyển line endings sang LF"
else
    echo "⚠ Cảnh báo: dos2unix chưa được cài đặt"
    echo "  Các scripts có thể bị lỗi trên Linux"
    echo "  Cài đặt: sudo apt install dos2unix (trên Ubuntu)"
fi

# Tạo archive để upload
if command -v tar &> /dev/null; then
    tar -czf spotify-scripts.tar.gz \
        setup-ubuntu.sh \
        setup-mongodb.sh \
        create-env.sh \
        run-production.sh \
        setup-nginx.sh \
        quick-install.sh \
        SETUP_UBUNTU.md \
        README_SCRIPTS.md
    
    echo "✓ Đã tạo archive: spotify-scripts.tar.gz"
    echo ""
    echo "📤 Upload lên Ubuntu server:"
    echo "   scp spotify-scripts.tar.gz user@server:/tmp/"
    echo ""
    echo "📦 Giải nén trên Ubuntu:"
    echo "   cd /var/www/spotify"
    echo "   tar -xzf /tmp/spotify-scripts.tar.gz"
    echo "   chmod +x *.sh"
    echo "   sudo bash quick-install.sh"
fi

echo ""
echo "✅ Hoàn tất!"


