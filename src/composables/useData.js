import { ref } from 'vue'

// 8个数据模块
const MODULES = ['profile', 'experiences', 'portfolio', 'growth', 'life', 'applications', 'jobs', 'interviews']

// 单例数据 - 所有组件共享
const data = ref({})
const loaded = ref(false)

// localStorage 前缀
const LS_PREFIX = 'jp_data_'
const VERSION_PREFIX = 'jp_version_'
const CLEANUP_KEY = 'jp_cleanup_v1'

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

// 从 localStorage 读取（如果有）
function getLocal(name) {
  const raw = localStorage.getItem(LS_PREFIX + name)
  return raw ? JSON.parse(raw) : null
}

// 加载所有模块
async function loadAll() {
  cleanupVersioningArtifacts()
  const results = await Promise.all(
    MODULES.map(async (name) => {
      const fileData = await fetchModule(name).catch(() => ({}))
      const localData = getLocal(name)
      return [name, localData || fileData]
    })
  )
  data.value = Object.fromEntries(results)
  loaded.value = true
}

// 保存单个模块：写 localStorage + 更新响应式 + 尝试远程写 JSON（dev）
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