import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendMessagePayload {
  room_id: string;
  content: string;
}

interface GetMessagesParams {
  room_id: string;
  limit?: number;
  before?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // GET /chat-service/rooms - Get all chat rooms
    if (req.method === 'GET' && path === 'rooms') {
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('name');

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, rooms }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /chat-service/messages - Get messages for a room
    if (req.method === 'GET' && path === 'messages') {
      const roomId = url.searchParams.get('room_id');
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);
      const before = url.searchParams.get('before');

      if (!roomId) {
        return new Response(
          JSON.stringify({ error: 'Missing room_id parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let query = supabase
        .from('chat_messages')
        .select(`
          *,
          user_profiles!inner(display_name, username)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data: messages, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          messages: messages?.reverse() || [],
          hasMore: messages?.length === limit
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /chat-service/send - Send a message
    if (req.method === 'POST' && path === 'send') {
      const payload: SendMessagePayload = await req.json();

      if (!payload.room_id || !payload.content?.trim()) {
        return new Response(
          JSON.stringify({ error: 'Missing room_id or content' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate room exists
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('id', payload.room_id)
        .maybeSingle();

      if (roomError || !room) {
        return new Response(
          JSON.stringify({ error: 'Invalid room_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert message
      const { data: message, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: payload.room_id,
          user_id: user.id,
          content: payload.content.trim()
        })
        .select(`
          *,
          user_profiles!inner(display_name, username)
        `)
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, message }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /chat-service/message/:id - Delete a message
    if (req.method === 'DELETE' && path === 'message') {
      const messageId = url.searchParams.get('id');

      if (!messageId) {
        return new Response(
          JSON.stringify({ error: 'Missing message id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify message ownership
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('user_id')
        .eq('id', messageId)
        .maybeSingle();

      if (fetchError || !message) {
        return new Response(
          JSON.stringify({ error: 'Message not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (message.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized to delete this message' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /chat-service/room - Create a new room (authenticated users only)
    if (req.method === 'POST' && path === 'room') {
      const payload = await req.json();

      if (!payload.name?.trim()) {
        return new Response(
          JSON.stringify({ error: 'Missing room name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: room, error: insertError } = await supabase
        .from('chat_rooms')
        .insert({
          name: payload.name.trim(),
          description: payload.description?.trim() || null,
          created_by: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, room }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint or method' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-service:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
