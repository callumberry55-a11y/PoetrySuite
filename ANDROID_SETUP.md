# Poetry Suite - Android App Setup & Build

Complete guide for setting up and building the Poetry Suite Android application.

## Quick Start

### Prerequisites

1. **Install Java JDK 17+**
   ```bash
   # Download from: https://adoptium.net/
   # Verify installation:
   java -version
   ```

2. **Install Android Studio** (recommended)
   - Download: https://developer.android.com/studio
   - During installation, ensure SDK is installed
   - Or install Android Command Line Tools only

3. **Install Node.js** (already done)
   ```bash
   node --version  # Should be v16+
   npm --version
   ```

### One-Command Build

#### For macOS/Linux:
```bash
./scripts/build-release-apk.sh
```

#### For Windows:
```cmd
scripts\build-release-apk.bat
```

The script will:
1. Build the web app
2. Sync with Android
3. Guide you through signing setup (if needed)
4. Build the APK

## Manual Setup

### 1. Configure Android SDK

Create `android/local.properties`:

**macOS:**
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

**Linux:**
```properties
sdk.dir=/home/YOUR_USERNAME/Android/sdk
```

**Windows:**
```properties
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\sdk
```

### 2. Generate Release Signing Key

```bash
keytool -genkey -v -keystore poetry-suite-release-key.keystore \
  -alias poetry-suite -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save your passwords securely! You'll need them for all future updates.

### 3. Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=poetry-suite
storeFile=../poetry-suite-release-key.keystore
```

**Security:** This file is already in `.gitignore` - never commit it!

## Building

### Build Commands

```bash
# Build web app
npm run build

# Sync with Android
npx cap sync android

# Build debug APK (for testing)
cd android && ./gradlew assembleDebug && cd ..

# Build release APK (for distribution)
cd android && ./gradlew assembleRelease && cd ..

# Build App Bundle (for Play Store)
cd android && ./gradlew bundleRelease && cd ..
```

### NPM Scripts

```bash
# Debug APK
npm run build:apk-debug

# Release APK
npm run build:apk

# Full package (build + sync + apk)
npm run package
```

## Output Locations

After building, find your files here:

```
android/app/build/outputs/
├── apk/
│   ├── debug/
│   │   └── app-debug.apk
│   └── release/
│       └── app-release.apk
└── bundle/
    └── release/
        └── app-release.aab
```

## Testing

### Install on Device

#### Via USB (ADB)

1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect device via USB
4. Install APK:

```bash
# List connected devices
adb devices

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Or force reinstall
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Uninstall
adb uninstall com.poetrysuite.app
```

#### Direct Installation

1. Transfer APK to device
2. Open APK file on device
3. Allow installation from unknown sources (if prompted)
4. Install

### View Logs

```bash
# View all logs
adb logcat

# Filter for Poetry Suite
adb logcat | grep PoetySuite

# Clear and follow
adb logcat -c && adb logcat | grep -i poetry
```

## Android Studio

### Open Project

1. Launch Android Studio
2. Select "Open an Existing Project"
3. Navigate to and select the `android` folder
4. Wait for Gradle sync

### Build from Android Studio

1. **Select Build Variant:**
   - View → Tool Windows → Build Variants
   - Choose: `debug` or `release`

2. **Build APK:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

3. **Generate Signed APK:**
   - Build → Generate Signed Bundle / APK
   - Select APK
   - Choose keystore (or create new)
   - Enter passwords
   - Select build variant: release
   - Build

### Run on Emulator

1. **Create AVD (Android Virtual Device):**
   - Tools → Device Manager
   - Create Device
   - Select device definition (e.g., Pixel 5)
   - Select system image (API 34 recommended)
   - Finish

2. **Run App:**
   - Select AVD from device dropdown
   - Click Run button (green triangle)

## Capacitor Commands

```bash
# Check environment
npx cap doctor

# Sync (copy web assets + update plugins)
npx cap sync

# Update Capacitor
npx cap update

# Add plugins
npm install @capacitor/[plugin-name]
npx cap sync

# Open in Android Studio
npx cap open android

# Run on device
npx cap run android

# With live reload
npx cap run android -l --external
```

## Configuration

### App Information

**File:** `android/app/build.gradle`

```gradle
android {
    defaultConfig {
        applicationId "com.poetrysuite.app"
        versionCode 75002
        versionName "QPR 1 Beta 2"
        minSdkVersion 22  // Android 5.1+
        targetSdkVersion 34  // Android 14
    }
}
```

### App Name & Icons

**App Name:** `android/app/src/main/res/values/strings.xml`

```xml
<string name="app_name">Poetry Suite</string>
```

**Icons:** Auto-generated from web icons during sync

Custom icons: Place in `android/app/src/main/res/mipmap-[density]/`

### Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

Current permissions:
- INTERNET (for API calls)
- ACCESS_NETWORK_STATE (for online/offline detection)

### Splash Screen

**File:** `capacitor.config.ts`

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#10b981',  // Emerald green
    showSpinner: false
  }
}
```

## Troubleshooting

### Common Issues

#### "JAVA_HOME is not set"

**Fix:**
```bash
# macOS
export JAVA_HOME=$(/usr/libexec/java_home)

# Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

#### "SDK location not found"

**Fix:** Create `android/local.properties` with SDK path (see Setup section)

#### "Build failed: unable to find valid certification path"

**Fix:**
```bash
cd android
./gradlew --stop
./gradlew clean
./gradlew assembleRelease
```

#### "Execution failed for task ':app:mergeReleaseResources'"

**Fix:** Clean and rebuild
```bash
cd android
./gradlew clean
cd ..
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

#### App crashes on startup

**Check:**
1. Environment variables in `.env`
2. Network connectivity
3. Logs: `adb logcat | grep -i error`

### Build Performance

**Speed up builds:**

Create/edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=1024m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.daemon=true
android.enableJetifier=true
android.useAndroidX=true
```

## Version Management

### Increment Version for Release

1. Update `package.json`:
   ```json
   "version": "QPR 1 Beta 3"
   ```

2. Update `android/app/build.gradle`:
   ```gradle
   versionCode 75003  // Increment by 1
   versionName "QPR 1 Beta 3"
   ```

3. Build and test

### Version Code Rules

- Must be an integer
- Must increase with each release
- Cannot be reused
- Recommended format: `[Major][Minor][Patch]`
  - Example: 75002 = 75.0.02

## Play Store Preparation

### 1. Generate App Bundle

```bash
cd android
./gradlew bundleRelease
cd ..
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### 2. Required Assets

- **App Icon:** 512×512 PNG
- **Feature Graphic:** 1024×500 PNG
- **Screenshots:**
  - Phone: At least 2 (1080×1920 recommended)
  - Tablet: At least 1 (if supporting tablets)
- **Privacy Policy:** Required URL

### 3. Store Listing

Prepare:
- Short description (80 chars max)
- Full description (4000 chars max)
- Category: Art & Design or Lifestyle
- Content rating: Complete questionnaire
- Target audience
- Contact email

### 4. Data Safety

Declare:
- Data collected (user accounts, poems, etc.)
- How data is used
- Security measures
- Data sharing practices

### 5. Upload

1. Create app in Play Console
2. Upload AAB file
3. Fill in store listing
4. Set up pricing & distribution
5. Review and publish

## CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/android-build.yml`:

```yaml
name: Android Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install dependencies
        run: npm ci

      - name: Build web app
        run: npm run build

      - name: Sync Capacitor
        run: npx cap sync android

      - name: Build APK
        run: cd android && ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

## Resources

### Documentation

- **Capacitor:** https://capacitorjs.com/docs
- **Android:** https://developer.android.com/docs
- **Play Console:** https://play.google.com/console/

### Tools

- **Android Studio:** https://developer.android.com/studio
- **SDK Manager:** Tools → SDK Manager in Android Studio
- **Device Manager:** Tools → Device Manager in Android Studio

### Commands Reference

```bash
# Capacitor
npx cap --help
npx cap doctor
npx cap ls

# Gradle
cd android
./gradlew tasks
./gradlew --help

# ADB
adb --help
adb devices
adb logcat
adb install <path-to-apk>
```

## Support

For issues:
1. Check error logs: `adb logcat`
2. Run diagnostics: `npx cap doctor`
3. Clean build: `cd android && ./gradlew clean`
4. Review logs: `android/app/build/outputs/logs/`

---

**Ready to build?** Run: `./scripts/build-release-apk.sh`
