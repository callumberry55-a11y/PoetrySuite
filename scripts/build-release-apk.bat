@echo off
REM Poetry Suite - Release APK Build Script (Windows)

echo.
echo Poetry Suite - Release APK Build
echo ====================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java is not installed
    echo Please install JDK 17 or higher from https://adoptium.net/
    pause
    exit /b 1
)

echo [OK] Java found
java -version 2>&1 | findstr "version"
echo.

REM Check for Android SDK configuration
if not exist "android\local.properties" (
    echo [WARNING] Android SDK not configured
    echo.
    echo Creating android\local.properties...

    set SDK_PATH=%LOCALAPPDATA%\Android\sdk
    if exist "%SDK_PATH%" (
        echo sdk.dir=%SDK_PATH:\=\\%> android\local.properties
        echo [OK] SDK configured
    ) else (
        echo [ERROR] Could not find Android SDK
        echo Please install Android Studio or create android\local.properties manually
        pause
        exit /b 1
    )
)

echo.

REM Check for signing configuration
if not exist "android\key.properties" (
    echo [WARNING] No release signing key found
    echo.
    echo Building debug APK for testing...
    set BUILD_TYPE=debug
) else (
    echo [OK] Release signing configured
    set BUILD_TYPE=release
)

echo.
echo =====================================
echo Step 1: Building web app...
echo =====================================
call npm run build
if errorlevel 1 (
    echo [ERROR] Web build failed
    pause
    exit /b 1
)

echo.
echo =====================================
echo Step 2: Syncing with Capacitor...
echo =====================================
call npx cap sync android
if errorlevel 1 (
    echo [ERROR] Capacitor sync failed
    pause
    exit /b 1
)

echo.
echo =====================================
echo Step 3: Building Android APK...
echo =====================================

cd android

if "%BUILD_TYPE%"=="release" (
    call gradlew.bat assembleRelease
    set APK_PATH=app\build\outputs\apk\release\app-release.apk
) else (
    call gradlew.bat assembleDebug
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
)

if errorlevel 1 (
    cd ..
    echo [ERROR] Android build failed
    pause
    exit /b 1
)

cd ..

echo.
echo =====================================
echo [SUCCESS] Build Complete!
echo =====================================
echo.
echo APK Location: android\%APK_PATH%
echo.
echo App Details:
echo - Name: Poetry Suite
echo - Package: com.poetrysuite.app
echo - Version: QPR 1 Beta 2
echo - Version Code: 75002
echo.
echo Next Steps:
echo 1. Test the APK on a device:
echo    adb install android\%APK_PATH%
echo.
echo 2. Or transfer to device and install manually
echo.

if "%BUILD_TYPE%"=="release" (
    echo 3. For Play Store, build an App Bundle:
    echo    cd android ^&^& gradlew bundleRelease
    echo.
    echo    Bundle location: android\app\build\outputs\bundle\release\app-release.aab
    echo.
)

echo Done!
echo.
pause
