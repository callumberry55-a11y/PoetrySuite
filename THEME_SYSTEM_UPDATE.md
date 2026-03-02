# Theme System Update - QPR 2 Beta 3.5

## Overview

The Poetry Suite theme system has been significantly improved to ensure themes are applied consistently across the entire application. The theme system now integrates seamlessly between the basic light/dark mode and the advanced theme manager.

## Key Improvements

### 1. Enhanced ThemeContext

The ThemeContext now manages both basic themes (light/dark) and advanced custom themes:

- **Active Theme Tracking**: Monitors which advanced theme is currently active
- **Theme Refresh**: Provides a `refreshTheme()` method to reload theme settings
- **Seamless Integration**: Automatically applies advanced themes when users log in
- **Fallback Support**: Falls back to basic light/dark theme when no custom theme is active

### 2. Updated Color Scheme

The default color palette has been updated to use green as the primary color:

**Light Mode:**
- Primary: `#10b981` (Emerald green)
- Secondary: `#3b82f6` (Blue)
- Tertiary: `#8b5cf6` (Purple)

**Dark Mode:**
- Primary: `#34d399` (Light emerald)
- Secondary: `#60a5fa` (Light blue)
- Tertiary: `#a78bfa` (Light purple)

### 3. Comprehensive CSS Variable System

All theme colors are now available as CSS variables:

```css
--primary
--on-primary
--primary-container
--on-primary-container
--secondary
--on-secondary
--secondary-container
--on-secondary-container
--tertiary
--on-tertiary
--tertiary-container
--on-tertiary-container
--accent
--on-accent
--accent-container
--on-accent-container
--error
--on-error
--error-container
--on-error-container
--background
--on-background
--surface
--on-surface
--surface-variant
--on-surface-variant
--outline
--shadow
--inverse-surface
--inverse-on-surface
--inverse-primary
```

### 4. Tailwind Integration

All CSS variables are mapped to Tailwind utilities for easy use:

```jsx
// Background colors
className="bg-primary"
className="bg-surface"
className="bg-background"

// Text colors
className="text-on-primary"
className="text-on-surface"
className="text-on-background"

// Border colors
className="border-primary"
className="border-outline"
```

### 5. Smooth Theme Transitions

All color changes now transition smoothly (200ms) for a polished user experience:

```css
* {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-duration: 200ms;
}
```

### 6. Native App Integration

The status bar now adapts to the active theme's primary color:

- Extracts primary color from active theme
- Falls back to default colors if no theme is active
- Properly sets light/dark status bar style based on theme

## Using the Theme System

### As a User

1. **Basic Theme Toggle**: Use the theme toggle in Settings to switch between light and dark mode
2. **Advanced Themes**: Visit the Theme Manager in Settings to:
   - Browse and apply pre-made themes
   - Import/export custom themes
   - Generate AI-powered themes (Beta)

### As a Developer

#### Reading Current Theme

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { isDark, activeTheme, toggleTheme, refreshTheme } = useTheme();

  // Check if dark mode
  if (isDark) {
    // Dark mode specific logic
  }

  // Check active theme
  if (activeTheme) {
    console.log('Active theme:', activeTheme.name);
  }
}
```

#### Using Theme Colors

```tsx
// Using Tailwind classes
<div className="bg-primary text-on-primary">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// Using inline styles with CSS variables
<div style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}>
  Content
</div>
```

#### Creating Custom Themes

```tsx
import { createCustomTheme } from '@/utils/themes';

const myTheme = await createCustomTheme(userId, {
  name: 'Ocean Breeze',
  type: 'static',
  colors: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    background: '#f0f9ff',
    surface: '#ffffff',
    text: '#0c4a6e'
  },
  settings: {
    description: 'A calm ocean-inspired theme'
  },
  is_premium: false
});
```

#### Applying Themes

```tsx
import { applyThemeToDocument } from '@/utils/themes';

// Apply a theme
applyThemeToDocument(theme);

// Refresh the theme context
await refreshTheme();
```

## Theme Types

### 1. Static Themes
Simple color schemes that don't change.

### 2. Adaptive Themes (Beta)
Themes that change based on context (time of day, activity, etc.).

### 3. Live Themes (Beta)
Themes with animated effects like pulsing or flowing gradients.

### 4. AI-Generated Themes (Beta)
Themes created by AI based on text descriptions.

## Best Practices

1. **Always use CSS variables**: Prefer `var(--primary)` over hardcoded colors
2. **Use Tailwind utilities**: Leverage `bg-primary`, `text-on-surface`, etc.
3. **Test in both modes**: Verify your UI works in light and dark mode
4. **Respect active themes**: Don't override theme colors unnecessarily
5. **Handle theme changes**: Ensure components update when themes change

## Migration Guide

If you have existing components using old color schemes:

### Before:
```tsx
<div className="bg-purple-600 text-white">
  Content
</div>
```

### After:
```tsx
<div className="bg-primary text-on-primary">
  Content
</div>
```

## Future Enhancements

- [ ] Theme scheduling (apply themes at specific times)
- [ ] Theme sharing between users
- [ ] Theme marketplace
- [ ] More AI-generated theme options
- [ ] Theme animation customization
- [ ] Per-component theme overrides

## Troubleshooting

### Theme not applying
1. Check if you're logged in (advanced themes require authentication)
2. Refresh the page
3. Try toggling between light/dark mode
4. Clear browser cache

### Colors look wrong
1. Ensure you're using CSS variables, not hardcoded colors
2. Check if a custom theme is overriding defaults
3. Verify the theme data in the database

### Performance issues
1. Disable live/animated themes if experiencing lag
2. Use static themes for better performance
3. Check browser compatibility

## Support

For issues or questions about the theme system, please refer to the main README or contact support.
