#!/bin/bash

# TWA Packaging Helper Script for Poetry Suite
# This script guides you through packaging the app as an Android TWA

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not installed"
        exit 1
    fi

    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm not installed"
        exit 1
    fi

    # Check if Bubblewrap is in package.json
    if grep -q "@bubblewrap/cli" package.json; then
        print_success "Bubblewrap CLI is in dependencies"
    else
        print_error "Bubblewrap CLI not found in package.json"
        exit 1
    fi

    # Check if icons exist
    if [ -f "public/icon-512.png" ] && [ -f "public/icon-192.png" ]; then
        print_success "PNG icons found"
    else
        print_error "PNG icons not found. Run: ./scripts/generate-pwa-icons.sh"
        exit 1
    fi

    # Check if maskable icons exist
    if [ -f "public/icon-512-maskable.png" ]; then
        print_success "Maskable icons found"
    else
        print_warning "Maskable icons not found (optional but recommended)"
    fi
}

# Check domain configuration
check_domain() {
    print_header "Domain Configuration"

    DOMAIN=$(grep -o '"host": "[^"]*"' .bubblewrap/twa-manifest.json | cut -d'"' -f4)

    if [ "$DOMAIN" = "your-domain.com" ]; then
        print_error "Domain not configured in .bubblewrap/twa-manifest.json"
        echo ""
        read -p "Enter your production domain (e.g., poetrysuite.app): " USER_DOMAIN

        if [ -z "$USER_DOMAIN" ]; then
            print_error "Domain cannot be empty"
            exit 1
        fi

        # Update domain in twa-manifest.json
        sed -i.bak "s/your-domain.com/$USER_DOMAIN/g" .bubblewrap/twa-manifest.json
        print_success "Updated domain to: $USER_DOMAIN"
        DOMAIN=$USER_DOMAIN
    else
        print_success "Domain configured: $DOMAIN"
    fi

    # Test if domain is accessible
    print_info "Testing domain accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
        print_success "Domain is accessible"
    else
        print_warning "Could not verify domain accessibility. Make sure your PWA is deployed to: https://$DOMAIN"
    fi
}

# Check/generate keystore
check_keystore() {
    print_header "Android Keystore"

    if [ -f "android.keystore" ]; then
        print_success "Keystore found: android.keystore"

        # Get SHA-256 fingerprint
        print_info "SHA-256 Fingerprint (needed for assetlinks.json):"
        echo ""
        keytool -list -v -keystore android.keystore -alias poetrysuite 2>/dev/null | grep "SHA256:" || true
        echo ""
        print_warning "Make sure this fingerprint is in public/.well-known/assetlinks.json"
    else
        print_warning "No keystore found"
        echo ""
        read -p "Generate a new keystore? (y/n): " GENERATE_KEY

        if [ "$GENERATE_KEY" = "y" ] || [ "$GENERATE_KEY" = "Y" ]; then
            print_info "Generating keystore..."
            keytool -genkey -v -keystore android.keystore \
                -alias poetrysuite \
                -keyalg RSA \
                -keysize 2048 \
                -validity 10000

            if [ -f "android.keystore" ]; then
                print_success "Keystore generated successfully"

                # Get SHA-256 fingerprint
                print_info "SHA-256 Fingerprint (save this for assetlinks.json):"
                echo ""
                keytool -list -v -keystore android.keystore -alias poetrysuite 2>/dev/null | grep "SHA256:"
                echo ""
                print_warning "Update public/.well-known/assetlinks.json with this fingerprint"
            else
                print_error "Failed to generate keystore"
                exit 1
            fi
        else
            print_error "Keystore is required to build the TWA"
            exit 1
        fi
    fi
}

# Build production PWA
build_pwa() {
    print_header "Building Production PWA"

    print_info "Running: npm run build"
    npm run build

    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        print_success "PWA built successfully"

        # Check if assetlinks.json is in build
        if [ -f "dist/.well-known/assetlinks.json" ]; then
            print_success "Asset links file included in build"
        else
            print_warning "Asset links file not found in dist/"
        fi

        # Check manifest
        if [ -f "dist/manifest.json" ]; then
            print_success "Manifest file included in build"
        else
            print_error "Manifest file not found in dist/"
        fi
    else
        print_error "Build failed"
        exit 1
    fi
}

# Build TWA
build_twa() {
    print_header "Building TWA/Android App"

    print_info "This will build both APK (for testing) and AAB (for Play Store)"
    print_warning "You will be prompted for your keystore password"
    echo ""
    read -p "Continue? (y/n): " CONTINUE_BUILD

    if [ "$CONTINUE_BUILD" != "y" ] && [ "$CONTINUE_BUILD" != "Y" ]; then
        print_info "Build cancelled"
        exit 0
    fi

    cd .bubblewrap

    # Check if this is first time (need to init)
    if [ ! -f "twa-manifest.json.bak" ]; then
        print_info "This appears to be the first build"
        DOMAIN=$(grep -o '"host": "[^"]*"' twa-manifest.json | cut -d'"' -f4)
        print_info "Initializing Bubblewrap with manifest from: https://$DOMAIN/manifest.json"

        # Note: We won't actually run init because we already have a pre-configured manifest
        # The user can run it manually if needed
        print_info "Using pre-configured TWA manifest"
    fi

    print_info "Building TWA... (this may take several minutes)"
    npx @bubblewrap/cli build

    if [ -f "app-release-signed.apk" ] || [ -f "build/outputs/apk/release/app-release-signed.apk" ]; then
        print_success "APK built successfully!"

        # Find and show APK location
        APK_PATH=$(find . -name "app-release-signed.apk" 2>/dev/null | head -1)
        if [ -n "$APK_PATH" ]; then
            print_info "APK location: .bubblewrap/$APK_PATH"
        fi

        # Find and show AAB location
        AAB_PATH=$(find . -name "*.aab" 2>/dev/null | head -1)
        if [ -n "$AAB_PATH" ]; then
            print_info "AAB location: .bubblewrap/$AAB_PATH"
            print_success "Use the AAB file to upload to Google Play Store"
        fi
    else
        print_error "Build failed or output not found"
        cd ..
        exit 1
    fi

    cd ..
}

# Install on device
install_on_device() {
    print_header "Install on Device"

    echo ""
    read -p "Install APK on connected Android device? (y/n): " INSTALL

    if [ "$INSTALL" = "y" ] || [ "$INSTALL" = "Y" ]; then
        # Check if adb is available
        if ! command -v adb &> /dev/null; then
            print_error "adb not found. Install Android Platform Tools"
            print_info "Download from: https://developer.android.com/studio/releases/platform-tools"
            return
        fi

        # Check for connected devices
        DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)

        if [ "$DEVICES" -eq 0 ]; then
            print_error "No Android devices connected"
            print_info "Connect a device via USB and enable USB debugging"
            return
        fi

        print_success "Found $DEVICES connected device(s)"

        # Find APK
        APK_PATH=$(find .bubblewrap -name "app-release-signed.apk" 2>/dev/null | head -1)

        if [ -z "$APK_PATH" ]; then
            print_error "APK not found. Build the TWA first."
            return
        fi

        print_info "Installing: $APK_PATH"
        adb install -r "$APK_PATH"

        if [ $? -eq 0 ]; then
            print_success "App installed successfully!"
            print_info "Open 'Poetry Suite' on your device to test"
        else
            print_error "Installation failed"
        fi
    fi
}

# Main menu
show_summary() {
    print_header "Build Summary"

    print_success "All checks passed!"
    echo ""
    print_info "Next steps:"
    echo "  1. Deploy the 'dist/' folder to your production domain"
    echo "  2. Verify https://your-domain.com/manifest.json is accessible"
    echo "  3. Verify https://your-domain.com/.well-known/assetlinks.json is accessible"
    echo "  4. Test the APK on an Android device"
    echo "  5. Upload the AAB file to Google Play Console"
    echo ""

    # Find build artifacts
    APK_PATH=$(find .bubblewrap -name "app-release-signed.apk" 2>/dev/null | head -1)
    AAB_PATH=$(find .bubblewrap -name "*.aab" 2>/dev/null | head -1)

    if [ -n "$APK_PATH" ]; then
        print_info "APK (for testing): $APK_PATH"
    fi

    if [ -n "$AAB_PATH" ]; then
        print_info "AAB (for Play Store): $AAB_PATH"
    fi

    echo ""
    print_info "For detailed instructions, see: TWA_PACKAGING_GUIDE.md"
}

# Main execution
main() {
    clear
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║         Poetry Suite - TWA Packaging Helper              ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_prerequisites
    check_domain
    check_keystore
    build_pwa
    build_twa
    install_on_device
    show_summary
}

# Run main function
main
