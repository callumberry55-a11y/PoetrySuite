# Stanzalink PaaS API Documentation

## Overview

Stanzalink Poetry-as-a-Service (PaaS) provides developers with powerful poetry analysis, social features, and intelligent APIs. Every API call costs points, with **1 point = £0.75**.

## Pricing Model

- **Monthly Subscription**: £35/month for unlimited API access
- **Pay-per-use**: Points charged per API call (£0.75 per point)
- **3M Point Grants**: Developers can earn up to 3 million points through mastery milestones

## Authentication

All API requests require an API key in the header:

```
X-API-Key: your_api_key_here
```

Every response includes:
```
X-Stanzalink-Points-Remaining: 1234
X-Stanzalink-Points-Charged: 5
```

---

## Hub 1: Neural Gateway

### POST /v1/neural/map
Analyzes text for emotional and thematic mapping.

**Cost**: 5 points (£3.75)

**Request**:
```json
{
  "text": "Your poem or text here",
  "options": {
    "includeEmotions": true,
    "includeThemes": true,
    "includeConnections": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "emotions": {
      "joy": { "score": 45.2, "matches": 3 },
      "love": { "score": 32.1, "matches": 2 }
    },
    "themes": {
      "nature": { "score": 60.5, "matches": 5 }
    },
    "wordCount": 87,
    "sentiment": "joy",
    "complexity": "medium"
  },
  "meta": {
    "pointsCharged": 5,
    "costGBP": 3.75,
    "textLength": 345
  }
}
```

### POST /v1/neural/scan
Security scan for code, text, or external content.

**Cost**: 10 points (£7.50)

**Request**:
```json
{
  "content": "Code or text to scan",
  "type": "code",
  "strictness": "high"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "safe": false,
    "riskScore": 45,
    "riskLevel": "medium",
    "threats": [
      {
        "type": "eval() usage detected",
        "severity": "high",
        "occurrences": 2
      }
    ],
    "warnings": [
      {
        "type": "External API call detected",
        "occurrences": 5
      }
    ]
  }
}
```

### GET /v1/neural/links
Finds semantic connections between new text and your existing archive.

**Cost**: 3 points (£2.25)

**Request**:
```json
{
  "text": "Your new poem draft"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "poemId": "abc-123",
        "poemTitle": "Summer Breeze",
        "similarityScore": 87,
        "commonThemes": ["nature", "time", "beauty"]
      }
    ],
    "totalArchiveSize": 42
  }
}
```

---

## Hub 2: Lyrical Economy

### GET /v1/economy/balance
Check your point balance and vesting status.

**Cost**: FREE

**Response**:
```json
{
  "success": true,
  "data": {
    "currentBalance": 15234.50,
    "currentBalanceGBP": 11425.88,
    "vestedPoints": 10000,
    "unvestedPoints": 5234.50,
    "totalEarned": 20000,
    "totalSpent": 4765.50,
    "activeGrants": 2,
    "vestingStatus": {
      "totalVested": 10000,
      "totalUnvested": 5234.50,
      "percentageVested": 66
    },
    "recentTransactions": [...]
  }
}
```

### POST /v1/economy/transfer
Transfer points to another developer.

**Cost**: FREE (but requires biometric auth for transfers over 1000 points)

**Request**:
```json
{
  "recipientDeveloperId": "dev-uuid",
  "amount": 500,
  "reason": "Payment for collaboration",
  "biometricToken": "required_for_large_transfers"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transferId": "transfer-uuid",
    "amount": 500,
    "amountGBP": 375.00,
    "newBalance": 14734.50,
    "timestamp": "2026-02-03T13:45:00Z"
  }
}
```

### POST /v1/economy/mint
**Admin-only endpoint** for granting points based on milestones.

**Authentication**: Requires admin API key

**Request**:
```json
{
  "developerId": "dev-uuid",
  "milestoneType": "expert",
  "amount": 500000,
  "vestingSchedule": {
    "immediate": 50000,
    "monthly": 45000,
    "duration": 10
  }
}
```

**Milestone Types**:
- `initial`: 100 points (fully vested)
- `novice`: 1,000 points (500 immediate, 100/month for 5 months)
- `intermediate`: 5,000 points
- `advanced`: 50,000 points
- `expert`: 500,000 points
- `master`: 3,000,000 points (300k immediate, 225k/month for 12 months)

---

## Hub 3: Social Infrastructure

### GET /v1/social/feed
Access public poems, contests, and challenges.

**Cost**: 2 points (£1.50)

**Query Parameters**:
- `limit`: Number of items (default: 20)
- `offset`: Pagination offset (default: 0)
- `filter`: Filter type (default: 'all')

**Response**:
```json
{
  "success": true,
  "data": {
    "poems": [...],
    "contests": [...],
    "challenges": [...]
  }
}
```

### POST /v1/social/collaborate
Create or join an "Exquisite Corpse" collaborative session.

**Cost**: 5 points (£3.75)

**Request**:
```json
{
  "sessionName": "Epic Collaboration",
  "participantDeveloperId": "optional-uuid",
  "maxParticipants": 10
}
```

### GET /v1/social/badges
Check user badges and permission levels.

**Cost**: 1 point (£0.75)

**Query Parameters**:
- `userId`: User ID to check

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "level": "expert",
    "totalBadges": 15,
    "expertBadges": 6,
    "permissions": {
      "canAccessPremiumFeatures": true,
      "canCreateContests": false,
      "maxCollaborations": 10
    }
  }
}
```

---

## Hub 4: Guard Administration

### GET /v1/guard/status
Real-time health and security monitoring.

**Cost**: FREE

**Response**:
```json
{
  "success": true,
  "data": {
    "health": {
      "status": "healthy",
      "lastChecked": "2026-02-03T14:00:00Z"
    },
    "statistics": {
      "totalRequests": 1234,
      "successfulRequests": 1200,
      "failedRequests": 34,
      "successRate": 97
    },
    "security": {
      "blockedRequests": 5,
      "criticalEvents": 0,
      "recentEvents": [...]
    },
    "rateLimits": [...],
    "endpoints": {...}
  }
}
```

### POST /v1/guard/override
**Admin-only** manual override for blocked requests.

**Authentication**: Requires admin API key

**Request**:
```json
{
  "securityEventId": "event-uuid",
  "reason": "False positive - verified safe",
  "adminUserId": "admin-uuid",
  "action": "allow"
}
```

---

## Security & Rate Limits

### Pre-Flight Checks

Every API call goes through:
1. **Identity Verification**: Google Developer OAuth
2. **Solvency Check**: £35 subscription OR sufficient points
3. **Integrity Check**: Payload size limits (prevents 2GB crashes)

### Rate Limits

Default limits per developer:
- **1,000 requests/hour**
- **10,000 requests/day**

### Biometric Requirements

Transfers over 1,000 points require:
- Android 13+ Biometric Handshake
- OR Valid Google Developer OAuth token

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Common Status Codes**:
- `401`: Missing or invalid API key
- `403`: Insufficient permissions or points
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Internal server error

---

## Database Schema

### Core Tables

1. **paas_developers**: Developer accounts
2. **paas_api_keys**: API key management
3. **paas_point_accounts**: Point balances
4. **paas_point_grants**: 3M point vesting
5. **paas_transactions**: All point movements
6. **paas_api_logs**: Usage tracking
7. **paas_security_events**: Security monitoring
8. **paas_rate_limits**: Rate limiting

---

## Admin Dashboard

Access the admin dashboard at `/paas-admin` (requires admin privileges).

**Features**:
- Developer management and verification
- Real-time API statistics
- Security event monitoring
- Transaction history
- Point grant management

---

## Getting Started

1. **Register** as a developer in the PaaS Admin
2. **Get verified** by an administrator
3. **Generate** an API key
4. **Choose** subscription (£35/month) or pay-per-use
5. **Start building** with Stanzalink APIs

For support and questions, contact the Poetry Suite team.

---

**Built with security, scalability, and poetry in mind.**
