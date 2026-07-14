<template>
  <div class="container tracker-page">
    <h1 class="page-title">投递追踪</h1>
    <p class="page-sub" v-if="data.lastUpdated">最后更新：{{ data.lastUpdated }}</p>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-num">{{ stats.total }}</div>
        <div class="stat-label">总公司数</div>
      </div>
      <div class="card stat-card">
        <div class="stat-num" style="color: var(--primary);">{{ stats.inProgress }}</div>
        <div class="stat-label">进行中</div>
      </div>
      <div class="card stat-card">
        <div class="stat-num" style="color: var(--text-light);">{{ stats.rejected }}</div>
        <div class="stat-label">官网未通过</div>
      </div>
      <div class="card stat-card">
        <div class="stat-num" style="color: var(--success);">{{ stats.notApplied }}</div>
        <div class="stat-label">待行动</div>
      </div>
    </div>

    <!-- Application list -->
    <div class="app-list">
      <div v-for="app in sortedApps" :key="app.id" class="card app-card">
        <div class="app-header">
          <div class="app-info">
            <h3 class="app-company">{{ app.company }}</h3>
            <p class="app-position">{{ app.position }}<span v-if="app.department"> · {{ app.department }}</span></p>
          </div>
          <div class="app-status">
            <span class="status-badge" :style="getStatusStyle(app.currentStatus)">
              {{ getStatusLabel(app.currentStatus) }}
            </span>
          </div>
        </div>
        <div class="app-meta">
          <span v-if="app.location">📍 {{ app.location }}</span>
          <span v-if="app.applyDate">📅 {{ app.applyDate }}</span>
          <span v-if="app.channel">🔗 {{ app.channel }}</span>
          <span v-if="app.priority === 'high'" class="priority-high">⭐ 高优先级</span>
        </div>

        <!-- Status timeline -->
        <div v-if="app.statusHistory && app.statusHistory.length" class="app-timeline">
          <div v-for="(sh, i) in app.statusHistory" :key="i" class="app-timeline-item">
            <span class="status-dot" :style="{ background: getStatusColor(sh.status) }"></span>
            <span class="app-timeline-label">{{ getStatusLabel(sh.status) }}</span>
            <span class="app-timeline-date">{{ sh.date }}</span>
            <span v-if="sh.note" class="app-timeline-note">{{ sh.note }}</span>
          </div>
        </div>

        <p v-if="app.note" class="app-note">{{ app.note }}</p>
      </div>
    </div>

    <div v-if="!sortedApps.length" class="empty-state">
      <div class="empty-state-icon">📭</div>
      <p>暂无投递记录</p>
      <p style="font-size: 13px; margin-top: 8px;">请在管理面板中添加投递信息</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from '../composables/useData'

const { data } = useData()
const apps = computed(() => data.value.applications?.applications || [])
const statusConfig = computed(() => data.value.applications?.statusConfig || {})

const sortedApps = computed(() => {
  return [...apps.value].sort((a, b) => {
    // Sort by priority first, then by date
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (b.priority === 'high' && a.priority !== 'high') return 1
    return (b.applyDate || '').localeCompare(a.applyDate || '')
  })
})

const stats = computed(() => {
  const all = apps.value
  return {
    total: all.length,
    inProgress: all.filter(a => ['submitted', 'written_test', 'interview_1', 'interview_2', 'interview_3'].includes(a.currentStatus)).length,
    rejected: all.filter(a => a.currentStatus === 'rejected').length,
    notApplied: all.filter(a => a.currentStatus === 'not_applied').length
  }
})

function getStatusLabel(key) {
  return statusConfig.value[key]?.label || key
}

function getStatusColor(key) {
  return statusConfig.value[key]?.color || '#999'
}

function getStatusStyle(key) {
  const color = getStatusColor(key)
  return {
    background: color + '20',
    color: color,
    border: `1px solid ${color}40`
  }
}
</script>

<style scoped>
.tracker-page {
  padding-top: 48px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.page-sub {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 24px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-num {
  font-size: 32px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 6px;
}

/* App list */
.app-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-card {
  padding: 20px;
}

.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.app-company {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.app-position {
  font-size: 14px;
  color: var(--text-sub);
  margin-top: 2px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
}

.app-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 12px;
}

.priority-high {
  color: var(--warning);
  font-weight: 600;
}

/* Status timeline */
.app-timeline {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
}

.app-timeline-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 0;
  font-size: 13px;
  color: var(--text-sub);
  position: relative;
}

.app-timeline-item:not(:last-child)::after {
  content: '→';
  margin-left: 6px;
  color: var(--text-muted);
}

.app-timeline-label {
  font-weight: 500;
}

.app-timeline-date {
  color: var(--text-light);
  font-size: 12px;
}

.app-timeline-note {
  color: var(--text-light);
  font-size: 12px;
}

.app-note {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-sub);
  padding: 8px 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
