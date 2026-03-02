# AI Security Guard System

## Overview

The AI Security Guard is a comprehensive, real-time security monitoring system that protects the Poetry Suite application from suspicious activities, unauthorized access attempts, and security threats. The system uses AI-powered analysis to detect patterns, assess risks, and automatically block malicious activities.

## Key Features

### 1. Real-Time Monitoring
- Monitors all login attempts (successful and failed)
- Tracks user registrations
- Monitors password changes
- Detects suspicious activities
- Records logout events

### 2. AI-Powered Analysis
- Calculates risk scores (0-100) for each security event
- Generates detailed AI analysis for security events
- Detects patterns across multiple events
- Provides actionable recommendations

### 3. Automatic Threat Protection
- Automatically blocks users/IPs based on suspicious patterns
- Configurable blocking thresholds and time windows
- Temporary and permanent blocks
- IP-based and user-based blocking

### 4. Security Patterns Detection
The system monitors for these patterns:

- **Failed Login Attempts**: 5+ failed logins in 15 minutes → Auto-block
- **Rapid Registration**: 3+ registrations from same IP in 1 hour
- **Password Change Abuse**: 3+ password changes in 1 hour
- **Unusual Activity**: 10+ unusual events in 30 minutes
- **Suspicious IP**: Known malicious IPs → Immediate block

### 5. Real-Time Alerts
- Critical and high-severity events trigger alerts
- Real-time notifications via Supabase Realtime
- Alert acknowledgment system for admins
- Event severity levels: low, medium, high, critical

## Architecture

### Database Tables

#### security_guard_events
Stores all security events with AI analysis:
- Event type (login, registration, password_change, etc.)
- Severity level (low, medium, high, critical)
- Risk score (0-100)
- IP address and user agent
- AI-generated analysis
- Blocked status

#### security_guard_patterns
Defines detection patterns:
- Pattern type and threshold
- Time window for pattern detection
- Auto-block configuration
- Active/inactive status

#### security_guard_blocks
Manages blocked users and IPs:
- Block type (user, ip, email_domain)
- Block reason and duration
- Created by (ai or admin)
- Expiration timestamp

#### security_guard_alerts
Stores security alerts for admins:
- Alert type and message
- Acknowledgment status
- Link to source event

### Edge Functions

#### ai-security-monitor
The main AI security monitoring function that:
1. Receives security events from the app
2. Checks if user/IP is already blocked
3. Gathers security context (recent events, patterns)
4. Calculates risk score
5. Generates AI analysis
6. Detects suspicious patterns
7. Auto-blocks if necessary
8. Returns security decision

**Endpoint**: `POST /functions/v1/ai-security-monitor`

**Request Body**:
```json
{
  "userId": "uuid-string",
  "eventType": "login",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "additionalInfo": "value"
  }
}
```

**Response**:
```json
{
  "success": true,
  "allowed": true,
  "data": {
    "eventId": "uuid-string",
    "riskScore": 25,
    "severity": "low",
    "aiAnalysis": "NORMAL: Activity appears legitimate.",
    "blocked": false,
    "patternDetected": false,
    "recommendations": ["Continue monitoring"]
  }
}
```

### Database Functions

#### log_security_event
Logs a security event and creates alerts if needed:
```sql
SELECT log_security_event(
  p_user_id := 'uuid',
  p_event_type := 'login',
  p_severity := 'low',
  p_ip_address := '192.168.1.1',
  p_user_agent := 'Mozilla/5.0...',
  p_metadata := '{}',
  p_risk_score := 25
);
```

#### check_security_blocks
Checks if a user or IP is currently blocked:
```sql
SELECT * FROM check_security_blocks(
  p_user_id := 'uuid',
  p_ip_address := '192.168.1.1'
);
```

#### analyze_security_pattern
Detects if a suspicious pattern is occurring:
```sql
SELECT * FROM analyze_security_pattern(
  p_user_id := 'uuid',
  p_ip_address := '192.168.1.1',
  p_event_type := 'failed_login'
);
```

## Integration

### AuthContext Integration

The AuthContext automatically monitors:

1. **Login Attempts**:
   - Successful logins are logged
   - Failed logins trigger pattern detection
   - Blocked users are immediately signed out

2. **Registrations**:
   - New registrations are monitored for rapid signup patterns
   - Suspicious registrations can be blocked

3. **Session Management**:
   - Checks security status on session restore
   - Monitors logout events

### Example Usage

```typescript
import { monitorSecurityEvent } from '@/utils/securityMonitor';

// Monitor a custom security event
const result = await monitorSecurityEvent({
  userId: user.id,
  eventType: 'suspicious_activity',
  metadata: {
    action: 'unusual_api_call',
    endpoint: '/api/sensitive-data'
  }
});

if (result.blocked) {
  // User is blocked
  console.log('Action blocked:', result.reason);
}
```

## Security Dashboard

A comprehensive dashboard for monitoring security events:

### Features:
- Real-time event stream
- Statistics overview (total events, blocked, critical, last hour)
- Active alerts panel
- Event severity and risk score visualization
- AI analysis display
- IP address and timestamp tracking

### Access:
The Security Dashboard component can be added to your admin panel or settings page.

## Risk Score Calculation

The system calculates risk scores based on:

| Factor | Points | Threshold |
|--------|--------|-----------|
| Recent failed logins (>3) | +30 | High |
| Rapid registrations (>5) | +40 | Critical |
| Blocked IP address | +50 | Critical |
| High frequency activity (>10 events/15min) | +25 | Medium |
| Location change | +15 | Low |

**Risk Levels**:
- 0-25: Normal (green)
- 26-50: Low risk (yellow)
- 51-75: Moderate risk (orange)
- 76-100: High risk (red)

## AI Analysis Examples

### Normal Activity
```
NORMAL: Activity appears legitimate.
```

### Suspicious Login
```
MODERATE RISK: Some concerning patterns detected.
Multiple failed login attempts (4) detected before this successful login.
High frequency activity: 12 events in the last 15 minutes.
```

### Critical Threat
```
HIGH RISK: This activity shows multiple suspicious patterns.
Rapid registration pattern detected: 6 registrations in the last hour from this IP.
User logged in from a different geographic location than usual.
```

## Configuration

### Pattern Thresholds
Modify patterns in the database:

```sql
UPDATE security_guard_patterns
SET threshold = 10, time_window_minutes = 30
WHERE pattern_type = 'failed_login';
```

### Auto-Block Settings
Enable/disable auto-blocking:

```sql
UPDATE security_guard_patterns
SET auto_block = false
WHERE pattern_type = 'rapid_registration';
```

### Block Duration
Blocks are set to 24 hours by default. This can be modified in the edge function or when creating manual blocks.

## Monitoring & Maintenance

### View Recent Events
```sql
SELECT * FROM security_guard_events
ORDER BY created_at DESC
LIMIT 100;
```

### View Active Blocks
```sql
SELECT * FROM security_guard_blocks
WHERE blocked_until IS NULL
   OR blocked_until > now()
ORDER BY created_at DESC;
```

### View Unacknowledged Alerts
```sql
SELECT * FROM security_guard_alerts
WHERE acknowledged = false
ORDER BY created_at DESC;
```

### Clear Expired Blocks
```sql
DELETE FROM security_guard_blocks
WHERE blocked_until IS NOT NULL
  AND blocked_until < now();
```

## Best Practices

1. **Monitor Regularly**: Check the security dashboard daily for unusual patterns
2. **Review Alerts**: Acknowledge and investigate all high/critical alerts
3. **Tune Thresholds**: Adjust pattern thresholds based on your user base
4. **Keep Patterns Active**: Regularly review and update security patterns
5. **Clear Old Data**: Periodically archive old security events (30+ days)
6. **Test Patterns**: Verify pattern detection works as expected
7. **Document Changes**: Log any manual overrides or pattern modifications

## Troubleshooting

### Users Getting Blocked Incorrectly

1. Check the block reason in `security_guard_blocks`
2. Review the pattern that triggered the block
3. Manually remove the block if needed:
```sql
DELETE FROM security_guard_blocks
WHERE user_id = 'uuid';
```

### Patterns Not Triggering

1. Verify pattern is active:
```sql
SELECT * FROM security_guard_patterns
WHERE pattern_type = 'failed_login';
```

2. Check event types match exactly
3. Verify time window is appropriate

### High False Positive Rate

1. Increase pattern thresholds
2. Extend time windows
3. Disable auto-blocking for specific patterns
4. Review AI analysis for patterns

## Future Enhancements

- [ ] Geolocation-based security
- [ ] Device fingerprinting
- [ ] Machine learning model training
- [ ] Advanced threat intelligence integration
- [ ] User reputation scoring
- [ ] Behavioral biometrics
- [ ] Multi-factor authentication enforcement
- [ ] Security report generation
- [ ] Email notifications for critical events
- [ ] Integration with external security services

## API Reference

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API details.

## Support

For security-related issues or questions:
- Review this documentation
- Check the Security Dashboard for event details
- Contact system administrators for urgent issues

## Security Notice

This system is designed to protect against common threats. It should be part of a comprehensive security strategy that includes:
- Regular security audits
- Strong password policies
- Multi-factor authentication
- Network security measures
- Data encryption
- Regular backups
