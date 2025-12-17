const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function generateWritingPrompt(userContext?: {
  recentThemes?: string[];
  mood?: string;
  favoriteStyle?: string;
}): Promise<string> {
  let prompt = 'Generate a single creative and inspiring poetry writing prompt. Make it thought-provoking and unique.';

  if (userContext?.mood) {
    prompt += ` The writer is feeling ${userContext.mood}.`;
  }

  if (userContext?.recentThemes && userContext.recentThemes.length > 0) {
    prompt += ` They have recently written about: ${userContext.recentThemes.join(', ')}.`;
  }

  prompt += ' Respond with ONLY the prompt text, nothing else. Keep it to one sentence.';

  return await callGeminiAPI(prompt);
}

export async function enhancePoem(poemContent: string): Promise<{
  feedback: string;
  suggestions: string[];
}> {
  const prompt = `Analyze this poem and provide constructive feedback:

${poemContent}

Please provide:
1. A brief, encouraging paragraph of overall feedback (2-3 sentences)
2. Three specific, actionable suggestions for improvement

Format your response as:
FEEDBACK: [your feedback paragraph]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]`;

  const response = await callGeminiAPI(prompt);

  const feedbackMatch = response.match(/FEEDBACK:\s*(.+?)(?=SUGGESTIONS:|$)/s);
  const suggestionsMatch = response.match(/SUGGESTIONS:\s*([\s\S]+)/);

  const feedback = feedbackMatch?.[1]?.trim() || response;
  const suggestions = suggestionsMatch?.[1]
    ?.split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    || [];

  return { feedback, suggestions };
}

export async function generateTitleSuggestions(poemContent: string): Promise<string[]> {
  const prompt = `Based on this poem, suggest 5 creative and evocative titles:

${poemContent}

Respond with ONLY the titles, one per line, without numbering or bullet points.`;

  const response = await callGeminiAPI(prompt);

  return response
    .split('\n')
    .map(title => title.trim())
    .filter(title => title.length > 0 && !title.match(/^\d+[\.)]/))
    .slice(0, 5);
}

export async function getRhymeSuggestions(word: string): Promise<string[]> {
  const prompt = `List 8 words that rhyme with "${word}". Respond with ONLY the words, separated by commas, nothing else.`;

  const response = await callGeminiAPI(prompt);

  return response
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .slice(0, 8);
}

export async function continuePoem(poemContent: string, lines: number = 2): Promise<string> {
  const prompt = `Continue this poem with ${lines} more lines that match the style, tone, and rhythm:

${poemContent}

Respond with ONLY the new lines, nothing else.`;

  return await callGeminiAPI(prompt);
}
