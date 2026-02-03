import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface MintRequest {
  developerId: string;
  milestoneType: 'initial' | 'novice' | 'intermediate' | 'advanced' | 'expert' | 'master';
  amount: number;
  vestingSchedule?: {
    immediate: number;
    monthly: number;
    duration: number;
  };
}

const MILESTONE_GRANTS: any = {
  initial: { points: 100, vesting: { immediate: 100, monthly: 0, duration: 0 } },
  novice: { points: 1000, vesting: { immediate: 500, monthly: 100, duration: 5 } },
  intermediate: { points: 5000, vesting: { immediate: 1000, monthly: 500, duration: 8 } },
  advanced: { points: 50000, vesting: { immediate: 5000, monthly: 5000, duration: 9 } },
  expert: { points: 500000, vesting: { immediate: 50000, monthly: 45000, duration: 10 } },
  master: { points: 3000000, vesting: { immediate: 300000, monthly: 225000, duration: 12 } }
};

async function verifyAdminKey(apiKey: string, supabase: any) {
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
        severity: 'high',
        endpoint: '/v1/economy/mint',
        reason: 'Unauthorized mint attempt'
      });

      return new Response(
        JSON.stringify({ error: verification.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { developerId, milestoneType, amount, vestingSchedule }: MintRequest = await req.json();

    if (!developerId || !milestoneType) {
      return new Response(
        JSON.stringify({ error: 'developerId and milestoneType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: developer } = await supabase
      .from('paas_developers')
      .select('id, email, is_verified')
      .eq('id', developerId)
      .maybeSingle();

    if (!developer) {
      return new Response(
        JSON.stringify({ error: 'Developer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const milestone = MILESTONE_GRANTS[milestoneType];
    const pointsToGrant = amount || milestone.points;
    const vesting = vestingSchedule || milestone.vesting;

    const { data: existingGrant } = await supabase
      .from('paas_point_grants')
      .select('id')
      .eq('developer_id', developerId)
      .eq('milestone_name', milestoneType)
      .maybeSingle();

    if (existingGrant) {
      return new Response(
        JSON.stringify({ error: 'Milestone already granted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: grant } = await supabase
      .from('paas_point_grants')
      .insert({
        developer_id: developerId,
        grant_type: 'milestone',
        total_points: pointsToGrant,
        vested_points: vesting.immediate,
        unvested_points: pointsToGrant - vesting.immediate,
        vesting_schedule: {
          monthlyAmount: vesting.monthly,
          durationMonths: vesting.duration,
          startDate: new Date().toISOString()
        },
        milestone_name: milestoneType,
        milestone_conditions: { type: milestoneType }
      })
      .select()
      .single();

    const { data: account } = await supabase
      .from('paas_point_accounts')
      .select('balance_points')
      .eq('developer_id', developerId)
      .single();

    const balanceBefore = parseFloat(account?.balance_points || 0);
    const balanceAfter = balanceBefore + vesting.immediate;

    await supabase.from('paas_transactions').insert({
      developer_id: developerId,
      transaction_type: 'grant',
      amount_points: vesting.immediate,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      endpoint: '/v1/economy/mint',
      metadata: {
        milestone: milestoneType,
        totalGranted: pointsToGrant,
        immediatelyVested: vesting.immediate,
        vestingSchedule: vesting
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          grantId: grant.id,
          developerId,
          milestone: milestoneType,
          totalPoints: pointsToGrant,
          totalGBP: pointsToGrant * 0.75,
          immediatelyVested: vesting.immediate,
          unvested: pointsToGrant - vesting.immediate,
          vestingSchedule: {
            monthlyRelease: vesting.monthly,
            durationMonths: vesting.duration
          },
          newBalance: balanceAfter
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
    console.error('Error in economy-mint:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
