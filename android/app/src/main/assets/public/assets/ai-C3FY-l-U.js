const w="AIzaSyC1RKcT1vbXGFZAvjYDMDLsX_8jt0kTILo";async function l(n,s,o={}){var a,m,u,h,f,d;console.log("API Key present:",`Yes (${w.substring(0,10)}...)`);const{temperature:e=.9,maxTokens:r=2048}=o;try{const t=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${w}`,v={contents:[{parts:[{text:`${n}

${s}`}]}],generationConfig:{temperature:e,topK:40,topP:.95,maxOutputTokens:r}};console.log("Calling Gemini API with model: gemini-2.5-flash");const c=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)});if(console.log("Response status:",c.status),!c.ok){const p=await c.text();console.error("API Error Response:",p);let i;try{i=JSON.parse(p)}catch{throw new Error(`API request failed with status ${c.status}: ${p.substring(0,200)}`)}const S=((a=i==null?void 0:i.error)==null?void 0:a.message)||(i==null?void 0:i.message)||"Unknown error from AI service";throw new Error(`AI Service Error: ${S}`)}const y=await c.json();console.log("API Response received successfully");const g=(d=(f=(h=(u=(m=y.candidates)==null?void 0:m[0])==null?void 0:u.content)==null?void 0:h.parts)==null?void 0:f[0])==null?void 0:d.text;if(!g)throw console.error("Unexpected response structure:",y),new Error("No text content in API response");return g}catch(t){throw console.error("Gemini API Error:",t),console.error("Error type:",t instanceof TypeError?"TypeError":typeof t),console.error("Error message:",t instanceof Error?t.message:String(t)),t instanceof TypeError&&t.message.includes("fetch")?new Error('Network error: Unable to reach AI service. Please restart your dev server (stop and run "npm run dev" again) to load the new API key.'):t}}async function P(n){const s="You are an expert in emotional analysis of poetry. Respond ONLY with valid JSON.",o=`Analyze the emotional sentiment of this poem:

${n}

Respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "score": 0.0-1.0
}`;try{const r=(await l(s,o,{temperature:.3})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Sentiment analysis failed:",e),{sentiment:"neutral",emotions:[],score:.5}}}async function N(n){const s="You are an expert poetry critic and judge. Respond ONLY with valid JSON.",o=`Score this poem on a scale of 1-10 for each category:

${n}

Respond with ONLY a JSON object in this exact format:
{
  "overall": 8.5,
  "imagery": 9,
  "rhythm": 7,
  "originality": 8,
  "emotion": 9,
  "feedback": "Brief constructive feedback (2-3 sentences)"
}`;try{const r=(await l(s,o,{temperature:.3})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Quality scoring failed:",e),{overall:5,imagery:5,rhythm:5,originality:5,emotion:5,feedback:"Unable to score poem at this time."}}}async function O(n){const s="You are an expert in poetry forms and structures. Respond ONLY with valid JSON.",o=`Identify the poetic form of this poem:

${n}

Respond with ONLY a JSON object in this exact format:
{
  "form": "Sonnet|Haiku|Free Verse|Limerick|Villanelle|etc",
  "confidence": 0.0-1.0,
  "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
}`;try{const r=(await l(s,o,{temperature:.2})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Form detection failed:",e),{form:"Free Verse",confidence:0,characteristics:[]}}}async function E(n,s){const o="You are a creative writing instructor. Generate inspiring, specific poetry writing prompts.";let e="Generate a unique, creative poetry writing prompt.";e+=" Provide ONLY the prompt itself (2-3 sentences), no extra formatting or labels.";try{return(await l(o,e,{temperature:.9,maxTokens:200})).trim()}catch(r){return console.error("Prompt generation failed:",r),"Write a poem about a moment that changed your perspective on life."}}export{P as a,l as c,O as d,E as g,N as s};
