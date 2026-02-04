# AI Features Documentation

## Overview

The Poetry Suite now includes comprehensive AI-powered features using Google's Gemini AI to enhance the poetry writing experience. These features help poets with analysis, improvement suggestions, generation, and creative inspiration.

## Setup

To use AI features, you need a Gemini API key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file:
   ```
   VITE_GEMINI_API_KEY=your-api-key-here
   ```

## Features

### 1. AI Poetry Assistant (in Poem Editor)

Access the AI Assistant by clicking the "AI Assistant" button while editing a poem. The assistant includes multiple tabs:

#### Analyze Tab
- **Deep Poetry Analysis**: Get detailed analysis including:
  - Poetic form and structure identification
  - Meter and rhythm analysis
  - Rhyme scheme detection
  - Literary devices used
  - Themes and meanings
  - Emotional tone and mood
  - Constructive suggestions for improvement

#### Insights Tab
- **Comprehensive AI Insights**: Get multiple types of analysis in one place:
  - **Sentiment Analysis**: Emotional tone, key emotions, and sentiment score
  - **Form Detection**: Identified poetic form with confidence level and characteristics
  - **Quality Scores**: Ratings (1-10) for overall quality, imagery, rhythm, originality, and emotional impact
  - **Expert Feedback**: Brief constructive feedback from the AI

#### Improve Tab
- **Poetry Improvements**: Get AI suggestions for enhancing your poem:
  - Line-by-line suggestions
  - Better word choices
  - Improvements to rhythm and flow
  - Ways to strengthen imagery
  - Enhanced version of the poem

- **Continue Poem**: AI will add 2-4 more lines that naturally continue your poem while maintaining style, meter, and themes

#### Generate Tab
- **AI Poetry Generation**: Create original poems based on:
  - Custom prompts or themes
  - Optional style transfer (write like famous poets):
    - Emily Dickinson
    - William Shakespeare
    - Maya Angelou
    - Robert Frost
    - Edgar Allan Poe
    - Langston Hughes
    - Sylvia Plath
    - Pablo Neruda
    - Rumi
    - Mary Oliver

- **Insert or Replace**: Generated poems can be inserted below your current work or replace it entirely

#### Rhyme Tab
- **Rhyme Finder**: Find rhymes for any word:
  - Perfect rhymes (20-30 words)
  - Near rhymes / slant rhymes (15-20 words)
  - Multisyllabic rhymes (10-15 phrases)
  - Creative usage examples in poetic lines (5 examples)

### 2. AI Writing Prompts

In the Prompts section, click the "AI Prompt" button to generate:
- Unique, creative poetry writing prompts
- Contextual and inspiring themes
- Prompts tailored to help overcome writer's block

### 3. AI Utilities (Available for Developers)

The following AI utility functions are available in `src/utils/ai.ts`:

#### `callGeminiAPI(systemPrompt, userPrompt, options)`
Base function for making AI API calls with customizable temperature and token limits.

#### `analyzePoemSentiment(poemContent)`
Returns sentiment analysis with:
- Overall sentiment (positive/negative/neutral/mixed)
- Key emotions detected
- Sentiment score (0-1)

#### `generatePoemTitle(poemContent)`
Generates a creative, evocative title for a poem.

#### `scorePoemQuality(poemContent)`
Returns quality scores for:
- Overall quality
- Imagery
- Rhythm and flow
- Originality
- Emotional impact
Plus constructive feedback.

#### `detectPoemForm(poemContent)`
Identifies the poetic form with:
- Form name (Sonnet, Haiku, Free Verse, etc.)
- Confidence level
- Key characteristics

#### `generateWritingPrompt(theme?, difficulty?)`
Generates creative writing prompts with optional:
- Theme specification
- Difficulty level (beginner/intermediate/advanced)

#### `improveLine(line, context)`
Suggests 3 improved versions of a specific line based on surrounding context.

#### `findSynonyms(word, context)`
Finds 10-15 contextually appropriate synonyms for use in poetry.

## User Experience

- **Loading States**: All AI operations show a walking pigeon animation while processing
- **Error Handling**: Clear error messages if API calls fail
- **Responsive Design**: AI Assistant works on both desktop and mobile
- **Context Preservation**: AI maintains awareness of your writing style and context

## API Usage Notes

- All requests use Google's Gemini 1.5 Flash model for optimal speed and cost
- Temperature is set higher (0.9) for creative tasks, lower (0.2-0.3) for analytical tasks
- Maximum token output is typically 2048 tokens (adjustable per feature)
- Error handling includes graceful fallbacks

## Privacy

- Your poems are only sent to Google's Gemini API when you explicitly use AI features
- No poems are stored by Google's AI service
- All data remains private according to Google's API terms of service

## Tips for Best Results

1. **Be Specific**: When generating poems, provide detailed prompts
2. **Use Context**: The more content you have, the better the analysis
3. **Iterate**: Use the "Continue" and "Improve" features multiple times
4. **Style Transfer**: Experiment with different poet styles for unique results
5. **Rhyme Tool**: Use the rhyme finder while writing to maintain flow
6. **Insights First**: Run insights before improvements to understand your poem better

## Future Enhancements

Potential future AI features:
- Real-time line suggestions as you type
- AI-powered poetry contests with automated judging
- Collaborative AI co-writing mode
- Translation between languages
- Audio generation (text-to-speech for performances)
- Style matching (analyze and match your unique voice)
- Personalized writing coach
