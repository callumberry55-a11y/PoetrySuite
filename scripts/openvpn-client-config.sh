#!/bin/bash

# OpenVPN Client Configuration Generator
# Run this on your OpenVPN server to generate client configs

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== OpenVPN Client Configuration Generator ===${NC}\n"

# Configuration
read -p "Client name: " CLIENT_NAME
read -p "OpenVPN server public IP: " SERVER_IP
read -p "OpenVPN port (default: 1194): " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-1194}
read -p "Protocol (udp/tcp, default: udp): " PROTOCOL
PROTOCOL=${PROTOCOL:-udp}

# Paths
EASY_RSA_DIR="/etc/openvpn/easy-rsa"
KEYS_DIR="$EASY_RSA_DIR/pki"
OUTPUT_DIR="/tmp/openvpn-clients"
CLIENT_CONFIG="$OUTPUT_DIR/$CLIENT_NAME.ovpn"

# Create output directory
mkdir -p $OUTPUT_DIR

echo -e "\n${YELLOW}Generating certificates for $CLIENT_NAME...${NC}"

# Generate client certificate (requires Easy-RSA)
cd $EASY_RSA_DIR
./easyrsa build-client-full $CLIENT_NAME nopass

echo -e "\n${YELLOW}Creating client configuration file...${NC}"

# Create client config file
cat > $CLIENT_CONFIG << EOF
# OpenVPN Client Configuration for Poetry Suite
client
dev tun
proto $PROTOCOL
remote $SERVER_IP $SERVER_PORT
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
key-direction 1
verb 3

# Routes to access Poetry Suite via VPC
route 10.8.0.0 255.255.255.0

# DNS settings (optional)
# dhcp-option DNS 8.8.8.8
# dhcp-option DNS 8.8.4.4

<ca>
$(cat $KEYS_DIR/ca.crt)
</ca>

<cert>
$(cat $KEYS_DIR/issued/$CLIENT_NAME.crt)
</cert>

<key>
$(cat $KEYS_DIR/private/$CLIENT_NAME.key)
</key>

<tls-auth>
$(cat $KEYS_DIR/ta.key)
</tls-auth>

EOF

echo -e "\n${GREEN}Client configuration created!${NC}"
echo -e "\nConfiguration file: $CLIENT_CONFIG"
echo -e "\n${YELLOW}To use this configuration:${NC}"
echo "1. Copy the .ovpn file to your client device"
echo "2. Install OpenVPN client"
echo "3. Import the configuration file"
echo "4. Connect to the VPN"
echo -e "\n${GREEN}Once connected, you can access Poetry Suite through the VPC!${NC}"

# Create README
cat > $OUTPUT_DIR/README.txt << EOF
OpenVPN Client Configuration for Poetry Suite

Setup Instructions:

1. INSTALL OPENVPN CLIENT

   Windows:
   - Download from: https://openvpn.net/community-downloads/
   - Install OpenVPN GUI

   macOS:
   - Install via Homebrew: brew install openvpn
   - Or use Tunnelblick: https://tunnelblick.net/

   Linux (Ubuntu/Debian):
   - sudo apt-get install openvpn

   Linux (Fedora/RHEL):
   - sudo dnf install openvpn

2. IMPORT CONFIGURATION

   Windows (OpenVPN GUI):
   - Copy $CLIENT_NAME.ovpn to C:\Program Files\OpenVPN\config\
   - Right-click OpenVPN GUI in system tray → Connect

   macOS (Tunnelblick):
   - Double-click $CLIENT_NAME.ovpn
   - Follow import wizard

   Linux:
   - sudo openvpn --config $CLIENT_NAME.ovpn

3. VERIFY CONNECTION

   After connecting, verify you can access:
   - VPC internal resources
   - Poetry Suite application (if deployed with VPN-only access)

   Test connectivity:
   - ping 10.8.0.1
   - Check your IP: curl ifconfig.me

4. TROUBLESHOOTING

   Connection fails:
   - Verify server IP and port are correct
   - Check firewall rules allow UDP $SERVER_PORT
   - Ensure OpenVPN server is running

   Can't access resources:
   - Verify routes are pushed correctly
   - Check VPC firewall rules
   - Ensure proper DNS configuration

For support, contact your system administrator.
EOF

echo -e "\n${YELLOW}Setup instructions created at: $OUTPUT_DIR/README.txt${NC}"
