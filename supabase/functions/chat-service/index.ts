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

// AI Response Generator for Dave using Gemini
async function generateAIResponse(userMessage: string, conversationHistory: string[]): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('gemini_api_key') || Deno.env.get('GEMINI_API_KEY');

  if (!GEMINI_API_KEY) {
    console.error('Missing Gemini API key');
    throw new Error('API key not configured');
  }

  // Build conversation context
  const historyText = conversationHistory.length > 0
    ? `Previous conversation:\n${conversationHistory.join('\n')}\n\n`
    : '';

  const prompt = `You are Dave, a friendly and knowledgeable AI poetry assistant. Help users with poetry writing, analysis, forms, techniques, and creative inspiration.

Be warm, encouraging, and conversational. Keep responses concise (2-3 paragraphs). Be specific and insightful about poetry.

${historyText}User: ${userMessage}

Dave:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if response was blocked
    if (data.promptFeedback?.blockReason) {
      console.error('Response blocked:', data.promptFeedback.blockReason);
      throw new Error('Response blocked by safety filters');
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('No AI response:', JSON.stringify(data));
      throw new Error('No response generated');
    }

    return aiResponse.trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
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
    const pathParts = url.pathname.split('/').filter(Boolean);
    const path = pathParts[pathParts.length - 1] || '';

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
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data: messages, error } = await query;

      if (error) throw error;

      // Fetch usernames separately to avoid FK issues
      const messagesWithUsernames = await Promise.all(
        (messages || []).map(async (msg: any) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', msg.user_id)
            .maybeSingle();

          return {
            ...msg,
            user_profiles: profile ? { username: profile.username } : null
          };
        })
      );

      return new Response(
        JSON.stringify({
          success: true,
          messages: messagesWithUsernames.reverse(),
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

      // Validate room exists and check if it's an AI room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id, is_ai, name')
        .eq('id', payload.room_id)
        .maybeSingle();

      if (roomError || !room) {
        return new Response(
          JSON.stringify({ error: 'Invalid room_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert user message
      const { data: message, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: payload.room_id,
          user_id: user.id,
          content: payload.content.trim()
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      // Fetch username separately
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();

      const messageWithProfile = {
        ...message,
        user_profiles: profile ? { username: profile.username } : null
      };

      // If this is an AI room, generate and send AI response
      if (room.is_ai) {
        // Don't await - respond in background
        (async () => {
          try {
            // Get recent conversation history (last 10 messages)
            const { data: recentMessages } = await supabase
              .from('chat_messages')
              .select('content, user_id')
              .eq('room_id', payload.room_id)
              .order('created_at', { ascending: false })
              .limit(10);

            // Build conversation history (reverse to chronological order)
            const history: string[] = [];
            if (recentMessages) {
              recentMessages.reverse().forEach((msg: any) => {
                if (msg.content.startsWith('**Dave:**')) {
                  history.push(`Dave: ${msg.content.replace('**Dave:** ', '')}`);
                } else {
                  history.push(`User: ${msg.content}`);
                }
              });
            }

            const aiResponse = await generateAIResponse(payload.content.trim(), history);

            // Insert AI response using service role
            const serviceSupabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            const { error: aiInsertError } = await serviceSupabase
              .from('chat_messages')
              .insert({
                room_id: payload.room_id,
                user_id: user.id,
                content: `**Dave:** ${aiResponse}`
              });

            if (aiInsertError) {
              console.error('Error inserting AI response:', aiInsertError);
            }
          } catch (aiError) {
            console.error('Error generating AI response:', aiError);

            // Insert fallback message on error
            const serviceSupabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            await serviceSupabase
              .from('chat_messages')
              .insert({
                room_id: payload.room_id,
                user_id: user.id,
                content: `**Dave:** I'm having trouble connecting right now. Could you try asking your question again?`
              });
          }
        })();
      }

      return new Response(
        JSON.stringify({ success: true, message: messageWithProfile }),
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
