<template>
  <div class="p-4 flex flex-col overflow-hidden">
    <div class="flex items-center justify-between gap-2 mb-4 flex-shrink-0">
      <h2 class="text-lg font-bold mb-4">线程监控</h2>
      <div class="flex items-center justify-between gap-2 mb-4">
        <Button variant="outline" size="sm" @click="getThreadDump">线程转储</Button>
        <Checkbox v-model="showStateDistribution" label="线程可视化" />
        <label for="showStateDistribution" class="flex items-center gap-2 cursor-pointer">
          <span class="text-sm">显示状态分布</span>
        </label>
        <Switch v-model="isActive" label="自动刷新" />
        <label for="isActive" class="flex items-center gap-2 cursor-pointer">
          <span class="text-sm">自动刷新</span>
        </label>
      </div>
    </div>

    <!-- Loading状态 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 dark:text-gray-400">正在加载线程数据...</p>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="hasStats" class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
      <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <div class="text-sm text-blue-600 dark:text-blue-400">活跃线程</div>
        <div class="text-xl font-bold text-blue-800 dark:text-blue-200">{{ stats?.liveThreads }}</div>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <div class="text-sm text-green-600 dark:text-green-400">守护线程</div>
        <div class="text-xl font-bold text-green-800 dark:text-green-200">{{ stats?.daemonThreads }}</div>
      </div>
      <div class="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
        <div class="text-sm text-orange-600 dark:text-orange-400">峰值线程</div>
        <div class="text-xl font-bold text-orange-800 dark:text-orange-200">{{ stats?.peakThreads }}</div>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
        <div class="text-sm text-purple-600 dark:text-purple-400">总启动线程</div>
        <div class="text-xl font-bold text-purple-800 dark:text-purple-200">{{ stats?.totalStartedThreads }}</div>
      </div>
    </div>

    <div v-if="showStateDistribution && (hasStateDistribution || hasThreads)" class="flex-1 flex flex-col min-h-0">
      <!-- 线程状态分布 -->
      <div v-if="hasStateDistribution" class="mb-6 flex-shrink-0">
        <h3 class="text-md font-semibold mb-3">线程状态分布</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="[state, percent] in Object.entries(stats?.stateDistributionPercent || {})" :key="state" 
              class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <span class="text-sm">{{ getStateDisplayName(state) }}</span>
            <div class="flex items-center gap-2">
              <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div :class="getStateColor(state)" 
                    class="h-2 rounded-full transition-all duration-300" 
                    :style="{ width: `${percent}%` }"></div>
              </div>
              <span class="text-sm font-medium w-12 text-right">{{ (percent as number).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 过滤线程列表条件 -->
      <div class="flex items-center gap-2 mb-4">
        <Input v-model="searchThreadName" @keyup.enter="searchThreadFn" clearable type="text" size="sm" placeholder="搜索线程名..." class="w-64" />
        <Button variant="outline" size="sm" @click="searchThreadFn">
          <SearchIcon class="w-4 h-4" />
        </Button>
      </div>
      <!-- 线程列表 -->
      <div v-if="hasThreads" class="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-800 rounded shadow flex flex-col">
        <div class="overflow-auto flex-1 max-h-[800px]">
        <table class="min-w-[1200px] w-full text-xs">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <th class="px-3 py-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('threadId')">
                <div class="flex items-center gap-1">
                  ID
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'threadId'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/><path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-3 py-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('threadName')">
                <div class="flex items-center gap-1">
                  线程名
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'threadName'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-3 py-2 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('threadState')">
                <div class="flex items-center justify-center gap-1">
                  状态
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'threadState'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-3 py-2 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('daemon')">
                <div class="flex items-center justify-center gap-1">
                  守护线程
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'daemon'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-3 py-2 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('blockedCount')">
                <div class="flex items-center justify-end gap-1">
                  阻塞次数
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'blockedCount'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-3 py-2 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('waitedCount')">
                <div class="flex items-center justify-end gap-1">
                  等待次数
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'waitedCount'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-3 py-2 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('cpuTimeDeltaMs')">
                <div class="flex items-center justify-end gap-1">
                  CPU时间(ms)
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'cpuTimeDeltaMs'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-3 py-2 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 select-none" 
                  @click="sortBy('cpuPercent')">
                <div class="flex items-center justify-end gap-1">
                  CPU使用率
                  <span class="text-gray-400">
                    <svg v-if="sortField !== 'cpuPercent'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                    <svg v-else-if="sortOrder === 'asc'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5z"/>
                    </svg>
                    <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5 5 5-5H5z"/>
                    </svg>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="thread in sortedThreads" :key="thread.threadId" 
                class="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-3 py-2 font-mono">{{ thread.threadId }}</td>
              <td class="px-3 py-2 whitespace-nowrap max-w-xs truncate" :title="thread.threadName">
                {{ thread.threadName }}
              </td>
              <td class="px-3 py-2 text-center">
                <span :class="getStateBadgeClass(thread.threadState)" class="px-2 py-1 rounded-full text-xs">
                  {{ getStateDisplayName(thread.threadState) }}
                </span>
              </td>
              <td class="px-3 py-2 text-center">
                <span :class="thread.daemon ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'">
                  {{ thread.daemon ? '是' : '否' }}
                </span>
              </td>
              <td class="px-3 py-2 text-right font-mono">{{ thread.blockedCount }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ thread.waitedCount }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ thread.cpuTimeDeltaMs.toFixed(2) }}</td>
              <td class="px-3 py-2 text-right font-mono">{{ thread.cpuPercent.toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <!-- 图例 -->
      <div v-if="hasStateDistribution" class="flex flex-wrap gap-4 mt-4 text-xs flex-shrink-0">
        <div class="flex items-center gap-1" v-for="[state] in Object.entries(stats?.stateDistributionPercent || {})" :key="state"><span class="h-3 w-5 rounded" :class="getStateColor(state)"></span>{{ getStateDisplayName(state) }}</div>
      </div>
    </div>
    <!-- 空状态 -->
    <div v-if="!loading && !hasStats" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="text-gray-500 dark:text-gray-400 mb-4">暂无线程数据</p>
        <Button variant="outline" size="sm" @click="getThreadListFn">刷新</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { threadApi } from '@/api'
import { useProcessStore } from '@/stores/process'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import router from '@/router'
import { SearchIcon } from 'lucide-vue-next'

const processStore = useProcessStore()
const showStateDistribution = ref(true)
const isActive = ref(true)
const searchThreadName = ref('')
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
const loading = ref(false)
const stats = ref<ThreadStats | null>(null)
const threads = ref<Thread[]>([])

// 排序相关
const sortField = ref('threadId')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 计算属性
const hasStats = computed(() => stats.value !== null)
const hasStateDistribution = computed(() => stats.value?.stateDistributionPercent !== undefined)
const hasThreads = computed(() => threads.value.length > 0)

// 排序后的线程列表
const sortedThreads = computed(() => {
  return [...threads.value].sort((a, b) => {
    const aValue = a[sortField.value as keyof Thread]
    const bValue = b[sortField.value as keyof Thread]

    if (aValue && bValue && aValue < bValue) {
      return sortOrder.value === 'asc' ? -1 : 1
    }
    if (aValue && bValue && aValue > bValue) {
      return sortOrder.value === 'asc' ? 1 : -1
    }
    return 0
  })
})

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
function getStateBadgeClass(state: string): string {
  const badgeMap: Record<string, string> = {
    'NEW': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'RUNNABLE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'BLOCKED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'WAITING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'TIMED_WAITING': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'TERMINATED': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return badgeMap[state] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// 搜索线程
function searchThreadFn() {
  if (!searchThreadName.value) {
    threads.value = threads.value
    return
  }
  threads.value = threads.value.filter(thread => thread.threadName.includes(searchThreadName.value))
}

// 获取线程列表数据（可控是否展示loading）
async function getThreadListFn(showLoading: boolean = true) {
  const pid = processStore.currentProcess?.pid
  if (!pid) return

  if (showLoading) loading.value = true
  try {
    const response = await threadApi.getThreadList(pid)
    if (response.areSuccess && response.data) {
      stats.value = response.data.stats
      threads.value = response.data.threads
      searchThreadFn()
    }
  } catch (error) {
    console.error('获取线程列表失败:', error)
  } finally {
    if (showLoading) loading.value = false
  }
}

// 排序函数
function sortBy(field: string) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

async function getThreadDump() {
  debugger
  router.push('/threads/dump?pid=' + processStore.currentProcess?.pid)
}

// 轮询控制
const threadPollingEnabled = ref(false)
let threadPollingTimer: ReturnType<typeof setInterval> | null = null
let isThreadRequesting = ref(false)

// 队列方式执行 getThreadListFn，确保上一个请求完成后再执行下一个
let pendingThreadRequest = Promise.resolve()

function queueGetThreadListFn(showLoading: boolean = false) {
  if (isThreadRequesting.value) return pendingThreadRequest
  
  isThreadRequesting.value = true
  pendingThreadRequest = pendingThreadRequest
    .then(async () => {
      if (processStore.currentProcess?.pid && threadPollingEnabled.value) {
        await getThreadListFn(showLoading)
      }
    })
    .catch(async () => {
      if (processStore.currentProcess?.pid && threadPollingEnabled.value) {
        await getThreadListFn(showLoading)
      }
    })
    .finally(() => {
      isThreadRequesting.value = false
    })
  
  return pendingThreadRequest
}

// 启动轮询
function startThreadPolling() {
  if (threadPollingTimer || !isActive.value) return
  
  threadPollingEnabled.value = true
  // 立即执行一次（带loading）
  getThreadListFn(true).finally(() => {
    // 然后每1秒执行一次（不带loading）
    if (isActive.value) {
      threadPollingTimer = setInterval(() => {
        if (processStore.currentProcess?.pid && threadPollingEnabled.value && isActive.value) {
          queueGetThreadListFn(false)
        }
      }, 1000)
    }
  })
}

// 停止轮询
function stopThreadPolling() {
  threadPollingEnabled.value = false
  if (threadPollingTimer) {
    clearInterval(threadPollingTimer)
    threadPollingTimer = null
  }
}

// 监听 isActive 变化，控制轮询
watch(isActive, (newValue) => {
  if (newValue) {
    startThreadPolling()
  } else {
    stopThreadPolling()
  }
}, { immediate: false })

onMounted(() => {
  if (isActive.value) {
    startThreadPolling()
  }
})

onUnmounted(() => {
  stopThreadPolling()
})
</script>

<style scoped>
</style>
