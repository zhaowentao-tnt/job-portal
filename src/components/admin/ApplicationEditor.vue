<template>
  <div class="editor">
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">投递记录</span>
        <button class="btn-add btn-sm" @click="addApp" style="width: auto;">+ 添加投递</button>
      </div>
      <p class="form-hint" style="margin-bottom: 12px;">每次状态变化在"状态历史"中添加一条记录，最新的状态自动设为当前状态。</p>
    </div>

    <div v-for="(app, i) in form.applications" :key="i" class="admin-card" style="background: var(--bg);">
      <div class="admin-card-header">
        <span class="admin-card-title">{{ app.company || '未命名' }} - {{ app.position || '' }}</span>
        <button class="btn-danger" @click="form.applications.splice(i, 1)">删除</button>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">公司</label><input v-model="app.company" class="form-input" /></div>
        <div class="form-group"><label class="form-label">岗位</label><input v-model="app.position" class="form-input" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">部门 (可选)</label><input v-model="app.department" class="form-input" /></div>
        <div class="form-group"><label class="form-label">地点</label><input v-model="app.location" class="form-input" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">投递日期</label><input v-model="app.applyDate" class="form-input" placeholder="2026-06-15" /></div>
        <div class="form-group">
          <label class="form-label">优先级</label>
          <select v-model="app.priority" class="form-select">
            <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">渠道</label><input v-model="app.channel" class="form-input" placeholder="官网投递 / 内推 / BOSS直聘" /></div>

      <!-- Status history -->
      <div class="form-group">
        <label class="form-label">状态历史</label>
        <div v-for="(sh, j) in app.statusHistory" :key="j" class="form-row" style="margin-bottom: 6px; align-items: end;">
          <div class="form-group" style="margin: 0; width: 140px;">
            <select v-model="sh.status" class="form-select">
              <option v-for="(cfg, key) in statusConfig" :key="key" :value="key">{{ cfg.label }}</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0; width: 130px;"><input v-model="sh.date" class="form-input" placeholder="2026-06-20" /></div>
          <div class="form-group" style="margin: 0; flex: 1;"><input v-model="sh.note" class="form-input" placeholder="备注" /></div>
          <button class="btn-danger" @click="app.statusHistory.splice(j, 1)">删除</button>
        </div>
        <button class="btn-add" @click="addStatus(app)">+ 添加状态</button>
      </div>

      <div class="form-group"><label class="form-label">备注</label><textarea v-model="app.note" class="form-textarea" rows="2"></textarea></div>
    </div>

    <div class="editor-actions">
      <button class="btn btn--primary" @click="save">💾 保存到本地</button>
      <button class="btn btn--outline" @click="reset">↻ 重置</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit = defineEmits(['save', 'reset'])

const form = reactive(JSON.parse(JSON.stringify(props.data)))
if (!form.applications) form.applications = []
if (!form.statusConfig) {
  form.statusConfig = {
    submitted: { label: '已投递', color: '#4361ee' },
    written_test: { label: '笔试', color: '#8b5cf6' },
    interview_1: { label: '一面', color: '#f59e0b' },
    interview_2: { label: '二面', color: '#f97316' },
    interview_3: { label: '三面', color: '#ea580c' },
    offer: { label: 'Offer', color: '#10b981' },
    rejected: { label: '未通过', color: '#9ca3af' },
    withdrawn: { label: '已撤回', color: '#d1d5db' }
  }
}

const statusConfig = computed(() => form.statusConfig || {})

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.applications) form.applications = []
}, { deep: true })

let counter = form.applications.length + 1
function addApp() {
  form.applications.push({
    id: `app_${String(counter++).padStart(3, '0')}`,
    company: '', position: '', department: '', location: '',
    channel: '', applyDate: '', currentStatus: 'submitted', priority: 'medium',
    statusHistory: [{ status: 'submitted', date: '', note: '' }],
    note: ''
  })
}

function addStatus(app) {
  if (!app.statusHistory) app.statusHistory = []
  app.statusHistory.push({ status: 'submitted', date: '', note: '' })
}

function save() {
  // Auto-update currentStatus from last statusHistory entry
  form.applications.forEach(app => {
    if (app.statusHistory && app.statusHistory.length) {
      app.currentStatus = app.statusHistory[app.statusHistory.length - 1].status
    }
  })
  emit('save', JSON.parse(JSON.stringify(form)))
}

function reset() { emit('reset') }
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; gap: 12px; position: sticky; bottom: 0; padding: 16px 0; background: linear-gradient(to top, var(--bg) 60%, transparent); }
</style>
