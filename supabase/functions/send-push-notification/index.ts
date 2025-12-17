import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PushPayload {
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const payload: PushPayload = await req.json();

    if (!payload.title || !payload.body) {
      throw new Error("Missing required fields: title and body");
    }

    const vapidPublicKey = Deno.env.get("VITE_VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys not configured");
    }

    webpush.setVapidDetails(
      'mailto:noreply@poetrysuite.app',
      vapidPublicKey,
      vapidPrivateKey
    );

    let query = supabaseClient
      .from("push_subscriptions")
      .select("*");

    if (payload.userId) {
      query = query.eq("user_id", payload.userId);
    }

    const { data: subscriptions, error: dbError } = await query;

    if (dbError) {
      throw dbError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found", sent: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      tag: payload.tag || "default",
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
    };

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh_key,
              auth: subscription.auth_key,
            },
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notificationPayload)
          );

          return true;
        } catch (error: any) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await supabaseClient
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", subscription.endpoint);
          }
          console.error("Error sending to subscription:", error);
          return false;
        }
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled" && r.value).length;

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        sent: successCount,
        total: subscriptions.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});