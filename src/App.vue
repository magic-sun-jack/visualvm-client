<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- 服务加载状态覆盖层 -->
    <ServiceLoading />
    
    <!-- 主应用界面 - 只在服务运行或停止时显示 -->
    <TooltipProvider>
      <Layout v-if="serviceStore.serviceStatus === 'running' || serviceStore.serviceStatus === 'stopped'">
        <RouterView />
      </Layout>
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import ServiceLoading from '@/components/ServiceLoading.vue'
import { useServiceStore } from '@/stores/service'
import { useProcessStore } from '@/stores/process'
import { watch, ref, onMounted, onUnmounted } from 'vue'
import { TooltipProvider } from '@/components/ui/tooltip'

const serviceStore = useServiceStore()
const processStore = useProcessStore()

// 在后端服务第一次就绪时，默认选中第一个进程
const hasInitializedProcesses = ref(false)
watch(
  () => serviceStore.serviceStatus,
  async (status) => {
    if (status !== 'running') return
    if (hasInitializedProcesses.value) return
    hasInitializedProcesses.value = true
    await processStore.getFilteredProcesses()
  },
  { immediate: false }
)

// 禁止页面刷新（Ctrl+R, F5等）
function preventRefresh(e: KeyboardEvent) {
  // 阻止 Ctrl+R (Windows/Linux) 或 Cmd+R (Mac)
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault()
    return false
  }
  // 阻止 F5
  if (e.key === 'F5') {
    e.preventDefault()
    return false
  }
  return true
}

// beforeunload 事件处理函数
function preventBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault()
  e.returnValue = ''
  return ''
}

// 组件挂载时添加键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', preventRefresh)
  // 也阻止 beforeunload 事件（浏览器刷新提示）
  window.addEventListener('beforeunload', preventBeforeUnload)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', preventRefresh)
  window.removeEventListener('beforeunload', preventBeforeUnload)
})
</script>
