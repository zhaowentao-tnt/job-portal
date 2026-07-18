@echo off
chcp 65001 >nul
cd /d %~dp0

echo ============================================
echo   赵文涛求职网站 - 一键更新
echo ============================================
echo.

echo [1/4] 保存源码备份到 GitHub (main 分支)...
git add -A
git commit -m "update %date% %time%" >nul 2>&1 && echo   + 已记录改动 || echo   (没有新改动，跳过)
git push origin main >nul 2>&1 && echo   + 源码已备份 || echo   ! 源码备份失败，请检查登录状态
echo.

echo [2/4] 构建网站...
call npm run build >nul 2>&1
if errorlevel 1 (
  echo   ! 构建失败，已停止。请确认 Node.js 已安装。
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
git push --force origin gh-pages >nul 2>&1 && echo   + 线上已更新 || echo   ! 线上发布失败，请检查登录状态
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
echo 若提示输入账号密码：用户名填 zhaowentao-tnt，密码填你的 GitHub Token。
echo.
pause
