<template>
  <div v-if="isReady">
    <component 
      :is="component" 
      v-bind="$attrs"
      @vue:mounted="onMounted"
      @vue:updated="onUpdated"
      @vue:unmounted="onUnmounted"
    />
  </div>
  <div v-else class="flex items-center justify-center p-8">
    <div class="text-muted-foreground">组件加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted as onVueMounted } from 'vue'

interface Props {
  component: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  mounted: []
  updated: []
  unmounted: []
}>()

const isReady = ref(false)

// 延迟组件渲染以避免DevTools冲突
onVueMounted(async () => {
  await nextTick()
  // 添加小延迟确保组件实例完全初始化
  setTimeout(() => {
    isReady.value = true
  }, 10)
})

function onMounted() {
  emit('mounted')
}

function onUpdated() {
  emit('updated')
}

function onUnmounted() {
  emit('unmounted')
}
</script>
