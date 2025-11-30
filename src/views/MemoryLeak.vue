<template>
  <div class="p-4 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">内存泄漏分析</h1>
      <div class="flex space-x-3">
        <div class="flex items-center space-x-2">
          <input
            ref="fileInputRef"
            type="file"
            accept=".hprof,.heap"
            class="hidden"
            @change="handleFileSelect"
          />
          <Button variant="outline" @click="triggerFileSelect">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            选择文件
          </Button>
          <Input
            v-model="filePath"
            type="text"
            placeholder="输入文件路径（选择文件后将自动填充文件名）"
            class="w-64"
            @input="handleFilePathInput"
            @keyup.enter="analyzeMemoryLeak"
          />
          <div v-if="selectedFile" class="flex items-center space-x-2 text-sm text-muted-foreground">
            <span class="max-w-xs truncate">{{ selectedFile.name }}</span>
            <Button variant="ghost" size="sm" @click="clearFile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </Button>
          </div>
        </div>
        <Button @click="refreshData" :disabled="isLoading || !filePath">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新数据
        </Button>
        <Button variant="outline" @click="exportReport" :disabled="!filePath">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          导出报告
        </Button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">活跃线程</p>
          <p class="text-2xl font-bold text-blue-600">{{ threadStats?.liveThreads || 0 }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">守护线程</p>
          <p class="text-2xl font-bold text-green-600">{{ threadStats?.daemonThreads || 0 }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">峰值线程</p>
          <p class="text-2xl font-bold text-orange-600">{{ threadStats?.peakThreads || 0 }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">总启动线程</p>
          <p class="text-2xl font-bold text-purple-600">{{ threadStats?.totalStartedThreads || 0 }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 线程状态分布 -->
    <Card v-if="threadStats?.stateDistributionPercent">
      <CardHeader>
        <CardTitle>线程状态分布</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="[state, percent] in Object.entries(threadStats.stateDistributionPercent)" :key="state" 
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span class="text-sm font-medium">{{ getStateDisplayName(state) }}</span>
            <div class="flex items-center gap-2">
              <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div :class="getStateColor(state)" 
                    class="h-2 rounded-full transition-all duration-300" 
                    :style="{ width: `${percent}%` }"></div>
              </div>
              <span class="text-sm font-medium w-12 text-right">{{ (percent as number).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 线程列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>线程列表</CardTitle>
          <div class="flex items-center space-x-2">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="搜索线程名..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="filteredThreads.length === 0" class="text-center py-8 text-muted-foreground">
          没有找到线程数据
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  线程ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  线程名
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  守护线程
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  阻塞次数
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  等待次数
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  CPU时间(ms)
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  CPU使用率
                </th>
              </tr>
            </thead>
            <tbody class="bg-background divide-y divide-border">
              <tr v-for="thread in filteredThreads" :key="thread.threadId" class="hover:bg-muted/50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                  {{ thread.threadId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ thread.threadName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <Badge :variant="getStateBadgeVariant(thread.threadState)">
                    {{ getStateDisplayName(thread.threadState) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <span :class="thread.daemon ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'">
                    {{ thread.daemon ? '是' : '否' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-foreground">
                  {{ thread.blockedCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-foreground">
                  {{ thread.waitedCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-foreground">
                  {{ thread.cpuTimeDeltaMs.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-foreground">
                  {{ thread.cpuPercent.toFixed(2) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '@/components/ui'
import { memoryApi } from '@/api'

// 定义数据类型
interface ThreadStats {
  liveThreads: number
  daemonThreads: number
  peakThreads: number
  totalStartedThreads: number
  stateDistributionPercent: {
    NEW: number
    RUNNABLE: number
    BLOCKED: number
    WAITING: number
    TIMED_WAITING: number
    TERMINATED: number
  }
  sampleMillis: number
  cpuProcessor: number
}

interface Thread {
  threadId: number
  threadName: string
  threadState: string
  blockedCount: number
  waitedCount: number
  blockedTimeMs: number
  waitedTimeMs: number
  cpuTimeDeltaMs: number
  cpuPercent: number
  daemon: boolean
}

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const filePath = ref<string>('')

const threadStats = ref<ThreadStats | null>(null)
const threads = ref<Thread[]>([])

// 计算属性
const filteredThreads = computed(() => {
  let filtered = threads.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(thread => 
      thread.threadName.toLowerCase().includes(query) ||
      thread.threadId.toString().includes(query)
    )
  }

  return filtered
})

// 方法
function triggerFileSelect() {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    
    // 尝试获取文件的真实路径
    let path = ''
    
    // 在 Electron 环境中，尝试使用 Electron API 获取真实路径
    if ((window as any).electron && (window as any).electron.getFilePath) {
      try {
        // 如果 Electron 提供了获取文件路径的 API
        path = await (window as any).electron.getFilePath(file)
      } catch (error) {
        console.warn('无法通过 Electron API 获取文件路径:', error)
      }
    }
    
    // 如果 Electron API 不可用，尝试从 input.value 获取
    if (!path && target.value) {
      // 在 Windows 上，路径可能包含 C:\fakepath\ 前缀（浏览器安全机制）
      // 在 Linux/Mac 上，可能直接是路径或文件名
      path = target.value
      
      // 移除浏览器添加的假路径前缀
      if (path.startsWith('C:\\fakepath\\')) {
        path = path.replace('C:\\fakepath\\', '')
      }
      
      // 如果路径不包含目录分隔符，说明只获取到了文件名
      if (!path.includes('\\') && !path.includes('/')) {
        path = file.name
      }
    }
    
    // 尝试使用 webkitRelativePath（如果文件是通过目录选择器选择的）
    if (!path && file.webkitRelativePath) {
      path = file.webkitRelativePath
    }
    
    // 如果以上方法都失败，使用文件名
    if (!path) {
      path = file.name
    }
    
    filePath.value = path
  }
}

function handleFilePathInput() {
  // 输入文件路径时，如果路径与选中的文件名不一致，清除文件选择
  if (filePath.value && selectedFile.value && filePath.value !== selectedFile.value.name) {
    selectedFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function clearFile() {
  selectedFile.value = null
  filePath.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function analyzeMemoryLeak() {
  if (!filePath.value) {
    console.warn('请输入文件路径')
    return
  }

  isLoading.value = true
  try {
    const response = await memoryApi.getMemoryLeakAnalysis(`${filePath.value}`)
    
      // 处理分析结果
      if (response.data) {
        // 更新数据
        updateAnalysisData(response.data)
      }
  } catch (error) {
    console.error('内存泄漏分析失败:', error)
  } finally {
    isLoading.value = false
  }
}

function updateAnalysisData(data: any) {
  // 根据接口返回的数据更新界面
  if (data.stats) {
    threadStats.value = data.stats
  }
  if (data.threads && Array.isArray(data.threads)) {
    threads.value = data.threads
  }
}

// 状态显示名称映射
function getStateDisplayName(state: string): string {
  const stateMap: Record<string, string> = {
    'NEW': '新建',
    'RUNNABLE': '可运行',
    'BLOCKED': '阻塞',
    'WAITING': '等待',
    'TIMED_WAITING': '定时等待',
    'TERMINATED': '终止'
  }
  return stateMap[state] || state
}

// 状态颜色映射
function getStateColor(state: string): string {
  const colorMap: Record<string, string> = {
    'NEW': 'bg-blue-400',
    'RUNNABLE': 'bg-green-400',
    'BLOCKED': 'bg-red-400',
    'WAITING': 'bg-yellow-400',
    'TIMED_WAITING': 'bg-orange-400',
    'TERMINATED': 'bg-gray-400'
  }
  return colorMap[state] || 'bg-gray-200'
}

// 状态徽章样式
function getStateBadgeVariant(state: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const badgeMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'NEW': 'outline',
    'RUNNABLE': 'default',
    'BLOCKED': 'destructive',
    'WAITING': 'secondary',
    'TIMED_WAITING': 'secondary',
    'TERMINATED': 'outline'
  }
  return badgeMap[state] || 'outline'
}

async function refreshData() {
  if (selectedFile.value || filePath.value) {
    await analyzeMemoryLeak()
  } else {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 1000)
  }
}

function exportReport() {
  console.log('导出内存泄漏分析报告')
}

// 组件挂载时初始化
onMounted(() => {
  refreshData()
})
</script>

