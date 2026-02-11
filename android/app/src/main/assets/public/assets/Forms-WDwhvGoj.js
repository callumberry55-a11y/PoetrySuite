import{r as i,j as e,k as m,S as u}from"./index-2dP_p1EG.js";import{F as h}from"./funnel-XIWJNgH3.js";import{I as p}from"./info-BSYNdzvz.js";const l=[{id:"haiku",name:"Haiku",description:"A traditional Japanese form capturing a moment in nature",structure:"3 lines: 5-7-5 syllables",difficulty:"beginner",template:`[5 syllables]
[7 syllables]
[5 syllables]`,rules:["3 lines with 5-7-5 syllable pattern","Focus on nature or seasons","Present tense preferred","Capture a single moment"],examples:[`An old silent pond
A frog jumps into the pond—
Splash! Silence again`,`Winter moonlight falls
On snow-covered evergreens
Silver shadows dance`]},{id:"sonnet",name:"Sonnet",description:"A 14-line poem with intricate rhyme scheme",structure:"14 lines, iambic pentameter, specific rhyme scheme",difficulty:"advanced",template:`Line 1 (A)
Line 2 (B)
Line 3 (A)
Line 4 (B)
Line 5 (C)
Line 6 (D)
Line 7 (C)
Line 8 (D)
Line 9 (E)
Line 10 (F)
Line 11 (E)
Line 12 (F)
Line 13 (G)
Line 14 (G)`,rules:["14 lines total","Iambic pentameter (10 syllables per line)","Shakespearean rhyme scheme: ABAB CDCD EFEF GG","Volta (turn) typically after line 12"],examples:[`Shall I compare thee to a summer's day?
Thou art more lovely and more temperate...`]},{id:"limerick",name:"Limerick",description:"A humorous five-line poem with AABBA rhyme",structure:"5 lines with AABBA rhyme scheme",difficulty:"beginner",template:`[Line 1 - A]
[Line 2 - A]
[Line 3 - B]
[Line 4 - B]
[Line 5 - A]`,rules:["5 lines total","AABBA rhyme scheme","Lines 1, 2, 5 are longer (7-10 syllables)","Lines 3, 4 are shorter (5-7 syllables)","Usually humorous or whimsical"],examples:[`There once was a man from Peru
Who dreamed he was eating his shoe
He woke with a fright
In the middle of night
To find that his dream had come true`]},{id:"villanelle",name:"Villanelle",description:"A complex form with repeating refrains",structure:"19 lines, 5 tercets + 1 quatrain, 2 refrains",difficulty:"advanced",template:`A1
b
A2

a
b
A1

a
b
A2

a
b
A1

a
b
A2

a
b
A1
A2`,rules:["19 lines: 5 tercets + 1 quatrain","Two refrain lines (A1 and A2) that alternate","Rhyme scheme: ABA ABA ABA ABA ABA ABAA","Refrains appear at specific positions"],examples:["Do not go gentle into that good night..."]},{id:"tanka",name:"Tanka",description:"Japanese form, longer than haiku",structure:"5 lines: 5-7-5-7-7 syllables",difficulty:"beginner",template:`[5 syllables]
[7 syllables]
[5 syllables]
[7 syllables]
[7 syllables]`,rules:["5 lines with 5-7-5-7-7 syllable pattern","Often explores emotions or relationships","Can be more personal than haiku","May have a pivot or turn"],examples:[`Spring raindrops falling
Gently on the cherry blooms
Petals drift away
Carried by the evening breeze
To places unknown and far`]},{id:"acrostic",name:"Acrostic",description:"First letters spell a word vertically",structure:"Variable length, first letters spell a word",difficulty:"beginner",template:`[P]oem line
[O]ther line
[E]xample line
[M]ore line`,rules:["First letter of each line spells a word","Can be any length","Lines can be any length","Word is typically the subject"],examples:[`Peaceful evening sky
Orchids bloom in silence
Every moment still
Tranquil beauty flows`]},{id:"free-verse",name:"Free Verse",description:"No fixed structure, focused on natural rhythm",structure:"No fixed structure or rhyme scheme",difficulty:"intermediate",template:`Write freely...
Let your thoughts flow...
No rules to follow...`,rules:["No required rhyme scheme","No fixed meter","Focus on imagery and natural speech","Line breaks create rhythm and emphasis"],examples:[`The fog comes
on little cat feet.
It sits looking
over harbor and city...`]},{id:"cinquain",name:"Cinquain",description:"Five-line poem with syllable pattern",structure:"5 lines: 2-4-6-8-2 syllables",difficulty:"beginner",template:`[2 syllables]
[4 syllables]
[6 syllables]
[8 syllables]
[2 syllables]`,rules:["5 lines total","Syllable pattern: 2-4-6-8-2","Often describes a single image or moment","Last line echoes or contrasts first line"],examples:[`Autumn
Leaves falling down
Red gold and orange bright
Blanket the earth with color
Peace falls`]},{id:"pantoum",name:"Pantoum",description:"Form with interlocking repeating lines",structure:"Variable quatrains with repeating lines",difficulty:"advanced",template:`Line 1
Line 2
Line 3
Line 4

Line 2 (repeat)
Line 5
Line 4 (repeat)
Line 6`,rules:["Written in quatrains","Lines 2 and 4 of each stanza become lines 1 and 3 of next","Can be any length","Last stanza often repeats lines from first"],examples:[]},{id:"ghazal",name:"Ghazal",description:"Ancient Persian form with couplets",structure:"Couplets with repeating refrain",difficulty:"advanced",template:`Line ending with [REFRAIN]
Line ending with [REFRAIN]

New couplet
Line ending with [REFRAIN]`,rules:["Composed of couplets","Each couplet is autonomous","Refrain repeats at end of each couplet","Often explores themes of love and loss"],examples:[]},{id:"blank-verse",name:"Blank Verse",description:"Unrhymed iambic pentameter",structure:"Iambic pentameter without rhyme",difficulty:"intermediate",template:`da-DUM da-DUM da-DUM da-DUM da-DUM
da-DUM da-DUM da-DUM da-DUM da-DUM`,rules:["Unrhymed","Iambic pentameter (10 syllables, stressed/unstressed)","Natural speech rhythm","Used in much of Shakespeare's work"],examples:["To be or not to be, that is the question..."]},{id:"ode",name:"Ode",description:"Lyrical poem addressing a subject",structure:"Variable, often uses stanzas",difficulty:"intermediate",template:`Stanza 1: Address the subject
Stanza 2: Elaborate
Stanza 3: Conclude`,rules:["Addresses a particular subject","Elevated, formal tone","Often uses stanzas","Explores subject from multiple angles"],examples:[`Ode to a Nightingale
Ode on a Grecian Urn`]}];function g({onSelectForm:o}){const[a,s]=i.useState("all"),[n,r]=i.useState(null),c=a==="all"?l:l.filter(t=>t.difficulty===a);return e.jsxs("div",{className:"w-full h-full flex flex-col bg-gradient-to-br from-background to-secondary-container/20",children:[e.jsxs("div",{className:"p-6 border-b border-outline",children:[e.jsx("div",{className:"flex items-center justify-between mb-6",children:e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold text-on-background mb-2",children:"Poetry Forms"}),e.jsx("p",{className:"text-on-surface-variant",children:"Explore traditional and modern poetry structures"})]})}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(h,{size:18,className:"text-on-surface-variant"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>s("all"),className:`px-4 py-2 rounded-lg font-medium transition-colors ${a==="all"?"bg-primary text-on-primary":"bg-surface text-on-surface-variant hover:bg-surface-variant"}`,children:"All"}),e.jsx("button",{onClick:()=>s("beginner"),className:`px-4 py-2 rounded-lg font-medium transition-colors ${a==="beginner"?"bg-green-600 text-white":"bg-surface text-on-surface-variant hover:bg-surface-variant"}`,children:"Beginner"}),e.jsx("button",{onClick:()=>s("intermediate"),className:`px-4 py-2 rounded-lg font-medium transition-colors ${a==="intermediate"?"bg-primary text-on-primary":"bg-surface text-on-surface-variant hover:bg-surface-variant"}`,children:"Intermediate"}),e.jsx("button",{onClick:()=>s("advanced"),className:`px-4 py-2 rounded-lg font-medium transition-colors ${a==="advanced"?"bg-red-600 text-white":"bg-surface text-on-surface-variant hover:bg-surface-variant"}`,children:"Advanced"})]})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-6",children:e.jsx("div",{className:"w-full",children:n?e.jsxs("div",{className:"max-w-3xl mx-auto",children:[e.jsx("button",{onClick:()=>r(null),className:"mb-6 text-primary hover:underline",children:"← Back to all forms"}),e.jsx("div",{className:"bg-surface rounded-xl shadow-lg border border-outline overflow-hidden",children:e.jsxs("div",{className:"p-8",children:[e.jsxs("div",{className:"flex items-start justify-between mb-6",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-3xl font-bold text-on-surface mb-2",children:n.name}),e.jsx("p",{className:"text-on-surface-variant",children:n.description})]}),e.jsx("span",{className:`px-3 py-1 rounded-full text-sm font-medium ${n.difficulty==="beginner"?"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300":n.difficulty==="intermediate"?"bg-primary-container text-on-primary-container":"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`,children:n.difficulty})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx(p,{className:"text-primary",size:20}),e.jsx("h3",{className:"text-lg font-semibold text-on-surface",children:"Structure"})]}),e.jsx("p",{className:"text-on-surface",children:n.structure})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-on-surface mb-3",children:"Rules"}),e.jsx("ul",{className:"space-y-2",children:n.rules.map((t,d)=>e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx("span",{className:"text-primary mt-1",children:"•"}),e.jsx("span",{className:"text-on-surface",children:t})]},d))})]}),n.examples.length>0&&e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-on-surface mb-3",children:"Example"}),e.jsx("div",{className:"bg-surface-variant rounded-lg p-4",children:e.jsx("p",{className:"text-on-surface whitespace-pre-wrap font-serif italic",children:n.examples[0]})})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-on-surface mb-3",children:"Template"}),e.jsx("div",{className:"bg-surface-variant rounded-lg p-4",children:e.jsx("pre",{className:"text-on-surface text-sm whitespace-pre-wrap font-mono",children:n.template})})]}),e.jsxs("button",{onClick:()=>o(n),className:"w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-medium transition-colors",children:[e.jsx(u,{size:20}),"Start Writing with This Form"]})]})]})})]}):e.jsx("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:c.map(t=>e.jsxs("div",{onClick:()=>r(t),className:"bg-surface rounded-xl shadow-sm border border-outline p-6 cursor-pointer hover:shadow-md hover:border-primary transition-all",children:[e.jsxs("div",{className:"flex items-start justify-between mb-3",children:[e.jsx(m,{className:"text-primary",size:24}),e.jsx("span",{className:`px-2 py-1 rounded-full text-xs font-medium ${t.difficulty==="beginner"?"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300":t.difficulty==="intermediate"?"bg-primary-container text-on-primary-container":"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`,children:t.difficulty})]}),e.jsx("h3",{className:"text-xl font-bold text-on-surface mb-2",children:t.name}),e.jsx("p",{className:"text-sm text-on-surface-variant mb-3",children:t.description}),e.jsx("div",{className:"text-xs text-primary font-medium",children:t.structure})]},t.id))})})})]})}export{g as default};
