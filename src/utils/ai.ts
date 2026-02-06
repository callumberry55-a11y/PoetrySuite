const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
}

export async function callGeminiAPI(
  systemPrompt: string,
  userPrompt: string,
  options: AIOptions = {}
): Promise<string> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
  }

  const { temperature = 0.9, maxTokens = 2048 } = options;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [{
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
      }],
      generationConfig: {
        temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      },
    };

    console.log('Calling Gemini API...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`API request failed with status ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const errorMessage = errorData?.error?.message || errorData?.message || 'Unknown error from AI service';
      throw new Error(`AI Service Error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('API Response received successfully');

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      console.error('Unexpected response structure:', data);
      throw new Error('No text content in API response');
    }

    return resultText;
  } catch (error) {
    console.error('Gemini API Error:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach AI service. Please check your internet connection.');
    }

    throw error;
  }
}

export async function analyzePoemSentiment(poemContent: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotions: string[];
  score: number;
}> {
  const systemPrompt = 'You are an expert in emotional analysis of poetry. Respond ONLY with valid JSON.';
  const userPrompt = `Analyze the emotional sentiment of this poem:

${poemContent}

Respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "score": 0.0-1.0
}`;

  try {
    const result = await callGeminiAPI(systemPrompt, userPrompt, { temperature: 0.3 });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON in response');
      }
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return {
      sentiment: 'neutral',
      emotions: [],
      score: 0.5
    };
  }
}

export async function generatePoemTitle(poemContent: string): Promise<string> {
  const systemPrompt = 'You are a creative poet. Generate evocative, memorable titles for poems.';
  const userPrompt = `Generate a creative, evocative title for this poem (provide ONLY the title, no quotes or extra text):

${poemContent}`;

  try {
    const result = await callGeminiAPI(systemPrompt, userPrompt, { temperature: 0.8, maxTokens: 50 });
    return result.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Title generation failed:', error);
    return 'Untitled Poem';
  }
}

export async function scorePoemQuality(poemContent: string): Promise<{
  overall: number;
  imagery: number;
  rhythm: number;
  originality: number;
  emotion: number;
  feedback: string;
}> {
  const systemPrompt = 'You are an expert poetry critic and judge. Respond ONLY with valid JSON.';
  const userPrompt = `Score this poem on a scale of 1-10 for each category:

${poemContent}

Respond with ONLY a JSON object in this exact format:
{
  "overall": 8.5,
  "imagery": 9,
  "rhythm": 7,
  "originality": 8,
  "emotion": 9,
  "feedback": "Brief constructive feedback (2-3 sentences)"
}`;

  try {
    const result = await callGeminiAPI(systemPrompt, userPrompt, { temperature: 0.3 });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON in response');
      }
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Quality scoring failed:', error);
    return {
      overall: 5,
      imagery: 5,
      rhythm: 5,
      originality: 5,
      emotion: 5,
      feedback: 'Unable to score poem at this time.'
    };
  }
}

export async function detectPoemForm(poemContent: string): Promise<{
  form: string;
  confidence: number;
  characteristics: string[];
}> {
  const systemPrompt = 'You are an expert in poetry forms and structures. Respond ONLY with valid JSON.';
  const userPrompt = `Identify the poetic form of this poem:

${poemContent}

Respond with ONLY a JSON object in this exact format:
{
  "form": "Sonnet|Haiku|Free Verse|Limerick|Villanelle|etc",
  "confidence": 0.0-1.0,
  "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
}`;

  try {
    const result = await callGeminiAPI(systemPrompt, userPrompt, { temperature: 0.2 });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON in response');
      }
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Form detection failed:', error);
    return {
      form: 'Free Verse',
      confidence: 0,
      characteristics: []
    };
  }
}

export async function generateWritingPrompt(theme?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced'): Promise<string> {
  const systemPrompt = 'You are a creative writing instructor. Generate inspiring, specific poetry writing prompts.';
  let userPrompt = 'Generate a unique, creative poetry writing prompt.';

  if (theme) {
    userPrompt += ` Theme: ${theme}.`;
  }

  if (difficulty) {
    userPrompt += ` Difficulty level: ${difficulty}.`;
  }

  userPrompt += ' Provide ONLY the prompt itself (2-3 sentences), no extra formatting or labels.';

  try {
    const result = await callGeminiAPI(systemPrompt, userPrompt, { temperature: 0.9, maxTokens: 200 });
    return result.trim();
  } catch (error) {
    console.error('Prompt generation failed:', error);
    return 'Write a poem about a moment that changed your perspective on life.';
  }
}

export async function improveLine(line: string, context: string): Promise<string[]> {
  const systemPrompt = 'You are a poetry editor. Suggest improved versions of poetic lines.';
  const userPrompt = `Suggest 3 improved versions of this line from a poem:

Line: "${line}"

Context (surrounding lines):
${context}

Provide 3 alternative versions that improve imagery, rhythm, or impact. List them one per line, no numbering or extra text.`;

  try {
    const result = await callGeminiAPI(systemPrompt, userPrompt, { temperature: 0.8, maxTokens: 300 });
    const suggestions = result.split('\n').filter(line => line.trim()).slice(0, 3);
    return suggestions.length > 0 ? suggestions : [line];
  } catch (error) {
    console.error('Line improvement failed:', error);
    return [line];
  }
}

export async function findSynonyms(word: string, context: string): Promise<string[]> {
  const systemPrompt = 'You are a thesaurus and poetry assistant. Provide contextually appropriate synonyms.';
  const userPrompt = `Find 10-15 synonyms for "${word}" in this poetic context:

${context}

Provide words that work well in poetry, considering tone, rhythm, and imagery. List words separated by commas, no extra text.`;

  try {
    const result = await callGeminiAPI(systemPrompt, userPrompt, { temperature: 0.7, maxTokens: 200 });
    const synonyms = result.split(/[,\n]/).map(s => s.trim()).filter(s => s && s.length > 0);
    return synonyms.slice(0, 15);
  } catch (error) {
    console.error('Synonym finding failed:', error);
    return [word];
  }
}
