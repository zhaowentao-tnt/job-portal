<template>
  <div class="editor">
    <!-- Learning paths -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">学习路径</span>
        <button class="btn-add btn-sm" @click="addPath" style="width: auto;">+ 添加路径</button>
      </div>
      <div v-for="(path, i) in form.learningPaths" :key="i" class="admin-card" style="background: var(--bg);">
        <div class="admin-card-header">
          <span class="admin-card-title">路径 {{ i + 1 }}</span>
          <button class="btn-danger" @click="form.learningPaths.splice(i, 1)">删除</button>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">路径名称</label><input v-model="path.name" class="form-input" /></div>
          <div class="form-group"><label class="form-label">颜色</label><input v-model="path.color" class="form-input" type="color" style="height: 40px;" /></div>
        </div>
        <div v-for="(item, j) in path.items" :key="j" class="form-row" style="margin-bottom: 8px; align-items: end;">
          <div class="form-group" style="margin: 0; width: 120px;"><label class="form-label">日期</label><input v-model="item.date" class="form-input" /></div>
          <div class="form-group" style="margin: 0; flex: 1;"><label class="form-label">内容</label><input v-model="item.content" class="form-input" /></div>
          <button class="btn-danger" @click="path.items.splice(j, 1)">删除</button>
        </div>
        <button class="btn-add" @click="path.items.push({ date: '', content: '' })">+ 添加节点</button>
      </div>
    </div>

    <!-- Certificates -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">证书与荣誉</span>
        <button class="btn-add btn-sm" @click="addCert" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(cert, i) in form.certificates" :key="i" class="form-row" style="margin-bottom: 8px; align-items: end;">
        <div class="form-group" style="margin: 0; flex: 1;"><label class="form-label">名称</label><input v-model="cert.name" class="form-input" /></div>
        <div class="form-group" style="margin: 0; width: 120px;"><label class="form-label">日期</label><input v-model="cert.date" class="form-input" /></div>
        <button class="btn-danger" @click="form.certificates.splice(i, 1)">删除</button>
      </div>
    </div>

    <!-- Books -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">阅读书单</span>
        <button class="btn-add btn-sm" @click="addBook" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(book, i) in form.books" :key="i" class="form-row" style="margin-bottom: 8px; align-items: end;">
        <div class="form-group" style="margin: 0; flex: 1;"><label class="form-label">书名</label><input v-model="book.title" class="form-input" /></div>
        <div class="form-group" style="margin: 0; flex: 1;"><label class="form-label">作者</label><input v-model="book.author" class="form-input" /></div>
        <div class="form-group" style="margin: 0; width: 100px;">
          <label class="form-label">状态</label>
          <select v-model="book.status" class="form-select"><option>已读</option><option>在读</option><option>想读</option></select>
        </div>
        <button class="btn-danger" @click="form.books.splice(i, 1)">删除</button>
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
if (!form.learningPaths) form.learningPaths = []
if (!form.certificates) form.certificates = []
if (!form.books) form.books = []

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.learningPaths) form.learningPaths = []
  if (!form.certificates) form.certificates = []
  if (!form.books) form.books = []
}, { deep: true })

function addPath() { form.learningPaths.push({ name: '', color: '#4361ee', items: [] }) }
function addCert() { form.certificates.push({ name: '', date: '' }) }
function addBook() { form.books.push({ title: '', author: '', status: '想读' }) }

function save() { emit('save', JSON.parse(JSON.stringify(form))) }
function reset() { emit('reset') }
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 16px; }
.editor-actions { display: flex; gap: 12px; position: sticky; bottom: 0; padding: 16px 0; background: linear-gradient(to top, var(--bg) 60%, transparent); }
</style>
