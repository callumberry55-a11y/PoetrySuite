import { supabase } from '../lib/supabase';

export type SuggestionType = 'line' | 'stanza' | 'rhyme' | 'haiku' | 'metaphor' | 'general' | 'suggestion';

export interface SuggestionParams {
  type: SuggestionType;
  prompt: string;
}

export async function getAISuggestion(params: SuggestionParams): Promise<string> {
  console.log(`Getting AI suggestion for type: ${params.type} with prompt: "${params.prompt}"`);

  // Temporary placeholder response to ensure UI functionality
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  const placeholderResponses: { [key in SuggestionType]: string } = {
    rhyme: `Here are some rhymes for "${params.prompt}": time, sublime, crime.`,
    metaphor: `Here is a metaphor for "${params.prompt}": It is a shining star in a moonless night.`,
    haiku: `Here is a haiku for "${params.prompt}":\n\nAn old silent pond...\nA frog jumps into the pond—\nsplash! Silence again.`,
    line: `How about this line for "${params.prompt}": "The sun dipped below the horizon, painting the sky in hues of orange and purple."`,
    stanza: `Here is a stanza for "${params.prompt}":\n\nIn realms of code, where logic takes its flight,\nA silent partner, working through the night.\nIt fixes bugs with swift and steady hand,\nAnd builds new features, all on command.`,
    general: `I can help with that. What would you like to know about "${params.prompt}"?`,
    suggestion: `Here is a suggestion for "${params.prompt}": How about we brainstorm some ideas related to this topic?`
  };

  const suggestion = placeholderResponses[params.type] || "I'm still learning, but I'll have a great suggestion for you soon!";
  
  return suggestion;
}
