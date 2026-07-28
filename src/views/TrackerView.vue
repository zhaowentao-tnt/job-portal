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

    <!-- ============ 投递记录 ============ -->
    <div v-show="activeBlock === 'apps'">
      <EditBlock editText="编辑投递" doneText="完成投递">
      <!-- KPI 卡片（可点击筛选） -->
      <div class="stats-grid">
        <button class="card stat-card stat-btn" :class="{ 'stat-btn--active': currentFilter === 'all' }" @click="currentFilter = 'all'">
          <div class="stat-num">{{ stats.total }}</div>
          <div class="stat-label">总公司数</div>
        </button>
        <button class="card stat-card stat-btn" :class="{ 'stat-btn--active': currentFilter === 'inProgress' }" @click="currentFilter = 'inProgress'">
          <div class="stat-num" style="color: var(--primary);">{{ stats.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </button>
        <button class="card stat-card stat-btn" :class="{ 'stat-btn--active': currentFilter === 'rejected' }" @click="currentFilter = 'rejected'">
          <div class="stat-num" style="color: var(--text-light);">{{ stats.rejected }}</div>
          <div class="stat-label">官网未通过</div>
        </button>
        <button class="card stat-card stat-btn" :class="{ 'stat-btn--active': currentFilter === 'notApplied' }" @click="currentFilter = 'notApplied'">
          <div class="stat-num" style="color: var(--success);">{{ stats.notApplied }}</div>
          <div class="stat-label">待行动</div>
        </button>
      </div>

      <!-- 新增投递按钮 -->
      <div class="toolbar">
        <EditOnly><button class="btn btn--primary btn-sm" @click="addApp">+ 新增投递</button></EditOnly>
        <span class="toolbar-hint">当前显示 {{ filteredApps.length }} 条 · 默认只看「进行中」</span>
      </div>

      <!-- 投递列表 -->
      <div class="app-list">
        <div v-for="(app, idx) in filteredApps" :key="app.id" class="card app-card">
          <div class="app-header">
            <div class="app-info">
              <h3 class="app-company">
                <ClickEdit :value="app.company" module="applications" :path="`applications.${realIdx(app)}.company`" placeholder="公司名" />
              </h3>
              <p class="app-position">
                <ClickEdit :value="app.position" module="applications" :path="`applications.${realIdx(app)}.position`" placeholder="岗位" />
                <span class="app-dept"> ·
                  <ClickEdit :value="app.department" module="applications" :path="`applications.${realIdx(app)}.department`" placeholder="部门（可空）" />
                </span>
              </p>
            </div>
            <div class="app-status">
              <ClickEdit
                :value="app.currentStatus"
                type="select"
                :options="statusOptions"
                module="applications"
                :path="`applications.${realIdx(app)}.currentStatus`"
                :display="getStatusLabel(app.currentStatus)"
              >
                <template #display>
                  <span class="status-badge" :style="getStatusStyle(app.currentStatus)">
                    {{ getStatusLabel(app.currentStatus) }}
                  </span>
                </template>
              </ClickEdit>
              <EditOnly><button class="btn-del" @click="removeApp(app.id)" title="删除此投递">×</button></EditOnly>
            </div>
          </div>

          <div class="app-meta">
            <span>📍 <ClickEdit :value="app.location" module="applications" :path="`applications.${realIdx(app)}.location`" placeholder="地点" /></span>
            <span>📅 <ClickEdit :value="app.applyDate" type="date" module="applications" :path="`applications.${realIdx(app)}.applyDate`" placeholder="申请日期" /></span>
            <span>🔗 <ClickEdit :value="app.channel" module="applications" :path="`applications.${realIdx(app)}.channel`" placeholder="投递渠道" /></span>
            <EditOnly><button class="priority-toggle" :class="{ 'priority-toggle--on': app.priority === 'high' }" @click="togglePriority(app)" :title="app.priority === 'high' ? '取消高优先级' : '设为高优先级'">
              {{ app.priority === 'high' ? '⭐ 高优先级' : '☆ 普通' }}
            </button></EditOnly>
          </div>

          <div class="app-timeline">
            <div v-for="(sh, si) in (app.statusHistory || [])" :key="si" class="app-timeline-item">
              <span class="status-dot" :style="{ background: getStatusColor(sh.status) }"></span>
              <span class="app-timeline-label">
                <ClickEdit :value="sh.status" type="select" :options="statusOptions" module="applications" :path="`applications.${realIdx(app)}.statusHistory.${si}.status`" :display="getStatusLabel(sh.status)" />
              </span>
              <span class="app-timeline-date">
                <ClickEdit :value="sh.date" type="date" module="applications" :path="`applications.${realIdx(app)}.statusHistory.${si}.date`" placeholder="日期" />
              </span>
              <span class="app-timeline-note">
                <ClickEdit :value="sh.note" module="applications" :path="`applications.${realIdx(app)}.statusHistory.${si}.note`" placeholder="备注（可空）" />
              </span>
              <EditOnly><button class="btn-del-sm" @click="removeHistory(app, si)" title="删除节点">×</button></EditOnly>
            </div>
            <EditOnly><button class="btn-add-history" @click="addHistory(app)">+ 添加状态节点</button></EditOnly>
          </div>

          <p class="app-note" v-if="hasNote(app) || alwaysShowNote">
            <span class="note-label">📝</span>
            <ClickEdit :value="app.note" module="applications" :path="`applications.${realIdx(app)}.note`" placeholder="备注（可空）" />
          </p>
        </div>
      </div>

      <div v-if="!filteredApps.length" class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>暂无投递记录</p>
        <p style="font-size: 13px; margin-top: 8px;">点击「编辑投递」后新增</p>
      </div>
      </EditBlock>
    </div>

    <!-- ============ 面试记录 ============ -->
    <div v-show="activeBlock === 'interviews'">
      <EditBlock editText="编辑面试" doneText="完成面试">
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

      <div class="toolbar">
        <EditOnly><button class="btn btn--primary btn-sm" @click="addInterview">+ 新增面试复盘</button></EditOnly>
        <span class="toolbar-hint">共 {{ interviews.length }} 场</span>
      </div>

      <div class="iv-list">
        <div v-for="(iv, idx) in sortedInterviews" :key="iv.id" class="card iv-card">
          <div class="iv-header">
            <div class="iv-info">
              <h3 class="iv-company">
                <ClickEdit :value="iv.company" module="interviews" :path="`interviews.${ivIdx(iv)}.company`" placeholder="公司名" />
              </h3>
              <p class="iv-position">
                <ClickEdit :value="iv.position" module="interviews" :path="`interviews.${ivIdx(iv)}.position`" placeholder="岗位" />
              </p>
            </div>
            <div class="iv-status-wrap">
              <ClickEdit
                :value="iv.status"
                type="select"
                :options="[{value:'completed',label:'已完成'},{value:'upcoming',label:'待进行'}]"
                module="interviews"
                :path="`interviews.${ivIdx(iv)}.status`"
                :display="iv.status === 'completed' ? '已完成' : '待进行'"
              >
                <template #display>
                  <span class="iv-status" :class="`iv-status--${iv.status}`">
                    {{ iv.status === 'completed' ? '已完成' : '待进行' }}
                  </span>
                </template>
              </ClickEdit>
              <EditOnly><button class="btn-del" @click="removeInterview(iv.id)" title="删除此面试">×</button></EditOnly>
            </div>
          </div>

          <div class="iv-meta">
            <span>🕒 <ClickEdit :value="iv.interviewTime" module="interviews" :path="`interviews.${ivIdx(iv)}.interviewTime`" placeholder="时间（如 2026-07-27 09:30）" /></span>
            <span>🎥 <ClickEdit :value="iv.interviewType" type="select" :options="ivTypeOptions" module="interviews" :path="`interviews.${ivIdx(iv)}.interviewType`" placeholder="面试形式" /></span>
          </div>

          <p class="iv-review">
            <ClickEdit :value="iv.review" type="longtext" module="interviews" :path="`interviews.${ivIdx(iv)}.review`" placeholder="整体复盘（可选）" />
          </p>

          <div class="iv-insights">
            <template v-for="group in insightGroups(iv.insights)" :key="group.label">
              <div v-if="group.items.length" class="iv-insights-group">
                <div class="iv-insights-title-row">
                  <div class="iv-insights-title" :class="group.cls">{{ group.title }}</div>
                  <EditOnly><button class="btn-add-sm" @click="addInsight(iv, group.label)">+ 添加</button></EditOnly>
                </div>
                <div
                  v-for="(ins, i) in group.items"
                  :key="i"
                  class="iv-insight"
                  :class="{ 'iv-insight--key': ins.key }"
                >
                  <div class="iv-insight-head">
                    <span class="iv-insight-index">{{ i + 1 }}</span>
                    <span class="iv-insight-title">
                      <ClickEdit :value="ins.title" module="interviews" :path="`interviews.${ivIdx(iv)}.insights.${insGlobalIdx(iv, group.label, i)}.title`" placeholder="要点标题" />
                    </span>
                    <EditOnly><button class="key-toggle" :class="{ 'key-toggle--on': ins.key }" @click="toggleInsightKey(iv, group.label, i)" :title="ins.key ? '取消重点' : '标记为重点'">
                      {{ ins.key ? '★ 重点' : '☆ 标记重点' }}
                    </button></EditOnly>
                    <button class="btn-del-sm" @click="removeInsight(iv, group.label, i)" title="删除此条">×</button>
                  </div>
                  <p class="iv-insight-content">
                    <ClickEdit :value="ins.content" type="longtext" module="interviews" :path="`interviews.${ivIdx(iv)}.insights.${insGlobalIdx(iv, group.label, i)}.content`" placeholder="内容（可空；或用下方「现象/风险/改进」分段填）" />
                  </p>
                  <template v-if="ins.phenomenon || ins.risk || ins.improvement || true">
                    <div class="iv-sub"><span class="iv-sub-label">现象</span><span class="iv-sub-body"><ClickEdit :value="ins.phenomenon" module="interviews" :path="`interviews.${ivIdx(iv)}.insights.${insGlobalIdx(iv, group.label, i)}.phenomenon`" placeholder="具体发生了什么" /></span></div>
                    <div class="iv-sub"><span class="iv-sub-label iv-sub-label--risk">风险</span><span class="iv-sub-body"><ClickEdit :value="ins.risk" module="interviews" :path="`interviews.${ivIdx(iv)}.insights.${insGlobalIdx(iv, group.label, i)}.risk`" placeholder="如果不改会怎样" /></span></div>
                    <div class="iv-sub"><span class="iv-sub-label iv-sub-label--fix">改进</span><span class="iv-sub-body"><ClickEdit :value="ins.improvement" module="interviews" :path="`interviews.${ivIdx(iv)}.insights.${insGlobalIdx(iv, group.label, i)}.improvement`" placeholder="下一步怎么做" /></span></div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!interviews.length" class="empty-state">
        <div class="empty-state-icon">🎤</div>
        <p>暂无面试记录</p>
        <p style="font-size: 13px; margin-top: 8px;">点击「编辑面试」后新增</p>
      </div>
      </EditBlock>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from '../composables/useData'
import ClickEdit from '../components/common/ClickEdit.vue'
import EditBlock from '../components/common/EditBlock.vue'
import EditOnly from '../components/common/EditOnly.vue'

const { data, updateField, arrayOp } = useData()

const activeBlock = ref('apps')

const apps = computed(() => data.value.applications?.applications || [])
const statusConfig = computed(() => data.value.applications?.statusConfig || {})

const interviews = computed(() => data.value.interviews?.interviews || [])
const interviewsLastUpdated = computed(() => data.value.interviews?.lastUpdated || '')

const currentFilter = ref('inProgress') // 默认只看进行中

const IN_PROGRESS = ['submitted', 'processing', 'written_test', 'interview_1', 'interview_2', 'interview_3', 'offer']

const filteredApps = computed(() => {
  const list = [...apps.value]
  list.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (b.priority === 'high' && a.priority !== 'high') return 1
    return (b.applyDate || '').localeCompare(a.applyDate || '')
  })
  if (currentFilter.value === 'all') return list
  if (currentFilter.value === 'inProgress') return list.filter(a => IN_PROGRESS.includes(a.currentStatus))
  if (currentFilter.value === 'rejected') return list.filter(a => a.currentStatus === 'rejected')
  if (currentFilter.value === 'notApplied') return list.filter(a => a.currentStatus === 'not_applied' || a.currentStatus === 'withdrawn')
  return list
})

const sortedInterviews = computed(() => {
  return [...interviews.value].sort((a, b) => (b.interviewTime || '').localeCompare(a.interviewTime || ''))
})

const stats = computed(() => {
  const all = apps.value
  return {
    total: all.length,
    inProgress: all.filter(a => IN_PROGRESS.includes(a.currentStatus)).length,
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

const statusOptions = computed(() => Object.entries(statusConfig.value).map(([k, v]) => ({ value: k, label: v.label })))
const ivTypeOptions = [
  { value: '视频', label: '视频' },
  { value: '电话', label: '电话' },
  { value: '现场', label: '现场' },
  { value: 'AI 面试', label: 'AI 面试' }
]

function realIdx(app) {
  return apps.value.findIndex(a => a.id === app.id)
}
function ivIdx(iv) {
  return interviews.value.findIndex(a => a.id === iv.id)
}

function hasNote(app) {
  return app.note && app.note.length > 0
}
const alwaysShowNote = false // 改 true 即可始终显示可点击

function insightGroups(list) {
  const all = list || []
  return [
    { label: 'strength', title: '✅ 优点', cls: 'iv-insights-title--strength', items: all.filter(x => x.category === 'strength') },
    { label: 'weakness', title: '⚠️ 待改进', cls: 'iv-insights-title--weakness', items: all.filter(x => x.category === 'weakness') },
    { label: 'other', title: '💡 面试思考', cls: '', items: all.filter(x => !x.category) }
  ]
}

function insGlobalIdx(iv, catLabel, iInGroup) {
  const list = iv.insights || []
  const filtered = catLabel === 'other' ? list.filter(x => !x.category) : list.filter(x => x.category === catLabel)
  const item = filtered[iInGroup]
  return list.indexOf(item)
}

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

// === 投递记录 CRUD ===
function addApp() {
  const id = 'app_' + Date.now().toString(36)
  const today = new Date().toISOString().slice(0, 10)
  const newApp = {
    id,
    company: '新公司',
    position: '岗位',
    department: '',
    location: '',
    channel: '',
    applyDate: today,
    currentStatus: 'submitted',
    priority: '',
    statusHistory: [{ status: 'submitted', date: today, note: '' }],
    links: {},
    note: ''
  }
  arrayOp('applications', 'applications', 'push', newApp)
}
function removeApp(id) {
  if (!confirm('确定删除此投递？')) return
  const idx = apps.value.findIndex(a => a.id === id)
  if (idx >= 0) arrayOp('applications', 'applications', 'remove', null, idx)
}
function togglePriority(app) {
  const idx = realIdx(app)
  updateField('applications', `applications.${idx}.priority`, app.priority === 'high' ? '' : 'high')
}
function addHistory(app) {
  const idx = realIdx(app)
  const today = new Date().toISOString().slice(0, 10)
  const next = { status: app.currentStatus, date: today, note: '' }
  arrayOp('applications', `applications.${idx}.statusHistory`, 'push', next)
}
function removeHistory(app, si) {
  const idx = realIdx(app)
  arrayOp('applications', `applications.${idx}.statusHistory`, 'remove', null, si)
}

// === 面试复盘 CRUD ===
function addInterview() {
  const id = 'iv_' + Date.now().toString(36)
  const today = new Date().toISOString().slice(0, 10)
  arrayOp('interviews', 'interviews', 'push', {
    id,
    company: '新公司',
    position: '岗位',
    interviewType: '视频',
    interviewTime: `${today} 09:00`,
    status: 'upcoming',
    review: '',
    insights: []
  })
}
function removeInterview(id) {
  if (!confirm('确定删除此面试记录？')) return
  const idx = interviews.value.findIndex(a => a.id === id)
  if (idx >= 0) arrayOp('interviews', 'interviews', 'remove', null, idx)
}
function addInsight(iv, catLabel) {
  const idx = ivIdx(iv)
  const category = catLabel === 'other' ? undefined : catLabel
  arrayOp('interviews', `interviews.${idx}.insights`, 'push', {
    category,
    title: '新要点',
    key: false,
    content: '',
    phenomenon: '',
    risk: '',
    improvement: ''
  })
}
function removeInsight(iv, catLabel, iInGroup) {
  const gi = insGlobalIdx(iv, catLabel, iInGroup)
  if (gi < 0) return
  if (!confirm('确定删除此条？')) return
  const idx = ivIdx(iv)
  arrayOp('interviews', `interviews.${idx}.insights`, 'remove', null, gi)
}
function toggleInsightKey(iv, catLabel, iInGroup) {
  const gi = insGlobalIdx(iv, catLabel, iInGroup)
  const idx = ivIdx(iv)
  const cur = iv.insights?.[gi]?.key || false
  updateField('interviews', `interviews.${idx}.insights.${gi}.key`, !cur)
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

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.toolbar-hint {
  font-size: 12px;
  color: var(--text-light);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card {
  text-align: center;
  padding: 20px;
}
.stat-btn {
  border: 2px solid transparent;
  cursor: pointer;
  font-family: var(--font-family);
  transition: all 0.2s;
}
.stat-btn:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}
.stat-btn--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.18);
  background: rgba(67, 97, 238, 0.04);
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
  position: relative;
}
.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}
.app-info { flex: 1; min-width: 0; }
.app-company {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px;
}
.app-position {
  font-size: 14px;
  color: var(--text-sub);
  margin: 0;
}
.app-dept { color: var(--text-light); }
.app-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: text;
}
.btn-del,
.btn-del-sm {
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-light);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s;
}
.btn-del-sm { width: 20px; height: 20px; font-size: 12px; }
.btn-del:hover,
.btn-del-sm:hover {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

.app-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 12px;
  align-items: center;
}
.priority-toggle {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-family);
  transition: all 0.15s;
}
.priority-toggle--on {
  background: #fff8ec;
  color: var(--warning);
  border-style: solid;
  border-color: var(--warning);
  font-weight: 600;
}

.app-timeline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
  align-items: center;
}
.app-timeline-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 13px;
  color: var(--text-sub);
  background: var(--bg);
  border-radius: 999px;
}
.app-timeline-item:not(:last-of-type)::after {
  content: '→';
  margin-left: 4px;
  color: var(--text-muted);
}
.app-timeline-label { font-weight: 500; }
.app-timeline-date { color: var(--text-light); font-size: 12px; }
.app-timeline-note { color: var(--text-light); font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-add-history,
.btn-add-sm {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-family);
  transition: all 0.15s;
}
.btn-add-history:hover,
.btn-add-sm:hover {
  border-color: var(--primary);
  color: var(--primary);
  border-style: solid;
}

.app-note {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-sub);
  padding: 8px 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  display: flex;
  gap: 6px;
  align-items: flex-start;
}
.note-label { color: var(--text-light); }

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
  gap: 12px;
}
.iv-info { flex: 1; min-width: 0; }
.iv-company {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px;
}
.iv-position {
  font-size: 14px;
  color: var(--text-sub);
  margin: 0;
}
.iv-status-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.iv-status {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  display: inline-block;
  cursor: text;
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
  margin: 0 0 16px;
}
.iv-insights-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.iv-insights-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.iv-insights-title--strength { color: #059669; }
.iv-insights-title--weakness { color: #d97706; }
.iv-insights-group { margin-bottom: 18px; }
.iv-sub {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-sub);
  margin-top: 6px;
  align-items: flex-start;
}
.iv-sub-label {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #eef2f7;
  color: var(--text-sub);
  height: fit-content;
  margin-top: 1px;
}
.iv-sub-label--risk { background: #fde8e8; color: #dc2626; }
.iv-sub-label--fix { background: #e7f5ee; color: #059669; }
.iv-sub-body { flex: 1; }
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
  flex-wrap: wrap;
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
  flex: 1;
  min-width: 0;
}
.key-toggle {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 11px;
  font-family: var(--font-family);
  transition: all 0.15s;
}
.key-toggle--on {
  background: #fff8ec;
  color: var(--warning);
  border-style: solid;
  border-color: var(--warning);
  font-weight: 600;
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