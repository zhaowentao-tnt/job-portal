@echo off
chcp 65001 >nul
cd /d %~dp0

echo ============================================
echo   赵文涛求职网站 - 一键更新
echo ============================================
echo.

echo [0/4] 检查网络代理 (GitHub 需代理访问)...
REM 以下代理地址取自本机环境 (Clash/类似工具的默认端口)。
REM 若你的代理端口不同，请把 7892 改成你的实际端口；若不用代理请删掉这两行。
set "HTTP_PROXY=http://127.0.0.1:7892"
set "HTTPS_PROXY=http://127.0.0.1:7892"
curl -sS -m 8 https://github.com >nul 2>&1
if errorlevel 1 (
  echo   ! 无法连接 GitHub。请先确认你的代理/Clash/VPN 已开启（默认端口 7892），再双击本文件。
  echo   ! 若端口不同，请用记事本打开本文件，把第 13~14 行的 7892 改成你的端口。
  pause
  exit /b 1
)
echo   + 网络代理正常，开始更新
echo.

echo [1/4] 保存源码备份到 GitHub (main 分支)...
git add -A
git commit -m "update %date% %time%" >nul 2>&1 && echo   + 已记录改动 || echo   (没有新改动，跳过)
git push origin main >push_log.txt 2>&1
if errorlevel 1 (
  echo   ! 源码备份失败，错误详情：
  echo   ----------------------------------------
  type push_log.txt
  echo   ----------------------------------------
) else (
  echo   + 源码已备份
)
echo.

echo [2/4] 构建网站...
call npm run build >nul 2>&1
if errorlevel 1 (
  echo   ! 构建失败，已停止。请确认 Node.js 已安装。
  del push_log.txt 2>nul
  pause
  exit /b 1
)
echo   + 构建完成
echo.

echo [3/4] 发布到线上 (gh-pages 分支)...
cd dist
rmdir /s /q .git 2>nul
git init -b gh-pages >nul 2>&1
git add -A >nul 2>&1
git commit -m "deploy %date% %time%" >nul 2>&1
git remote remove origin 2>nul
git remote add origin https://github.com/zhaowentao-tnt/job-portal.git
git push --force origin gh-pages >..\push_log.txt 2>&1
if errorlevel 1 (
  echo   ! 线上发布失败，错误详情：
  echo   ----------------------------------------
  type ..\push_log.txt
  echo   ----------------------------------------
  echo   若提示 401 / 账号密码错误，说明 GitHub Token 已过期，请重新生成后再次双击本文件。
) else (
  echo   + 线上已更新
)
cd ..
echo.

echo [4/4] 回到主分支...
git checkout -f main >nul 2>&1
echo.

echo ============================================
echo   完成！线上网址（稍等 1~2 分钟生效）：
echo   https://zhaowentao-tnt.github.io/job-portal/
echo ============================================
echo.
del push_log.txt 2>nul

pause
