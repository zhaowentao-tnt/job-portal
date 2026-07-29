<template>
  <footer class="footer">
    <span>&copy; 2026 赵文涛</span>
    <span class="footer-sep">·</span>
    <span>Built with care</span>
    <router-link to="/admin" class="footer-admin" title="管理面板">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </router-link>
    <button v-if="hasAnyLocalChanges" class="footer-export" @click="exportMyChanges" title="导出我刚在浏览器里修改的内容">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    </button>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from '@/composables/useData'

const { MODULES, hasLocalChanges, exportModule } = useData()

const hasAnyLocalChanges = computed(() =>
  MODULES.some((m) => hasLocalChanges(m))
)

// 把浏览器里改过的模块逐个下载为 JSON（在线上/本地都可用）
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

.footer-admin {
  margin-left: 16px;
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
  margin-left: 16px;
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
</style>
