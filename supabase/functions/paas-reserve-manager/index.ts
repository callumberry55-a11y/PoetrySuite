import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface ReserveRequest {
  action: 'initialize' | 'allocate' | 'spend' | 'update_settings' | 'get_reserves' | 'get_history' | 'apply_ai_recommendation';
  developerId?: string;
  reserveId?: string;
  amount?: number;
  source?: string;
  reason?: string;
  transactionType?: string;
  description?: string;
  settings?: {
    allocationPercentage?: number;
    budgetLimit?: number;
    autoRefillEnabled?: boolean;
    autoRefillThreshold?: number;
    autoRefillAmount?: number;
  };
  recommendationId?: string;
}

async function verifyAPIKey(apiKey: string, supabase: any) {
  const { data: keyData } = await supabase
    .from('paas_api_keys')
    .select('id, developer_id, is_active, paas_developers(id, email, is_verified)')
    .eq('key_hash', apiKey)
    .eq('is_active', true)
    .maybeSingle();

  if (!keyData || !keyData.paas_developers) {
    return { valid: false, error: 'Invalid or inactive API key' };
  }

  const developer = keyData.paas_developers;

  if (!developer.is_verified) {
    return { valid: false, error: 'Developer account not verified' };
  }

  return {
    valid: true,
    developerId: developer.id,
    apiKeyId: keyData.id
  };
}

async function verifyAdminKey(apiKey: string) {
  const adminKey = Deno.env.get('PAAS_ADMIN_KEY');

  if (!adminKey) {
    throw new Error('PAAS_ADMIN_KEY environment variable is not configured');
  }

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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'get_reserves' || action === 'get_history') {
      const verification = await verifyAPIKey(apiKey, supabase);
      if (!verification.valid) {
        return new Response(
          JSON.stringify({ error: verification.error }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'get_reserves') {
        const { data: reserves } = await supabase
          .from('paas_developer_reserves')
          .select(`
            *,
            paas_reserve_categories (
              name,
              display_name,
              description,
              icon
            )
          `)
          .eq('developer_id', verification.developerId)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        const { data: categories } = await supabase
          .from('paas_reserve_categories')
          .select('*')
          .eq('is_active', true);

        const { data: aiRecommendations } = await supabase
          .from('paas_reserve_ai_recommendations')
          .select('*')
          .eq('developer_id', verification.developerId)
          .eq('applied', false)
          .order('created_at', { ascending: false })
          .limit(1);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              reserves: reserves || [],
              categories: categories || [],
              aiRecommendation: aiRecommendations?.[0] || null
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'get_history') {
        const reserveId = url.searchParams.get('reserveId');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 500);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);

        let query = supabase
          .from('paas_reserve_transactions')
          .select('*')
          .eq('developer_id', verification.developerId);

        if (reserveId) {
          query = query.eq('reserve_id', reserveId);
        }

        const { data: transactions } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const { data: allocations } = await supabase
          .from('paas_reserve_allocations')
          .select('*')
          .eq('developer_id', verification.developerId)
          .order('created_at', { ascending: false })
          .limit(limit);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              transactions: transactions || [],
              allocations: allocations || []
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const requestData: ReserveRequest = req.method === 'POST' ? await req.json() : { action: action || '' };

    switch (requestData.action) {
      case 'initialize': {
        const adminVerification = await verifyAdminKey(apiKey);
        if (!adminVerification.valid) {
          return new Response(
            JSON.stringify({ error: adminVerification.error }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!requestData.developerId) {
          return new Response(
            JSON.stringify({ error: 'developerId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase.rpc('initialize_developer_reserves', { p_developer_id: requestData.developerId });

        const { data: reserves } = await supabase
          .from('paas_developer_reserves')
          .select('*, paas_reserve_categories(*)')
          .eq('developer_id', requestData.developerId);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Developer reserves initialized',
            data: reserves
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'allocate': {
        const adminVerification = await verifyAdminKey(apiKey);
        if (!adminVerification.valid) {
          return new Response(
            JSON.stringify({ error: adminVerification.error }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!requestData.developerId || !requestData.amount) {
          return new Response(
            JSON.stringify({ error: 'developerId and amount are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: result } = await supabase.rpc('allocate_to_reserves', {
          p_developer_id: requestData.developerId,
          p_total_amount: requestData.amount,
          p_source: requestData.source || 'system',
          p_reason: requestData.reason || null
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: result
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'spend': {
        const verification = await verifyAPIKey(apiKey, supabase);
        if (!verification.valid) {
          return new Response(
            JSON.stringify({ error: verification.error }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!requestData.reserveId || !requestData.amount || !requestData.transactionType) {
          return new Response(
            JSON.stringify({ error: 'reserveId, amount, and transactionType are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: result } = await supabase.rpc('spend_from_reserve', {
          p_reserve_id: requestData.reserveId,
          p_amount: requestData.amount,
          p_transaction_type: requestData.transactionType,
          p_description: requestData.description || null
        });

        if (result && !result.success) {
          return new Response(
            JSON.stringify(result),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: result
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_settings': {
        const verification = await verifyAPIKey(apiKey, supabase);
        if (!verification.valid) {
          return new Response(
            JSON.stringify({ error: verification.error }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!requestData.reserveId || !requestData.settings) {
          return new Response(
            JSON.stringify({ error: 'reserveId and settings are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const updateData: any = { updated_at: new Date().toISOString() };

        if (requestData.settings.allocationPercentage !== undefined) {
          updateData.allocation_percentage = requestData.settings.allocationPercentage;
        }
        if (requestData.settings.budgetLimit !== undefined) {
          updateData.budget_limit_points = requestData.settings.budgetLimit;
        }
        if (requestData.settings.autoRefillEnabled !== undefined) {
          updateData.auto_refill_enabled = requestData.settings.autoRefillEnabled;
        }
        if (requestData.settings.autoRefillThreshold !== undefined) {
          updateData.auto_refill_threshold = requestData.settings.autoRefillThreshold;
        }
        if (requestData.settings.autoRefillAmount !== undefined) {
          updateData.auto_refill_amount = requestData.settings.autoRefillAmount;
        }

        const { data: reserve, error } = await supabase
          .from('paas_developer_reserves')
          .update(updateData)
          .eq('id', requestData.reserveId)
          .eq('developer_id', verification.developerId)
          .select()
          .maybeSingle();

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: reserve
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'apply_ai_recommendation': {
        const verification = await verifyAPIKey(apiKey, supabase);
        if (!verification.valid) {
          return new Response(
            JSON.stringify({ error: verification.error }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!requestData.recommendationId) {
          return new Response(
            JSON.stringify({ error: 'recommendationId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: recommendation } = await supabase
          .from('paas_reserve_ai_recommendations')
          .select('*')
          .eq('id', requestData.recommendationId)
          .eq('developer_id', verification.developerId)
          .maybeSingle();

        if (!recommendation) {
          return new Response(
            JSON.stringify({ error: 'Recommendation not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const allocations = recommendation.recommended_allocations as Record<string, number>;

        for (const [categoryName, percentage] of Object.entries(allocations)) {
          const { data: category } = await supabase
            .from('paas_reserve_categories')
            .select('id')
            .eq('name', categoryName)
            .maybeSingle();

          if (category) {
            await supabase
              .from('paas_developer_reserves')
              .update({ allocation_percentage: percentage })
              .eq('developer_id', verification.developerId)
              .eq('category_id', category.id);
          }
        }

        await supabase
          .from('paas_reserve_ai_recommendations')
          .update({ applied: true, applied_at: new Date().toISOString() })
          .eq('id', requestData.recommendationId);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'AI recommendation applied successfully'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in reserve manager:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
