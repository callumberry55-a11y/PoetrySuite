async function s(r,o,n={}){throw console.error("API Key missing! Check your .env file has VITE_GEMINI_API_KEY"),new Error("Gemini API key not found. The VITE_GEMINI_API_KEY environment variable is not set. Please check your .env file and refresh the page.")}async function c(r){const o="You are an expert in emotional analysis of poetry. Respond ONLY with valid JSON.",n=`Analyze the emotional sentiment of this poem:

${r}

Respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "score": 0.0-1.0
}`;try{const t=(await s(o,n,{temperature:.3})).match(/\{[\s\S]*\}/);if(t)try{return JSON.parse(t[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Sentiment analysis failed:",e),{sentiment:"neutral",emotions:[],score:.5}}}async function m(r){const o="You are a creative poet. Generate evocative, memorable titles for poems.",n=`Generate a creative, evocative title for this poem (provide ONLY the title, no quotes or extra text):

${r}`;try{return(await s(o,n,{temperature:.8,maxTokens:50})).trim().replace(/^["']|["']$/g,"")}catch(e){return console.error("Title generation failed:",e),"Untitled Poem"}}async function l(r){const o="You are an expert poetry critic and judge. Respond ONLY with valid JSON.",n=`Score this poem on a scale of 1-10 for each category:

${r}

Respond with ONLY a JSON object in this exact format:
{
  "overall": 8.5,
  "imagery": 9,
  "rhythm": 7,
  "originality": 8,
  "emotion": 9,
  "feedback": "Brief constructive feedback (2-3 sentences)"
}`;try{const t=(await s(o,n,{temperature:.3})).match(/\{[\s\S]*\}/);if(t)try{return JSON.parse(t[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Quality scoring failed:",e),{overall:5,imagery:5,rhythm:5,originality:5,emotion:5,feedback:"Unable to score poem at this time."}}}async function p(r){const o="You are an expert in poetry forms and structures. Respond ONLY with valid JSON.",n=`Identify the poetic form of this poem:

${r}

Respond with ONLY a JSON object in this exact format:
{
  "form": "Sonnet|Haiku|Free Verse|Limerick|Villanelle|etc",
  "confidence": 0.0-1.0,
  "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
}`;try{const t=(await s(o,n,{temperature:.2})).match(/\{[\s\S]*\}/);if(t)try{return JSON.parse(t[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Form detection failed:",e),{form:"Free Verse",confidence:0,characteristics:[]}}}async function u(r,o){const n="You are a creative writing instructor. Generate inspiring, specific poetry writing prompts.";let e="Generate a unique, creative poetry writing prompt.";r&&(e+=` Theme: ${r}.`),o&&(e+=` Difficulty level: ${o}.`),e+=" Provide ONLY the prompt itself (2-3 sentences), no extra formatting or labels.";try{return(await s(n,e,{temperature:.9,maxTokens:200})).trim()}catch(t){return console.error("Prompt generation failed:",t),"Write a poem about a moment that changed your perspective on life."}}async function h(r,o){const n="You are a poetry editor. Suggest improved versions of poetic lines.",e=`Suggest 3 improved versions of this line from a poem:

Line: "${r}"

Context (surrounding lines):
${o}

Provide 3 alternative versions that improve imagery, rhythm, or impact. List them one per line, no numbering or extra text.`;try{const a=(await s(n,e,{temperature:.8,maxTokens:300})).split(`
`).filter(i=>i.trim()).slice(0,3);return a.length>0?a:[r]}catch(t){return console.error("Line improvement failed:",t),[r]}}async function y(r,o){const n="You are a thesaurus and poetry assistant. Provide contextually appropriate synonyms.",e=`Find 10-15 synonyms for "${r}" in this poetic context:

${o}

Provide words that work well in poetry, considering tone, rhythm, and imagery. List words separated by commas, no extra text.`;try{return(await s(n,e,{temperature:.7,maxTokens:200})).split(/[,\n]/).map(i=>i.trim()).filter(i=>i&&i.length>0).slice(0,15)}catch(t){return console.error("Synonym finding failed:",t),[r]}}async function f(r,o){const n="You are a helpful poetry assistant. Provide concise, accurate responses.";try{return(await s(n,r,o)).trim()}catch(e){throw console.error("AI response generation failed:",e),e}}async function d(r){const o="You are a color theory and UI design expert. Generate harmonious color palettes. Respond ONLY with valid JSON.",n=`Generate a color theme based on this description: "${r}"

Create a harmonious color palette suitable for a poetry writing app. Consider:
- Primary color: Main brand color (hex)
- Secondary color: Complementary accent (hex)
- Background: Main background color (hex)
- Surface: Card/surface color (hex)
- Text: Primary text color (hex)
- Accent: Highlight/emphasis color (hex)

Ensure good contrast and readability. Respond with ONLY a JSON object in this exact format:
{
  "primary": "#hex",
  "secondary": "#hex",
  "background": "#hex",
  "surface": "#hex",
  "text": "#hex",
  "accent": "#hex"
}`;try{const t=(await s(o,n,{temperature:.7,maxTokens:300})).match(/\{[\s\S]*\}/);if(t)try{const a=JSON.parse(t[0]);if(a.primary&&a.background&&a.text)return a}catch(a){console.error("Failed to parse theme JSON:",a)}throw new Error("Invalid theme response format")}catch(e){return console.error("Theme generation failed:",e),{primary:"#3b82f6",secondary:"#8b5cf6",background:"#ffffff",surface:"#f8f9fa",text:"#1a1a1a",accent:"#06b6d4"}}}export{c as analyzePoemSentiment,s as callGeminiAPI,p as detectPoemForm,y as findSynonyms,f as generateAIResponse,m as generatePoemTitle,d as generateTheme,u as generateWritingPrompt,h as improveLine,l as scorePoemQuality};
