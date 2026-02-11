# GCP Secrets Management Guide

This guide explains how secrets are managed in your Poetry Suite deployment on Google Cloud Platform.

## Overview

Your application uses **GCP Secret Manager** to securely store and manage sensitive configuration values like API keys and credentials. Secrets are automatically created, updated, and injected into your Cloud Run service during deployment.

## How It Works

### 1. Local Configuration

You store your actual secret values in `.env.gcp.local`:

```bash
# .env.gcp.local (never committed to git)
GCP_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
VITE_FIREBASE_API_KEY=your-firebase-key
# ... other secrets
```

### 2. Automatic Upload to Secret Manager

When you run `npm run deploy:gcp`, the deployment script:

1. Reads values from `.env.gcp.local`
2. Creates or updates secrets in GCP Secret Manager
3. Each secret is versioned (you can roll back if needed)
4. Grants necessary IAM permissions

### 3. Injection into Cloud Run

During deployment, Cloud Run automatically:

1. Fetches the latest version of each secret
2. Injects them as environment variables
3. Makes them available to your application
4. Rotates them when new versions are added

## Quick Start

### Initial Setup

```bash
# 1. Create your local config file
cp .env.gcp.local.example .env.gcp.local

# 2. Edit with your actual values
nano .env.gcp.local

# 3. Verify secrets are configured
npm run gcp:verify-secrets

# 4. Deploy (this will create secrets)
npm run deploy:gcp
```

## Verify Secrets

Check which secrets are configured:

```bash
npm run gcp:verify-secrets
```

Output example:
```
Checking required secrets...

✓ supabase-url
✓ supabase-anon-key
✓ firebase-api-key
✗ gemini-api-key (MISSING)

Found: 3 secrets
Missing: 1 required secrets
```

## Required Secrets

The following secrets must be configured:

| Secret Name | Environment Variable | Description |
|-------------|---------------------|-------------|
| `supabase-url` | `VITE_SUPABASE_URL` | Supabase project URL |
| `supabase-anon-key` | `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `firebase-api-key` | `VITE_FIREBASE_API_KEY` | Firebase API key |
| `firebase-auth-domain` | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `firebase-project-id` | `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `firebase-storage-bucket` | `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `firebase-messaging-sender-id` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `firebase-app-id` | `VITE_FIREBASE_APP_ID` | Firebase app ID |

## Optional Secrets

| Secret Name | Environment Variable | Description |
|-------------|---------------------|-------------|
| `gemini-api-key` | `VITE_GEMINI_API_KEY` | Google Gemini AI API key (for AI features) |
| `vapid-public-key` | `VITE_VAPID_PUBLIC_KEY` | VAPID public key (for push notifications) |
| `vapid-private-key` | `VAPID_PRIVATE_KEY` | VAPID private key (for push notifications) |

## Manual Secret Management

### List All Secrets

```bash
gcloud secrets list
```

### Create a New Secret

```bash
# From a value
echo "my-secret-value" | gcloud secrets create my-secret --data-file=-

# From a file
gcloud secrets create my-secret --data-file=./secret.txt
```

### Update a Secret

```bash
# Add a new version
echo "new-value" | gcloud secrets versions add my-secret --data-file=-
```

### View Secret Value

```bash
# View latest version
gcloud secrets versions access latest --secret="my-secret"

# View specific version
gcloud secrets versions access 1 --secret="my-secret"
```

### Delete a Secret

```bash
gcloud secrets delete my-secret
```

### List Secret Versions

```bash
gcloud secrets versions list my-secret
```

### Disable a Secret Version

```bash
gcloud secrets versions disable 1 --secret="my-secret"
```

## IAM Permissions

The deployment script automatically configures these permissions:

### Cloud Build Service Account

```bash
# Allows Cloud Build to access secrets during build
roles/secretmanager.secretAccessor
```

### Cloud Run Service Account

```bash
# Allows Cloud Run to access secrets at runtime
roles/secretmanager.secretAccessor
```

### Manual Permission Grant

If you need to grant permissions manually:

```bash
# Get service account emails
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
CLOUD_RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${CLOUD_RUN_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

## Updating Secrets

### During Deployment

Secrets are automatically updated when you run `npm run deploy:gcp` if values in `.env.gcp.local` have changed.

### Without Redeployment

Update a secret value without redeploying:

```bash
# Update the secret
echo "new-value" | gcloud secrets versions add my-secret --data-file=-

# Trigger Cloud Run to use new version (redeploy with same image)
gcloud run services update poetry-suite \
  --region=us-central1 \
  --update-secrets=VITE_MY_SECRET=my-secret:latest
```

## Security Best Practices

### 1. Never Commit Secrets

The `.gitignore` includes `*.local` to prevent accidental commits:

```gitignore
*.local  # Blocks .env.gcp.local
.env     # Blocks .env
```

### 2. Use Least Privilege

Only grant `secretAccessor` role to service accounts that need it.

### 3. Rotate Secrets Regularly

```bash
# Create new version
echo "new-rotated-value" | gcloud secrets versions add my-secret --data-file=-

# Disable old version after testing
gcloud secrets versions disable OLD_VERSION --secret="my-secret"
```

### 4. Audit Secret Access

```bash
# View audit logs
gcloud logging read "resource.type=secret_manager_secret" --limit=50
```

### 5. Enable Secret Versioning

Versions are automatic - you can always rollback:

```bash
# Rollback to previous version
gcloud run services update poetry-suite \
  --region=us-central1 \
  --update-secrets=VITE_MY_SECRET=my-secret:2  # Use version 2
```

## Troubleshooting

### "Permission Denied" Errors

```bash
# Check IAM bindings
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/secretmanager.secretAccessor"

# Re-grant permissions
# (Run the IAM permission commands from above)
```

### Secret Not Found

```bash
# List all secrets
gcloud secrets list

# If missing, create it
echo "value" | gcloud secrets create secret-name --data-file=-
```

### Cloud Run Can't Access Secret

```bash
# Check Cloud Run service configuration
gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="yaml(spec.template.spec.containers[].env[])"

# Verify the secret exists and has versions
gcloud secrets versions list secret-name
```

### Wrong Secret Value in Cloud Run

```bash
# Force Cloud Run to refresh secrets
gcloud run services update poetry-suite \
  --region=us-central1 \
  --update-secrets=VITE_MY_SECRET=my-secret:latest

# Or redeploy
npm run deploy:gcp
```

## Cost Considerations

Secret Manager pricing:

- **Storage**: $0.06 per secret version per month
- **Access**: $0.03 per 10,000 accesses
- **First 6 secret versions**: Free per secret
- **First 10,000 accesses**: Free per month

Typical costs for this app:
- **Development**: Free (under limits)
- **Production**: $0.50-2.00/month

[GCP Secret Manager Pricing](https://cloud.google.com/secret-manager/pricing)

## Migration from Environment Variables

If you're currently using `--set-env-vars`:

### Old Way (Not Recommended)
```bash
gcloud run services update poetry-suite \
  --set-env-vars="API_KEY=hardcoded-value"  # Visible in console!
```

### New Way (Recommended)
```bash
# Store in Secret Manager
echo "hardcoded-value" | gcloud secrets create api-key --data-file=-

# Reference in Cloud Run
gcloud run services update poetry-suite \
  --update-secrets=API_KEY=api-key:latest  # Value hidden!
```

## Backup and Recovery

### Export Secrets (for backup)

```bash
#!/bin/bash
# backup-secrets.sh
for secret in $(gcloud secrets list --format="value(name)"); do
  value=$(gcloud secrets versions access latest --secret="$secret")
  echo "$secret=$value" >> secrets-backup.txt
done
```

### Restore Secrets

```bash
# From backup file
while IFS='=' read -r key value; do
  echo "$value" | gcloud secrets create "$key" --data-file=- || \
  echo "$value" | gcloud secrets versions add "$key" --data-file=-
done < secrets-backup.txt
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud builds submit --config=cloudbuild.yaml
  env:
    GOOGLE_CLOUD_PROJECT: ${{ secrets.GCP_PROJECT_ID }}
```

Secrets are fetched automatically from Secret Manager during deployment.

## Additional Resources

- [GCP Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Run Secrets](https://cloud.google.com/run/docs/configuring/secrets)
- [IAM for Secret Manager](https://cloud.google.com/secret-manager/docs/access-control)
- [Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)

## Next Steps

1. Run `npm run gcp:verify-secrets` to check your configuration
2. Deploy with `npm run deploy:gcp`
3. Set up secret rotation schedule
4. Enable audit logging
5. Configure alerts for secret access
