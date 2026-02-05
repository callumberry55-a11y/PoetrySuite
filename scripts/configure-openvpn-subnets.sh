#!/bin/bash

# OpenVPN Server Subnet Configuration
# Run this script ON the OpenVPN server to configure WPC and domain subnets

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== OpenVPN Subnet Configuration ===${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# Backup existing config
BACKUP_FILE="/etc/openvpn/server.conf.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${BLUE}Backing up current config to: $BACKUP_FILE${NC}"
cp /etc/openvpn/server.conf $BACKUP_FILE

# Add subnet configurations
echo -e "\n${GREEN}Configuring OpenVPN server for WPC subnets...${NC}\n"

# Check if configurations already exist
if grep -q "100.96.0.0" /etc/openvpn/server.conf; then
    echo -e "${YELLOW}WPC subnet configuration already exists. Skipping.${NC}"
else
    echo -e "${BLUE}Adding WPC subnet routes...${NC}"

    cat >> /etc/openvpn/server.conf << 'EOF'

# WPC Allocated Subnet (IPv4)
# Range: 100.96.0.0/11 (2,097,152 IPs)
push "route 100.96.0.0 255.224.0.0"
route 100.96.0.0 255.224.0.0

# Domain Routing Subnet (IPv4)
# Range: 100.80.0.0/12 (1,048,576 IPs)
push "route 100.80.0.0 255.240.0.0"
route 100.80.0.0 255.240.0.0

# WPC Allocated Subnet (IPv6)
# Range: fd:0:0:8000::/49
push "route-ipv6 fd:0:0:8000::/49"
route-ipv6 fd:0:0:8000::/49

# Domain Routing Subnet (IPv6)
# Range: fd:0:0:4000::/50
push "route-ipv6 fd:0:0:4000::/50"
route-ipv6 fd:0:0:4000::/50

# Client IP pool from WPC subnet
# This allows assigning IPs from the WPC range
ifconfig-pool 100.96.0.100 100.96.255.254 255.224.0.0
EOF

    echo -e "${GREEN}✓ Added subnet configurations${NC}"
fi

# Configure iptables for NAT
echo -e "\n${BLUE}Configuring iptables rules...${NC}\n"

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
sysctl -p

# Get primary network interface
INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)
echo -e "${BLUE}Primary interface: $INTERFACE${NC}"

# IPv4 NAT rules
iptables -t nat -A POSTROUTING -s 100.96.0.0/11 -o $INTERFACE -j MASQUERADE
iptables -t nat -A POSTROUTING -s 100.80.0.0/12 -o $INTERFACE -j MASQUERADE

# Allow forwarding
iptables -A FORWARD -s 100.96.0.0/11 -j ACCEPT
iptables -A FORWARD -d 100.96.0.0/11 -j ACCEPT
iptables -A FORWARD -s 100.80.0.0/12 -j ACCEPT
iptables -A FORWARD -d 100.80.0.0/12 -j ACCEPT

# IPv6 NAT rules (if IPv6 is available)
if [ -f /proc/net/if_inet6 ]; then
    echo -e "${BLUE}Configuring IPv6 rules...${NC}"
    ip6tables -t nat -A POSTROUTING -s fd:0:0:8000::/49 -o $INTERFACE -j MASQUERADE
    ip6tables -t nat -A POSTROUTING -s fd:0:0:4000::/50 -o $INTERFACE -j MASQUERADE
    ip6tables -A FORWARD -s fd:0:0:8000::/49 -j ACCEPT
    ip6tables -A FORWARD -d fd:0:0:8000::/49 -j ACCEPT
    ip6tables -A FORWARD -s fd:0:0:4000::/50 -j ACCEPT
    ip6tables -A FORWARD -d fd:0:0:4000::/50 -j ACCEPT
fi

# Install iptables-persistent to save rules
echo -e "\n${BLUE}Installing iptables-persistent...${NC}"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq iptables-persistent

# Save rules
iptables-save > /etc/iptables/rules.v4
if [ -f /proc/net/if_inet6 ]; then
    ip6tables-save > /etc/iptables/rules.v6
fi

echo -e "${GREEN}✓ iptables rules configured and saved${NC}"

# Restart OpenVPN
echo -e "\n${BLUE}Restarting OpenVPN service...${NC}"
systemctl restart openvpn@server

# Check status
if systemctl is-active --quiet openvpn@server; then
    echo -e "${GREEN}✓ OpenVPN service is running${NC}"
else
    echo -e "${RED}✗ OpenVPN service failed to start${NC}"
    echo -e "${YELLOW}Check logs: journalctl -u openvpn@server -n 50${NC}"
    exit 1
fi

# Display configuration
echo -e "\n${GREEN}=== Configuration Complete ===${NC}\n"

echo -e "${BLUE}Configured Subnets:${NC}"
echo "  WPC IPv4:         100.96.0.0/11 (2M+ IPs)"
echo "  WPC IPv6:         fd:0:0:8000::/49"
echo "  Domain IPv4:      100.80.0.0/12 (1M+ IPs)"
echo "  Domain IPv6:      fd:0:0:4000::/50"

echo -e "\n${BLUE}Backup Location:${NC}"
echo "  $BACKUP_FILE"

echo -e "\n${BLUE}OpenVPN Status:${NC}"
systemctl status openvpn@server --no-pager -l

echo -e "\n${BLUE}Active Routes:${NC}"
ip route show | grep -E "(100\.96|100\.80|10\.8)"

echo -e "\n${BLUE}IPv4 NAT Rules:${NC}"
iptables -t nat -L POSTROUTING -n -v | grep -E "(100\.96|100\.80)"

if [ -f /proc/net/if_inet6 ]; then
    echo -e "\n${BLUE}IPv6 NAT Rules:${NC}"
    ip6tables -t nat -L POSTROUTING -n -v | grep -E "(fd:0:0)"
fi

echo -e "\n${GREEN}=== Next Steps ===${NC}"
echo "1. Test VPN connection from a client"
echo "2. Verify client receives IP from 100.96.0.0/11"
echo "3. Test routing to 100.80.0.0/12 subnet"
echo "4. Monitor logs: tail -f /var/log/openvpn/openvpn.log"
echo ""
echo -e "${YELLOW}To test connectivity:${NC}"
echo "  # From VPN client after connecting:"
echo "  ip addr show tun0              # Check assigned IP"
echo "  ip route show                  # Check routes"
echo "  ping 100.96.0.1                # Test WPC subnet"
echo "  ping 100.80.0.1                # Test domain subnet"
echo ""
echo -e "${YELLOW}To view connected clients:${NC}"
echo "  cat /var/log/openvpn/openvpn-status.log"
echo ""
echo -e "${YELLOW}To rollback configuration:${NC}"
echo "  sudo cp $BACKUP_FILE /etc/openvpn/server.conf"
echo "  sudo systemctl restart openvpn@server"
