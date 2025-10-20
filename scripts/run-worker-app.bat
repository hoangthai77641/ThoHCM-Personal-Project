@echo off
echo 🚀 Starting ThoHCM Worker App Development Setup...
echo.

echo 📱 Checking Flutter installation...
flutter --version
if %errorlevel% neq 0 (
    echo ❌ Flutter not found! Please install Flutter first.
    pause
    exit /b 1
)

echo.
echo 🔧 Getting Flutter dependencies...
cd mobile\worker_app
flutter pub get
if %errorlevel% neq 0 (
    echo ❌ Failed to get dependencies!
    pause
    exit /b 1
)

echo.
echo 📋 Checking available devices...
flutter devices

echo.
echo 🎯 Building and running on Android emulator...
echo API Base URL: https://thohcm-application-475603.as.r.appspot.com
echo.

flutter run --debug
if %errorlevel% neq 0 (
    echo ❌ Failed to run app!
    pause
    exit /b 1
)

pause