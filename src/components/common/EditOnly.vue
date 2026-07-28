<template>
  <slot v-if="show" />
</template>

<script setup>
import { inject, computed } from 'vue'

// 仅当所在 EditBlock 处于编辑模式时才渲染（用于增删/切换等按钮）
const blockEditable = inject('blockEditable', null)
const show = computed(() => (blockEditable ? blockEditable.value : true))
</script>
