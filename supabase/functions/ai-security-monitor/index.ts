import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SecurityEvent {
  userId?: string;
  eventType: 'login' | 'registration' | 'password_change' | 'logout' | 'suspicious_activity';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

function calculateRiskScore(event: SecurityEvent, context: any): number {
  let score = 0;

  // Check for suspicious patterns
  if (event.eventType === 'login' && context.recentFailedLogins > 3) {
    score += 30;
  }

  if (event.eventType === 'registration' && context.recentRegistrations > 5) {
    score += 40;
  }

  // Check IP reputation (simplified)
  if (context.blockedIPs?.includes(event.ipAddress)) {
    score += 50;
  }

  // Check for rapid requests
  if (context.recentEventsCount > 10) {
    score += 25;
  }

  // Check for unusual location changes
  if (context.locationChanged) {
    score += 15;
  }

  return Math.min(score, 100);
}

function generateAIAnalysis(event: SecurityEvent, riskScore: number, context: any): string {
  const analyses = [];

  if (riskScore > 75) {
    analyses.push("HIGH RISK: This activity shows multiple suspicious patterns.");
  } else if (riskScore > 50) {
    analyses.push("MODERATE RISK: Some concerning patterns detected.");
  } else if (riskScore > 25) {
    analyses.push("LOW RISK: Minor anomalies detected.");
  } else {
    analyses.push("NORMAL: Activity appears legitimate.");
  }

  if (event.eventType === 'login' && context.recentFailedLogins > 3) {
    analyses.push(`Multiple failed login attempts (${context.recentFailedLogins}) detected before this successful login.`);
  }

  if (event.eventType === 'registration' && context.recentRegistrations > 3) {
    analyses.push(`Rapid registration pattern detected: ${context.recentRegistrations} registrations in the last hour from this IP.`);
  }

  if (context.locationChanged) {
    analyses.push("User logged in from a different geographic location than usual.");
  }

  if (context.recentEventsCount > 10) {
    analyses.push(`High frequency activity: ${context.recentEventsCount} events in the last 15 minutes.`);
  }

  return analyses.join(" ");
}

async function getSecurityContext(supabase: any, userId?: string, ipAddress?: string) {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Get recent events for this user/IP
  const { data: recentEvents } = await supabase
    .from('security_guard_events')
    .select('*')
    .or(`user_id.eq.${userId},ip_address.eq.${ipAddress}`)
    .gte('created_at', fifteenMinutesAgo);

  // Get recent failed logins
  const { data: failedLogins } = await supabase
    .from('security_guard_events')
    .select('id')
    .eq('event_type', 'failed_login')
    .or(`user_id.eq.${userId},ip_address.eq.${ipAddress}`)
    .gte('created_at', fifteenMinutesAgo);

  // Get recent registrations from this IP
  const { data: recentRegistrations } = await supabase
    .from('security_guard_events')
    .select('id')
    .eq('event_type', 'registration')
    .eq('ip_address', ipAddress)
    .gte('created_at', oneHourAgo);

  // Check if IP is blocked
  const { data: blockedIPs } = await supabase
    .from('security_guard_blocks')
    .select('ip_address')
    .eq('block_type', 'ip')
    .or(`blocked_until.is.null,blocked_until.gt.${new Date().toISOString()}`);

  return {
    recentEventsCount: recentEvents?.length || 0,
    recentFailedLogins: failedLogins?.length || 0,
    recentRegistrations: recentRegistrations?.length || 0,
    blockedIPs: blockedIPs?.map(b => b.ip_address) || [],
    locationChanged: false // Can be enhanced with geolocation
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event: SecurityEvent = await req.json();

    if (!event.eventType) {
      return new Response(
        JSON.stringify({ error: 'eventType is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user/IP is already blocked
    const { data: blockCheck } = await supabase
      .rpc('check_security_blocks', {
        p_user_id: event.userId || null,
        p_ip_address: event.ipAddress || null
      });

    if (blockCheck && blockCheck.length > 0 && blockCheck[0].is_blocked) {
      return new Response(
        JSON.stringify({
          success: false,
          blocked: true,
          reason: blockCheck[0].block_reason,
          blockedUntil: blockCheck[0].blocked_until
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get security context
    const context = await getSecurityContext(supabase, event.userId, event.ipAddress);

    // Calculate risk score
    const riskScore = calculateRiskScore(event, context);

    // Generate AI analysis
    const aiAnalysis = generateAIAnalysis(event, riskScore, context);

    // Determine severity
    let severity = 'low';
    if (riskScore > 75) severity = 'critical';
    else if (riskScore > 50) severity = 'high';
    else if (riskScore > 25) severity = 'medium';

    // Log the security event
    const { data: loggedEvent, error: logError } = await supabase
      .rpc('log_security_event', {
        p_user_id: event.userId || null,
        p_event_type: event.eventType,
        p_severity: severity,
        p_ip_address: event.ipAddress || null,
        p_user_agent: event.userAgent || null,
        p_metadata: event.metadata || {},
        p_risk_score: riskScore
      });

    if (logError) {
      throw logError;
    }

    // Update the event with AI analysis
    await supabase
      .from('security_guard_events')
      .update({ ai_analysis: aiAnalysis })
      .eq('id', loggedEvent);

    // Check for patterns
    const { data: patternCheck } = await supabase
      .rpc('analyze_security_pattern', {
        p_user_id: event.userId || null,
        p_ip_address: event.ipAddress || null,
        p_event_type: event.eventType
      });

    let shouldBlock = false;
    if (patternCheck && patternCheck.length > 0 && patternCheck[0].pattern_detected) {
      const pattern = patternCheck[0];

      if (pattern.should_block) {
        shouldBlock = true;

        // Create block
        await supabase
          .from('security_guard_blocks')
          .insert({
            user_id: event.userId || null,
            ip_address: event.ipAddress || null,
            block_type: event.userId ? 'user' : 'ip',
            reason: `Automatic block: ${pattern.pattern_type} pattern detected (${pattern.event_count} occurrences)`,
            blocked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            created_by: 'ai'
          });

        // Update the event as blocked
        await supabase
          .from('security_guard_events')
          .update({ blocked: true })
          .eq('id', loggedEvent);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        allowed: !shouldBlock,
        data: {
          eventId: loggedEvent,
          riskScore,
          severity,
          aiAnalysis,
          blocked: shouldBlock,
          patternDetected: patternCheck?.[0]?.pattern_detected || false,
          recommendations: shouldBlock
            ? ['Account temporarily blocked', 'Contact support if this was legitimate']
            : riskScore > 50
            ? ['Enable 2FA', 'Review recent activity', 'Change password if suspicious']
            : ['Continue monitoring']
        }
      }),
      {
        status: shouldBlock ? 403 : 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in ai-security-monitor:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
