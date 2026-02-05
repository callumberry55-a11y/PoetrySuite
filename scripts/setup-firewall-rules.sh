#!/bin/bash

# Firewall Rules Setup for OpenVPN Integration

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Firewall Rules Setup ===${NC}\n"

# Get configuration
read -p "GCP Project ID: " PROJECT_ID
read -p "VPC Network Name: " VPC_NAME
read -p "OpenVPN Port (default: 1194): " VPN_PORT
VPN_PORT=${VPN_PORT:-1194}
read -p "VPN Subnet (default: 10.8.0.0/24): " VPN_SUBNET
VPN_SUBNET=${VPN_SUBNET:-10.8.0.0/24}

# Set project
gcloud config set project $PROJECT_ID

echo -e "\n${GREEN}Creating firewall rules...${NC}"

# Rule 1: Allow OpenVPN connections
echo -e "\n${YELLOW}1. Creating rule for OpenVPN traffic...${NC}"
gcloud compute firewall-rules create allow-openvpn \
    --network=$VPC_NAME \
    --allow=udp:$VPN_PORT \
    --source-ranges=0.0.0.0/0 \
    --description="Allow OpenVPN connections on UDP port $VPN_PORT" \
    --project=$PROJECT_ID || echo "Rule already exists"

# Rule 2: Allow internal VPC traffic
echo -e "\n${YELLOW}2. Creating rule for internal VPC traffic...${NC}"
gcloud compute firewall-rules create allow-internal-vpc \
    --network=$VPC_NAME \
    --allow=tcp:0-65535,udp:0-65535,icmp \
    --source-ranges=$VPN_SUBNET \
    --description="Allow internal VPC communication for VPN clients" \
    --project=$PROJECT_ID || echo "Rule already exists"

# Rule 3: Allow SSH
echo -e "\n${YELLOW}3. Creating rule for SSH access...${NC}"
gcloud compute firewall-rules create allow-ssh \
    --network=$VPC_NAME \
    --allow=tcp:22 \
    --source-ranges=0.0.0.0/0 \
    --description="Allow SSH access" \
    --project=$PROJECT_ID || echo "Rule already exists"

# Rule 4: Allow HTTP/HTTPS
echo -e "\n${YELLOW}4. Creating rule for HTTP/HTTPS traffic...${NC}"
gcloud compute firewall-rules create allow-http-https \
    --network=$VPC_NAME \
    --allow=tcp:80,tcp:443,tcp:8080 \
    --source-ranges=0.0.0.0/0 \
    --description="Allow HTTP and HTTPS traffic" \
    --project=$PROJECT_ID || echo "Rule already exists"

# Rule 5: Allow health checks
echo -e "\n${YELLOW}5. Creating rule for health check traffic...${NC}"
gcloud compute firewall-rules create allow-health-checks \
    --network=$VPC_NAME \
    --allow=tcp:8080 \
    --source-ranges=130.211.0.0/22,35.191.0.0/16 \
    --description="Allow health check traffic from GCP load balancers" \
    --project=$PROJECT_ID || echo "Rule already exists"

# List all firewall rules
echo -e "\n${GREEN}Current firewall rules for $VPC_NAME:${NC}"
gcloud compute firewall-rules list --filter="network:$VPC_NAME" --project=$PROJECT_ID

echo -e "\n${GREEN}Firewall rules setup complete!${NC}"
