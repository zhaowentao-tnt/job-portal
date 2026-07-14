<template>
  <div class="container jobs-page">
    <h1 class="page-title">招聘信息</h1>
    <p class="page-sub" v-if="data.lastUpdated">最后更新：{{ data.lastUpdated }}</p>

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
    <div v-if="filteredCompanies.length" class="jobs-grid">
      <div v-for="(company, i) in filteredCompanies" :key="i" class="card job-card">
        <div class="job-header">
          <div>
            <h3 class="job-company">{{ company.company }}</h3>
            <p class="job-position">{{ company.position }}</p>
          </div>
          <span class="job-status" :class="`job-status--${company.status}`">
            {{ getStatusText(company.status) }}
          </span>
        </div>

        <div class="job-meta">
          <span v-if="company.location">📍 {{ company.location }}</span>
          <span v-if="company.startDate">🗓 招聘开始：{{ company.startDate }}</span>
          <span v-if="company.deadline" class="job-deadline">⏰ 截止：{{ company.deadline }}</span>
        </div>

        <div v-if="company.requirements && company.requirements.length" class="job-reqs">
          <span v-for="r in company.requirements" :key="r" class="tag">{{ r }}</span>
        </div>

        <p v-if="company.note" class="job-note">{{ company.note }}</p>

        <a v-if="company.url" :href="company.url" target="_blank" rel="noopener" class="btn btn--primary btn-sm" style="align-self: flex-start;">
          去投递 →
        </a>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p>暂无招聘信息</p>
      <p style="font-size: 13px; margin-top: 8px;">请在管理面板中添加目标公司招聘信息</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData } from '../composables/useData'

const { data } = useData()
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
</script>

<style scoped>
.jobs-page {
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

/* Filter */
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

/* Job cards */
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
}

.job-company {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.job-position {
  font-size: 14px;
  color: var(--text-sub);
  margin-top: 2px;
}

.job-status {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
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
}

.job-note {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.6;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
}
</style>
