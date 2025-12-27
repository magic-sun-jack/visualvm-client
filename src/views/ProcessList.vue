<template>
  <div class="p-4 md:p-6 space-y-4 md:gap-6 bg-background min-h-full">
    <!-- 顶部标题栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold">进程列表</h1>
      </div>
      <div class="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          @click="refreshAllProcesses"
          :disabled="isRefreshingProcesses"
        >
          <RefreshCw :class="['w-4 h-4 mr-2', { 'animate-spin': isRefreshingProcesses }]" />
          刷新
        </Button>
      </div>
    </div>

    <!-- 错误信息显示 -->
    <Alert v-if="errorMessage" variant="destructive" class="mb-4">
      <AlertDescription class="flex items-center gap-2">
        <AlertCircle class="h-4 w-4" />
        {{ errorMessage }}
      </AlertDescription>
    </Alert>

    <!-- 进程列表 -->
    <Card>
      <CardContent class="p-6">
        <div v-if="isRefreshingProcesses" class="flex items-center justify-center py-8">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            正在加载进程列表...
          </div>
        </div>
        <div v-else-if="allProcessesList.length === 0" class="flex items-center justify-center py-8">
          <p class="text-sm text-muted-foreground">暂无进程</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="process in allProcessesList"
            :key="process.pid"
            :class="[
              'p-3 rounded-lg border cursor-pointer transition-colors',
              currentProcess?.pid === process.pid
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent'
            ]"
            @click="selectProcess(process)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-sm font-medium truncate">{{ process.displayName }}</p>
                  <Badge 
                    v-if="process.isRemote" 
                    variant="secondary" 
                    class="text-xs bg-red-500 text-white"
                  >
                    远程
                  </Badge>
                  <Badge 
                    v-else
                    variant="secondary" 
                    class="text-xs bg-green-500 text-white"
                  >
                    本地
                  </Badge>
                  <!-- <Badge 
                    :variant="process.status === 'running' ? 'default' : 'secondary'"
                    class="text-xs"
                  >
                    {{ process.status === 'running' ? '运行中' : '已停止' }}
                  </Badge> -->
                </div>
                <div class="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>PID: {{ process.pid }}</span>
                  <span v-if="process.mainClass" class="truncate">{{ process.mainClass }}</span>
                  <span v-if="process.ip" class="truncate">{{ process.ip }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProcessStore } from '@/stores/process'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const processStore = useProcessStore()
const router = useRouter()

// 所有进程列表（本地+远程）
const allProcessesList = computed(() => {
  return processStore.processes
})

// 当前进程
const currentProcess = computed(() => {
  return processStore.currentProcess
})

const isRefreshingProcesses = ref(false)
const errorMessage = ref<string>('')

// 刷新所有进程（包括远程）
async function refreshAllProcesses() {
  isRefreshingProcesses.value = true
  errorMessage.value = ''
  
  try {
    await processStore.getAllProcesses()
  } catch (error) {
    errorMessage.value = '刷新进程列表失败'
    console.error('刷新进程列表异常:', error)
  } finally {
    isRefreshingProcesses.value = false
  }
}

// 选择进程
async function selectProcess(process: any) {
  if (!process.pid) return
  
  const pid = process.pid.toString()
  
  // 如果是远程进程，设置远程连接状态
  if (process.isRemote) {
    processStore.setRemoteConnection(true)
    // 使用 getRemoteOverview 获取远程进程详情
    await processStore.getRemoteOverview(pid)
  } else {
    processStore.setRemoteConnection(false)
    // 使用 getLocalOverview 获取本地进程详情
    await processStore.getLocalOverview(pid)
  }
  
  // 跳转到概览页面
  router.push('/dashboard')
}

// 组件挂载时加载所有进程
onMounted(async () => {
  await refreshAllProcesses()
})
</script>

