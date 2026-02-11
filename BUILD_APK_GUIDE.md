# Poetry Suite - APK Build Guide

This guide will help you build the Android APK for Poetry Suite.

## Prerequisites

Before building the APK, ensure you have:

1. **Java Development Kit (JDK)**
   - Required: JDK 17 or higher
   - Download from: https://adoptium.net/
   - Verify installation: `java -version`

2. **Android Studio** (Recommended) or **Android SDK Command-line Tools**
   - Download from: https://developer.android.com/studio
   - SDK must include:
     - Android SDK Platform 34
     - Android SDK Build-Tools 34.0.0
     - Android SDK Platform-Tools

3. **Node.js and npm**
   - Already installed (used for web build)

## Build Steps

### Option 1: Quick Build (Debug APK)

For testing purposes, build a debug APK:

```bash
# 1. Build the web app
npm run build

# 2. Sync with Android
npx cap sync android

# 3. Build debug APK
cd android
./gradlew assembleDebug
cd ..
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Release Build (Production APK)

For production/distribution, you need to sign the APK:

#### Step 1: Generate a Signing Key

```bash
# Generate a keystore (one-time setup)
keytool -genkey -v -keystore poetry-suite-release-key.keystore \
  -alias poetry-suite -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password (SAVE THIS!)
# - Key password (SAVE THIS!)
# - Your name/organization details
```

**IMPORTANT:** Keep your keystore file and passwords secure! You'll need them for all future updates.

#### Step 2: Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=poetry-suite
storeFile=../poetry-suite-release-key.keystore
```

Add to `.gitignore`:
```
android/key.properties
poetry-suite-release-key.keystore
```

#### Step 3: Update build.gradle

The release configuration is already set up in `android/app/build.gradle`.

#### Step 4: Build Release APK

```bash
# 1. Ensure latest web build
npm run build

# 2. Sync with Android
npx cap sync android

# 3. Build release APK
cd android
./gradlew assembleRelease
cd ..
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Option 3: Build with Android Studio

1. Open Android Studio
2. Open project: `File > Open` → Select the `android` folder
3. Wait for Gradle sync to complete
4. Build:
   - Debug: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - Release: `Build > Generate Signed Bundle / APK`

## NPM Scripts

Convenient build commands are available:

```bash
# Build debug APK
npm run build:apk-debug

# Build release APK (requires signing setup)
npm run build:apk

# Full package process (build web + sync + build APK)
npm run package
```

## Version Information

- **App Version:** QPR 1 Beta 2
- **Version Code:** 75002
- **Package Name:** com.poetrysuite.app
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 34 (Android 14)

## Testing the APK

### Install on Device via USB

```bash
# Enable USB debugging on your Android device
# Connect device via USB

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or for release
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Install on Device Directly

1. Transfer the APK file to your Android device
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Follow the installation prompts

## Troubleshooting

### "JAVA_HOME is not set"

Set the JAVA_HOME environment variable:

**macOS/Linux:**
```bash
export JAVA_HOME=$(/usr/libexec/java_home)  # macOS
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk  # Linux
```

**Windows:**
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

### "SDK location not found"

Create `android/local.properties`:

```properties
sdk.dir=/path/to/Android/sdk
```

Common SDK locations:
- macOS: `/Users/USERNAME/Library/Android/sdk`
- Linux: `/home/USERNAME/Android/sdk`
- Windows: `C:\Users\USERNAME\AppData\Local\Android\sdk`

### Build Fails with "Gradle version" Error

Update Gradle wrapper:

```bash
cd android
./gradlew wrapper --gradle-version=8.11.1
cd ..
```

### App Crashes on Launch

Check logs:
```bash
adb logcat | grep PoetySuite
```

Common issues:
- Missing environment variables (Firebase, Supabase)
- Network permissions
- Storage permissions

## Preparing for Google Play Store

For Play Store distribution, you need an **Android App Bundle (AAB)** instead of APK:

```bash
cd android
./gradlew bundleRelease
cd ..
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### Play Store Requirements

1. **Signing:** Must be signed with your release key
2. **Version:** Increment versionCode for each release
3. **Target API:** Must target latest Android API (currently 34)
4. **Privacy Policy:** Required if app collects user data
5. **App Icon:** 512x512 PNG for Play Store listing

## Environment Variables

Ensure these are set in your `.env` file (copied to Android via Capacitor):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project
```

## Next Steps

1. **Test Thoroughly:** Test all features on real devices
2. **Performance:** Run through different Android versions
3. **Beta Testing:** Use Google Play Internal Testing
4. **Production:** Upload AAB to Play Store
5. **Monitor:** Check crash reports and user feedback

## Support

For issues:
- Check Android Studio Build Output
- Review Capacitor logs: `npx cap doctor`
- Check device logs: `adb logcat`

---

**Note:** First build may take 10-15 minutes as Gradle downloads dependencies.
