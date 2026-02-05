# Quick Start: Deploy to Google Cloud Platform

This guide gets your Poetry Suite app running on Google Cloud Platform in under 15 minutes.

## Prerequisites Checklist

- [ ] GCP account with billing enabled
- [ ] `gcloud` CLI installed ([Download](https://cloud.google.com/sdk/docs/install))
- [ ] Authenticated with GCP: `gcloud auth login`
- [ ] Node.js 20+ installed

## Quick Deployment

### Step 1: Configure Environment

```bash
# Copy and edit the GCP environment file
cp .env.gcp .env.gcp.local

# Edit with your values
nano .env.gcp.local  # or use your preferred editor
```

Required values:
- `GCP_PROJECT_ID` - Your GCP project ID
- `GCP_REGION` - Region to deploy to (default: us-central1)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- Firebase configuration variables

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
3. Build your application
4. Deploy to Cloud Run
5. Configure environment variables

### Step 3: Access Your App

```bash
# Get your app URL
gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(status.url)"
```

## Manual Setup

### Step 1: Enable APIs

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"

gcloud config set project $PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com
```

### Step 2: Build & Deploy

```bash
# Build the app
npm run build

# Deploy to Cloud Run using Cloud Build
npm run gcp:build

# Or use gcloud directly
gcloud builds submit --config=cloudbuild.yaml
```

### Step 3: Configure Cloud Run

```bash
# Deploy the built image to Cloud Run
gcloud run deploy poetry-suite \
  --image=gcr.io/$PROJECT_ID/poetry-suite \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="VITE_SUPABASE_URL=your-url,VITE_SUPABASE_ANON_KEY=your-key"
```

## Environment Variables

Set your environment variables in Cloud Run:

```bash
gcloud run services update poetry-suite \
  --region=us-central1 \
  --update-env-vars="
    VITE_SUPABASE_URL=your-supabase-url,
    VITE_SUPABASE_ANON_KEY=your-anon-key,
    VITE_FIREBASE_API_KEY=your-api-key,
    VITE_FIREBASE_AUTH_DOMAIN=your-domain,
    VITE_FIREBASE_PROJECT_ID=your-project,
    VITE_FIREBASE_STORAGE_BUCKET=your-bucket,
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id,
    VITE_FIREBASE_APP_ID=your-app-id"
```

## Verify Deployment

```bash
# Check deployment status
gcloud run services describe poetry-suite --region=us-central1

# View logs
npm run gcp:logs

# Or directly
gcloud run services logs read poetry-suite \
  --region=us-central1 \
  --limit=100
```

## Troubleshooting

### Build Fails

```bash
# Check Cloud Build logs
gcloud builds list --limit=5

# Get detailed logs for a specific build
gcloud builds log [BUILD_ID]
```

### Service Not Accessible

```bash
# Check if service is running
gcloud run services list --region=us-central1

# Verify IAM permissions
gcloud run services get-iam-policy poetry-suite --region=us-central1
```

### Environment Variables Not Set

```bash
# Check current environment variables
gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

## Scaling Configuration

### Adjust Resources

```bash
# Update Cloud Run service configuration
gcloud run services update poetry-suite \
  --region=us-central1 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --timeout=300
```

### Enable Autoscaling

Cloud Run automatically scales based on traffic. Configure scaling limits:

```bash
gcloud run services update poetry-suite \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=100 \
  --concurrency=80
```

## Custom Domain

### Add Custom Domain

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service=poetry-suite \
  --domain=your-domain.com \
  --region=us-central1
```

### Verify Domain

Follow the instructions to add DNS records for domain verification.

## Cost Optimization

### Development Environment

```bash
# Minimal configuration for development
gcloud run services update poetry-suite \
  --region=us-central1 \
  --memory=256Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3
```

### Production Environment

```bash
# Production-ready configuration
gcloud run services update poetry-suite \
  --region=us-central1 \
  --memory=512Mi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=50
```

## Monitoring

### View Metrics

```bash
# Open Cloud Console metrics
gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(status.url)"

# View in browser: https://console.cloud.google.com/run
```

### Set Up Alerts

Configure alerts in Cloud Console:
1. Go to Cloud Run service
2. Click "Metrics" tab
3. Set up alerts for latency, errors, or traffic

## Updates and Rollbacks

### Update Service

```bash
# Build and deploy new version
npm run build
npm run gcp:build
```

### Rollback

```bash
# List revisions
gcloud run revisions list \
  --service=poetry-suite \
  --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic poetry-suite \
  --region=us-central1 \
  --to-revisions=poetry-suite-00001-xyz=100
```

## Clean Up

### Delete Service

```bash
# Delete Cloud Run service
gcloud run services delete poetry-suite --region=us-central1

# Delete container images
gcloud container images list --repository=gcr.io/$PROJECT_ID
gcloud container images delete gcr.io/$PROJECT_ID/poetry-suite
```

## Custom Domain & Private DNS

### Public Custom Domain

Use your own domain name:

```bash
# 1. Set domain in .env.gcp.local
CUSTOM_DOMAIN=poetry.yourdomain.com

# 2. Run setup script
npm run gcp:setup-domain
```

See [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md) for full details.

### Private DNS (Internal Access Only)

For internal/VPC-only access:

```bash
# Quick setup
export PRIVATE_DOMAIN="poetry.internal"

# Create private DNS zone
gcloud dns managed-zones create poetry-private-zone \
  --dns-name=$PRIVATE_DOMAIN \
  --networks=default \
  --visibility=private

# Add CNAME to Cloud Run service
CLOUD_RUN_URL=$(gcloud run services describe poetry-suite \
  --region=us-central1 --format="value(status.url)")

gcloud dns record-sets transaction start --zone=poetry-private-zone
gcloud dns record-sets transaction add $(echo $CLOUD_RUN_URL | sed 's|https://||'). \
  --name=$PRIVATE_DOMAIN. --ttl=300 --type=CNAME --zone=poetry-private-zone
gcloud dns record-sets transaction execute --zone=poetry-private-zone
```

See [PRIVATE_DNS_GUIDE.md](./PRIVATE_DNS_GUIDE.md) for complete private DNS setup.

## Next Steps

- Set up custom domain (public or private DNS)
- Configure CI/CD pipeline for automated deployments
- Configure Cloud CDN for better performance
- Set up Cloud SQL for production database
- Implement Cloud Armor for DDoS protection
- Enable Cloud Logging and Monitoring

## Support

For issues:
1. Check Cloud Build logs: `gcloud builds list`
2. Check Cloud Run logs: `npm run gcp:logs`
3. Verify environment variables are set
4. Check IAM permissions
5. Review Cloud Console for detailed metrics

## Cost Estimate

Typical monthly costs for Cloud Run:
- **Development**: $0-5/month (with free tier)
- **Small Production**: $10-30/month
- **Medium Production**: $50-200/month

Costs depend on:
- Request volume
- Memory and CPU allocation
- Network egress
- Minimum instances

Use [GCP Pricing Calculator](https://cloud.google.com/products/calculator) for detailed estimates.
