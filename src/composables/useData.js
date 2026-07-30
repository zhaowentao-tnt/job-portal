import { ref } from 'vue'
import { useGitHubSync } from './useGitHubSync'

// 8个数据模块
const MODULES = ['profile', 'experiences', 'portfolio', 'growth', 'life', 'applications', 'jobs', 'interviews']

// GitHub 同步
const { debouncedSync } = useGitHubSync()

// 单例数据 - 所有组件共享
const data = ref({})
const loaded = ref(false)

// localStorage 前缀
const LS_PREFIX = 'jp_data_'
const VERSION_PREFIX = 'jp_version_'
const CLEANUP_KEY = 'jp_cleanup_v1'
const SIG_PREFIX = 'jp_sig_'   // 本地缓存所基于的服务器文件签名

// 简单内容哈希（djb2），用于生成文件签名
function hashStr(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}

// 文件内容签名：内容任意变化（含同日多次更新）签名必变。
// 用于判断 localStorage 本地缓存是否已过期——服务器文件一更新就自动作废旧缓存。
function fileSignature(obj) {
  return hashStr(JSON.stringify(obj))
}

// 一次性清理：如果检测到版本化代码遗留的 jp_version_* 键，
// 清除所有 jp_* 键，强制从 JSON 文件重新加载
function cleanupVersioningArtifacts() {
  if (localStorage.getItem(CLEANUP_KEY)) return
  const hasVersionKeys = Object.keys(localStorage).some(k => k.startsWith(VERSION_PREFIX))
  if (hasVersionKeys) {
    Object.keys(localStorage)
      .filter(k => k.startsWith('jp_'))
      .forEach(k => localStorage.removeItem(k))
    console.log('[useData] Cleaned up versioning artifacts from localStorage')
  }
  localStorage.setItem(CLEANUP_KEY, '1')
}

// 从 JSON 文件加载单个模块
async function fetchModule(name) {
  const base = import.meta.env.BASE_URL
  const res = await fetch(`${base}data/${name}.json`)
  if (!res.ok) throw new Error(`Failed to load ${name}.json`)
  return res.json()
}

// 从 localStorage 读取（如果有）；解析失败返回 null 不崩溃
function getLocal(name) {
  const raw = localStorage.getItem(LS_PREFIX + name)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// 加载所有模块
// 关键：解决 localStorage 遮蔽问题——本地缓存只在「服务器文件未更新」时才生效。
// 一旦服务器 JSON 被重新部署（签名变化），自动改用新文件，丢弃过期本地缓存。
async function loadAll() {
  cleanupVersioningArtifacts()
  const results = await Promise.all(
    MODULES.map(async (name) => {
      const fileData = await fetchModule(name).catch(() => ({}))
      const curSig = fileSignature(fileData)
      const localData = getLocal(name)
      const baseSig = localStorage.getItem(SIG_PREFIX + name)
      // 有本地缓存，且本地缓存所基于的服务器签名 == 当前服务器签名 → 保留本地编辑
      // 否则（服务器已更新 / 首次加载 / 无缓存）→ 用新文件
      const useLocal = !!(localData && baseSig && baseSig === curSig)
      if (localData && !useLocal) {
        localStorage.removeItem(LS_PREFIX + name)
        console.log(`[useData] ${name}: 服务器文件已更新，丢弃过期本地缓存`)
      }
      localStorage.setItem(SIG_PREFIX + name, curSig)
      return [name, useLocal ? localData : fileData]
    })
  )
  data.value = Object.fromEntries(results)
  loaded.value = true
}

// 保存单个模块：写 localStorage + 更新响应式 + dev写JSON + GitHub同步
function saveModule(name, newData) {
  localStorage.setItem(LS_PREFIX + name, JSON.stringify(newData))
  data.value = { ...data.value, [name]: newData }
  // dev 模式下 Vite 中间件会把数据写回 public/data/*.json；prod 静默失败
  try {
    fetch(`/api/save/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    }).catch(() => {})
  } catch (_) { /* ignore */ }
  // GitHub 自动同步（防抖2秒，Token 未配置时自动跳过）
  debouncedSync(name, newData)
}

// 重置单个模块（清除 localStorage，重新从 JSON 加载）
async function resetModule(name) {
  localStorage.removeItem(LS_PREFIX + name)
  const fileData = await fetchModule(name).catch(() => ({}))
  data.value = { ...data.value, [name]: fileData }
}

// 重置所有模块
async function resetAll() {
  MODULES.forEach((name) => localStorage.removeItem(LS_PREFIX + name))
  await loadAll()
}

// 检查模块是否有本地修改
function hasLocalChanges(name) {
  return localStorage.getItem(LS_PREFIX + name) !== null
}

// 原子更新单个字段：按 keyPath（点号分隔）定位并修改整个模块
// e.g. updateField('applications', 'applications.0.currentStatus', 'offer')
function updateField(module, keyPath, value) {
  const root = data.value[module]
  if (root == null) return
  const keys = String(keyPath).split('.').filter(Boolean)
  if (!keys.length) return
  let target = root
  for (let i = 0; i < keys.length - 1; i++) {
    if (target == null) return
    target = target[keys[i]]
  }
  if (target == null) return
  target[keys[keys.length - 1]] = value
  // 深拷贝避免引用污染（saveModule 内已 clone；这里直接传 root 即可）
  saveModule(module, JSON.parse(JSON.stringify(root)))
}

// 数组便捷操作（在指定路径下增/删/插入一项）
// keyPath 指向「目标数组本身」，如 'applications.0.statusHistory'
function arrayOp(module, keyPath, op, value, index) {
  const root = data.value[module]
  if (root == null) return
  const keys = String(keyPath).split('.').filter(Boolean)
  let target = root
  for (let i = 0; i < keys.length; i++) {
    if (target == null) return
    target = target[keys[i]]
  }
  if (!Array.isArray(target)) return
  if (op === 'push') {
    target.push(value)
  } else if (op === 'remove') {
    if (typeof index === 'number') target.splice(index, 1)
  } else if (op === 'insert') {
    target.splice(typeof index === 'number' ? index : target.length, 0, value)
  }
  saveModule(module, JSON.parse(JSON.stringify(root)))
}

// 导出单个模块为 JSON 文件
function exportModule(name) {
  const json = JSON.stringify(data.value[name], null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导出所有模块
function exportAll() {
  MODULES.forEach((name, i) => {
    setTimeout(() => exportModule(name), i * 300)
  })
}

export function useData() {
  return {
    data,
    loaded,
    MODULES,
    loadAll,
    saveModule,
    resetModule,
    resetAll,
    hasLocalChanges,
    updateField,
    arrayOp,
    exportModule,
    exportAll
  }
}