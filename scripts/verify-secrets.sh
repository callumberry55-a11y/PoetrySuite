#!/bin/bash
# Verify GCP Secrets Configuration
# This script checks that all required secrets are properly configured in Secret Manager

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Verifying GCP Secrets Configuration ===${NC}\n"

# Load configuration
if [ -f ".env.gcp.local" ]; then
    source .env.gcp.local
    PROJECT_ID=${GCP_PROJECT_ID}
else
    echo -e "${RED}Error: .env.gcp.local not found${NC}"
    echo "Please create it from .env.gcp.local.example"
    exit 1
fi

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID not set in .env.gcp.local${NC}"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID --quiet

# Required secrets
REQUIRED_SECRETS=(
    "supabase-url"
    "supabase-anon-key"
    "firebase-api-key"
    "firebase-auth-domain"
    "firebase-project-id"
    "firebase-storage-bucket"
    "firebase-messaging-sender-id"
    "firebase-app-id"
)

OPTIONAL_SECRETS=(
    "gemini-api-key"
    "vapid-public-key"
    "vapid-private-key"
)

echo -e "${GREEN}Checking required secrets...${NC}\n"

MISSING_SECRETS=()
FOUND_SECRETS=()

# Check required secrets
for secret in "${REQUIRED_SECRETS[@]}"; do
    if gcloud secrets describe $secret --project=$PROJECT_ID &>/dev/null; then
        echo -e "${GREEN}✓${NC} $secret"
        FOUND_SECRETS+=("$secret")
    else
        echo -e "${RED}✗${NC} $secret ${RED}(MISSING)${NC}"
        MISSING_SECRETS+=("$secret")
    fi
done

echo ""
echo -e "${GREEN}Checking optional secrets...${NC}\n"

# Check optional secrets
for secret in "${OPTIONAL_SECRETS[@]}"; do
    if gcloud secrets describe $secret --project=$PROJECT_ID &>/dev/null; then
        echo -e "${GREEN}✓${NC} $secret"
        FOUND_SECRETS+=("$secret")
    else
        echo -e "${YELLOW}○${NC} $secret ${YELLOW}(optional, not set)${NC}"
    fi
done

echo ""
echo "================================"
echo -e "Found: ${GREEN}${#FOUND_SECRETS[@]}${NC} secrets"
echo -e "Missing: ${RED}${#MISSING_SECRETS[@]}${NC} required secrets"
echo "================================"

# Display summary
if [ ${#MISSING_SECRETS[@]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}All required secrets are configured!${NC}"
    echo ""
    echo "You can now deploy with: npm run deploy:gcp"
    exit 0
else
    echo ""
    echo -e "${RED}Missing required secrets!${NC}"
    echo ""
    echo "To create missing secrets, run:"
    echo ""
    for secret in "${MISSING_SECRETS[@]}"; do
        echo "  echo 'YOUR_VALUE' | gcloud secrets create $secret --data-file=-"
    done
    echo ""
    echo "Or run the deployment script which will create them automatically:"
    echo "  npm run deploy:gcp"
    exit 1
fi
