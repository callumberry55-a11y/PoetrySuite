# Android APK Build Guide

## Overview

Poetry Suite now supports building as a native Android application using Capacitor. This guide provides setup instructions and build procedures.

## Prerequisites

### System Requirements
- **Java Development Kit (JDK)**: Java 11 or higher
  ```bash
  java -version
  ```

- **Android SDK**: Android 13 (API level 33) or higher
- **Android Studio**: Latest version (for emulator and debugging)
- **Node.js & npm**: Already installed in your workspace

### Environment Setup

1. **Install Java (if not already installed)**
   ```bash
   apt-get update
   apt-get install default-jdk
   ```

2. **Install Android SDK**
   ```bash
   # Install Android Studio or use command-line tools
   # Download: https://developer.android.com/studio
   ```

3. **Set ANDROID_HOME Environment Variable**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

## Project Structure

```
/workspaces/PoetrySuite/
├── android/                          # Native Android project
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── AndroidManifest.xml   # Permissions & app config
│   │   │       ├── java/
│   │   │       │   └── com/poetrysuite/app/
│   │   │       │       └── MainActivity.java
│   │   │       └── res/
│   │   │           ├── values/
│   │   │           │   ├── colors.xml     # Color definitions
│   │   │           │   └── styles.xml     # Theme styles
│   │   │           ├── drawable/
│   │   │           ├── layout/
│   │   │           ├── mipmap/            # App icons
│   │   │           └── raw/
│   │   ├── build.gradle               # Build configuration
│   │   └── proguard-rules.pro          # Code obfuscation
│   ├── build.gradle
│   └── settings.gradle
├── capacitor.config.ts               # Capacitor configuration
├── package.json                      # Build scripts added
└── dist/                             # Built web app (generated)
```

## Build Commands

### 1. Initial Setup

```bash
# Build the web app
npm run build

# Add Android platform (first time only)
npm run cap:add:android

# Sync web app to native project
npm run cap:sync
```

### 2. Build Debug APK

For development and testing:

```bash
npm run build:apk-debug
```

**Output**: `android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Build Release APK

For production distribution:

```bash
npm run build:apk
```

**Output**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

**Note**: Release APK must be signed before distribution to Google Play or other stores.

### 4. Open in Android Studio

To develop, debug, or make native modifications:

```bash
npm run cap:open:android
```

This opens the `android/` folder in Android Studio.

## Signing a Release APK

To distribute your app on Google Play Store or other platforms, you must sign the APK.

### Step 1: Create a Keystore

```bash
keytool -genkey -v -keystore poetry-suite.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias poetry-suite-key
```

**Keep this file safe!** You'll need it for future updates.

### Step 2: Configure Signing in Gradle

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("/path/to/poetry-suite.keystore")
            storePassword "your-keystore-password"
            keyAlias "poetry-suite-key"
            keyPassword "your-key-password"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 3: Build Signed Release APK

```bash
cd android
./gradlew assembleRelease
```

**Output**: `app/build/outputs/apk/release/app-release.apk`

## App Configuration

### Capacitor Config (`capacitor.config.ts`)

Key settings:

```typescript
{
  appId: 'com.poetrysuite.app',        // Unique app identifier
  appName: 'Poetry Suite',              // Display name
  webDir: 'dist',                       // Web app output directory
  plugins: {
    SplashScreen: {                     // Launch splash screen
      launchAutoHide: true,
      backgroundColor: '#1f2937',
      spinnerColor: '#fbbf24',
    },
    StatusBar: {                        // Status bar styling
      style: 'dark',
      backgroundColor: '#1f2937',
    },
    Keyboard: {                         // Keyboard behavior
      resize: 'native',
      resizeOnFullScreen: true,
    }
  }
}
```

### Permissions (`AndroidManifest.xml`)

Currently configured for:
- ✅ Internet access
- ✅ Storage access (read/write)
- ✅ Camera (future features)
- ✅ Microphone (future features)
- ✅ Push notifications
- ✅ Biometric authentication

To add more permissions, edit `android/app/src/main/AndroidManifest.xml`.

## Native Features

### Accessing Native Plugins

```typescript
import { Plugins } from '@capacitor/core';

const { Camera, Geolocation, Keyboard } = Plugins;

// Example: Take a photo
const image = await Camera.getPhoto({
  quality: 100,
  allowEditing: true,
  resultType: CameraResultType.Uri,
});
```

### Available Plugins
- **Camera**: Photo capture
- **Geolocation**: Location services
- **Keyboard**: Keyboard management
- **Storage**: Persistent data
- **App**: App lifecycle
- **Share**: Share content
- **Haptics**: Vibration feedback
- **Dialog**: Native dialogs

## Android Studio Development

To work on native Android features:

1. Open the Android project:
   ```bash
   npm run cap:open:android
   ```

2. Configure your emulator or connect a device

3. Select your target and click **Run** (▶️)

4. Android Studio will build and launch the app

## Testing on Device

### Connect Physical Device

1. Enable Developer Mode on your Android device
   - Settings → About → Build Number (tap 7 times)
   - Settings → Developer Options → Enable USB Debugging

2. Connect via USB cable

3. In Android Studio, select your device from the device dropdown

4. Click **Run** (▶️)

### Emulator

1. Open Android Studio
2. AVD Manager → Create Virtual Device
3. Select API level 33 or higher
4. Run the virtual device
5. Click **Run** in Android Studio

## Debugging

### View Logs
```bash
adb logcat
```

### Filter by App
```bash
adb logcat | grep poetry-suite
```

### Clear Logs
```bash
adb logcat -c
```

## Common Issues

### Issue: Android SDK not found
**Solution**: Set `ANDROID_HOME` environment variable
```bash
export ANDROID_HOME=$HOME/Android/Sdk
```

### Issue: Build fails with Gradle error
**Solution**: Update Gradle
```bash
cd android
./gradlew wrapper --gradle-version latest
```

### Issue: App crashes on startup
**Solution**: Check logs with `adb logcat` and ensure `capacitor.config.ts` webDir points to correct build output

### Issue: Changes not reflecting in app
**Solution**: Sync again
```bash
npm run build
npm run cap:sync
```

## Distribution

### Google Play Store

1. **Create Signed APK**
   - Follow "Signing a Release APK" section

2. **Create Google Play Developer Account**
   - Visit: https://play.google.com/console

3. **Create App Listing**
   - App name, description, screenshots, etc.

4. **Upload APK**
   - Internal Testing → Upload APK
   - Then promote to Closed Testing → Open Testing → Production

5. **Review and Publish**
   - Wait for app review (24-48 hours typically)
   - Once approved, app becomes available on Play Store

### Direct Distribution
- Email APK to users
- Host on your website
- Use beta testing platforms (TestFlight, Firebase TestLab)

## Version Management

To update the app version:

1. Update `package.json`:
   ```json
   "version": "75.0.2"
   ```

2. Update `android/app/build.gradle`:
   ```gradle
   versionCode 76           // Increment by 1
   versionName "75.0.2"     // Match package.json
   ```

3. Rebuild APK

## Capacitor Updates

To update Capacitor and plugins:

```bash
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest
npm run cap:update
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/docs)
- [Google Play Store Guide](https://support.google.com/googleplay/android-developer)
- [Ionic Framework](https://ionicframework.com/docs/v7/react)

## Native Plugin Development

To create custom native plugins:

```bash
# Generate plugin template
npm install -g @capacitor/create-plugin
npx create-capacitor-plugin@latest
```

For detailed guide: [Building Capacitor Plugins](https://capacitorjs.com/docs/plugins/creating-plugins)

## Performance Tips

1. **Optimize bundle size**
   ```bash
   npm run build -- --minify
   ```

2. **Use lazy loading** for routes and components

3. **Implement proper caching** in app (already done)

4. **Use native modules** for heavy computations

5. **Profile performance**
   ```bash
   adb shell am trace-ipc start
   adb shell am trace-ipc stop
   ```

## Security Best Practices

✅ **Already Implemented**
- Input validation
- Secure authentication (Supabase)
- HTTPS enforcement
- Secure storage of tokens

📝 **To Implement**
- Certificate pinning for API calls
- Jailbreak/root detection
- Secure enclave for sensitive data
- ProGuard obfuscation

## Troubleshooting Checklist

- [ ] Java 11+ installed: `java -version`
- [ ] Android SDK available: `$ANDROID_HOME` set
- [ ] npm packages installed: `npm install`
- [ ] Web build successful: `npm run build` (check `dist/` exists)
- [ ] Capacitor synced: `npm run cap:sync`
- [ ] AndroidManifest.xml has required permissions
- [ ] capacitor.config.ts has correct `appId`
- [ ] Gradle build files are valid (no syntax errors)

## Support

For issues or questions:
1. Check Capacitor docs: https://capacitorjs.com/docs
2. Search Android Studio error logs
3. Review adb logcat output
4. Check Capacitor GitHub issues

---

**Version**: 75.0.1  
**Last Updated**: January 13, 2026
