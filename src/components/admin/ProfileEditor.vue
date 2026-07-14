<template>
  <div class="editor">
    <!-- Hero background & Logo & Avatar -->
    <div class="admin-card">
      <div class="admin-card-header"><span class="admin-card-title">Hero 区视觉</span></div>
      
      <div class="form-group">
        <label class="form-label">导航栏 Logo 图片</label>
        <p class="form-hint">替换导航栏左上角的"赵"字图标。建议使用正方形图片，会自动裁切为圆角方块。</p>
        <ImageUpload
          :modelValue="form.logo || ''"
          @update:modelValue="form.logo = $event"
          :urlValue="form.logoPath || ''"
          @update:urlValue="form.logoPath = $event"
          placeholder-icon="🏷️"
          placeholder-text="上传 Logo 图片"
          preview-width="80px"
          preview-height="80px"
          preview-radius="16px"
          url-placeholder="或输入图片路径，如 /images/logo.png"
          url-hint="不上传则显示姓名首字。"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Hero 区头像图片</label>
        <p class="form-hint">替换 Hero 区右侧圆形头像里的"赵"字。建议使用正方形照片。</p>
        <ImageUpload
          :modelValue="form.avatar || ''"
          @update:modelValue="form.avatar = $event"
          :urlValue="form.avatarPath || ''"
          @update:urlValue="form.avatarPath = $event"
          placeholder-icon="👤"
          placeholder-text="上传头像图片"
          preview-width="100px"
          preview-height="100px"
          preview-radius="50%"
          url-placeholder="或输入图片路径，如 /images/avatar.jpg"
          url-hint="不上传则显示姓名首字。"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Hero 区背景图片</label>
        <p class="form-hint">替换 Hero 区的渐变背景。建议使用宽幅图片（1920×600以上），上传后会自动铺满并叠加半透明遮罩保证文字可读。</p>
        <ImageUpload
          :modelValue="form.heroBg || ''"
          @update:modelValue="form.heroBg = $event"
          :urlValue="form.heroBgPath || ''"
          @update:urlValue="form.heroBgPath = $event"
          placeholder-icon="🌅"
          placeholder-text="上传 Hero 背景图片"
          preview-width="280px"
          preview-height="120px"
          preview-radius="12px"
          url-placeholder="或输入图片路径，如 /images/hero-bg.jpg"
          url-hint="不上传则使用默认渐变背景。"
        />
      </div>
    </div>

    <!-- Basic info -->
    <div class="admin-card">
      <div class="admin-card-header"><span class="admin-card-title">基本信息</span></div>
      <div class="form-group">
        <label class="form-label">姓名</label>
        <input v-model="form.name" class="form-input" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">职位/身份</label>
          <input v-model="form.title" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">一句话标语</label>
          <input v-model="form.tagline" class="form-input" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">个人简介</label>
        <textarea v-model="form.summary" class="form-textarea" rows="4"></textarea>
      </div>
    </div>

    <!-- Links -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">链接按钮</span>
        <button class="btn-add btn-sm" @click="addLink" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(link, i) in form.links" :key="i" class="link-item">
        <div class="form-row" style="margin-bottom: 8px; align-items: end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">按钮文字</label>
            <input v-model="link.label" class="form-input" />
          </div>
          <div class="form-group" style="margin: 0; width: 100px;">
            <label class="form-label">类型</label>
            <select v-model="link.type" class="form-input">
              <option value="url">网址链接</option>
              <option value="email">发邮件</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0; width: 60px;">
            <label class="form-label">图标</label>
            <input v-model="link.icon" class="form-input" />
          </div>
          <label class="form-label" style="display: flex; align-items: center; gap: 4px; white-space: nowrap; padding-bottom: 12px;">
            <input type="checkbox" v-model="link.primary" /> 主按钮
          </label>
          <button class="btn-danger" @click="form.links.splice(i, 1)">删除</button>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label">{{ link.type === 'email' ? '邮箱地址' : '链接URL' }}</label>
          <input
            v-model="link.url"
            class="form-input"
            :placeholder="link.type === 'email' ? '如：zhaowentao@email.com' : '如：https://github.com/yourname'"
          />
          <p v-if="link.type === 'email'" class="form-hint">点击按钮会自动打开邮件客户端，收件人填为此邮箱。</p>
        </div>
      </div>
    </div>

    <!-- Capabilities -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">核心能力</span>
        <button class="btn-add btn-sm" @click="addCapability" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(cap, i) in form.capabilities" :key="i" class="admin-card" style="background: var(--bg);">
        <div class="admin-card-header">
          <span class="admin-card-title">能力 {{ i + 1 }}</span>
          <button class="btn-danger" @click="form.capabilities.splice(i, 1)">删除</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">名称</label>
            <input v-model="cap.name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">图标 (emoji)</label>
            <input v-model="cap.icon" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">左边框颜色</label>
          <input v-model="cap.color" class="form-input" type="color" style="height: 40px;" />
        </div>
        <div class="form-group">
          <label class="form-label">技能标签 (逗号分隔)</label>
          <input :value="cap.skills.join(', ')" @input="cap.skills = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)" class="form-input" />
          <p class="form-hint">如：Python, Stata, Power BI</p>
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title">联系方式</span>
        <button class="btn-add btn-sm" @click="addContact" style="width: auto;">+ 添加</button>
      </div>
      <div v-for="(item, i) in form.contact" :key="i" class="form-row" style="margin-bottom: 8px; align-items: end;">
        <div class="form-group" style="margin: 0; width: 60px;">
          <label class="form-label">图标</label>
          <input v-model="item.icon" class="form-input" />
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label">标签</label>
          <input v-model="item.label" class="form-input" />
        </div>
        <div class="form-group" style="margin: 0; flex: 1;">
          <label class="form-label">内容</label>
          <input v-model="item.value" class="form-input" />
        </div>
        <button class="btn-danger" @click="form.contact.splice(i, 1)">删除</button>
      </div>
    </div>

    <!-- Actions -->
    <div class="editor-actions">
      <button class="btn btn--primary" @click="save">💾 保存到本地</button>
      <button class="btn btn--outline" @click="reset">↻ 重置</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import ImageUpload from '../shared/ImageUpload.vue'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const emit = defineEmits(['save', 'reset'])

const form = reactive(JSON.parse(JSON.stringify(props.data)))

// Ensure new fields exist
if (!form.logo) form.logo = ''
if (!form.logoPath) form.logoPath = ''
if (!form.avatar) form.avatar = ''
if (!form.avatarPath) form.avatarPath = ''
if (!form.heroBg) form.heroBg = ''
if (!form.heroBgPath) form.heroBgPath = ''

// Ensure links have type field
if (form.links) {
  form.links.forEach(link => {
    if (!link.type) link.type = 'url'
  })
}

watch(() => props.data, (newVal) => {
  Object.assign(form, JSON.parse(JSON.stringify(newVal)))
  if (!form.logo) form.logo = ''
  if (!form.logoPath) form.logoPath = ''
  if (!form.avatar) form.avatar = ''
  if (!form.avatarPath) form.avatarPath = ''
  if (!form.heroBg) form.heroBg = ''
  if (!form.heroBgPath) form.heroBgPath = ''
  if (form.links) {
    form.links.forEach(link => {
      if (!link.type) link.type = 'url'
    })
  }
}, { deep: true })

function addLink() {
  if (!form.links) form.links = []
  form.links.push({ label: '', url: '', icon: '🔗', primary: false, type: 'url' })
}

function addCapability() {
  if (!form.capabilities) form.capabilities = []
  form.capabilities.push({ name: '', icon: '⭐', color: '#4361ee', skills: [] })
}

function addContact() {
  if (!form.contact) form.contact = []
  form.contact.push({ icon: '📍', label: '', value: '' })
}

function save() {
  emit('save', JSON.parse(JSON.stringify(form)))
}

function reset() {
  emit('reset')
}
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.link-item {
  padding: 12px;
  background: var(--bg);
  border-radius: 10px;
  margin-bottom: 8px;
}

.editor-actions {
  display: flex;
  gap: 12px;
  position: sticky;
  bottom: 0;
  padding: 16px 0;
  background: linear-gradient(to top, var(--bg) 60%, transparent);
}
</style>
