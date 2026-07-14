<template>
  <div class="admin-container">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <h3 class="sidebar-title">数据模块</h3>
      <nav class="sidebar-nav">
        <button
          v-for="mod in modules"
          :key="mod.key"
          class="sidebar-item"
          :class="{ 'sidebar-item--active': current === mod.key }"
          @click="current = mod.key"
        >
          <span class="sidebar-icon">{{ mod.icon }}</span>
          <span class="sidebar-label">{{ mod.label }}</span>
          <span v-if="hasLocalChanges(mod.key)" class="sidebar-dot"></span>
        </button>
      </nav>
      <div class="sidebar-actions">
        <button class="btn btn--primary btn-sm" @click="exportAll" style="width: 100%; justify-content: center;">
          📥 导出全部数据
        </button>
        <button class="btn btn--outline btn-sm" @click="confirmResetAll" style="width: 100%; justify-content: center;">
          ↻ 重置全部
        </button>
        <router-link to="/home" class="sidebar-exit">← 返回网站</router-link>
      </div>
    </aside>

    <!-- Editor area -->
    <main class="admin-main">
      <div class="admin-header">
        <h2>{{ currentModule.label }}</h2>
        <p class="admin-desc">{{ currentModule.desc }}</p>
        <span v-if="saveStatus" class="save-badge" :class="'save-badge--' + saveStatus">
          {{ saveStatus === 'saving' ? '保存中…' : saveStatus === 'saved' ? '✓ 已保存到文件' : '⚠ 文件保存失败（仅存本地）' }}
        </span>
      </div>
      <component
        :is="currentEditor"
        :data="currentData"
        @save="onSave"
        @reset="onReset"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from '../../composables/useData'
import ProfileEditor from './ProfileEditor.vue'
import ExperienceEditor from './ExperienceEditor.vue'
import PortfolioEditor from './PortfolioEditor.vue'
import GrowthEditor from './GrowthEditor.vue'
import LifeEditor from './LifeEditor.vue'
import ApplicationEditor from './ApplicationEditor.vue'
import JobsEditor from './JobsEditor.vue'

const { data, saveModule, resetModule, resetAll, hasLocalChanges, exportAll } = useData()

const modules = [
  { key: 'profile', label: '关于我', icon: '👤', desc: '姓名、简介、核心能力、联系方式', editor: ProfileEditor },
  { key: 'experiences', label: '经历', icon: '💼', desc: '教育背景和工作经历', editor: ExperienceEditor },
  { key: 'portfolio', label: '作品集', icon: '🎨', desc: '项目、文章、AI应用等作品', editor: PortfolioEditor },
  { key: 'growth', label: '成长轨迹', icon: '🌱', desc: '学习路径、证书、书单', editor: GrowthEditor },
  { key: 'life', label: '校园&生活', icon: '🎓', desc: '社团经历、兴趣爱好、生活照片', editor: LifeEditor },
  { key: 'applications', label: '投递追踪', icon: '📊', desc: '投递记录和进展状态', editor: ApplicationEditor },
  { key: 'jobs', label: '招聘信息', icon: '📌', desc: '目标公司招聘信息', editor: JobsEditor }
]

const current = ref('profile')

const currentModule = computed(() => modules.find(m => m.key === current.value))
const currentEditor = computed(() => currentModule.value?.editor)
const currentData = computed(() => data.value[current.value] || {})

const saveStatus = ref('') // '', 'saving', 'saved', 'error'

// 保存：先更新内存 + localStorage（UI 即时响应），再写回 JSON 文件（永久落盘，可部署）
async function onSave(newData) {
  saveModule(current.value, newData)
  try {
    saveStatus.value = 'saving'
    const res = await fetch('/api/save/' + current.value, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    })
    saveStatus.value = res.ok ? 'saved' : 'error'
  } catch (e) {
    saveStatus.value = 'error'
  }
  setTimeout(() => { saveStatus.value = '' }, 2500)
}

async function onReset() {
  await resetModule(current.value)
}

function confirmResetAll() {
  if (confirm('确定重置所有本地修改？这将清除所有未导出的更改，恢复到JSON文件的原始数据。')) {
    resetAll()
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  max-width: var(--max-width);
  margin: 0 auto;
  min-height: calc(100vh - var(--nav-height));
  padding: 0 24px;
  gap: 0;
}

/* Sidebar */
.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 24px 0;
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 16px 12px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-sub);
  transition: all 0.2s;
  font-family: var(--font-family);
  text-align: left;
  position: relative;
}

.sidebar-item:hover {
  background: var(--border-light);
}

.sidebar-item--active {
  background: var(--primary-light);
  color: var(--primary);
}

.sidebar-icon {
  font-size: 16px;
}

.sidebar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-left: auto;
}

.sidebar-actions {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--border-light);
  margin-top: 16px;
}

.sidebar-exit {
  text-align: center;
  font-size: 13px;
  color: var(--text-light);
  padding: 8px;
}

/* Main */
.admin-main {
  flex: 1;
  padding: 24px 0 24px 32px;
  min-width: 0;
}

.admin-header {
  margin-bottom: 24px;
}

.admin-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.admin-desc {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 4px;
}

.save-badge {
  display: inline-block;
  margin-left: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  vertical-align: middle;
}
.save-badge--saving { background: #fff7e6; color: #d48806; }
.save-badge--saved { background: #f6ffed; color: #389e0d; }
.save-badge--error { background: #fff1f0; color: #cf1322; }

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 0 16px;
  }

  .admin-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    padding: 16px 0;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 8px;
  }

  .sidebar-item {
    white-space: nowrap;
  }

  .sidebar-actions {
    flex-direction: row;
    flex-wrap: wrap;
    border-top: none;
    margin-top: 0;
    padding: 12px 8px 4px;
  }

  .sidebar-actions button {
    width: auto !important;
  }

  .sidebar-exit {
    width: 100%;
  }

  .admin-main {
    padding: 16px 0;
  }
}
</style>
