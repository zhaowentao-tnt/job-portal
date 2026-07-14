<template>
  <div class="editor">
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">招聘公司信息</span>
        <button class="btn-add btn-sm" @click="addCompany" style="width: auto;">+ 添加公司</button>
      </div>
    </div>

    <div v-for="(company, i) in form.companies" :key="i" class="admin-card" style="background: var(--bg);">
      <div class="admin-card-header">
        <span class="admin-card-title">{{ company.company || '未命名' }}</span>
        <button class="btn-danger" @click="form.companies.splice(i, 1)">删除</button>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">公司名称</label><input v-model="company.company" class="form-input" /></div>
        <div class="form-group"><label class="form-label">岗位</label><input v-model="company.position" class="form-input" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">工作地点</label><input v-model="company.location" class="form-input" /></div>
        <div class="form-group"><label class="form-label">投递链接</label><input v-model="company.url" class="form-input" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">招聘开始</label><input v-model="company.startDate" class="form-input" placeholder="2026-07-01" /></div>
        <div class="form-group"><label class="form-label">截止日期</label><input v-model="company.deadline" class="form-input" placeholder="2026-08-31" /></div>
      </div>
      <div class="form-group">
        <label class="form-label">状态</label>
        <select v-model="company.status" class="form-select">
          <option value="open">招聘中</option>
          <option value="soon">即将开始</option>
          <option value="closed">已结束</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">要求 (逗号分隔)</label>
        <input :value="(company.requirements || []).join(', ')" @input="company.requirements = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" />
      </div>
      <div class="form-group"><label class="form-label">备注</label><textarea v-model="company.note" class="form-textarea" rows="2"></textarea></div>
    </div>

    <div v-if="!form.companies || !form.companies.length" class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p>暂无招聘信息，点击上方"+ 添加公司"开始</p>
    </div>

    <div class="editor-actions">
      <button class="btn btn--primary" @click="save">💾 保存到本地</button>
      <button class="btn btn--outline" @click="reset">↻ 重置</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit = defineEmits(['save', 'reset'])

const form = reactive(JSON.parse(JSON.stringify(props.data)))
if (!form.companies) form.companies = []

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.companies) form.companies = []
}, { deep: true })

function addCompany() {
  form.companies.push({
    company: '', position: '', location: '', url: '',
    startDate: '', deadline: '', status: 'open',
    requirements: [], note: ''
  })
}

function save() { emit('save', JSON.parse(JSON.stringify(form))) }
function reset() { emit('reset') }
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; gap: 12px; position: sticky; bottom: 0; padding: 16px 0; background: linear-gradient(to top, var(--bg) 60%, transparent); }
</style>
