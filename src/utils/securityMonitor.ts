import { supabase } from '@/lib/supabase';

interface SecurityEvent {
  userId?: string;
  eventType: 'login' | 'registration' | 'password_change' | 'logout' | 'suspicious_activity';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface SecurityResponse {
  success: boolean;
  allowed: boolean;
  blocked?: boolean;
  data?: {
    eventId: string;
    riskScore: number;
    severity: string;
    aiAnalysis: string;
    blocked: boolean;
    patternDetected: boolean;
    recommendations: string[];
  };
  reason?: string;
  blockedUntil?: string;
}

async function getClientInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
}

export async function monitorSecurityEvent(event: SecurityEvent): Promise<SecurityResponse> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!event.userAgent) {
      const clientInfo = await getClientInfo();
      event.userAgent = clientInfo.userAgent;
      event.metadata = {
        ...event.metadata,
        ...clientInfo,
      };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-security-monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(event),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Security monitoring error:', error);
    return {
      success: false,
      allowed: true,
      data: undefined,
    };
  }
}

export async function logLoginAttempt(userId?: string, success: boolean = true) {
  return await monitorSecurityEvent({
    userId,
    eventType: success ? 'login' : 'suspicious_activity',
    metadata: {
      success,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function logRegistration(userId: string) {
  return await monitorSecurityEvent({
    userId,
    eventType: 'registration',
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

export async function logPasswordChange(userId: string) {
  return await monitorSecurityEvent({
    userId,
    eventType: 'password_change',
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

export async function logLogout(userId: string) {
  return await monitorSecurityEvent({
    userId,
    eventType: 'logout',
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

export async function checkUserSecurityStatus(userId: string): Promise<{
  isBlocked: boolean;
  reason?: string;
  blockedUntil?: string;
}> {
  try {
    const { data, error } = await supabase
      .rpc('check_security_blocks', {
        p_user_id: userId,
        p_ip_address: null,
      });

    if (error) throw error;

    if (data && data.length > 0 && data[0].is_blocked) {
      return {
        isBlocked: true,
        reason: data[0].block_reason,
        blockedUntil: data[0].blocked_until,
      };
    }

    return { isBlocked: false };
  } catch (error) {
    console.error('Error checking security status:', error);
    return { isBlocked: false };
  }
}

export async function getUserSecurityEvents(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('security_guard_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching security events:', error);
    return [];
  }
}

export async function subscribeToSecurityAlerts(
  callback: (alert: any) => void
) {
  const channel = supabase
    .channel('security-alerts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'security_guard_alerts',
        filter: `acknowledged=eq.false`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function acknowledgeSecurityAlert(alertId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('security_guard_alerts')
      .update({
        acknowledged: true,
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return { success: false, error };
  }
}
