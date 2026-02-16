const S="AIzaSyC1RKcT1vbXGFZAvjYDMDLsX_8jt0kTILo";async function l(n,s,t={}){var a,m,u,h,f,y;console.log("API Key loaded successfully");const{temperature:e=.9,maxTokens:r=2048}=t;try{const o=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${S}`,w={contents:[{parts:[{text:`${n}

${s}`}]}],generationConfig:{temperature:e,topK:40,topP:.95,maxOutputTokens:r}};console.log("Calling Gemini API with model: gemini-2.5-flash");const c=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(w)});if(console.log("Response status:",c.status),!c.ok){const p=await c.text();console.error("API Error Response:",p);let i;try{i=JSON.parse(p)}catch{throw new Error(`API request failed with status ${c.status}: ${p.substring(0,200)}`)}const P=((a=i==null?void 0:i.error)==null?void 0:a.message)||(i==null?void 0:i.message)||"Unknown error from AI service";throw new Error(`AI Service Error: ${P}`)}const d=await c.json();console.log("API Response received successfully");const g=(y=(f=(h=(u=(m=d.candidates)==null?void 0:m[0])==null?void 0:u.content)==null?void 0:h.parts)==null?void 0:f[0])==null?void 0:y.text;if(!g)throw console.error("Unexpected response structure:",d),new Error("No text content in API response");return g}catch(o){throw console.error("Gemini API Error:",o),console.error("Error type:",o instanceof TypeError?"TypeError":typeof o),console.error("Error message:",o instanceof Error?o.message:String(o)),o instanceof TypeError&&o.message.includes("fetch")?new Error("Network error: Unable to reach AI service. Please check your internet connection and try again."):o}}async function v(n){const s="You are an expert in emotional analysis of poetry. Respond ONLY with valid JSON.",t=`Analyze the emotional sentiment of this poem:

${n}

Respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "score": 0.0-1.0
}`;try{const r=(await l(s,t,{temperature:.3})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Sentiment analysis failed:",e),{sentiment:"neutral",emotions:[],score:.5}}}async function N(n){const s="You are an expert poetry critic and judge. Respond ONLY with valid JSON.",t=`Score this poem on a scale of 1-10 for each category:

${n}

Respond with ONLY a JSON object in this exact format:
{
  "overall": 8.5,
  "imagery": 9,
  "rhythm": 7,
  "originality": 8,
  "emotion": 9,
  "feedback": "Brief constructive feedback (2-3 sentences)"
}`;try{const r=(await l(s,t,{temperature:.3})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Quality scoring failed:",e),{overall:5,imagery:5,rhythm:5,originality:5,emotion:5,feedback:"Unable to score poem at this time."}}}async function O(n){const s="You are an expert in poetry forms and structures. Respond ONLY with valid JSON.",t=`Identify the poetic form of this poem:

${n}

Respond with ONLY a JSON object in this exact format:
{
  "form": "Sonnet|Haiku|Free Verse|Limerick|Villanelle|etc",
  "confidence": 0.0-1.0,
  "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
}`;try{const r=(await l(s,t,{temperature:.2})).match(/\{[\s\S]*\}/);if(r)try{return JSON.parse(r[0])}catch(a){throw console.error("Failed to parse JSON response:",a),new Error("Invalid JSON in response")}throw new Error("Invalid response format")}catch(e){return console.error("Form detection failed:",e),{form:"Free Verse",confidence:0,characteristics:[]}}}async function E(n,s){const t="You are a creative writing instructor. Generate inspiring, specific poetry writing prompts.";let e="Generate a unique, creative poetry writing prompt.";e+=" Provide ONLY the prompt itself (2-3 sentences), no extra formatting or labels.";try{return(await l(t,e,{temperature:.9,maxTokens:200})).trim()}catch(r){return console.error("Prompt generation failed:",r),"Write a poem about a moment that changed your perspective on life."}}async function I(n,s){const t="You are a helpful poetry assistant. Provide concise, accurate responses.";try{return(await l(t,n,s)).trim()}catch(e){throw console.error("AI response generation failed:",e),e}}export{v as a,E as b,l as c,O as d,I as g,N as s};
