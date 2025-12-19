import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    await supabaseClient.from("tutorial_progress").delete().eq("user_id", userId);
    await supabaseClient.from("contest_votes").delete().eq("user_id", userId);
    await supabaseClient.from("poem_moods").delete().in(
      "poem_id",
      supabaseClient.from("poems").select("id").eq("user_id", userId)
    );
    await supabaseClient.from("poem_versions").delete().eq("changed_by", userId);
    await supabaseClient.from("collaboration_participants").delete().eq("user_id", userId);
    await supabaseClient.from("collaborations").delete().eq("owner_id", userId);
    await supabaseClient.from("contest_entries").delete().eq("user_id", userId);
    await supabaseClient.from("comments").delete().eq("user_id", userId);
    await supabaseClient.from("reactions").delete().eq("user_id", userId);
    await supabaseClient.from("poem_prompts").delete().in(
      "poem_id",
      supabaseClient.from("poems").select("id").eq("user_id", userId)
    );
    await supabaseClient.from("poem_tags").delete().in(
      "poem_id",
      supabaseClient.from("poems").select("id").eq("user_id", userId)
    );
    await supabaseClient.from("poem_collections").delete().in(
      "poem_id",
      supabaseClient.from("poems").select("id").eq("user_id", userId)
    );
    await supabaseClient.from("reading_list_poems").delete().in(
      "reading_list_id",
      supabaseClient.from("reading_lists").select("id").eq("user_id", userId)
    );
    await supabaseClient.from("poem_audio").delete().eq("user_id", userId);
    await supabaseClient.from("poem_images").delete().eq("user_id", userId);
    await supabaseClient.from("community_submissions").delete().eq("user_id", userId);
    await supabaseClient.from("community_submissions").delete().eq("reviewed_by", userId);
    await supabaseClient.from("submissions").delete().eq("user_id", userId);
    await supabaseClient.from("private_messages").delete().eq("sender_id", userId);
    await supabaseClient.from("private_messages").delete().eq("recipient_id", userId);
    await supabaseClient.from("conversations").delete().eq("participant_1_id", userId);
    await supabaseClient.from("conversations").delete().eq("participant_2_id", userId);
    await supabaseClient.from("follows").delete().eq("follower_id", userId);
    await supabaseClient.from("follows").delete().eq("following_id", userId);
    await supabaseClient.from("public_chat_messages").delete().eq("user_id", userId);
    await supabaseClient.from("writing_stats").delete().eq("user_id", userId);
    await supabaseClient.from("reading_lists").delete().eq("user_id", userId);
    await supabaseClient.from("tags").delete().eq("user_id", userId);
    await supabaseClient.from("collab_participants").delete().eq("user_id", userId);
    await supabaseClient.from("collab_updates").delete().eq("user_id", userId);
    await supabaseClient.from("collaborative_sessions").delete().eq("created_by", userId);
    await supabaseClient.from("poem_series_items").delete().in(
      "series_id",
      supabaseClient.from("poem_series").select("id").eq("user_id", userId)
    );
    await supabaseClient.from("poem_series").delete().eq("user_id", userId);
    await supabaseClient.from("beta_feedback").delete().eq("user_id", userId);
    await supabaseClient.from("custom_themes").delete().eq("user_id", userId);
    await supabaseClient.from("ai_wallpapers").delete().eq("user_id", userId);
    await supabaseClient.from("push_subscriptions").delete().eq("user_id", userId);
    await supabaseClient.from("collections").delete().eq("user_id", userId);
    await supabaseClient.from("poems").delete().eq("user_id", userId);
    await supabaseClient.from("user_profiles").delete().eq("user_id", userId);
    await supabaseClient.from("contests").delete().eq("created_by", userId);

    const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});