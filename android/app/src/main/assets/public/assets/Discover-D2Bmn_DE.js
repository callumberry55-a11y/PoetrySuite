import{r as x,j as s,g as k,S as H,Z as z,h as B,i as Y,L as K,X as Se}from"./index-2dP_p1EG.js";import{r as Oe}from"./security-CwStJ5w9.js";import{B as q,L as E}from"./loader-circle-C-6CshF_.js";import{M as V,L as J}from"./music-D0uzgbuq.js";import"./index.esm-hzf3Ma5u.js";var W;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(W||(W={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(X||(X={}));var Q;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(Q||(Q={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z=["user","model","function","system"];var ee;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(ee||(ee={}));var te;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(te||(te={}));var ne;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(ne||(ne={}));var se;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(se||(se={}));var I;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.BLOCKLIST="BLOCKLIST",e.PROHIBITED_CONTENT="PROHIBITED_CONTENT",e.SPII="SPII",e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",e.OTHER="OTHER"})(I||(I={}));var oe;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(oe||(oe={}));var ie;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(ie||(ie={}));var ae;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(ae||(ae={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y extends Error{constructor(n){super(`[GoogleGenerativeAI Error]: ${n}`)}}class A extends y{constructor(n,t){super(n),this.response=t}}class he extends y{constructor(n,t,i,o){super(n),this.status=t,this.statusText=i,this.errorDetails=o}}class j extends y{}class ge extends y{}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Te="https://generativelanguage.googleapis.com",Me="v1beta",ke="0.24.1",Ge="genai-js";var _;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(_||(_={}));class Le{constructor(n,t,i,o,a){this.model=n,this.task=t,this.apiKey=i,this.stream=o,this.requestOptions=a}toString(){var n,t;const i=((n=this.requestOptions)===null||n===void 0?void 0:n.apiVersion)||Me;let a=`${((t=this.requestOptions)===null||t===void 0?void 0:t.baseUrl)||Te}/${i}/${this.model}:${this.task}`;return this.stream&&(a+="?alt=sse"),a}}function De(e){const n=[];return e!=null&&e.apiClient&&n.push(e.apiClient),n.push(`${Ge}/${ke}`),n.join(" ")}async function Pe(e){var n;const t=new Headers;t.append("Content-Type","application/json"),t.append("x-goog-api-client",De(e.requestOptions)),t.append("x-goog-api-key",e.apiKey);let i=(n=e.requestOptions)===null||n===void 0?void 0:n.customHeaders;if(i){if(!(i instanceof Headers))try{i=new Headers(i)}catch(o){throw new j(`unable to convert customHeaders value ${JSON.stringify(i)} to Headers: ${o.message}`)}for(const[o,a]of i.entries()){if(o==="x-goog-api-key")throw new j(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new j(`Header name ${o} can only be set using the apiClient field`);t.append(o,a)}}return t}async function Fe(e,n,t,i,o,a){const r=new Le(e,n,t,i,a);return{url:r.toString(),fetchOptions:Object.assign(Object.assign({},ze(a)),{method:"POST",headers:await Pe(r),body:o})}}async function O(e,n,t,i,o,a={},r=fetch){const{url:l,fetchOptions:d}=await Fe(e,n,t,i,o,a);return Ue(l,d,r)}async function Ue(e,n,t=fetch){let i;try{i=await t(e,n)}catch(o){$e(o,e)}return i.ok||await He(i,e),i}function $e(e,n){let t=e;throw t.name==="AbortError"?(t=new ge(`Request aborted when fetching ${n.toString()}: ${e.message}`),t.stack=e.stack):e instanceof he||e instanceof j||(t=new y(`Error fetching from ${n.toString()}: ${e.message}`),t.stack=e.stack),t}async function He(e,n){let t="",i;try{const o=await e.json();t=o.error.message,o.error.details&&(t+=` ${JSON.stringify(o.error.details)}`,i=o.error.details)}catch{}throw new he(`Error fetching from ${n.toString()}: [${e.status} ${e.statusText}] ${t}`,e.status,e.statusText,i)}function ze(e){const n={};if((e==null?void 0:e.signal)!==void 0||(e==null?void 0:e.timeout)>=0){const t=new AbortController;(e==null?void 0:e.timeout)>=0&&setTimeout(()=>t.abort(),e.timeout),e!=null&&e.signal&&e.signal.addEventListener("abort",()=>{t.abort()}),n.signal=t.signal}return n}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),G(e.candidates[0]))throw new A(`${w(e)}`,e);return Be(e)}else if(e.promptFeedback)throw new A(`Text not available. ${w(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),G(e.candidates[0]))throw new A(`${w(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),re(e)[0]}else if(e.promptFeedback)throw new A(`Function call not available. ${w(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),G(e.candidates[0]))throw new A(`${w(e)}`,e);return re(e)}else if(e.promptFeedback)throw new A(`Function call not available. ${w(e)}`,e)},e}function Be(e){var n,t,i,o;const a=[];if(!((t=(n=e.candidates)===null||n===void 0?void 0:n[0].content)===null||t===void 0)&&t.parts)for(const r of(o=(i=e.candidates)===null||i===void 0?void 0:i[0].content)===null||o===void 0?void 0:o.parts)r.text&&a.push(r.text),r.executableCode&&a.push("\n```"+r.executableCode.language+`
`+r.executableCode.code+"\n```\n"),r.codeExecutionResult&&a.push("\n```\n"+r.codeExecutionResult.output+"\n```\n");return a.length>0?a.join(""):""}function re(e){var n,t,i,o;const a=[];if(!((t=(n=e.candidates)===null||n===void 0?void 0:n[0].content)===null||t===void 0)&&t.parts)for(const r of(o=(i=e.candidates)===null||i===void 0?void 0:i[0].content)===null||o===void 0?void 0:o.parts)r.functionCall&&a.push(r.functionCall);if(a.length>0)return a}const Ye=[I.RECITATION,I.SAFETY,I.LANGUAGE];function G(e){return!!e.finishReason&&Ye.includes(e.finishReason)}function w(e){var n,t,i;let o="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)o+="Response was blocked",!((n=e.promptFeedback)===null||n===void 0)&&n.blockReason&&(o+=` due to ${e.promptFeedback.blockReason}`),!((t=e.promptFeedback)===null||t===void 0)&&t.blockReasonMessage&&(o+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((i=e.candidates)===null||i===void 0)&&i[0]){const a=e.candidates[0];G(a)&&(o+=`Candidate was blocked due to ${a.finishReason}`,a.finishMessage&&(o+=`: ${a.finishMessage}`))}return o}function R(e){return this instanceof R?(this.v=e,this):new R(e)}function Ke(e,n,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i=t.apply(e,n||[]),o,a=[];return o={},r("next"),r("throw"),r("return"),o[Symbol.asyncIterator]=function(){return this},o;function r(f){i[f]&&(o[f]=function(m){return new Promise(function(h,b){a.push([f,m,h,b])>1||l(f,m)})})}function l(f,m){try{d(i[f](m))}catch(h){C(a[0][3],h)}}function d(f){f.value instanceof R?Promise.resolve(f.value.v).then(u,v):C(a[0][2],f)}function u(f){l("next",f)}function v(f){l("throw",f)}function C(f,m){f(m),a.shift(),a.length&&l(a[0][0],a[0][1])}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const le=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function qe(e){const n=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),t=We(n),[i,o]=t.tee();return{stream:Je(i),response:Ve(o)}}async function Ve(e){const n=[],t=e.getReader();for(;;){const{done:i,value:o}=await t.read();if(i)return L(Xe(n));n.push(o)}}function Je(e){return Ke(this,arguments,function*(){const t=e.getReader();for(;;){const{value:i,done:o}=yield R(t.read());if(o)break;yield yield R(L(i))}})}function We(e){const n=e.getReader();return new ReadableStream({start(i){let o="";return a();function a(){return n.read().then(({value:r,done:l})=>{if(l){if(o.trim()){i.error(new y("Failed to parse stream"));return}i.close();return}o+=r;let d=o.match(le),u;for(;d;){try{u=JSON.parse(d[1])}catch{i.error(new y(`Error parsing JSON response: "${d[1]}"`));return}i.enqueue(u),o=o.substring(d[0].length),d=o.match(le)}return a()}).catch(r=>{let l=r;throw l.stack=r.stack,l.name==="AbortError"?l=new ge("Request aborted when reading from the stream"):l=new y("Error reading from the stream"),l})}}})}function Xe(e){const n=e[e.length-1],t={promptFeedback:n==null?void 0:n.promptFeedback};for(const i of e){if(i.candidates){let o=0;for(const a of i.candidates)if(t.candidates||(t.candidates=[]),t.candidates[o]||(t.candidates[o]={index:o}),t.candidates[o].citationMetadata=a.citationMetadata,t.candidates[o].groundingMetadata=a.groundingMetadata,t.candidates[o].finishReason=a.finishReason,t.candidates[o].finishMessage=a.finishMessage,t.candidates[o].safetyRatings=a.safetyRatings,a.content&&a.content.parts){t.candidates[o].content||(t.candidates[o].content={role:a.content.role||"user",parts:[]});const r={};for(const l of a.content.parts)l.text&&(r.text=l.text),l.functionCall&&(r.functionCall=l.functionCall),l.executableCode&&(r.executableCode=l.executableCode),l.codeExecutionResult&&(r.codeExecutionResult=l.codeExecutionResult),Object.keys(r).length===0&&(r.text=""),t.candidates[o].content.parts.push(r)}o++}i.usageMetadata&&(t.usageMetadata=i.usageMetadata)}return t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function pe(e,n,t,i){const o=await O(n,_.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(t),i);return qe(o)}async function ye(e,n,t,i){const a=await(await O(n,_.GENERATE_CONTENT,e,!1,JSON.stringify(t),i)).json();return{response:L(a)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xe(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function S(e){let n=[];if(typeof e=="string")n=[{text:e}];else for(const t of e)typeof t=="string"?n.push({text:t}):n.push(t);return Qe(n)}function Qe(e){const n={role:"user",parts:[]},t={role:"function",parts:[]};let i=!1,o=!1;for(const a of e)"functionResponse"in a?(t.parts.push(a),o=!0):(n.parts.push(a),i=!0);if(i&&o)throw new y("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!i&&!o)throw new y("No content is provided for sending chat message.");return i?n:t}function Ze(e,n){var t;let i={model:n==null?void 0:n.model,generationConfig:n==null?void 0:n.generationConfig,safetySettings:n==null?void 0:n.safetySettings,tools:n==null?void 0:n.tools,toolConfig:n==null?void 0:n.toolConfig,systemInstruction:n==null?void 0:n.systemInstruction,cachedContent:(t=n==null?void 0:n.cachedContent)===null||t===void 0?void 0:t.name,contents:[]};const o=e.generateContentRequest!=null;if(e.contents){if(o)throw new j("CountTokensRequest must have one of contents or generateContentRequest, not both.");i.contents=e.contents}else if(o)i=Object.assign(Object.assign({},i),e.generateContentRequest);else{const a=S(e);i.contents=[a]}return{generateContentRequest:i}}function ce(e){let n;return e.contents?n=e:n={contents:[S(e)]},e.systemInstruction&&(n.systemInstruction=xe(e.systemInstruction)),n}function et(e){return typeof e=="string"||Array.isArray(e)?{content:S(e)}:e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const de=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],tt={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function nt(e){let n=!1;for(const t of e){const{role:i,parts:o}=t;if(!n&&i!=="user")throw new y(`First content should be with role 'user', got ${i}`);if(!Z.includes(i))throw new y(`Each item should include role field. Got ${i} but valid roles are: ${JSON.stringify(Z)}`);if(!Array.isArray(o))throw new y("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new y("Each Content should have at least one part");const a={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const l of o)for(const d of de)d in l&&(a[d]+=1);const r=tt[i];for(const l of de)if(!r.includes(l)&&a[l]>0)throw new y(`Content with role '${i}' can't contain '${l}' part`);n=!0}}function ue(e){var n;if(e.candidates===void 0||e.candidates.length===0)return!1;const t=(n=e.candidates[0])===null||n===void 0?void 0:n.content;if(t===void 0||t.parts===void 0||t.parts.length===0)return!1;for(const i of t.parts)if(i===void 0||Object.keys(i).length===0||i.text!==void 0&&i.text==="")return!1;return!0}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fe="SILENT_ERROR";class st{constructor(n,t,i,o={}){this.model=t,this.params=i,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=n,i!=null&&i.history&&(nt(i.history),this._history=i.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(n,t={}){var i,o,a,r,l,d;await this._sendPromise;const u=S(n),v={safetySettings:(i=this.params)===null||i===void 0?void 0:i.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(a=this.params)===null||a===void 0?void 0:a.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(l=this.params)===null||l===void 0?void 0:l.systemInstruction,cachedContent:(d=this.params)===null||d===void 0?void 0:d.cachedContent,contents:[...this._history,u]},C=Object.assign(Object.assign({},this._requestOptions),t);let f;return this._sendPromise=this._sendPromise.then(()=>ye(this._apiKey,this.model,v,C)).then(m=>{var h;if(ue(m.response)){this._history.push(u);const b=Object.assign({parts:[],role:"model"},(h=m.response.candidates)===null||h===void 0?void 0:h[0].content);this._history.push(b)}else{const b=w(m.response);b&&console.warn(`sendMessage() was unsuccessful. ${b}. Inspect response object for details.`)}f=m}).catch(m=>{throw this._sendPromise=Promise.resolve(),m}),await this._sendPromise,f}async sendMessageStream(n,t={}){var i,o,a,r,l,d;await this._sendPromise;const u=S(n),v={safetySettings:(i=this.params)===null||i===void 0?void 0:i.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(a=this.params)===null||a===void 0?void 0:a.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(l=this.params)===null||l===void 0?void 0:l.systemInstruction,cachedContent:(d=this.params)===null||d===void 0?void 0:d.cachedContent,contents:[...this._history,u]},C=Object.assign(Object.assign({},this._requestOptions),t),f=pe(this._apiKey,this.model,v,C);return this._sendPromise=this._sendPromise.then(()=>f).catch(m=>{throw new Error(fe)}).then(m=>m.response).then(m=>{if(ue(m)){this._history.push(u);const h=Object.assign({},m.candidates[0].content);h.role||(h.role="model"),this._history.push(h)}else{const h=w(m);h&&console.warn(`sendMessageStream() was unsuccessful. ${h}. Inspect response object for details.`)}}).catch(m=>{m.message!==fe&&console.error(m)}),f}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ot(e,n,t,i){return(await O(n,_.COUNT_TOKENS,e,!1,JSON.stringify(t),i)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function it(e,n,t,i){return(await O(n,_.EMBED_CONTENT,e,!1,JSON.stringify(t),i)).json()}async function at(e,n,t,i){const o=t.requests.map(r=>Object.assign(Object.assign({},r),{model:n}));return(await O(n,_.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:o}),i)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me{constructor(n,t,i={}){this.apiKey=n,this._requestOptions=i,t.model.includes("/")?this.model=t.model:this.model=`models/${t.model}`,this.generationConfig=t.generationConfig||{},this.safetySettings=t.safetySettings||[],this.tools=t.tools,this.toolConfig=t.toolConfig,this.systemInstruction=xe(t.systemInstruction),this.cachedContent=t.cachedContent}async generateContent(n,t={}){var i;const o=ce(n),a=Object.assign(Object.assign({},this._requestOptions),t);return ye(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(i=this.cachedContent)===null||i===void 0?void 0:i.name},o),a)}async generateContentStream(n,t={}){var i;const o=ce(n),a=Object.assign(Object.assign({},this._requestOptions),t);return pe(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(i=this.cachedContent)===null||i===void 0?void 0:i.name},o),a)}startChat(n){var t;return new st(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(t=this.cachedContent)===null||t===void 0?void 0:t.name},n),this._requestOptions)}async countTokens(n,t={}){const i=Ze(n,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),t);return ot(this.apiKey,this.model,i,o)}async embedContent(n,t={}){const i=et(n),o=Object.assign(Object.assign({},this._requestOptions),t);return it(this.apiKey,this.model,i,o)}async batchEmbedContents(n,t={}){const i=Object.assign(Object.assign({},this._requestOptions),t);return at(this.apiKey,this.model,n,i)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(n){this.apiKey=n}getGenerativeModel(n,t){if(!n.model)throw new y("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new me(this.apiKey,n,t)}getGenerativeModelFromCachedContent(n,t,i){if(!n.name)throw new j("Cached content must contain a `name` field.");if(!n.model)throw new j("Cached content must contain a `model` field.");const o=["model","systemInstruction"];for(const r of o)if(t!=null&&t[r]&&n[r]&&(t==null?void 0:t[r])!==n[r]){if(r==="model"){const l=t.model.startsWith("models/")?t.model.replace("models/",""):t.model,d=n.model.startsWith("models/")?n.model.replace("models/",""):n.model;if(l===d)continue}throw new j(`Different value for "${r}" specified in modelParams (${t[r]}) and cachedContent (${n[r]})`)}const a=Object.assign(Object.assign({},t),{model:n.model,tools:n.tools,toolConfig:n.toolConfig,systemInstruction:n.systemInstruction,cachedContent:n});return new me(this.apiKey,a,i)}}const N=new rt("AIzaSyC1RKcT1vbXGFZAvjYDMDLsX_8jt0kTILo");function mt(){const[e,n]=x.useState("checking"),[t,i]=x.useState(null),[o,a]=x.useState(""),[r,l]=x.useState(""),[d,u]=x.useState(!1),[v,C]=x.useState("sonnet"),[f,m]=x.useState(""),[h,b]=x.useState(""),[D,ve]=x.useState("Spanish"),[T,P]=x.useState(""),[M,F]=x.useState("");x.useEffect(()=>{const c=async()=>{n("checking");const Re=await Oe("some-user-input");n(Re?"active":"inactive")},g=setTimeout(c,0),p=setInterval(c,5e3);return()=>{clearTimeout(g),clearInterval(p)}},[]);const be=async()=>{if(o.trim()){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`As a poetry expert, analyze the following poem and provide constructive feedback and suggestions for improvement:

${o}

Provide specific suggestions on imagery, word choice, rhythm, and overall impact.`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error generating suggestions. Please try again.")}finally{u(!1)}}},Ce=async()=>{if(o.trim()){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`Analyze the writing style of this poem and provide detailed insights:

${o}

Include: tone, voice, literary devices used, stylistic patterns, and unique characteristics.`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error analyzing style. Please try again.")}finally{u(!1)}}},Ee=async()=>{if(!(!f.trim()&&!h.trim())){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`Generate 3-5 creative poem ideas based on:
Theme: ${f||"any"}
Emotion: ${h||"any"}

Provide brief descriptions for each idea that a poet could develop.`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error generating ideas. Please try again.")}finally{u(!1)}}},Ne=async()=>{if(o.trim()){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`Validate if this poem follows the rules of a ${v}:

${o}

Provide detailed feedback on structure, rhyme scheme, meter, and any deviations from the traditional form.`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error validating form. Please try again.")}finally{u(!1)}}},we=async()=>{if(o.trim()){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`Perform an advanced analysis of the rhyme scheme and meter of this poem:

${o}

Provide:
1. Detailed rhyme scheme (ABAB, etc.)
2. Meter analysis (iambic pentameter, etc.)
3. Syllable count per line
4. Internal rhymes and sound patterns
5. Suggestions for improving rhythm and flow`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error analyzing rhyme and meter. Please try again.")}finally{u(!1)}}},je=async()=>{if(T.trim()){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`You are a collaborative poetry writing partner. Based on this context or starting lines:

${T}

Continue the poem or suggest next lines that maintain the style, theme, and flow. Provide 2-3 different continuation options.`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error generating co-writing suggestions. Please try again.")}finally{u(!1)}}},_e=async()=>{if(M.trim()){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`Based on these poetry preferences:

${M}

Provide personalized recommendations including:
1. Poets and authors to explore
2. Poetry styles and forms to try
3. Themes that might resonate
4. Writing exercises to develop your style
5. Classic and contemporary poems to read`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error generating recommendations. Please try again.")}finally{u(!1)}}},Ae=async()=>{if(o.trim()){u(!0),l("");try{const c=N.getGenerativeModel({model:"gemini-pro"}),g=`Translate this poem to ${D}, preserving its poetic essence:

${o}

Provide:
1. The translated poem
2. Notes on how you preserved rhythm, imagery, and meaning
3. Any cultural adaptations made
4. Alternative word choices for key phrases`,p=await c.generateContent(g);l(p.response.text())}catch{l("Error translating poem. Please try again.")}finally{u(!1)}}},U=()=>{i(null),a(""),l(""),m(""),b(""),P(""),F("")},$=()=>{switch(e){case"active":return s.jsxs("div",{className:"flex items-center gap-2 text-sm text-green-600 dark:text-green-400",children:[s.jsx(k,{size:18}),s.jsx("span",{className:"hidden sm:inline",children:"AI Security Guard: Active"}),s.jsx("span",{className:"sm:hidden",children:"Security Active"})]});case"inactive":return s.jsxs("div",{className:"flex items-center gap-2 text-sm text-red-600 dark:text-red-400",children:[s.jsx(k,{size:18}),s.jsx("span",{className:"hidden sm:inline",children:"AI Security Guard: Inactive"}),s.jsx("span",{className:"sm:hidden",children:"Security Inactive"})]});case"checking":return s.jsxs("div",{className:"flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400",children:[s.jsx(k,{size:18,className:"animate-pulse"}),s.jsx("span",{className:"hidden sm:inline",children:"AI Security Guard: Checking..."}),s.jsx("span",{className:"sm:hidden",children:"Checking..."})]});default:return null}},Ie=[{icon:H,title:"AI Poetry Assistant",description:"Get intelligent suggestions and improvements for your poetry",color:"from-purple-500 to-violet-500",status:"Available",type:"assistant"},{icon:q,title:"Style Analysis",description:"Analyze your writing style and get personalized insights",color:"from-purple-500 to-pink-500",status:"Available",type:"analysis"},{icon:z,title:"Quick Generate",description:"Generate poem ideas based on themes and emotions",color:"from-cyan-400 to-sky-500",status:"Available",type:"generate"},{icon:B,title:"Form Validator",description:"Check if your poem matches specific poetic forms",color:"from-green-500 to-emerald-500",status:"Available",type:"validator"},{icon:V,title:"Rhyme & Meter Analysis",description:"Advanced analysis of rhyme schemes and metrical patterns",color:"from-rose-500 to-red-500",status:"Available",type:"rhyme-meter"},{icon:Y,title:"AI Co-Writing",description:"Collaborate with AI to continue and develop your poems",color:"from-violet-500 to-purple-500",status:"Available",type:"cowrite"},{icon:K,title:"Poetry Recommendations",description:"Get personalized suggestions based on your preferences",color:"from-amber-500 to-yellow-500",status:"Available",type:"recommendations"},{icon:J,title:"Translation & Adaptation",description:"Translate poems while preserving poetic essence",color:"from-teal-500 to-cyan-500",status:"Available",type:"translate"}];return s.jsxs("div",{className:"w-full h-full flex flex-col bg-gradient-to-br from-background to-secondary-container/20",children:[s.jsxs("div",{className:"p-4 sm:p-6 border-b border-outline",children:[s.jsxs("div",{className:"flex items-center justify-between mb-4 sm:mb-6",children:[s.jsx("h1",{className:"text-2xl sm:text-3xl font-bold text-on-background",children:"AI Hub"}),$()]}),s.jsx("p",{className:"text-on-surface-variant text-sm sm:text-base",children:"Enhance your poetry with AI-powered tools and insights"})]}),s.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6",children:s.jsxs("div",{className:"max-w-4xl mx-auto",children:[s.jsx("div",{className:"mb-6 sm:mb-8",children:s.jsx("div",{className:"bg-gradient-to-r from-primary/10 to-tertiary/10 rounded-2xl p-4 sm:p-6 border border-outline",children:s.jsxs("div",{className:"flex items-start gap-3 sm:gap-4",children:[s.jsx(k,{className:"text-primary flex-shrink-0",size:32}),s.jsxs("div",{children:[s.jsx("h2",{className:"text-lg sm:text-xl font-bold text-on-surface mb-2",children:"AI Security Guard"}),s.jsx("p",{className:"text-sm sm:text-base text-on-surface-variant mb-3",children:"Our AI-powered security system monitors all content in real-time to ensure a safe and respectful community."}),s.jsx("div",{className:"inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-surface border border-outline",children:$()})]})]})})}),s.jsx("h2",{className:"text-xl sm:text-2xl font-bold text-on-surface mb-4 sm:mb-6",children:"AI-Powered Tools"}),s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-6",children:Ie.map((c,g)=>s.jsxs("div",{className:"bg-surface rounded-xl shadow-sm border border-outline overflow-hidden hover:shadow-lg transition-all group",children:[s.jsx("div",{className:`h-2 bg-gradient-to-r ${c.color}`}),s.jsx("div",{className:"p-4 sm:p-6",children:s.jsxs("div",{className:"flex items-start gap-3 sm:gap-4",children:[s.jsx("div",{className:`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${c.color} bg-opacity-10`,children:s.jsx(c.icon,{className:"text-on-surface",size:24})}),s.jsxs("div",{className:"flex-1",children:[s.jsx("h3",{className:"text-lg sm:text-xl font-bold text-on-surface mb-2",children:c.title}),s.jsx("p",{className:"text-sm sm:text-base text-on-surface-variant mb-4",children:c.description}),s.jsxs("div",{className:"flex items-center justify-between",children:[s.jsx("span",{className:"text-xs sm:text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium",children:c.status}),s.jsx("button",{onClick:()=>i(c.type),className:"px-3 sm:px-4 py-2 bg-primary text-on-primary rounded-lg font-medium transition-all group-hover:shadow-md text-sm sm:text-base hover:bg-primary/90",children:"Try Now"})]})]})]})})]},g))})]})}),t&&s.jsx("div",{className:"fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4",onClick:U,children:s.jsxs("div",{className:"bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden",onClick:c=>c.stopPropagation(),children:[s.jsxs("div",{className:"flex items-center justify-between p-6 border-b border-outline",children:[s.jsxs("h2",{className:"text-2xl font-bold text-on-surface",children:[t==="assistant"&&"AI Poetry Assistant",t==="analysis"&&"Style Analysis",t==="generate"&&"Quick Generate",t==="validator"&&"Form Validator",t==="rhyme-meter"&&"Rhyme & Meter Analysis",t==="cowrite"&&"AI Co-Writing",t==="recommendations"&&"Poetry Recommendations",t==="translate"&&"Translation & Adaptation"]}),s.jsx("button",{onClick:U,className:"p-2 hover:bg-on-surface/10 rounded-full transition-colors",children:s.jsx(Se,{size:24,className:"text-on-surface-variant"})})]}),s.jsxs("div",{className:"p-6 overflow-y-auto max-h-[calc(90vh-140px)]",children:[t==="assistant"&&s.jsxs("div",{className:"space-y-4",children:[s.jsx("textarea",{value:o,onChange:c=>a(c.target.value),placeholder:"Paste your poem here...",className:"w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"}),s.jsxs("button",{onClick:be,disabled:d||!o.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(H,{size:20}),d?"Analyzing...":"Get Suggestions"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"Suggestions:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]}),t==="analysis"&&s.jsxs("div",{className:"space-y-4",children:[s.jsx("textarea",{value:o,onChange:c=>a(c.target.value),placeholder:"Paste your poem here for style analysis...",className:"w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"}),s.jsxs("button",{onClick:Ce,disabled:d||!o.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(q,{size:20}),d?"Analyzing...":"Analyze Style"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"Style Analysis:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]}),t==="generate"&&s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-on-surface mb-2",children:"Theme"}),s.jsx("input",{type:"text",value:f,onChange:c=>m(c.target.value),placeholder:"e.g., nature, love, time...",className:"w-full p-3 rounded-lg border border-outline bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"})]}),s.jsxs("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-on-surface mb-2",children:"Emotion"}),s.jsx("input",{type:"text",value:h,onChange:c=>b(c.target.value),placeholder:"e.g., joy, melancholy, hope...",className:"w-full p-3 rounded-lg border border-outline bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"})]}),s.jsxs("button",{onClick:Ee,disabled:d||!f.trim()&&!h.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(z,{size:20}),d?"Generating...":"Generate Ideas"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"Poem Ideas:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]}),t==="validator"&&s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-on-surface mb-2",children:"Poetic Form"}),s.jsxs("select",{value:v,onChange:c=>C(c.target.value),className:"w-full p-3 rounded-lg border border-outline bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary",children:[s.jsx("option",{value:"sonnet",children:"Sonnet"}),s.jsx("option",{value:"haiku",children:"Haiku"}),s.jsx("option",{value:"villanelle",children:"Villanelle"}),s.jsx("option",{value:"limerick",children:"Limerick"}),s.jsx("option",{value:"ballad",children:"Ballad"}),s.jsx("option",{value:"tanka",children:"Tanka"}),s.jsx("option",{value:"sestina",children:"Sestina"})]})]}),s.jsx("textarea",{value:o,onChange:c=>a(c.target.value),placeholder:"Paste your poem here to validate...",className:"w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"}),s.jsxs("button",{onClick:Ne,disabled:d||!o.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(B,{size:20}),d?"Validating...":"Validate Form"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"Validation Results:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]}),t==="rhyme-meter"&&s.jsxs("div",{className:"space-y-4",children:[s.jsx("textarea",{value:o,onChange:c=>a(c.target.value),placeholder:"Paste your poem here for rhyme and meter analysis...",className:"w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"}),s.jsxs("button",{onClick:we,disabled:d||!o.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(V,{size:20}),d?"Analyzing...":"Analyze Rhyme & Meter"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"Analysis Results:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]}),t==="cowrite"&&s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-on-surface mb-2",children:"Your Starting Lines or Context"}),s.jsx("textarea",{value:T,onChange:c=>P(c.target.value),placeholder:"Enter the beginning of your poem or describe what you want to write about...",className:"w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"})]}),s.jsxs("button",{onClick:je,disabled:d||!T.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(Y,{size:20}),d?"Generating...":"Get Continuations"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"AI Suggestions:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]}),t==="recommendations"&&s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-on-surface mb-2",children:"Your Poetry Preferences"}),s.jsx("textarea",{value:M,onChange:c=>F(c.target.value),placeholder:"Describe your favorite poets, styles, themes, or what you enjoy reading and writing...",className:"w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"})]}),s.jsxs("button",{onClick:_e,disabled:d||!M.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(K,{size:20}),d?"Generating...":"Get Recommendations"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"Personalized Recommendations:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]}),t==="translate"&&s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-on-surface mb-2",children:"Target Language"}),s.jsxs("select",{value:D,onChange:c=>ve(c.target.value),className:"w-full p-3 rounded-lg border border-outline bg-background text-on-surface focus:outline-none focus:ring-2 focus:ring-primary",children:[s.jsx("option",{value:"Spanish",children:"Spanish"}),s.jsx("option",{value:"French",children:"French"}),s.jsx("option",{value:"German",children:"German"}),s.jsx("option",{value:"Italian",children:"Italian"}),s.jsx("option",{value:"Portuguese",children:"Portuguese"}),s.jsx("option",{value:"Japanese",children:"Japanese"}),s.jsx("option",{value:"Chinese",children:"Chinese"}),s.jsx("option",{value:"Arabic",children:"Arabic"}),s.jsx("option",{value:"Russian",children:"Russian"}),s.jsx("option",{value:"Hindi",children:"Hindi"})]})]}),s.jsx("textarea",{value:o,onChange:c=>a(c.target.value),placeholder:"Paste your poem here to translate...",className:"w-full h-48 p-4 rounded-lg border border-outline bg-background text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"}),s.jsxs("button",{onClick:Ae,disabled:d||!o.trim(),className:"w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",children:[d?s.jsx(E,{size:20,className:"animate-spin"}):s.jsx(J,{size:20}),d?"Translating...":"Translate Poem"]}),r&&s.jsxs("div",{className:"mt-4 p-4 bg-secondary-container/30 rounded-lg border border-outline",children:[s.jsx("h3",{className:"font-bold text-on-surface mb-2",children:"Translation:"}),s.jsx("div",{className:"text-on-surface-variant whitespace-pre-wrap",children:r})]})]})]})]})})]})}export{mt as default};
