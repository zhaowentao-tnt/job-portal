<template>
  <div class="editor">
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">面试记录</span>
        <button class="btn-add btn-sm" @click="addIv" style="width: auto;">+ 添加面试</button>
      </div>
      <p class="form-hint" style="margin-bottom: 12px;">记录每一次面试的过程与复盘思考。勾选「重点」会在网页上高亮该条思考。</p>
    </div>

    <div v-for="(iv, i) in form.interviews" :key="i" class="admin-card" style="background: var(--bg);">
      <div class="admin-card-header">
        <span class="admin-card-title">{{ iv.company || '未命名' }} - {{ iv.position || '' }}</span>
        <button class="btn-danger" @click="form.interviews.splice(i, 1)">删除</button>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">公司 / 项目</label><input v-model="iv.company" class="form-input" /></div>
        <div class="form-group"><label class="form-label">岗位 / 面试名称</label><input v-model="iv.position" class="form-input" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">面试方式</label><input v-model="iv.interviewType" class="form-input" placeholder="视频面试 / 现场面试" /></div>
        <div class="form-group"><label class="form-label">面试时间</label><input v-model="iv.interviewTime" class="form-input" placeholder="2026-07-11 19:00" /></div>
      </div>
      <div class="form-group">
        <label class="form-label">状态</label>
        <select v-model="iv.status" class="form-select">
          <option value="completed">已完成</option>
          <option value="upcoming">待进行</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">面试回顾</label>
        <textarea v-model="iv.review" class="form-textarea" rows="3" placeholder="面试整体情况、形式、流程等"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">面试思考</label>
        <div v-for="(ins, j) in iv.insights" :key="j" class="insight-edit">
          <div class="form-row" style="align-items: end; margin-bottom: 6px;">
            <div class="form-group" style="margin: 0; flex: 1;">
              <input v-model="ins.title" class="form-input" placeholder="观点标题，如：自然胜过背诵" />
            </div>
            <label class="key-check">
              <input type="checkbox" v-model="ins.key" /> 重点
            </label>
            <button class="btn-danger" @click="iv.insights.splice(j, 1)">删除</button>
          </div>
          <textarea v-model="ins.content" class="form-textarea" rows="2" placeholder="具体说明"></textarea>
        </div>
        <button class="btn-add" @click="addInsight(iv)">+ 添加思考</button>
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
if (!form.interviews) form.interviews = []

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.interviews) form.interviews = []
}, { deep: true })

let counter = form.interviews.length + 1
function addIv() {
  form.interviews.push({
    id: `iv_${String(counter++).padStart(3, '0')}`,
    company: '', position: '', interviewType: '', interviewTime: '',
    status: 'completed', review: '', insights: []
  })
}

function addInsight(iv) {
  if (!iv.insights) iv.insights = []
  iv.insights.push({ title: '', key: true, content: '' })
}

function save() {
  emit('save', JSON.parse(JSON.stringify(form)))
}

function reset() { emit('reset') }
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; gap: 12px; position: sticky; bottom: 0; padding: 16px 0; background: linear-gradient(to top, var(--bg) 60%, transparent); }
.insight-edit {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin-bottom: 8px;
  background: #fff;
}
.key-check {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-sub);
  white-space: nowrap;
  padding: 0 8px;
}
</style>
