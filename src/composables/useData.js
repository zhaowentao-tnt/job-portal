import { ref } from 'vue'

// 7个数据模块
const MODULES = ['profile', 'experiences', 'portfolio', 'growth', 'life', 'applications', 'jobs']

// 单例数据 - 所有组件共享
const data = ref({})
const loaded = ref(false)

// localStorage 前缀
const LS_PREFIX = 'jp_data_'

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

// 保存单个模块到 localStorage + 更新响应式数据
function saveModule(name, newData) {
  localStorage.setItem(LS_PREFIX + name, JSON.stringify(newData))
  data.value = { ...data.value, [name]: newData }
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
    exportModule,
    exportAll
  }
}
