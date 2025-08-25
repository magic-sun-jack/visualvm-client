<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">多线程分析</h1>
      <div class="flex space-x-3">
        <button @click="refreshData" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新数据
        </button>
        <button @click="startThreadDump" class="btn btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          线程转储
        </button>
        <button @click="exportReport" class="btn btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          导出报告
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">总线程数</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalThreads }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">运行中</p>
          <p class="text-2xl font-bold text-green-600">{{ runningThreads }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">阻塞中</p>
          <p class="text-2xl font-bold text-red-600">{{ blockedThreads }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">等待中</p>
          <p class="text-2xl font-bold text-yellow-600">{{ waitingThreads }}</p>
        </div>
      </div>
    </div>

    <!-- 线程状态分布图 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">线程状态分布</h3>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-gray-500">
            饼图组件待实现
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">CPU使用率分布</h3>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-gray-500">
            柱状图组件待实现
          </div>
        </div>
      </div>
    </div>

    <!-- 线程列表 -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">线程列表</h3>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">状态:</label>
            <select v-model="stateFilter" class="select select-sm">
              <option value="">全部状态</option>
              <option value="RUNNABLE">运行中</option>
              <option value="BLOCKED">阻塞中</option>
              <option value="WAITING">等待中</option>
              <option value="TIMED_WAITING">限时等待</option>
              <option value="TERMINATED">已终止</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">排序:</label>
            <select v-model="sortBy" class="select select-sm">
              <option value="cpuTime">按CPU时间</option>
              <option value="blockedTime">按阻塞时间</option>
              <option value="name">按名称</option>
            </select>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索线程名..."
            class="input input-sm w-64"
          />
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="filteredThreads.length === 0" class="text-center py-8 text-gray-500">
        没有找到线程
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                线程信息
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPU时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                阻塞时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="thread in paginatedThreads" :key="thread.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <div class="text-sm font-medium text-gray-900">{{ thread.name }}</div>
                  <div class="text-xs text-gray-500">ID: {{ thread.id }}</div>
                  <div v-if="thread.stackTrace.length > 0" class="text-xs text-gray-500 mt-1">
                    {{ thread.stackTrace[0] }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  thread.state === 'RUNNABLE' ? 'bg-green-100 text-green-800' :
                  thread.state === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                  thread.state === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                  thread.state === 'TIMED_WAITING' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ getStateText(thread.state) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatTime(thread.cpuTime) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(thread.userTime) }} 用户时间</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatTime(thread.blockedTime) }}</div>
                <div class="text-xs text-gray-500">{{ thread.blockedCount }} 次阻塞</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewThreadDetails(thread)" class="text-primary-600 hover:text-primary-900">
                    详情
                  </button>
                  <button @click="viewStackTrace(thread)" class="text-blue-600 hover:text-blue-900">
                    堆栈
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-700">
            显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredThreads.length) }} 条，
            共 {{ filteredThreads.length }} 条记录
          </div>
          <div class="flex space-x-2">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="btn btn-sm btn-secondary"
            >
              上一页
            </button>
            <span class="px-3 py-2 text-sm text-gray-700">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="btn btn-sm btn-secondary"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 热点线程分析 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">CPU密集型线程</h3>
        <div class="space-y-3">
          <div v-for="thread in topCpuThreads" :key="thread.id" class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ thread.name }}</div>
              <div class="text-xs text-gray-500">{{ thread.state }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">{{ formatTime(thread.cpuTime) }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(thread.userTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">阻塞时间最长</h3>
        <div class="space-y-3">
          <div v-for="thread in topBlockedThreads" :key="thread.id" class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ thread.name }}</div>
              <div class="text-xs text-gray-500">{{ thread.state }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">{{ formatTime(thread.blockedTime) }}</div>
              <div class="text-xs text-gray-500">{{ thread.blockedCount }} 次</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 死锁检测 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">死锁检测</h3>
      <div v-if="deadlocks.length === 0" class="text-center py-8 text-green-600">
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-lg font-medium">未检测到死锁</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="deadlock in deadlocks" :key="deadlock.id" class="border border-red-200 rounded-lg p-4 bg-red-50">
          <div class="flex items-center space-x-2 mb-2">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="text-red-800 font-medium">检测到死锁</span>
          </div>
          <div class="text-sm text-red-700">
            <div v-for="thread in deadlock.threads" :key="thread.id" class="mb-1">
              <strong>{{ thread.name }}</strong> 等待锁 <code>{{ thread.waitingFor }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { ThreadInfo } from '@/types'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const stateFilter = ref('')
const sortBy = ref('cpuTime')
const currentPage = ref(1)
const pageSize = 20

// 模拟数据
const threads = ref<ThreadInfo[]>([
  {
    id: 1,
    name: 'main',
    state: 'RUNNABLE',
    cpuTime: 15000,
    userTime: 12000,
    blockedTime: 0,
    blockedCount: 0,
    waitedTime: 0,
    waitedCount: 0,
    stackTrace: ['java.lang.Thread.run()', 'com.example.Main.main()']
  },
  {
    id: 2,
    name: 'pool-1-thread-1',
    state: 'BLOCKED',
    cpuTime: 5000,
    userTime: 4000,
    blockedTime: 30000,
    blockedCount: 5,
    waitedTime: 10000,
    waitedCount: 3,
    stackTrace: ['java.lang.Object.wait()', 'com.example.Worker.run()']
  },
  {
    id: 3,
    name: 'pool-1-thread-2',
    state: 'WAITING',
    cpuTime: 2000,
    userTime: 1500,
    blockedTime: 0,
    blockedCount: 0,
    waitedTime: 45000,
    waitedCount: 8,
    stackTrace: ['java.lang.Object.wait()', 'com.example.Consumer.run()']
  }
])

// 死锁数据
const deadlocks = ref([
  {
    id: '1',
    threads: [
      { id: 2, name: 'pool-1-thread-1', waitingFor: 'Lock A' },
      { id: 4, name: 'pool-1-thread-3', waitingFor: 'Lock B' }
    ]
  }
])

// 计算属性
const filteredThreads = computed(() => {
  let filtered = threads.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(thread => 
      thread.name.toLowerCase().includes(query)
    )
  }

  if (stateFilter.value) {
    filtered = filtered.filter(thread => thread.state === stateFilter.value)
  }

  // 排序
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'cpuTime':
        return b.cpuTime - a.cpuTime
      case 'blockedTime':
        return b.blockedTime - a.blockedTime
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return sorted
})

const totalThreads = computed(() => threads.value.length)
const runningThreads = computed(() => threads.value.filter(t => t.state === 'RUNNABLE').length)
const blockedThreads = computed(() => threads.value.filter(t => t.state === 'BLOCKED').length)
const waitingThreads = computed(() => threads.value.filter(t => t.state === 'WAITING' || t.state === 'TIMED_WAITING').length)

const totalPages = computed(() => Math.ceil(filteredThreads.value.length / pageSize))
const paginatedThreads = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredThreads.value.slice(start, end)
})

// CPU密集型线程
const topCpuThreads = computed(() => 
  [...threads.value]
    .sort((a, b) => b.cpuTime - a.cpuTime)
    .slice(0, 5)
)

// 阻塞时间最长的线程
const topBlockedThreads = computed(() => 
  [...threads.value]
    .sort((a, b) => b.blockedTime - a.blockedTime)
    .slice(0, 5)
)

// 监听筛选条件变化，重置分页
watch([searchQuery, stateFilter, sortBy], () => {
  currentPage.value = 1
})

// 方法
async function refreshData() {
  isLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 这里应该调用实际的API
  } finally {
    isLoading.value = false
  }
}

function startThreadDump() {
  // 实现线程转储功能
  console.log('开始线程转储')
}

function exportReport() {
  // 实现导出报告功能
  console.log('导出线程分析报告')
}

function viewThreadDetails(thread: ThreadInfo) {
  // 实现查看线程详情功能
  console.log('查看线程详情:', thread)
}

function viewStackTrace(thread: ThreadInfo) {
  // 实现查看堆栈跟踪功能
  console.log('查看堆栈跟踪:', thread.name)
}

function getStateText(state: string): string {
  const stateMap = {
    'RUNNABLE': '运行中',
    'BLOCKED': '阻塞中',
    'WAITING': '等待中',
    'TIMED_WAITING': '限时等待',
    'TERMINATED': '已终止'
  }
  return stateMap[state as keyof typeof stateMap] || state
}

function formatTime(milliseconds: number): string {
  if (milliseconds === 0) return '0ms'
  if (milliseconds < 1000) return `${milliseconds}ms`
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
  return `${(milliseconds / 60000).toFixed(1)}m`
}

// 组件挂载时初始化
onMounted(() => {
  refreshData()
})
</script>
