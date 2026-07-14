<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-box" :style="{ maxWidth: maxWidth }">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="$emit('close')">&times;</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: Boolean,
  title: { type: String, default: '' },
  maxWidth: { type: String, default: '640px' }
})

const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape' && props.show) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-box {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--border-light);
  color: var(--text);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-box {
    border-radius: var(--radius) var(--radius) 0 0;
    max-height: 90vh;
    align-self: flex-end;
  }
}
</style>
