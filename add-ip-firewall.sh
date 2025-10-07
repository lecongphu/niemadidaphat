#!/bin/bash

# Script quan ly IP trong UFW Firewall
# Su dung: ./add-ip-firewall.sh

# Mau sac cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  UFW Firewall IP Manager${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Kiem tra quyen root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERROR] Script nay can chay voi quyen root/sudo${NC}"
    echo -e "${YELLOW}Vui long chay: sudo ./add-ip-firewall.sh${NC}"
    exit 1
fi

# Kiem tra UFW da cai dat chua
if ! command -v ufw &> /dev/null; then
    echo -e "${RED}[ERROR] UFW chua duoc cai dat${NC}"
    echo -e "${YELLOW}Dang cai dat UFW...${NC}"
    apt update
    apt install -y ufw
fi

# Menu chinh
show_menu() {
    echo ""
    echo -e "${GREEN}Chon thao tac:${NC}"
    echo "1) Them IP vao whitelist (allow)"
    echo "2) Xoa IP khoi whitelist"
    echo "3) Xem danh sach rules hien tai"
    echo "4) Bat UFW"
    echo "5) Tat UFW"
    echo "6) Reset UFW (xoa tat ca rules)"
    echo "7) Thoat"
    echo ""
    read -p "Nhap lua chon [1-7]: " choice
}

# Function them IP
add_ip() {
    echo ""
    echo -e "${YELLOW}=== THEM IP VAO WHITELIST ===${NC}"
    echo ""
    
    # Nhap IP
    read -p "Nhap dia chi IP (VD: 192.168.1.100 hoac 192.168.1.0/24): " ip_address
    
    # Validate IP
    if [[ ! $ip_address =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(/[0-9]+)?$ ]]; then
        echo -e "${RED}[ERROR] Dia chi IP khong hop le${NC}"
        return
    fi
    
    # Chon port (optional)
    echo ""
    echo "Chon cong can mo:"
    echo "1) Tat ca ports"
    echo "2) Port cu the (SSH: 22, HTTP: 80, HTTPS: 443, etc.)"
    read -p "Lua chon [1-2]: " port_choice
    
    if [ "$port_choice" = "2" ]; then
        read -p "Nhap so port (VD: 22, 80, 443): " port_number
        
        # Chon protocol
        echo "Chon protocol:"
        echo "1) TCP"
        echo "2) UDP"
        echo "3) Ca TCP va UDP"
        read -p "Lua chon [1-3]: " protocol_choice
        
        case $protocol_choice in
            1)
                ufw allow from "$ip_address" to any port "$port_number" proto tcp
                echo -e "${GREEN}[OK] Da them rule: Allow $ip_address -> port $port_number/tcp${NC}"
                ;;
            2)
                ufw allow from "$ip_address" to any port "$port_number" proto udp
                echo -e "${GREEN}[OK] Da them rule: Allow $ip_address -> port $port_number/udp${NC}"
                ;;
            3)
                ufw allow from "$ip_address" to any port "$port_number"
                echo -e "${GREEN}[OK] Da them rule: Allow $ip_address -> port $port_number (tcp/udp)${NC}"
                ;;
            *)
                echo -e "${RED}[ERROR] Lua chon khong hop le${NC}"
                return
                ;;
        esac
    else
        ufw allow from "$ip_address"
        echo -e "${GREEN}[OK] Da them rule: Allow all traffic tu $ip_address${NC}"
    fi
    
    # Ghi chu
    read -p "Them ghi chu cho rule nay (optional, Enter de bo qua): " comment
    if [ ! -z "$comment" ]; then
        echo "# $comment" >> /etc/ufw/ip-comments.txt
        echo -e "${GREEN}[OK] Da luu ghi chu${NC}"
    fi
}

# Function xoa IP
remove_ip() {
    echo ""
    echo -e "${YELLOW}=== XOA IP KHOI WHITELIST ===${NC}"
    echo ""
    
    # Hien thi rules co so thu tu
    echo -e "${BLUE}Danh sach rules hien tai:${NC}"
    ufw status numbered
    
    echo ""
    read -p "Nhap so thu tu rule can xoa: " rule_number
    
    # Xac nhan
    read -p "Ban co chac muon xoa rule #$rule_number? (y/n): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        ufw --force delete "$rule_number"
        echo -e "${GREEN}[OK] Da xoa rule #$rule_number${NC}"
    else
        echo -e "${YELLOW}[CANCEL] Da huy${NC}"
    fi
}

# Function xem rules
view_rules() {
    echo ""
    echo -e "${BLUE}=== DANH SACH RULES HIEN TAI ===${NC}"
    echo ""
    ufw status numbered
    echo ""
    
    # Hien thi ghi chu neu co
    if [ -f /etc/ufw/ip-comments.txt ]; then
        echo -e "${BLUE}=== GHI CHU ===${NC}"
        cat /etc/ufw/ip-comments.txt
    fi
}

# Function bat UFW
enable_ufw() {
    echo ""
    echo -e "${YELLOW}[WARNING] Luu y: Truoc khi bat UFW, dam bao da them IP cua ban vao whitelist!${NC}"
    echo -e "${YELLOW}Neu khong, ban co the bi khoa khoi server.${NC}"
    echo ""
    
    # Lay IP hien tai
    current_ip=$(who am i --ips 2>/dev/null | awk '{print $5}')
    if [ ! -z "$current_ip" ]; then
        echo -e "${BLUE}IP hien tai cua ban: $current_ip${NC}"
        read -p "Them IP nay vao whitelist truoc? (y/n): " add_current
        if [ "$add_current" = "y" ] || [ "$add_current" = "Y" ]; then
            ufw allow from "$current_ip"
            echo -e "${GREEN}[OK] Da them $current_ip vao whitelist${NC}"
        fi
    fi
    
    read -p "Tiep tuc bat UFW? (y/n): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        ufw --force enable
        echo -e "${GREEN}[OK] UFW da duoc bat${NC}"
    else
        echo -e "${YELLOW}[CANCEL] Da huy${NC}"
    fi
}

# Function tat UFW
disable_ufw() {
    echo ""
    read -p "Ban co chac muon tat UFW? (y/n): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        ufw disable
        echo -e "${GREEN}[OK] UFW da duoc tat${NC}"
    else
        echo -e "${YELLOW}[CANCEL] Da huy${NC}"
    fi
}

# Function reset UFW
reset_ufw() {
    echo ""
    echo -e "${RED}[WARNING] CANH BAO: Hanh dong nay se xoa TAT CA rules!${NC}"
    read -p "Ban co chac chan? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        ufw --force reset
        echo -e "${GREEN}[OK] UFW da duoc reset${NC}"
        
        # Xoa file ghi chu
        if [ -f /etc/ufw/ip-comments.txt ]; then
            rm /etc/ufw/ip-comments.txt
        fi
    else
        echo -e "${YELLOW}[CANCEL] Da huy${NC}"
    fi
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            add_ip
            ;;
        2)
            remove_ip
            ;;
        3)
            view_rules
            ;;
        4)
            enable_ufw
            ;;
        5)
            disable_ufw
            ;;
        6)
            reset_ufw
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
    
    read -p "Nhan Enter de tiep tuc..."
done
