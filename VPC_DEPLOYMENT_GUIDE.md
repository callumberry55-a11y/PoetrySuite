# Google Cloud VPC & OpenVPN Deployment Guide

This guide covers deploying the Poetry Suite app on Google Cloud Platform with VPC integration and OpenVPN connectivity.

## Architecture Overview

```
[Users]
   ↓ (Optional: via OpenVPN)
[Cloud Load Balancer]
   ↓
[Cloud Run / App Engine]
   ↓ (via VPC Connector)
[VPC Network] ←→ [OpenVPN Server]
   ↓
[Private Resources]
   ├── Internal APIs
   ├── Databases
   └── Other services
```

## Prerequisites

1. **GCP Project** with billing enabled
2. **OpenVPN Server** running in GCP
3. **VPC Network** configured
4. **gcloud CLI** installed and authenticated
5. **Docker** (for Cloud Run deployment)

## Part 1: VPC Connector Setup

### Create VPC Connector

```bash
# Set your variables
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export VPC_NAME="your-vpc-name"
export CONNECTOR_NAME="poetry-vpc-connector"

# Create VPC connector
gcloud compute networks vpc-access connectors create $CONNECTOR_NAME \
  --region=$REGION \
  --network=$VPC_NAME \
  --range=10.8.0.0/28 \
  --min-instances=2 \
  --max-instances=10 \
  --machine-type=e2-micro \
  --project=$PROJECT_ID
```

### Verify VPC Connector

```bash
gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME \
  --region=$REGION \
  --project=$PROJECT_ID
```

## Part 2: Firewall Rules for OpenVPN

```bash
# Allow OpenVPN traffic (UDP 1194)
gcloud compute firewall-rules create allow-openvpn \
  --network=$VPC_NAME \
  --allow=udp:1194 \
  --source-ranges=0.0.0.0/0 \
  --description="Allow OpenVPN connections" \
  --project=$PROJECT_ID

# Allow internal VPC traffic
gcloud compute firewall-rules create allow-internal-vpc \
  --network=$VPC_NAME \
  --allow=tcp:0-65535,udp:0-65535,icmp \
  --source-ranges=10.8.0.0/24 \
  --description="Allow internal VPC communication" \
  --project=$PROJECT_ID

# Allow health checks from Cloud Run/Load Balancer
gcloud compute firewall-rules create allow-health-checks \
  --network=$VPC_NAME \
  --allow=tcp:8080 \
  --source-ranges=130.211.0.0/22,35.191.0.0/16 \
  --description="Allow health check traffic" \
  --project=$PROJECT_ID
```

## Part 3: Deployment Options

### Option A: Cloud Run (Recommended)

#### Step 1: Build and Deploy

```bash
# Enable required APIs
gcloud services enable run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  vpcaccess.googleapis.com \
  --project=$PROJECT_ID

# Build using Cloud Build
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=$REGION,_VPC_CONNECTOR=projects/$PROJECT_ID/locations/$REGION/connectors/$CONNECTOR_NAME \
  --project=$PROJECT_ID
```

#### Step 2: Configure Environment Variables

```bash
# Set environment variables (add your actual values)
gcloud run services update poetry-suite \
  --region=$REGION \
  --update-env-vars="VITE_SUPABASE_URL=your-supabase-url,VITE_SUPABASE_ANON_KEY=your-anon-key,VITE_FIREBASE_API_KEY=your-api-key" \
  --project=$PROJECT_ID
```

#### Step 3: Configure IAM (Optional - for private access)

```bash
# Remove public access (requires VPN to access)
gcloud run services remove-iam-policy-binding poetry-suite \
  --region=$REGION \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=$PROJECT_ID

# Add specific users or service accounts
gcloud run services add-iam-policy-binding poetry-suite \
  --region=$REGION \
  --member="user:email@example.com" \
  --role="roles/run.invoker" \
  --project=$PROJECT_ID
```

### Option B: App Engine

```bash
# Enable App Engine API
gcloud services enable appengine.googleapis.com --project=$PROJECT_ID

# Initialize App Engine (if not already done)
gcloud app create --region=$REGION --project=$PROJECT_ID

# Update app.yaml with your PROJECT_ID and REGION
sed -i "s/PROJECT_ID/$PROJECT_ID/g" app.yaml
sed -i "s/REGION/$REGION/g" app.yaml

# Build the application
npm run build

# Deploy to App Engine
gcloud app deploy app.yaml --project=$PROJECT_ID
```

### Option C: Compute Engine with Docker

```bash
# Create instance in your VPC
gcloud compute instances create poetry-suite-vm \
  --zone=$REGION-a \
  --machine-type=e2-medium \
  --network=$VPC_NAME \
  --subnet=default \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server \
  --project=$PROJECT_ID

# SSH into instance
gcloud compute ssh poetry-suite-vm --zone=$REGION-a --project=$PROJECT_ID

# On the VM:
# Pull and run Docker container
docker pull gcr.io/$PROJECT_ID/poetry-suite:latest
docker run -d -p 80:8080 --name poetry-suite \
  -e VITE_SUPABASE_URL=your-supabase-url \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  gcr.io/$PROJECT_ID/poetry-suite:latest
```

## Part 4: OpenVPN Integration

### Configure OpenVPN for App Access

#### Option 1: VPN Required Access (Most Secure)

1. Remove public access to your Cloud Run service (see Step 3 above)
2. Users must connect to OpenVPN before accessing the app
3. Configure OpenVPN to route app traffic through VPC

```bash
# In OpenVPN server config (/etc/openvpn/server.conf)
# Add routes to your Cloud Run IP range
push "route 10.8.0.0 255.255.255.0"
```

#### Option 2: Hybrid Access (Public + VPN for Internal Resources)

- App is publicly accessible
- Internal APIs/resources only accessible via VPC
- Configure VPC egress to route private traffic through VPC connector

Update `cloudbuild.yaml` substitution:
```yaml
substitutions:
  _VPC_EGRESS: 'private-ranges-only'
```

### OpenVPN Client Configuration

Share this with users who need VPN access:

```bash
# Install OpenVPN client
# Ubuntu/Debian
sudo apt-get install openvpn

# MacOS
brew install openvpn

# Connect to VPN
sudo openvpn --config client.ovpn
```

## Part 5: Configure Supabase for VPC Access

### Option 1: IP Allowlist (Supabase Pro/Team)

```bash
# Get Cloud Run outbound IP
gcloud run services describe poetry-suite \
  --region=$REGION \
  --format="value(status.url)" \
  --project=$PROJECT_ID

# In Supabase Dashboard:
# Settings → Database → Network Restrictions
# Add Cloud Run NAT Gateway IPs
```

### Option 2: Supabase VPC Peering (Enterprise)

Contact Supabase support to set up VPC peering between your GCP VPC and Supabase.

## Part 6: Monitoring and Logging

```bash
# View Cloud Run logs
gcloud run services logs read poetry-suite \
  --region=$REGION \
  --limit=50 \
  --project=$PROJECT_ID

# View VPC connector metrics
gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME \
  --region=$REGION \
  --project=$PROJECT_ID

# Monitor OpenVPN connections
# SSH to OpenVPN server
gcloud compute ssh openvpn-server --zone=$REGION-a
sudo journalctl -u openvpn@server -f
```

## Part 7: Custom Domain with Cloud Load Balancer

```bash
# Reserve static IP
gcloud compute addresses create poetry-suite-ip \
  --global \
  --project=$PROJECT_ID

# Get the IP address
gcloud compute addresses describe poetry-suite-ip \
  --global \
  --format="get(address)" \
  --project=$PROJECT_ID

# Map custom domain (in Cloud Console or using gcloud)
gcloud run domain-mappings create \
  --service=poetry-suite \
  --domain=yourdomain.com \
  --region=$REGION \
  --project=$PROJECT_ID
```

## Part 8: Security Best Practices

1. **Enable Cloud Armor** (DDoS protection)
```bash
gcloud compute security-policies create poetry-suite-policy \
  --description="Security policy for Poetry Suite" \
  --project=$PROJECT_ID
```

2. **Enable Secret Manager** for sensitive environment variables
```bash
# Create secret
echo -n "your-secret-value" | gcloud secrets create SUPABASE_KEY \
  --data-file=- \
  --replication-policy="automatic" \
  --project=$PROJECT_ID

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding SUPABASE_KEY \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID
```

3. **Enable VPC Service Controls** for additional security

4. **Regular security audits**
```bash
gcloud services enable securitycenter.googleapis.com
```

## Part 9: Cost Optimization

1. **Set up budget alerts**
```bash
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Poetry Suite Budget" \
  --budget-amount=100USD
```

2. **Configure autoscaling**
- Cloud Run: Use `--max-instances` flag
- VPC Connector: Adjust min/max instances based on traffic

3. **Use Cloud CDN** for static assets
```bash
gcloud compute backend-buckets create poetry-suite-cdn \
  --gcs-bucket-name=your-bucket-name \
  --enable-cdn
```

## Troubleshooting

### VPC Connector Issues
```bash
# Check connector status
gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME \
  --region=$REGION

# Common issues:
# - Insufficient IP range (use /28 minimum)
# - Network not found (verify VPC_NAME)
# - Quota exceeded (request quota increase)
```

### OpenVPN Connection Issues
```bash
# Test connectivity from Cloud Run
gcloud run services describe poetry-suite --region=$REGION

# Check firewall rules
gcloud compute firewall-rules list --filter="network:$VPC_NAME"

# Verify OpenVPN logs
sudo tail -f /var/log/openvpn/openvpn.log
```

### DNS Resolution Issues
```bash
# Configure Cloud DNS for internal resolution
gcloud dns managed-zones create poetry-internal \
  --description="Internal DNS zone" \
  --dns-name=internal.poetrysuite.local \
  --networks=$VPC_NAME \
  --visibility=private
```

## Quick Reference Commands

```bash
# Deploy updates
gcloud builds submit --config=cloudbuild.yaml

# View service URL
gcloud run services describe poetry-suite --region=$REGION --format="value(status.url)"

# Scale service
gcloud run services update poetry-suite --region=$REGION --max-instances=20

# View logs
gcloud run services logs read poetry-suite --region=$REGION --limit=100

# Update environment variables
gcloud run services update poetry-suite --region=$REGION --update-env-vars="KEY=VALUE"
```

## Support Resources

- [GCP VPC Documentation](https://cloud.google.com/vpc/docs)
- [Cloud Run VPC Access](https://cloud.google.com/run/docs/configuring/vpc-direct-vpc)
- [OpenVPN Documentation](https://openvpn.net/community-resources/)
- [Supabase Network Configuration](https://supabase.com/docs/guides/platform/network-restrictions)

---

For additional help, consult the GCP documentation or open an issue in the project repository.
