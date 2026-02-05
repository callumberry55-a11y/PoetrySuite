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

# Load configuration from .env.gcp.local if it exists
if [ -f ".env.gcp.local" ]; then
    echo -e "${GREEN}Loading configuration from .env.gcp.local${NC}"
    source .env.gcp.local

    PROJECT_ID=${GCP_PROJECT_ID}
    REGION=${GCP_REGION:-us-central1}
    VPC_NAME=${VPC_NETWORK_NAME:-default}
    DEPLOY_TYPE=${DEPLOY_TYPE:-cloudrun}
else
    echo -e "${YELLOW}No .env.gcp.local found. Using interactive mode.${NC}"
    echo "Create .env.gcp.local from .env.gcp.local.example for faster deployments."
    echo ""

    # Prompt for configuration
    echo -e "${YELLOW}Enter your GCP configuration:${NC}"
    read -p "Project ID: " PROJECT_ID
    read -p "Region (e.g., us-central1): " REGION
    read -p "VPC Network Name (default: default): " VPC_NAME
    VPC_NAME=${VPC_NAME:-default}
    read -p "Deployment type (cloudrun/appengine/compute): " DEPLOY_TYPE
fi

# Validate required variables
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: PROJECT_ID is required${NC}"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "\n${GREEN}Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    vpcaccess.googleapis.com \
    compute.googleapis.com \
    secretmanager.googleapis.com

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

# Configure environment variables and secrets
echo -e "\n${GREEN}Configuring environment variables and secrets...${NC}"

# Load environment variables from .env.gcp.local or prompt
if [ -f ".env.gcp.local" ]; then
    # Variables are already loaded from source command earlier
    echo "Using environment variables from .env.gcp.local"
else
    echo -e "${YELLOW}Enter your environment variables:${NC}"
    read -p "Supabase URL: " VITE_SUPABASE_URL
    read -p "Supabase Anon Key: " VITE_SUPABASE_ANON_KEY
    read -p "Firebase API Key: " VITE_FIREBASE_API_KEY
    read -p "Firebase Auth Domain: " VITE_FIREBASE_AUTH_DOMAIN
    read -p "Firebase Project ID: " VITE_FIREBASE_PROJECT_ID
    read -p "Gemini API Key (optional): " VITE_GEMINI_API_KEY
fi

# Create or update secrets in Secret Manager
echo -e "\n${GREEN}Setting up secrets in Secret Manager...${NC}"

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2

    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Skipping $secret_name (no value provided)${NC}"
        return
    fi

    if gcloud secrets describe $secret_name --project=$PROJECT_ID &>/dev/null; then
        echo "Updating secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=-
    else
        echo "Creating secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=-
    fi
}

# Create/update secrets for each environment variable
create_or_update_secret "supabase-url" "$VITE_SUPABASE_URL"
create_or_update_secret "supabase-anon-key" "$VITE_SUPABASE_ANON_KEY"
create_or_update_secret "firebase-api-key" "$VITE_FIREBASE_API_KEY"
create_or_update_secret "firebase-auth-domain" "$VITE_FIREBASE_AUTH_DOMAIN"
create_or_update_secret "firebase-project-id" "$VITE_FIREBASE_PROJECT_ID"
create_or_update_secret "firebase-storage-bucket" "$VITE_FIREBASE_STORAGE_BUCKET"
create_or_update_secret "firebase-messaging-sender-id" "$VITE_FIREBASE_MESSAGING_SENDER_ID"
create_or_update_secret "firebase-app-id" "$VITE_FIREBASE_APP_ID"
create_or_update_secret "gemini-api-key" "$VITE_GEMINI_API_KEY"
create_or_update_secret "vapid-public-key" "$VITE_VAPID_PUBLIC_KEY"
create_or_update_secret "vapid-private-key" "$VAPID_PRIVATE_KEY"

echo -e "${GREEN}Secrets configured successfully!${NC}"

# Grant Cloud Build access to Secret Manager
echo -e "\n${GREEN}Granting Cloud Build access to secrets...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --no-user-output-enabled 2>/dev/null || true

# Grant Cloud Run service account access to secrets
CLOUD_RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUD_RUN_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --no-user-output-enabled 2>/dev/null || true

echo -e "${GREEN}IAM permissions configured!${NC}"

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

# Secrets are already configured in Secret Manager and will be
# automatically injected during Cloud Build deployment via cloudbuild.yaml

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "\nNext steps:"
echo "1. Configure your custom domain (if needed)"
echo "2. Set up Cloud Armor for DDoS protection"
echo "3. Configure OpenVPN client access"
echo "4. Review VPC_DEPLOYMENT_GUIDE.md for detailed instructions"
echo -e "\n${YELLOW}Happy deploying!${NC}"
