#!/bin/bash

# VPC Connector Setup Script for Poetry Suite

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== VPC Connector Setup ===${NC}\n"

# Get configuration
read -p "GCP Project ID: " PROJECT_ID
read -p "Region (e.g., us-central1): " REGION
read -p "VPC Network Name: " VPC_NAME
read -p "Connector Name (default: poetry-vpc-connector): " CONNECTOR_NAME
CONNECTOR_NAME=${CONNECTOR_NAME:-poetry-vpc-connector}
read -p "IP Range (default: 10.8.0.0/28): " IP_RANGE
IP_RANGE=${IP_RANGE:-10.8.0.0/28}

# Set project
gcloud config set project $PROJECT_ID

# Enable VPC Access API
echo -e "\n${GREEN}Enabling VPC Access API...${NC}"
gcloud services enable vpcaccess.googleapis.com

# Create VPC connector
echo -e "\n${GREEN}Creating VPC connector...${NC}"
gcloud compute networks vpc-access connectors create $CONNECTOR_NAME \
    --region=$REGION \
    --network=$VPC_NAME \
    --range=$IP_RANGE \
    --min-instances=2 \
    --max-instances=10 \
    --machine-type=e2-micro

# Verify creation
echo -e "\n${GREEN}Verifying VPC connector...${NC}"
gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME \
    --region=$REGION

echo -e "\n${GREEN}VPC Connector created successfully!${NC}"
echo -e "\nConnector path: projects/$PROJECT_ID/locations/$REGION/connectors/$CONNECTOR_NAME"
echo -e "\nUse this path in your Cloud Run or App Engine configuration."
