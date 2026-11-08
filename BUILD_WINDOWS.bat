@echo off
setlocal
cd /d "%~dp0"
echo ==================================
echo OPEN IPTV PRO 4.22.2 FULL - BUILD WINDOWS
echo ==================================
echo Downloads build dependencies into a LOCAL folder only.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\BUILD_WINDOWS_AUTO.ps1"
if errorlevel 1 (
  echo.
  echo Build failed. See the errors above.
  pause
  exit /b 1
)
pause
