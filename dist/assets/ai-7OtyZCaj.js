async function a(o,n,t={}){throw console.error("API Key missing! Check your .env file has VITE_GEMINI_API_KEY"),new Error("Gemini API key not found. The VITE_GEMINI_API_KEY environment variable is not set. Please check your .env file and refresh the page.")}async function i(o){const n="You are an expert in emotional analysis of poetry. Respond ONLY with valid JSON.",t=`Analyze the emotional sentiment of this poem:

${o}

Respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "score": 0.0-1.0
}`;try{const r=(await a(n,t,{temperature:.3})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(s){throw console.error("Failed to parse JSON response:",s),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Sentiment analysis failed:",e),{sentiment:"neutral",emotions:[],score:.5}}}async function c(o){const n="You are an expert poetry critic and judge. Respond ONLY with valid JSON.",t=`Score this poem on a scale of 1-10 for each category:

${o}

Respond with ONLY a JSON object in this exact format:
{
  "overall": 8.5,
  "imagery": 9,
  "rhythm": 7,
  "originality": 8,
  "emotion": 9,
  "feedback": "Brief constructive feedback (2-3 sentences)"
}`;try{const r=(await a(n,t,{temperature:.3})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(s){throw console.error("Failed to parse JSON response:",s),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Quality scoring failed:",e),{overall:5,imagery:5,rhythm:5,originality:5,emotion:5,feedback:"Unable to score poem at this time."}}}async function m(o){const n="You are an expert in poetry forms and structures. Respond ONLY with valid JSON.",t=`Identify the poetic form of this poem:

${o}

Respond with ONLY a JSON object in this exact format:
{
  "form": "Sonnet|Haiku|Free Verse|Limerick|Villanelle|etc",
  "confidence": 0.0-1.0,
  "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
}`;try{const r=(await a(n,t,{temperature:.2})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(s){throw console.error("Failed to parse JSON response:",s),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Form detection failed:",e),{form:"Free Verse",confidence:0,characteristics:[]}}}async function p(o,n){const t="You are a creative writing instructor. Generate inspiring, specific poetry writing prompts.";let e="Generate a unique, creative poetry writing prompt.";e+=" Provide ONLY the prompt itself (2-3 sentences), no extra formatting or labels.";try{return(await a(t,e,{temperature:.9,maxTokens:200})).trim()}catch(r){return console.error("Prompt generation failed:",r),"Write a poem about a moment that changed your perspective on life."}}async function l(o,n){const t="You are a helpful poetry assistant. Provide concise, accurate responses.";try{return(await a(t,o,n)).trim()}catch(e){throw console.error("AI response generation failed:",e),e}}export{i as a,p as b,a as c,m as d,l as g,c as s};
