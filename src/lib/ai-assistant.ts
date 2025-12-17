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

export async function getRhymeSuggestions(word: string): Promise<string[]> {
  const prompt = `List 12 words that rhyme with "${word}". Include perfect rhymes, near rhymes, and slant rhymes. Respond with ONLY the words, separated by commas, nothing else.`;

  const response = await callGeminiAPI(prompt);

  return response
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .slice(0, 12);
}

export async function getSynonyms(word: string): Promise<string[]> {
  const prompt = `List 10 synonyms for the word "${word}". Include words with similar meanings that could work well in poetry. Respond with ONLY the words, separated by commas, nothing else.`;

  const response = await callGeminiAPI(prompt);

  return response
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .slice(0, 10);
}

export async function getThesaurusResults(word: string): Promise<{
  synonyms: string[];
  antonyms: string[];
  related: string[];
}> {
  const prompt = `For the word "${word}", provide:
1. 5 synonyms
2. 3 antonyms
3. 5 related words

Format as:
SYNONYMS: word1, word2, word3, word4, word5
ANTONYMS: word1, word2, word3
RELATED: word1, word2, word3, word4, word5`;

  const response = await callGeminiAPI(prompt);

  const synonymsMatch = response.match(/SYNONYMS:\s*(.+)/);
  const antonymsMatch = response.match(/ANTONYMS:\s*(.+)/);
  const relatedMatch = response.match(/RELATED:\s*(.+)/);

  return {
    synonyms: synonymsMatch?.[1]?.split(',').map(w => w.trim()).filter(Boolean) || [],
    antonyms: antonymsMatch?.[1]?.split(',').map(w => w.trim()).filter(Boolean) || [],
    related: relatedMatch?.[1]?.split(',').map(w => w.trim()).filter(Boolean) || [],
  };
}

export async function continuePoem(poemContent: string, lines: number = 2): Promise<string> {
  const prompt = `Continue this poem with ${lines} more lines that match the style, tone, and rhythm:

${poemContent}

Respond with ONLY the new lines, nothing else.`;

  return await callGeminiAPI(prompt);
}

export async function critiquePoem(poemContent: string): Promise<{
  overall: string;
  strengths: string[];
  improvements: string[];
  technicalNotes: string[];
}> {
  const prompt = `Provide a detailed critique of this poem:

${poemContent}

Please provide:
1. Overall assessment (2-3 sentences)
2. Three specific strengths
3. Three areas for improvement
4. Three technical notes (about rhythm, meter, imagery, etc.)

Format your response as:
OVERALL: [assessment]
STRENGTHS:
- [strength 1]
- [strength 2]
- [strength 3]
IMPROVEMENTS:
- [improvement 1]
- [improvement 2]
- [improvement 3]
TECHNICAL:
- [note 1]
- [note 2]
- [note 3]`;

  const response = await callGeminiAPI(prompt);

  const overallMatch = response.match(/OVERALL:\s*(.+?)(?=STRENGTHS:|$)/s);
  const strengthsMatch = response.match(/STRENGTHS:\s*([\s\S]+?)(?=IMPROVEMENTS:|$)/);
  const improvementsMatch = response.match(/IMPROVEMENTS:\s*([\s\S]+?)(?=TECHNICAL:|$)/);
  const technicalMatch = response.match(/TECHNICAL:\s*([\s\S]+)/);

  const parseList = (text: string | undefined) => {
    return text?.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim()) || [];
  };

  return {
    overall: overallMatch?.[1]?.trim() || '',
    strengths: parseList(strengthsMatch?.[1]),
    improvements: parseList(improvementsMatch?.[1]),
    technicalNotes: parseList(technicalMatch?.[1]),
  };
}

export async function analyzeMeter(poemContent: string): Promise<{
  pattern: string;
  consistency: string;
  suggestions: string[];
}> {
  const prompt = `Analyze the metrical pattern of this poem:

${poemContent}

Provide:
1. The metrical pattern (e.g., iambic pentameter, free verse, etc.)
2. How consistent the meter is
3. 2-3 suggestions for improving rhythm

Format as:
PATTERN: [pattern]
CONSISTENCY: [consistency description]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]`;

  const response = await callGeminiAPI(prompt);

  const patternMatch = response.match(/PATTERN:\s*(.+)/);
  const consistencyMatch = response.match(/CONSISTENCY:\s*(.+)/);
  const suggestionsMatch = response.match(/SUGGESTIONS:\s*([\s\S]+)/);

  const suggestions = suggestionsMatch?.[1]
    ?.split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim()) || [];

  return {
    pattern: patternMatch?.[1]?.trim() || 'Unknown',
    consistency: consistencyMatch?.[1]?.trim() || '',
    suggestions,
  };
}

export async function suggestImagery(theme: string, mood: string): Promise<string[]> {
  const prompt = `Suggest 8 vivid, poetic images related to the theme "${theme}" with a ${mood} mood. These should be concrete, sensory images that a poet could use. Respond with ONLY the images, one per line.`;

  const response = await callGeminiAPI(prompt);

  return response
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function generateWritingPrompt(difficulty: 'beginner' | 'intermediate' | 'advanced', theme?: string): Promise<{
  title: string;
  prompt: string;
}> {
  let prompt = `Generate a creative poetry writing prompt for a ${difficulty} level poet.`;

  if (theme) {
    prompt += ` The prompt should relate to the theme: ${theme}.`;
  }

  prompt += `\n\nFormat as:
TITLE: [short catchy title]
PROMPT: [detailed prompt with specific instructions]`;

  const response = await callGeminiAPI(prompt);

  const titleMatch = response.match(/TITLE:\s*(.+)/);
  const promptMatch = response.match(/PROMPT:\s*([\s\S]+)/);

  return {
    title: titleMatch?.[1]?.trim() || 'Creative Writing Prompt',
    prompt: promptMatch?.[1]?.trim() || response,
  };
}

export async function analyzeEmotion(poemContent: string): Promise<{
  primaryMood: string;
  emotions: string[];
  intensity: number;
}> {
  const prompt = `Analyze the emotional content of this poem:

${poemContent}

Provide:
1. The primary mood (one word)
2. 3-5 specific emotions present
3. Emotional intensity on a scale of 1-5

Format as:
MOOD: [mood]
EMOTIONS: emotion1, emotion2, emotion3, emotion4, emotion5
INTENSITY: [number]`;

  const response = await callGeminiAPI(prompt);

  const moodMatch = response.match(/MOOD:\s*(.+)/);
  const emotionsMatch = response.match(/EMOTIONS:\s*(.+)/);
  const intensityMatch = response.match(/INTENSITY:\s*(\d+)/);

  return {
    primaryMood: moodMatch?.[1]?.trim() || 'neutral',
    emotions: emotionsMatch?.[1]?.split(',').map(e => e.trim()).filter(Boolean) || [],
    intensity: parseInt(intensityMatch?.[1] || '3', 10),
  };
}

export async function suggestFormTemplate(formType: string): Promise<{
  description: string;
  structure: string;
  example: string;
  tips: string[];
}> {
  const prompt = `Provide detailed information about the ${formType} poetry form:

1. A brief description
2. The structural rules (meter, rhyme scheme, line count, etc.)
3. A short example
4. 3 tips for writing in this form

Format as:
DESCRIPTION: [description]
STRUCTURE: [structure]
EXAMPLE:
[example poem]
TIPS:
- [tip 1]
- [tip 2]
- [tip 3]`;

  const response = await callGeminiAPI(prompt);

  const descriptionMatch = response.match(/DESCRIPTION:\s*(.+?)(?=STRUCTURE:|$)/s);
  const structureMatch = response.match(/STRUCTURE:\s*(.+?)(?=EXAMPLE:|$)/s);
  const exampleMatch = response.match(/EXAMPLE:\s*([\s\S]+?)(?=TIPS:|$)/);
  const tipsMatch = response.match(/TIPS:\s*([\s\S]+)/);

  const tips = tipsMatch?.[1]
    ?.split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim()) || [];

  return {
    description: descriptionMatch?.[1]?.trim() || '',
    structure: structureMatch?.[1]?.trim() || '',
    example: exampleMatch?.[1]?.trim() || '',
    tips,
  };
}

export async function getDictionaryDefinition(word: string): Promise<{
  word: string;
  definitions: string[];
  etymology: string;
  examples: string[];
}> {
  const prompt = `Provide dictionary information for the word "${word}":

1. 2-3 definitions
2. Etymology (word origin)
3. 2 example sentences

Format as:
DEFINITIONS:
- [definition 1]
- [definition 2]
ETYMOLOGY: [origin]
EXAMPLES:
- [example 1]
- [example 2]`;

  const response = await callGeminiAPI(prompt);

  const definitionsMatch = response.match(/DEFINITIONS:\s*([\s\S]+?)(?=ETYMOLOGY:|$)/);
  const etymologyMatch = response.match(/ETYMOLOGY:\s*(.+?)(?=EXAMPLES:|$)/s);
  const examplesMatch = response.match(/EXAMPLES:\s*([\s\S]+)/);

  const parseList = (text: string | undefined) => {
    return text?.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim()) || [];
  };

  return {
    word,
    definitions: parseList(definitionsMatch?.[1]),
    etymology: etymologyMatch?.[1]?.trim() || '',
    examples: parseList(examplesMatch?.[1]),
  };
}

export async function generateTitleSuggestions(poemContent: string): Promise<string[]> {
  const prompt = `Based on this poem, suggest 6 creative and evocative titles:

${poemContent}

Respond with ONLY the titles, one per line, without numbering or bullet points.`;

  const response = await callGeminiAPI(prompt);

  return response
    .split('\n')
    .map(title => title.trim())
    .filter(title => title.length > 0 && !title.match(/^\d+[\.)]/))
    .slice(0, 6);
}

export async function analyzeStyleVoice(poems: string[]): Promise<{
  voice: string;
  themes: string[];
  commonDevices: string[];
  signature: string;
}> {
  const combinedPoems = poems.join('\n\n---\n\n');

  const prompt = `Analyze the writing style and voice across these poems:

${combinedPoems}

Provide:
1. Description of the writer's unique voice
2. 4-5 recurring themes
3. 4-5 common literary devices used
4. A signature style description

Format as:
VOICE: [voice description]
THEMES: theme1, theme2, theme3, theme4, theme5
DEVICES: device1, device2, device3, device4, device5
SIGNATURE: [signature style]`;

  const response = await callGeminiAPI(prompt);

  const voiceMatch = response.match(/VOICE:\s*(.+?)(?=THEMES:|$)/s);
  const themesMatch = response.match(/THEMES:\s*(.+)/);
  const devicesMatch = response.match(/DEVICES:\s*(.+)/);
  const signatureMatch = response.match(/SIGNATURE:\s*(.+)/);

  return {
    voice: voiceMatch?.[1]?.trim() || '',
    themes: themesMatch?.[1]?.split(',').map(t => t.trim()).filter(Boolean) || [],
    commonDevices: devicesMatch?.[1]?.split(',').map(d => d.trim()).filter(Boolean) || [],
    signature: signatureMatch?.[1]?.trim() || '',
  };
}
