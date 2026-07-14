<template>
  <div class="editor">
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">作品列表</span>
        <button class="btn-add btn-sm" @click="addItem" style="width: auto;">+ 添加作品</button>
      </div>
      <p class="form-hint" style="margin-bottom: 12px;">标记为"精选"的作品会在精选区大幅展示，其余在网格中展示。</p>
    </div>

    <div v-for="(item, i) in form.items" :key="i" class="admin-card" style="background: var(--bg);">
      <div class="admin-card-header">
        <span class="admin-card-title">作品 {{ i + 1 }}: {{ item.title || '未命名' }}</span>
        <button class="btn-danger" @click="form.items.splice(i, 1)">删除</button>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">标题</label><input v-model="item.title" class="form-input" /></div>
        <div class="form-group">
          <label class="form-label">分类</label>
          <select v-model="item.category" class="form-select">
            <option>项目</option><option>文章</option><option>AI应用</option><option>其他</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">日期</label><input v-model="item.date" class="form-input" placeholder="2026-07" /></div>
        <div class="form-group">
          <label class="form-label">ID (英文+数字)</label>
          <input v-model="item.id" class="form-input" placeholder="p001" />
        </div>
      </div>
      <div class="form-group"><label class="form-label">简短描述</label><input v-model="item.description" class="form-input" /></div>
      <div class="form-group"><label class="form-label">详细内容</label><textarea v-model="item.detail" class="form-textarea" rows="3"></textarea></div>
      <div class="form-group">
        <label class="form-label">技术栈 (逗号分隔)</label>
        <input :value="(item.techStack || []).join(', ')" @input="item.techStack = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">亮点 (逗号分隔)</label>
        <input :value="(item.highlights || []).join(', ')" @input="item.highlights = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" />
      </div>
      <label class="form-label" style="display: flex; align-items: center; gap: 6px;">
        <input type="checkbox" v-model="item.featured" /> ⭐ 精选作品（大幅展示）
      </label>
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
if (!form.items) form.items = []

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.items) form.items = []
}, { deep: true })

let counter = form.items.length + 1
function addItem() {
  form.items.push({ id: `p${String(counter++).padStart(3, '0')}`, title: '', category: '项目', description: '', detail: '', highlights: [], techStack: [], date: '', featured: false })
}

function save() { emit('save', JSON.parse(JSON.stringify(form))) }
function reset() { emit('reset') }
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; gap: 12px; position: sticky; bottom: 0; padding: 16px 0; background: linear-gradient(to top, var(--bg) 60%, transparent); }
</style>
