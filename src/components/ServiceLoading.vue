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
import { onMounted } from 'vue'
import { useServiceStore } from '@/stores/service'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-vue-next'

const serviceStore = useServiceStore()

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

onMounted(() => {
  // 监听服务状态变化
  // @ts-ignore
  if (window.electron) {
    // @ts-ignore
    window.electron.onJavaServiceStatus((status: { status: 'loading' | 'running' | 'stopped' | 'error', message?: string }) => {
      serviceStore.setServiceStatus(status.status, status.message)
    })

    // 检查服务状态
    // @ts-ignore
    window.electron.checkJavaService()
  } else {
    // 开发环境：模拟服务启动过程
    console.log('开发环境：模拟服务启动过程')
    serviceStore.setServiceStatus('loading')
    
    // 模拟3秒后服务启动完成
    setTimeout(() => {
      serviceStore.setServiceStatus('running')
    }, 3000)
  }
})
</script>
