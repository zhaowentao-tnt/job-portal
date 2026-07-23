@echo off
chcp 65001 >nul
cd /d %~dp0

echo ============================================
echo   Zhao Wentao Job Site - One-Click Update
echo ============================================
echo.

echo [0/4] Checking proxy (GitHub needs proxy)...
set "HTTP_PROXY=http://127.0.0.1:7892"
set "HTTPS_PROXY=http://127.0.0.1:7892"
curl -sS -m 8 https://github.com >nul 2>&1
if errorlevel 1 (
  echo   ! Cannot reach GitHub. Make sure Clash/VPN proxy is ON (default port 7892).
  echo   ! If your port is different, edit lines 13-14 and change 7892 to your port with Notepad.
  pause
  exit /b 1
)
echo   + Proxy OK, starting update
echo.

echo [1/4] Backup source to GitHub (main branch)...
git add -A
git commit -m "update %date% %time%" >nul 2>&1 && echo   + Changes recorded || echo   + No new changes, skipped
git push origin main >push_log.txt 2>&1
if errorlevel 1 (
  echo   ! Source backup failed. Details:
  echo   ----------------------------------------
  type push_log.txt
  echo   ----------------------------------------
) else (
  echo   + Source backed up
)
echo.

echo [2/4] Building site...
call npm run build >nul 2>&1
if errorlevel 1 (
  echo   ! Build failed, stopped. Make sure Node.js is installed.
  del push_log.txt 2>nul
  pause
  exit /b 1
)
echo   + Build done
echo.

echo [3/4] Publishing to live (gh-pages branch)...
cd dist
rmdir /s /q .git 2>nul
git init -b gh-pages >nul 2>&1
git add -A >nul 2>&1
git commit -m "deploy %date% %time%" >nul 2>&1
git remote remove origin 2>nul
git remote add origin https://github.com/zhaowentao-tnt/job-portal.git
git push --force origin gh-pages >..\push_log.txt 2>&1
if errorlevel 1 (
  echo   ! Live publish failed. Details:
  echo   ----------------------------------------
  type ..\push_log.txt
  echo   ----------------------------------------
  echo   If it says 401 / wrong account, your GitHub Token expired. Regenerate and retry.
) else (
  echo   + Live site updated
)
cd ..
echo.

echo [4/4] Returning to main branch...
git checkout -f main >nul 2>&1
echo.

echo ============================================
echo   Done! Live URL (wait 1-2 min to take effect):
echo   https://zhaowentao-tnt.github.io/job-portal/
echo ============================================
echo.
del push_log.txt 2>nul

pause
