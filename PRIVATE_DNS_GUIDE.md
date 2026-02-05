# Private DNS Quick Start Guide

This is a quick reference guide for setting up your Poetry Suite app on a private DNS. For complete details, see [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md).

## What is Private DNS?

Private DNS allows you to access your application using a custom domain that's only accessible within your organization or VPC network. This is ideal for:

- Internal company applications
- Development/staging environments
- Applications behind a VPN
- Services within a Google Cloud VPC

## Quick Setup

### Option 1: Simple Private DNS (Recommended)

Use Cloud DNS with a private zone:

```bash
# 1. Set your environment variables
export PROJECT_ID="your-project-id"
export PRIVATE_DOMAIN="poetry.internal"
export VPC_NETWORK="default"

# 2. Create private DNS zone
gcloud dns managed-zones create poetry-private-zone \
  --description="Private zone for Poetry Suite" \
  --dns-name=$PRIVATE_DOMAIN \
  --networks=$VPC_NETWORK \
  --visibility=private

# 3. Get your Cloud Run service URL
CLOUD_RUN_URL=$(gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(status.url)")

CLOUD_RUN_DOMAIN=$(echo $CLOUD_RUN_URL | sed 's|https://||')

# 4. Create CNAME record
gcloud dns record-sets transaction start --zone=poetry-private-zone

gcloud dns record-sets transaction add $CLOUD_RUN_DOMAIN. \
  --name=$PRIVATE_DOMAIN. \
  --ttl=300 \
  --type=CNAME \
  --zone=poetry-private-zone

gcloud dns record-sets transaction execute --zone=poetry-private-zone

# 5. Test from a VM in the same VPC
nslookup poetry.internal
curl https://poetry.internal
```

### Option 2: Use the Automated Script

```bash
# 1. Configure .env.gcp.local
CUSTOM_DOMAIN=poetry.internal

# 2. Run setup
npm run gcp:setup-domain

# 3. When prompted for DNS records, create a private zone
# and add CNAME pointing to your Cloud Run URL
```

## Common Private Domain Patterns

### For Development

```
CUSTOM_DOMAIN=poetry.dev.internal
```

### For Staging

```
CUSTOM_DOMAIN=poetry.staging.internal
```

### For Production (Private)

```
CUSTOM_DOMAIN=poetry.internal
```

### Subdomain Structure

```
CUSTOM_DOMAIN=app.poetry.internal
```

## Verify Setup

### From a VM in the VPC

```bash
# SSH into a VM
gcloud compute ssh test-vm --zone=us-central1-a

# Test DNS resolution
nslookup poetry.internal

# Test HTTPS access
curl -I https://poetry.internal

# Test in browser (if VM has GUI)
xdg-open https://poetry.internal
```

### From Your Local Machine (via VPN)

If you have a VPN connection to your GCP VPC:

```bash
# Test DNS
nslookup poetry.internal

# Test access
curl https://poetry.internal

# Open in browser
open https://poetry.internal  # macOS
```

## Accessing from Different Networks

### Within GCP VPC

Works automatically - DNS resolution happens through the VPC's DNS.

### Via Cloud VPN

Set up Cloud VPN and configure DNS forwarding:

```bash
# Create VPN tunnel (example)
gcloud compute vpn-tunnels create poetry-vpn \
  --peer-address=YOUR_VPN_IP \
  --region=us-central1 \
  --ike-version=2 \
  --shared-secret=YOUR_SECRET \
  --target-vpn-gateway=your-gateway
```

### Via Identity-Aware Proxy (IAP)

For secure access without VPN:

```bash
# Enable IAP
gcloud iap web enable --resource-type=cloud-run

# Grant access to users
gcloud run services add-iam-policy-binding poetry-suite \
  --region=us-central1 \
  --member='user:email@example.com' \
  --role='roles/run.invoker'
```

## Troubleshooting

### DNS Not Resolving

```bash
# Check DNS zone
gcloud dns managed-zones list

# Check DNS records
gcloud dns record-sets list --zone=poetry-private-zone

# Verify VPC network
gcloud compute networks describe default
```

### 403 Forbidden Error

Your Cloud Run service might require authentication:

```bash
# Allow unauthenticated access
gcloud run services add-iam-policy-binding poetry-suite \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# Or for specific VPC users
gcloud run services add-iam-policy-binding poetry-suite \
  --region=us-central1 \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/run.invoker"
```

### SSL Certificate Errors

Private DNS with Cloud Run uses the Cloud Run SSL certificate:

```bash
# The certificate will be for *.run.app domain
# To use custom SSL, you need a load balancer

# Option 1: Accept the certificate warning (development only)
curl -k https://poetry.internal

# Option 2: Set up internal load balancer with custom SSL
# See CUSTOM_DOMAIN_SETUP.md for full guide
```

## Advanced: Internal Load Balancer

For true private access with custom SSL:

```bash
# Quick setup script
cat > setup-internal-lb.sh << 'EOF'
#!/bin/bash
PROJECT_ID=$1
REGION=$2
DOMAIN=$3

# Create serverless NEG
gcloud compute network-endpoint-groups create poetry-neg \
  --region=$REGION \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=poetry-suite

# Create backend service
gcloud compute backend-services create poetry-backend \
  --load-balancing-scheme=INTERNAL_MANAGED \
  --protocol=HTTPS \
  --region=$REGION

# Add NEG to backend
gcloud compute backend-services add-backend poetry-backend \
  --network-endpoint-group=poetry-neg \
  --network-endpoint-group-region=$REGION \
  --region=$REGION

echo "Internal load balancer created!"
EOF

chmod +x setup-internal-lb.sh
./setup-internal-lb.sh your-project-id us-central1 poetry.internal
```

## Cost Considerations

### Private DNS Only

- **Cloud DNS**: ~$0.20/month per zone
- Very low per-query cost
- Total: < $1/month for small usage

### Internal Load Balancer

- **Load Balancer**: ~$18/month (0.025/hour)
- **Data Processing**: $0.008-$0.016 per GB
- Total: $20-50/month depending on traffic

## Security Best Practices

### 1. Restrict Access by IP

```bash
gcloud run services update poetry-suite \
  --region=us-central1 \
  --ingress=internal  # Only VPC traffic
```

### 2. Require Authentication

```bash
gcloud run services update poetry-suite \
  --region=us-central1 \
  --no-allow-unauthenticated
```

### 3. Use VPC Service Controls

```bash
# Create access policy
gcloud access-context-manager policies create \
  --organization=YOUR_ORG_ID \
  --title="Poetry Suite Access Policy"
```

### 4. Enable Audit Logging

```bash
# Enable Cloud Audit Logs
gcloud logging read "resource.type=cloud_run_revision" \
  --limit=50 \
  --format=json
```

## Update Your Application

Once private DNS is configured, update environment variable:

```bash
gcloud run services update poetry-suite \
  --region=us-central1 \
  --update-env-vars="PUBLIC_URL=https://poetry.internal"
```

## Testing Checklist

- [ ] DNS resolves from VPC VMs
- [ ] HTTPS works (accept certificate if needed)
- [ ] Application loads correctly
- [ ] Authentication works (if enabled)
- [ ] APIs and database connections work
- [ ] Performance is acceptable

## Migration from Public to Private

If moving from public DNS to private:

```bash
# 1. Set up private DNS (keep public running)
# Follow steps above

# 2. Test thoroughly on private DNS
curl https://poetry.internal

# 3. Update all internal references
# Update bookmarks, docs, scripts

# 4. Delete public domain mapping (if desired)
gcloud run domain-mappings delete poetry.yourdomain.com \
  --region=us-central1
```

## Useful Commands

```bash
# List DNS zones
gcloud dns managed-zones list

# List DNS records
gcloud dns record-sets list --zone=poetry-private-zone

# Test from Cloud Shell (it's in the VPC)
nslookup poetry.internal

# View Cloud Run service
gcloud run services describe poetry-suite --region=us-central1

# Check IAM policies
gcloud run services get-iam-policy poetry-suite --region=us-central1

# View logs
gcloud run services logs read poetry-suite --region=us-central1 --limit=100
```

## Next Steps

- Set up VPN for remote access
- Configure Cloud Armor for additional security
- Set up monitoring and alerting
- Create staging and production environments
- Implement CI/CD pipeline

## Resources

- [Cloud DNS Documentation](https://cloud.google.com/dns/docs)
- [Cloud Run Private Networking](https://cloud.google.com/run/docs/securing/private-networking)
- [VPC Service Controls](https://cloud.google.com/vpc-service-controls/docs)
- [Internal Load Balancing](https://cloud.google.com/load-balancing/docs/l7-internal)

## Support

For issues with private DNS:

1. Check DNS zone configuration
2. Verify VPC network settings
3. Test from Cloud Shell (always in VPC)
4. Check IAM permissions
5. Review Cloud Run logs

```bash
# Debug DNS
gcloud dns record-sets list --zone=poetry-private-zone

# Debug Cloud Run
gcloud run services describe poetry-suite --region=us-central1

# Check connectivity
gcloud compute ssh test-vm --zone=us-central1-a --command="curl -I https://poetry.internal"
```
