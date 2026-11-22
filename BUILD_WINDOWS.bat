@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Open IPTV Pro Positron v4.23.276 - Windows Build Fix
set "PROJECT=%~dp0"
echo ===========================================================
echo Open IPTV Pro Positron v4.23.276 - BUILD WINDOWS FIX (Setup + Portable)
echo ===========================================================
echo Duong dan project: "%PROJECT%"
echo.
if not exist "%PROJECT%package.json" (
  echo [LOI] Khong tim thay package.json trong thu muc goc.
  echo Hay giai nen ZIP v4.23.276 du, roi chay BUILD_WINDOWS.bat tai thu muc goc.
  echo Khong chay script trong nhanh experiment/native-webview-ffmpeg.
  pause
  exit /b 2
)
if not exist "%PROJECT%scripts\BUILD_WINDOWS_AUTO.ps1" (
  echo [LOI] Thieu scripts\BUILD_WINDOWS_AUTO.ps1
  pause
  exit /b 2
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PROJECT%scripts\BUILD_WINDOWS_AUTO.ps1"
set "EXITCODE=%ERRORLEVEL%"
if not "%EXITCODE%"=="0" (
  echo.
  echo [LOI] Build that bai. Chi tiet o thu muc build-logs.
  pause
  exit /b %EXITCODE%
)
echo.
echo Hoan thanh. Thu muc output: "%PROJECT%dist"
pause
exit /b 0
