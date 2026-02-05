# OpenVPN Token Integration - Quick Guide

Your OpenVPN authentication token has been prepared for secure integration with your GCP deployment.

## Your Token

Format: `o+BsyIXFJpN+3BYVlRu02RYNGmguyRVygY6vk/+owwE=33b79ce2d9df73a3b121eb3650dbc479756e6683`

This token will be securely stored in GCP Secret Manager and made available to your Cloud Run service.

## Quick Setup (3 Steps)

### Step 1: Store Token Securely

```bash
npm run gcp:setup-openvpn
```

When prompted, paste your token:
```
o+BsyIXFJpN+3BYVlRu02RYNGmguyRVygY6vk/+owwE=33b79ce2d9df73a3b121eb3650dbc479756e6683
```

### Step 2: Deploy Your App

```bash
npm run deploy:gcp
```

The token is automatically included in the deployment via `cloudbuild.yaml`.

### Step 3: Verify

```bash
# Check that the secret is available
gcloud secrets describe openvpn-auth-token

# Verify Cloud Run can access it
gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

## What Happens Behind the Scenes

1. **Token Storage**
   - Token is stored in GCP Secret Manager
   - Encrypted at rest and in transit
   - Access controlled via IAM

2. **Cloud Run Integration**
   - Token exposed as `OPENVPN_TOKEN` environment variable
   - Only accessible to your Cloud Run service
   - Automatically rotatable without code changes

3. **VPC Integration**
   - Cloud Run connects to VPC via connector
   - VPC routes traffic to OpenVPN server
   - Token used for authentication

## Security Features

✅ Token never committed to version control (`.gitignore` configured)
✅ Stored in GCP Secret Manager with encryption
✅ IAM-based access control
✅ Audit logging enabled
✅ Rotation supported without downtime

## Common Commands

```bash
# Store/update token
npm run gcp:setup-openvpn

# Deploy with token
npm run deploy:gcp

# View token (requires permissions)
gcloud secrets versions access latest --secret=openvpn-auth-token

# Rotate token
echo -n "new-token-here" | gcloud secrets versions add openvpn-auth-token --data-file=-

# Check secret metadata
gcloud secrets describe openvpn-auth-token

# Audit access logs
gcloud logging read "resource.type=secretmanager.googleapis.com/Secret" --limit=50
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTPS/TLS
                         │
            ┌────────────▼────────────┐
            │   Cloud Load Balancer   │
            └────────────┬────────────┘
                         │
                ┌────────▼───────┐
                │   Cloud Run    │
                │  (Your App)    │
                │                │
                │  Environment:  │
                │  OPENVPN_TOKEN │ ◄─── From Secret Manager
                └────────┬───────┘
                         │
                   VPC Connector
                         │
            ┌────────────▼────────────┐
            │      VPC Network        │
            │                         │
            │  ┌──────────────────┐   │
            │  │  OpenVPN Server  │   │
            │  │  Authenticates   │   │
            │  │  using Token     │   │
            │  └──────────────────┘   │
            │                         │
            │  Private Resources:     │
            │  - Databases            │
            │  - Internal APIs        │
            │  - Other Services       │
            └─────────────────────────┘
```

## Token Types Supported

### 1. Static Key (ta.key)
Used for TLS authentication. Your token format suggests this type.

### 2. Authentication Token
Used for client/server verification.

### 3. HMAC Signature
Used for packet authentication.

## Using the Token in Your App

If your application code needs to access the token:

```typescript
// The token is available as an environment variable
const openvpnToken = process.env.OPENVPN_TOKEN;

// Use it for VPN authentication or verification
if (openvpnToken) {
  console.log('OpenVPN token configured');
  // Your VPN integration logic here
}
```

## Troubleshooting

### Token Not Found

```bash
# Error: Secret not found
# Solution: Run setup script
npm run gcp:setup-openvpn
```

### Permission Denied

```bash
# Error: Permission denied accessing secret
# Solution: Grant access to service account
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding openvpn-auth-token \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Token Authentication Fails

```bash
# Check token format
gcloud secrets versions access latest --secret=openvpn-auth-token

# Should output exactly:
# o+BsyIXFJpN+3BYVlRu02RYNGmguyRVygY6vk/+owwE=33b79ce2d9df73a3b121eb3650dbc479756e6683

# No extra spaces or newlines
```

### Cloud Run Can't Access Secret

```bash
# Verify secret is configured
gcloud run services describe poetry-suite \
    --region=us-central1 \
    --format="yaml(spec.template.spec.containers[0].env)"

# Should show:
# - name: OPENVPN_TOKEN
#   valueFrom:
#     secretKeyRef:
#       key: latest
#       name: openvpn-auth-token
```

## Token Rotation

Rotate your token every 30-90 days:

```bash
# 1. Generate new token on OpenVPN server
gcloud compute ssh openvpn-server --zone=us-central1-a
sudo openvpn --genkey --secret /tmp/ta.key
cat /tmp/ta.key
# Copy the new token

# 2. Update in Secret Manager
npm run gcp:setup-openvpn
# Paste the new token when prompted

# 3. Cloud Run automatically picks up new version
# No redeployment needed!
```

## Cost

Secret Manager pricing:
- **Storage**: $0.06 per secret per month
- **Access**: $0.03 per 10,000 accesses
- **Typical cost**: < $1/month

## Best Practices

1. ✅ Rotate tokens regularly (30-90 days)
2. ✅ Never log or print token values
3. ✅ Use different tokens for dev/staging/prod
4. ✅ Audit secret access regularly
5. ✅ Enable Secret Manager notifications
6. ✅ Test token rotation process

## Next Steps

1. **Store your token**: `npm run gcp:setup-openvpn`
2. **Deploy your app**: `npm run deploy:gcp`
3. **Configure VPN clients**: See `OPENVPN_SETUP.md`
4. **Set up monitoring**: Configure alerts for failed authentications
5. **Plan rotation**: Schedule regular token updates

## Additional Resources

- **Comprehensive Guide**: [OPENVPN_SETUP.md](./OPENVPN_SETUP.md)
- **GCP Deployment**: [GCP_QUICKSTART.md](./GCP_QUICKSTART.md)
- **VPC Setup**: [VPC_DEPLOYMENT_GUIDE.md](./VPC_DEPLOYMENT_GUIDE.md)

---

**Your token is ready to use. Run `npm run gcp:setup-openvpn` to get started.**
