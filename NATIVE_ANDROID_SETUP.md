# Native Android Integration

This document describes the Capacitor plugins and native features integrated to enhance the Android experience.

## Installed Plugins

The following Capacitor plugins have been added to improve native Android functionality:

1. **@capacitor/app** (v8.0.1) - App state management, back button handling, and app lifecycle events
2. **@capacitor/haptics** (v8.0.0) - Native haptic feedback for tactile responses
3. **@capacitor/keyboard** (v8.0.0) - Keyboard management and control
4. **@capacitor/share** (v8.0.1) - Native sharing functionality
5. **@capacitor/splash-screen** (v8.0.1) - Native splash screen control
6. **@capacitor/status-bar** (v8.0.1) - Status bar styling and control
7. **@capacitor/toast** (v8.0.1) - Native toast notifications

## Configuration

The Capacitor configuration (`capacitor.config.ts`) has been updated with the following settings:

- **Splash Screen**: 2-second duration with emerald green background (#10b981)
- **Status Bar**: Dynamic styling based on theme (dark/light mode)
- **Keyboard**: Body resize mode with dark style and full-screen support
- **App**: Auto-hide launch screen

## Native Utilities

A comprehensive native utilities module has been created at `src/utils/native.ts` providing:

### Status Bar Controls
- Set dark/light mode
- Set custom background colors
- Show/hide status bar

### Splash Screen
- Show/hide splash screen programmatically

### Keyboard
- Show/hide keyboard
- Keyboard management

### Haptic Feedback
- Light, medium, heavy impact feedback
- Success, warning, error notifications

### Native Toast
- Show native Android toast messages
- Short and long duration options

### Native Sharing
- Share content using native Android share dialog

### App State Management
- Back button listeners
- Pause/resume event handlers
- App info retrieval

## Integration Points

### App Initialization
The app now initializes native features on startup:
- Automatically hides splash screen after load
- Sets status bar color based on theme (light/dark)
- Listens for back button, pause, and resume events

### Theme-Aware Status Bar
The status bar automatically adjusts when switching between light and dark themes:
- **Light mode**: Dark status bar text with emerald background
- **Dark mode**: Light status bar text with dark blue background

### Haptic Feedback
Haptic feedback has been integrated throughout the UI:
- **Light haptic**: Navigation actions (drawer, view changes)
- **Medium haptic**: Theme toggle, sign out
- **Success haptic**: Successful operations with toast
- **Error haptic**: Error notifications
- **Warning haptic**: Warning messages

### Native Toast Integration
The toast system now uses native Android toasts when running on a native platform, with automatic fallback to web toasts in browser environments. Haptic feedback is automatically triggered based on toast type.

## Usage Examples

### Using Haptic Feedback
```typescript
import { haptics } from '@/utils/native';

// Light tap feedback for navigation
haptics.light();

// Success notification
haptics.success();

// Error notification
haptics.error();
```

### Using Native Toast
```typescript
import { toast } from '@/utils/native';

// Show short toast
toast.show('Action completed', 'short');

// Show long toast
toast.show('Please wait...', 'long');
```

### Using Status Bar
```typescript
import { statusBar } from '@/utils/native';

// Change to dark mode
await statusBar.setDark();

// Set custom background
await statusBar.setBackground('#10b981');
```

### Using Share
```typescript
import { share } from '@/utils/native';

// Share content
await share.content({
  title: 'Check this out',
  text: 'Amazing poem!',
  url: 'https://example.com'
});
```

## Platform Detection

All native features automatically detect if the app is running on a native platform and gracefully fallback to web alternatives when in a browser:

```typescript
import { isNative } from '@/utils/native';

if (isNative) {
  // Native-only features
}
```

## Syncing Changes

To sync updates to the Android project after making changes:

```bash
npm run build
npx cap sync android
```

## Building APK

To build a release APK:

```bash
cd android
./gradlew assembleRelease
```

The APK will be available at: `android/app/build/outputs/apk/release/app-release.apk`

## Benefits

With these native integrations, the Poetry Suite app now provides:

1. **Better User Experience**: Native haptic feedback makes interactions feel more responsive
2. **Native Feel**: Status bar and splash screen match the app's design
3. **Proper Notifications**: Native toasts integrate seamlessly with Android
4. **Enhanced Control**: Better keyboard and back button handling
5. **Native Sharing**: Easy content sharing using Android's native dialogs
6. **Performance**: Native features perform better than web alternatives
7. **Professional Polish**: The app feels like a true native Android application

## Next Steps

Consider adding:
- App icon and splash screen customization
- Push notifications with `@capacitor/push-notifications`
- Native camera integration with `@capacitor/camera`
- File system access with `@capacitor/filesystem`
- Network detection with `@capacitor/network`
