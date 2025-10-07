#!/bin/bash

# Script pull code va reload PM2 tren Ubuntu
# Su dung: ./deploy-update.sh

# Mau sac
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Cau hinh
PROJECT_DIR="/var/www/niemadidaphat"  # Thay doi duong dan nay
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
PM2_APP_NAME="spotify-backend"  # Ten app trong PM2

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   NiemADiDaPhat App Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function kiem tra loi
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] $1${NC}"
        exit 1
    fi
}

# Hien thi menu
show_menu() {
    echo -e "${GREEN}Chon thao tac:${NC}"
    echo "1) Pull code va reload PM2"
    echo "2) Pull code + build frontend + reload PM2"
    echo "3) Chi pull code (khong reload)"
    echo "4) Chi reload PM2"
    echo "5) Xem PM2 status"
    echo "6) Xem PM2 logs"
    echo "7) Thoat"
    echo ""
    read -p "Nhap lua chon [1-7]: " choice
}

# Function pull code
pull_code() {
    echo ""
    echo -e "${YELLOW}[STEP 1] Dang pull code moi...${NC}"
    
    cd "$PROJECT_DIR" || exit 1
    
    # Stash local changes neu co
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}Co local changes, dang stash...${NC}"
        git stash
    fi
    
    # Pull code
    git pull origin main
    check_error "Khong the pull code tu Git"
    
    echo -e "${GREEN}[OK] Da pull code thanh cong${NC}"
}

# Function install dependencies
install_dependencies() {
    echo ""
    echo -e "${YELLOW}[STEP 2] Kiem tra dependencies...${NC}"
    
    # Backend dependencies
    if [ -f "$BACKEND_DIR/package.json" ]; then
        echo "Kiem tra backend dependencies..."
        cd "$BACKEND_DIR"
        
        # Kiem tra neu package.json co thay doi
        if git diff HEAD@{1} HEAD -- package.json | grep -q "^+.*\""; then
            echo "package.json co thay doi, chay npm install..."
            npm install
            check_error "Khong the install backend dependencies"
        else
            echo "Khong co thay doi trong package.json, bo qua npm install"
        fi
    fi
    
    # Frontend dependencies
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        echo "Kiem tra frontend dependencies..."
        cd "$FRONTEND_DIR"
        
        if git diff HEAD@{1} HEAD -- package.json | grep -q "^+.*\""; then
            echo "package.json co thay doi, chay npm install..."
            npm install
            check_error "Khong the install frontend dependencies"
        else
            echo "Khong co thay doi trong package.json, bo qua npm install"
        fi
    fi
    
    echo -e "${GREEN}[OK] Dependencies da duoc kiem tra${NC}"
}

# Function build frontend
build_frontend() {
    echo ""
    echo -e "${YELLOW}[STEP 3] Build frontend...${NC}"
    
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        npm run build
        check_error "Khong the build frontend"
        echo -e "${GREEN}[OK] Frontend da duoc build${NC}"
    else
        echo -e "${YELLOW}[WARNING] Khong tim thay thu muc frontend${NC}"
    fi
}

# Function reload PM2
reload_pm2() {
    echo ""
    echo -e "${YELLOW}[STEP 4] Reload PM2...${NC}"
    
    # Kiem tra PM2 da cai dat chua
    if ! command -v pm2 &> /dev/null; then
        echo -e "${RED}[ERROR] PM2 chua duoc cai dat${NC}"
        echo "Cai dat PM2: npm install -g pm2"
        exit 1
    fi
    
    # Reload app
    pm2 reload "$PM2_APP_NAME" --update-env
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK] Da reload PM2 thanh cong${NC}"
    else
        echo -e "${YELLOW}[WARNING] Khong the reload, thu restart...${NC}"
        pm2 restart "$PM2_APP_NAME"
        check_error "Khong the restart PM2"
        echo -e "${GREEN}[OK] Da restart PM2 thanh cong${NC}"
    fi
    
    # Luu PM2 config
    pm2 save
}

# Function xem PM2 status
show_pm2_status() {
    echo ""
    echo -e "${BLUE}=== PM2 STATUS ===${NC}"
    pm2 status
    echo ""
    echo -e "${BLUE}=== PM2 INFO ===${NC}"
    pm2 info "$PM2_APP_NAME"
}

# Function xem PM2 logs
show_pm2_logs() {
    echo ""
    echo -e "${BLUE}=== PM2 LOGS (Ctrl+C de thoat) ===${NC}"
    echo ""
    pm2 logs "$PM2_APP_NAME" --lines 50
}

# Function deployment day du
full_deployment() {
    echo ""
    echo -e "${BLUE}=== BAT DAU DEPLOYMENT ===${NC}"
    
    pull_code
    install_dependencies
    reload_pm2
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}   DEPLOYMENT THANH CONG!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    
    show_pm2_status
}

# Function deployment voi build
full_deployment_with_build() {
    echo ""
    echo -e "${BLUE}=== BAT DAU DEPLOYMENT (WITH BUILD) ===${NC}"
    
    pull_code
    install_dependencies
    build_frontend
    reload_pm2
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}   DEPLOYMENT THANH CONG!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    
    show_pm2_status
}

# Main
if [ "$1" = "--quick" ] || [ "$1" = "-q" ]; then
    # Quick mode: pull va reload
    full_deployment
    exit 0
elif [ "$1" = "--build" ] || [ "$1" = "-b" ]; then
    # Build mode: pull, build, reload
    full_deployment_with_build
    exit 0
fi

# Interactive mode
while true; do
    show_menu
    
    case $choice in
        1)
            full_deployment
            ;;
        2)
            full_deployment_with_build
            ;;
        3)
            pull_code
            install_dependencies
            echo -e "${GREEN}[OK] Hoan thanh! (Chua reload PM2)${NC}"
            ;;
        4)
            reload_pm2
            show_pm2_status
            ;;
        5)
            show_pm2_status
            ;;
        6)
            show_pm2_logs
            ;;
        7)
            echo ""
            echo -e "${GREEN}Tam biet!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}[ERROR] Lua chon khong hop le${NC}"
            ;;
    esac
    
    echo ""
    read -p "Nhan Enter de tiep tuc..."
done

