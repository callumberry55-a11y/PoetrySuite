#!/bin/bash

# Poetry Suite - GCP Deployment Script
# This script automates deployment to Google Cloud Platform with VPC support

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Poetry Suite GCP Deployment ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}Please authenticate with Google Cloud:${NC}"
    gcloud auth login
fi

# Prompt for configuration
echo -e "${YELLOW}Enter your GCP configuration:${NC}"
read -p "Project ID: " PROJECT_ID
read -p "Region (e.g., us-central1): " REGION
read -p "VPC Network Name: " VPC_NAME
read -p "Deployment type (cloudrun/appengine/compute): " DEPLOY_TYPE

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "\n${GREEN}Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    vpcaccess.googleapis.com \
    compute.googleapis.com

# Check if VPC connector exists
CONNECTOR_NAME="poetry-vpc-connector"
echo -e "\n${GREEN}Checking VPC connector...${NC}"

if ! gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME \
    --region=$REGION &> /dev/null; then
    echo -e "${YELLOW}VPC connector not found. Creating...${NC}"

    read -p "IP range for VPC connector (default: 10.8.0.0/28): " IP_RANGE
    IP_RANGE=${IP_RANGE:-10.8.0.0/28}

    gcloud compute networks vpc-access connectors create $CONNECTOR_NAME \
        --region=$REGION \
        --network=$VPC_NAME \
        --range=$IP_RANGE \
        --min-instances=2 \
        --max-instances=10 \
        --machine-type=e2-micro

    echo -e "${GREEN}VPC connector created successfully!${NC}"
else
    echo -e "${GREEN}VPC connector already exists.${NC}"
fi

# Build the application
echo -e "\n${GREEN}Building application...${NC}"
npm run build

# Deploy based on type
case $DEPLOY_TYPE in
    cloudrun)
        echo -e "\n${GREEN}Deploying to Cloud Run...${NC}"

        # Build and submit to Cloud Build
        gcloud builds submit --config=cloudbuild.yaml \
            --substitutions=_REGION=$REGION,_VPC_CONNECTOR=projects/$PROJECT_ID/locations/$REGION/connectors/$CONNECTOR_NAME

        echo -e "\n${GREEN}Deployment complete!${NC}"

        # Get service URL
        SERVICE_URL=$(gcloud run services describe poetry-suite \
            --region=$REGION \
            --format="value(status.url)")

        echo -e "\n${GREEN}Your app is deployed at:${NC} $SERVICE_URL"
        ;;

    appengine)
        echo -e "\n${GREEN}Deploying to App Engine...${NC}"

        # Update app.yaml with project-specific values
        sed -i.bak "s/PROJECT_ID/$PROJECT_ID/g" app.yaml
        sed -i.bak "s/REGION/$REGION/g" app.yaml

        # Deploy
        gcloud app deploy app.yaml --quiet

        # Restore original app.yaml
        mv app.yaml.bak app.yaml

        echo -e "\n${GREEN}Deployment complete!${NC}"

        # Get service URL
        SERVICE_URL=$(gcloud app describe --format="value(defaultHostname)")
        echo -e "\n${GREEN}Your app is deployed at:${NC} https://$SERVICE_URL"
        ;;

    compute)
        echo -e "\n${GREEN}Deploying to Compute Engine...${NC}"
        echo -e "${YELLOW}This requires manual setup. Please follow the guide in VPC_DEPLOYMENT_GUIDE.md${NC}"
        ;;

    *)
        echo -e "${RED}Invalid deployment type. Choose: cloudrun, appengine, or compute${NC}"
        exit 1
        ;;
esac

# Prompt for environment variables
echo -e "\n${YELLOW}Do you want to configure environment variables now? (y/n)${NC}"
read -p "> " CONFIGURE_ENV

if [ "$CONFIGURE_ENV" = "y" ]; then
    echo -e "\n${YELLOW}Enter your environment variables:${NC}"
    read -p "Supabase URL: " SUPABASE_URL
    read -p "Supabase Anon Key: " SUPABASE_KEY
    read -p "Firebase API Key: " FIREBASE_KEY

    if [ "$DEPLOY_TYPE" = "cloudrun" ]; then
        gcloud run services update poetry-suite \
            --region=$REGION \
            --update-env-vars="VITE_SUPABASE_URL=$SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY,VITE_FIREBASE_API_KEY=$FIREBASE_KEY"
    elif [ "$DEPLOY_TYPE" = "appengine" ]; then
        echo "Please set environment variables in app.yaml or use GCP Console"
    fi
fi

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "\nNext steps:"
echo "1. Configure your custom domain (if needed)"
echo "2. Set up Cloud Armor for DDoS protection"
echo "3. Configure OpenVPN client access"
echo "4. Review VPC_DEPLOYMENT_GUIDE.md for detailed instructions"
echo -e "\n${YELLOW}Happy deploying!${NC}"
