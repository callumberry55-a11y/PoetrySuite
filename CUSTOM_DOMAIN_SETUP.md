# Custom Domain Setup for Cloud Run

This guide will help you set up a custom domain (public or private DNS) for your Poetry Suite application on Google Cloud Run.

## Overview

You can configure Cloud Run to serve your application on:
- **Public Domain**: A domain accessible from the internet (e.g., poetry.yourdomain.com)
- **Private Domain**: A domain accessible only within your organization or VPC (e.g., poetry.internal)

## Prerequisites

- [ ] GCP project with Cloud Run service deployed
- [ ] Domain name registered (for public domains)
- [ ] Access to DNS configuration
- [ ] gcloud CLI authenticated

## Option 1: Public Custom Domain

### Step 1: Verify Domain Ownership

First, you need to verify ownership of your domain with Google:

```bash
# Verify domain ownership (replace with your domain)
gcloud domains verify yourdomain.com
```

This will provide you with a TXT record to add to your DNS provider.

### Step 2: Add DNS TXT Record

Add the verification TXT record to your DNS provider:

```
Type: TXT
Name: @
Value: google-site-verification=XXXXXXXXXXXXXXXXXXXX
TTL: 3600
```

Wait a few minutes for DNS propagation, then verify:

```bash
gcloud domains list-user-verified
```

### Step 3: Map Custom Domain to Cloud Run

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export DOMAIN="poetry.yourdomain.com"

# Map the domain to your Cloud Run service
gcloud run domain-mappings create \
  --service=poetry-suite \
  --domain=$DOMAIN \
  --region=$REGION
```

### Step 4: Configure DNS Records

After mapping, Cloud Run will provide DNS records. Add these to your DNS provider:

```bash
# Get the required DNS records
gcloud run domain-mappings describe $DOMAIN \
  --region=$REGION \
  --format="value(status.resourceRecords)"
```

Typical records will be:

```
Type: A
Name: poetry (or subdomain)
Value: 216.239.32.21
TTL: 3600

Type: AAAA
Name: poetry (or subdomain)
Value: 2001:4860:4802:32::15
TTL: 3600
```

### Step 5: Verify Domain Mapping

```bash
# Check domain mapping status
gcloud run domain-mappings describe $DOMAIN \
  --region=$REGION

# Wait for status to show "Active"
watch -n 5 "gcloud run domain-mappings describe $DOMAIN --region=$REGION --format='value(status.conditions[0].type)'"
```

### Step 6: Test Your Domain

```bash
# Test the custom domain
curl https://poetry.yourdomain.com

# Check SSL certificate
curl -vI https://poetry.yourdomain.com 2>&1 | grep -i ssl
```

## Option 2: Private DNS with Cloud DNS

For internal/private domains within your organization:

### Step 1: Create Private Cloud DNS Zone

```bash
export PROJECT_ID="your-project-id"
export PRIVATE_ZONE_NAME="poetry-private-zone"
export PRIVATE_DOMAIN="poetry.internal"
export VPC_NETWORK="default"

# Create private DNS zone
gcloud dns managed-zones create $PRIVATE_ZONE_NAME \
  --description="Private zone for Poetry Suite" \
  --dns-name=$PRIVATE_DOMAIN \
  --networks=$VPC_NETWORK \
  --visibility=private
```

### Step 2: Get Cloud Run Service IP

```bash
# Get the Cloud Run service URL
CLOUD_RUN_URL=$(gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(status.url)")

# Extract the domain
CLOUD_RUN_DOMAIN=$(echo $CLOUD_RUN_URL | sed 's|https://||')

echo "Cloud Run Domain: $CLOUD_RUN_DOMAIN"
```

### Step 3: Create DNS Records

```bash
# Start DNS transaction
gcloud dns record-sets transaction start \
  --zone=$PRIVATE_ZONE_NAME

# Add CNAME record pointing to Cloud Run
gcloud dns record-sets transaction add $CLOUD_RUN_DOMAIN. \
  --name=$PRIVATE_DOMAIN. \
  --ttl=300 \
  --type=CNAME \
  --zone=$PRIVATE_ZONE_NAME

# Execute transaction
gcloud dns record-sets transaction execute \
  --zone=$PRIVATE_ZONE_NAME
```

### Step 4: Verify Private DNS

```bash
# List DNS records
gcloud dns record-sets list \
  --zone=$PRIVATE_ZONE_NAME

# Test DNS resolution from a VM in the same VPC
# SSH into a VM in your VPC and run:
nslookup poetry.internal
curl https://poetry.internal
```

### Step 5: Update Application Configuration

If you want the app to recognize it's being accessed via custom domain:

```bash
# Update Cloud Run service with custom domain env var
gcloud run services update poetry-suite \
  --region=us-central1 \
  --update-env-vars="PUBLIC_URL=https://$PRIVATE_DOMAIN"
```

## Option 3: Private DNS with Internal Load Balancer

For true private access (not exposed to internet):

### Step 1: Create Serverless NEG (Network Endpoint Group)

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"

# Create serverless NEG for Cloud Run
gcloud compute network-endpoint-groups create poetry-neg \
  --region=$REGION \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=poetry-suite
```

### Step 2: Create Internal Load Balancer

```bash
# Reserve internal IP address
gcloud compute addresses create poetry-internal-ip \
  --region=$REGION \
  --subnet=default \
  --addresses=10.128.0.100

# Create backend service
gcloud compute backend-services create poetry-backend \
  --load-balancing-scheme=INTERNAL_MANAGED \
  --protocol=HTTPS \
  --region=$REGION

# Add NEG to backend service
gcloud compute backend-services add-backend poetry-backend \
  --network-endpoint-group=poetry-neg \
  --network-endpoint-group-region=$REGION \
  --region=$REGION

# Create URL map
gcloud compute url-maps create poetry-url-map \
  --default-service=poetry-backend \
  --region=$REGION

# Create SSL certificate (self-signed for internal use)
gcloud compute ssl-certificates create poetry-ssl-cert \
  --certificate=cert.pem \
  --private-key=key.pem \
  --region=$REGION

# Create HTTPS proxy
gcloud compute target-https-proxies create poetry-https-proxy \
  --url-map=poetry-url-map \
  --ssl-certificates=poetry-ssl-cert \
  --region=$REGION

# Create forwarding rule
gcloud compute forwarding-rules create poetry-forwarding-rule \
  --load-balancing-scheme=INTERNAL_MANAGED \
  --network=default \
  --address=poetry-internal-ip \
  --ports=443 \
  --target-https-proxy=poetry-https-proxy \
  --target-https-proxy-region=$REGION \
  --region=$REGION
```

### Step 3: Configure Private DNS

```bash
# Get the internal IP
INTERNAL_IP=$(gcloud compute addresses describe poetry-internal-ip \
  --region=$REGION \
  --format="value(address)")

# Create DNS A record
gcloud dns record-sets transaction start \
  --zone=$PRIVATE_ZONE_NAME

gcloud dns record-sets transaction add $INTERNAL_IP \
  --name=poetry.internal. \
  --ttl=300 \
  --type=A \
  --zone=$PRIVATE_ZONE_NAME

gcloud dns record-sets transaction execute \
  --zone=$PRIVATE_ZONE_NAME
```

## Automated Setup Script

Create a script to automate domain mapping:

```bash
#!/bin/bash
# setup-custom-domain.sh

set -e

# Load environment variables
if [ -f .env.gcp.local ]; then
  source .env.gcp.local
else
  echo "Error: .env.gcp.local not found"
  exit 1
fi

if [ -z "$CUSTOM_DOMAIN" ]; then
  echo "Error: CUSTOM_DOMAIN not set in .env.gcp.local"
  exit 1
fi

echo "Setting up custom domain: $CUSTOM_DOMAIN"

# Check if domain is verified
echo "Checking domain verification..."
if ! gcloud domains list-user-verified 2>/dev/null | grep -q "$CUSTOM_DOMAIN"; then
  echo "Domain not verified. Starting verification..."
  gcloud domains verify $CUSTOM_DOMAIN
  echo "Please add the TXT record to your DNS and press Enter when done"
  read
fi

# Create domain mapping
echo "Creating domain mapping..."
gcloud run domain-mappings create \
  --service=$CLOUD_RUN_SERVICE_NAME \
  --domain=$CUSTOM_DOMAIN \
  --region=$GCP_REGION

# Get DNS records
echo ""
echo "Add these DNS records to your domain:"
echo "======================================="
gcloud run domain-mappings describe $CUSTOM_DOMAIN \
  --region=$GCP_REGION \
  --format="table(status.resourceRecords[].name, status.resourceRecords[].type, status.resourceRecords[].rrdata)"

echo ""
echo "Waiting for domain mapping to become active..."
until gcloud run domain-mappings describe $CUSTOM_DOMAIN \
  --region=$GCP_REGION \
  --format="value(status.conditions[0].type)" | grep -q "Ready"; do
  echo "Still waiting..."
  sleep 10
done

echo ""
echo "Domain mapping complete!"
echo "Your app is now available at: https://$CUSTOM_DOMAIN"
```

Make it executable:

```bash
chmod +x setup-custom-domain.sh
```

## SSL/TLS Certificates

### Automatic SSL (Recommended)

Cloud Run automatically provisions and manages SSL certificates for mapped domains:

- Certificates are automatically renewed
- No manual configuration needed
- Supports both public and subdomain mappings

### Custom SSL Certificate

If you need to use your own certificate:

```bash
# Create SSL certificate from files
gcloud compute ssl-certificates create poetry-custom-cert \
  --certificate=path/to/cert.pem \
  --private-key=path/to/key.pem \
  --global
```

## Testing Your Custom Domain

### Basic Connectivity Test

```bash
# Test DNS resolution
nslookup poetry.yourdomain.com

# Test HTTPS connectivity
curl -I https://poetry.yourdomain.com

# Test with verbose output
curl -v https://poetry.yourdomain.com
```

### SSL Certificate Verification

```bash
# Check SSL certificate details
openssl s_client -connect poetry.yourdomain.com:443 -servername poetry.yourdomain.com

# Verify certificate chain
curl -vI https://poetry.yourdomain.com 2>&1 | grep -A 5 "SSL certificate"
```

### Performance Test

```bash
# Test latency
time curl -s https://poetry.yourdomain.com > /dev/null

# Test with multiple requests
for i in {1..10}; do
  time curl -s https://poetry.yourdomain.com > /dev/null
done
```

## Troubleshooting

### Domain Not Verified

```bash
# Check verification status
gcloud domains list-user-verified

# Re-verify domain
gcloud domains verify yourdomain.com
```

### DNS Not Resolving

```bash
# Check DNS propagation
dig poetry.yourdomain.com

# Check from different DNS servers
dig @8.8.8.8 poetry.yourdomain.com
dig @1.1.1.1 poetry.yourdomain.com

# Wait for propagation (can take up to 48 hours)
watch -n 30 "dig poetry.yourdomain.com"
```

### SSL Certificate Issues

```bash
# Check certificate status
gcloud run domain-mappings describe poetry.yourdomain.com \
  --region=us-central1 \
  --format="value(status.certificate)"

# View certificate details
echo | openssl s_client -connect poetry.yourdomain.com:443 2>&1 | \
  openssl x509 -noout -dates -subject -issuer
```

### Domain Mapping Not Active

```bash
# Check domain mapping status
gcloud run domain-mappings describe poetry.yourdomain.com \
  --region=us-central1 \
  --format="value(status.conditions)"

# Delete and recreate mapping if stuck
gcloud run domain-mappings delete poetry.yourdomain.com \
  --region=us-central1

gcloud run domain-mappings create \
  --service=poetry-suite \
  --domain=poetry.yourdomain.com \
  --region=us-central1
```

### Private DNS Not Working

```bash
# Verify DNS zone exists
gcloud dns managed-zones list

# Check DNS records
gcloud dns record-sets list --zone=poetry-private-zone

# Test from VM in same VPC
gcloud compute ssh test-vm --zone=us-central1-a --command="nslookup poetry.internal"
```

## Security Considerations

### For Public Domains

1. **Enable Cloud Armor**: Protect against DDoS attacks
```bash
gcloud compute security-policies create poetry-security-policy \
  --description="Security policy for Poetry Suite"

gcloud compute security-policies rules create 1000 \
  --security-policy=poetry-security-policy \
  --action=allow \
  --src-ip-ranges="0.0.0.0/0"
```

2. **Configure CORS**: If serving API endpoints
```bash
gcloud run services update poetry-suite \
  --region=us-central1 \
  --set-env-vars="CORS_ORIGIN=https://poetry.yourdomain.com"
```

3. **Enable Cloud CDN**: For better performance and caching

### For Private Domains

1. **Restrict access to VPC**: Use IAM policies
```bash
gcloud run services set-iam-policy poetry-suite policy.yaml
```

2. **Use VPC Service Controls**: For additional security perimeter

3. **Enable VPC Flow Logs**: For monitoring and troubleshooting

## Cost Considerations

- **Domain Mapping**: Free
- **SSL Certificates**: Free (Google-managed)
- **Cloud DNS**: $0.20 per zone per month + $0.40 per million queries
- **Internal Load Balancer**: $0.025 per hour + data processing charges
- **Cloud Armor**: $5 per policy per month + $0.75-$1.00 per million requests

## Update Deployment Script

Add custom domain support to your deployment:

```bash
# In deploy-to-gcp.sh, add:
if [ ! -z "$CUSTOM_DOMAIN" ]; then
  echo "Setting up custom domain: $CUSTOM_DOMAIN"
  ./setup-custom-domain.sh
fi
```

## DNS Providers

### Popular DNS Providers Configuration

#### Cloudflare
1. Add A and AAAA records
2. Set SSL/TLS mode to "Full"
3. Disable Cloudflare proxy (orange cloud) initially

#### AWS Route 53
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXXXXXXXXXX \
  --change-batch file://dns-changes.json
```

#### Google Cloud DNS
```bash
gcloud dns record-sets transaction start --zone=my-zone
gcloud dns record-sets transaction add 216.239.32.21 \
  --name=poetry.yourdomain.com. \
  --ttl=300 \
  --type=A \
  --zone=my-zone
gcloud dns record-sets transaction execute --zone=my-zone
```

## Next Steps

1. Set up monitoring for your custom domain
2. Configure Cloud CDN for caching
3. Set up Cloud Armor for DDoS protection
4. Configure custom error pages
5. Set up domain-specific analytics

## Additional Resources

- [Cloud Run Custom Domains](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Cloud DNS Documentation](https://cloud.google.com/dns/docs)
- [SSL Certificate Management](https://cloud.google.com/load-balancing/docs/ssl-certificates)
- [VPC Service Controls](https://cloud.google.com/vpc-service-controls/docs)
