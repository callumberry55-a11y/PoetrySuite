import { supabase } from '../lib/supabase';

export type SuggestionType = 'line' | 'stanza' | 'rhyme' | 'haiku' | 'metaphor';

export interface SuggestionParams {
  type: SuggestionType;
  prompt: string;
}

export async function getAISuggestion(params: SuggestionParams): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const apiUrl = `${supabaseUrl}/functions/v1/ai-suggestion`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get AI suggestion: ${errorText}`);
  }

  const { suggestion } = await response.json();
  return suggestion;
}
