@echo off
cd /d "%~dp0"
set "PRESTIGE_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "PRESTIGE_NODE=%LOCALAPPDATA%\Programs\GapGPT\resources\bin\node.exe"
if not exist "%PRESTIGE_NODE%" if not "%PRESTIGE_NODE%"=="node" (
  echo Node.js 24 or newer is required. Install from nodejs.org.
  pause
  exit /b 1
)
echo Prestige Gemology - http://127.0.0.1:3000
echo Keep this window open while using the app.
start "" "http://127.0.0.1:3000"
"%PRESTIGE_NODE%" server.mjs
pause
