import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface OverrideRequest {
  securityEventId: string;
  reason: string;
  adminUserId: string;
  action: 'allow' | 'deny';
}

async function verifyAdminKey(apiKey: string) {
  const adminKey = Deno.env.get('PAAS_ADMIN_KEY') || 'admin-key-placeholder';

  if (apiKey !== adminKey) {
    return { valid: false, error: 'Unauthorized: Admin access required' };
  }

  return { valid: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing X-API-Key header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const verification = await verifyAdminKey(apiKey, supabase);
    if (!verification.valid) {
      await supabase.from('paas_security_events').insert({
        event_type: 'blocked',
        severity: 'critical',
        endpoint: '/v1/guard/override',
        reason: 'Unauthorized override attempt'
      });

      return new Response(
        JSON.stringify({ error: verification.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { securityEventId, reason, adminUserId, action }: OverrideRequest = await req.json();

    if (!securityEventId || !reason || !adminUserId || !action) {
      return new Response(
        JSON.stringify({ error: 'securityEventId, reason, adminUserId, and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: event, error: eventError } = await supabase
      .from('paas_security_events')
      .select('*')
      .eq('id', securityEventId)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Security event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateError } = await supabase
      .from('paas_security_events')
      .update({
        event_type: 'override',
        manual_override_by: adminUserId,
        override_reason: reason
      })
      .eq('id', securityEventId);

    if (updateError) {
      throw updateError;
    }

    await supabase.from('paas_security_events').insert({
      developer_id: event.developer_id,
      api_key_id: event.api_key_id,
      event_type: 'override',
      severity: 'medium',
      endpoint: event.endpoint || '/v1/guard/override',
      reason: `Manual override: ${action} - ${reason}`,
      manual_override_by: adminUserId,
      override_reason: reason
    });

    if (action === 'allow' && event.developer_id) {
      const { data: developer } = await supabase
        .from('paas_developers')
        .select('email, organization_name')
        .eq('id', event.developer_id)
        .single();

      console.log(`Override ALLOW granted for developer ${developer?.email || event.developer_id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventId: securityEventId,
          action,
          overriddenBy: adminUserId,
          reason,
          timestamp: new Date().toISOString(),
          originalEvent: {
            type: event.event_type,
            severity: event.severity,
            reason: event.reason,
            createdAt: event.created_at
          }
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in guard-override:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
