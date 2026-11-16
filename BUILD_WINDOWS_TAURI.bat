@echo off
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD_WINDOWS_TAURI.ps1"
if errorlevel 1 (
 echo.
 echo Build that bai. Xem log trong build-logs\WINDOWS_TAURI_LAST.log
 pause
)
