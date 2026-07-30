<template>
  <footer class="footer">
    <span>&copy; 2026 赵文涛</span>
    <span class="footer-sep">·</span>
    <span>Built with care</span>

    <!-- GitHub 同步状态指示器 -->
    <button class="footer-sync" @click="showSyncPanel = true" :title="syncTitle">
      <span class="sync-dot" :class="syncStatus"></span>
      <svg v-if="!tokenConfigured" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>

    <router-link to="/admin" class="footer-admin" title="管理面板">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </router-link>

    <button v-if="hasAnyLocalChanges && !tokenConfigured" class="footer-export" @click="exportMyChanges" title="导出我刚在浏览器里修改的内容">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    </button>

    <!-- 同步设置弹窗 -->
    <Teleport to="body">
      <div v-if="showSyncPanel" class="sync-overlay" @click.self="showSyncPanel = false">
        <div class="sync-modal">
          <h3>GitHub 自动同步</h3>
          <p class="sync-desc">配置 Token 后，在线上编辑的内容会自动同步到 GitHub，无需手动推送。</p>

          <div class="sync-field">
            <label>GitHub Token</label>
            <input
              v-model="tokenInput"
              type="password"
              placeholder="ghp_..."
              class="sync-input"
            />
          </div>

          <div v-if="testResult" class="sync-test" :class="{ ok: testResult.valid, err: !testResult.valid }">
            {{ testResult.valid ? 'Token 有效 (' + testResult.username + ')' : testResult.error }}
          </div>

          <div class="sync-actions">
            <button @click="testToken" :disabled="testing || !tokenInput" class="sync-btn secondary">
              {{ testing ? '测试中...' : '测试连接' }}
            </button>
            <button @click="saveToken" :disabled="!tokenInput" class="sync-btn primary">
              保存
            </button>
            <button v-if="tokenConfigured" @click="removeToken" class="sync-btn danger">
              清除 Token
            </button>
          </div>

          <div class="sync-status-info">
            <span class="sync-dot" :class="syncStatus"></span>
            <span>{{ statusText }}</span>
          </div>

          <button class="sync-close" @click="showSyncPanel = false">关闭</button>
        </div>
      </div>
    </Teleport>

    <!-- Toast 通知 -->
    <Teleport to="body">
      <div v-if="syncStatus === 'syncing' || syncStatus === 'success' || syncStatus === 'error'" class="sync-toast" :class="syncStatus">
        <span class="sync-dot" :class="syncStatus"></span>
        <span>{{ syncMessage }}</span>
      </div>
    </Teleport>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from '@/composables/useData'
import { useGitHubSync } from '@/composables/useGitHubSync'

const { MODULES, hasLocalChanges, exportModule } = useData()
const { syncStatus, syncMessage, tokenConfigured, setToken, clearToken, validateToken } = useGitHubSync()

const showSyncPanel = ref(false)
const tokenInput = ref('')
const testResult = ref(null)
const testing = ref(false)

const hasAnyLocalChanges = computed(() =>
  MODULES.some((m) => hasLocalChanges(m))
)

const syncTitle = computed(() => {
  if (!tokenConfigured.value) return '点击配置 GitHub 同步'
  if (syncStatus.value === 'syncing') return '正在同步...'
  if (syncStatus.value === 'success') return '已同步'
  if (syncStatus.value === 'error') return '同步失败：' + syncMessage.value
  return 'GitHub 同步已配置'
})

const statusText = computed(() => {
  if (!tokenConfigured.value) return '未配置 Token（编辑只存浏览器）'
  if (syncStatus.value === 'syncing') return '正在同步...'
  if (syncStatus.value === 'success') return '上次同步成功'
  if (syncStatus.value === 'error') return '同步失败：' + syncMessage.value
  return '已就绪（编辑后自动同步）'
})

async function testToken() {
  testing.value = true
  testResult.value = null
  // Temporarily set token for testing
  const oldToken = localStorage.getItem('jp_github_token')
  localStorage.setItem('jp_github_token', tokenInput.value.trim())
  testResult.value = await validateToken()
  // Restore old token if test fails
  if (!testResult.value.valid) {
    if (oldToken) localStorage.setItem('jp_github_token', oldToken)
    else localStorage.removeItem('jp_github_token')
  }
  testing.value = false
}

function saveToken() {
  setToken(tokenInput.value)
  tokenInput.value = ''
  testResult.value = null
  showSyncPanel.value = false
}

function removeToken() {
  clearToken()
  tokenInput.value = ''
  testResult.value = null
}

function exportMyChanges() {
  let i = 0
  MODULES.forEach((m) => {
    if (hasLocalChanges(m)) {
      setTimeout(() => exportModule(m), i * 350)
      i++
    }
  })
}
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 32px 24px;
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-sep {
  margin: 0 4px;
}

.footer-sync {
  margin-left: 12px;
  opacity: 0.4;
  color: var(--text-light);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  transition: opacity 0.2s;
}

.footer-sync:hover {
  opacity: 0.8;
  color: var(--primary);
}

.sync-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  flex-shrink: 0;
}

.sync-dot.syncing {
  background: #3b82f6;
  animation: pulse 1s infinite;
}

.sync-dot.success {
  background: #22c55e;
}

.sync-dot.error {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.footer-admin {
  margin-left: 8px;
  opacity: 0.3;
  color: var(--text-light) !important;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
}

.footer-admin:hover {
  opacity: 0.7;
  color: var(--primary) !important;
}

.footer-export {
  margin-left: 8px;
  opacity: 0.3;
  color: var(--text-light);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: opacity 0.2s, color 0.2s;
}

.footer-export:hover {
  opacity: 0.9;
  color: var(--primary);
}

/* Modal */
.sync-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.sync-modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.sync-modal h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.sync-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px;
  line-height: 1.5;
}

.sync-field {
  margin-bottom: 12px;
}

.sync-field label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  font-weight: 500;
}

.sync-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: monospace;
  box-sizing: border-box;
}

.sync-input:focus {
  outline: none;
  border-color: var(--primary, #FF6B35);
}

.sync-test {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.sync-test.ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.sync-test.err {
  background: #fbe9e7;
  color: #c62828;
}

.sync-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.sync-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.sync-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn.primary {
  background: var(--primary, #FF6B35);
  color: #fff;
}

.sync-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.sync-btn.danger {
  background: #fee;
  color: #c62828;
}

.sync-status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  padding: 8px 0;
  border-top: 1px solid #eee;
}

.sync-close {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
}

.sync-close:hover {
  background: #f5f5f5;
}

/* Toast */
.sync-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  z-index: 9999;
  max-width: 320px;
}

.sync-toast.success {
  border-left: 3px solid #22c55e;
}

.sync-toast.error {
  border-left: 3px solid #ef4444;
}

.sync-toast.syncing {
  border-left: 3px solid #3b82f6;
}
</style>
