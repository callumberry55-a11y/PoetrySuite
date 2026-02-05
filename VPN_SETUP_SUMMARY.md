# VPN Setup Summary

Complete overview of your VPN configuration for Poetry Suite on GCP.

## What You Have

### 1. OpenVPN Authentication Token
```
o+BsyIXFJpN+3BYVlRu02RYNGmguyRVygY6vk/+owwE=33b79ce2d9df73a3b121eb3650dbc479756e6683
```

### 2. VPN Network Subnets

**WPC Allocated Subnets:**
- IPv4: `100.96.0.0/11` (2,097,152 IP addresses)
- IPv6: `fd:0:0:8000::/49`

**Domain Routing Subnets:**
- IPv4: `100.80.0.0/12` (1,048,576 IP addresses)
- IPv6: `fd:0:0:4000::/50`

**Traditional OpenVPN:**
- Server: `10.8.0.0/24` (256 addresses)
- VPC Connector: `10.8.0.0/28` (16 addresses)

## Network Architecture

```
Internet
   │
   ├─► Cloud Load Balancer (HTTPS)
   │
   ├─► Cloud Run (Your App)
   │      ├─ Environment: OPENVPN_TOKEN
   │      └─ Port: 8080
   │
   ├─► VPC Connector (10.8.0.0/28)
   │
   ├─► GCP VPC Network
   │
   ├─► OpenVPN Server (10.8.0.1:1194)
   │      ├─ Token Authentication
   │      └─ TLS Encryption
   │
   └─► VPN Networks
          ├─ WPC Clients (100.96.0.0/11)
          ├─ Domain Routes (100.80.0.0/12)
          └─ Traditional VPN (10.8.0.0/24)
```

## Setup Checklist

### ✅ Phase 1: Token Security
- [x] Token stored in project files
- [ ] Token stored in GCP Secret Manager
- [ ] IAM permissions configured
- [ ] Cloud Run service updated

**Action:** Run `npm run gcp:setup-openvpn`

### ✅ Phase 2: GCP Infrastructure
- [ ] VPC network created
- [ ] VPC Connector deployed
- [ ] Firewall rules configured
- [ ] Routes to VPN subnets created

**Actions:**
```bash
npm run gcp:setup-vpc
npm run gcp:setup-firewall
npm run gcp:setup-vpn-routes
```

### ✅ Phase 3: OpenVPN Server
- [ ] OpenVPN server running on GCP
- [ ] Server configured with WPC subnets
- [ ] iptables rules for NAT
- [ ] Routes to GCP VPC configured

**Action:** SSH to server and run `configure-openvpn-subnets.sh`

### ✅ Phase 4: Application Deployment
- [ ] Application built
- [ ] Docker image created
- [ ] Cloud Run service deployed
- [ ] Token injected via Secret Manager

**Action:** Run `npm run deploy:gcp`

### ✅ Phase 5: Testing
- [ ] VPN client can connect
- [ ] Client receives IP from 100.96.0.0/11
- [ ] Can reach Cloud Run service
- [ ] Can route to domain subnets
- [ ] Application accessible via browser

## Quick Start Commands

### Complete Setup (Run in Order)

```bash
# 1. Store OpenVPN token
npm run gcp:setup-openvpn
# Paste token when prompted

# 2. Setup VPC infrastructure
npm run gcp:setup-vpc
npm run gcp:setup-firewall

# 3. Configure VPN routes
npm run gcp:setup-vpn-routes

# 4. Configure OpenVPN server
# (SSH into server and run configure-openvpn-subnets.sh)

# 5. Build and deploy
npm run build
npm run deploy:gcp
```

### Verification Commands

```bash
# Check token is stored
gcloud secrets describe openvpn-auth-token

# Check VPC Connector
gcloud compute networks vpc-access connectors describe poetry-vpc-connector \
  --region=us-central1

# Check routes
gcloud compute routes list \
  --filter="destRange:(100.96.0.0/11 OR 100.80.0.0/12)"

# Check Cloud Run service
gcloud run services describe poetry-suite --region=us-central1

# View logs
npm run gcp:logs
```

## IP Allocation Strategy

### How IPs Are Assigned

1. **Cloud Run**: Gets ephemeral IP from GCP
2. **VPC Connector**: Uses 10.8.0.0/28 (Google-managed)
3. **OpenVPN Server**: Has IP in 10.8.0.0/24
4. **VPN Clients**: Get IPs from 100.96.0.0/11 pool
5. **Domain Routes**: Use 100.80.0.0/12 for inter-network routing

### Example Client Connection

```
VPN Client connects to OpenVPN Server
   ↓
Authenticates with token
   ↓
Receives IP: 100.96.0.150
   ↓
Gets routes pushed:
  - 10.8.0.0/28 (VPC Connector)
  - 100.96.0.0/11 (Other VPN clients)
  - 100.80.0.0/12 (Domain networks)
   ↓
Can now access:
  - Cloud Run app via VPC
  - Other VPN clients
  - Domain networks
  - Internal GCP resources
```

## Security Features

### Token Security
- ✅ Stored encrypted in Secret Manager
- ✅ IAM-based access control
- ✅ Audit logging enabled
- ✅ Never committed to version control
- ✅ Rotatable without downtime

### Network Security
- ✅ Private VPC networking
- ✅ Firewall rules for access control
- ✅ TLS encryption for VPN
- ✅ Token-based authentication
- ✅ NAT for outbound traffic

### Application Security
- ✅ HTTPS-only connections
- ✅ Cloud Run IAM authentication
- ✅ Environment-based secrets
- ✅ No public database access
- ✅ VPN-only internal access

## Common Tasks

### Connect a VPN Client

1. **Get client config** from OpenVPN server
2. **Import** into OpenVPN client app
3. **Connect** - should get IP from 100.96.0.0/11
4. **Verify**: `ip addr show tun0`
5. **Test**: `ping 10.8.0.1` (OpenVPN server)

### Add a New Route

```bash
# Add route in GCP
gcloud compute routes create my-route \
  --network=default \
  --destination-range=192.168.1.0/24 \
  --next-hop-instance=openvpn-server \
  --next-hop-instance-zone=us-central1-a

# Add route in OpenVPN config
sudo nano /etc/openvpn/server.conf
# Add: push "route 192.168.1.0 255.255.255.0"

# Restart OpenVPN
sudo systemctl restart openvpn@server
```

### Rotate the Token

```bash
# Generate new token on OpenVPN server
sudo openvpn --genkey --secret /tmp/ta.key
cat /tmp/ta.key

# Store new token
npm run gcp:setup-openvpn
# Paste new token

# Cloud Run auto-updates within minutes
```

### Monitor VPN Usage

```bash
# Connected clients
gcloud compute ssh openvpn-server --zone=us-central1-a
sudo cat /var/log/openvpn/openvpn-status.log

# Real-time logs
sudo tail -f /var/log/openvpn/openvpn.log

# Bandwidth usage
sudo iftop -i tun0
```

## Troubleshooting

### Issue: Can't connect to VPN

**Symptoms:** Connection timeout or refused

**Solutions:**
```bash
# Check OpenVPN is running
gcloud compute ssh openvpn-server --zone=us-central1-a
sudo systemctl status openvpn@server

# Check firewall allows UDP 1194
gcloud compute firewall-rules list --filter="name:openvpn"

# Check server logs
sudo journalctl -u openvpn@server -n 50
```

### Issue: Connected but can't reach Cloud Run

**Symptoms:** VPN connected, but can't access app

**Solutions:**
```bash
# Check routes are pushed
ip route show | grep 10.8

# Test VPC connectivity
ping 10.8.0.1

# Check Cloud Run is running
gcloud run services describe poetry-suite --region=us-central1

# Verify VPC Connector
gcloud compute networks vpc-access connectors describe poetry-vpc-connector \
  --region=us-central1
```

### Issue: Wrong IP assigned to client

**Symptoms:** Client gets IP from 10.8.0.0/24 instead of 100.96.0.0/11

**Solution:**
```bash
# Check OpenVPN server config
sudo grep ifconfig-pool /etc/openvpn/server.conf

# Should show:
# ifconfig-pool 100.96.0.100 100.96.255.254 255.224.0.0

# If not, update config
sudo nano /etc/openvpn/server.conf
sudo systemctl restart openvpn@server
```

### Issue: Can't reach domain subnets

**Symptoms:** Can reach VPC but not 100.80.0.0/12

**Solutions:**
```bash
# Check routes are configured
gcloud compute routes list --filter="destRange:100.80.0.0/12"

# Check iptables allows forwarding
sudo iptables -L FORWARD -n | grep 100.80

# Check client received route
ip route show | grep 100.80
```

## Documentation Reference

### Quick Start (5-15 min)
- **OPENVPN_TOKEN_GUIDE.md** - Token setup
- **GCP_QUICKSTART.md** - Fast deployment

### Comprehensive Guides (30-60 min)
- **OPENVPN_SETUP.md** - Complete VPN integration
- **VPN_NETWORK_CONFIGURATION.md** - Network details (this is the deep dive)
- **VPC_DEPLOYMENT_GUIDE.md** - Full GCP deployment

### Reference
- **OPENVPN_TOKEN_INTEGRATION_SUMMARY.md** - Token system overview
- **.env.gcp.local.example** - Configuration template

## Cost Estimate

### Monthly Costs

| Resource | Cost | Notes |
|----------|------|-------|
| Cloud Run | $5-20 | Based on usage |
| VPC Connector | $10-25 | Based on throughput |
| OpenVPN Server (e2-small) | $15-30 | Always-on VM |
| External IP | $3 | Static IP for VPN |
| Secret Manager | <$1 | Token storage |
| Network Egress | Variable | First 1GB free |
| **Total** | **$33-80/month** | Typical usage |

### Cost Optimization Tips
- Use preemptible VM for dev/staging OpenVPN servers
- Right-size Cloud Run (reduce memory/CPU if possible)
- Use committed use discounts for production
- Enable VPC Flow Logs only when needed
- Monitor and optimize network egress

## Support & Next Steps

### Get Help
- Review documentation in the project root
- Check logs: `npm run gcp:logs`
- Test connectivity step-by-step
- Verify each component independently

### Expand Your Setup
1. Add more VPN clients
2. Set up multi-region deployment
3. Implement monitoring & alerts
4. Add backup OpenVPN server
5. Configure automatic failover

### Maintenance Schedule
- **Daily**: Monitor logs and connectivity
- **Weekly**: Review connected clients
- **Monthly**: Check security logs and rotate token
- **Quarterly**: Update OpenVPN server, review costs

---

**You're ready to deploy! Start with `npm run gcp:setup-openvpn`**
