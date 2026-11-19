@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo === Open IPTV Pro Mobile 4.21.1 - Android DEBUG APK ===
where node >nul 2>&1
if errorlevel 1 (echo [ERROR] Chua cai Node.js 22+. https://nodejs.org & exit /b 1)
where java >nul 2>&1
if errorlevel 1 (
  if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    set "PATH=C:\Program Files\Android\Android Studio\jbr\bin;%PATH%"
  ) else (echo [ERROR] Can Android Studio co JDK 21. & exit /b 1)
)
if not defined ANDROID_HOME set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not defined ANDROID_SDK_ROOT set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
if not exist "%ANDROID_HOME%\platforms" (echo [ERROR] Android SDK chua cai. Mo Android Studio SDK Manager. & exit /b 1)
call npm install --no-audit --no-fund
if errorlevel 1 exit /b 1
call npm test
if errorlevel 1 exit /b 1
call npm run build
if errorlevel 1 exit /b 1
if not exist android call npx cap add android
if errorlevel 1 exit /b 1
call npx cap sync android
if errorlevel 1 exit /b 1
node scripts\patch-native.mjs
if errorlevel 1 exit /b 1
cd android
call gradlew.bat --no-daemon --max-workers=4 assembleDebug
if errorlevel 1 exit /b 1
if not exist app\build\outputs\apk\debug\app-debug.apk (echo [ERROR] Khong tim thay APK & exit /b 1)
copy /y "app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Downloads\OpenIPTVPro-Mobile-4.21.1-debug.apk" >nul
if errorlevel 1 exit /b 1
echo [SUCCESS] %USERPROFILE%\Downloads\OpenIPTVPro-Mobile-4.21.1-debug.apk
endlocal
