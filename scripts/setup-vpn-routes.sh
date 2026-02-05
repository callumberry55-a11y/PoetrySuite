#!/bin/bash

# VPN Routes Setup Script
# Configures GCP routes for WPC and domain routing subnets

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== VPN Routes Setup ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Get project configuration
read -p "GCP Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID

read -p "GCP Region (default: us-central1): " REGION
REGION=${REGION:-us-central1}

read -p "GCP Zone (default: us-central1-a): " ZONE
ZONE=${ZONE:-us-central1-a}

read -p "VPC Network Name (default: default): " NETWORK
NETWORK=${NETWORK:-default}

read -p "OpenVPN Server Instance Name (default: openvpn-server): " INSTANCE
INSTANCE=${INSTANCE:-openvpn-server}

echo -e "\n${BLUE}Configuration:${NC}"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Zone: $ZONE"
echo "Network: $NETWORK"
echo "Instance: $INSTANCE"

echo -e "\n${YELLOW}This will create routes for:${NC}"
echo "- WPC Subnet (IPv4): 100.96.0.0/11"
echo "- WPC Subnet (IPv6): fd:0:0:8000::/49"
echo "- Domain Routing (IPv4): 100.80.0.0/12"
echo "- Domain Routing (IPv6): fd:0:0:4000::/50"

read -p $'\nContinue? (y/n): ' CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
fi

# Function to create route
create_route() {
    local name=$1
    local destination=$2
    local description=$3

    echo -e "\n${GREEN}Creating route: $name${NC}"

    if gcloud compute routes describe $name &> /dev/null; then
        echo -e "${YELLOW}Route $name already exists. Skipping.${NC}"
        return 0
    fi

    gcloud compute routes create $name \
        --network=$NETWORK \
        --destination-range=$destination \
        --next-hop-instance=$INSTANCE \
        --next-hop-instance-zone=$ZONE \
        --priority=1000 \
        --description="$description"

    echo -e "${GREEN}✓ Created route: $name${NC}"
}

# Create IPv4 routes
echo -e "\n${BLUE}=== Creating IPv4 Routes ===${NC}"

create_route "route-to-wpc-ipv4" \
    "100.96.0.0/11" \
    "Route WPC client traffic through OpenVPN server"

create_route "route-to-domain-ipv4" \
    "100.80.0.0/12" \
    "Route domain routing traffic through OpenVPN server"

# Ask about IPv6
echo -e "\n${YELLOW}Do you want to create IPv6 routes? (y/n)${NC}"
read -p "> " CREATE_IPV6

if [ "$CREATE_IPV6" = "y" ]; then
    echo -e "\n${BLUE}=== Creating IPv6 Routes ===${NC}"

    create_route "route-to-wpc-ipv6" \
        "fd:0:0:8000::/49" \
        "Route WPC IPv6 client traffic through OpenVPN server"

    create_route "route-to-domain-ipv6" \
        "fd:0:0:4000::/50" \
        "Route domain IPv6 routing traffic through OpenVPN server"
fi

# Verify routes
echo -e "\n${BLUE}=== Verifying Routes ===${NC}\n"

gcloud compute routes list \
    --filter="network:$NETWORK AND (destRange:100.96.0.0/11 OR destRange:100.80.0.0/12 OR destRange:fd:0:0:8000::/49 OR destRange:fd:0:0:4000::/50)" \
    --format="table(name,destRange,nextHopInstance,priority)"

echo -e "\n${GREEN}=== Routes Setup Complete ===${NC}"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Configure OpenVPN server with these subnets"
echo "2. Update iptables rules on OpenVPN server"
echo "3. Test connectivity from VPN clients"
echo ""
echo -e "${YELLOW}To configure OpenVPN server:${NC}"
echo "  gcloud compute ssh $INSTANCE --zone=$ZONE"
echo "  sudo nano /etc/openvpn/server.conf"
echo ""
echo -e "${YELLOW}To delete these routes:${NC}"
echo "  gcloud compute routes delete route-to-wpc-ipv4"
echo "  gcloud compute routes delete route-to-domain-ipv4"
echo "  gcloud compute routes delete route-to-wpc-ipv6"
echo "  gcloud compute routes delete route-to-domain-ipv6"
