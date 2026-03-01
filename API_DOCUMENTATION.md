# Poetry Suite API Documentation

This document describes all available API endpoints in the Poetry Suite application.

## Table of Contents

1. [Poetry APIs](#poetry-apis)
2. [Writing Tools APIs](#writing-tools-apis)
3. [Daily Content APIs](#daily-content-apis)
4. [Analysis APIs](#analysis-apis)
5. [Usage Examples](#usage-examples)

---

## Poetry APIs

### 1. Fetch Poems from PoetryDB

**Endpoint**: `/functions/v1/fetch-poems`
**Method**: `GET`
**Authentication**: None required

Fetches poems from the PoetryDB public API.

**Query Parameters**:
- `action` (optional): Type of search - `random`, `by_author`, `by_title` (default: `random`)
- `count` (optional): Number of poems for random search (default: `10`)
- `author` (required for `by_author`): Author name
- `title` (required for `by_title`): Poem title

**Example**:
```javascript
// Get 5 random poems
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/fetch-poems?action=random&count=5`
);

// Get poems by author
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/fetch-poems?action=by_author&author=Emily Dickinson`
);
```

**Response**:
```json
{
  "poems": [
    {
      "title": "Hope is the thing with feathers",
      "author": "Emily Dickinson",
      "lines": ["...", "..."],
      "linecount": "12"
    }
  ]
}
```

---

## Writing Tools APIs

### 2. Rhyme Finder

**Endpoint**: `/functions/v1/rhyme-finder`
**Method**: `GET`
**Authentication**: None required

Find rhymes and related words using the Datamuse API.

**Query Parameters**:
- `word` (required): The word to find rhymes for
- `type` (optional): Type of match - `perfect`, `near`, `sounds_like`, `adjectives`, `nouns`, `synonyms`, `triggers` (default: `perfect`)
- `max` (optional): Maximum results (default: `50`)

**Example**:
```javascript
// Perfect rhymes
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/rhyme-finder?word=love&type=perfect`
);

// Near rhymes
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/rhyme-finder?word=moon&type=near&max=20`
);

// Adjectives that describe a word
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/rhyme-finder?word=ocean&type=adjectives`
);
```

**Response**:
```json
{
  "word": "love",
  "type": "perfect",
  "results": [
    { "word": "above", "score": 5234 },
    { "word": "dove", "score": 4123 },
    { "word": "glove", "score": 3456 }
  ]
}
```

### 3. Synonym Finder

**Endpoint**: `/functions/v1/synonym-finder`
**Method**: `GET`
**Authentication**: None required

Find synonyms and similar words.

**Query Parameters**:
- `word` (required): The word to find synonyms for
- `max` (optional): Maximum results (default: `100`)

**Example**:
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/synonym-finder?word=beautiful&max=50`
);
```

**Response**:
```json
{
  "originalWord": "beautiful",
  "synonyms": [
    {
      "word": "lovely",
      "score": 89234,
      "definitions": ["adj very attractive"],
      "tags": []
    },
    {
      "word": "gorgeous",
      "score": 78912,
      "definitions": ["adj strikingly beautiful"],
      "tags": []
    }
  ]
}
```

### 4. Poetry Prompts Generator

**Endpoint**: `/functions/v1/poetry-prompts-generator`
**Method**: `GET`
**Authentication**: None required

Generate creative writing prompts dynamically.

**Query Parameters**:
- `category` (optional): `emotions`, `nature`, `abstract`, `narrative`, `experimental`, `random` (default: `random`)
- `count` (optional): Number of prompts to generate (default: `3`)

**Example**:
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/poetry-prompts-generator?category=emotions&count=5`
);
```

**Response**:
```json
{
  "prompts": [
    "Write about the feeling of nostalgia through the lens of ocean",
    "Capture hope in a poem about dawn silence",
    "Explore wonder using imagery from forest"
  ],
  "category": "emotions",
  "count": 3
}
```

**Available Categories**:
- `emotions`: Prompts focused on feelings and emotional expression
- `nature`: Nature-based imagery and themes
- `abstract`: Conceptual and philosophical topics
- `narrative`: Story-telling and perspective prompts
- `experimental`: Creative constraints and unique challenges
- `random`: Mix of all categories

---

## Daily Content APIs

### 5. Quote of the Day

**Endpoint**: `/functions/v1/quote-of-the-day`
**Method**: `GET`
**Authentication**: None required

Get daily inspirational quotes about poetry, literature, and writing.

**Query Parameters**:
- `tags` (optional): Comma-separated tags (default: `poetry,literature,writing,creativity`)
- `maxLength` (optional): Maximum quote length (default: `300`)

**Example**:
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/quote-of-the-day?tags=poetry,writing`
);
```

**Response**:
```json
{
  "quote": {
    "content": "Poetry is when an emotion has found its thought and the thought has found words.",
    "author": "Robert Frost",
    "tags": ["poetry", "writing"]
  }
}
```

### 6. Word of the Day

**Endpoint**: `/functions/v1/word-of-the-day`
**Method**: `GET`
**Authentication**: None required

Get a daily word with definitions and examples to enrich vocabulary.

**Example**:
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/word-of-the-day`
);
```

**Response**:
```json
{
  "word": "serendipity",
  "definitions": [
    {
      "text": "The occurrence of events by chance in a happy or beneficial way",
      "partOfSpeech": "noun"
    }
  ],
  "examples": [
    {
      "text": "A fortunate stroke of serendipity brought the two old friends together"
    }
  ],
  "note": "A beautiful word for beautiful accidents",
  "publishDate": "2026-03-01T00:00:00Z"
}
```

---

## Analysis APIs

### 7. Literary Devices Detector

**Endpoint**: `/functions/v1/literary-devices-detector`
**Method**: `POST`
**Authentication**: None required

Analyze text for literary devices and structural elements.

**Request Body**:
```json
{
  "text": "Your poem text here..."
}
```

**Example**:
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/literary-devices-detector`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: "The wild wind whispers through the weeping willows"
    })
  }
);
```

**Response**:
```json
{
  "literaryDevices": [
    {
      "device": "Alliteration",
      "examples": [
        "\"wild wind\"",
        "\"weeping willows\""
      ],
      "description": "Repetition of consonant sounds at the beginning of words"
    },
    {
      "device": "Personification",
      "examples": [
        "\"wind whispers\""
      ],
      "description": "Giving human qualities to non-human things"
    }
  ],
  "structure": {
    "lines": 1,
    "words": 8,
    "characters": 51,
    "estimatedSyllables": 12,
    "averageLineLength": 8
  },
  "summary": {
    "devicesFound": 2,
    "devicesDetected": ["Alliteration", "Personification"]
  }
}
```

**Detected Devices**:
- **Alliteration**: Repetition of consonant sounds
- **Assonance**: Repetition of vowel sounds
- **Repetition**: Repeated words for emphasis
- **Metaphor**: Direct comparisons
- **Simile**: Comparisons using "like" or "as"
- **Personification**: Human qualities given to non-human things

---

## Usage Examples

### React Component Example

```typescript
import { useState, useEffect } from 'react';

function PoetryTools() {
  const [quote, setQuote] = useState(null);
  const [rhymes, setRhymes] = useState([]);
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  // Fetch quote of the day
  useEffect(() => {
    fetch(`${SUPABASE_URL}/functions/v1/quote-of-the-day`)
      .then(res => res.json())
      .then(data => setQuote(data.quote));
  }, []);

  // Find rhymes
  const findRhymes = async (word) => {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/rhyme-finder?word=${word}&type=perfect`
    );
    const data = await res.json();
    setRhymes(data.results);
  };

  return (
    <div>
      {quote && (
        <blockquote>
          <p>{quote.content}</p>
          <cite>— {quote.author}</cite>
        </blockquote>
      )}

      <input
        onChange={(e) => findRhymes(e.target.value)}
        placeholder="Find rhymes..."
      />

      <ul>
        {rhymes.map(r => (
          <li key={r.word}>{r.word}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Full Analysis Pipeline

```typescript
async function analyzePoem(text: string) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  // Detect literary devices
  const analysisRes = await fetch(
    `${SUPABASE_URL}/functions/v1/literary-devices-detector`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    }
  );
  const analysis = await analysisRes.json();

  // Get word suggestions for key terms
  const words = text.match(/\b\w{5,}\b/g) || [];
  const suggestions = await Promise.all(
    words.slice(0, 3).map(word =>
      fetch(`${SUPABASE_URL}/functions/v1/synonym-finder?word=${word}&max=5`)
        .then(res => res.json())
    )
  );

  return {
    devices: analysis.literaryDevices,
    structure: analysis.structure,
    wordSuggestions: suggestions
  };
}
```

### Generate Daily Writing Session

```typescript
async function createDailyWritingSession() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  // Get inspiration
  const [quote, word, prompts] = await Promise.all([
    fetch(`${SUPABASE_URL}/functions/v1/quote-of-the-day`).then(r => r.json()),
    fetch(`${SUPABASE_URL}/functions/v1/word-of-the-day`).then(r => r.json()),
    fetch(`${SUPABASE_URL}/functions/v1/poetry-prompts-generator?count=5`)
      .then(r => r.json())
  ]);

  return {
    inspiration: quote.quote,
    vocabularyWord: word,
    writingPrompts: prompts.prompts
  };
}
```

---

## Rate Limits and Best Practices

1. **Caching**: Consider caching API responses, especially for daily content
2. **Error Handling**: Always implement proper error handling
3. **Debouncing**: Debounce user input for rhyme/synonym finders
4. **Loading States**: Show loading indicators during API calls
5. **Fallbacks**: Provide fallback content if APIs fail

## API Status Codes

- `200` - Success
- `400` - Bad Request (missing parameters)
- `500` - Server Error

All APIs return JSON responses with appropriate CORS headers for web applications.
