import { ref } from 'vue'

// GitHub repo config
const OWNER = 'zhaowentao-tnt'
const REPO = 'job-portal'
const TOKEN_KEY = 'jp_github_token'
const API_BASE = 'https://api.github.com/repos'

// Reactive sync status: idle | syncing | success | error
const syncStatus = ref('idle')
const syncMessage = ref('')
const tokenConfigured = ref(!!localStorage.getItem(TOKEN_KEY))

// Per-module debounce timers
const debounceTimers = {}

// Unicode-safe base64 (handles Chinese text)
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

// ---- Token management ----
function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token.trim())
  tokenConfigured.value = true
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  tokenConfigured.value = false
  syncStatus.value = 'idle'
  syncMessage.value = ''
}

// Validate token by calling GitHub API
async function validateToken() {
  const token = getToken()
  if (!token) return { valid: false, error: '未设置 Token' }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    })
    if (res.ok) {
      const data = await res.json()
      return { valid: true, username: data.login }
    }
    if (res.status === 401) return { valid: false, error: 'Token 无效或已过期' }
    return { valid: false, error: `GitHub 返回 ${res.status}` }
  } catch (err) {
    return { valid: false, error: '网络错误：' + err.message }
  }
}

// Get current file SHA (required for update, null if file doesn't exist)
async function getFileSha(path, branch) {
  const token = getToken()
  const url = `${API_BASE}/${OWNER}/${REPO}/contents/${path}?ref=${branch}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  })
  if (res.ok) {
    const data = await res.json()
    return data.sha
  }
  if (res.status === 404) return null
  throw new Error(`获取 SHA 失败: ${res.status}`)
}

// Update a single file on a branch
async function updateFile(path, content, branch, message) {
  const token = getToken()
  const sha = await getFileSha(path, branch)

  const body = {
    message: message || `auto-save: update ${path}`,
    content: toBase64(content),
    branch: branch
  }
  if (sha) body.sha = sha

  const res = await fetch(`${API_BASE}/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(`${res.status}: ${errData.message || '未知错误'}`)
  }

  return true
}

// Sync a module to both gh-pages and main branches
async function syncModule(moduleName, data) {
  const token = getToken()
  if (!token) {
    return false
  }

  syncStatus.value = 'syncing'
  syncMessage.value = `正在同步 ${moduleName}...`

  const jsonContent = JSON.stringify(data, null, 2) + '\n'
  const mainPath = `public/data/${moduleName}.json`
  const ghPagesPath = `data/${moduleName}.json`
  const message = `auto-save: update ${moduleName}.json`

  const errors = []

  // gh-pages first (what visitors see)
  try {
    await updateFile(ghPagesPath, jsonContent, 'gh-pages', message)
  } catch (err) {
    errors.push(`gh-pages: ${err.message}`)
  }

  // main second (source code)
  try {
    await updateFile(mainPath, jsonContent, 'main', message)
  } catch (err) {
    errors.push(`main: ${err.message}`)
  }

  if (errors.length === 0) {
    syncStatus.value = 'success'
    syncMessage.value = `${moduleName} 已同步`
    setTimeout(() => {
      if (syncStatus.value === 'success') {
        syncStatus.value = 'idle'
        syncMessage.value = ''
      }
    }, 3000)
    return true
  } else {
    // If at least gh-pages succeeded, it's a partial success
    if (errors.length === 1 && errors[0].startsWith('main:')) {
      syncStatus.value = 'success'
      syncMessage.value = `${moduleName} 已同步 (main 分支跳过)`
      setTimeout(() => {
        if (syncStatus.value === 'success') {
          syncStatus.value = 'idle'
          syncMessage.value = ''
        }
      }, 3000)
      return true
    }
    syncStatus.value = 'error'
    syncMessage.value = errors.join('; ')
    return false
  }
}

// Debounced sync: wait 2s after last edit, then push once
function debouncedSync(moduleName, data) {
  if (debounceTimers[moduleName]) {
    clearTimeout(debounceTimers[moduleName])
  }

  debounceTimers[moduleName] = setTimeout(() => {
    syncModule(moduleName, data)
    delete debounceTimers[moduleName]
  }, 2000)
}

export function useGitHubSync() {
  return {
    syncStatus,
    syncMessage,
    tokenConfigured,
    getToken,
    setToken,
    clearToken,
    validateToken,
    syncModule,
    debouncedSync
  }
}
