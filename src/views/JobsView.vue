<template>
  <div class="container jobs-page">
    <div class="head-row">
      <div>
        <h1 class="page-title">招聘信息</h1>
        <p class="page-sub" v-if="data.lastUpdated">最后更新：{{ data.lastUpdated }}</p>
      </div>
      <EditOnly><button class="btn-add" @click="addCompany">+ 添加招聘</button></EditOnly>
    </div>

    <!-- Status filter -->
    <div v-if="companies.length" class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        {{ f.label }} ({{ getCount(f.key) }})
      </button>
    </div>

    <!-- Job cards -->
    <EditBlock editText="编辑招聘" doneText="完成招聘">
    <div v-if="filteredCompanies.length" class="jobs-grid">
      <div v-for="(company, i) in filteredCompanies" :key="company.id || i" class="card job-card">
        <div class="job-header">
          <div style="flex: 1; min-width: 0;">
            <h3 class="job-company">
              <ClickEdit :value="company.company" module="jobs" :path="`companies.${realIdx(company)}.company`" placeholder="公司名" />
            </h3>
            <p class="job-position">
              <ClickEdit :value="company.position" module="jobs" :path="`companies.${realIdx(company)}.position`" placeholder="岗位" />
            </p>
          </div>
          <div class="job-status-wrap">
            <ClickEdit
              :value="company.status"
              type="select"
              :options="statusOptions"
              module="jobs"
              :path="`companies.${realIdx(company)}.status`"
            >
              <template #display>
                <span class="job-status" :class="`job-status--${company.status}`">
                  {{ getStatusText(company.status) }}
                </span>
              </template>
            </ClickEdit>
            <EditOnly><button class="btn-del-x" @click="removeCompany(company.id)">×</button></EditOnly>
          </div>
        </div>

        <div class="job-meta">
          <span>📍 <ClickEdit :value="company.location" module="jobs" :path="`companies.${realIdx(company)}.location`" placeholder="地点" /></span>
          <span>🗓 <ClickEdit :value="company.startDate" module="jobs" :path="`companies.${realIdx(company)}.startDate`" placeholder="开始日期" /></span>
          <span class="job-deadline">⏰ <ClickEdit :value="company.deadline" type="date" module="jobs" :path="`companies.${realIdx(company)}.deadline`" placeholder="截止日期" /></span>
        </div>

        <div class="job-reqs">
          <span v-for="(r, ri) in company.requirements" :key="ri" class="req-wrap">
            <span class="tag">
              <ClickEdit :value="r" module="jobs" :path="`companies.${realIdx(company)}.requirements.${ri}`" placeholder="要求" />
            </span>
            <EditOnly><button class="btn-del-x" @click="removeReq(company, ri)">×</button></EditOnly>
          </span>
          <EditOnly><button class="btn-add-tag" @click="addReq(company)">+ 要求</button></EditOnly>
        </div>

        <p class="job-note">
          <ClickEdit :value="company.note" type="longtext" module="jobs" :path="`companies.${realIdx(company)}.note`" placeholder="备注（点击编辑）" />
        </p>

        <div class="job-link-row">
          <ClickEdit :value="company.url" type="url" module="jobs" :path="`companies.${realIdx(company)}.url`" placeholder="招聘链接（点击编辑）" />
          <a v-if="company.url" :href="company.url" target="_blank" rel="noopener" class="btn btn--primary btn-sm">去投递 →</a>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p>暂无招聘信息</p>
      <EditOnly><button class="btn-add" @click="addCompany" style="margin-top: 12px;">+ 添加招聘</button></EditOnly>
    </div>
    </EditBlock>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from '../composables/useData'
import ClickEdit from '../components/common/ClickEdit.vue'
import EditBlock from '../components/common/EditBlock.vue'
import EditOnly from '../components/common/EditOnly.vue'

const { data, arrayOp } = useData()
const companies = computed(() => data.value.jobs?.companies || [])

const filters = [
  { key: 'all', label: '全部' },
  { key: 'open', label: '招聘中' },
  { key: 'soon', label: '即将开始' },
  { key: 'closed', label: '已结束' }
]

const activeFilter = ref('all')

const filteredCompanies = computed(() => {
  if (activeFilter.value === 'all') return companies.value
  return companies.value.filter(c => c.status === activeFilter.value)
})

function getCount(key) {
  if (key === 'all') return companies.value.length
  return companies.value.filter(c => c.status === key).length
}

function getStatusText(status) {
  const map = { open: '招聘中', soon: '即将开始', closed: '已结束' }
  return map[status] || status
}

const statusOptions = [
  { value: 'open', label: '招聘中' },
  { value: 'soon', label: '即将开始' },
  { value: 'closed', label: '已结束' }
]

function realIdx(company) {
  return companies.value.findIndex(c => c.id === company.id)
}

function addCompany() {
  const id = 'job_' + Date.now().toString(36)
  arrayOp('jobs', 'companies', 'push', {
    id,
    company: '新公司',
    position: '岗位',
    location: '',
    startDate: '',
    deadline: '',
    requirements: [],
    url: '',
    status: 'soon',
    note: ''
  })
}
function removeCompany(id) {
  if (!confirm('删除此招聘？')) return
  const idx = companies.value.findIndex(c => c.id === id)
  if (idx >= 0) arrayOp('jobs', 'companies', 'remove', null, idx)
}
function addReq(company) {
  arrayOp('jobs', `companies.${realIdx(company)}.requirements`, 'push', '新要求')
}
function removeReq(company, ri) {
  arrayOp('jobs', `companies.${realIdx(company)}.requirements`, 'remove', null, ri)
}
</script>

<style scoped>
.jobs-page {
  padding-top: 48px;
}

.head-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px; margin-bottom: 12px;
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

.btn-add {
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--text-light);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-family);
  flex-shrink: 0;
}
.btn-add:hover { border-color: var(--primary); color: var(--primary); }
.btn-del-x {
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-light);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}
.btn-del-x:hover { background: var(--danger); color: #fff; border-color: var(--danger); }
.btn-add-tag {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-light);
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--font-family);
}
.btn-add-tag:hover { border-color: var(--primary); color: var(--primary); }

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--border);
  background: var(--card-bg);
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-family);
}
.filter-btn:hover { border-color: var(--primary); color: var(--primary); }
.filter-btn--active { background: var(--primary); border-color: var(--primary); color: #fff; }

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.job-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.job-company {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.job-position {
  font-size: 14px;
  color: var(--text-sub);
  margin-top: 2px;
}

.job-status-wrap {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
}

.job-status {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: text;
}

.job-status--open { background: var(--success-light, #e6faf3); color: var(--success); }
.job-status--soon { background: var(--warning-light, #fef3c7); color: var(--warning); }
.job-status--closed { background: var(--border-light); color: var(--text-light); }

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--text-light);
}

.job-deadline {
  color: var(--danger);
  font-weight: 500;
}

.job-reqs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.req-wrap {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.tag {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(67,97,238,0.08);
  color: var(--primary);
}

.job-note {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.6;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  margin: 0;
}

.job-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  align-self: flex-start;
}

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  font-family: var(--font-family);
}
.btn--primary {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(67,97,238,0.25);
}
.btn--primary:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(67,97,238,0.4); }
.btn-sm { padding: 6px 14px; font-size: 12px; }

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--text-light);
}
.empty-state-icon { font-size: 40px; margin-bottom: 12px; }
</style>