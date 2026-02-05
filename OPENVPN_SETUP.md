# OpenVPN Setup Guide for GCP Deployment

This guide explains how to securely integrate your OpenVPN token with the Poetry Suite deployment on Google Cloud Platform.

## Overview

Your Poetry Suite app can run on GCP with secure VPN access. This setup allows:
- App deployment behind OpenVPN for private access
- Secure token storage in GCP Secret Manager
- VPC integration for private networking
- Client authentication via OpenVPN tokens

## Prerequisites

- OpenVPN server running on GCP
- OpenVPN authentication token (provided by your VPN admin)
- GCP project with billing enabled
- `gcloud` CLI installed and authenticated

## Quick Start: Store Your Token Securely

### Option 1: Automated Script (Recommended)

```bash
# Make script executable
chmod +x scripts/setup-openvpn-token.sh

# Run the setup script
./scripts/setup-openvpn-token.sh
```

The script will:
1. Enable Secret Manager API
2. Securely store your token
3. Configure IAM permissions
4. Optionally update your Cloud Run service

### Option 2: Manual Setup

```bash
# Set your project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Store the token (you'll be prompted to paste it)
echo -n "your-openvpn-token-here" | gcloud secrets create openvpn-auth-token \
    --data-file=- \
    --replication-policy="automatic"

# Grant access to Cloud Run
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding openvpn-auth-token \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Understanding Your Token

Your OpenVPN token format looks like:
```
o+BsyIXFJpN+3BYVlRu02RYNGmguyRVygY6vk/+owwE=33b79ce2d9df73a3b121eb3650dbc479756e6683
```

This is typically:
- **Part 1**: Base64-encoded pre-shared key
- **Part 2**: SHA hash for verification

This token is used for:
- Client authentication
- TLS handshake verification
- HMAC signature validation

## Integration with Cloud Run

### Update Your Deployment

Edit `cloudbuild.yaml` to include the secret:

```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'poetry-suite'
    - '--image'
    - 'gcr.io/$PROJECT_ID/poetry-suite:$COMMIT_SHA'
    - '--region'
    - '${_REGION}'
    - '--vpc-connector'
    - '${_VPC_CONNECTOR}'
    - '--set-secrets'
    - 'OPENVPN_TOKEN=openvpn-auth-token:latest'
```

### Or Update Existing Service

```bash
gcloud run services update poetry-suite \
    --region=us-central1 \
    --set-secrets=OPENVPN_TOKEN=openvpn-auth-token:latest
```

## Client Configuration

### Generate OpenVPN Client Config

If you need to generate client configurations for team members:

```bash
# SSH into your OpenVPN server
gcloud compute ssh openvpn-server --zone=us-central1-a

# Generate a new client config
cd /root
./openvpn-install.sh  # Follow prompts to add a new client

# Download the .ovpn file
gcloud compute scp openvpn-server:/root/client-name.ovpn . --zone=us-central1-a
```

### Client Setup Instructions

1. **Install OpenVPN Client**
   - Windows: [OpenVPN GUI](https://openvpn.net/client-connect-vpn-for-windows/)
   - Mac: [Tunnelblick](https://tunnelblick.net/)
   - Linux: `sudo apt install openvpn`
   - Mobile: OpenVPN Connect app

2. **Import Configuration**
   - Open OpenVPN client
   - Import the `.ovpn` file
   - Enter credentials if prompted

3. **Connect**
   - Click "Connect"
   - Verify connection in app
   - Test access to your app

## Security Best Practices

### Token Management

1. **Never commit tokens to version control**
   ```bash
   # .gitignore already includes:
   .env.gcp.local
   openvpn-token.txt
   *.ovpn
   ta.key
   ```

2. **Rotate tokens regularly**
   ```bash
   # Generate new token on OpenVPN server
   openvpn --genkey --secret ta.key

   # Update secret in GCP
   ./scripts/setup-openvpn-token.sh
   ```

3. **Limit token access**
   ```bash
   # Audit who has access
   gcloud secrets get-iam-policy openvpn-auth-token

   # Remove unnecessary permissions
   gcloud secrets remove-iam-policy-binding openvpn-auth-token \
       --member="serviceAccount:email@project.iam.gserviceaccount.com" \
       --role="roles/secretmanager.secretAccessor"
   ```

### Access Control

1. **Restrict app access to VPN users only**
   ```bash
   # Remove public access
   gcloud run services remove-iam-policy-binding poetry-suite \
       --region=us-central1 \
       --member="allUsers" \
       --role="roles/run.invoker"
   ```

2. **Use Identity-Aware Proxy (IAP)**
   ```bash
   # Enable IAP for additional security layer
   gcloud services enable iap.googleapis.com
   ```

3. **Configure firewall rules**
   ```bash
   # Run the firewall setup script
   ./scripts/setup-firewall-rules.sh
   ```

## Monitoring & Troubleshooting

### Check Token Status

```bash
# View secret metadata
gcloud secrets describe openvpn-auth-token

# List secret versions
gcloud secrets versions list openvpn-auth-token

# Access current token (careful - displays sensitive data)
gcloud secrets versions access latest --secret=openvpn-auth-token
```

### Verify VPN Connection

```bash
# Check OpenVPN server status
gcloud compute ssh openvpn-server --zone=us-central1-a
sudo systemctl status openvpn@server

# View OpenVPN logs
sudo journalctl -u openvpn@server -f

# Check connected clients
sudo cat /var/log/openvpn/status.log
```

### Test App Access

```bash
# Connect to VPN first, then:
curl https://your-app-url.run.app/health

# Check if traffic is routed through VPN
curl https://ifconfig.me  # Should show VPN IP
```

### Common Issues

**Issue: Token authentication fails**
```bash
# Verify token format
gcloud secrets versions access latest --secret=openvpn-auth-token

# Check OpenVPN server logs
sudo tail -f /var/log/openvpn/openvpn.log
```

**Issue: Cloud Run can't access secret**
```bash
# Verify IAM permissions
gcloud secrets get-iam-policy openvpn-auth-token

# Check service account
gcloud run services describe poetry-suite \
    --region=us-central1 \
    --format="value(spec.template.spec.serviceAccountName)"
```

**Issue: VPN clients can't connect**
```bash
# Check firewall rules
gcloud compute firewall-rules list --filter="name:openvpn"

# Verify OpenVPN port is open
gcloud compute ssh openvpn-server --zone=us-central1-a
sudo netstat -tulpn | grep 1194
```

## Advanced Configuration

### Multi-Factor Authentication

Add MFA to OpenVPN for extra security:

```bash
# On OpenVPN server
sudo apt install libpam-google-authenticator

# Configure OpenVPN to use PAM
echo "plugin /usr/lib/openvpn/openvpn-plugin-auth-pam.so openvpn" | \
    sudo tee -a /etc/openvpn/server.conf

# Restart OpenVPN
sudo systemctl restart openvpn@server
```

### Certificate-Based Authentication

Instead of tokens, use certificates:

```bash
# Generate client certificate
cd /etc/openvpn/easy-rsa/
./easyrsa build-client-full client1 nopass

# Package client config with cert
./scripts/openvpn-client-config.sh client1
```

### Split Tunnel Configuration

Route only specific traffic through VPN:

```bash
# Edit server config
sudo nano /etc/openvpn/server.conf

# Add specific routes instead of redirect-gateway
push "route 10.0.0.0 255.0.0.0"
push "route 172.16.0.0 255.240.0.0"
```

## Token Rotation Schedule

Recommended rotation schedule:
- **Development**: Every 90 days
- **Staging**: Every 60 days
- **Production**: Every 30 days

Automated rotation:

```bash
# Create a Cloud Scheduler job
gcloud scheduler jobs create http rotate-openvpn-token \
    --schedule="0 0 1 * *" \
    --uri="https://your-rotation-function.run.app" \
    --http-method=POST
```

## Cost Optimization

OpenVPN infrastructure costs:
- **OpenVPN Server VM**: ~$15-30/month (e2-micro to e2-small)
- **Secret Manager**: $0.06 per 10,000 access operations
- **VPC Connector**: ~$10-25/month
- **Network Egress**: Variable based on usage

Tips to reduce costs:
1. Use preemptible VMs for dev/test environments
2. Right-size your OpenVPN server
3. Enable VPC Flow Logs only when needed
4. Use committed use discounts

## Support & Resources

- **OpenVPN Docs**: https://openvpn.net/community-resources/
- **GCP Secret Manager**: https://cloud.google.com/secret-manager/docs
- **Cloud Run VPC**: https://cloud.google.com/run/docs/configuring/vpc-connectors

## Quick Reference Commands

```bash
# Store token
./scripts/setup-openvpn-token.sh

# Update Cloud Run with token
gcloud run services update poetry-suite \
    --region=us-central1 \
    --set-secrets=OPENVPN_TOKEN=openvpn-auth-token:latest

# View token (sensitive!)
gcloud secrets versions access latest --secret=openvpn-auth-token

# Rotate token
echo -n "new-token" | gcloud secrets versions add openvpn-auth-token --data-file=-

# Check VPN status
gcloud compute ssh openvpn-server --command="sudo systemctl status openvpn@server"

# View connected clients
gcloud compute ssh openvpn-server --command="sudo cat /var/log/openvpn/status.log"
```

---

**Your token is now securely stored and ready to use with your GCP deployment.**
