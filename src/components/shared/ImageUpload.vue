<template>
  <div class="image-upload">
    <!-- Preview -->
    <div class="upload-preview" @click="triggerUpload">
      <img v-if="modelValue" :src="modelValue" class="preview-img" :style="previewStyle" />
      <div v-else class="upload-placeholder" :style="placeholderStyle">
        <span class="upload-icon">{{ placeholderIcon }}</span>
        <span class="upload-text">{{ placeholderText }}</span>
      </div>
      <div class="upload-overlay">
        <span>{{ modelValue ? '点击更换' : '点击上传' }}</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="upload-controls">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="upload-input"
        @change="handleFile"
      />
      <button v-if="modelValue" class="btn-clear" @click="clearImage">清除</button>
    </div>

    <!-- URL input (optional, for path-based images) -->
    <div class="upload-url">
      <input
        :value="urlInput"
        class="form-input upload-url-input"
        :placeholder="urlPlaceholder"
        @input="$emit('update:urlValue', $event.target.value)"
      />
      <p class="form-hint">{{ urlHint }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  urlValue: { type: String, default: '' },
  placeholderIcon: { type: String, default: '🖼️' },
  placeholderText: { type: String, default: '点击上传图片' },
  previewWidth: { type: String, default: '100%' },
  previewHeight: { type: String, default: '120px' },
  previewRadius: { type: String, default: '12px' },
  urlPlaceholder: { type: String, default: '或输入图片路径，如 /images/hero.jpg' },
  urlHint: { type: String, default: '上传图片会保存为base64编码，适合预览。正式部署时建议把图片放到 public/images/ 目录，然后在这里填写路径。' }
})

const emit = defineEmits(['update:modelValue', 'update:urlValue'])

const fileInput = ref(null)

const urlInput = computed(() => props.urlValue || '')

const previewStyle = computed(() => ({
  borderRadius: props.previewRadius
}))

const placeholderStyle = computed(() => ({
  width: props.previewWidth,
  height: props.previewHeight,
  borderRadius: props.previewRadius
}))

function triggerUpload() {
  fileInput.value?.click()
}

function handleFile(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('图片不能超过 2MB，请压缩后再上传')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    emit('update:modelValue', event.target.result)
  }
  reader.readAsDataURL(file)
  // Reset input so the same file can be selected again
  e.target.value = ''
}

function clearImage() {
  emit('update:modelValue', '')
  emit('update:urlValue', '')
}
</script>

<style scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-preview {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  width: fit-content;
  border: 2px dashed var(--border);
  transition: border-color 0.2s;
}

.upload-preview:hover {
  border-color: var(--primary);
}

.preview-img {
  display: block;
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg);
  color: var(--text-light);
  width: 100%;
}

.upload-icon {
  font-size: 28px;
}

.upload-text {
  font-size: 13px;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s;
}

.upload-preview:hover .upload-overlay {
  opacity: 1;
}

.upload-input {
  display: none;
}

.upload-controls {
  display: flex;
  gap: 8px;
}

.btn-clear {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--danger, #e53e3e);
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #fef2f2;
  border-color: var(--danger, #e53e3e);
}

.upload-url-input {
  font-size: 13px;
}
</style>
