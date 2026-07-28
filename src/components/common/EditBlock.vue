<template>
  <section class="edit-block" :class="{ 'is-editing': editing }">
    <div v-if="showBar" class="eb-bar" :class="`eb-bar--${barAlign}`">
      <button type="button" class="eb-btn" :class="{ 'on': editing }" @click="toggle">
        <span class="eb-ico">{{ editing ? '✓' : '✎' }}</span>
        <span class="eb-label">{{ editing ? doneText : editText }}</span>
      </button>
    </div>
    <div class="eb-body"><slot /></div>
  </section>
</template>

<script setup>
import { ref, provide } from 'vue'

const props = defineProps({
  editText: { type: String, default: '编辑' },
  doneText: { type: String, default: '完成' },
  showBar: { type: Boolean, default: true },
  barAlign: { type: String, default: 'right' } // 'right' | 'left'
})

// 区块自身的编辑开关：默认只读（false）
const editing = ref(false)

// 提供给区块内所有子组件（ClickEdit / EditOnly）读取
provide('blockEditable', editing)

function toggle() {
  editing.value = !editing.value
}

defineExpose({ editing, toggle })
</script>

<style scoped>
.edit-block {
  position: relative;
}
.eb-bar {
  display: flex;
  margin-bottom: 12px;
}
.eb-bar--right { justify-content: flex-end; }
.eb-bar--left { justify-content: flex-start; }

.eb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  border: 1.5px dashed var(--primary);
  color: var(--primary);
  background: rgba(67, 97, 238, 0.06);
  transition: all 0.18s ease;
  box-shadow: 0 1px 4px rgba(67, 97, 238, 0.08);
}
.eb-btn:hover {
  background: rgba(67, 97, 238, 0.12);
  transform: translateY(-1px);
}
.eb-btn.on {
  border-style: solid;
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 10px rgba(67, 97, 238, 0.3);
}
.eb-ico {
  font-size: 14px;
  line-height: 1;
}
</style>
