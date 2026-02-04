import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface BillingRequest {
  billingPeriodId: string;
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

async function callGeminiAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
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

    const verification = await verifyAdminKey(apiKey);
    if (!verification.valid) {
      return new Response(
        JSON.stringify({ error: verification.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { billingPeriodId }: BillingRequest = await req.json();

    if (!billingPeriodId) {
      return new Response(
        JSON.stringify({ error: 'billingPeriodId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get billing period details
    const { data: period, error: periodError } = await supabase
      .from('paas_billing_periods')
      .select('*')
      .eq('id', billingPeriodId)
      .maybeSingle();

    if (periodError || !period) {
      return new Response(
        JSON.stringify({ error: 'Billing period not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate usage if not already done
    await supabase.rpc('calculate_period_usage', { p_billing_period_id: billingPeriodId });

    // Calculate base cost
    await supabase.rpc('calculate_base_cost', { p_billing_period_id: billingPeriodId });

    // Refresh period data
    const { data: updatedPeriod } = await supabase
      .from('paas_billing_periods')
      .select('*')
      .eq('id', billingPeriodId)
      .maybeSingle();

    if (!updatedPeriod) {
      throw new Error('Failed to refresh billing period');
    }

    // Get developer info
    const { data: developer } = await supabase
      .from('paas_developers')
      .select('id, email, created_at')
      .eq('id', updatedPeriod.developer_id)
      .maybeSingle();

    // Get usage patterns
    const { data: usagePatterns } = await supabase
      .from('paas_api_usage')
      .select('endpoint, status_code, execution_time_ms, timestamp')
      .eq('developer_id', updatedPeriod.developer_id)
      .gte('timestamp', updatedPeriod.period_start)
      .lt('timestamp', updatedPeriod.period_end)
      .order('timestamp', { ascending: false })
      .limit(1000);

    // Analyze usage patterns
    const endpointCounts: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};
    let avgExecutionTime = 0;
    let peakHours: Record<number, number> = {};

    usagePatterns?.forEach(usage => {
      endpointCounts[usage.endpoint] = (endpointCounts[usage.endpoint] || 0) + 1;

      if (usage.status_code >= 400) {
        errorCounts[usage.endpoint] = (errorCounts[usage.endpoint] || 0) + 1;
      }

      avgExecutionTime += usage.execution_time_ms;

      const hour = new Date(usage.timestamp).getHours();
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    if (usagePatterns && usagePatterns.length > 0) {
      avgExecutionTime = avgExecutionTime / usagePatterns.length;
    }

    const usageSummary = {
      totalRequests: updatedPeriod.total_requests,
      totalDataMB: parseFloat(updatedPeriod.total_data_transferred_mb || 0),
      totalExecutionMs: updatedPeriod.total_execution_time_ms,
      avgExecutionTime,
      baseCost: parseFloat(updatedPeriod.base_cost_points || 0),
      periodDays: Math.ceil((new Date(updatedPeriod.period_end).getTime() - new Date(updatedPeriod.period_start).getTime()) / (1000 * 60 * 60 * 24)),
      endpointCounts,
      errorCounts,
      peakHours,
      developerAge: Math.ceil((Date.now() - new Date(developer?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
    };

    // Prepare AI prompt
    const aiPrompt = `You are an AI Banker for a Platform-as-a-Service (PaaS) API billing system. Your role is to analyze usage patterns and calculate fair, intelligent pricing.

**Developer Information:**
- Developer ID: ${updatedPeriod.developer_id}
- Account Age: ${usageSummary.developerAge} days
- Email: ${developer?.email}

**Usage Summary for Billing Period:**
- Period: ${updatedPeriod.period_start} to ${updatedPeriod.period_end}
- Duration: ${usageSummary.periodDays} days
- Total Requests: ${usageSummary.totalRequests}
- Data Transferred: ${usageSummary.totalDataMB.toFixed(2)} MB
- Total Execution Time: ${(usageSummary.totalExecutionMs / 1000).toFixed(2)} seconds
- Average Execution Time: ${avgExecutionTime.toFixed(2)} ms per request
- Base Cost (calculated): ${usageSummary.baseCost.toFixed(2)} points

**Usage Patterns:**
- Most used endpoints: ${Object.entries(endpointCounts).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(', ')}
- Error rates: ${Object.entries(errorCounts).length > 0 ? Object.entries(errorCounts).map(([k, v]) => `${k}: ${v}`).join(', ') : 'No errors'}
- Peak usage hours: ${Object.entries(peakHours).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3).map(([k, v]) => `${k}:00 (${v} requests)`).join(', ')}

**Your Task:**
Analyze this usage data and provide:
1. An AI adjustment factor (0.5 to 1.5) to multiply the base cost
2. Detailed reasoning for your adjustment
3. Consider factors like:
   - Is the developer new? (Give discounts to new developers)
   - Is usage consistent and predictable? (Reward good patterns)
   - Are there many errors? (Penalize inefficient usage)
   - Is this peak or off-peak usage? (Reward off-peak usage)
   - Is the execution time efficient? (Reward optimized code)
   - Is this a small developer learning? (Be generous)

Respond ONLY with a JSON object in this format:
{
  "adjustmentFactor": 0.5-1.5,
  "reasoning": "Clear explanation of your pricing decision",
  "recommendedTier": "free|starter|professional|enterprise",
  "encouragement": "Brief encouraging message for the developer"
}`;

    // Call AI
    const aiResponse = await callGeminiAI(aiPrompt);

    // Parse AI response
    let aiDecision;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiDecision = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (parseError) {
      // Fallback to neutral pricing
      aiDecision = {
        adjustmentFactor: 1.0,
        reasoning: 'AI parsing failed, using neutral pricing',
        recommendedTier: 'starter',
        encouragement: 'Keep building great things!'
      };
    }

    // Calculate final cost
    const adjustmentFactor = Math.max(0.5, Math.min(1.5, aiDecision.adjustmentFactor || 1.0));
    const finalCost = usageSummary.baseCost * adjustmentFactor;

    // Store AI decision
    const { data: aiRecord } = await supabase
      .from('paas_ai_banker_decisions')
      .insert({
        billing_period_id: billingPeriodId,
        developer_id: updatedPeriod.developer_id,
        usage_summary: usageSummary,
        ai_analysis: aiResponse,
        base_calculation: usageSummary.baseCost,
        ai_adjustment_factor: adjustmentFactor,
        final_cost: finalCost,
        reasoning: aiDecision.reasoning || 'No reasoning provided',
        model_version: 'gemini-1.5-flash'
      })
      .select()
      .maybeSingle();

    // Update billing period
    await supabase
      .from('paas_billing_periods')
      .update({
        ai_calculated_cost_points: finalCost,
        final_cost_points: finalCost,
        ai_reasoning: aiDecision.reasoning,
        status: 'calculated'
      })
      .eq('id', billingPeriodId);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          billingPeriodId,
          developerId: updatedPeriod.developer_id,
          usageSummary: {
            requests: usageSummary.totalRequests,
            dataMB: usageSummary.totalDataMB,
            executionSeconds: usageSummary.totalExecutionMs / 1000
          },
          pricing: {
            baseCost: usageSummary.baseCost,
            adjustmentFactor,
            finalCost,
            costInGBP: finalCost * 0.75
          },
          aiDecision: {
            reasoning: aiDecision.reasoning,
            recommendedTier: aiDecision.recommendedTier,
            encouragement: aiDecision.encouragement
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
    console.error('Error in AI banker:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
