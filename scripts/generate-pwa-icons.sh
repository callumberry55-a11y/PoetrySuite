#!/bin/bash

# Script to generate PNG icons from SVG for PWA and TWA apps
# Requires ImageMagick to be installed

echo "Generating PWA/TWA PNG icons from SVG..."

# Check if convert (ImageMagick) is available
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Please install ImageMagick:"
    echo "  - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  - macOS: brew install imagemagick"
    echo "  - Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Create PNG icons from SVG
echo "Creating 192x192 icon..."
convert -background none -resize 192x192 public/icon.svg public/icon-192.png

echo "Creating 512x512 icon..."
convert -background none -resize 512x512 public/icon.svg public/icon-512.png

echo "Creating maskable 192x192 icon..."
convert -background none -resize 192x192 -gravity center -extent 192x192 public/icon.svg public/icon-192-maskable.png

echo "Creating maskable 512x512 icon..."
convert -background none -resize 512x512 -gravity center -extent 512x512 public/icon.svg public/icon-512-maskable.png

echo "Icons generated successfully!"
echo ""
echo "Generated files:"
echo "  - public/icon-192.png"
echo "  - public/icon-512.png"
echo "  - public/icon-192-maskable.png"
echo "  - public/icon-512-maskable.png"
