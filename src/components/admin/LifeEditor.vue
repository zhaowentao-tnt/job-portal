<template>
  <div class="editor">
    <!-- Campus -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">社团经历</span>
        <button class="btn-add btn-sm" @click="addCampus" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(role, i) in form.campus" :key="i" class="admin-card" style="background: var(--bg);">
        <div class="admin-card-header">
          <span class="admin-card-title">经历 {{ i + 1 }}</span>
          <button class="btn-danger" @click="form.campus.splice(i, 1)">删除</button>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">角色</label><input v-model="role.role" class="form-input" /></div>
          <div class="form-group"><label class="form-label">组织</label><input v-model="role.organization" class="form-input" /></div>
        </div>
        <div class="form-group"><label class="form-label">时间段</label><input v-model="role.period" class="form-input" placeholder="2024.09-至今" /></div>
        <div class="form-group">
          <label class="form-label">成就 (逗号分隔)</label>
          <input :value="(role.achievements || []).join(', ')" @input="role.achievements = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" />
        </div>
      </div>
    </div>

    <!-- Interests -->
    <div class="admin-card">
      <div class="admin-card-header"><span class="admin-card-title">兴趣爱好</span></div>
      <div class="form-group">
        <label class="form-label">兴趣标签 (逗号分隔)</label>
        <input :value="(form.interests || []).join(', ')" @input="form.interests = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" />
        <p class="form-hint">如：摄影, 运动, 阅读, AI探索</p>
      </div>
    </div>

    <div class="admin-card">
      <p class="form-hint">📷 照片功能将在后续版本支持上传</p>
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
if (!form.campus) form.campus = []
if (!form.interests) form.interests = []
if (!form.photos) form.photos = []

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.campus) form.campus = []
  if (!form.interests) form.interests = []
}, { deep: true })

function addCampus() { form.campus.push({ role: '', organization: '', period: '', achievements: [] }) }

function save() { emit('save', JSON.parse(JSON.stringify(form))) }
function reset() { emit('reset') }
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; gap: 12px; position: sticky; bottom: 0; padding: 16px 0; background: linear-gradient(to top, var(--bg) 60%, transparent); }
</style>
