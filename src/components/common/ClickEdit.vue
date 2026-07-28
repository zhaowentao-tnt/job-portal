<template>
  <span class="ce" :class="{ 'is-editing': editing, 'is-empty': !hasValue, 'is-readonly': !editable }">
    <!-- 默认展示态 -->
    <span v-if="!editing" class="ce-display" @click="startEdit" :title="editable ? '点击编辑' : ''">
      <slot name="display">
        <a v-if="isUrl" :href="displayText" target="_blank" rel="noopener noreferrer" class="ce-link" @click.stop>{{ displayText }}</a>
        <template v-else>{{ displayText }}</template>
      </slot>
      <span v-if="!hasValue && placeholder && editable" class="ce-placeholder">{{ placeholder }}</span>
    </span>

    <!-- 编辑态 -->
    <template v-else>
      <input
        v-if="type === 'text' || type === 'url' || type === 'email' || type === 'number'"
        ref="inputEl"
        v-model="draft"
        type="text"
        class="ce-input"
        :placeholder="placeholder"
        @blur="commit"
        @keydown.enter.prevent="commit"
        @keydown.esc.prevent="cancel"
      />
      <input
        v-else-if="type === 'date'"
        ref="inputEl"
        v-model="draft"
        type="date"
        class="ce-input"
        @blur="commit"
        @keydown.enter.prevent="commit"
        @keydown.esc.prevent="cancel"
      />
      <textarea
        v-else-if="type === 'longtext'"
        ref="inputEl"
        v-model="draft"
        class="ce-textarea"
        :placeholder="placeholder"
        rows="3"
        @blur="commit"
        @keydown.esc.prevent="cancel"
      />
      <select
        v-else-if="type === 'select'"
        ref="inputEl"
        v-model="draft"
        class="ce-select"
        @change="commit"
        @blur="cancel"
        @keydown.esc.prevent="cancel"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </template>
  </span>
</template>

<script setup>
import { ref, computed, nextTick, inject } from 'vue'
import { useData } from '../../composables/useData'

const props = defineProps({
  value: { default: '' },
  type: { type: String, default: 'text' }, // text|longtext|date|url|email|number|select
  options: { type: Array, default: () => [] }, // [{value,label}] for select
  placeholder: { type: String, default: '点击编辑' },
  module: { type: String, default: '' }, // 数据模块名（applications / profile ...）
  path: { type: String, default: '' },   // 字段路径，如 'applications.0.currentStatus'
  display: { type: String, default: '' }, // 强制展示文案（覆盖默认展示）
  editable: { type: Boolean, default: null } // 显式强制；null=跟随区块 EditBlock
})

const emit = defineEmits(['update:value'])

const { updateField } = useData()

// 区块编辑开关：由最近的 EditBlock 通过 provide 注入
const blockEditable = inject('blockEditable', null)
const editable = computed(() => {
  if (props.editable !== null && props.editable !== undefined) return props.editable
  if (blockEditable) return blockEditable.value
  return true // 不在任何区块内时，默认可编辑（兜底）
})

const editing = ref(false)
const draft = ref('')
const inputEl = ref(null)

const hasValue = computed(() => {
  const v = props.value
  return v !== '' && v !== null && v !== undefined
})

const displayText = computed(() => {
  if (props.display) return props.display
  if (props.type === 'select') {
    const opt = props.options.find(o => String(o.value) === String(props.value))
    return opt?.label || String(props.value || '')
  }
  return String(props.value ?? '')
})

const isUrl = computed(() => {
  const text = displayText.value
  return typeof text === 'string' && /^https?:\/\/\S+/i.test(text)
})

async function startEdit(e) {
  if (!editable.value) return // 只读区块：点击文字不触发编辑
  e?.stopPropagation()
  draft.value = props.value == null ? '' : String(props.value)
  editing.value = true
  await nextTick()
  const el = inputEl.value
  if (el) {
    el.focus()
    if (typeof el.select === 'function' && (el.tagName === 'INPUT' && props.type !== 'date')) {
      el.select()
    }
  }
}

function commit() {
  if (String(draft.value) !== String(props.value ?? '')) {
    if (props.module && props.path) {
      updateField(props.module, props.path, draft.value)
    }
    emit('update:value', draft.value)
  }
  editing.value = false
}

function cancel() {
  editing.value = false
}
</script>

<style scoped>
.ce {
  display: inline;
  position: relative;
}
.ce-display {
  cursor: text;
  border-bottom: 1px dashed transparent;
  padding: 1px 2px;
  border-radius: 3px;
  transition: background 0.15s, border-color 0.15s;
  word-break: break-word;
}
.ce-display:hover {
  background: rgba(67, 97, 238, 0.06);
  border-bottom-color: var(--primary);
}
/* 只读区块：无任何编辑提示，看起来就是普通文字 */
.ce.is-readonly .ce-display {
  cursor: default;
  border-bottom-color: transparent;
}
.ce.is-readonly .ce-display:hover {
  background: none;
  border-bottom-color: transparent;
}
.ce.is-empty .ce-display {
  color: var(--text-light);
  font-style: italic;
}
.ce-placeholder {
  color: var(--text-light);
  font-style: italic;
}
.ce-link {
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}
.ce-link:hover {
  filter: brightness(0.85);
}
.ce-input,
.ce-textarea,
.ce-select {
  font: inherit;
  color: inherit;
  background: var(--card-bg);
  border: 2px solid var(--primary);
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  min-width: 80px;
  max-width: 100%;
}
.ce-textarea {
  display: block;
  width: 100%;
  resize: vertical;
}
.ce-select { cursor: pointer; }
</style>