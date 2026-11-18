@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\DANG_GITHUB_PUBLIC_WINDOWS.ps1"
pause
