<template>
  <div class="editor">
    <!-- Education -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">教育背景</span>
        <button class="btn-add btn-sm" @click="addEdu" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(edu, i) in form.education" :key="i" class="admin-card" style="background: var(--bg);">
        <div class="admin-card-header">
          <span class="admin-card-title">教育 {{ i + 1 }}</span>
          <button class="btn-danger" @click="form.education.splice(i, 1)">删除</button>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">学校</label><input v-model="edu.school" class="form-input" /></div>
          <div class="form-group"><label class="form-label">学位</label><input v-model="edu.degree" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">专业</label><input v-model="edu.major" class="form-input" /></div>
          <div class="form-group"><label class="form-label">学院 (可选)</label><input v-model="edu.department" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">开始日期</label><input v-model="edu.startDate" class="form-input" placeholder="2024-09" /></div>
          <div class="form-group"><label class="form-label">结束日期</label><input v-model="edu.endDate" class="form-input" placeholder="2027-06" /></div>
        </div>
        <div class="form-group"><label class="form-label">GPA (可选)</label><input v-model="edu.gpa" class="form-input" /></div>
        <div class="form-group"><label class="form-label">一句话描述</label><input v-model="edu.description" class="form-input" placeholder="如：财政学硕士，主攻财税政策与实证分析" /></div>
        <div class="form-group"><label class="form-label">亮点 (逗号分隔)</label><input :value="(edu.highlights || []).join(', ')" @input="edu.highlights = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" /></div>
      </div>
    </div>

    <!-- 实习经历 -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">实习经历</span>
        <button class="btn-add btn-sm" @click="addExp" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(exp, i) in form.experiences" :key="i" class="admin-card" style="background: var(--bg);">
        <div class="admin-card-header">
          <span class="admin-card-title">经历 {{ i + 1 }}</span>
          <button class="btn-danger" @click="form.experiences.splice(i, 1)">删除</button>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">公司</label><input v-model="exp.company" class="form-input" /></div>
          <div class="form-group"><label class="form-label">职位</label><input v-model="exp.position" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">部门 (可选)</label><input v-model="exp.department" class="form-input" /></div>
          <div class="form-group"><label class="form-label">地点 (可选)</label><input v-model="exp.location" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">开始日期</label><input v-model="exp.startDate" class="form-input" placeholder="2024-07" /></div>
          <div class="form-group"><label class="form-label">结束日期 (留空=至今)</label><input v-model="exp.endDate" class="form-input" /></div>
        </div>
        <label class="form-label" style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
          <input type="checkbox" v-model="exp.current" /> 当前在职
        </label>
        <div class="form-group"><label class="form-label">工作描述</label><textarea v-model="exp.description" class="form-textarea" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">成就 (逗号分隔)</label><input :value="(exp.achievements || []).join(', ')" @input="exp.achievements = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" /></div>
      </div>
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
if (!form.education) form.education = []
if (!form.experiences) form.experiences = []

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.education) form.education = []
  if (!form.experiences) form.experiences = []
}, { deep: true })

function addEdu() {
  form.education.push({ school: '', degree: '', major: '', department: '', description: '', startDate: '', endDate: '', gpa: '', highlights: [] })
}

function addExp() {
  form.experiences.push({ company: '', position: '', startDate: '', endDate: '', current: false, description: '', achievements: [] })
}

function save() { emit('save', JSON.parse(JSON.stringify(form))) }
function reset() { emit('reset') }
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; gap: 12px; position: sticky; bottom: 0; padding: 16px 0; background: linear-gradient(to top, var(--bg) 60%, transparent); }
</style>
