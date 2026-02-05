#!/bin/bash

# OpenVPN Token Setup Script
# Securely stores OpenVPN authentication token in GCP Secret Manager

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== OpenVPN Token Setup ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Get project ID
read -p "GCP Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID

# Enable Secret Manager API
echo -e "\n${GREEN}Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com

# Prompt for OpenVPN token
echo -e "\n${YELLOW}Enter your OpenVPN authentication token:${NC}"
echo "(Paste your token and press Enter)"
read -s OPENVPN_TOKEN

if [ -z "$OPENVPN_TOKEN" ]; then
    echo -e "${RED}Error: Token cannot be empty${NC}"
    exit 1
fi

# Create or update secret
SECRET_NAME="openvpn-auth-token"

echo -e "\n${GREEN}Storing token in Secret Manager...${NC}"

if gcloud secrets describe $SECRET_NAME &> /dev/null; then
    echo -e "${YELLOW}Secret already exists. Creating new version...${NC}"
    echo -n "$OPENVPN_TOKEN" | gcloud secrets versions add $SECRET_NAME --data-file=-
else
    echo -e "${GREEN}Creating new secret...${NC}"
    echo -n "$OPENVPN_TOKEN" | gcloud secrets create $SECRET_NAME \
        --data-file=- \
        --replication-policy="automatic"
fi

# Grant access to Cloud Run service account
echo -e "\n${GREEN}Configuring permissions...${NC}"

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

echo -e "\n${GREEN}Token stored successfully!${NC}"
echo -e "\nSecret name: ${YELLOW}$SECRET_NAME${NC}"
echo -e "To use this in Cloud Run, add this flag to your deployment:"
echo -e "${YELLOW}--set-secrets=OPENVPN_TOKEN=$SECRET_NAME:latest${NC}"

# Optionally update Cloud Run service
echo -e "\n${YELLOW}Do you want to update your Cloud Run service now? (y/n)${NC}"
read -p "> " UPDATE_SERVICE

if [ "$UPDATE_SERVICE" = "y" ]; then
    read -p "Cloud Run service name (default: poetry-suite): " SERVICE_NAME
    SERVICE_NAME=${SERVICE_NAME:-poetry-suite}

    read -p "Region (default: us-central1): " REGION
    REGION=${REGION:-us-central1}

    echo -e "\n${GREEN}Updating Cloud Run service...${NC}"

    gcloud run services update $SERVICE_NAME \
        --region=$REGION \
        --set-secrets=OPENVPN_TOKEN=$SECRET_NAME:latest \
        --quiet

    echo -e "${GREEN}Service updated successfully!${NC}"
fi

echo -e "\n${GREEN}=== Setup Complete ===${NC}"
echo -e "\nNext steps:"
echo "1. Your OpenVPN token is securely stored in Secret Manager"
echo "2. Cloud Run can now access it via the OPENVPN_TOKEN environment variable"
echo "3. To rotate the token, run this script again"
echo -e "\nTo view the secret:"
echo -e "${YELLOW}gcloud secrets versions access latest --secret=$SECRET_NAME${NC}"
