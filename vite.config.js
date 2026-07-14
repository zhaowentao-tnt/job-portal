import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'

// 7 个数据模块（与管理面板一致）
const DATA_MODULES = ['profile', 'experiences', 'portfolio', 'growth', 'life', 'applications', 'jobs']

// 开发期中间件：把管理面板的“保存”直接写回 public/data/*.json 文件
// 这样修改会真正落盘，git push 后即可部署；生产环境为纯静态，不需要此接口
function saveDataPlugin() {
  const dataDir = fileURLToPath(new URL('./public/data', import.meta.url))
  return {
    name: 'save-data-to-file',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        const match = url.match(/\/api\/save\/([a-z]+)/i)
        if (!match || req.method !== 'POST') return next()
        const moduleName = match[1]
        if (!DATA_MODULES.includes(moduleName)) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: 'unknown module: ' + moduleName }))
          return
        }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body)
            const filePath = dataDir + '/' + moduleName + '.json'
            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2) + '\n', 'utf-8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, module: moduleName }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), saveDataPlugin()],
  base: '/job-portal/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // 固定端口：localStorage 按“域名+端口”隔离，端口固定后修改不会因重启而丢失
    port: 5174,
    strictPort: true,
    // 忽略 public/data 的改动监听，避免“保存”写文件时触发整页刷新打断编辑
    watch: {
      ignored: ['**/public/data/**']
    }
  }
})
