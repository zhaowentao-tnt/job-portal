<template>
  <div class="container tracker-page">
    <h1 class="page-title">投递追踪</h1>
    <p class="page-sub" v-if="data.lastUpdated || interviewsLastUpdated">
      投递最后更新：{{ data.lastUpdated }} · 面试最后更新：{{ interviewsLastUpdated }}
    </p>

    <!-- 板块切换 -->
    <div class="seg">
      <button class="seg-btn" :class="{ 'seg-btn--active': activeBlock === 'apps' }" @click="activeBlock = 'apps'">
        📊 投递记录 <span class="seg-count">{{ apps.length }}</span>
      </button>
      <button class="seg-btn" :class="{ 'seg-btn--active': activeBlock === 'interviews' }" @click="activeBlock = 'interviews'">
        🎤 面试记录 <span class="seg-count">{{ interviews.length }}</span>
      </button>
    </div>

    <!-- 投递记录 -->
    <div v-show="activeBlock === 'apps'">
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

    <!-- 面试记录 -->
    <div v-show="activeBlock === 'interviews'">
      <div class="stats-grid iv-stats">
        <div class="card stat-card">
          <div class="stat-num">{{ ivStats.total }}</div>
          <div class="stat-label">面试总数</div>
        </div>
        <div class="card stat-card">
          <div class="stat-num" style="color: var(--success);">{{ ivStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="card stat-card">
          <div class="stat-num" style="color: var(--warning);">{{ ivStats.upcoming }}</div>
          <div class="stat-label">待进行</div>
        </div>
        <div class="card stat-card">
          <div class="stat-num" style="color: var(--primary);">{{ ivStats.insights }}</div>
          <div class="stat-label">沉淀思考</div>
        </div>
      </div>

      <div class="iv-list">
        <div v-for="iv in sortedInterviews" :key="iv.id" class="card iv-card">
          <div class="iv-header">
            <div class="iv-info">
              <h3 class="iv-company">{{ iv.company }}</h3>
              <p class="iv-position">{{ iv.position }}</p>
            </div>
            <span class="iv-status" :class="'iv-status--' + iv.status">
              {{ iv.status === 'completed' ? '已完成' : '待进行' }}
            </span>
          </div>
          <div class="iv-meta">
            <span v-if="iv.interviewTime">🕒 {{ iv.interviewTime }}</span>
            <span v-if="iv.interviewType">🎥 {{ iv.interviewType }}</span>
          </div>

          <p v-if="iv.review" class="iv-review">{{ iv.review }}</p>

          <div v-if="iv.insights && iv.insights.length" class="iv-insights">
            <div class="iv-insights-title">💡 面试思考</div>
            <div
              v-for="(ins, i) in iv.insights"
              :key="i"
              class="iv-insight"
              :class="{ 'iv-insight--key': ins.key }"
            >
              <div class="iv-insight-head">
                <span class="iv-insight-index">{{ i + 1 }}</span>
                <span class="iv-insight-title">{{ ins.title }}</span>
                <span v-if="ins.key" class="iv-key-tag">重点</span>
              </div>
              <p class="iv-insight-content">{{ ins.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!interviews.length" class="empty-state">
        <div class="empty-state-icon">🎤</div>
        <p>暂无面试记录</p>
        <p style="font-size: 13px; margin-top: 8px;">可在管理面板「面试记录」中添加</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from '../composables/useData'

const { data } = useData()

const activeBlock = ref('apps')

const apps = computed(() => data.value.applications?.applications || [])
const statusConfig = computed(() => data.value.applications?.statusConfig || {})

const interviews = computed(() => data.value.interviews?.interviews || [])
const interviewsLastUpdated = computed(() => data.value.interviews?.lastUpdated || '')

const sortedApps = computed(() => {
  return [...apps.value].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (b.priority === 'high' && a.priority !== 'high') return 1
    return (b.applyDate || '').localeCompare(a.applyDate || '')
  })
})

const sortedInterviews = computed(() => {
  return [...interviews.value].sort((a, b) => (b.interviewTime || '').localeCompare(a.interviewTime || ''))
})

const stats = computed(() => {
  const all = apps.value
  return {
    total: all.length,
    inProgress: all.filter(a => ['submitted', 'written_test', 'interview_1', 'interview_2', 'interview_3', 'processing'].includes(a.currentStatus)).length,
    rejected: all.filter(a => a.currentStatus === 'rejected').length,
    notApplied: all.filter(a => a.currentStatus === 'not_applied').length
  }
})

const ivStats = computed(() => {
  const all = interviews.value
  return {
    total: all.length,
    completed: all.filter(i => i.status === 'completed').length,
    upcoming: all.filter(i => i.status !== 'completed').length,
    insights: all.reduce((sum, i) => sum + (i.insights?.length || 0), 0)
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
  margin-bottom: 20px;
}

/* Segmented control */
.seg {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: var(--bg);
  padding: 6px;
  border-radius: var(--radius-full);
  width: fit-content;
}
.seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 9px 18px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-sub);
  font-family: var(--font-family);
  transition: all 0.2s;
}
.seg-btn--active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 95, 165, 0.25);
}
.seg-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.25);
}
.seg-btn:not(.seg-btn--active) .seg-count {
  background: var(--border-light);
  color: var(--text-light);
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
.app-card { padding: 20px; }
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
.app-timeline-label { font-weight: 500; }
.app-timeline-date { color: var(--text-light); font-size: 12px; }
.app-timeline-note { color: var(--text-light); font-size: 12px; }
.app-note {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-sub);
  padding: 8px 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

/* Interview cards */
.iv-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.iv-card { padding: 22px; }
.iv-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}
.iv-company {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.iv-position {
  font-size: 14px;
  color: var(--text-sub);
  margin-top: 2px;
}
.iv-status {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}
.iv-status--completed { background: #ecfdf5; color: #059669; }
.iv-status--upcoming { background: #fffbeb; color: #d97706; }
.iv-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 14px;
}
.iv-review {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-sub);
  padding: 12px 14px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}
.iv-insights-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}
.iv-insight {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  margin-bottom: 10px;
  border-left: 3px solid var(--border-light);
}
.iv-insight--key {
  background: #fff8ec;
  border-left: 3px solid var(--warning);
}
.iv-insight-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.iv-insight-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.iv-insight-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
.iv-key-tag {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #d97706;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 999px;
}
.iv-insight-content {
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-sub);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--text-light);
}
.empty-state-icon { font-size: 40px; margin-bottom: 12px; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .seg { width: 100%; }
  .seg-btn { flex: 1; justify-content: center; }
}
</style>
