#!/bin/bash
# Setup Custom Domain for Cloud Run
# This script automates the process of mapping a custom domain to your Cloud Run service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.gcp.local ]; then
  source .env.gcp.local
else
  echo -e "${RED}Error: .env.gcp.local not found${NC}"
  echo "Please create .env.gcp.local from .env.gcp.local.example"
  exit 1
fi

# Check required variables
if [ -z "$GCP_PROJECT_ID" ]; then
  echo -e "${RED}Error: GCP_PROJECT_ID not set in .env.gcp.local${NC}"
  exit 1
fi

if [ -z "$CUSTOM_DOMAIN" ]; then
  echo -e "${RED}Error: CUSTOM_DOMAIN not set in .env.gcp.local${NC}"
  echo "Please set CUSTOM_DOMAIN in .env.gcp.local (e.g., poetry.yourdomain.com)"
  exit 1
fi

if [ -z "$GCP_REGION" ]; then
  GCP_REGION="us-central1"
  echo -e "${YELLOW}Warning: GCP_REGION not set, using default: $GCP_REGION${NC}"
fi

if [ -z "$CLOUD_RUN_SERVICE_NAME" ]; then
  CLOUD_RUN_SERVICE_NAME="poetry-suite"
  echo -e "${YELLOW}Warning: CLOUD_RUN_SERVICE_NAME not set, using default: $CLOUD_RUN_SERVICE_NAME${NC}"
fi

# Set GCP project
gcloud config set project $GCP_PROJECT_ID

echo -e "${GREEN}Setting up custom domain: $CUSTOM_DOMAIN${NC}"
echo "Service: $CLOUD_RUN_SERVICE_NAME"
echo "Region: $GCP_REGION"
echo ""

# Check if Cloud Run service exists
echo "Checking if Cloud Run service exists..."
if ! gcloud run services describe $CLOUD_RUN_SERVICE_NAME --region=$GCP_REGION &>/dev/null; then
  echo -e "${RED}Error: Cloud Run service '$CLOUD_RUN_SERVICE_NAME' not found in region '$GCP_REGION'${NC}"
  echo "Please deploy your service first using: npm run deploy:gcp"
  exit 1
fi
echo -e "${GREEN}✓ Cloud Run service found${NC}"
echo ""

# Extract root domain for verification
ROOT_DOMAIN=$(echo $CUSTOM_DOMAIN | awk -F. '{print $(NF-1)"."$NF}')

# Check if domain is verified
echo "Checking domain verification for: $ROOT_DOMAIN"
if ! gcloud domains list-user-verified 2>/dev/null | grep -q "$ROOT_DOMAIN"; then
  echo -e "${YELLOW}Domain '$ROOT_DOMAIN' is not verified with Google${NC}"
  echo ""
  echo "Starting domain verification process..."
  echo "You will receive a TXT record that needs to be added to your DNS provider."
  echo ""

  # Initiate verification
  gcloud domains verify $ROOT_DOMAIN

  echo ""
  echo -e "${YELLOW}Action Required:${NC}"
  echo "1. Copy the TXT record value shown above"
  echo "2. Add it to your DNS provider with the following details:"
  echo "   - Type: TXT"
  echo "   - Name: @ (or your domain name)"
  echo "   - Value: google-site-verification=XXXXXXXXXXXXXXXXXXXX"
  echo "   - TTL: 3600"
  echo ""
  echo "3. Wait a few minutes for DNS propagation"
  echo "4. Press Enter to continue verification..."
  read -p ""

  # Check verification
  echo "Checking verification status..."
  if gcloud domains list-user-verified 2>/dev/null | grep -q "$ROOT_DOMAIN"; then
    echo -e "${GREEN}✓ Domain verified successfully${NC}"
  else
    echo -e "${RED}Error: Domain verification failed${NC}"
    echo "Please ensure the TXT record is added correctly and try again"
    exit 1
  fi
else
  echo -e "${GREEN}✓ Domain already verified${NC}"
fi
echo ""

# Check if domain mapping already exists
echo "Checking existing domain mappings..."
if gcloud run domain-mappings describe $CUSTOM_DOMAIN --region=$GCP_REGION &>/dev/null; then
  echo -e "${YELLOW}Domain mapping already exists for: $CUSTOM_DOMAIN${NC}"
  read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting existing domain mapping..."
    gcloud run domain-mappings delete $CUSTOM_DOMAIN --region=$GCP_REGION --quiet
    echo -e "${GREEN}✓ Deleted existing mapping${NC}"
  else
    echo "Keeping existing mapping. Checking DNS records..."
    gcloud run domain-mappings describe $CUSTOM_DOMAIN \
      --region=$GCP_REGION \
      --format="table(status.resourceRecords[].name, status.resourceRecords[].type, status.resourceRecords[].rrdata)"
    exit 0
  fi
fi

# Create domain mapping
echo "Creating domain mapping..."
if gcloud run domain-mappings create \
  --service=$CLOUD_RUN_SERVICE_NAME \
  --domain=$CUSTOM_DOMAIN \
  --region=$GCP_REGION; then
  echo -e "${GREEN}✓ Domain mapping created${NC}"
else
  echo -e "${RED}Error: Failed to create domain mapping${NC}"
  exit 1
fi
echo ""

# Get DNS records
echo -e "${GREEN}DNS Configuration Required${NC}"
echo "======================================="
echo "Add the following DNS records to your DNS provider:"
echo ""

# Get and display DNS records
DNS_RECORDS=$(gcloud run domain-mappings describe $CUSTOM_DOMAIN \
  --region=$GCP_REGION \
  --format="value(status.resourceRecords[])")

# Parse and display A records
echo "$DNS_RECORDS" | grep "type=A" | while read -r record; do
  NAME=$(echo "$record" | grep -oP 'name=\K[^,;]+')
  RRDATA=$(echo "$record" | grep -oP 'rrdata=\K[^,;]+')
  echo -e "${GREEN}A Record:${NC}"
  echo "  Type: A"
  echo "  Name: ${NAME%.}"
  echo "  Value: $RRDATA"
  echo "  TTL: 300"
  echo ""
done

# Parse and display AAAA records
echo "$DNS_RECORDS" | grep "type=AAAA" | while read -r record; do
  NAME=$(echo "$record" | grep -oP 'name=\K[^,;]+')
  RRDATA=$(echo "$record" | grep -oP 'rrdata=\K[^,;]+')
  echo -e "${GREEN}AAAA Record:${NC}"
  echo "  Type: AAAA"
  echo "  Name: ${NAME%.}"
  echo "  Value: $RRDATA"
  echo "  TTL: 300"
  echo ""
done

# If no records found, show table format
if [ -z "$DNS_RECORDS" ]; then
  gcloud run domain-mappings describe $CUSTOM_DOMAIN \
    --region=$GCP_REGION \
    --format="table(status.resourceRecords[].name, status.resourceRecords[].type, status.resourceRecords[].rrdata)"
fi

echo "======================================="
echo ""

# Ask if user has added DNS records
read -p "Press Enter when you've added the DNS records to continue monitoring..." -r

# Monitor domain mapping status
echo ""
echo "Monitoring domain mapping status..."
echo "This may take a few minutes. Waiting for domain to become active..."
echo ""

MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  STATUS=$(gcloud run domain-mappings describe $CUSTOM_DOMAIN \
    --region=$GCP_REGION \
    --format="value(status.conditions[0].status)" 2>/dev/null || echo "Unknown")

  MESSAGE=$(gcloud run domain-mappings describe $CUSTOM_DOMAIN \
    --region=$GCP_REGION \
    --format="value(status.conditions[0].message)" 2>/dev/null || echo "")

  if [ "$STATUS" = "True" ]; then
    echo -e "${GREEN}✓ Domain mapping is active!${NC}"
    break
  elif [ "$STATUS" = "False" ]; then
    echo -e "${RED}✗ Domain mapping failed: $MESSAGE${NC}"
    echo "Please check DNS records and try again"
    exit 1
  else
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep 5
  fi
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo ""
  echo -e "${YELLOW}Warning: Timeout waiting for domain to become active${NC}"
  echo "DNS propagation can take up to 48 hours"
  echo "Check status with: gcloud run domain-mappings describe $CUSTOM_DOMAIN --region=$GCP_REGION"
else
  echo ""
  echo -e "${GREEN}======================================="
  echo "Domain Setup Complete!"
  echo "=======================================${NC}"
  echo ""
  echo "Your app is now available at:"
  echo -e "${GREEN}https://$CUSTOM_DOMAIN${NC}"
  echo ""
  echo "SSL certificate will be automatically provisioned and renewed by Google."
  echo ""

  # Test the domain
  echo "Testing domain connectivity..."
  sleep 5

  if curl -s -o /dev/null -w "%{http_code}" https://$CUSTOM_DOMAIN | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Domain is accessible!${NC}"
  else
    echo -e "${YELLOW}⚠ Domain may not be accessible yet. DNS propagation can take time.${NC}"
    echo "Test manually: curl -I https://$CUSTOM_DOMAIN"
  fi
fi

echo ""
echo "Useful commands:"
echo "  Check status: gcloud run domain-mappings describe $CUSTOM_DOMAIN --region=$GCP_REGION"
echo "  Delete mapping: gcloud run domain-mappings delete $CUSTOM_DOMAIN --region=$GCP_REGION"
echo "  Test DNS: nslookup $CUSTOM_DOMAIN"
echo "  Test HTTPS: curl -I https://$CUSTOM_DOMAIN"
