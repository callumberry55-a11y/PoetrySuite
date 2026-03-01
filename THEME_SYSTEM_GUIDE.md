# Theme System Guide

Complete guide for using and customizing themes in Poetry Suite.

## Features

### 1. Browse & Apply Themes
- 30+ pre-built themes available
- Static, adaptive, and live animated themes
- One-click theme application
- Real-time preview of active theme

### 2. Import & Export Themes
- Export any theme as JSON
- Import community-created themes
- Share your custom themes with others
- Easy theme backup and restore

### 3. AI Theme Generator
- Generate custom themes using AI
- Describe your ideal color scheme
- Automatic color harmony calculation
- Save and reuse AI-generated themes

## Theme Types

### Static Themes
Simple, single-color scheme themes:
- Modern Light
- Modern Dark
- Ocean Breeze
- Forest Whisper
- Sunset Glow
- Lavender Dreams
- Rose Garden
- And many more...

### Adaptive Themes
Themes that change based on time of day or context:
- **Day & Night**: Automatically adapts colors based on time
  - Morning (6am-12pm): Warm amber tones
  - Afternoon (12pm-6pm): Bright blue sky
  - Evening (6pm-10pm): Sunset orange
  - Night (10pm-6am): Deep purple/indigo

### Live Themes (Premium)
Animated themes with dynamic effects:
- **Aurora Flow**: Flowing gradient animation
- **Pulse Energy**: Pulsing color effect
- **Breathing Colors**: Subtle breathing animation

## Using the Theme Manager

### Accessing Theme Manager
1. Open the app navigation/settings
2. Click on "Theme Manager"
3. Browse available themes

### Applying a Theme
1. Browse themes in the gallery
2. Click "Apply" on any theme
3. Theme is instantly applied to the entire app
4. Your selection is saved to your account

### Exporting a Theme
1. Find the theme you want to export
2. Click the download icon
3. JSON file is automatically downloaded
4. Share with others or keep as backup

### Importing a Theme
1. Go to "Import/Export" tab
2. Paste the theme JSON into the text area
3. Click "Import Theme"
4. Theme is added to your collection

## Creating Custom Themes

### Using AI Generator

**Example Prompts:**
- "Warm autumn forest at sunset"
- "Deep ocean with bioluminescence"
- "Minimalist Japanese zen garden"
- "Vibrant tropical paradise"
- "Cozy coffee shop in winter"
- "Starry night sky over mountains"

**Steps:**
1. Go to "AI Generator" tab
2. Enter your description
3. Click "Generate Theme"
4. AI creates a custom color scheme
5. Theme is automatically saved

### Manual Theme Creation

Create a JSON file with this structure:

```json
{
  "name": "My Custom Theme",
  "type": "static",
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#0f172a"
  },
  "settings": {
    "description": "My custom theme description"
  }
}
```

## Theme Format Reference

### Static Theme
```json
{
  "name": "Theme Name",
  "type": "static",
  "colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "background": "#hexcolor",
    "surface": "#hexcolor",
    "text": "#hexcolor"
  },
  "settings": {
    "description": "Theme description"
  }
}
```

### Adaptive Theme
```json
{
  "name": "Adaptive Theme",
  "type": "adaptive",
  "colors": {
    "morning": {
      "primary": "#f59e0b",
      "secondary": "#fbbf24",
      "background": "#fffbeb",
      "surface": "#fef3c7",
      "text": "#78350f"
    },
    "afternoon": {
      "primary": "#3b82f6",
      "secondary": "#60a5fa",
      "background": "#eff6ff",
      "surface": "#dbeafe",
      "text": "#1e3a8a"
    },
    "evening": {
      "primary": "#f97316",
      "secondary": "#fb923c",
      "background": "#fff7ed",
      "surface": "#fed7aa",
      "text": "#7c2d12"
    },
    "night": {
      "primary": "#6366f1",
      "secondary": "#818cf8",
      "background": "#1e1b4b",
      "surface": "#312e81",
      "text": "#e0e7ff"
    }
  },
  "settings": {
    "description": "Changes with time of day",
    "triggers": ["time"]
  }
}
```

### Live Theme
```json
{
  "name": "Animated Theme",
  "type": "live",
  "colors": {
    "base": "#8b5cf6",
    "animation": "flow",
    "gradient": ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981"],
    "duration": 10000
  },
  "settings": {
    "description": "Flowing animation",
    "animated": true
  }
}
```

## Color Properties

### Required Colors
- `primary`: Main brand color
- `secondary`: Secondary accent color
- `background`: Page background
- `surface`: Card/surface background
- `text`: Primary text color

### Optional Colors
- `accent`: Additional accent color
- `tertiary`: Third accent color

## Advanced Features

### Theme Persistence
- Themes are saved to your user preferences
- Settings sync across devices
- Last used theme loads automatically

### Theme Deletion
- Delete custom themes you've created
- Cannot delete default system themes
- Active theme cannot be deleted

### Color Harmony
AI-generated themes use color theory:
- Complementary colors
- Analogous schemes
- Triadic combinations
- Proper contrast ratios

## Tips for Best Results

### Creating Themes
1. Use hex color codes (#RRGGBB)
2. Ensure good contrast between text and background
3. Test on both light and dark modes
4. Keep descriptions concise

### AI Generation
1. Be specific with your descriptions
2. Include mood words (warm, cool, vibrant, muted)
3. Reference nature or environments
4. Mention specific colors if desired

### Sharing Themes
1. Export to JSON before sharing
2. Include a good description
3. Test imported themes before sharing
4. Credit original creators

## Troubleshooting

### Theme Not Applying
- Refresh the page
- Check if you're logged in
- Try applying a different theme first

### Import Errors
- Validate JSON syntax
- Check all required fields present
- Ensure color values are valid hex codes

### AI Generation Failed
- Check internet connection
- Try a simpler prompt
- Wait a moment and retry

## Database Schema

Themes are stored in two tables:

**themes**
- id, name, type, colors, settings
- is_premium, created_by
- created_at, updated_at

**user_theme_preferences**
- user_id, active_theme_id
- adaptive_enabled, time_based_enabled
- custom_settings

## API Reference

### Get All Themes
```typescript
import { getAllThemes } from '@/utils/themes';
const themes = await getAllThemes();
```

### Apply Theme
```typescript
import { applyThemeToDocument } from '@/utils/themes';
applyThemeToDocument(theme);
```

### Save Preferences
```typescript
import { saveUserThemePreferences } from '@/utils/themes';
await saveUserThemePreferences(userId, { active_theme_id: themeId });
```

### Generate AI Theme
```typescript
import { generateAITheme } from '@/utils/themes';
const theme = await generateAITheme(prompt, userId);
```

## Coming Soon

- Theme marketplace
- Community theme sharing
- Theme ratings and reviews
- Advanced theme editor
- Color picker interface
- Theme collections
- Scheduled theme switching
- Activity-based themes

Enjoy customizing your Poetry Suite experience!
