@echo off
chcp 65001 >nul
cd /d %~dp0

echo ============================================
echo   一键更新网站（推送到 GitHub 自动上线）
echo ============================================
echo.

echo [1/3] 暂存所有改动...
git add -A

echo [2/3] 提交改动...
git commit -m "update %date% %time%" || echo （没有新改动，跳过提交）

echo [3/3] 推送到 GitHub（稍后自动部署上线）...
git push

echo.
echo 推送完成！GitHub 会在 1~2 分钟内自动构建并上线。
echo 线上网址：https://zhaowentao-tnt.github.io/job-portal/
echo.
echo 若提示输入账号密码：用户名填 zhaowentao-tnt，密码填你的 GitHub Token。
echo.
pause
