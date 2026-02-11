#!/bin/bash

# TWA Setup Helper Script
# This script helps you set up Trusted Web Activity for your PWA

set -e

echo "========================================="
echo "  Poetry Suite TWA Setup Helper"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Java
echo "Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        echo -e "${GREEN}✓ Java $JAVA_VERSION is installed${NC}"
    else
        echo -e "${YELLOW}⚠ Java version is less than 17${NC}"
        echo "  Please install JDK 17 or higher"
        echo "  Visit: https://adoptium.net/"
    fi
else
    echo -e "${RED}✗ Java is not installed${NC}"
    echo "  Bubblewrap requires JDK 17 or higher"
    echo "  Visit: https://adoptium.net/"
fi
echo ""

# Check ImageMagick
echo "Checking ImageMagick installation..."
if command -v convert &> /dev/null; then
    echo -e "${GREEN}✓ ImageMagick is installed${NC}"

    # Ask if user wants to generate icons
    read -p "Do you want to generate PNG icons from SVG? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Generating PNG icons..."
        ./scripts/generate-pwa-icons.sh
    fi
else
    echo -e "${YELLOW}⚠ ImageMagick is not installed${NC}"
    echo "  ImageMagick is needed to generate PNG icons from SVG"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
fi
echo ""

# Check if PWA is built
echo "Checking if PWA is built..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ PWA build found${NC}"
else
    echo -e "${YELLOW}⚠ PWA not built yet${NC}"
    echo "  Run: npm run build"

    read -p "Do you want to build the PWA now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Building PWA..."
        npm run build
    fi
fi
echo ""

# Ask for configuration
echo "========================================="
echo "  TWA Configuration"
echo "========================================="
echo ""

read -p "Enter your production domain (e.g., example.com): " DOMAIN
read -p "Enter your app package ID (e.g., com.example.app): " PACKAGE_ID
read -p "Enter your app name: " APP_NAME
read -p "Enter launcher name (short name): " LAUNCHER_NAME

echo ""
echo "Updating TWA configuration..."

# Update twa-manifest.json
if [ -f ".bubblewrap/twa-manifest.json" ]; then
    # Use jq if available, otherwise use sed
    if command -v jq &> /dev/null; then
        jq --arg domain "$DOMAIN" \
           --arg packageId "$PACKAGE_ID" \
           --arg name "$APP_NAME" \
           --arg launcher "$LAUNCHER_NAME" \
           '.host = $domain | .packageId = $packageId | .name = $name | .launcherName = $launcher' \
           .bubblewrap/twa-manifest.json > .bubblewrap/twa-manifest.json.tmp && \
           mv .bubblewrap/twa-manifest.json.tmp .bubblewrap/twa-manifest.json
        echo -e "${GREEN}✓ Configuration updated${NC}"
    else
        echo -e "${YELLOW}⚠ jq not found, please manually edit .bubblewrap/twa-manifest.json${NC}"
    fi
fi
echo ""

# Check if keystore exists
echo "Checking signing key..."
if [ -f "android.keystore" ]; then
    echo -e "${GREEN}✓ Signing keystore found${NC}"
else
    echo -e "${YELLOW}⚠ No signing keystore found${NC}"
    echo ""
    read -p "Do you want to generate a signing key? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Generating signing key..."
        echo "You will be asked for:"
        echo "  1. A password for the keystore"
        echo "  2. Your name and organization details"
        echo "  3. A password for the key alias"
        echo ""
        echo "IMPORTANT: Save these passwords securely!"
        echo ""

        keytool -genkey -v \
                -keystore android.keystore \
                -alias poetrysuite \
                -keyalg RSA \
                -keysize 2048 \
                -validity 10000

        echo -e "${GREEN}✓ Signing key generated${NC}"
        echo ""
        echo "IMPORTANT:"
        echo "  1. Back up android.keystore and your passwords"
        echo "  2. Never commit the keystore to version control"
        echo "  3. You'll need this keystore for all future updates"
    fi
fi
echo ""

# Display next steps
echo "========================================="
echo "  Next Steps"
echo "========================================="
echo ""
echo "1. Deploy your PWA to: https://$DOMAIN"
echo "2. Ensure manifest.json is accessible"
echo "3. Initialize Bubblewrap:"
echo "   npm run twa:init"
echo ""
echo "4. Get your SHA-256 fingerprint:"
echo "   keytool -list -v -keystore android.keystore -alias poetrysuite"
echo ""
echo "5. Update public/.well-known/assetlinks.json with your fingerprint"
echo "6. Deploy assetlinks.json to: https://$DOMAIN/.well-known/assetlinks.json"
echo ""
echo "7. Build your TWA:"
echo "   npm run twa:build"
echo ""
echo "8. Test on device:"
echo "   npm run twa:install"
echo ""
echo "For detailed instructions, see BUBBLEWRAP_SETUP.md"
echo ""
