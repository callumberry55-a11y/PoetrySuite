import{r as pt,L as li,a as wr,i as ua,b as da,_ as $t,C as Bt,c as Ir,S as he,E as Ue,d as ot,e as lt,f as fa,j as xe,k as K,F as le,l as pa,q as Fe,m as In,n as Jt,o as ga,p as ui,s as De,t as Tr,u as vr,v as ma,w as ya,x as _a,y as wa,z as Ia,A as Ta,B as va,D as Ea,G as Ns,H as Aa,I as Sa,g as ka}from"./index.esm-BDGAHv_t.js";var Pa="firebase",Ra="12.8.0";/**
 * @license
 * Copyright 2020 Google LLC
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
 */pt(Pa,Ra,"app");function Er(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Ca=Er,Ar=new Ue("auth","Firebase",Er());/**
 * @license
 * Copyright 2020 Google LLC
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
 */const un=new li("@firebase/auth");function ba(i,...t){un.logLevel<=xe.WARN&&un.warn(`Auth (${he}): ${i}`,...t)}function on(i,...t){un.logLevel<=xe.ERROR&&un.error(`Auth (${he}): ${i}`,...t)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function gt(i,...t){throw di(i,...t)}function ct(i,...t){return di(i,...t)}function Sr(i,t,n){const s={...Ca(),[t]:n};return new Ue("auth","Firebase",s).create(t,{appName:i.name})}function jt(i){return Sr(i,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function di(i,...t){if(typeof i!="string"){const n=t[0],s=[...t.slice(1)];return s[0]&&(s[0].appName=i.name),i._errorFactory.create(n,...s)}return Ar.create(i,...t)}function k(i,t,...n){if(!i)throw di(t,...n)}function dt(i){const t="INTERNAL ASSERTION FAILED: "+i;throw on(t),new Error(t)}function mt(i,t){i||dt(t)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function si(){var i;return typeof self<"u"&&((i=self.location)==null?void 0:i.href)||""}function Na(){return Os()==="http:"||Os()==="https:"}function Os(){var i;return typeof self<"u"&&((i=self.location)==null?void 0:i.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Oa(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Na()||Ir()||"connection"in navigator)?navigator.onLine:!0}function Da(){if(typeof navigator>"u")return null;const i=navigator;return i.languages&&i.languages[0]||i.language||null}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Ve{constructor(t,n){this.shortDelay=t,this.longDelay=n,mt(n>t,"Short delay should be less than long delay!"),this.isMobile=ua()||da()}get(){return Oa()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function fi(i,t){mt(i.emulator,"Emulator should always be set here");const{url:n}=i.emulator;return t?`${n}${t.startsWith("/")?t.slice(1):t}`:n}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class kr{static initialize(t,n,s){this.fetchImpl=t,n&&(this.headersImpl=n),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;dt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;dt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;dt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const La={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Ma=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Ua=new Ve(3e4,6e4);function pi(i,t){return i.tenantId&&!t.tenantId?{...t,tenantId:i.tenantId}:t}async function ue(i,t,n,s,a={}){return Pr(i,a,async()=>{let c={},l={};s&&(t==="GET"?l=s:c={body:JSON.stringify(s)});const w=Fe({key:i.config.apiKey,...l}).slice(1),T=await i._getAdditionalHeaders();T["Content-Type"]="application/json",i.languageCode&&(T["X-Firebase-Locale"]=i.languageCode);const v={method:t,headers:T,...c};return _a()||(v.referrerPolicy="no-referrer"),i.emulatorConfig&&In(i.emulatorConfig.host)&&(v.credentials="include"),kr.fetch()(await Rr(i,i.config.apiHost,n,w),v)})}async function Pr(i,t,n){i._canInitEmulator=!1;const s={...La,...t};try{const a=new Fa(i),c=await Promise.race([n(),a.promise]);a.clearNetworkTimeout();const l=await c.json();if("needConfirmation"in l)throw nn(i,"account-exists-with-different-credential",l);if(c.ok&&!("errorMessage"in l))return l;{const w=c.ok?l.errorMessage:l.error.message,[T,v]=w.split(" : ");if(T==="FEDERATED_USER_ID_ALREADY_LINKED")throw nn(i,"credential-already-in-use",l);if(T==="EMAIL_EXISTS")throw nn(i,"email-already-in-use",l);if(T==="USER_DISABLED")throw nn(i,"user-disabled",l);const S=s[T]||T.toLowerCase().replace(/[_\s]+/g,"-");if(v)throw Sr(i,S,v);gt(i,S)}}catch(a){if(a instanceof le)throw a;gt(i,"network-request-failed",{message:String(a)})}}async function xa(i,t,n,s,a={}){const c=await ue(i,t,n,s,a);return"mfaPendingCredential"in c&&gt(i,"multi-factor-auth-required",{_serverResponse:c}),c}async function Rr(i,t,n,s){const a=`${t}${n}?${s}`,c=i,l=c.config.emulator?fi(i.config,a):`${i.config.apiScheme}://${a}`;return Ma.includes(n)&&(await c._persistenceManagerAvailable,c._getPersistenceType()==="COOKIE")?c._getPersistence()._getFinalTarget(l).toString():l}class Fa{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(t){this.auth=t,this.timer=null,this.promise=new Promise((n,s)=>{this.timer=setTimeout(()=>s(ct(this.auth,"network-request-failed")),Ua.get())})}}function nn(i,t,n){const s={appName:i.name};n.email&&(s.email=n.email),n.phoneNumber&&(s.phoneNumber=n.phoneNumber);const a=ct(i,t,s);return a.customData._tokenResponse=n,a}/**
 * @license
 * Copyright 2020 Google LLC
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
 */async function Va(i,t){return ue(i,"POST","/v1/accounts:delete",t)}async function dn(i,t){return ue(i,"POST","/v1/accounts:lookup",t)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Ce(i){if(i)try{const t=new Date(Number(i));if(!isNaN(t.getTime()))return t.toUTCString()}catch{}}async function ja(i,t=!1){const n=lt(i),s=await n.getIdToken(t),a=gi(s);k(a&&a.exp&&a.auth_time&&a.iat,n.auth,"internal-error");const c=typeof a.firebase=="object"?a.firebase:void 0,l=c==null?void 0:c.sign_in_provider;return{claims:a,token:s,authTime:Ce(Yn(a.auth_time)),issuedAtTime:Ce(Yn(a.iat)),expirationTime:Ce(Yn(a.exp)),signInProvider:l||null,signInSecondFactor:(c==null?void 0:c.sign_in_second_factor)||null}}function Yn(i){return Number(i)*1e3}function gi(i){const[t,n,s]=i.split(".");if(t===void 0||n===void 0||s===void 0)return on("JWT malformed, contained fewer than 3 sections"),null;try{const a=pa(n);return a?JSON.parse(a):(on("Failed to decode base64 JWT payload"),null)}catch(a){return on("Caught error parsing JWT payload as JSON",a==null?void 0:a.toString()),null}}function Ds(i){const t=gi(i);return k(t,"internal-error"),k(typeof t.exp<"u","internal-error"),k(typeof t.iat<"u","internal-error"),Number(t.exp)-Number(t.iat)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */async function Le(i,t,n=!1){if(n)return t;try{return await t}catch(s){throw s instanceof le&&Ha(s)&&i.auth.currentUser===i&&await i.auth.signOut(),s}}function Ha({code:i}){return i==="auth/user-disabled"||i==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class qa{constructor(t){this.user=t,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(t){if(t){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const s=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,s)}}schedule(t=!1){if(!this.isRunning)return;const n=this.getInterval(t);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(t){(t==null?void 0:t.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class ri{constructor(t,n){this.createdAt=t,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ce(this.lastLoginAt),this.creationTime=Ce(this.createdAt)}_copy(t){this.createdAt=t.createdAt,this.lastLoginAt=t.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function fn(i){var A;const t=i.auth,n=await i.getIdToken(),s=await Le(i,dn(t,{idToken:n}));k(s==null?void 0:s.users.length,t,"internal-error");const a=s.users[0];i._notifyReloadListener(a);const c=(A=a.providerUserInfo)!=null&&A.length?Cr(a.providerUserInfo):[],l=Ba(i.providerData,c),w=i.isAnonymous,T=!(i.email&&a.passwordHash)&&!(l!=null&&l.length),v=w?T:!1,S={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:l,metadata:new ri(a.createdAt,a.lastLoginAt),isAnonymous:v};Object.assign(i,S)}async function $a(i){const t=lt(i);await fn(t),await t.auth._persistUserIfCurrent(t),t.auth._notifyListenersIfCurrent(t)}function Ba(i,t){return[...i.filter(s=>!t.some(a=>a.providerId===s.providerId)),...t]}function Cr(i){return i.map(({providerId:t,...n})=>({providerId:t,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
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
 */async function Ga(i,t){const n=await Pr(i,{},async()=>{const s=Fe({grant_type:"refresh_token",refresh_token:t}).slice(1),{tokenApiHost:a,apiKey:c}=i.config,l=await Rr(i,a,"/v1/token",`key=${c}`),w=await i._getAdditionalHeaders();w["Content-Type"]="application/x-www-form-urlencoded";const T={method:"POST",headers:w,body:s};return i.emulatorConfig&&In(i.emulatorConfig.host)&&(T.credentials="include"),kr.fetch()(l,T)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Wa(i,t){return ue(i,"POST","/v2/accounts:revokeToken",pi(i,t))}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class ne{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(t){k(t.idToken,"internal-error"),k(typeof t.idToken<"u","internal-error"),k(typeof t.refreshToken<"u","internal-error");const n="expiresIn"in t&&typeof t.expiresIn<"u"?Number(t.expiresIn):Ds(t.idToken);this.updateTokensAndExpiration(t.idToken,t.refreshToken,n)}updateFromIdToken(t){k(t.length!==0,"internal-error");const n=Ds(t);this.updateTokensAndExpiration(t,null,n)}async getToken(t,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(k(this.refreshToken,t,"user-token-expired"),this.refreshToken?(await this.refresh(t,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(t,n){const{accessToken:s,refreshToken:a,expiresIn:c}=await Ga(t,n);this.updateTokensAndExpiration(s,a,Number(c))}updateTokensAndExpiration(t,n,s){this.refreshToken=n||null,this.accessToken=t||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(t,n){const{refreshToken:s,accessToken:a,expirationTime:c}=n,l=new ne;return s&&(k(typeof s=="string","internal-error",{appName:t}),l.refreshToken=s),a&&(k(typeof a=="string","internal-error",{appName:t}),l.accessToken=a),c&&(k(typeof c=="number","internal-error",{appName:t}),l.expirationTime=c),l}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(t){this.accessToken=t.accessToken,this.refreshToken=t.refreshToken,this.expirationTime=t.expirationTime}_clone(){return Object.assign(new ne,this.toJSON())}_performRefresh(){return dt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function kt(i,t){k(typeof i=="string"||typeof i>"u","internal-error",{appName:t})}class Z{constructor({uid:t,auth:n,stsTokenManager:s,...a}){this.providerId="firebase",this.proactiveRefresh=new qa(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=n,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=a.displayName||null,this.email=a.email||null,this.emailVerified=a.emailVerified||!1,this.phoneNumber=a.phoneNumber||null,this.photoURL=a.photoURL||null,this.isAnonymous=a.isAnonymous||!1,this.tenantId=a.tenantId||null,this.providerData=a.providerData?[...a.providerData]:[],this.metadata=new ri(a.createdAt||void 0,a.lastLoginAt||void 0)}async getIdToken(t){const n=await Le(this,this.stsTokenManager.getToken(this.auth,t));return k(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(t){return ja(this,t)}reload(){return $a(this)}_assign(t){this!==t&&(k(this.uid===t.uid,this.auth,"internal-error"),this.displayName=t.displayName,this.photoURL=t.photoURL,this.email=t.email,this.emailVerified=t.emailVerified,this.phoneNumber=t.phoneNumber,this.isAnonymous=t.isAnonymous,this.tenantId=t.tenantId,this.providerData=t.providerData.map(n=>({...n})),this.metadata._copy(t.metadata),this.stsTokenManager._assign(t.stsTokenManager))}_clone(t){const n=new Z({...this,auth:t,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(t){k(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=t,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(t){this.reloadListener?this.reloadListener(t):this.reloadUserInfo=t}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(t,n=!1){let s=!1;t.idToken&&t.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(t),s=!0),n&&await fn(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ot(this.auth.app))return Promise.reject(jt(this.auth));const t=await this.getIdToken();return await Le(this,Va(this.auth,{idToken:t})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(t=>({...t})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(t,n){const s=n.displayName??void 0,a=n.email??void 0,c=n.phoneNumber??void 0,l=n.photoURL??void 0,w=n.tenantId??void 0,T=n._redirectEventId??void 0,v=n.createdAt??void 0,S=n.lastLoginAt??void 0,{uid:A,emailVerified:N,isAnonymous:Y,providerData:F,stsTokenManager:j}=n;k(A&&j,t,"internal-error");const L=ne.fromJSON(this.name,j);k(typeof A=="string",t,"internal-error"),kt(s,t.name),kt(a,t.name),k(typeof N=="boolean",t,"internal-error"),k(typeof Y=="boolean",t,"internal-error"),kt(c,t.name),kt(l,t.name),kt(w,t.name),kt(T,t.name),kt(v,t.name),kt(S,t.name);const et=new Z({uid:A,auth:t,email:a,emailVerified:N,displayName:s,isAnonymous:Y,photoURL:l,phoneNumber:c,tenantId:w,stsTokenManager:L,createdAt:v,lastLoginAt:S});return F&&Array.isArray(F)&&(et.providerData=F.map(yt=>({...yt}))),T&&(et._redirectEventId=T),et}static async _fromIdTokenResponse(t,n,s=!1){const a=new ne;a.updateFromServerResponse(n);const c=new Z({uid:n.localId,auth:t,stsTokenManager:a,isAnonymous:s});return await fn(c),c}static async _fromGetAccountInfoResponse(t,n,s){const a=n.users[0];k(a.localId!==void 0,"internal-error");const c=a.providerUserInfo!==void 0?Cr(a.providerUserInfo):[],l=!(a.email&&a.passwordHash)&&!(c!=null&&c.length),w=new ne;w.updateFromIdToken(s);const T=new Z({uid:a.localId,auth:t,stsTokenManager:w,isAnonymous:l}),v={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:c,metadata:new ri(a.createdAt,a.lastLoginAt),isAnonymous:!(a.email&&a.passwordHash)&&!(c!=null&&c.length)};return Object.assign(T,v),T}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Ls=new Map;function ft(i){mt(i instanceof Function,"Expected a class definition");let t=Ls.get(i);return t?(mt(t instanceof i,"Instance stored in cache mismatched with class"),t):(t=new i,Ls.set(i,t),t)}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class br{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(t,n){this.storage[t]=n}async _get(t){const n=this.storage[t];return n===void 0?null:n}async _remove(t){delete this.storage[t]}_addListener(t,n){}_removeListener(t,n){}}br.type="NONE";const Ms=br;/**
 * @license
 * Copyright 2019 Google LLC
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
 */function an(i,t,n){return`firebase:${i}:${t}:${n}`}class ie{constructor(t,n,s){this.persistence=t,this.auth=n,this.userKey=s;const{config:a,name:c}=this.auth;this.fullUserKey=an(this.userKey,a.apiKey,c),this.fullPersistenceKey=an("persistence",a.apiKey,c),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(t){return this.persistence._set(this.fullUserKey,t.toJSON())}async getCurrentUser(){const t=await this.persistence._get(this.fullUserKey);if(!t)return null;if(typeof t=="string"){const n=await dn(this.auth,{idToken:t}).catch(()=>{});return n?Z._fromGetAccountInfoResponse(this.auth,n,t):null}return Z._fromJSON(this.auth,t)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(t){if(this.persistence===t)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=t,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(t,n,s="authUser"){if(!n.length)return new ie(ft(Ms),t,s);const a=(await Promise.all(n.map(async v=>{if(await v._isAvailable())return v}))).filter(v=>v);let c=a[0]||ft(Ms);const l=an(s,t.config.apiKey,t.name);let w=null;for(const v of n)try{const S=await v._get(l);if(S){let A;if(typeof S=="string"){const N=await dn(t,{idToken:S}).catch(()=>{});if(!N)break;A=await Z._fromGetAccountInfoResponse(t,N,S)}else A=Z._fromJSON(t,S);v!==c&&(w=A),c=v;break}}catch{}const T=a.filter(v=>v._shouldAllowMigration);return!c._shouldAllowMigration||!T.length?new ie(c,t,s):(c=T[0],w&&await c._set(l,w.toJSON()),await Promise.all(n.map(async v=>{if(v!==c)try{await v._remove(l)}catch{}})),new ie(c,t,s))}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Us(i){const t=i.toLowerCase();if(t.includes("opera/")||t.includes("opr/")||t.includes("opios/"))return"Opera";if(Lr(t))return"IEMobile";if(t.includes("msie")||t.includes("trident/"))return"IE";if(t.includes("edge/"))return"Edge";if(Nr(t))return"Firefox";if(t.includes("silk/"))return"Silk";if(Ur(t))return"Blackberry";if(xr(t))return"Webos";if(Or(t))return"Safari";if((t.includes("chrome/")||Dr(t))&&!t.includes("edge/"))return"Chrome";if(Mr(t))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=i.match(n);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function Nr(i=K()){return/firefox\//i.test(i)}function Or(i=K()){const t=i.toLowerCase();return t.includes("safari/")&&!t.includes("chrome/")&&!t.includes("crios/")&&!t.includes("android")}function Dr(i=K()){return/crios\//i.test(i)}function Lr(i=K()){return/iemobile/i.test(i)}function Mr(i=K()){return/android/i.test(i)}function Ur(i=K()){return/blackberry/i.test(i)}function xr(i=K()){return/webos/i.test(i)}function mi(i=K()){return/iphone|ipad|ipod/i.test(i)||/macintosh/i.test(i)&&/mobile/i.test(i)}function za(i=K()){var t;return mi(i)&&!!((t=window.navigator)!=null&&t.standalone)}function Ka(){return ma()&&document.documentMode===10}function Fr(i=K()){return mi(i)||Mr(i)||xr(i)||Ur(i)||/windows phone/i.test(i)||Lr(i)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Vr(i,t=[]){let n;switch(i){case"Browser":n=Us(K());break;case"Worker":n=`${Us(K())}-${i}`;break;default:n=i}const s=t.length?t.join(","):"FirebaseCore-web";return`${n}/JsCore/${he}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
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
 */class Ja{constructor(t){this.auth=t,this.queue=[]}pushCallback(t,n){const s=c=>new Promise((l,w)=>{try{const T=t(c);l(T)}catch(T){w(T)}});s.onAbort=n,this.queue.push(s);const a=this.queue.length-1;return()=>{this.queue[a]=()=>Promise.resolve()}}async runMiddleware(t){if(this.auth.currentUser===t)return;const n=[];try{for(const s of this.queue)await s(t),s.onAbort&&n.push(s.onAbort)}catch(s){n.reverse();for(const a of n)try{a()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */async function Xa(i,t={}){return ue(i,"GET","/v2/passwordPolicy",pi(i,t))}/**
 * @license
 * Copyright 2023 Google LLC
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
 */const Ya=6;class Qa{constructor(t){var s;const n=t.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??Ya,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=t.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((s=t.allowedNonAlphanumericCharacters)==null?void 0:s.join(""))??"",this.forceUpgradeOnSignin=t.forceUpgradeOnSignin??!1,this.schemaVersion=t.schemaVersion}validatePassword(t){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(t,n),this.validatePasswordCharacterOptions(t,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(t,n){const s=this.customStrengthOptions.minPasswordLength,a=this.customStrengthOptions.maxPasswordLength;s&&(n.meetsMinPasswordLength=t.length>=s),a&&(n.meetsMaxPasswordLength=t.length<=a)}validatePasswordCharacterOptions(t,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let s;for(let a=0;a<t.length;a++)s=t.charAt(a),this.updatePasswordCharacterOptionsStatuses(n,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(t,n,s,a,c){this.customStrengthOptions.containsLowercaseLetter&&(t.containsLowercaseLetter||(t.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(t.containsUppercaseLetter||(t.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(t.containsNumericCharacter||(t.containsNumericCharacter=a)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(t.containsNonAlphanumericCharacter||(t.containsNonAlphanumericCharacter=c))}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Za{constructor(t,n,s,a){this.app=t,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=s,this.config=a,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new xs(this),this.idTokenSubscription=new xs(this),this.beforeStateQueue=new Ja(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Ar,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=t.name,this.clientVersion=a.sdkClientVersion,this._persistenceManagerAvailable=new Promise(c=>this._resolvePersistenceManagerAvailable=c)}_initializeWithPersistence(t,n){return n&&(this._popupRedirectResolver=ft(n)),this._initializationPromise=this.queue(async()=>{var s,a,c;if(!this._deleted&&(this.persistenceManager=await ie.create(this,t),(s=this._resolvePersistenceManagerAvailable)==null||s.call(this),!this._deleted)){if((a=this._popupRedirectResolver)!=null&&a._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((c=this.currentUser)==null?void 0:c.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const t=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!t)){if(this.currentUser&&t&&this.currentUser.uid===t.uid){this._currentUser._assign(t),await this.currentUser.getIdToken();return}await this._updateCurrentUser(t,!0)}}async initializeCurrentUserFromIdToken(t){try{const n=await dn(this,{idToken:t}),s=await Z._fromGetAccountInfoResponse(this,n,t);await this.directlySetCurrentUser(s)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(t){var c;if(ot(this.app)){const l=this.app.settings.authIdToken;return l?new Promise(w=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(l).then(w,w))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let s=n,a=!1;if(t&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const l=(c=this.redirectUser)==null?void 0:c._redirectEventId,w=s==null?void 0:s._redirectEventId,T=await this.tryRedirectSignIn(t);(!l||l===w)&&(T!=null&&T.user)&&(s=T.user,a=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(a)try{await this.beforeStateQueue.runMiddleware(s)}catch(l){s=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(l))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return k(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(t){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,t,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(t){try{await fn(t)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(t)}useDeviceLanguage(){this.languageCode=Da()}async _delete(){this._deleted=!0}async updateCurrentUser(t){if(ot(this.app))return Promise.reject(jt(this));const n=t?lt(t):null;return n&&k(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(t,n=!1){if(!this._deleted)return t&&k(this.tenantId===t.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(t),this.queue(async()=>{await this.directlySetCurrentUser(t),this.notifyAuthListeners()})}async signOut(){return ot(this.app)?Promise.reject(jt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(t){return ot(this.app)?Promise.reject(jt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ft(t))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(t){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(t)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const t=await Xa(this),n=new Qa(t);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(t){this._errorFactory=new Ue("auth","Firebase",t())}onAuthStateChanged(t,n,s){return this.registerStateListener(this.authStateSubscription,t,n,s)}beforeAuthStateChanged(t,n){return this.beforeStateQueue.pushCallback(t,n)}onIdTokenChanged(t,n,s){return this.registerStateListener(this.idTokenSubscription,t,n,s)}authStateReady(){return new Promise((t,n)=>{if(this.currentUser)t();else{const s=this.onAuthStateChanged(()=>{s(),t()},n)}})}async revokeAccessToken(t){if(this.currentUser){const n=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:t,idToken:n};this.tenantId!=null&&(s.tenantId=this.tenantId),await Wa(this,s)}}toJSON(){var t;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(t=this._currentUser)==null?void 0:t.toJSON()}}async _setRedirectUser(t,n){const s=await this.getOrInitRedirectPersistenceManager(n);return t===null?s.removeCurrentUser():s.setCurrentUser(t)}async getOrInitRedirectPersistenceManager(t){if(!this.redirectPersistenceManager){const n=t&&ft(t)||this._popupRedirectResolver;k(n,this,"argument-error"),this.redirectPersistenceManager=await ie.create(this,[ft(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(t){var n,s;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===t?this._currentUser:((s=this.redirectUser)==null?void 0:s._redirectEventId)===t?this.redirectUser:null}async _persistUserIfCurrent(t){if(t===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(t))}_notifyListenersIfCurrent(t){t===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const t=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==t&&(this.lastNotifiedUid=t,this.authStateSubscription.next(this.currentUser))}registerStateListener(t,n,s,a){if(this._deleted)return()=>{};const c=typeof n=="function"?n:n.next.bind(n);let l=!1;const w=this._isInitialized?Promise.resolve():this._initializationPromise;if(k(w,this,"internal-error"),w.then(()=>{l||c(this.currentUser)}),typeof n=="function"){const T=t.addObserver(n,s,a);return()=>{l=!0,T()}}else{const T=t.addObserver(n);return()=>{l=!0,T()}}}async directlySetCurrentUser(t){this.currentUser&&this.currentUser!==t&&this._currentUser._stopProactiveRefresh(),t&&this.isProactiveRefreshEnabled&&t._startProactiveRefresh(),this.currentUser=t,t?await this.assertedPersistence.setCurrentUser(t):await this.assertedPersistence.removeCurrentUser()}queue(t){return this.operations=this.operations.then(t,t),this.operations}get assertedPersistence(){return k(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(t){!t||this.frameworks.includes(t)||(this.frameworks.push(t),this.frameworks.sort(),this.clientVersion=Vr(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var a;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const n=await((a=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:a.getHeartbeatsHeader());n&&(t["X-Firebase-Client"]=n);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var n;if(ot(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return t!=null&&t.error&&ba(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function yi(i){return lt(i)}class xs{constructor(t){this.auth=t,this.observer=null,this.addObserver=fa(n=>this.observer=n)}get next(){return k(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */let _i={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function tc(i){_i=i}function ec(i){return _i.loadJS(i)}function nc(){return _i.gapiScript}function ic(i){return`__${i}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function sc(i,t){const n=Jt(i,"auth");if(n.isInitialized()){const a=n.getImmediate(),c=n.getOptions();if(De(c,t??{}))return a;gt(a,"already-initialized")}return n.initialize({options:t})}function rc(i,t){const n=(t==null?void 0:t.persistence)||[],s=(Array.isArray(n)?n:[n]).map(ft);t!=null&&t.errorMap&&i._updateErrorMap(t.errorMap),i._initializeWithPersistence(s,t==null?void 0:t.popupRedirectResolver)}function oc(i,t,n){const s=yi(i);k(/^https?:\/\//.test(t),s,"invalid-emulator-scheme");const a=!1,c=jr(t),{host:l,port:w}=ac(t),T=w===null?"":`:${w}`,v={url:`${c}//${l}${T}/`},S=Object.freeze({host:l,port:w,protocol:c.replace(":",""),options:Object.freeze({disableWarnings:a})});if(!s._canInitEmulator){k(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),k(De(v,s.config.emulator)&&De(S,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=v,s.emulatorConfig=S,s.settings.appVerificationDisabledForTesting=!0,In(l)?(Tr(`${c}//${l}${T}`),vr("Auth",!0)):cc()}function jr(i){const t=i.indexOf(":");return t<0?"":i.substr(0,t+1)}function ac(i){const t=jr(i),n=/(\/\/)?([^?#/]+)/.exec(i.substr(t.length));if(!n)return{host:"",port:null};const s=n[2].split("@").pop()||"",a=/^(\[[^\]]+\])(:|$)/.exec(s);if(a){const c=a[1];return{host:c,port:Fs(s.substr(c.length+1))}}else{const[c,l]=s.split(":");return{host:c,port:Fs(l)}}}function Fs(i){if(!i)return null;const t=Number(i);return isNaN(t)?null:t}function cc(){function i(){const t=document.createElement("p"),n=t.style;t.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",t.classList.add("firebase-emulator-warning"),document.body.appendChild(t)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",i):i())}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Hr{constructor(t,n){this.providerId=t,this.signInMethod=n}toJSON(){return dt("not implemented")}_getIdTokenResponse(t){return dt("not implemented")}_linkToIdToken(t,n){return dt("not implemented")}_getReauthenticationResolver(t){return dt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */async function se(i,t){return xa(i,"POST","/v1/accounts:signInWithIdp",pi(i,t))}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const hc="http://localhost";class Gt extends Hr{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(t){const n=new Gt(t.providerId,t.signInMethod);return t.idToken||t.accessToken?(t.idToken&&(n.idToken=t.idToken),t.accessToken&&(n.accessToken=t.accessToken),t.nonce&&!t.pendingToken&&(n.nonce=t.nonce),t.pendingToken&&(n.pendingToken=t.pendingToken)):t.oauthToken&&t.oauthTokenSecret?(n.accessToken=t.oauthToken,n.secret=t.oauthTokenSecret):gt("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(t){const n=typeof t=="string"?JSON.parse(t):t,{providerId:s,signInMethod:a,...c}=n;if(!s||!a)return null;const l=new Gt(s,a);return l.idToken=c.idToken||void 0,l.accessToken=c.accessToken||void 0,l.secret=c.secret,l.nonce=c.nonce,l.pendingToken=c.pendingToken||null,l}_getIdTokenResponse(t){const n=this.buildRequest();return se(t,n)}_linkToIdToken(t,n){const s=this.buildRequest();return s.idToken=n,se(t,s)}_getReauthenticationResolver(t){const n=this.buildRequest();return n.autoCreate=!1,se(t,n)}buildRequest(){const t={requestUri:hc,returnSecureToken:!0};if(this.pendingToken)t.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),t.postBody=Fe(n)}return t}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class qr{constructor(t){this.providerId=t,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(t){this.defaultLanguageCode=t}setCustomParameters(t){return this.customParameters=t,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class je extends qr{constructor(){super(...arguments),this.scopes=[]}addScope(t){return this.scopes.includes(t)||this.scopes.push(t),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Pt extends je{constructor(){super("facebook.com")}static credential(t){return Gt._fromParams({providerId:Pt.PROVIDER_ID,signInMethod:Pt.FACEBOOK_SIGN_IN_METHOD,accessToken:t})}static credentialFromResult(t){return Pt.credentialFromTaggedObject(t)}static credentialFromError(t){return Pt.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t||!("oauthAccessToken"in t)||!t.oauthAccessToken)return null;try{return Pt.credential(t.oauthAccessToken)}catch{return null}}}Pt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Pt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Rt extends je{constructor(){super("google.com"),this.addScope("profile")}static credential(t,n){return Gt._fromParams({providerId:Rt.PROVIDER_ID,signInMethod:Rt.GOOGLE_SIGN_IN_METHOD,idToken:t,accessToken:n})}static credentialFromResult(t){return Rt.credentialFromTaggedObject(t)}static credentialFromError(t){return Rt.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t)return null;const{oauthIdToken:n,oauthAccessToken:s}=t;if(!n&&!s)return null;try{return Rt.credential(n,s)}catch{return null}}}Rt.GOOGLE_SIGN_IN_METHOD="google.com";Rt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Ct extends je{constructor(){super("github.com")}static credential(t){return Gt._fromParams({providerId:Ct.PROVIDER_ID,signInMethod:Ct.GITHUB_SIGN_IN_METHOD,accessToken:t})}static credentialFromResult(t){return Ct.credentialFromTaggedObject(t)}static credentialFromError(t){return Ct.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t||!("oauthAccessToken"in t)||!t.oauthAccessToken)return null;try{return Ct.credential(t.oauthAccessToken)}catch{return null}}}Ct.GITHUB_SIGN_IN_METHOD="github.com";Ct.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
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
 */class bt extends je{constructor(){super("twitter.com")}static credential(t,n){return Gt._fromParams({providerId:bt.PROVIDER_ID,signInMethod:bt.TWITTER_SIGN_IN_METHOD,oauthToken:t,oauthTokenSecret:n})}static credentialFromResult(t){return bt.credentialFromTaggedObject(t)}static credentialFromError(t){return bt.credentialFromTaggedObject(t.customData||{})}static credentialFromTaggedObject({_tokenResponse:t}){if(!t)return null;const{oauthAccessToken:n,oauthTokenSecret:s}=t;if(!n||!s)return null;try{return bt.credential(n,s)}catch{return null}}}bt.TWITTER_SIGN_IN_METHOD="twitter.com";bt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
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
 */class ae{constructor(t){this.user=t.user,this.providerId=t.providerId,this._tokenResponse=t._tokenResponse,this.operationType=t.operationType}static async _fromIdTokenResponse(t,n,s,a=!1){const c=await Z._fromIdTokenResponse(t,s,a),l=Vs(s);return new ae({user:c,providerId:l,_tokenResponse:s,operationType:n})}static async _forOperation(t,n,s){await t._updateTokensIfNecessary(s,!0);const a=Vs(s);return new ae({user:t,providerId:a,_tokenResponse:s,operationType:n})}}function Vs(i){return i.providerId?i.providerId:"phoneNumber"in i?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class pn extends le{constructor(t,n,s,a){super(n.code,n.message),this.operationType=s,this.user=a,Object.setPrototypeOf(this,pn.prototype),this.customData={appName:t.name,tenantId:t.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(t,n,s,a){return new pn(t,n,s,a)}}function $r(i,t,n,s){return(t==="reauthenticate"?n._getReauthenticationResolver(i):n._getIdTokenResponse(i)).catch(c=>{throw c.code==="auth/multi-factor-auth-required"?pn._fromErrorAndOperation(i,c,t,s):c})}async function lc(i,t,n=!1){const s=await Le(i,t._linkToIdToken(i.auth,await i.getIdToken()),n);return ae._forOperation(i,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function uc(i,t,n=!1){const{auth:s}=i;if(ot(s.app))return Promise.reject(jt(s));const a="reauthenticate";try{const c=await Le(i,$r(s,a,t,i),n);k(c.idToken,s,"internal-error");const l=gi(c.idToken);k(l,s,"internal-error");const{sub:w}=l;return k(i.uid===w,s,"user-mismatch"),ae._forOperation(i,a,c)}catch(c){throw(c==null?void 0:c.code)==="auth/user-not-found"&&gt(s,"user-mismatch"),c}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */async function dc(i,t,n=!1){if(ot(i.app))return Promise.reject(jt(i));const s="signIn",a=await $r(i,s,t),c=await ae._fromIdTokenResponse(i,s,a);return n||await i._updateCurrentUser(c.user),c}function fc(i,t,n,s){return lt(i).onIdTokenChanged(t,n,s)}function pc(i,t,n){return lt(i).beforeAuthStateChanged(t,n)}const gn="__sak";/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Br{constructor(t,n){this.storageRetriever=t,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(gn,"1"),this.storage.removeItem(gn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(t,n){return this.storage.setItem(t,JSON.stringify(n)),Promise.resolve()}_get(t){const n=this.storage.getItem(t);return Promise.resolve(n?JSON.parse(n):null)}_remove(t){return this.storage.removeItem(t),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const gc=1e3,mc=10;class Gr extends Br{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(t,n)=>this.onStorageEvent(t,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Fr(),this._shouldAllowMigration=!0}forAllChangedKeys(t){for(const n of Object.keys(this.listeners)){const s=this.storage.getItem(n),a=this.localCache[n];s!==a&&t(n,a,s)}}onStorageEvent(t,n=!1){if(!t.key){this.forAllChangedKeys((l,w,T)=>{this.notifyListeners(l,T)});return}const s=t.key;n?this.detachListener():this.stopPolling();const a=()=>{const l=this.storage.getItem(s);!n&&this.localCache[s]===l||this.notifyListeners(s,l)},c=this.storage.getItem(s);Ka()&&c!==t.newValue&&t.newValue!==t.oldValue?setTimeout(a,mc):a()}notifyListeners(t,n){this.localCache[t]=n;const s=this.listeners[t];if(s)for(const a of Array.from(s))a(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((t,n,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:t,oldValue:n,newValue:s}),!0)})},gc)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(t,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[t]||(this.listeners[t]=new Set,this.localCache[t]=this.storage.getItem(t)),this.listeners[t].add(n)}_removeListener(t,n){this.listeners[t]&&(this.listeners[t].delete(n),this.listeners[t].size===0&&delete this.listeners[t]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(t,n){await super._set(t,n),this.localCache[t]=JSON.stringify(n)}async _get(t){const n=await super._get(t);return this.localCache[t]=JSON.stringify(n),n}async _remove(t){await super._remove(t),delete this.localCache[t]}}Gr.type="LOCAL";const yc=Gr;/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Wr extends Br{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(t,n){}_removeListener(t,n){}}Wr.type="SESSION";const zr=Wr;/**
 * @license
 * Copyright 2019 Google LLC
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
 */function _c(i){return Promise.all(i.map(async t=>{try{return{fulfilled:!0,value:await t}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Tn{constructor(t){this.eventTarget=t,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(t){const n=this.receivers.find(a=>a.isListeningto(t));if(n)return n;const s=new Tn(t);return this.receivers.push(s),s}isListeningto(t){return this.eventTarget===t}async handleEvent(t){const n=t,{eventId:s,eventType:a,data:c}=n.data,l=this.handlersMap[a];if(!(l!=null&&l.size))return;n.ports[0].postMessage({status:"ack",eventId:s,eventType:a});const w=Array.from(l).map(async v=>v(n.origin,c)),T=await _c(w);n.ports[0].postMessage({status:"done",eventId:s,eventType:a,response:T})}_subscribe(t,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[t]||(this.handlersMap[t]=new Set),this.handlersMap[t].add(n)}_unsubscribe(t,n){this.handlersMap[t]&&n&&this.handlersMap[t].delete(n),(!n||this.handlersMap[t].size===0)&&delete this.handlersMap[t],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Tn.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
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
 */function wi(i="",t=10){let n="";for(let s=0;s<t;s++)n+=Math.floor(Math.random()*10);return i+n}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class wc{constructor(t){this.target=t,this.handlers=new Set}removeMessageHandler(t){t.messageChannel&&(t.messageChannel.port1.removeEventListener("message",t.onMessage),t.messageChannel.port1.close()),this.handlers.delete(t)}async _send(t,n,s=50){const a=typeof MessageChannel<"u"?new MessageChannel:null;if(!a)throw new Error("connection_unavailable");let c,l;return new Promise((w,T)=>{const v=wi("",20);a.port1.start();const S=setTimeout(()=>{T(new Error("unsupported_event"))},s);l={messageChannel:a,onMessage(A){const N=A;if(N.data.eventId===v)switch(N.data.status){case"ack":clearTimeout(S),c=setTimeout(()=>{T(new Error("timeout"))},3e3);break;case"done":clearTimeout(c),w(N.data.response);break;default:clearTimeout(S),clearTimeout(c),T(new Error("invalid_response"));break}}},this.handlers.add(l),a.port1.addEventListener("message",l.onMessage),this.target.postMessage({eventType:t,eventId:v,data:n},[a.port2])}).finally(()=>{l&&this.removeMessageHandler(l)})}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function ht(){return window}function Ic(i){ht().location.href=i}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */function Kr(){return typeof ht().WorkerGlobalScope<"u"&&typeof ht().importScripts=="function"}async function Tc(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function vc(){var i;return((i=navigator==null?void 0:navigator.serviceWorker)==null?void 0:i.controller)||null}function Ec(){return Kr()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const Jr="firebaseLocalStorageDb",Ac=1,mn="firebaseLocalStorage",Xr="fbase_key";class He{constructor(t){this.request=t}toPromise(){return new Promise((t,n)=>{this.request.addEventListener("success",()=>{t(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function vn(i,t){return i.transaction([mn],t?"readwrite":"readonly").objectStore(mn)}function Sc(){const i=indexedDB.deleteDatabase(Jr);return new He(i).toPromise()}function oi(){const i=indexedDB.open(Jr,Ac);return new Promise((t,n)=>{i.addEventListener("error",()=>{n(i.error)}),i.addEventListener("upgradeneeded",()=>{const s=i.result;try{s.createObjectStore(mn,{keyPath:Xr})}catch(a){n(a)}}),i.addEventListener("success",async()=>{const s=i.result;s.objectStoreNames.contains(mn)?t(s):(s.close(),await Sc(),t(await oi()))})})}async function js(i,t,n){const s=vn(i,!0).put({[Xr]:t,value:n});return new He(s).toPromise()}async function kc(i,t){const n=vn(i,!1).get(t),s=await new He(n).toPromise();return s===void 0?null:s.value}function Hs(i,t){const n=vn(i,!0).delete(t);return new He(n).toPromise()}const Pc=800,Rc=3;class Yr{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await oi(),this.db)}async _withRetries(t){let n=0;for(;;)try{const s=await this._openDb();return await t(s)}catch(s){if(n++>Rc)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Kr()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Tn._getInstance(Ec()),this.receiver._subscribe("keyChanged",async(t,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(t,n)=>["keyChanged"])}async initializeSender(){var n,s;if(this.activeServiceWorker=await Tc(),!this.activeServiceWorker)return;this.sender=new wc(this.activeServiceWorker);const t=await this.sender._send("ping",{},800);t&&(n=t[0])!=null&&n.fulfilled&&(s=t[0])!=null&&s.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(t){if(!(!this.sender||!this.activeServiceWorker||vc()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:t},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const t=await oi();return await js(t,gn,"1"),await Hs(t,gn),!0}catch{}return!1}async _withPendingWrite(t){this.pendingWrites++;try{await t()}finally{this.pendingWrites--}}async _set(t,n){return this._withPendingWrite(async()=>(await this._withRetries(s=>js(s,t,n)),this.localCache[t]=n,this.notifyServiceWorker(t)))}async _get(t){const n=await this._withRetries(s=>kc(s,t));return this.localCache[t]=n,n}async _remove(t){return this._withPendingWrite(async()=>(await this._withRetries(n=>Hs(n,t)),delete this.localCache[t],this.notifyServiceWorker(t)))}async _poll(){const t=await this._withRetries(a=>{const c=vn(a,!1).getAll();return new He(c).toPromise()});if(!t)return[];if(this.pendingWrites!==0)return[];const n=[],s=new Set;if(t.length!==0)for(const{fbase_key:a,value:c}of t)s.add(a),JSON.stringify(this.localCache[a])!==JSON.stringify(c)&&(this.notifyListeners(a,c),n.push(a));for(const a of Object.keys(this.localCache))this.localCache[a]&&!s.has(a)&&(this.notifyListeners(a,null),n.push(a));return n}notifyListeners(t,n){this.localCache[t]=n;const s=this.listeners[t];if(s)for(const a of Array.from(s))a(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Pc)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(t,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[t]||(this.listeners[t]=new Set,this._get(t)),this.listeners[t].add(n)}_removeListener(t,n){this.listeners[t]&&(this.listeners[t].delete(n),this.listeners[t].size===0&&delete this.listeners[t]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Yr.type="LOCAL";const Cc=Yr;new Ve(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
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
 */function bc(i,t){return t?ft(t):(k(i._popupRedirectResolver,i,"argument-error"),i._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Ii extends Hr{constructor(t){super("custom","custom"),this.params=t}_getIdTokenResponse(t){return se(t,this._buildIdpRequest())}_linkToIdToken(t,n){return se(t,this._buildIdpRequest(n))}_getReauthenticationResolver(t){return se(t,this._buildIdpRequest())}_buildIdpRequest(t){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return t&&(n.idToken=t),n}}function Nc(i){return dc(i.auth,new Ii(i),i.bypassAuthState)}function Oc(i){const{auth:t,user:n}=i;return k(n,t,"internal-error"),uc(n,new Ii(i),i.bypassAuthState)}async function Dc(i){const{auth:t,user:n}=i;return k(n,t,"internal-error"),lc(n,new Ii(i),i.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Qr{constructor(t,n,s,a,c=!1){this.auth=t,this.resolver=s,this.user=a,this.bypassAuthState=c,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(t,n)=>{this.pendingPromise={resolve:t,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(t){const{urlResponse:n,sessionId:s,postBody:a,tenantId:c,error:l,type:w}=t;if(l){this.reject(l);return}const T={auth:this.auth,requestUri:n,sessionId:s,tenantId:c||void 0,postBody:a||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(w)(T))}catch(v){this.reject(v)}}onError(t){this.reject(t)}getIdpTask(t){switch(t){case"signInViaPopup":case"signInViaRedirect":return Nc;case"linkViaPopup":case"linkViaRedirect":return Dc;case"reauthViaPopup":case"reauthViaRedirect":return Oc;default:gt(this.auth,"internal-error")}}resolve(t){mt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(t),this.unregisterAndCleanUp()}reject(t){mt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(t),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Lc=new Ve(2e3,1e4);class ee extends Qr{constructor(t,n,s,a,c){super(t,n,a,c),this.provider=s,this.authWindow=null,this.pollId=null,ee.currentPopupAction&&ee.currentPopupAction.cancel(),ee.currentPopupAction=this}async executeNotNull(){const t=await this.execute();return k(t,this.auth,"internal-error"),t}async onExecution(){mt(this.filter.length===1,"Popup operations only handle one event");const t=wi();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],t),this.authWindow.associatedEvent=t,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(ct(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var t;return((t=this.authWindow)==null?void 0:t.associatedEvent)||null}cancel(){this.reject(ct(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,ee.currentPopupAction=null}pollUserCancellation(){const t=()=>{var n,s;if((s=(n=this.authWindow)==null?void 0:n.window)!=null&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ct(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(t,Lc.get())};t()}}ee.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Mc="pendingRedirect",cn=new Map;class Uc extends Qr{constructor(t,n,s=!1){super(t,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,s),this.eventId=null}async execute(){let t=cn.get(this.auth._key());if(!t){try{const s=await xc(this.resolver,this.auth)?await super.execute():null;t=()=>Promise.resolve(s)}catch(n){t=()=>Promise.reject(n)}cn.set(this.auth._key(),t)}return this.bypassAuthState||cn.set(this.auth._key(),()=>Promise.resolve(null)),t()}async onAuthEvent(t){if(t.type==="signInViaRedirect")return super.onAuthEvent(t);if(t.type==="unknown"){this.resolve(null);return}if(t.eventId){const n=await this.auth._redirectUserForId(t.eventId);if(n)return this.user=n,super.onAuthEvent(t);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function xc(i,t){const n=jc(t),s=Vc(i);if(!await s._isAvailable())return!1;const a=await s._get(n)==="true";return await s._remove(n),a}function Fc(i,t){cn.set(i._key(),t)}function Vc(i){return ft(i._redirectPersistence)}function jc(i){return an(Mc,i.config.apiKey,i.name)}async function Hc(i,t,n=!1){if(ot(i.app))return Promise.reject(jt(i));const s=yi(i),a=bc(s,t),l=await new Uc(s,a,n).execute();return l&&!n&&(delete l.user._redirectEventId,await s._persistUserIfCurrent(l.user),await s._setRedirectUser(null,t)),l}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const qc=600*1e3;class $c{constructor(t){this.auth=t,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(t){this.consumers.add(t),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,t)&&(this.sendToConsumer(this.queuedRedirectEvent,t),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(t){this.consumers.delete(t)}onEvent(t){if(this.hasEventBeenHandled(t))return!1;let n=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(t,s)&&(n=!0,this.sendToConsumer(t,s),this.saveEventToCache(t))}),this.hasHandledPotentialRedirect||!Bc(t)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=t,n=!0)),n}sendToConsumer(t,n){var s;if(t.error&&!Zr(t)){const a=((s=t.error.code)==null?void 0:s.split("auth/")[1])||"internal-error";n.onError(ct(this.auth,a))}else n.onAuthEvent(t)}isEventForConsumer(t,n){const s=n.eventId===null||!!t.eventId&&t.eventId===n.eventId;return n.filter.includes(t.type)&&s}hasEventBeenHandled(t){return Date.now()-this.lastProcessedEventTime>=qc&&this.cachedEventUids.clear(),this.cachedEventUids.has(qs(t))}saveEventToCache(t){this.cachedEventUids.add(qs(t)),this.lastProcessedEventTime=Date.now()}}function qs(i){return[i.type,i.eventId,i.sessionId,i.tenantId].filter(t=>t).join("-")}function Zr({type:i,error:t}){return i==="unknown"&&(t==null?void 0:t.code)==="auth/no-auth-event"}function Bc(i){switch(i.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Zr(i);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */async function Gc(i,t={}){return ue(i,"GET","/v1/projects",t)}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Wc=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,zc=/^https?/;async function Kc(i){if(i.config.emulator)return;const{authorizedDomains:t}=await Gc(i);for(const n of t)try{if(Jc(n))return}catch{}gt(i,"unauthorized-domain")}function Jc(i){const t=si(),{protocol:n,hostname:s}=new URL(t);if(i.startsWith("chrome-extension://")){const l=new URL(i);return l.hostname===""&&s===""?n==="chrome-extension:"&&i.replace("chrome-extension://","")===t.replace("chrome-extension://",""):n==="chrome-extension:"&&l.hostname===s}if(!zc.test(n))return!1;if(Wc.test(i))return s===i;const a=i.replace(/\./g,"\\.");return new RegExp("^(.+\\."+a+"|"+a+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const Xc=new Ve(3e4,6e4);function $s(){const i=ht().___jsl;if(i!=null&&i.H){for(const t of Object.keys(i.H))if(i.H[t].r=i.H[t].r||[],i.H[t].L=i.H[t].L||[],i.H[t].r=[...i.H[t].L],i.CP)for(let n=0;n<i.CP.length;n++)i.CP[n]=null}}function Yc(i){return new Promise((t,n)=>{var a,c,l;function s(){$s(),gapi.load("gapi.iframes",{callback:()=>{t(gapi.iframes.getContext())},ontimeout:()=>{$s(),n(ct(i,"network-request-failed"))},timeout:Xc.get()})}if((c=(a=ht().gapi)==null?void 0:a.iframes)!=null&&c.Iframe)t(gapi.iframes.getContext());else if((l=ht().gapi)!=null&&l.load)s();else{const w=ic("iframefcb");return ht()[w]=()=>{gapi.load?s():n(ct(i,"network-request-failed"))},ec(`${nc()}?onload=${w}`).catch(T=>n(T))}}).catch(t=>{throw hn=null,t})}let hn=null;function Qc(i){return hn=hn||Yc(i),hn}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const Zc=new Ve(5e3,15e3),th="__/auth/iframe",eh="emulator/auth/iframe",nh={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},ih=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function sh(i){const t=i.config;k(t.authDomain,i,"auth-domain-config-required");const n=t.emulator?fi(t,eh):`https://${i.config.authDomain}/${th}`,s={apiKey:t.apiKey,appName:i.name,v:he},a=ih.get(i.config.apiHost);a&&(s.eid=a);const c=i._getFrameworks();return c.length&&(s.fw=c.join(",")),`${n}?${Fe(s).slice(1)}`}async function rh(i){const t=await Qc(i),n=ht().gapi;return k(n,i,"internal-error"),t.open({where:document.body,url:sh(i),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:nh,dontclear:!0},s=>new Promise(async(a,c)=>{await s.restyle({setHideOnLeave:!1});const l=ct(i,"network-request-failed"),w=ht().setTimeout(()=>{c(l)},Zc.get());function T(){ht().clearTimeout(w),a(s)}s.ping(T).then(T,()=>{c(l)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const oh={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},ah=500,ch=600,hh="_blank",lh="http://localhost";class Bs{constructor(t){this.window=t,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function uh(i,t,n,s=ah,a=ch){const c=Math.max((window.screen.availHeight-a)/2,0).toString(),l=Math.max((window.screen.availWidth-s)/2,0).toString();let w="";const T={...oh,width:s.toString(),height:a.toString(),top:c,left:l},v=K().toLowerCase();n&&(w=Dr(v)?hh:n),Nr(v)&&(t=t||lh,T.scrollbars="yes");const S=Object.entries(T).reduce((N,[Y,F])=>`${N}${Y}=${F},`,"");if(za(v)&&w!=="_self")return dh(t||"",w),new Bs(null);const A=window.open(t||"",w,S);k(A,i,"popup-blocked");try{A.focus()}catch{}return new Bs(A)}function dh(i,t){const n=document.createElement("a");n.href=i,n.target=t;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
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
 */const fh="__/auth/handler",ph="emulator/auth/handler",gh=encodeURIComponent("fac");async function Gs(i,t,n,s,a,c){k(i.config.authDomain,i,"auth-domain-config-required"),k(i.config.apiKey,i,"invalid-api-key");const l={apiKey:i.config.apiKey,appName:i.name,authType:n,redirectUrl:s,v:he,eventId:a};if(t instanceof qr){t.setDefaultLanguage(i.languageCode),l.providerId=t.providerId||"",ya(t.getCustomParameters())||(l.customParameters=JSON.stringify(t.getCustomParameters()));for(const[S,A]of Object.entries({}))l[S]=A}if(t instanceof je){const S=t.getScopes().filter(A=>A!=="");S.length>0&&(l.scopes=S.join(","))}i.tenantId&&(l.tid=i.tenantId);const w=l;for(const S of Object.keys(w))w[S]===void 0&&delete w[S];const T=await i._getAppCheckToken(),v=T?`#${gh}=${encodeURIComponent(T)}`:"";return`${mh(i)}?${Fe(w).slice(1)}${v}`}function mh({config:i}){return i.emulator?fi(i,ph):`https://${i.authDomain}/${fh}`}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Qn="webStorageSupport";class yh{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=zr,this._completeRedirectFn=Hc,this._overrideRedirectResult=Fc}async _openPopup(t,n,s,a){var l;mt((l=this.eventManagers[t._key()])==null?void 0:l.manager,"_initialize() not called before _openPopup()");const c=await Gs(t,n,s,si(),a);return uh(t,c,wi())}async _openRedirect(t,n,s,a){await this._originValidation(t);const c=await Gs(t,n,s,si(),a);return Ic(c),new Promise(()=>{})}_initialize(t){const n=t._key();if(this.eventManagers[n]){const{manager:a,promise:c}=this.eventManagers[n];return a?Promise.resolve(a):(mt(c,"If manager is not set, promise should be"),c)}const s=this.initAndGetManager(t);return this.eventManagers[n]={promise:s},s.catch(()=>{delete this.eventManagers[n]}),s}async initAndGetManager(t){const n=await rh(t),s=new $c(t);return n.register("authEvent",a=>(k(a==null?void 0:a.authEvent,t,"invalid-auth-event"),{status:s.onEvent(a.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[t._key()]={manager:s},this.iframes[t._key()]=n,s}_isIframeWebStorageSupported(t,n){this.iframes[t._key()].send(Qn,{type:Qn},a=>{var l;const c=(l=a==null?void 0:a[0])==null?void 0:l[Qn];c!==void 0&&n(!!c),gt(t,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(t){const n=t._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Kc(t)),this.originValidationPromises[n]}get _shouldInitProactively(){return Fr()||Or()||mi()}}const _h=yh;var Ws="@firebase/auth",zs="1.12.0";/**
 * @license
 * Copyright 2020 Google LLC
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
 */class wh{constructor(t){this.auth=t,this.internalListeners=new Map}getUid(){var t;return this.assertAuthConfigured(),((t=this.auth.currentUser)==null?void 0:t.uid)||null}async getToken(t){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(t)}:null}addAuthTokenListener(t){if(this.assertAuthConfigured(),this.internalListeners.has(t))return;const n=this.auth.onIdTokenChanged(s=>{t((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(t,n),this.updateProactiveRefresh()}removeAuthTokenListener(t){this.assertAuthConfigured();const n=this.internalListeners.get(t);n&&(this.internalListeners.delete(t),n(),this.updateProactiveRefresh())}assertAuthConfigured(){k(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Ih(i){switch(i){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Th(i){$t(new Bt("auth",(t,{options:n})=>{const s=t.getProvider("app").getImmediate(),a=t.getProvider("heartbeat"),c=t.getProvider("app-check-internal"),{apiKey:l,authDomain:w}=s.options;k(l&&!l.includes(":"),"invalid-api-key",{appName:s.name});const T={apiKey:l,authDomain:w,clientPlatform:i,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Vr(i)},v=new Za(s,a,c,T);return rc(v,n),v},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((t,n,s)=>{t.getProvider("auth-internal").initialize()})),$t(new Bt("auth-internal",t=>{const n=yi(t.getProvider("auth").getImmediate());return(s=>new wh(s))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),pt(Ws,zs,Ih(i)),pt(Ws,zs,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
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
 */const vh=300,Eh=wr("authIdTokenMaxAge")||vh;let Ks=null;const Ah=i=>async t=>{const n=t&&await t.getIdTokenResult(),s=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(s&&s>Eh)return;const a=n==null?void 0:n.token;Ks!==a&&(Ks=a,await fetch(i,{method:a?"POST":"DELETE",headers:a?{Authorization:`Bearer ${a}`}:{}}))};function Sh(i=ui()){const t=Jt(i,"auth");if(t.isInitialized())return t.getImmediate();const n=sc(i,{popupRedirectResolver:_h,persistence:[Cc,yc,zr]}),s=wr("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const c=new URL(s,location.origin);if(location.origin===c.origin){const l=Ah(c.toString());pc(n,l,()=>l(n.currentUser)),fc(n,w=>l(w))}}const a=ga("auth");return a&&oc(n,`http://${a}`),n}function kh(){var i;return((i=document.getElementsByTagName("head"))==null?void 0:i[0])??document}tc({loadJS(i){return new Promise((t,n)=>{const s=document.createElement("script");s.setAttribute("src",i),s.onload=t,s.onerror=a=>{const c=ct("internal-error");c.customData=a,n(c)},s.type="text/javascript",s.charset="UTF-8",kh().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Th("Browser");var Js=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ti;(function(){var i;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(g,u){function f(){}f.prototype=u.prototype,g.F=u.prototype,g.prototype=new f,g.prototype.constructor=g,g.D=function(m,p,_){for(var d=Array(arguments.length-2),W=2;W<arguments.length;W++)d[W-2]=arguments[W];return u.prototype[p].apply(m,d)}}function n(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}t(s,n),s.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function a(g,u,f){f||(f=0);const m=Array(16);if(typeof u=="string")for(var p=0;p<16;++p)m[p]=u.charCodeAt(f++)|u.charCodeAt(f++)<<8|u.charCodeAt(f++)<<16|u.charCodeAt(f++)<<24;else for(p=0;p<16;++p)m[p]=u[f++]|u[f++]<<8|u[f++]<<16|u[f++]<<24;u=g.g[0],f=g.g[1],p=g.g[2];let _=g.g[3],d;d=u+(_^f&(p^_))+m[0]+3614090360&4294967295,u=f+(d<<7&4294967295|d>>>25),d=_+(p^u&(f^p))+m[1]+3905402710&4294967295,_=u+(d<<12&4294967295|d>>>20),d=p+(f^_&(u^f))+m[2]+606105819&4294967295,p=_+(d<<17&4294967295|d>>>15),d=f+(u^p&(_^u))+m[3]+3250441966&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(_^f&(p^_))+m[4]+4118548399&4294967295,u=f+(d<<7&4294967295|d>>>25),d=_+(p^u&(f^p))+m[5]+1200080426&4294967295,_=u+(d<<12&4294967295|d>>>20),d=p+(f^_&(u^f))+m[6]+2821735955&4294967295,p=_+(d<<17&4294967295|d>>>15),d=f+(u^p&(_^u))+m[7]+4249261313&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(_^f&(p^_))+m[8]+1770035416&4294967295,u=f+(d<<7&4294967295|d>>>25),d=_+(p^u&(f^p))+m[9]+2336552879&4294967295,_=u+(d<<12&4294967295|d>>>20),d=p+(f^_&(u^f))+m[10]+4294925233&4294967295,p=_+(d<<17&4294967295|d>>>15),d=f+(u^p&(_^u))+m[11]+2304563134&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(_^f&(p^_))+m[12]+1804603682&4294967295,u=f+(d<<7&4294967295|d>>>25),d=_+(p^u&(f^p))+m[13]+4254626195&4294967295,_=u+(d<<12&4294967295|d>>>20),d=p+(f^_&(u^f))+m[14]+2792965006&4294967295,p=_+(d<<17&4294967295|d>>>15),d=f+(u^p&(_^u))+m[15]+1236535329&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(p^_&(f^p))+m[1]+4129170786&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^p&(u^f))+m[6]+3225465664&4294967295,_=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(_^u))+m[11]+643717713&4294967295,p=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(p^_))+m[0]+3921069994&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(p^_&(f^p))+m[5]+3593408605&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^p&(u^f))+m[10]+38016083&4294967295,_=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(_^u))+m[15]+3634488961&4294967295,p=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(p^_))+m[4]+3889429448&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(p^_&(f^p))+m[9]+568446438&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^p&(u^f))+m[14]+3275163606&4294967295,_=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(_^u))+m[3]+4107603335&4294967295,p=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(p^_))+m[8]+1163531501&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(p^_&(f^p))+m[13]+2850285829&4294967295,u=f+(d<<5&4294967295|d>>>27),d=_+(f^p&(u^f))+m[2]+4243563512&4294967295,_=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(_^u))+m[7]+1735328473&4294967295,p=_+(d<<14&4294967295|d>>>18),d=f+(_^u&(p^_))+m[12]+2368359562&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(f^p^_)+m[5]+4294588738&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^p)+m[8]+2272392833&4294967295,_=u+(d<<11&4294967295|d>>>21),d=p+(_^u^f)+m[11]+1839030562&4294967295,p=_+(d<<16&4294967295|d>>>16),d=f+(p^_^u)+m[14]+4259657740&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(f^p^_)+m[1]+2763975236&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^p)+m[4]+1272893353&4294967295,_=u+(d<<11&4294967295|d>>>21),d=p+(_^u^f)+m[7]+4139469664&4294967295,p=_+(d<<16&4294967295|d>>>16),d=f+(p^_^u)+m[10]+3200236656&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(f^p^_)+m[13]+681279174&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^p)+m[0]+3936430074&4294967295,_=u+(d<<11&4294967295|d>>>21),d=p+(_^u^f)+m[3]+3572445317&4294967295,p=_+(d<<16&4294967295|d>>>16),d=f+(p^_^u)+m[6]+76029189&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(f^p^_)+m[9]+3654602809&4294967295,u=f+(d<<4&4294967295|d>>>28),d=_+(u^f^p)+m[12]+3873151461&4294967295,_=u+(d<<11&4294967295|d>>>21),d=p+(_^u^f)+m[15]+530742520&4294967295,p=_+(d<<16&4294967295|d>>>16),d=f+(p^_^u)+m[2]+3299628645&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(p^(f|~_))+m[0]+4096336452&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~p))+m[7]+1126891415&4294967295,_=u+(d<<10&4294967295|d>>>22),d=p+(u^(_|~f))+m[14]+2878612391&4294967295,p=_+(d<<15&4294967295|d>>>17),d=f+(_^(p|~u))+m[5]+4237533241&4294967295,f=p+(d<<21&4294967295|d>>>11),d=u+(p^(f|~_))+m[12]+1700485571&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~p))+m[3]+2399980690&4294967295,_=u+(d<<10&4294967295|d>>>22),d=p+(u^(_|~f))+m[10]+4293915773&4294967295,p=_+(d<<15&4294967295|d>>>17),d=f+(_^(p|~u))+m[1]+2240044497&4294967295,f=p+(d<<21&4294967295|d>>>11),d=u+(p^(f|~_))+m[8]+1873313359&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~p))+m[15]+4264355552&4294967295,_=u+(d<<10&4294967295|d>>>22),d=p+(u^(_|~f))+m[6]+2734768916&4294967295,p=_+(d<<15&4294967295|d>>>17),d=f+(_^(p|~u))+m[13]+1309151649&4294967295,f=p+(d<<21&4294967295|d>>>11),d=u+(p^(f|~_))+m[4]+4149444226&4294967295,u=f+(d<<6&4294967295|d>>>26),d=_+(f^(u|~p))+m[11]+3174756917&4294967295,_=u+(d<<10&4294967295|d>>>22),d=p+(u^(_|~f))+m[2]+718787259&4294967295,p=_+(d<<15&4294967295|d>>>17),d=f+(_^(p|~u))+m[9]+3951481745&4294967295,g.g[0]=g.g[0]+u&4294967295,g.g[1]=g.g[1]+(p+(d<<21&4294967295|d>>>11))&4294967295,g.g[2]=g.g[2]+p&4294967295,g.g[3]=g.g[3]+_&4294967295}s.prototype.v=function(g,u){u===void 0&&(u=g.length);const f=u-this.blockSize,m=this.C;let p=this.h,_=0;for(;_<u;){if(p==0)for(;_<=f;)a(this,g,_),_+=this.blockSize;if(typeof g=="string"){for(;_<u;)if(m[p++]=g.charCodeAt(_++),p==this.blockSize){a(this,m),p=0;break}}else for(;_<u;)if(m[p++]=g[_++],p==this.blockSize){a(this,m),p=0;break}}this.h=p,this.o+=u},s.prototype.A=function(){var g=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);g[0]=128;for(var u=1;u<g.length-8;++u)g[u]=0;u=this.o*8;for(var f=g.length-8;f<g.length;++f)g[f]=u&255,u/=256;for(this.v(g),g=Array(16),u=0,f=0;f<4;++f)for(let m=0;m<32;m+=8)g[u++]=this.g[f]>>>m&255;return g};function c(g,u){var f=w;return Object.prototype.hasOwnProperty.call(f,g)?f[g]:f[g]=u(g)}function l(g,u){this.h=u;const f=[];let m=!0;for(let p=g.length-1;p>=0;p--){const _=g[p]|0;m&&_==u||(f[p]=_,m=!1)}this.g=f}var w={};function T(g){return-128<=g&&g<128?c(g,function(u){return new l([u|0],u<0?-1:0)}):new l([g|0],g<0?-1:0)}function v(g){if(isNaN(g)||!isFinite(g))return A;if(g<0)return L(v(-g));const u=[];let f=1;for(let m=0;g>=f;m++)u[m]=g/f|0,f*=4294967296;return new l(u,0)}function S(g,u){if(g.length==0)throw Error("number format error: empty string");if(u=u||10,u<2||36<u)throw Error("radix out of range: "+u);if(g.charAt(0)=="-")return L(S(g.substring(1),u));if(g.indexOf("-")>=0)throw Error('number format error: interior "-" character');const f=v(Math.pow(u,8));let m=A;for(let _=0;_<g.length;_+=8){var p=Math.min(8,g.length-_);const d=parseInt(g.substring(_,_+p),u);p<8?(p=v(Math.pow(u,p)),m=m.j(p).add(v(d))):(m=m.j(f),m=m.add(v(d)))}return m}var A=T(0),N=T(1),Y=T(16777216);i=l.prototype,i.m=function(){if(j(this))return-L(this).m();let g=0,u=1;for(let f=0;f<this.g.length;f++){const m=this.i(f);g+=(m>=0?m:4294967296+m)*u,u*=4294967296}return g},i.toString=function(g){if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(F(this))return"0";if(j(this))return"-"+L(this).toString(g);const u=v(Math.pow(g,6));var f=this;let m="";for(;;){const p=Xt(f,u).g;f=et(f,p.j(u));let _=((f.g.length>0?f.g[0]:f.h)>>>0).toString(g);if(f=p,F(f))return _+m;for(;_.length<6;)_="0"+_;m=_+m}},i.i=function(g){return g<0?0:g<this.g.length?this.g[g]:this.h};function F(g){if(g.h!=0)return!1;for(let u=0;u<g.g.length;u++)if(g.g[u]!=0)return!1;return!0}function j(g){return g.h==-1}i.l=function(g){return g=et(this,g),j(g)?-1:F(g)?0:1};function L(g){const u=g.g.length,f=[];for(let m=0;m<u;m++)f[m]=~g.g[m];return new l(f,~g.h).add(N)}i.abs=function(){return j(this)?L(this):this},i.add=function(g){const u=Math.max(this.g.length,g.g.length),f=[];let m=0;for(let p=0;p<=u;p++){let _=m+(this.i(p)&65535)+(g.i(p)&65535),d=(_>>>16)+(this.i(p)>>>16)+(g.i(p)>>>16);m=d>>>16,_&=65535,d&=65535,f[p]=d<<16|_}return new l(f,f[f.length-1]&-2147483648?-1:0)};function et(g,u){return g.add(L(u))}i.j=function(g){if(F(this)||F(g))return A;if(j(this))return j(g)?L(this).j(L(g)):L(L(this).j(g));if(j(g))return L(this.j(L(g)));if(this.l(Y)<0&&g.l(Y)<0)return v(this.m()*g.m());const u=this.g.length+g.g.length,f=[];for(var m=0;m<2*u;m++)f[m]=0;for(m=0;m<this.g.length;m++)for(let p=0;p<g.g.length;p++){const _=this.i(m)>>>16,d=this.i(m)&65535,W=g.i(p)>>>16,Ot=g.i(p)&65535;f[2*m+2*p]+=d*Ot,yt(f,2*m+2*p),f[2*m+2*p+1]+=_*Ot,yt(f,2*m+2*p+1),f[2*m+2*p+1]+=d*W,yt(f,2*m+2*p+1),f[2*m+2*p+2]+=_*W,yt(f,2*m+2*p+2)}for(g=0;g<u;g++)f[g]=f[2*g+1]<<16|f[2*g];for(g=u;g<2*u;g++)f[g]=0;return new l(f,0)};function yt(g,u){for(;(g[u]&65535)!=g[u];)g[u+1]+=g[u]>>>16,g[u]&=65535,u++}function _t(g,u){this.g=g,this.h=u}function Xt(g,u){if(F(u))throw Error("division by zero");if(F(g))return new _t(A,A);if(j(g))return u=Xt(L(g),u),new _t(L(u.g),L(u.h));if(j(u))return u=Xt(g,L(u)),new _t(L(u.g),u.h);if(g.g.length>30){if(j(g)||j(u))throw Error("slowDivide_ only works with positive integers.");for(var f=N,m=u;m.l(g)<=0;)f=wt(f),m=wt(m);var p=J(f,1),_=J(m,1);for(m=J(m,2),f=J(f,2);!F(m);){var d=_.add(m);d.l(g)<=0&&(p=p.add(f),_=d),m=J(m,1),f=J(f,1)}return u=et(g,p.j(u)),new _t(p,u)}for(p=A;g.l(u)>=0;){for(f=Math.max(1,Math.floor(g.m()/u.m())),m=Math.ceil(Math.log(f)/Math.LN2),m=m<=48?1:Math.pow(2,m-48),_=v(f),d=_.j(u);j(d)||d.l(g)>0;)f-=m,_=v(f),d=_.j(u);F(_)&&(_=N),p=p.add(_),g=et(g,d)}return new _t(p,g)}i.B=function(g){return Xt(this,g).h},i.and=function(g){const u=Math.max(this.g.length,g.g.length),f=[];for(let m=0;m<u;m++)f[m]=this.i(m)&g.i(m);return new l(f,this.h&g.h)},i.or=function(g){const u=Math.max(this.g.length,g.g.length),f=[];for(let m=0;m<u;m++)f[m]=this.i(m)|g.i(m);return new l(f,this.h|g.h)},i.xor=function(g){const u=Math.max(this.g.length,g.g.length),f=[];for(let m=0;m<u;m++)f[m]=this.i(m)^g.i(m);return new l(f,this.h^g.h)};function wt(g){const u=g.g.length+1,f=[];for(let m=0;m<u;m++)f[m]=g.i(m)<<1|g.i(m-1)>>>31;return new l(f,g.h)}function J(g,u){const f=u>>5;u%=32;const m=g.g.length-f,p=[];for(let _=0;_<m;_++)p[_]=u>0?g.i(_+f)>>>u|g.i(_+f+1)<<32-u:g.i(_+f);return new l(p,g.h)}s.prototype.digest=s.prototype.A,s.prototype.reset=s.prototype.u,s.prototype.update=s.prototype.v,l.prototype.add=l.prototype.add,l.prototype.multiply=l.prototype.j,l.prototype.modulo=l.prototype.B,l.prototype.compare=l.prototype.l,l.prototype.toNumber=l.prototype.m,l.prototype.toString=l.prototype.toString,l.prototype.getBits=l.prototype.i,l.fromNumber=v,l.fromString=S,Ti=l}).apply(typeof Js<"u"?Js:typeof self<"u"?self:typeof window<"u"?window:{});var sn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var i,t=Object.defineProperty;function n(e){e=[typeof globalThis=="object"&&globalThis,e,typeof window=="object"&&window,typeof self=="object"&&self,typeof sn=="object"&&sn];for(var r=0;r<e.length;++r){var o=e[r];if(o&&o.Math==Math)return o}throw Error("Cannot find global object")}var s=n(this);function a(e,r){if(r)t:{var o=s;e=e.split(".");for(var h=0;h<e.length-1;h++){var y=e[h];if(!(y in o))break t;o=o[y]}e=e[e.length-1],h=o[e],r=r(h),r!=h&&r!=null&&t(o,e,{configurable:!0,writable:!0,value:r})}}a("Symbol.dispose",function(e){return e||Symbol("Symbol.dispose")}),a("Array.prototype.values",function(e){return e||function(){return this[Symbol.iterator]()}}),a("Object.entries",function(e){return e||function(r){var o=[],h;for(h in r)Object.prototype.hasOwnProperty.call(r,h)&&o.push([h,r[h]]);return o}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var c=c||{},l=this||self;function w(e){var r=typeof e;return r=="object"&&e!=null||r=="function"}function T(e,r,o){return e.call.apply(e.bind,arguments)}function v(e,r,o){return v=T,v.apply(null,arguments)}function S(e,r){var o=Array.prototype.slice.call(arguments,1);return function(){var h=o.slice();return h.push.apply(h,arguments),e.apply(this,h)}}function A(e,r){function o(){}o.prototype=r.prototype,e.Z=r.prototype,e.prototype=new o,e.prototype.constructor=e,e.Ob=function(h,y,I){for(var E=Array(arguments.length-2),P=2;P<arguments.length;P++)E[P-2]=arguments[P];return r.prototype[y].apply(h,E)}}var N=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?e=>e&&AsyncContext.Snapshot.wrap(e):e=>e;function Y(e){const r=e.length;if(r>0){const o=Array(r);for(let h=0;h<r;h++)o[h]=e[h];return o}return[]}function F(e,r){for(let h=1;h<arguments.length;h++){const y=arguments[h];var o=typeof y;if(o=o!="object"?o:y?Array.isArray(y)?"array":o:"null",o=="array"||o=="object"&&typeof y.length=="number"){o=e.length||0;const I=y.length||0;e.length=o+I;for(let E=0;E<I;E++)e[o+E]=y[E]}else e.push(y)}}class j{constructor(r,o){this.i=r,this.j=o,this.h=0,this.g=null}get(){let r;return this.h>0?(this.h--,r=this.g,this.g=r.next,r.next=null):r=this.i(),r}}function L(e){l.setTimeout(()=>{throw e},0)}function et(){var e=g;let r=null;return e.g&&(r=e.g,e.g=e.g.next,e.g||(e.h=null),r.next=null),r}class yt{constructor(){this.h=this.g=null}add(r,o){const h=_t.get();h.set(r,o),this.h?this.h.next=h:this.g=h,this.h=h}}var _t=new j(()=>new Xt,e=>e.reset());class Xt{constructor(){this.next=this.g=this.h=null}set(r,o){this.h=r,this.g=o,this.next=null}reset(){this.next=this.g=this.h=null}}let wt,J=!1,g=new yt,u=()=>{const e=Promise.resolve(void 0);wt=()=>{e.then(f)}};function f(){for(var e;e=et();){try{e.h.call(e.g)}catch(o){L(o)}var r=_t;r.j(e),r.h<100&&(r.h++,e.next=r.g,r.g=e)}J=!1}function m(){this.u=this.u,this.C=this.C}m.prototype.u=!1,m.prototype.dispose=function(){this.u||(this.u=!0,this.N())},m.prototype[Symbol.dispose]=function(){this.dispose()},m.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function p(e,r){this.type=e,this.g=this.target=r,this.defaultPrevented=!1}p.prototype.h=function(){this.defaultPrevented=!0};var _=(function(){if(!l.addEventListener||!Object.defineProperty)return!1;var e=!1,r=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const o=()=>{};l.addEventListener("test",o,r),l.removeEventListener("test",o,r)}catch{}return e})();function d(e){return/^[\s\xa0]*$/.test(e)}function W(e,r){p.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e&&this.init(e,r)}A(W,p),W.prototype.init=function(e,r){const o=this.type=e.type,h=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;this.target=e.target||e.srcElement,this.g=r,r=e.relatedTarget,r||(o=="mouseover"?r=e.fromElement:o=="mouseout"&&(r=e.toElement)),this.relatedTarget=r,h?(this.clientX=h.clientX!==void 0?h.clientX:h.pageX,this.clientY=h.clientY!==void 0?h.clientY:h.pageY,this.screenX=h.screenX||0,this.screenY=h.screenY||0):(this.clientX=e.clientX!==void 0?e.clientX:e.pageX,this.clientY=e.clientY!==void 0?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType=e.pointerType,this.state=e.state,this.i=e,e.defaultPrevented&&W.Z.h.call(this)},W.prototype.h=function(){W.Z.h.call(this);const e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var Ot="closure_listenable_"+(Math.random()*1e6|0),No=0;function Oo(e,r,o,h,y){this.listener=e,this.proxy=null,this.src=r,this.type=o,this.capture=!!h,this.ha=y,this.key=++No,this.da=this.fa=!1}function Be(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function Ge(e,r,o){for(const h in e)r.call(o,e[h],h,e)}function Do(e,r){for(const o in e)r.call(void 0,e[o],o,e)}function Oi(e){const r={};for(const o in e)r[o]=e[o];return r}const Di="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Li(e,r){let o,h;for(let y=1;y<arguments.length;y++){h=arguments[y];for(o in h)e[o]=h[o];for(let I=0;I<Di.length;I++)o=Di[I],Object.prototype.hasOwnProperty.call(h,o)&&(e[o]=h[o])}}function We(e){this.src=e,this.g={},this.h=0}We.prototype.add=function(e,r,o,h,y){const I=e.toString();e=this.g[I],e||(e=this.g[I]=[],this.h++);const E=kn(e,r,h,y);return E>-1?(r=e[E],o||(r.fa=!1)):(r=new Oo(r,this.src,I,!!h,y),r.fa=o,e.push(r)),r};function Sn(e,r){const o=r.type;if(o in e.g){var h=e.g[o],y=Array.prototype.indexOf.call(h,r,void 0),I;(I=y>=0)&&Array.prototype.splice.call(h,y,1),I&&(Be(r),e.g[o].length==0&&(delete e.g[o],e.h--))}}function kn(e,r,o,h){for(let y=0;y<e.length;++y){const I=e[y];if(!I.da&&I.listener==r&&I.capture==!!o&&I.ha==h)return y}return-1}var Pn="closure_lm_"+(Math.random()*1e6|0),Rn={};function Mi(e,r,o,h,y){if(Array.isArray(r)){for(let I=0;I<r.length;I++)Mi(e,r[I],o,h,y);return null}return o=Fi(o),e&&e[Ot]?e.J(r,o,w(h)?!!h.capture:!1,y):Lo(e,r,o,!1,h,y)}function Lo(e,r,o,h,y,I){if(!r)throw Error("Invalid event type");const E=w(y)?!!y.capture:!!y;let P=bn(e);if(P||(e[Pn]=P=new We(e)),o=P.add(r,o,h,E,I),o.proxy)return o;if(h=Mo(),o.proxy=h,h.src=e,h.listener=o,e.addEventListener)_||(y=E),y===void 0&&(y=!1),e.addEventListener(r.toString(),h,y);else if(e.attachEvent)e.attachEvent(xi(r.toString()),h);else if(e.addListener&&e.removeListener)e.addListener(h);else throw Error("addEventListener and attachEvent are unavailable.");return o}function Mo(){function e(o){return r.call(e.src,e.listener,o)}const r=Uo;return e}function Ui(e,r,o,h,y){if(Array.isArray(r))for(var I=0;I<r.length;I++)Ui(e,r[I],o,h,y);else h=w(h)?!!h.capture:!!h,o=Fi(o),e&&e[Ot]?(e=e.i,I=String(r).toString(),I in e.g&&(r=e.g[I],o=kn(r,o,h,y),o>-1&&(Be(r[o]),Array.prototype.splice.call(r,o,1),r.length==0&&(delete e.g[I],e.h--)))):e&&(e=bn(e))&&(r=e.g[r.toString()],e=-1,r&&(e=kn(r,o,h,y)),(o=e>-1?r[e]:null)&&Cn(o))}function Cn(e){if(typeof e!="number"&&e&&!e.da){var r=e.src;if(r&&r[Ot])Sn(r.i,e);else{var o=e.type,h=e.proxy;r.removeEventListener?r.removeEventListener(o,h,e.capture):r.detachEvent?r.detachEvent(xi(o),h):r.addListener&&r.removeListener&&r.removeListener(h),(o=bn(r))?(Sn(o,e),o.h==0&&(o.src=null,r[Pn]=null)):Be(e)}}}function xi(e){return e in Rn?Rn[e]:Rn[e]="on"+e}function Uo(e,r){if(e.da)e=!0;else{r=new W(r,this);const o=e.listener,h=e.ha||e.src;e.fa&&Cn(e),e=o.call(h,r)}return e}function bn(e){return e=e[Pn],e instanceof We?e:null}var Nn="__closure_events_fn_"+(Math.random()*1e9>>>0);function Fi(e){return typeof e=="function"?e:(e[Nn]||(e[Nn]=function(r){return e.handleEvent(r)}),e[Nn])}function H(){m.call(this),this.i=new We(this),this.M=this,this.G=null}A(H,m),H.prototype[Ot]=!0,H.prototype.removeEventListener=function(e,r,o,h){Ui(this,e,r,o,h)};function q(e,r){var o,h=e.G;if(h)for(o=[];h;h=h.G)o.push(h);if(e=e.M,h=r.type||r,typeof r=="string")r=new p(r,e);else if(r instanceof p)r.target=r.target||e;else{var y=r;r=new p(h,e),Li(r,y)}y=!0;let I,E;if(o)for(E=o.length-1;E>=0;E--)I=r.g=o[E],y=ze(I,h,!0,r)&&y;if(I=r.g=e,y=ze(I,h,!0,r)&&y,y=ze(I,h,!1,r)&&y,o)for(E=0;E<o.length;E++)I=r.g=o[E],y=ze(I,h,!1,r)&&y}H.prototype.N=function(){if(H.Z.N.call(this),this.i){var e=this.i;for(const r in e.g){const o=e.g[r];for(let h=0;h<o.length;h++)Be(o[h]);delete e.g[r],e.h--}}this.G=null},H.prototype.J=function(e,r,o,h){return this.i.add(String(e),r,!1,o,h)},H.prototype.K=function(e,r,o,h){return this.i.add(String(e),r,!0,o,h)};function ze(e,r,o,h){if(r=e.i.g[String(r)],!r)return!0;r=r.concat();let y=!0;for(let I=0;I<r.length;++I){const E=r[I];if(E&&!E.da&&E.capture==o){const P=E.listener,x=E.ha||E.src;E.fa&&Sn(e.i,E),y=P.call(x,h)!==!1&&y}}return y&&!h.defaultPrevented}function xo(e,r){if(typeof e!="function")if(e&&typeof e.handleEvent=="function")e=v(e.handleEvent,e);else throw Error("Invalid listener argument");return Number(r)>2147483647?-1:l.setTimeout(e,r||0)}function Vi(e){e.g=xo(()=>{e.g=null,e.i&&(e.i=!1,Vi(e))},e.l);const r=e.h;e.h=null,e.m.apply(null,r)}class Fo extends m{constructor(r,o){super(),this.m=r,this.l=o,this.h=null,this.i=!1,this.g=null}j(r){this.h=arguments,this.g?this.i=!0:Vi(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function de(e){m.call(this),this.h=e,this.g={}}A(de,m);var ji=[];function Hi(e){Ge(e.g,function(r,o){this.g.hasOwnProperty(o)&&Cn(r)},e),e.g={}}de.prototype.N=function(){de.Z.N.call(this),Hi(this)},de.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var On=l.JSON.stringify,Vo=l.JSON.parse,jo=class{stringify(e){return l.JSON.stringify(e,void 0)}parse(e){return l.JSON.parse(e,void 0)}};function qi(){}function Ho(){}var fe={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Dn(){p.call(this,"d")}A(Dn,p);function Ln(){p.call(this,"c")}A(Ln,p);var Yt={},$i=null;function Mn(){return $i=$i||new H}Yt.Ia="serverreachability";function Bi(e){p.call(this,Yt.Ia,e)}A(Bi,p);function pe(e){const r=Mn();q(r,new Bi(r))}Yt.STAT_EVENT="statevent";function Gi(e,r){p.call(this,Yt.STAT_EVENT,e),this.stat=r}A(Gi,p);function $(e){const r=Mn();q(r,new Gi(r,e))}Yt.Ja="timingevent";function Wi(e,r){p.call(this,Yt.Ja,e),this.size=r}A(Wi,p);function ge(e,r){if(typeof e!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){e()},r)}function me(){this.g=!0}me.prototype.ua=function(){this.g=!1};function qo(e,r,o,h,y,I){e.info(function(){if(e.g)if(I){var E="",P=I.split("&");for(let O=0;O<P.length;O++){var x=P[O].split("=");if(x.length>1){const V=x[0];x=x[1];const it=V.split("_");E=it.length>=2&&it[1]=="type"?E+(V+"="+x+"&"):E+(V+"=redacted&")}}}else E=null;else E=I;return"XMLHTTP REQ ("+h+") [attempt "+y+"]: "+r+`
`+o+`
`+E})}function $o(e,r,o,h,y,I,E){e.info(function(){return"XMLHTTP RESP ("+h+") [ attempt "+y+"]: "+r+`
`+o+`
`+I+" "+E})}function Qt(e,r,o,h){e.info(function(){return"XMLHTTP TEXT ("+r+"): "+Go(e,o)+(h?" "+h:"")})}function Bo(e,r){e.info(function(){return"TIMEOUT: "+r})}me.prototype.info=function(){};function Go(e,r){if(!e.g)return r;if(!r)return null;try{const I=JSON.parse(r);if(I){for(e=0;e<I.length;e++)if(Array.isArray(I[e])){var o=I[e];if(!(o.length<2)){var h=o[1];if(Array.isArray(h)&&!(h.length<1)){var y=h[0];if(y!="noop"&&y!="stop"&&y!="close")for(let E=1;E<h.length;E++)h[E]=""}}}}return On(I)}catch{return r}}var Un={NO_ERROR:0,TIMEOUT:8},Wo={},zi;function xn(){}A(xn,qi),xn.prototype.g=function(){return new XMLHttpRequest},zi=new xn;function ye(e){return encodeURIComponent(String(e))}function zo(e){var r=1;e=e.split(":");const o=[];for(;r>0&&e.length;)o.push(e.shift()),r--;return e.length&&o.push(e.join(":")),o}function It(e,r,o,h){this.j=e,this.i=r,this.l=o,this.S=h||1,this.V=new de(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Ki}function Ki(){this.i=null,this.g="",this.h=!1}var Ji={},Fn={};function Vn(e,r,o){e.M=1,e.A=Je(nt(r)),e.u=o,e.R=!0,Xi(e,null)}function Xi(e,r){e.F=Date.now(),Ke(e),e.B=nt(e.A);var o=e.B,h=e.S;Array.isArray(h)||(h=[String(h)]),hs(o.i,"t",h),e.C=0,o=e.j.L,e.h=new Ki,e.g=Ps(e.j,o?r:null,!e.u),e.P>0&&(e.O=new Fo(v(e.Y,e,e.g),e.P)),r=e.V,o=e.g,h=e.ba;var y="readystatechange";Array.isArray(y)||(y&&(ji[0]=y.toString()),y=ji);for(let I=0;I<y.length;I++){const E=Mi(o,y[I],h||r.handleEvent,!1,r.h||r);if(!E)break;r.g[E.key]=E}r=e.J?Oi(e.J):{},e.u?(e.v||(e.v="POST"),r["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.B,e.v,e.u,r)):(e.v="GET",e.g.ea(e.B,e.v,null,r)),pe(),qo(e.i,e.v,e.B,e.l,e.S,e.u)}It.prototype.ba=function(e){e=e.target;const r=this.O;r&&Et(e)==3?r.j():this.Y(e)},It.prototype.Y=function(e){try{if(e==this.g)t:{const P=Et(this.g),x=this.g.ya(),O=this.g.ca();if(!(P<3)&&(P!=3||this.g&&(this.h.h||this.g.la()||ms(this.g)))){this.K||P!=4||x==7||(x==8||O<=0?pe(3):pe(2)),jn(this);var r=this.g.ca();this.X=r;var o=Ko(this);if(this.o=r==200,$o(this.i,this.v,this.B,this.l,this.S,P,r),this.o){if(this.U&&!this.L){e:{if(this.g){var h,y=this.g;if((h=y.g?y.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!d(h)){var I=h;break e}}I=null}if(e=I)Qt(this.i,this.l,e,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Hn(this,e);else{this.o=!1,this.m=3,$(12),Dt(this),_e(this);break t}}if(this.R){e=!0;let V;for(;!this.K&&this.C<o.length;)if(V=Jo(this,o),V==Fn){P==4&&(this.m=4,$(14),e=!1),Qt(this.i,this.l,null,"[Incomplete Response]");break}else if(V==Ji){this.m=4,$(15),Qt(this.i,this.l,o,"[Invalid Chunk]"),e=!1;break}else Qt(this.i,this.l,V,null),Hn(this,V);if(Yi(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),P!=4||o.length!=0||this.h.h||(this.m=1,$(16),e=!1),this.o=this.o&&e,!e)Qt(this.i,this.l,o,"[Invalid Chunked Response]"),Dt(this),_e(this);else if(o.length>0&&!this.W){this.W=!0;var E=this.j;E.g==this&&E.aa&&!E.P&&(E.j.info("Great, no buffering proxy detected. Bytes received: "+o.length),Jn(E),E.P=!0,$(11))}}else Qt(this.i,this.l,o,null),Hn(this,o);P==4&&Dt(this),this.o&&!this.K&&(P==4?Es(this.j,this):(this.o=!1,Ke(this)))}else ha(this.g),r==400&&o.indexOf("Unknown SID")>0?(this.m=3,$(12)):(this.m=0,$(13)),Dt(this),_e(this)}}}catch{}finally{}};function Ko(e){if(!Yi(e))return e.g.la();const r=ms(e.g);if(r==="")return"";let o="";const h=r.length,y=Et(e.g)==4;if(!e.h.i){if(typeof TextDecoder>"u")return Dt(e),_e(e),"";e.h.i=new l.TextDecoder}for(let I=0;I<h;I++)e.h.h=!0,o+=e.h.i.decode(r[I],{stream:!(y&&I==h-1)});return r.length=0,e.h.g+=o,e.C=0,e.h.g}function Yi(e){return e.g?e.v=="GET"&&e.M!=2&&e.j.Aa:!1}function Jo(e,r){var o=e.C,h=r.indexOf(`
`,o);return h==-1?Fn:(o=Number(r.substring(o,h)),isNaN(o)?Ji:(h+=1,h+o>r.length?Fn:(r=r.slice(h,h+o),e.C=h+o,r)))}It.prototype.cancel=function(){this.K=!0,Dt(this)};function Ke(e){e.T=Date.now()+e.H,Qi(e,e.H)}function Qi(e,r){if(e.D!=null)throw Error("WatchDog timer not null");e.D=ge(v(e.aa,e),r)}function jn(e){e.D&&(l.clearTimeout(e.D),e.D=null)}It.prototype.aa=function(){this.D=null;const e=Date.now();e-this.T>=0?(Bo(this.i,this.B),this.M!=2&&(pe(),$(17)),Dt(this),this.m=2,_e(this)):Qi(this,this.T-e)};function _e(e){e.j.I==0||e.K||Es(e.j,e)}function Dt(e){jn(e);var r=e.O;r&&typeof r.dispose=="function"&&r.dispose(),e.O=null,Hi(e.V),e.g&&(r=e.g,e.g=null,r.abort(),r.dispose())}function Hn(e,r){try{var o=e.j;if(o.I!=0&&(o.g==e||qn(o.h,e))){if(!e.L&&qn(o.h,e)&&o.I==3){try{var h=o.Ba.g.parse(r)}catch{h=null}if(Array.isArray(h)&&h.length==3){var y=h;if(y[0]==0){t:if(!o.v){if(o.g)if(o.g.F+3e3<e.F)tn(o),Qe(o);else break t;Kn(o),$(18)}}else o.xa=y[1],0<o.xa-o.K&&y[2]<37500&&o.F&&o.A==0&&!o.C&&(o.C=ge(v(o.Va,o),6e3));es(o.h)<=1&&o.ta&&(o.ta=void 0)}else Mt(o,11)}else if((e.L||o.g==e)&&tn(o),!d(r))for(y=o.Ba.g.parse(r),r=0;r<y.length;r++){let O=y[r];const V=O[0];if(!(V<=o.K))if(o.K=V,O=O[1],o.I==2)if(O[0]=="c"){o.M=O[1],o.ba=O[2];const it=O[3];it!=null&&(o.ka=it,o.j.info("VER="+o.ka));const Ut=O[4];Ut!=null&&(o.za=Ut,o.j.info("SVER="+o.za));const At=O[5];At!=null&&typeof At=="number"&&At>0&&(h=1.5*At,o.O=h,o.j.info("backChannelRequestTimeoutMs_="+h)),h=o;const St=e.g;if(St){const en=St.g?St.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(en){var I=h.h;I.g||en.indexOf("spdy")==-1&&en.indexOf("quic")==-1&&en.indexOf("h2")==-1||(I.j=I.l,I.g=new Set,I.h&&($n(I,I.h),I.h=null))}if(h.G){const Xn=St.g?St.g.getResponseHeader("X-HTTP-Session-Id"):null;Xn&&(h.wa=Xn,D(h.J,h.G,Xn))}}o.I=3,o.l&&o.l.ra(),o.aa&&(o.T=Date.now()-e.F,o.j.info("Handshake RTT: "+o.T+"ms")),h=o;var E=e;if(h.na=ks(h,h.L?h.ba:null,h.W),E.L){ns(h.h,E);var P=E,x=h.O;x&&(P.H=x),P.D&&(jn(P),Ke(P)),h.g=E}else Ts(h);o.i.length>0&&Ze(o)}else O[0]!="stop"&&O[0]!="close"||Mt(o,7);else o.I==3&&(O[0]=="stop"||O[0]=="close"?O[0]=="stop"?Mt(o,7):zn(o):O[0]!="noop"&&o.l&&o.l.qa(O),o.A=0)}}pe(4)}catch{}}var Xo=class{constructor(e,r){this.g=e,this.map=r}};function Zi(e){this.l=e||10,l.PerformanceNavigationTiming?(e=l.performance.getEntriesByType("navigation"),e=e.length>0&&(e[0].nextHopProtocol=="hq"||e[0].nextHopProtocol=="h2")):e=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function ts(e){return e.h?!0:e.g?e.g.size>=e.j:!1}function es(e){return e.h?1:e.g?e.g.size:0}function qn(e,r){return e.h?e.h==r:e.g?e.g.has(r):!1}function $n(e,r){e.g?e.g.add(r):e.h=r}function ns(e,r){e.h&&e.h==r?e.h=null:e.g&&e.g.has(r)&&e.g.delete(r)}Zi.prototype.cancel=function(){if(this.i=is(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const e of this.g.values())e.cancel();this.g.clear()}};function is(e){if(e.h!=null)return e.i.concat(e.h.G);if(e.g!=null&&e.g.size!==0){let r=e.i;for(const o of e.g.values())r=r.concat(o.G);return r}return Y(e.i)}var ss=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Yo(e,r){if(e){e=e.split("&");for(let o=0;o<e.length;o++){const h=e[o].indexOf("=");let y,I=null;h>=0?(y=e[o].substring(0,h),I=e[o].substring(h+1)):y=e[o],r(y,I?decodeURIComponent(I.replace(/\+/g," ")):"")}}}function Tt(e){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let r;e instanceof Tt?(this.l=e.l,we(this,e.j),this.o=e.o,this.g=e.g,Ie(this,e.u),this.h=e.h,Bn(this,ls(e.i)),this.m=e.m):e&&(r=String(e).match(ss))?(this.l=!1,we(this,r[1]||"",!0),this.o=Te(r[2]||""),this.g=Te(r[3]||"",!0),Ie(this,r[4]),this.h=Te(r[5]||"",!0),Bn(this,r[6]||"",!0),this.m=Te(r[7]||"")):(this.l=!1,this.i=new Ee(null,this.l))}Tt.prototype.toString=function(){const e=[];var r=this.j;r&&e.push(ve(r,rs,!0),":");var o=this.g;return(o||r=="file")&&(e.push("//"),(r=this.o)&&e.push(ve(r,rs,!0),"@"),e.push(ye(o).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o=this.u,o!=null&&e.push(":",String(o))),(o=this.h)&&(this.g&&o.charAt(0)!="/"&&e.push("/"),e.push(ve(o,o.charAt(0)=="/"?ta:Zo,!0))),(o=this.i.toString())&&e.push("?",o),(o=this.m)&&e.push("#",ve(o,na)),e.join("")},Tt.prototype.resolve=function(e){const r=nt(this);let o=!!e.j;o?we(r,e.j):o=!!e.o,o?r.o=e.o:o=!!e.g,o?r.g=e.g:o=e.u!=null;var h=e.h;if(o)Ie(r,e.u);else if(o=!!e.h){if(h.charAt(0)!="/")if(this.g&&!this.h)h="/"+h;else{var y=r.h.lastIndexOf("/");y!=-1&&(h=r.h.slice(0,y+1)+h)}if(y=h,y==".."||y==".")h="";else if(y.indexOf("./")!=-1||y.indexOf("/.")!=-1){h=y.lastIndexOf("/",0)==0,y=y.split("/");const I=[];for(let E=0;E<y.length;){const P=y[E++];P=="."?h&&E==y.length&&I.push(""):P==".."?((I.length>1||I.length==1&&I[0]!="")&&I.pop(),h&&E==y.length&&I.push("")):(I.push(P),h=!0)}h=I.join("/")}else h=y}return o?r.h=h:o=e.i.toString()!=="",o?Bn(r,ls(e.i)):o=!!e.m,o&&(r.m=e.m),r};function nt(e){return new Tt(e)}function we(e,r,o){e.j=o?Te(r,!0):r,e.j&&(e.j=e.j.replace(/:$/,""))}function Ie(e,r){if(r){if(r=Number(r),isNaN(r)||r<0)throw Error("Bad port number "+r);e.u=r}else e.u=null}function Bn(e,r,o){r instanceof Ee?(e.i=r,ia(e.i,e.l)):(o||(r=ve(r,ea)),e.i=new Ee(r,e.l))}function D(e,r,o){e.i.set(r,o)}function Je(e){return D(e,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),e}function Te(e,r){return e?r?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function ve(e,r,o){return typeof e=="string"?(e=encodeURI(e).replace(r,Qo),o&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function Qo(e){return e=e.charCodeAt(0),"%"+(e>>4&15).toString(16)+(e&15).toString(16)}var rs=/[#\/\?@]/g,Zo=/[#\?:]/g,ta=/[#\?]/g,ea=/[#\?@]/g,na=/#/g;function Ee(e,r){this.h=this.g=null,this.i=e||null,this.j=!!r}function Lt(e){e.g||(e.g=new Map,e.h=0,e.i&&Yo(e.i,function(r,o){e.add(decodeURIComponent(r.replace(/\+/g," ")),o)}))}i=Ee.prototype,i.add=function(e,r){Lt(this),this.i=null,e=Zt(this,e);let o=this.g.get(e);return o||this.g.set(e,o=[]),o.push(r),this.h+=1,this};function os(e,r){Lt(e),r=Zt(e,r),e.g.has(r)&&(e.i=null,e.h-=e.g.get(r).length,e.g.delete(r))}function as(e,r){return Lt(e),r=Zt(e,r),e.g.has(r)}i.forEach=function(e,r){Lt(this),this.g.forEach(function(o,h){o.forEach(function(y){e.call(r,y,h,this)},this)},this)};function cs(e,r){Lt(e);let o=[];if(typeof r=="string")as(e,r)&&(o=o.concat(e.g.get(Zt(e,r))));else for(e=Array.from(e.g.values()),r=0;r<e.length;r++)o=o.concat(e[r]);return o}i.set=function(e,r){return Lt(this),this.i=null,e=Zt(this,e),as(this,e)&&(this.h-=this.g.get(e).length),this.g.set(e,[r]),this.h+=1,this},i.get=function(e,r){return e?(e=cs(this,e),e.length>0?String(e[0]):r):r};function hs(e,r,o){os(e,r),o.length>0&&(e.i=null,e.g.set(Zt(e,r),Y(o)),e.h+=o.length)}i.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],r=Array.from(this.g.keys());for(let h=0;h<r.length;h++){var o=r[h];const y=ye(o);o=cs(this,o);for(let I=0;I<o.length;I++){let E=y;o[I]!==""&&(E+="="+ye(o[I])),e.push(E)}}return this.i=e.join("&")};function ls(e){const r=new Ee;return r.i=e.i,e.g&&(r.g=new Map(e.g),r.h=e.h),r}function Zt(e,r){return r=String(r),e.j&&(r=r.toLowerCase()),r}function ia(e,r){r&&!e.j&&(Lt(e),e.i=null,e.g.forEach(function(o,h){const y=h.toLowerCase();h!=y&&(os(this,h),hs(this,y,o))},e)),e.j=r}function sa(e,r){const o=new me;if(l.Image){const h=new Image;h.onload=S(vt,o,"TestLoadImage: loaded",!0,r,h),h.onerror=S(vt,o,"TestLoadImage: error",!1,r,h),h.onabort=S(vt,o,"TestLoadImage: abort",!1,r,h),h.ontimeout=S(vt,o,"TestLoadImage: timeout",!1,r,h),l.setTimeout(function(){h.ontimeout&&h.ontimeout()},1e4),h.src=e}else r(!1)}function ra(e,r){const o=new me,h=new AbortController,y=setTimeout(()=>{h.abort(),vt(o,"TestPingServer: timeout",!1,r)},1e4);fetch(e,{signal:h.signal}).then(I=>{clearTimeout(y),I.ok?vt(o,"TestPingServer: ok",!0,r):vt(o,"TestPingServer: server error",!1,r)}).catch(()=>{clearTimeout(y),vt(o,"TestPingServer: error",!1,r)})}function vt(e,r,o,h,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),h(o)}catch{}}function oa(){this.g=new jo}function Gn(e){this.i=e.Sb||null,this.h=e.ab||!1}A(Gn,qi),Gn.prototype.g=function(){return new Xe(this.i,this.h)};function Xe(e,r){H.call(this),this.H=e,this.o=r,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}A(Xe,H),i=Xe.prototype,i.open=function(e,r){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=e,this.D=r,this.readyState=1,Se(this)},i.send=function(e){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const r={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};e&&(r.body=e),(this.H||l).fetch(new Request(this.D,r)).then(this.Pa.bind(this),this.ga.bind(this))},i.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Ae(this)),this.readyState=0},i.Pa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,Se(this)),this.g&&(this.readyState=3,Se(this),this.g)))if(this.responseType==="arraybuffer")e.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;us(this)}else e.text().then(this.Oa.bind(this),this.ga.bind(this))};function us(e){e.j.read().then(e.Ma.bind(e)).catch(e.ga.bind(e))}i.Ma=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var r=e.value?e.value:new Uint8Array(0);(r=this.B.decode(r,{stream:!e.done}))&&(this.response=this.responseText+=r)}e.done?Ae(this):Se(this),this.readyState==3&&us(this)}},i.Oa=function(e){this.g&&(this.response=this.responseText=e,Ae(this))},i.Na=function(e){this.g&&(this.response=e,Ae(this))},i.ga=function(){this.g&&Ae(this)};function Ae(e){e.readyState=4,e.l=null,e.j=null,e.B=null,Se(e)}i.setRequestHeader=function(e,r){this.A.append(e,r)},i.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},i.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],r=this.h.entries();for(var o=r.next();!o.done;)o=o.value,e.push(o[0]+": "+o[1]),o=r.next();return e.join(`\r
`)};function Se(e){e.onreadystatechange&&e.onreadystatechange.call(e)}Object.defineProperty(Xe.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(e){this.m=e?"include":"same-origin"}});function ds(e){let r="";return Ge(e,function(o,h){r+=h,r+=":",r+=o,r+=`\r
`}),r}function Wn(e,r,o){t:{for(h in o){var h=!1;break t}h=!0}h||(o=ds(o),typeof e=="string"?o!=null&&ye(o):D(e,r,o))}function M(e){H.call(this),this.headers=new Map,this.L=e||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}A(M,H);var aa=/^https?$/i,ca=["POST","PUT"];i=M.prototype,i.Fa=function(e){this.H=e},i.ea=function(e,r,o,h){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);r=r?r.toUpperCase():"GET",this.D=e,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():zi.g(),this.g.onreadystatechange=N(v(this.Ca,this));try{this.B=!0,this.g.open(r,String(e),!0),this.B=!1}catch(I){fs(this,I);return}if(e=o||"",o=new Map(this.headers),h)if(Object.getPrototypeOf(h)===Object.prototype)for(var y in h)o.set(y,h[y]);else if(typeof h.keys=="function"&&typeof h.get=="function")for(const I of h.keys())o.set(I,h.get(I));else throw Error("Unknown input type for opt_headers: "+String(h));h=Array.from(o.keys()).find(I=>I.toLowerCase()=="content-type"),y=l.FormData&&e instanceof l.FormData,!(Array.prototype.indexOf.call(ca,r,void 0)>=0)||h||y||o.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[I,E]of o)this.g.setRequestHeader(I,E);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(e),this.v=!1}catch(I){fs(this,I)}};function fs(e,r){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=r,e.o=5,ps(e),Ye(e)}function ps(e){e.A||(e.A=!0,q(e,"complete"),q(e,"error"))}i.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=e||7,q(this,"complete"),q(this,"abort"),Ye(this))},i.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ye(this,!0)),M.Z.N.call(this)},i.Ca=function(){this.u||(this.B||this.v||this.j?gs(this):this.Xa())},i.Xa=function(){gs(this)};function gs(e){if(e.h&&typeof c<"u"){if(e.v&&Et(e)==4)setTimeout(e.Ca.bind(e),0);else if(q(e,"readystatechange"),Et(e)==4){e.h=!1;try{const I=e.ca();t:switch(I){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var r=!0;break t;default:r=!1}var o;if(!(o=r)){var h;if(h=I===0){let E=String(e.D).match(ss)[1]||null;!E&&l.self&&l.self.location&&(E=l.self.location.protocol.slice(0,-1)),h=!aa.test(E?E.toLowerCase():"")}o=h}if(o)q(e,"complete"),q(e,"success");else{e.o=6;try{var y=Et(e)>2?e.g.statusText:""}catch{y=""}e.l=y+" ["+e.ca()+"]",ps(e)}}finally{Ye(e)}}}}function Ye(e,r){if(e.g){e.m&&(clearTimeout(e.m),e.m=null);const o=e.g;e.g=null,r||q(e,"ready");try{o.onreadystatechange=null}catch{}}}i.isActive=function(){return!!this.g};function Et(e){return e.g?e.g.readyState:0}i.ca=function(){try{return Et(this)>2?this.g.status:-1}catch{return-1}},i.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},i.La=function(e){if(this.g){var r=this.g.responseText;return e&&r.indexOf(e)==0&&(r=r.substring(e.length)),Vo(r)}};function ms(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.F){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch{return null}}function ha(e){const r={};e=(e.g&&Et(e)>=2&&e.g.getAllResponseHeaders()||"").split(`\r
`);for(let h=0;h<e.length;h++){if(d(e[h]))continue;var o=zo(e[h]);const y=o[0];if(o=o[1],typeof o!="string")continue;o=o.trim();const I=r[y]||[];r[y]=I,I.push(o)}Do(r,function(h){return h.join(", ")})}i.ya=function(){return this.o},i.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function ke(e,r,o){return o&&o.internalChannelParams&&o.internalChannelParams[e]||r}function ys(e){this.za=0,this.i=[],this.j=new me,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=ke("failFast",!1,e),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=ke("baseRetryDelayMs",5e3,e),this.Za=ke("retryDelaySeedMs",1e4,e),this.Ta=ke("forwardChannelMaxRetries",2,e),this.va=ke("forwardChannelRequestTimeoutMs",2e4,e),this.ma=e&&e.xmlHttpFactory||void 0,this.Ua=e&&e.Rb||void 0,this.Aa=e&&e.useFetchStreams||!1,this.O=void 0,this.L=e&&e.supportsCrossDomainXhr||!1,this.M="",this.h=new Zi(e&&e.concurrentRequestLimit),this.Ba=new oa,this.S=e&&e.fastHandshake||!1,this.R=e&&e.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=e&&e.Pb||!1,e&&e.ua&&this.j.ua(),e&&e.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&e&&e.detectBufferingProxy||!1,this.ia=void 0,e&&e.longPollingTimeout&&e.longPollingTimeout>0&&(this.ia=e.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}i=ys.prototype,i.ka=8,i.I=1,i.connect=function(e,r,o,h){$(0),this.W=e,this.H=r||{},o&&h!==void 0&&(this.H.OSID=o,this.H.OAID=h),this.F=this.X,this.J=ks(this,null,this.W),Ze(this)};function zn(e){if(_s(e),e.I==3){var r=e.V++,o=nt(e.J);if(D(o,"SID",e.M),D(o,"RID",r),D(o,"TYPE","terminate"),Pe(e,o),r=new It(e,e.j,r),r.M=2,r.A=Je(nt(o)),o=!1,l.navigator&&l.navigator.sendBeacon)try{o=l.navigator.sendBeacon(r.A.toString(),"")}catch{}!o&&l.Image&&(new Image().src=r.A,o=!0),o||(r.g=Ps(r.j,null),r.g.ea(r.A)),r.F=Date.now(),Ke(r)}Ss(e)}function Qe(e){e.g&&(Jn(e),e.g.cancel(),e.g=null)}function _s(e){Qe(e),e.v&&(l.clearTimeout(e.v),e.v=null),tn(e),e.h.cancel(),e.m&&(typeof e.m=="number"&&l.clearTimeout(e.m),e.m=null)}function Ze(e){if(!ts(e.h)&&!e.m){e.m=!0;var r=e.Ea;wt||u(),J||(wt(),J=!0),g.add(r,e),e.D=0}}function la(e,r){return es(e.h)>=e.h.j-(e.m?1:0)?!1:e.m?(e.i=r.G.concat(e.i),!0):e.I==1||e.I==2||e.D>=(e.Sa?0:e.Ta)?!1:(e.m=ge(v(e.Ea,e,r),As(e,e.D)),e.D++,!0)}i.Ea=function(e){if(this.m)if(this.m=null,this.I==1){if(!e){this.V=Math.floor(Math.random()*1e5),e=this.V++;const y=new It(this,this.j,e);let I=this.o;if(this.U&&(I?(I=Oi(I),Li(I,this.U)):I=this.U),this.u!==null||this.R||(y.J=I,I=null),this.S)t:{for(var r=0,o=0;o<this.i.length;o++){e:{var h=this.i[o];if("__data__"in h.map&&(h=h.map.__data__,typeof h=="string")){h=h.length;break e}h=void 0}if(h===void 0)break;if(r+=h,r>4096){r=o;break t}if(r===4096||o===this.i.length-1){r=o+1;break t}}r=1e3}else r=1e3;r=Is(this,y,r),o=nt(this.J),D(o,"RID",e),D(o,"CVER",22),this.G&&D(o,"X-HTTP-Session-Id",this.G),Pe(this,o),I&&(this.R?r="headers="+ye(ds(I))+"&"+r:this.u&&Wn(o,this.u,I)),$n(this.h,y),this.Ra&&D(o,"TYPE","init"),this.S?(D(o,"$req",r),D(o,"SID","null"),y.U=!0,Vn(y,o,null)):Vn(y,o,r),this.I=2}}else this.I==3&&(e?ws(this,e):this.i.length==0||ts(this.h)||ws(this))};function ws(e,r){var o;r?o=r.l:o=e.V++;const h=nt(e.J);D(h,"SID",e.M),D(h,"RID",o),D(h,"AID",e.K),Pe(e,h),e.u&&e.o&&Wn(h,e.u,e.o),o=new It(e,e.j,o,e.D+1),e.u===null&&(o.J=e.o),r&&(e.i=r.G.concat(e.i)),r=Is(e,o,1e3),o.H=Math.round(e.va*.5)+Math.round(e.va*.5*Math.random()),$n(e.h,o),Vn(o,h,r)}function Pe(e,r){e.H&&Ge(e.H,function(o,h){D(r,h,o)}),e.l&&Ge({},function(o,h){D(r,h,o)})}function Is(e,r,o){o=Math.min(e.i.length,o);const h=e.l?v(e.l.Ka,e.l,e):null;t:{var y=e.i;let P=-1;for(;;){const x=["count="+o];P==-1?o>0?(P=y[0].g,x.push("ofs="+P)):P=0:x.push("ofs="+P);let O=!0;for(let V=0;V<o;V++){var I=y[V].g;const it=y[V].map;if(I-=P,I<0)P=Math.max(0,y[V].g-100),O=!1;else try{I="req"+I+"_"||"";try{var E=it instanceof Map?it:Object.entries(it);for(const[Ut,At]of E){let St=At;w(At)&&(St=On(At)),x.push(I+Ut+"="+encodeURIComponent(St))}}catch(Ut){throw x.push(I+"type="+encodeURIComponent("_badmap")),Ut}}catch{h&&h(it)}}if(O){E=x.join("&");break t}}E=void 0}return e=e.i.splice(0,o),r.G=e,E}function Ts(e){if(!e.g&&!e.v){e.Y=1;var r=e.Da;wt||u(),J||(wt(),J=!0),g.add(r,e),e.A=0}}function Kn(e){return e.g||e.v||e.A>=3?!1:(e.Y++,e.v=ge(v(e.Da,e),As(e,e.A)),e.A++,!0)}i.Da=function(){if(this.v=null,vs(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var e=4*this.T;this.j.info("BP detection timer enabled: "+e),this.B=ge(v(this.Wa,this),e)}},i.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,$(10),Qe(this),vs(this))};function Jn(e){e.B!=null&&(l.clearTimeout(e.B),e.B=null)}function vs(e){e.g=new It(e,e.j,"rpc",e.Y),e.u===null&&(e.g.J=e.o),e.g.P=0;var r=nt(e.na);D(r,"RID","rpc"),D(r,"SID",e.M),D(r,"AID",e.K),D(r,"CI",e.F?"0":"1"),!e.F&&e.ia&&D(r,"TO",e.ia),D(r,"TYPE","xmlhttp"),Pe(e,r),e.u&&e.o&&Wn(r,e.u,e.o),e.O&&(e.g.H=e.O);var o=e.g;e=e.ba,o.M=1,o.A=Je(nt(r)),o.u=null,o.R=!0,Xi(o,e)}i.Va=function(){this.C!=null&&(this.C=null,Qe(this),Kn(this),$(19))};function tn(e){e.C!=null&&(l.clearTimeout(e.C),e.C=null)}function Es(e,r){var o=null;if(e.g==r){tn(e),Jn(e),e.g=null;var h=2}else if(qn(e.h,r))o=r.G,ns(e.h,r),h=1;else return;if(e.I!=0){if(r.o)if(h==1){o=r.u?r.u.length:0,r=Date.now()-r.F;var y=e.D;h=Mn(),q(h,new Wi(h,o)),Ze(e)}else Ts(e);else if(y=r.m,y==3||y==0&&r.X>0||!(h==1&&la(e,r)||h==2&&Kn(e)))switch(o&&o.length>0&&(r=e.h,r.i=r.i.concat(o)),y){case 1:Mt(e,5);break;case 4:Mt(e,10);break;case 3:Mt(e,6);break;default:Mt(e,2)}}}function As(e,r){let o=e.Qa+Math.floor(Math.random()*e.Za);return e.isActive()||(o*=2),o*r}function Mt(e,r){if(e.j.info("Error code "+r),r==2){var o=v(e.bb,e),h=e.Ua;const y=!h;h=new Tt(h||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||we(h,"https"),Je(h),y?sa(h.toString(),o):ra(h.toString(),o)}else $(2);e.I=0,e.l&&e.l.pa(r),Ss(e),_s(e)}i.bb=function(e){e?(this.j.info("Successfully pinged google.com"),$(2)):(this.j.info("Failed to ping google.com"),$(1))};function Ss(e){if(e.I=0,e.ja=[],e.l){const r=is(e.h);(r.length!=0||e.i.length!=0)&&(F(e.ja,r),F(e.ja,e.i),e.h.i.length=0,Y(e.i),e.i.length=0),e.l.oa()}}function ks(e,r,o){var h=o instanceof Tt?nt(o):new Tt(o);if(h.g!="")r&&(h.g=r+"."+h.g),Ie(h,h.u);else{var y=l.location;h=y.protocol,r=r?r+"."+y.hostname:y.hostname,y=+y.port;const I=new Tt(null);h&&we(I,h),r&&(I.g=r),y&&Ie(I,y),o&&(I.h=o),h=I}return o=e.G,r=e.wa,o&&r&&D(h,o,r),D(h,"VER",e.ka),Pe(e,h),h}function Ps(e,r,o){if(r&&!e.L)throw Error("Can't create secondary domain capable XhrIo object.");return r=e.Aa&&!e.ma?new M(new Gn({ab:o})):new M(e.ma),r.Fa(e.L),r}i.isActive=function(){return!!this.l&&this.l.isActive(this)};function Rs(){}i=Rs.prototype,i.ra=function(){},i.qa=function(){},i.pa=function(){},i.oa=function(){},i.isActive=function(){return!0},i.Ka=function(){};function X(e,r){H.call(this),this.g=new ys(r),this.l=e,this.h=r&&r.messageUrlParams||null,e=r&&r.messageHeaders||null,r&&r.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=r&&r.initMessageHeaders||null,r&&r.messageContentType&&(e?e["X-WebChannel-Content-Type"]=r.messageContentType:e={"X-WebChannel-Content-Type":r.messageContentType}),r&&r.sa&&(e?e["X-WebChannel-Client-Profile"]=r.sa:e={"X-WebChannel-Client-Profile":r.sa}),this.g.U=e,(e=r&&r.Qb)&&!d(e)&&(this.g.u=e),this.A=r&&r.supportsCrossDomainXhr||!1,this.v=r&&r.sendRawJson||!1,(r=r&&r.httpSessionIdParam)&&!d(r)&&(this.g.G=r,e=this.h,e!==null&&r in e&&(e=this.h,r in e&&delete e[r])),this.j=new te(this)}A(X,H),X.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},X.prototype.close=function(){zn(this.g)},X.prototype.o=function(e){var r=this.g;if(typeof e=="string"){var o={};o.__data__=e,e=o}else this.v&&(o={},o.__data__=On(e),e=o);r.i.push(new Xo(r.Ya++,e)),r.I==3&&Ze(r)},X.prototype.N=function(){this.g.l=null,delete this.j,zn(this.g),delete this.g,X.Z.N.call(this)};function Cs(e){Dn.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var r=e.__sm__;if(r){t:{for(const o in r){e=o;break t}e=void 0}(this.i=e)&&(e=this.i,r=r!==null&&e in r?r[e]:void 0),this.data=r}else this.data=e}A(Cs,Dn);function bs(){Ln.call(this),this.status=1}A(bs,Ln);function te(e){this.g=e}A(te,Rs),te.prototype.ra=function(){q(this.g,"a")},te.prototype.qa=function(e){q(this.g,new Cs(e))},te.prototype.pa=function(e){q(this.g,new bs)},te.prototype.oa=function(){q(this.g,"b")},X.prototype.send=X.prototype.o,X.prototype.open=X.prototype.m,X.prototype.close=X.prototype.close,Un.NO_ERROR=0,Un.TIMEOUT=8,Un.HTTP_ERROR=6,Wo.COMPLETE="complete",Ho.EventType=fe,fe.OPEN="a",fe.CLOSE="b",fe.ERROR="c",fe.MESSAGE="d",H.prototype.listen=H.prototype.J,M.prototype.listenOnce=M.prototype.K,M.prototype.getLastError=M.prototype.Ha,M.prototype.getLastErrorCode=M.prototype.ya,M.prototype.getStatus=M.prototype.ca,M.prototype.getResponseJson=M.prototype.La,M.prototype.getResponseText=M.prototype.la,M.prototype.send=M.prototype.ea,M.prototype.setWithCredentials=M.prototype.Fa}).apply(typeof sn<"u"?sn:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
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
 */class B{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}B.UNAUTHENTICATED=new B(null),B.GOOGLE_CREDENTIALS=new B("google-credentials-uid"),B.FIRST_PARTY=new B("first-party-uid"),B.MOCK_USER=new B("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
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
 */let qe="12.8.0";function Ph(i){qe=i}/**
 * @license
 * Copyright 2020 Google LLC
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
 *//**
 * @license
 * Copyright 2017 Google LLC
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
 */const ce=new li("@firebase/firestore");function tt(i,...t){if(ce.logLevel<=xe.DEBUG){const n=t.map(vi);ce.debug(`Firestore (${qe}): ${i}`,...n)}}function to(i,...t){if(ce.logLevel<=xe.ERROR){const n=t.map(vi);ce.error(`Firestore (${qe}): ${i}`,...n)}}function Rh(i,...t){if(ce.logLevel<=xe.WARN){const n=t.map(vi);ce.warn(`Firestore (${qe}): ${i}`,...n)}}function vi(i){if(typeof i=="string")return i;try{return(function(n){return JSON.stringify(n)})(i)}catch{return i}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */function Me(i,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,eo(i,s,n)}function eo(i,t,n){let s=`FIRESTORE (${qe}) INTERNAL ASSERTION FAILED: ${t} (ID: ${i.toString(16)})`;if(n!==void 0)try{s+=" CONTEXT: "+JSON.stringify(n)}catch{s+=" CONTEXT: "+n}throw to(s),new Error(s)}function be(i,t,n,s){let a="Unexpected state";typeof n=="string"?a=n:s=n,i||eo(t,a,s)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const C={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class b extends le{constructor(t,n){super(t,n),this.code=t,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Ne{constructor(){this.promise=new Promise(((t,n)=>{this.resolve=t,this.reject=n}))}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class no{constructor(t,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Ch{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,n){t.enqueueRetryable((()=>n(B.UNAUTHENTICATED)))}shutdown(){}}class bh{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,n){this.changeListener=n,t.enqueueRetryable((()=>n(this.token.user)))}shutdown(){this.changeListener=null}}class Nh{constructor(t){this.t=t,this.currentUser=B.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,n){be(this.o===void 0,42304);let s=this.i;const a=T=>this.i!==s?(s=this.i,n(T)):Promise.resolve();let c=new Ne;this.o=()=>{this.i++,this.currentUser=this.u(),c.resolve(),c=new Ne,t.enqueueRetryable((()=>a(this.currentUser)))};const l=()=>{const T=c;t.enqueueRetryable((async()=>{await T.promise,await a(this.currentUser)}))},w=T=>{tt("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=T,this.o&&(this.auth.addAuthTokenListener(this.o),l())};this.t.onInit((T=>w(T))),setTimeout((()=>{if(!this.auth){const T=this.t.getImmediate({optional:!0});T?w(T):(tt("FirebaseAuthCredentialsProvider","Auth not yet detected"),c.resolve(),c=new Ne)}}),0),l()}getToken(){const t=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then((s=>this.i!==t?(tt("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(be(typeof s.accessToken=="string",31837,{l:s}),new no(s.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return be(t===null||typeof t=="string",2055,{h:t}),new B(t)}}class Oh{constructor(t,n,s){this.P=t,this.T=n,this.I=s,this.type="FirstParty",this.user=B.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const t=this.A();return t&&this.R.set("Authorization",t),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class Dh{constructor(t,n,s){this.P=t,this.T=n,this.I=s}getToken(){return Promise.resolve(new Oh(this.P,this.T,this.I))}start(t,n){t.enqueueRetryable((()=>n(B.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Xs{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Lh{constructor(t,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,ot(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,n){be(this.o===void 0,3512);const s=c=>{c.error!=null&&tt("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${c.error.message}`);const l=c.token!==this.m;return this.m=c.token,tt("FirebaseAppCheckTokenProvider",`Received ${l?"new":"existing"} token.`),l?n(c.token):Promise.resolve()};this.o=c=>{t.enqueueRetryable((()=>s(c)))};const a=c=>{tt("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=c,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((c=>a(c))),setTimeout((()=>{if(!this.appCheck){const c=this.V.getImmediate({optional:!0});c?a(c):tt("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Xs(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then((n=>n?(be(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Xs(n.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */function Mh(i){const t=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(i);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(n);else for(let s=0;s<i;s++)n[s]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Uh{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let s="";for(;s.length<20;){const a=Mh(40);for(let c=0;c<a.length;++c)s.length<20&&a[c]<n&&(s+=t.charAt(a[c]%62))}return s}}function Nt(i,t){return i<t?-1:i>t?1:0}function xh(i,t){const n=Math.min(i.length,t.length);for(let s=0;s<n;s++){const a=i.charAt(s),c=t.charAt(s);if(a!==c)return Zn(a)===Zn(c)?Nt(a,c):Zn(a)?1:-1}return Nt(i.length,t.length)}const Fh=55296,Vh=57343;function Zn(i){const t=i.charCodeAt(0);return t>=Fh&&t<=Vh}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Ys="__name__";class st{constructor(t,n,s){n===void 0?n=0:n>t.length&&Me(637,{offset:n,range:t.length}),s===void 0?s=t.length-n:s>t.length-n&&Me(1746,{length:s,range:t.length-n}),this.segments=t,this.offset=n,this.len=s}get length(){return this.len}isEqual(t){return st.comparator(this,t)===0}child(t){const n=this.segments.slice(this.offset,this.limit());return t instanceof st?t.forEach((s=>{n.push(s)})):n.push(t),this.construct(n)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==t.get(n))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==t.get(n))return!1;return!0}forEach(t){for(let n=this.offset,s=this.limit();n<s;n++)t(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,n){const s=Math.min(t.length,n.length);for(let a=0;a<s;a++){const c=st.compareSegments(t.get(a),n.get(a));if(c!==0)return c}return Nt(t.length,n.length)}static compareSegments(t,n){const s=st.isNumericId(t),a=st.isNumericId(n);return s&&!a?-1:!s&&a?1:s&&a?st.extractNumericId(t).compare(st.extractNumericId(n)):xh(t,n)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Ti.fromString(t.substring(4,t.length-2))}}class Q extends st{construct(t,n,s){return new Q(t,n,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const n=[];for(const s of t){if(s.indexOf("//")>=0)throw new b(C.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);n.push(...s.split("/").filter((a=>a.length>0)))}return new Q(n)}static emptyPath(){return new Q([])}}const jh=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class xt extends st{construct(t,n,s){return new xt(t,n,s)}static isValidIdentifier(t){return jh.test(t)}canonicalString(){return this.toArray().map((t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),xt.isValidIdentifier(t)||(t="`"+t+"`"),t))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Ys}static keyField(){return new xt([Ys])}static fromServerFormat(t){const n=[];let s="",a=0;const c=()=>{if(s.length===0)throw new b(C.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(s),s=""};let l=!1;for(;a<t.length;){const w=t[a];if(w==="\\"){if(a+1===t.length)throw new b(C.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const T=t[a+1];if(T!=="\\"&&T!=="."&&T!=="`")throw new b(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);s+=T,a+=2}else w==="`"?(l=!l,a++):w!=="."||l?(s+=w,a++):(c(),a++)}if(c(),l)throw new b(C.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new xt(n)}static emptyPath(){return new xt([])}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Ft{constructor(t){this.path=t}static fromPath(t){return new Ft(Q.fromString(t))}static fromName(t){return new Ft(Q.fromString(t).popFirst(5))}static empty(){return new Ft(Q.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&Q.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,n){return Q.comparator(t.path,n.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new Ft(new Q(t.slice()))}}function Hh(i,t,n,s){if(t===!0&&s===!0)throw new b(C.INVALID_ARGUMENT,`${i} and ${n} cannot be used together.`)}function qh(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}function $h(i){if(i===void 0)return"undefined";if(i===null)return"null";if(typeof i=="string")return i.length>20&&(i=`${i.substring(0,20)}...`),JSON.stringify(i);if(typeof i=="number"||typeof i=="boolean")return""+i;if(typeof i=="object"){if(i instanceof Array)return"an array";{const t=(function(s){return s.constructor?s.constructor.name:null})(i);return t?`a custom ${t} object`:"an object"}}return typeof i=="function"?"a function":Me(12329,{type:typeof i})}function Bh(i,t){if("_delegate"in i&&(i=i._delegate),!(i instanceof t)){if(t.name===i.constructor.name)throw new b(C.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=$h(i);throw new b(C.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${n}`)}}return i}/**
 * @license
 * Copyright 2025 Google LLC
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
 */function U(i,t){const n={typeString:i};return t&&(n.value=t),n}function $e(i,t){if(!qh(i))throw new b(C.INVALID_ARGUMENT,"JSON must be an object");let n;for(const s in t)if(t[s]){const a=t[s].typeString,c="value"in t[s]?{value:t[s].value}:void 0;if(!(s in i)){n=`JSON missing required field: '${s}'`;break}const l=i[s];if(a&&typeof l!==a){n=`JSON field '${s}' must be a ${a}.`;break}if(c!==void 0&&l!==c.value){n=`Expected '${s}' field to equal '${c.value}'`;break}}if(n)throw new b(C.INVALID_ARGUMENT,n);return!0}/**
 * @license
 * Copyright 2017 Google LLC
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
 */const Qs=-62135596800,Zs=1e6;class rt{static now(){return rt.fromMillis(Date.now())}static fromDate(t){return rt.fromMillis(t.getTime())}static fromMillis(t){const n=Math.floor(t/1e3),s=Math.floor((t-1e3*n)*Zs);return new rt(n,s)}constructor(t,n){if(this.seconds=t,this.nanoseconds=n,n<0)throw new b(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new b(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(t<Qs)throw new b(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new b(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Zs}_compareTo(t){return this.seconds===t.seconds?Nt(this.nanoseconds,t.nanoseconds):Nt(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:rt._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if($e(t,rt._jsonSchema))return new rt(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-Qs;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}rt._jsonSchemaVersion="firestore/timestamp/1.0",rt._jsonSchema={type:U("string",rt._jsonSchemaVersion),seconds:U("number"),nanoseconds:U("number")};function Gh(i){return i.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2023 Google LLC
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
 */class Wh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Wt{constructor(t){this.binaryString=t}static fromBase64String(t){const n=(function(a){try{return atob(a)}catch(c){throw typeof DOMException<"u"&&c instanceof DOMException?new Wh("Invalid base64 string: "+c):c}})(t);return new Wt(n)}static fromUint8Array(t){const n=(function(a){let c="";for(let l=0;l<a.length;++l)c+=String.fromCharCode(a[l]);return c})(t);return new Wt(n)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(n){return btoa(n)})(this.binaryString)}toUint8Array(){return(function(n){const s=new Uint8Array(n.length);for(let a=0;a<n.length;a++)s[a]=n.charCodeAt(a);return s})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return Nt(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}Wt.EMPTY_BYTE_STRING=new Wt("");const ai="(default)";class yn{constructor(t,n){this.projectId=t,this.database=n||ai}static empty(){return new yn("","")}get isDefaultDatabase(){return this.database===ai}isEqual(t){return t instanceof yn&&t.projectId===this.projectId&&t.database===this.database}}function zh(i,t){if(!Object.prototype.hasOwnProperty.apply(i.options,["projectId"]))throw new b(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new yn(i.options.projectId,t)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Kh{constructor(t,n=null,s=[],a=[],c=null,l="F",w=null,T=null){this.path=t,this.collectionGroup=n,this.explicitOrderBy=s,this.filters=a,this.limit=c,this.limitType=l,this.startAt=w,this.endAt=T,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}}function Jh(i){return new Kh(i)}/**
 * @license
 * Copyright 2017 Google LLC
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
 */var tr,R;(R=tr||(tr={}))[R.OK=0]="OK",R[R.CANCELLED=1]="CANCELLED",R[R.UNKNOWN=2]="UNKNOWN",R[R.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",R[R.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",R[R.NOT_FOUND=5]="NOT_FOUND",R[R.ALREADY_EXISTS=6]="ALREADY_EXISTS",R[R.PERMISSION_DENIED=7]="PERMISSION_DENIED",R[R.UNAUTHENTICATED=16]="UNAUTHENTICATED",R[R.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",R[R.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",R[R.ABORTED=10]="ABORTED",R[R.OUT_OF_RANGE=11]="OUT_OF_RANGE",R[R.UNIMPLEMENTED=12]="UNIMPLEMENTED",R[R.INTERNAL=13]="INTERNAL",R[R.UNAVAILABLE=14]="UNAVAILABLE",R[R.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
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
 */new Ti([4294967295,4294967295],0);/**
 * @license
 * Copyright 2018 Google LLC
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
 */const Xh=41943040;/**
 * @license
 * Copyright 2020 Google LLC
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
 */const Yh=1048576;function ti(){return typeof document<"u"?document:null}class Qh{constructor(t,n,s=1e3,a=1.5,c=6e4){this.Ci=t,this.timerId=n,this.R_=s,this.A_=a,this.V_=c,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(t){this.cancel();const n=Math.floor(this.d_+this.y_()),s=Math.max(0,Date.now()-this.f_),a=Math.max(0,n-s);a>0&&tt("ExponentialBackoff",`Backing off for ${a} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${s} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,a,(()=>(this.f_=Date.now(),t()))),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Ei{constructor(t,n,s,a,c){this.asyncQueue=t,this.timerId=n,this.targetTimeMs=s,this.op=a,this.removalCallback=c,this.deferred=new Ne,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((l=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(t,n,s,a,c){const l=Date.now()+s,w=new Ei(t,n,l,a,c);return w.start(s),w}start(t){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new b(C.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((t=>this.deferred.resolve(t)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var er,nr;(nr=er||(er={})).Ma="default",nr.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
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
 */function Zh(i){const t={};return i.timeoutSeconds!==void 0&&(t.timeoutSeconds=i.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const tl="ComponentProvider",ir=new Map;/**
 * @license
 * Copyright 2020 Google LLC
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
 */const io="firestore.googleapis.com",sr=!0;class rr{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new b(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=io,this.ssl=sr}else this.host=t.host,this.ssl=t.ssl??sr;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=Xh;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<Yh)throw new b(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}Hh("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Zh(t.experimentalLongPollingOptions??{}),(function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new b(C.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new b(C.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new b(C.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&(function(s,a){return s.timeoutSeconds===a.timeoutSeconds})(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class so{constructor(t,n,s,a){this._authCredentials=t,this._appCheckCredentials=n,this._databaseId=s,this._app=a,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new rr({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new b(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new b(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new rr(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=(function(s){if(!s)return new Ch;switch(s.type){case"firstParty":return new Dh(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new b(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(n){const s=ir.get(n);s&&(tt(tl,"Removing Datastore"),ir.delete(n),s.terminate())})(this),Promise.resolve()}}function el(i,t,n,s={}){var v;i=Bh(i,so);const a=In(t),c=i._getSettings(),l={...c,emulatorOptions:i._getEmulatorOptions()},w=`${t}:${n}`;a&&(Tr(`https://${w}`),vr("Firestore",!0)),c.host!==io&&c.host!==w&&Rh("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const T={...c,host:w,ssl:a,emulatorOptions:s};if(!De(T,l)&&(i._setSettings(T),s.mockUserToken)){let S,A;if(typeof s.mockUserToken=="string")S=s.mockUserToken,A=B.MOCK_USER;else{S=Ia(s.mockUserToken,(v=i._app)==null?void 0:v.options.projectId);const N=s.mockUserToken.sub||s.mockUserToken.user_id;if(!N)throw new b(C.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");A=new B(N)}i._authCredentials=new bh(new no(S,A))}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class Ai{constructor(t,n,s){this.converter=n,this._query=s,this.type="query",this.firestore=t}withConverter(t){return new Ai(this.firestore,t,this._query)}}class at{constructor(t,n,s){this.converter=n,this._key=s,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Si(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new at(this.firestore,t,this._key)}toJSON(){return{type:at._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,n,s){if($e(n,at._jsonSchema))return new at(t,s||null,new Ft(Q.fromString(n.referencePath)))}}at._jsonSchemaVersion="firestore/documentReference/1.0",at._jsonSchema={type:U("string",at._jsonSchemaVersion),referencePath:U("string")};class Si extends Ai{constructor(t,n,s){super(t,n,Jh(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new at(this.firestore,null,new Ft(t))}withConverter(t){return new Si(this.firestore,t,this._path)}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const or="AsyncQueue";class ar{constructor(t=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Qh(this,"async_queue_retry"),this._c=()=>{const s=ti();s&&tt(or,"Visibility state changed to "+s.visibilityState),this.M_.w_()},this.ac=t;const n=ti();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.uc(),this.cc(t)}enterRestrictedMode(t){if(!this.ec){this.ec=!0,this.sc=t||!1;const n=ti();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(t){if(this.uc(),this.ec)return new Promise((()=>{}));const n=new Ne;return this.cc((()=>this.ec&&this.sc?Promise.resolve():(t().then(n.resolve,n.reject),n.promise))).then((()=>n.promise))}enqueueRetryable(t){this.enqueueAndForget((()=>(this.Yu.push(t),this.lc())))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(t){if(!Gh(t))throw t;tt(or,"Operation failed with retryable error: "+t)}this.Yu.length>0&&this.M_.p_((()=>this.lc()))}}cc(t){const n=this.ac.then((()=>(this.rc=!0,t().catch((s=>{throw this.nc=s,this.rc=!1,to("INTERNAL UNHANDLED ERROR: ",cr(s)),s})).then((s=>(this.rc=!1,s))))));return this.ac=n,n}enqueueAfterDelay(t,n,s){this.uc(),this.oc.indexOf(t)>-1&&(n=0);const a=Ei.createAndSchedule(this,t,n,s,(c=>this.hc(c)));return this.tc.push(a),a}uc(){this.nc&&Me(47125,{Pc:cr(this.nc)})}verifyOperationInProgress(){}async Tc(){let t;do t=this.ac,await t;while(t!==this.ac)}Ic(t){for(const n of this.tc)if(n.timerId===t)return!0;return!1}Ec(t){return this.Tc().then((()=>{this.tc.sort(((n,s)=>n.targetTimeMs-s.targetTimeMs));for(const n of this.tc)if(n.skipDelay(),t!=="all"&&n.timerId===t)break;return this.Tc()}))}Rc(t){this.oc.push(t)}hc(t){const n=this.tc.indexOf(t);this.tc.splice(n,1)}}function cr(i){let t=i.message||"";return i.stack&&(t=i.stack.includes(i.message)?i.stack:i.message+`
`+i.stack),t}class nl extends so{constructor(t,n,s,a){super(t,n,s,a),this.type="firestore",this._queue=new ar,this._persistenceKey=(a==null?void 0:a.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new ar(t),this._firestoreClient=void 0,await t}}}function il(i,t){const n=typeof i=="object"?i:ui(),s=typeof i=="string"?i:ai,a=Jt(n,"firestore").getImmediate({identifier:s});if(!a._initialized){const c=wa("firestore");c&&el(a,...c)}return a}/**
 * @license
 * Copyright 2020 Google LLC
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
 */class ut{constructor(t){this._byteString=t}static fromBase64String(t){try{return new ut(Wt.fromBase64String(t))}catch(n){throw new b(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(t){return new ut(Wt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:ut._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if($e(t,ut._jsonSchema))return ut.fromBase64String(t.bytes)}}ut._jsonSchemaVersion="firestore/bytes/1.0",ut._jsonSchema={type:U("string",ut._jsonSchemaVersion),bytes:U("string")};/**
 * @license
 * Copyright 2020 Google LLC
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
 */class ro{constructor(...t){for(let n=0;n<t.length;++n)if(t[n].length===0)throw new b(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new xt(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2017 Google LLC
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
 */class Ht{constructor(t,n){if(!isFinite(t)||t<-90||t>90)throw new b(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(n)||n<-180||n>180)throw new b(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=t,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return Nt(this._lat,t._lat)||Nt(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Ht._jsonSchemaVersion}}static fromJSON(t){if($e(t,Ht._jsonSchema))return new Ht(t.latitude,t.longitude)}}Ht._jsonSchemaVersion="firestore/geoPoint/1.0",Ht._jsonSchema={type:U("string",Ht._jsonSchemaVersion),latitude:U("number"),longitude:U("number")};/**
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
 */class qt{constructor(t){this._values=(t||[]).map((n=>n))}toArray(){return this._values.map((t=>t))}isEqual(t){return(function(s,a){if(s.length!==a.length)return!1;for(let c=0;c<s.length;++c)if(s[c]!==a[c])return!1;return!0})(this._values,t._values)}toJSON(){return{type:qt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if($e(t,qt._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every((n=>typeof n=="number")))return new qt(t.vectorValues);throw new b(C.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}qt._jsonSchemaVersion="firestore/vectorValue/1.0",qt._jsonSchema={type:U("string",qt._jsonSchemaVersion),vectorValues:U("object")};function oo(i,t,n){if((t=lt(t))instanceof ro)return t._internalPath;if(typeof t=="string")return rl(i,t);throw ci("Field path arguments must be of type string or ",i)}const sl=new RegExp("[~\\*/\\[\\]]");function rl(i,t,n){if(t.search(sl)>=0)throw ci(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,i);try{return new ro(...t.split("."))._internalPath}catch{throw ci(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,i)}}function ci(i,t,n,s,a){let c=`Function ${t}() called with invalid data`;c+=". ";let l="";return new b(C.INVALID_ARGUMENT,c+i+l)}const hr="@firebase/firestore",lr="4.10.0";/**
 * @license
 * Copyright 2020 Google LLC
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
 */class ao{constructor(t,n,s,a,c){this._firestore=t,this._userDataWriter=n,this._key=s,this._document=a,this._converter=c}get id(){return this._key.path.lastSegment()}get ref(){return new at(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new ol(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var t;return((t=this._document)==null?void 0:t.data.clone().value.mapValue.fields)??void 0}get(t){if(this._document){const n=this._document.data.field(oo("DocumentSnapshot.get",t));if(n!==null)return this._userDataWriter.convertValue(n)}}}class ol extends ao{data(){return super.data()}}class rn{constructor(t,n){this.hasPendingWrites=t,this.fromCache=n}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class re extends ao{constructor(t,n,s,a,c,l){super(t,n,s,a,l),this._firestore=t,this._firestoreImpl=t,this.metadata=c}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const n=new ln(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,n={}){if(this._document){const s=this._document.data.field(oo("DocumentSnapshot.get",t));if(s!==null)return this._userDataWriter.convertValue(s,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new b(C.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,n={};return n.type=re._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}re._jsonSchemaVersion="firestore/documentSnapshot/1.0",re._jsonSchema={type:U("string",re._jsonSchemaVersion),bundleSource:U("string","DocumentSnapshot"),bundleName:U("string"),bundle:U("string")};class ln extends re{data(t={}){return super.data(t)}}class Oe{constructor(t,n,s,a){this._firestore=t,this._userDataWriter=n,this._snapshot=a,this.metadata=new rn(a.hasPendingWrites,a.fromCache),this.query=s}get docs(){const t=[];return this.forEach((n=>t.push(n))),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,n){this._snapshot.docs.forEach((s=>{t.call(n,new ln(this._firestore,this._userDataWriter,s.key,s,new rn(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(t={}){const n=!!t.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new b(C.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=(function(a,c){if(a._snapshot.oldDocs.isEmpty()){let l=0;return a._snapshot.docChanges.map((w=>{const T=new ln(a._firestore,a._userDataWriter,w.doc.key,w.doc,new rn(a._snapshot.mutatedKeys.has(w.doc.key),a._snapshot.fromCache),a.query.converter);return w.doc,{type:"added",doc:T,oldIndex:-1,newIndex:l++}}))}{let l=a._snapshot.oldDocs;return a._snapshot.docChanges.filter((w=>c||w.type!==3)).map((w=>{const T=new ln(a._firestore,a._userDataWriter,w.doc.key,w.doc,new rn(a._snapshot.mutatedKeys.has(w.doc.key),a._snapshot.fromCache),a.query.converter);let v=-1,S=-1;return w.type!==0&&(v=l.indexOf(w.doc.key),l=l.delete(w.doc.key)),w.type!==1&&(l=l.add(w.doc),S=l.indexOf(w.doc.key)),{type:al(w.type),doc:T,oldIndex:v,newIndex:S}}))}})(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new b(C.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=Oe._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=Uh.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],s=[],a=[];return this.docs.forEach((c=>{c._document!==null&&(n.push(c._document),s.push(this._userDataWriter.convertObjectMap(c._document.data.value.mapValue.fields,"previous")),a.push(c.ref.path))})),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function al(i){switch(i){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Me(61501,{type:i})}}/**
 * @license
 * Copyright 2022 Google LLC
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
 */Oe._jsonSchemaVersion="firestore/querySnapshot/1.0",Oe._jsonSchema={type:U("string",Oe._jsonSchemaVersion),bundleSource:U("string","QuerySnapshot"),bundleName:U("string"),bundle:U("string")};(function(t,n=!0){Ph(he),$t(new Bt("firestore",((s,{instanceIdentifier:a,options:c})=>{const l=s.getProvider("app").getImmediate(),w=new nl(new Nh(s.getProvider("auth-internal")),new Lh(l,s.getProvider("app-check-internal")),zh(l,a),l);return c={useFetchStreams:n,...c},w._setSettings(c),w}),"PUBLIC").setMultipleInstances(!0)),pt(hr,lr,t),pt(hr,lr,"esm2020")})();const co="@firebase/installations",ki="0.6.19";/**
 * @license
 * Copyright 2019 Google LLC
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
 */const ho=1e4,lo=`w:${ki}`,uo="FIS_v2",cl="https://firebaseinstallations.googleapis.com/v1",hl=3600*1e3,ll="installations",ul="Installations";/**
 * @license
 * Copyright 2019 Google LLC
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
 */const dl={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},zt=new Ue(ll,ul,dl);function fo(i){return i instanceof le&&i.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
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
 */function po({projectId:i}){return`${cl}/projects/${i}/installations`}function go(i){return{token:i.token,requestStatus:2,expiresIn:pl(i.expiresIn),creationTime:Date.now()}}async function mo(i,t){const s=(await t.json()).error;return zt.create("request-failed",{requestName:i,serverCode:s.code,serverMessage:s.message,serverStatus:s.status})}function yo({apiKey:i}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":i})}function fl(i,{refreshToken:t}){const n=yo(i);return n.append("Authorization",gl(t)),n}async function _o(i){const t=await i();return t.status>=500&&t.status<600?i():t}function pl(i){return Number(i.replace("s","000"))}function gl(i){return`${uo} ${i}`}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function ml({appConfig:i,heartbeatServiceProvider:t},{fid:n}){const s=po(i),a=yo(i),c=t.getImmediate({optional:!0});if(c){const v=await c.getHeartbeatsHeader();v&&a.append("x-firebase-client",v)}const l={fid:n,authVersion:uo,appId:i.appId,sdkVersion:lo},w={method:"POST",headers:a,body:JSON.stringify(l)},T=await _o(()=>fetch(s,w));if(T.ok){const v=await T.json();return{fid:v.fid||n,registrationStatus:2,refreshToken:v.refreshToken,authToken:go(v.authToken)}}else throw await mo("Create Installation",T)}/**
 * @license
 * Copyright 2019 Google LLC
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
 */function wo(i){return new Promise(t=>{setTimeout(t,i)})}/**
 * @license
 * Copyright 2019 Google LLC
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
 */function yl(i){return btoa(String.fromCharCode(...i)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const _l=/^[cdef][\w-]{21}$/,hi="";function wl(){try{const i=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(i),i[0]=112+i[0]%16;const n=Il(i);return _l.test(n)?n:hi}catch{return hi}}function Il(i){return yl(i).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
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
 */function En(i){return`${i.appName}!${i.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const Io=new Map;function To(i,t){const n=En(i);vo(n,t),Tl(n,t)}function vo(i,t){const n=Io.get(i);if(n)for(const s of n)s(t)}function Tl(i,t){const n=vl();n&&n.postMessage({key:i,fid:t}),El()}let Vt=null;function vl(){return!Vt&&"BroadcastChannel"in self&&(Vt=new BroadcastChannel("[Firebase] FID Change"),Vt.onmessage=i=>{vo(i.data.key,i.data.fid)}),Vt}function El(){Io.size===0&&Vt&&(Vt.close(),Vt=null)}/**
 * @license
 * Copyright 2019 Google LLC
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
 */const Al="firebase-installations-database",Sl=1,Kt="firebase-installations-store";let ei=null;function Pi(){return ei||(ei=Ta(Al,Sl,{upgrade:(i,t)=>{switch(t){case 0:i.createObjectStore(Kt)}}})),ei}async function _n(i,t){const n=En(i),a=(await Pi()).transaction(Kt,"readwrite"),c=a.objectStore(Kt),l=await c.get(n);return await c.put(t,n),await a.done,(!l||l.fid!==t.fid)&&To(i,t.fid),t}async function Eo(i){const t=En(i),s=(await Pi()).transaction(Kt,"readwrite");await s.objectStore(Kt).delete(t),await s.done}async function An(i,t){const n=En(i),a=(await Pi()).transaction(Kt,"readwrite"),c=a.objectStore(Kt),l=await c.get(n),w=t(l);return w===void 0?await c.delete(n):await c.put(w,n),await a.done,w&&(!l||l.fid!==w.fid)&&To(i,w.fid),w}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function Ri(i){let t;const n=await An(i.appConfig,s=>{const a=kl(s),c=Pl(i,a);return t=c.registrationPromise,c.installationEntry});return n.fid===hi?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function kl(i){const t=i||{fid:wl(),registrationStatus:0};return Ao(t)}function Pl(i,t){if(t.registrationStatus===0){if(!navigator.onLine){const a=Promise.reject(zt.create("app-offline"));return{installationEntry:t,registrationPromise:a}}const n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},s=Rl(i,n);return{installationEntry:n,registrationPromise:s}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:Cl(i)}:{installationEntry:t}}async function Rl(i,t){try{const n=await ml(i,t);return _n(i.appConfig,n)}catch(n){throw fo(n)&&n.customData.serverCode===409?await Eo(i.appConfig):await _n(i.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function Cl(i){let t=await ur(i.appConfig);for(;t.registrationStatus===1;)await wo(100),t=await ur(i.appConfig);if(t.registrationStatus===0){const{installationEntry:n,registrationPromise:s}=await Ri(i);return s||n}return t}function ur(i){return An(i,t=>{if(!t)throw zt.create("installation-not-found");return Ao(t)})}function Ao(i){return bl(i)?{fid:i.fid,registrationStatus:0}:i}function bl(i){return i.registrationStatus===1&&i.registrationTime+ho<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function Nl({appConfig:i,heartbeatServiceProvider:t},n){const s=Ol(i,n),a=fl(i,n),c=t.getImmediate({optional:!0});if(c){const v=await c.getHeartbeatsHeader();v&&a.append("x-firebase-client",v)}const l={installation:{sdkVersion:lo,appId:i.appId}},w={method:"POST",headers:a,body:JSON.stringify(l)},T=await _o(()=>fetch(s,w));if(T.ok){const v=await T.json();return go(v)}else throw await mo("Generate Auth Token",T)}function Ol(i,{fid:t}){return`${po(i)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function Ci(i,t=!1){let n;const s=await An(i.appConfig,c=>{if(!So(c))throw zt.create("not-registered");const l=c.authToken;if(!t&&Ml(l))return c;if(l.requestStatus===1)return n=Dl(i,t),c;{if(!navigator.onLine)throw zt.create("app-offline");const w=xl(c);return n=Ll(i,w),w}});return n?await n:s.authToken}async function Dl(i,t){let n=await dr(i.appConfig);for(;n.authToken.requestStatus===1;)await wo(100),n=await dr(i.appConfig);const s=n.authToken;return s.requestStatus===0?Ci(i,t):s}function dr(i){return An(i,t=>{if(!So(t))throw zt.create("not-registered");const n=t.authToken;return Fl(n)?{...t,authToken:{requestStatus:0}}:t})}async function Ll(i,t){try{const n=await Nl(i,t),s={...t,authToken:n};return await _n(i.appConfig,s),n}catch(n){if(fo(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await Eo(i.appConfig);else{const s={...t,authToken:{requestStatus:0}};await _n(i.appConfig,s)}throw n}}function So(i){return i!==void 0&&i.registrationStatus===2}function Ml(i){return i.requestStatus===2&&!Ul(i)}function Ul(i){const t=Date.now();return t<i.creationTime||i.creationTime+i.expiresIn<t+hl}function xl(i){const t={requestStatus:1,requestTime:Date.now()};return{...i,authToken:t}}function Fl(i){return i.requestStatus===1&&i.requestTime+ho<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function Vl(i){const t=i,{installationEntry:n,registrationPromise:s}=await Ri(t);return s?s.catch(console.error):Ci(t).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
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
 */async function jl(i,t=!1){const n=i;return await Hl(n),(await Ci(n,t)).token}async function Hl(i){const{registrationPromise:t}=await Ri(i);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
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
 */function ql(i){if(!i||!i.options)throw ni("App Configuration");if(!i.name)throw ni("App Name");const t=["projectId","apiKey","appId"];for(const n of t)if(!i.options[n])throw ni(n);return{appName:i.name,projectId:i.options.projectId,apiKey:i.options.apiKey,appId:i.options.appId}}function ni(i){return zt.create("missing-app-config-values",{valueName:i})}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const ko="installations",$l="installations-internal",Bl=i=>{const t=i.getProvider("app").getImmediate(),n=ql(t),s=Jt(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:s,_delete:()=>Promise.resolve()}},Gl=i=>{const t=i.getProvider("app").getImmediate(),n=Jt(t,ko).getImmediate();return{getId:()=>Vl(n),getToken:a=>jl(n,a)}};function Wl(){$t(new Bt(ko,Bl,"PUBLIC")),$t(new Bt($l,Gl,"PRIVATE"))}Wl();pt(co,ki);pt(co,ki,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
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
 */const wn="analytics",zl="firebase_id",Kl="origin",Jl=60*1e3,Xl="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",bi="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
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
 */const G=new li("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
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
 */const Yl={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},z=new Ue("analytics","Analytics",Yl);/**
 * @license
 * Copyright 2019 Google LLC
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
 */function Ql(i){if(!i.startsWith(bi)){const t=z.create("invalid-gtag-resource",{gtagURL:i});return G.warn(t.message),""}return i}function Po(i){return Promise.all(i.map(t=>t.catch(n=>n)))}function Zl(i,t){let n;return window.trustedTypes&&(n=window.trustedTypes.createPolicy(i,t)),n}function tu(i,t){const n=Zl("firebase-js-sdk-policy",{createScriptURL:Ql}),s=document.createElement("script"),a=`${bi}?l=${i}&id=${t}`;s.src=n?n==null?void 0:n.createScriptURL(a):a,s.async=!0,document.head.appendChild(s)}function eu(i){let t=[];return Array.isArray(window[i])?t=window[i]:window[i]=t,t}async function nu(i,t,n,s,a,c){const l=s[a];try{if(l)await t[l];else{const T=(await Po(n)).find(v=>v.measurementId===a);T&&await t[T.appId]}}catch(w){G.error(w)}i("config",a,c)}async function iu(i,t,n,s,a){try{let c=[];if(a&&a.send_to){let l=a.send_to;Array.isArray(l)||(l=[l]);const w=await Po(n);for(const T of l){const v=w.find(A=>A.measurementId===T),S=v&&t[v.appId];if(S)c.push(S);else{c=[];break}}}c.length===0&&(c=Object.values(t)),await Promise.all(c),i("event",s,a||{})}catch(c){G.error(c)}}function su(i,t,n,s){async function a(c,...l){try{if(c==="event"){const[w,T]=l;await iu(i,t,n,w,T)}else if(c==="config"){const[w,T]=l;await nu(i,t,n,s,w,T)}else if(c==="consent"){const[w,T]=l;i("consent",w,T)}else if(c==="get"){const[w,T,v]=l;i("get",w,T,v)}else if(c==="set"){const[w]=l;i("set",w)}else i(c,...l)}catch(w){G.error(w)}}return a}function ru(i,t,n,s,a){let c=function(...l){window[s].push(arguments)};return window[a]&&typeof window[a]=="function"&&(c=window[a]),window[a]=su(c,i,t,n),{gtagCore:c,wrappedGtag:window[a]}}function ou(i){const t=window.document.getElementsByTagName("script");for(const n of Object.values(t))if(n.src&&n.src.includes(bi)&&n.src.includes(i))return n;return null}/**
 * @license
 * Copyright 2020 Google LLC
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
 */const au=30,cu=1e3;class hu{constructor(t={},n=cu){this.throttleMetadata=t,this.intervalMillis=n}getThrottleMetadata(t){return this.throttleMetadata[t]}setThrottleMetadata(t,n){this.throttleMetadata[t]=n}deleteThrottleMetadata(t){delete this.throttleMetadata[t]}}const Ro=new hu;function lu(i){return new Headers({Accept:"application/json","x-goog-api-key":i})}async function uu(i){var l;const{appId:t,apiKey:n}=i,s={method:"GET",headers:lu(n)},a=Xl.replace("{app-id}",t),c=await fetch(a,s);if(c.status!==200&&c.status!==304){let w="";try{const T=await c.json();(l=T.error)!=null&&l.message&&(w=T.error.message)}catch{}throw z.create("config-fetch-failed",{httpStatus:c.status,responseMessage:w})}return c.json()}async function du(i,t=Ro,n){const{appId:s,apiKey:a,measurementId:c}=i.options;if(!s)throw z.create("no-app-id");if(!a){if(c)return{measurementId:c,appId:s};throw z.create("no-api-key")}const l=t.getThrottleMetadata(s)||{backoffCount:0,throttleEndTimeMillis:Date.now()},w=new gu;return setTimeout(async()=>{w.abort()},Jl),Co({appId:s,apiKey:a,measurementId:c},l,w,t)}async function Co(i,{throttleEndTimeMillis:t,backoffCount:n},s,a=Ro){var w;const{appId:c,measurementId:l}=i;try{await fu(s,t)}catch(T){if(l)return G.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${l} provided in the "measurementId" field in the local Firebase config. [${T==null?void 0:T.message}]`),{appId:c,measurementId:l};throw T}try{const T=await uu(i);return a.deleteThrottleMetadata(c),T}catch(T){const v=T;if(!pu(v)){if(a.deleteThrottleMetadata(c),l)return G.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${l} provided in the "measurementId" field in the local Firebase config. [${v==null?void 0:v.message}]`),{appId:c,measurementId:l};throw T}const S=Number((w=v==null?void 0:v.customData)==null?void 0:w.httpStatus)===503?Ns(n,a.intervalMillis,au):Ns(n,a.intervalMillis),A={throttleEndTimeMillis:Date.now()+S,backoffCount:n+1};return a.setThrottleMetadata(c,A),G.debug(`Calling attemptFetch again in ${S} millis`),Co(i,A,s,a)}}function fu(i,t){return new Promise((n,s)=>{const a=Math.max(t-Date.now(),0),c=setTimeout(n,a);i.addEventListener(()=>{clearTimeout(c),s(z.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}function pu(i){if(!(i instanceof le)||!i.customData)return!1;const t=Number(i.customData.httpStatus);return t===429||t===500||t===503||t===504}class gu{constructor(){this.listeners=[]}addEventListener(t){this.listeners.push(t)}abort(){this.listeners.forEach(t=>t())}}async function mu(i,t,n,s,a){if(a&&a.global){i("event",n,s);return}else{const c=await t,l={...s,send_to:c};i("event",n,l)}}async function yu(i,t,n,s){if(s&&s.global){const a={};for(const c of Object.keys(n))a[`user_properties.${c}`]=n[c];return i("set",a),Promise.resolve()}else{const a=await t;i("config",a,{update:!0,user_properties:n})}}/**
 * @license
 * Copyright 2020 Google LLC
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
 */async function _u(){if(va())try{await Ea()}catch(i){return G.warn(z.create("indexeddb-unavailable",{errorInfo:i==null?void 0:i.toString()}).message),!1}else return G.warn(z.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function wu(i,t,n,s,a,c,l){const w=du(i);w.then(N=>{n[N.measurementId]=N.appId,i.options.measurementId&&N.measurementId!==i.options.measurementId&&G.warn(`The measurement ID in the local Firebase config (${i.options.measurementId}) does not match the measurement ID fetched from the server (${N.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(N=>G.error(N)),t.push(w);const T=_u().then(N=>{if(N)return s.getId()}),[v,S]=await Promise.all([w,T]);ou(c)||tu(c,v.measurementId),a("js",new Date);const A=(l==null?void 0:l.config)??{};return A[Kl]="firebase",A.update=!0,S!=null&&(A[zl]=S),a("config",v.measurementId,A),v.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
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
 */class Iu{constructor(t){this.app=t}_delete(){return delete oe[this.app.options.appId],Promise.resolve()}}let oe={},fr=[];const pr={};let ii="dataLayer",Tu="gtag",gr,Ni,mr=!1;function vu(){const i=[];if(Ir()&&i.push("This is a browser extension environment."),Aa()||i.push("Cookies are not available."),i.length>0){const t=i.map((s,a)=>`(${a+1}) ${s}`).join(" "),n=z.create("invalid-analytics-context",{errorInfo:t});G.warn(n.message)}}function Eu(i,t,n){vu();const s=i.options.appId;if(!s)throw z.create("no-app-id");if(!i.options.apiKey)if(i.options.measurementId)G.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${i.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw z.create("no-api-key");if(oe[s]!=null)throw z.create("already-exists",{id:s});if(!mr){eu(ii);const{wrappedGtag:c,gtagCore:l}=ru(oe,fr,pr,ii,Tu);Ni=c,gr=l,mr=!0}return oe[s]=wu(i,fr,pr,t,gr,ii,n),new Iu(i)}function Au(i=ui()){i=lt(i);const t=Jt(i,wn);return t.isInitialized()?t.getImmediate():Su(i)}function Su(i,t={}){const n=Jt(i,wn);if(n.isInitialized()){const a=n.getImmediate();if(De(t,n.getOptions()))return a;throw z.create("already-initialized")}return n.initialize({options:t})}function ku(i,t,n){i=lt(i),yu(Ni,oe[i.app.options.appId],t,n).catch(s=>G.error(s))}function Pu(i,t,n,s){i=lt(i),mu(Ni,oe[i.app.options.appId],t,n,s).catch(a=>G.error(a))}const yr="@firebase/analytics",_r="0.10.19";function Ru(){$t(new Bt(wn,(t,{options:n})=>{const s=t.getProvider("app").getImmediate(),a=t.getProvider("installations-internal").getImmediate();return Eu(s,a,n)},"PUBLIC")),$t(new Bt("analytics-internal",i,"PRIVATE")),pt(yr,_r),pt(yr,_r,"esm2020");function i(t){try{const n=t.getProvider(wn).getImmediate();return{logEvent:(s,a,c)=>Pu(n,s,a,c),setUserProperties:(s,a)=>ku(n,s,a)}}catch(n){throw z.create("interop-component-reg-failed",{reason:n})}}}Ru();const bo={apiKey:void 0,authDomain:void 0,projectId:void 0,storageBucket:void 0,messagingSenderId:void 0,appId:void 0},Cu=Object.values(bo).every(i=>!!i);let Re=null,bu=null;Cu?(Re=Sa(bo),Sh(Re),il(Re),typeof window<"u"&&Au(Re),bu=ka(Re)):console.warn("Firebase is not configured. Some features may be unavailable.");export{Re as a,bu as f};
