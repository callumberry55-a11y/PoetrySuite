# Bubblewrap TWA Setup Guide

## Overview

Bubblewrap is a tool that helps you generate Android apps (APK/AAB) from Progressive Web Apps using Trusted Web Activities (TWA). This allows your PWA to run as a native Android app.

## What is a Trusted Web Activity?

A Trusted Web Activity (TWA) is a way to open your web app content in a full-screen Android activity. It uses Chrome Custom Tabs under the hood, providing:

- Full-screen display without browser UI
- Shared cookies and storage with Chrome
- Automatic updates (updates to your web app are instantly available)
- Access to web features and APIs
- Play Store distribution

## Prerequisites

Before building your TWA app, you need:

### 1. Java Development Kit (JDK) 17 or higher

**Check if Java is installed:**
```bash
java -version
```

**Install JDK:**
- **Ubuntu/Debian:**
  ```bash
  sudo apt-get update
  sudo apt-get install openjdk-17-jdk
  ```

- **macOS:**
  ```bash
  brew install openjdk@17
  ```

- **Windows:**
  Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [Adoptium](https://adoptium.net/)

### 2. Android SDK (optional, Bubblewrap can install it)

Bubblewrap can install the Android SDK automatically, or you can use an existing Android Studio installation.

### 3. ImageMagick (for icon generation)

**Install ImageMagick:**
- **Ubuntu/Debian:**
  ```bash
  sudo apt-get install imagemagick
  ```

- **macOS:**
  ```bash
  brew install imagemagick
  ```

- **Windows:**
  Download from [ImageMagick website](https://imagemagick.org/script/download.php)

## Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install `@bubblewrap/cli` as a dev dependency.

### Step 2: Generate PNG Icons

TWA apps require PNG icons (SVG is not supported). Generate them from your existing SVG icons:

```bash
chmod +x scripts/generate-pwa-icons.sh
./scripts/generate-pwa-icons.sh
```

This creates:
- `public/icon-192.png`
- `public/icon-512.png`
- `public/icon-192-maskable.png` (with safe zone for maskable icons)
- `public/icon-512-maskable.png` (with safe zone for maskable icons)

### Step 3: Update Configuration

Edit `.bubblewrap/twa-manifest.json` and update the following:

```json
{
  "packageId": "com.yourcompany.yourapp",
  "host": "your-domain.com",
  "name": "Your App Name",
  "launcherName": "App Name"
}
```

**Important fields:**
- `packageId`: Your Android app package ID (must be unique, reverse domain notation)
- `host`: Your production domain (must be HTTPS)
- `name`: Full app name
- `launcherName`: Short name shown under the app icon

### Step 4: Build Your PWA

Before creating the TWA, build your production PWA:

```bash
npm run build
```

### Step 5: Deploy Your PWA

Deploy your PWA to your production domain. The domain must:
- Use HTTPS
- Serve a valid `manifest.json`
- Have the icons accessible
- Pass PWA requirements

You can validate your PWA at: https://www.pwabuilder.com/

### Step 6: Initialize Bubblewrap

Initialize the Bubblewrap project with your production URL:

```bash
npm run twa:init
```

Or manually:
```bash
npx @bubblewrap/cli init --manifest=https://your-domain.com/manifest.json
```

This will:
1. Download your manifest
2. Validate your PWA
3. Create the TWA project structure
4. Generate the initial configuration

**During initialization, you'll be asked:**
- Do you want Bubblewrap to install JDK? (Yes if you don't have JDK 17+)
- Do you want to install Android Build Tools? (Yes if you don't have them)
- Application package ID
- Application name
- Key store location (for signing the app)

### Step 7: Generate Signing Key

For production apps, you need a signing key. Generate one:

```bash
keytool -genkey -v -keystore android.keystore -alias poetrysuite -keyalg RSA -keysize 2048 -validity 10000
```

**Important:**
- Keep your keystore file and passwords secure
- Never commit the keystore to version control
- Add `android.keystore` to `.gitignore`
- Back up your keystore securely

### Step 8: Build the TWA App

Build your signed APK:

```bash
npm run twa:build
```

This generates:
- **Debug APK**: `app-release-unsigned.apk` (for testing)
- **Release APK**: `app-release-signed.apk` (for distribution)

The APK will be in the `twa` directory.

### Step 9: Test the APK

Install the APK on a test device:

```bash
npm run twa:install
```

Or manually:
```bash
adb install app-release-signed.apk
```

## Validation

Before publishing, validate your TWA configuration:

```bash
npm run twa:validate
```

This checks:
- Digital Asset Links verification
- Manifest validity
- Icon requirements
- TWA configuration

## Digital Asset Links

For your TWA to work properly, you must set up Digital Asset Links. This proves you own both the website and the Android app.

### Step 1: Get Your App's SHA-256 Fingerprint

```bash
keytool -list -v -keystore android.keystore -alias poetrysuite
```

Copy the SHA-256 fingerprint.

### Step 2: Create assetlinks.json

Create `public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.poetrysuite.app",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

Replace `YOUR_SHA256_FINGERPRINT_HERE` with your actual SHA-256 fingerprint (include colons).

### Step 3: Deploy assetlinks.json

Deploy this file so it's accessible at:
```
https://your-domain.com/.well-known/assetlinks.json
```

### Step 4: Verify Digital Asset Links

Test your configuration:
```bash
curl https://your-domain.com/.well-known/assetlinks.json
```

Or use Google's validation tool:
https://developers.google.com/digital-asset-links/tools/generator

## Updating Your TWA

When you update your PWA, the TWA will automatically show the new version (no app update needed). However, if you need to update the TWA configuration or Android version:

```bash
npm run twa:update
```

Then rebuild:
```bash
npm run twa:build
```

## Publishing to Google Play Store

### Step 1: Create a Google Play Developer Account

Sign up at: https://play.google.com/console/signup

Cost: $25 one-time registration fee

### Step 2: Prepare Your App Listing

You'll need:
- App description (short and long)
- Screenshots (phone, tablet, optionally TV)
- Feature graphic (1024x500px)
- App icon (512x512px)
- Privacy policy URL
- Content rating questionnaire

### Step 3: Build Release Bundle

For Play Store, build an Android App Bundle (AAB):

```bash
npx @bubblewrap/cli build --appBundleId=com.yourcompany.yourapp
```

### Step 4: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Complete all required sections
4. Upload your AAB file
5. Submit for review

## Troubleshooting

### JDK Not Found

Ensure JDK 17 or higher is installed and in your PATH:
```bash
java -version
```

### Android SDK Not Found

Let Bubblewrap install it automatically, or set `ANDROID_HOME`:
```bash
export ANDROID_HOME=/path/to/android-sdk
```

### Signing Failed

Ensure your keystore path and alias are correct in `.bubblewrap/twa-manifest.json`.

### Digital Asset Links Not Working

- Verify the file is accessible at `https://your-domain.com/.well-known/assetlinks.json`
- Check that the SHA-256 fingerprint matches your keystore
- Ensure your domain uses HTTPS
- Clear Chrome cache and test again

### PWA Validation Failed

Your PWA must meet minimum requirements:
- Served over HTTPS
- Has a valid manifest.json
- Has a service worker
- Icons are accessible
- Start URL is valid

Test at: https://www.pwabuilder.com/

## Scripts Reference

Available npm scripts:

- `npm run twa:init` - Initialize Bubblewrap with your PWA
- `npm run twa:build` - Build the signed APK/AAB
- `npm run twa:update` - Update TWA configuration
- `npm run twa:install` - Install APK on connected device
- `npm run twa:validate` - Validate TWA configuration

## Configuration Files

### .bubblewrap/twa-manifest.json

Main TWA configuration file containing:
- Package ID and app name
- Host and start URL
- Theme colors
- Icon paths
- Signing key information
- Android SDK versions
- Feature flags

### android.keystore

Your app signing key. **Never commit this file to version control!**

## Best Practices

1. **Keep Your PWA Updated**: The TWA always shows your latest web app
2. **Test Thoroughly**: Test on multiple devices and Android versions
3. **Monitor Performance**: Use Chrome DevTools and Lighthouse
4. **Handle Offline**: Ensure your PWA works offline
5. **Optimize Icons**: Use maskable icons for better Android integration
6. **Version Bumps**: Increment `appVersionCode` for each Play Store update
7. **Secure Your Keys**: Keep keystores backed up and secure

## Resources

- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [Trusted Web Activities Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)
- [Google Play Console](https://play.google.com/console)

## Support

For issues with Bubblewrap, check:
- [GitHub Issues](https://github.com/GoogleChromeLabs/bubblewrap/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/bubblewrap)
- [Chrome Developers Community](https://developer.chrome.com/community)
