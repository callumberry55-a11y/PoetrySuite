# VPN Network Configuration

Complete network configuration for Poetry Suite VPN deployment on GCP.

## Network Overview

Your VPN infrastructure uses a multi-subnet architecture for secure, isolated networking:

### WPC Allocated Subnets

**IPv4:** `100.96.0.0/11`
- Range: 100.96.0.0 - 100.127.255.255
- Total IPs: 2,097,152 addresses
- Purpose: Primary VPN client allocation pool

**IPv6:** `fd:0:0:8000::/49`
- Range: fd:0:0:8000:: - fd:0:0:ffff:ffff:ffff:ffff:ffff:ffff
- Purpose: IPv6 VPN client allocation

### Domain Routing Subnets

**IPv4:** `100.80.0.0/12`
- Range: 100.80.0.0 - 100.95.255.255
- Total IPs: 1,048,576 addresses
- Purpose: Internal routing between VPN domains

**IPv6:** `fd:0:0:4000::/50`
- Range: fd:0:0:4000:: - fd:0:0:7fff:ffff:ffff:ffff:ffff:ffff
- Purpose: IPv6 domain routing

## Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                      HTTPS/TLS
                           │
              ┌────────────▼────────────┐
              │  Cloud Load Balancer    │
              └────────────┬────────────┘
                           │
                  ┌────────▼────────┐
                  │   Cloud Run     │
                  │ (Poetry Suite)  │
                  └────────┬────────┘
                           │
                    VPC Connector
                           │
        ┌──────────────────▼──────────────────┐
        │         GCP VPC Network             │
        │  Subnet: 10.8.0.0/28                │
        └──────────────┬──────────────────────┘
                       │
                       │
        ┌──────────────▼──────────────────────┐
        │       OpenVPN Server                │
        │  OpenVPN Subnet: 10.8.0.0/24        │
        │  Port: 1194 (UDP)                   │
        │  Token Auth: Enabled                │
        └──────────────┬──────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼────┐                 ┌────▼────┐
    │  WPC    │                 │ Domain  │
    │ Subnet  │                 │ Routing │
    │         │                 │ Subnet  │
    └─────────┘                 └─────────┘
    100.96.0.0/11               100.80.0.0/12
    fd:0:0:8000::/49            fd:0:0:4000::/50
         │                           │
    ┌────▼────────────────────────────▼────┐
    │      VPN Clients & Services          │
    │  - Developer Workstations            │
    │  - CI/CD Pipelines                   │
    │  - Internal Services                 │
    │  - Database Access                   │
    └──────────────────────────────────────┘
```

## Subnet Purposes

### 1. VPC Connector Subnet (10.8.0.0/28)
- **Size**: 16 addresses (14 usable)
- **Purpose**: GCP VPC Connector internal IPs
- **Usage**: Bridge between Cloud Run and VPC
- **Access**: Google-managed, no direct access

### 2. OpenVPN Server Subnet (10.8.0.0/24)
- **Size**: 256 addresses (254 usable)
- **Purpose**: OpenVPN server and initial client pool
- **Usage**: Traditional OpenVPN client connections
- **Gateway**: 10.8.0.1 (OpenVPN server)

### 3. WPC Allocated Subnet (100.96.0.0/11)
- **Size**: 2+ million addresses
- **Purpose**: Large-scale VPN client allocation
- **Usage**: Primary client IP pool for WPC
- **Use Case**: Scalable VPN deployment

### 4. Domain Routing Subnet (100.80.0.0/12)
- **Size**: 1+ million addresses
- **Purpose**: Inter-domain VPN routing
- **Usage**: Route between different VPN networks
- **Use Case**: Multi-site VPN connectivity

## IP Allocation Strategy

### Cloud Run → VPC → OpenVPN Flow

```
Cloud Run Instance
  ↓ (gets ephemeral IP)
VPC Connector (10.8.0.0/28)
  ↓ (routes to)
OpenVPN Server (10.8.0.1)
  ↓ (assigns client IP from)
WPC Pool (100.96.0.0/11)
  ↓ (can route to)
Domain Subnets (100.80.0.0/12)
```

### Client Connection Flow

```
VPN Client
  ↓ (connects to)
OpenVPN Server (public IP:1194)
  ↓ (authenticates with token)
Token Verification
  ↓ (assigns IP from)
WPC Pool (100.96.x.x)
  ↓ (enables routing to)
- GCP Resources (10.8.0.0/28)
- Other VPN Clients (100.96.0.0/11)
- Domain Networks (100.80.0.0/12)
```

## Firewall Rules

### Required GCP Firewall Rules

```bash
# Allow OpenVPN UDP traffic
gcloud compute firewall-rules create allow-openvpn \
  --network=default \
  --allow=udp:1194 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=openvpn-server \
  --description="Allow OpenVPN connections"

# Allow traffic from VPC Connector
gcloud compute firewall-rules create allow-vpc-connector \
  --network=default \
  --allow=tcp,udp,icmp \
  --source-ranges=10.8.0.0/28 \
  --description="Allow VPC Connector traffic"

# Allow traffic within WPC subnet
gcloud compute firewall-rules create allow-wpc-subnet \
  --network=default \
  --allow=tcp,udp,icmp \
  --source-ranges=100.96.0.0/11,fd:0:0:8000::/49 \
  --description="Allow WPC subnet internal traffic"

# Allow traffic within domain routing subnet
gcloud compute firewall-rules create allow-domain-routing \
  --network=default \
  --allow=tcp,udp,icmp \
  --source-ranges=100.80.0.0/12,fd:0:0:4000::/50 \
  --description="Allow domain routing traffic"

# Allow SSH for management
gcloud compute firewall-rules create allow-ssh \
  --network=default \
  --allow=tcp:22 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=openvpn-server \
  --description="Allow SSH for server management"
```

### OpenVPN Server iptables Rules

```bash
# Enable IP forwarding
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# NAT for IPv4 WPC subnet
sudo iptables -t nat -A POSTROUTING -s 100.96.0.0/11 -o eth0 -j MASQUERADE

# NAT for IPv4 domain routing subnet
sudo iptables -t nat -A POSTROUTING -s 100.80.0.0/12 -o eth0 -j MASQUERADE

# NAT for traditional OpenVPN subnet
sudo iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE

# Allow forwarding between subnets
sudo iptables -A FORWARD -s 100.96.0.0/11 -j ACCEPT
sudo iptables -A FORWARD -d 100.96.0.0/11 -j ACCEPT
sudo iptables -A FORWARD -s 100.80.0.0/12 -j ACCEPT
sudo iptables -A FORWARD -d 100.80.0.0/12 -j ACCEPT

# Save rules
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# IPv6 rules (if using)
sudo ip6tables -t nat -A POSTROUTING -s fd:0:0:8000::/49 -o eth0 -j MASQUERADE
sudo ip6tables -t nat -A POSTROUTING -s fd:0:0:4000::/50 -o eth0 -j MASQUERADE
sudo ip6tables-save | sudo tee /etc/iptables/rules.v6
```

## OpenVPN Server Configuration

### Update /etc/openvpn/server.conf

Add these subnet configurations:

```conf
# Basic settings
port 1194
proto udp
dev tun
topology subnet

# Certificates and keys
ca ca.crt
cert server.crt
key server.key
dh dh.pem
tls-auth ta.key 0

# Network configuration
server 10.8.0.0 255.255.255.0

# Push routes to clients
push "route 10.8.0.0 255.255.255.240"     # VPC Connector
push "route 100.96.0.0 255.224.0.0"       # WPC subnet (/11)
push "route 100.80.0.0 255.240.0.0"       # Domain routing (/12)

# IPv6 configuration (optional)
server-ipv6 fd:0:0:8000::/49
push "route-ipv6 fd:0:0:4000::/50"

# Client IP pool from WPC subnet
ifconfig-pool 100.96.0.100 100.96.255.254 255.224.0.0

# Performance settings
keepalive 10 120
cipher AES-256-GCM
user nobody
group nogroup
persist-key
persist-tun

# Logging
status /var/log/openvpn/openvpn-status.log
log-append /var/log/openvpn/openvpn.log
verb 3
```

## Route Configuration

### Cloud Run Routes

Traffic from Cloud Run is automatically routed through the VPC Connector:

```bash
# Configure VPC Connector egress
gcloud run services update poetry-suite \
  --region=us-central1 \
  --vpc-connector=poetry-vpc-connector \
  --vpc-egress=all-traffic
```

### GCP Routes

Create custom routes for WPC subnets:

```bash
# Route WPC traffic through OpenVPN server
gcloud compute routes create route-to-wpc \
  --network=default \
  --destination-range=100.96.0.0/11 \
  --next-hop-instance=openvpn-server \
  --next-hop-instance-zone=us-central1-a \
  --priority=1000

# Route domain traffic through OpenVPN server
gcloud compute routes create route-to-domain \
  --network=default \
  --destination-range=100.80.0.0/12 \
  --next-hop-instance=openvpn-server \
  --next-hop-instance-zone=us-central1-a \
  --priority=1000

# IPv6 routes (if using)
gcloud compute routes create route-to-wpc-ipv6 \
  --network=default \
  --destination-range=fd:0:0:8000::/49 \
  --next-hop-instance=openvpn-server \
  --next-hop-instance-zone=us-central1-a \
  --priority=1000

gcloud compute routes create route-to-domain-ipv6 \
  --network=default \
  --destination-range=fd:0:0:4000::/50 \
  --next-hop-instance=openvpn-server \
  --next-hop-instance-zone=us-central1-a \
  --priority=1000
```

## Testing Network Configuration

### Test VPC Connectivity

```bash
# From Cloud Run, test VPC Connector
curl http://10.8.0.1  # Should reach OpenVPN server

# Test WPC subnet reachability
ping -c 3 100.96.0.1

# Test domain subnet reachability
ping -c 3 100.80.0.1
```

### Test VPN Client Connectivity

```bash
# Connect to VPN first, then:

# Check assigned IP
ip addr show tun0
# Should show IP from 100.96.0.0/11

# Test routing to VPC
ping 10.8.0.1

# Test routing to other clients
ping 100.96.x.x

# Test routing to domain networks
ping 100.80.x.x

# Check routing table
ip route show
```

### Test Cross-Subnet Communication

```bash
# From Cloud Run to WPC client
curl http://100.96.0.100:8080

# From WPC client to Cloud Run (via VPC)
curl http://10.8.0.5:8080

# Between WPC clients
ssh user@100.96.0.200

# To domain network
ssh user@100.80.0.50
```

## Monitoring

### Track VPN Connections

```bash
# View connected clients
sudo cat /var/log/openvpn/openvpn-status.log

# Monitor real-time connections
sudo tail -f /var/log/openvpn/openvpn.log

# Check IP allocations
sudo grep "MULTI" /var/log/openvpn/openvpn.log
```

### Monitor Network Traffic

```bash
# Install monitoring tools
sudo apt install -y iftop nethogs

# Monitor interface traffic
sudo iftop -i tun0

# Monitor per-process bandwidth
sudo nethogs tun0

# Check connection stats
sudo netstat -an | grep 1194
```

### GCP Monitoring

```bash
# View VPC flow logs
gcloud logging read "resource.type=gce_subnetwork" \
  --limit=50 \
  --format=json

# Monitor firewall hits
gcloud logging read "resource.type=gce_firewall_rule" \
  --limit=50

# Check Cloud Run connectivity
gcloud run services logs read poetry-suite \
  --region=us-central1 \
  --limit=100
```

## Troubleshooting

### Cannot Reach WPC Subnet

```bash
# Check OpenVPN server routing
sudo ip route show | grep 100.96

# Verify iptables rules
sudo iptables -t nat -L -n -v | grep 100.96

# Test from OpenVPN server
ping -c 3 100.96.0.100

# Check OpenVPN config
sudo grep "push.*100.96" /etc/openvpn/server.conf
```

### Domain Routing Issues

```bash
# Verify routes are pushed to clients
sudo grep "route" /etc/openvpn/server.conf

# Check client received routes
ip route show | grep 100.80

# Test connectivity
traceroute -n 100.80.0.1

# Check firewall rules
gcloud compute firewall-rules list --filter="sourceRanges:(100.80.0.0/12)"
```

### VPC Connector Issues

```bash
# Check connector status
gcloud compute networks vpc-access connectors describe poetry-vpc-connector \
  --region=us-central1

# Verify subnet allocation
gcloud compute networks subnets list \
  --filter="name:poetry-vpc-connector"

# Test from Cloud Run
gcloud run services describe poetry-suite \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

## Security Considerations

### Network Isolation

- WPC subnet is isolated from public internet
- All traffic routed through OpenVPN server
- Token authentication required for all connections
- Firewall rules restrict unauthorized access

### Best Practices

1. **Use smallest necessary subnets** for production
2. **Enable VPC Flow Logs** for audit trails
3. **Implement network segmentation** between environments
4. **Rotate tokens regularly** (30-90 days)
5. **Monitor for unusual traffic patterns**
6. **Use private Google Access** for GCP services
7. **Enable Cloud Armor** for DDoS protection
8. **Implement least privilege** firewall rules

## Cost Optimization

### Network Costs

- **VPC Connector**: ~$10-25/month (based on throughput)
- **External IP**: ~$3/month for OpenVPN server
- **Network Egress**: Variable (first 1GB free/month)
- **Firewall Rules**: Free (up to 100 rules)

### Optimization Tips

```bash
# Use internal IPs where possible
gcloud compute instances create ... --no-address

# Enable VPC Flow Logs sampling
gcloud compute networks subnets update ... \
  --enable-flow-logs \
  --logging-aggregation-interval=interval-5-sec \
  --logging-flow-sampling=0.1

# Use regional endpoints
gcloud config set compute/region us-central1
```

## Environment-Specific Configuration

### Development

```bash
# Smaller subnets for dev
WPC_SUBNET_IPV4=100.96.0.0/16  # 65k IPs
WPC_ROUTING_SUBNET_IPV4=100.80.0.0/16  # 65k IPs
```

### Staging

```bash
# Medium subnets for staging
WPC_SUBNET_IPV4=100.96.0.0/14  # 262k IPs
WPC_ROUTING_SUBNET_IPV4=100.80.0.0/14  # 262k IPs
```

### Production

```bash
# Full subnets for production
WPC_SUBNET_IPV4=100.96.0.0/11  # 2M IPs
WPC_ROUTING_SUBNET_IPV4=100.80.0.0/12  # 1M IPs
```

## Quick Reference

### Subnet Summary

| Subnet Type | IPv4 Range | IPv6 Range | Purpose | Size |
|-------------|------------|------------|---------|------|
| VPC Connector | 10.8.0.0/28 | - | GCP VPC Bridge | 16 IPs |
| OpenVPN | 10.8.0.0/24 | - | VPN Server | 256 IPs |
| WPC Allocated | 100.96.0.0/11 | fd:0:0:8000::/49 | Client Pool | 2M+ IPs |
| Domain Routing | 100.80.0.0/12 | fd:0:0:4000::/50 | Inter-domain | 1M+ IPs |

### Key Commands

```bash
# Setup VPN token
npm run gcp:setup-openvpn

# Configure firewall
./scripts/setup-firewall-rules.sh

# Deploy application
npm run deploy:gcp

# Test connectivity
ping 100.96.0.1

# View logs
npm run gcp:logs
```

---

**Your VPN network is configured and ready for secure, scalable deployment.**
