<template>
  <!-- Loading 状态 -->
  <div
    v-if="serviceStore.serviceStatus === 'loading'"
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
  >
    <div class="flex flex-col items-center space-y-6 p-8">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary/20"></div>
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary absolute top-0 left-0"></div>
      </div>
      <div class="text-center space-y-2">
        <div class="text-xl font-semibold text-foreground">服务正在启动中...</div>
        <div class="text-sm text-muted-foreground">正在启动 Java 监控服务，请稍候</div>
        <div class="text-xs text-muted-foreground/70">这可能需要几秒钟的时间</div>
      </div>
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>
  </div>

  <!-- 错误状态 -->
  <div
    v-if="serviceStore.serviceStatus === 'error'"
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
  >
    <div class="flex flex-col items-center space-y-6 max-w-md mx-auto p-8">
      <div class="text-destructive text-4xl">
        <AlertCircle class="h-12 w-12" />
      </div>
      <div class="text-center space-y-2">
        <div class="text-xl font-semibold text-foreground">服务启动失败</div>
        <div class="text-sm text-muted-foreground">
          {{ serviceStore.errorMessage || '无法启动 Java 服务，请检查配置并重试。' }}
        </div>
      </div>
      <div class="flex space-x-3">
        <Button @click="handleRetry" variant="default">
          重试启动
        </Button>
        <Button @click="handleExit" variant="outline">
          退出应用
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useServiceStore } from '@/stores/service'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-vue-next'
import { processApi } from '@/api';

const serviceStore = useServiceStore()

// 存储监听器引用，用于清理
let statusListener: ((status: any) => void) | null = null
let cleanupListener: (() => void) | null = null

async function handleRetry() {
  serviceStore.setServiceStatus('loading')
  try {
    // @ts-ignore
    const result = await window.electron.startJavaService()
    if (!result.success) {
      throw new Error(result.error)
    }
  } catch (error) {
    serviceStore.setServiceStatus('error', error instanceof Error ? error.message : '未知错误')
  }
}

function handleExit() {
  // @ts-ignore
  if (window.electron && window.electron.exitApp) {
    // @ts-ignore
    window.electron.exitApp()
  } else {
    // 如果Electron API不可用，尝试关闭窗口
    window.close()
  }
}

onMounted(async () => {
  // 检测是否在 Electron 环境中
  const isElectron = !!(window as any).electron
  
  if (isElectron) {
    console.log('Electron 环境：设置服务状态监听')
    
    // 创建状态监听器
    statusListener = (status: { status: 'loading' | 'running' | 'stopped' | 'error', message?: string }) => {
      console.log('收到服务状态更新:', status)
      serviceStore.setServiceStatus(status.status, status.message)
    }
    
    // 监听服务状态变化
    // @ts-ignore
    cleanupListener = window.electron.onJavaServiceStatus(statusListener)

    // 检查服务状态 - 使用异步方式确保状态正确更新
    try {
      console.log('检查 Java 服务状态...')
      // @ts-ignore
      const result = await window.electron.checkJavaService()
      console.log('服务状态检查结果:', result)
      
      // 如果检查成功，说明服务正在运行
      if (result && result.status === 'running') {
        serviceStore.setServiceStatus('running')
      } else {
        // 如果服务未运行，尝试启动
        console.log('服务未运行，尝试启动...')
        serviceStore.setServiceStatus('loading')
        // @ts-ignore
        const startResult = await window.electron.startJavaService()
        if (!startResult.success) {
          serviceStore.setServiceStatus('error', startResult.error)
        }
      }
    } catch (error) {
      console.error('检查服务状态失败:', error)
      serviceStore.setServiceStatus('error', '无法检查服务状态')
    }
  } else {
    // 开发环境：模拟服务启动过程
    console.log('开发环境：模拟服务启动过程')
    try {
      const response = await processApi.getProcesses()
      if (response.success) {
        serviceStore.setServiceStatus('running')
      } else {
        serviceStore.setServiceStatus('error', response.msg)
      }
    } catch (error) {
      console.error('开发环境服务检查失败:', error)
      serviceStore.setServiceStatus('error', '开发环境服务不可用')
    }
  }
})

// 组件卸载时清理监听器
onUnmounted(() => {
  if (cleanupListener) {
    console.log('清理服务状态监听器')
    cleanupListener()
    cleanupListener = null
    statusListener = null
  }
})
</script>
