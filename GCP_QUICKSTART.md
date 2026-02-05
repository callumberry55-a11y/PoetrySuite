# Quick Start: Deploy to GCP with VPC & OpenVPN

This guide gets your Poetry Suite app running on Google Cloud with VPC and OpenVPN integration in under 30 minutes.

## Prerequisites Checklist

- [ ] GCP account with billing enabled
- [ ] OpenVPN server running on GCP (or ready to set up)
- [ ] `gcloud` CLI installed ([Download](https://cloud.google.com/sdk/docs/install))
- [ ] Authenticated with GCP: `gcloud auth login`
- [ ] Node.js 20+ installed

## Option 1: Automated Deployment (Recommended)

### Step 1: Configure Environment

```bash
# Copy and edit the GCP environment file
cp .env.gcp .env.gcp.local

# Edit with your values
nano .env.gcp.local  # or use your preferred editor
```

### Step 2: Run Automated Deployment

```bash
# Make script executable (if not already)
chmod +x deploy-to-gcp.sh

# Run deployment script
./deploy-to-gcp.sh
```

The script will:
1. Verify authentication
2. Enable required GCP APIs
3. Create VPC connector (if needed)
4. Build your application
5. Deploy to Cloud Run/App Engine
6. Configure environment variables

### Step 3: Access Your App

```bash
# Get your app URL
gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(status.url)"
```

## Option 2: Manual Setup

### Step 1: Enable APIs

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"

gcloud config set project $PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  vpcaccess.googleapis.com
```

### Step 2: Create VPC Connector

```bash
# Run the VPC setup script
npm run gcp:setup-vpc

# Or manually:
gcloud compute networks vpc-access connectors create poetry-vpc-connector \
  --region=$REGION \
  --network=default \
  --range=10.8.0.0/28 \
  --min-instances=2 \
  --max-instances=10
```

### Step 3: Setup Firewall Rules

```bash
# Run the firewall setup script
npm run gcp:setup-firewall

# Or see VPC_DEPLOYMENT_GUIDE.md for manual commands
```

### Step 4: Build & Deploy

```bash
# Build the app
npm run build

# Deploy to Cloud Run
npm run gcp:build

# Or use gcloud directly
gcloud builds submit --config=cloudbuild.yaml
```

## OpenVPN Integration

### Store Your OpenVPN Token Securely

If you have an OpenVPN authentication token, store it securely in GCP Secret Manager:

```bash
# Automated setup
npm run gcp:setup-openvpn

# Or manually
chmod +x scripts/setup-openvpn-token.sh
./scripts/setup-openvpn-token.sh
```

This will:
- Store your token in GCP Secret Manager
- Configure proper IAM permissions
- Optionally update your Cloud Run service

See detailed guide: [OPENVPN_SETUP.md](./OPENVPN_SETUP.md)

### Configure VPN Network Routes

If you're using WPC subnets (100.96.0.0/11, 100.80.0.0/12), set up routing:

```bash
# Configure GCP routes for VPN subnets
npm run gcp:setup-vpn-routes

# Then configure OpenVPN server (run on the server)
# SSH into your OpenVPN server:
gcloud compute ssh openvpn-server --zone=us-central1-a

# Copy and run the subnet configuration script
sudo bash configure-openvpn-subnets.sh
```

**Your VPN Subnets:**
- WPC Allocated (IPv4): `100.96.0.0/11` (2M+ IPs)
- WPC Allocated (IPv6): `fd:0:0:8000::/49`
- Domain Routing (IPv4): `100.80.0.0/12` (1M+ IPs)
- Domain Routing (IPv6): `fd:0:0:4000::/50`

See complete network details: [VPN_NETWORK_CONFIGURATION.md](./VPN_NETWORK_CONFIGURATION.md)

### If You Have OpenVPN Running

Your app will automatically use the VPC connector to communicate with resources in your VPC network where OpenVPN is running.

**VPC Egress Options:**
- `all-traffic` - All traffic goes through VPC (more expensive, more secure)
- `private-ranges-only` - Only private IP traffic through VPC (cheaper, still secure)

Edit `cloudbuild.yaml` to change:
```yaml
substitutions:
  _VPC_EGRESS: 'private-ranges-only'  # or 'all-traffic'
```

### If You Need to Set Up OpenVPN

1. **Create an OpenVPN Server VM:**

```bash
# Launch OpenVPN Access Server from GCP Marketplace
# Or install OpenVPN manually on a Compute Engine VM

gcloud compute instances create openvpn-server \
  --zone=$REGION-a \
  --machine-type=e2-medium \
  --network=default \
  --tags=vpn-server \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud
```

2. **Install OpenVPN:**

```bash
# SSH into the VM
gcloud compute ssh openvpn-server --zone=$REGION-a

# Install OpenVPN
wget https://git.io/vpn -O openvpn-install.sh
chmod +x openvpn-install.sh
sudo ./openvpn-install.sh
```

3. **Generate Client Configs:**

```bash
# On OpenVPN server, run:
./scripts/openvpn-client-config.sh
```

## Configure for VPN-Only Access

To require VPN connection for app access:

### Step 1: Remove Public Access

```bash
gcloud run services remove-iam-policy-binding poetry-suite \
  --region=$REGION \
  --member="allUsers" \
  --role="roles/run.invoker"
```

### Step 2: Add Authorized Users

```bash
# Add specific users
gcloud run services add-iam-policy-binding poetry-suite \
  --region=$REGION \
  --member="user:email@example.com" \
  --role="roles/run.invoker"

# Or add a group
gcloud run services add-iam-policy-binding poetry-suite \
  --region=$REGION \
  --member="group:team@example.com" \
  --role="roles/run.invoker"
```

### Step 3: Configure Internal Load Balancer (Advanced)

See `VPC_DEPLOYMENT_GUIDE.md` Section 7 for detailed instructions.

## Common Commands

```bash
# View logs
npm run gcp:logs

# Update environment variables
gcloud run services update poetry-suite \
  --region=$REGION \
  --update-env-vars="KEY=VALUE"

# Scale service
gcloud run services update poetry-suite \
  --region=$REGION \
  --max-instances=20 \
  --min-instances=1

# Deploy updates
npm run gcp:build

# Get service URL
gcloud run services describe poetry-suite \
  --region=$REGION \
  --format="value(status.url)"
```

## Verify Deployment

1. **Check Cloud Run Service:**
```bash
gcloud run services list --region=$REGION
```

2. **Test Health Endpoint:**
```bash
curl https://your-service-url/health
```

3. **Check VPC Connector:**
```bash
gcloud compute networks vpc-access connectors describe poetry-vpc-connector \
  --region=$REGION
```

4. **View Firewall Rules:**
```bash
gcloud compute firewall-rules list --filter="network:default"
```

## Troubleshooting

### Deployment Fails

**Error: VPC connector not found**
```bash
# Create VPC connector first
npm run gcp:setup-vpc
```

**Error: Permission denied**
```bash
# Grant necessary permissions to your account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:your-email@example.com" \
  --role="roles/run.admin"
```

### Can't Access App

**502 Bad Gateway**
- Check app logs: `npm run gcp:logs`
- Verify container is running: `gcloud run services describe poetry-suite`

**VPN clients can't connect to OpenVPN**
```bash
# Check firewall rules
gcloud compute firewall-rules list

# Verify OpenVPN is running
gcloud compute ssh openvpn-server --zone=$REGION-a
sudo systemctl status openvpn@server
```

### High Costs

**Reduce VPC Connector costs:**
```bash
# Update to smaller instances
gcloud compute networks vpc-access connectors update poetry-vpc-connector \
  --region=$REGION \
  --min-instances=2 \
  --max-instances=3
```

**Use private-ranges-only egress:**
Edit `cloudbuild.yaml`:
```yaml
_VPC_EGRESS: 'private-ranges-only'
```

## Security Checklist

- [ ] Enable HTTPS only (enforced by default on Cloud Run)
- [ ] Configure firewall rules properly
- [ ] Use Secret Manager for sensitive values
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Set up IAM policies for least privilege access
- [ ] Enable VPC Flow Logs for monitoring
- [ ] Configure Cloud Logging and Monitoring
- [ ] Regular security audits
- [ ] Keep OpenVPN updated
- [ ] Use strong VPN authentication

## Cost Optimization

1. **Use Cloud Run's pay-per-use model** (no idle charges)
2. **Set max instances** to prevent runaway costs
3. **Use private-ranges-only VPC egress** when possible
4. **Enable CDN** for static assets (reduces bandwidth)
5. **Set up budget alerts** in GCP Console
6. **Use committed use discounts** for steady workloads
7. **Downsize VPC connector** during low traffic periods

## Next Steps

1. **Set up monitoring:** Configure Cloud Monitoring alerts
2. **Custom domain:** Map your domain to the service
3. **CI/CD:** Set up automated deployments with Cloud Build triggers
4. **Backup strategy:** Regular database backups
5. **Disaster recovery:** Multi-region deployment
6. **Performance tuning:** Enable CDN, optimize assets

## Need Help?

- **Comprehensive Guide:** See `VPC_DEPLOYMENT_GUIDE.md`
- **GCP Documentation:** https://cloud.google.com/docs
- **OpenVPN Docs:** https://openvpn.net/community-resources/
- **Support:** Open an issue in the project repository

---

**Estimated Setup Time:** 15-30 minutes
**Estimated Monthly Cost:** $20-100 (depending on traffic and configuration)
