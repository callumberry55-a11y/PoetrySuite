#!/bin/bash

# Poetry Suite - Release APK Build Script
# This script automates the process of building a release APK

set -e

echo "🚀 Poetry Suite - Release APK Build"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed${NC}"
    echo "Please install JDK 17 or higher from https://adoptium.net/"
    exit 1
fi

echo -e "${GREEN}✓ Java found:${NC} $(java -version 2>&1 | head -n 1)"
echo ""

# Check if Android SDK is configured
if [ ! -f "android/local.properties" ]; then
    echo -e "${YELLOW}⚠ Android SDK not configured${NC}"
    echo "Creating android/local.properties..."

    # Try to detect SDK location
    if [ -d "$HOME/Library/Android/sdk" ]; then
        # macOS
        echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
        echo -e "${GREEN}✓ SDK configured (macOS)${NC}"
    elif [ -d "$HOME/Android/Sdk" ]; then
        # Linux
        echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
        echo -e "${GREEN}✓ SDK configured (Linux)${NC}"
    elif [ -d "/c/Users/$USER/AppData/Local/Android/sdk" ]; then
        # Windows (Git Bash)
        echo "sdk.dir=C:\\\\Users\\\\$USER\\\\AppData\\\\Local\\\\Android\\\\sdk" > android/local.properties
        echo -e "${GREEN}✓ SDK configured (Windows)${NC}"
    else
        echo -e "${RED}❌ Could not find Android SDK${NC}"
        echo "Please install Android Studio or set SDK path manually in android/local.properties"
        exit 1
    fi
fi

echo ""

# Check for signing configuration
if [ ! -f "android/key.properties" ]; then
    echo -e "${YELLOW}⚠ No release signing key found${NC}"
    echo ""
    echo "Options:"
    echo "1. Build unsigned debug APK (for testing)"
    echo "2. Set up release signing (recommended for production)"
    echo "3. Exit"
    echo ""
    read -p "Choose option (1/2/3): " choice

    case $choice in
        1)
            BUILD_TYPE="debug"
            echo -e "${GREEN}Building debug APK...${NC}"
            ;;
        2)
            echo ""
            echo "Setting up release signing..."
            echo ""

            # Check if keystore exists
            if [ ! -f "poetry-suite-release-key.keystore" ]; then
                echo "Generating release keystore..."
                echo "You'll be prompted for passwords and details."
                echo -e "${YELLOW}IMPORTANT: Save your passwords securely!${NC}"
                echo ""

                keytool -genkey -v -keystore poetry-suite-release-key.keystore \
                    -alias poetry-suite -keyalg RSA -keysize 2048 -validity 10000

                echo ""
                echo -e "${GREEN}✓ Keystore generated${NC}"
            fi

            # Create key.properties
            echo ""
            echo "Enter your keystore password:"
            read -s STORE_PASSWORD
            echo ""
            echo "Enter your key password:"
            read -s KEY_PASSWORD
            echo ""

            cat > android/key.properties << EOF
storePassword=$STORE_PASSWORD
keyPassword=$KEY_PASSWORD
keyAlias=poetry-suite
storeFile=../poetry-suite-release-key.keystore
EOF

            echo -e "${GREEN}✓ Signing configuration created${NC}"
            BUILD_TYPE="release"
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
else
    BUILD_TYPE="release"
    echo -e "${GREEN}✓ Release signing configured${NC}"
fi

echo ""
echo "====================================="
echo "Step 1: Building web app..."
echo "====================================="
npm run build

echo ""
echo "====================================="
echo "Step 2: Syncing with Capacitor..."
echo "====================================="
npx cap sync android

echo ""
echo "====================================="
echo "Step 3: Building Android APK..."
echo "====================================="

cd android

if [ "$BUILD_TYPE" = "release" ]; then
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

echo ""
echo "====================================="
echo -e "${GREEN}✓ Build Complete!${NC}"
echo "====================================="
echo ""
echo "APK Location: android/$APK_PATH"
echo ""

# Get APK size
APK_SIZE=$(du -h "android/$APK_PATH" | cut -f1)
echo "APK Size: $APK_SIZE"
echo ""

# Get APK info
echo "App Details:"
echo "- Name: Poetry Suite"
echo "- Package: com.poetrysuite.app"
echo "- Version: QPR 1 Beta 2"
echo "- Version Code: 75002"
echo ""

echo "Next Steps:"
echo "1. Test the APK on a device:"
echo "   adb install android/$APK_PATH"
echo ""
echo "2. Or transfer to device and install manually"
echo ""

if [ "$BUILD_TYPE" = "release" ]; then
    echo "3. For Play Store, build an App Bundle:"
    echo "   cd android && ./gradlew bundleRelease"
    echo ""
    echo "   Bundle will be at: android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
fi

echo -e "${GREEN}🎉 Done!${NC}"
