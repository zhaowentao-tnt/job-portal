# 赵文涛 · 求职门户（job-portal）

个人品牌展示 + 求职招聘集合网站：个人主页 / 投递追踪 / 招聘信息。

- 技术栈：Vue 3 + Vite + Vue Router + ECharts
- 数据驱动：内容存于 `public/data/*.json`，管理面板（`/#/admin`，密码 `zwt2026`）可在线编辑

## 线上网址（永久）

https://zhaowentao-tnt.github.io/job-portal/

## 本地预览

```bash
npm install
npm run dev
# 打开 http://localhost:5174/job-portal/#/home
```

## 修改内容并上线

1. 本地 `npm run dev` 打开网站 → 进入 `/#/admin` 管理面板修改内容（保存直接写进 `public/data/*.json`）
2. 双击项目里的 **`一键更新.bat`** → 自动推送到 GitHub
3. GitHub Actions 自动构建并部署，几分钟后线上更新

## 部署原理

源码推送到 `main` 分支后，由 `.github/workflows/deploy.yml`（GitHub 官方 Pages 工作流）自动 `npm run build` 并发布到 GitHub Pages。无需手动 build，也无需第三方工具。
