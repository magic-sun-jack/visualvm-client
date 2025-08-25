<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">数据库调用分析</h1>
      <div class="flex space-x-3">
        <button @click="refreshData" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新数据
        </button>
        <button @click="exportData" class="btn btn-secondary">
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
          <p class="text-sm text-gray-500">总调用次数</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalCalls }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">成功调用</p>
          <p class="text-2xl font-bold text-green-600">{{ successCalls }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">平均执行时间</p>
          <p class="text-2xl font-bold text-blue-600">{{ averageExecutionTime }}ms</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">慢查询数量</p>
          <p class="text-2xl font-bold text-yellow-600">{{ slowQueryCount }}</p>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">执行时间分布</h3>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-gray-500">
            图表组件待实现
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">调用状态分布</h3>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-gray-500">
            图表组件待实现
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">数据库调用记录</h3>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">状态:</label>
            <select v-model="statusFilter" class="select select-sm">
              <option value="">全部</option>
              <option value="success">成功</option>
              <option value="error">错误</option>
              <option value="timeout">超时</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">时间范围:</label>
            <select v-model="timeRange" class="select select-sm">
              <option value="1h">最近1小时</option>
              <option value="6h">最近6小时</option>
              <option value="24h">最近24小时</option>
              <option value="7d">最近7天</option>
            </select>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索SQL或连接ID..."
            class="input input-sm w-64"
          />
        </div>
      </div>

      <!-- 调用记录表格 -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="filteredCalls.length === 0" class="text-center py-8 text-gray-500">
        没有找到数据库调用记录
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SQL语句
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                执行时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                连接ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="call in paginatedCalls" :key="call.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(call.timestamp) }}
              </td>
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <div class="text-sm text-gray-900 truncate" :title="call.sql">
                    {{ call.sql }}
                  </div>
                  <div v-if="call.parameters" class="text-xs text-gray-500 mt-1">
                    参数: {{ formatParameters(call.parameters) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  call.executionTime < 100 ? 'bg-green-100 text-green-800' :
                  call.executionTime < 1000 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                ]">
                  {{ call.executionTime }}ms
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  call.status === 'success' ? 'bg-green-100 text-green-800' :
                  call.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                ]">
                  {{ getStatusText(call.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ call.connectionId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="viewCallDetails(call)" class="text-primary-600 hover:text-primary-900">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-700">
            显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredCalls.length) }} 条，
            共 {{ filteredCalls.length }} 条记录
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

    <!-- 慢查询分析 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">慢查询分析</h3>
      <div class="space-y-4">
        <div v-for="slowQuery in slowQueries" :key="slowQuery.id" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-900">{{ slowQuery.sql }}</span>
              <span class="text-xs text-gray-500">执行时间: {{ slowQuery.executionTime }}ms</span>
            </div>
            <span class="text-xs text-red-600 font-medium">慢查询</span>
          </div>
          <div class="text-sm text-gray-600">
            <div>连接ID: {{ slowQuery.connectionId }}</div>
            <div>执行时间: {{ formatTime(slowQuery.timestamp) }}</div>
            <div v-if="slowQuery.errorMessage" class="text-red-600 mt-1">
              错误: {{ slowQuery.errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { DatabaseCall } from '@/types'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const timeRange = ref('1h')
const currentPage = ref(1)
const pageSize = 20

// 模拟数据
const databaseCalls = ref<DatabaseCall[]>([
  {
    id: '1',
    sql: 'SELECT * FROM users WHERE id = ?',
    executionTime: 45,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    connectionId: 'conn-001',
    status: 'success',
    parameters: { id: 123 }
  },
  {
    id: '2',
    sql: 'INSERT INTO orders (user_id, amount) VALUES (?, ?)',
    executionTime: 1200,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    connectionId: 'conn-002',
    status: 'success',
    parameters: { user_id: 456, amount: 99.99 }
  },
  {
    id: '3',
    sql: 'UPDATE products SET stock = stock - ? WHERE id = ?',
    executionTime: 78,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    connectionId: 'conn-003',
    status: 'error',
    errorMessage: '库存不足',
    parameters: { quantity: 5, id: 789 }
  }
])

// 计算属性
const filteredCalls = computed(() => {
  let filtered = databaseCalls.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(call => 
      call.sql.toLowerCase().includes(query) ||
      call.connectionId.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(call => call.status === statusFilter.value)
  }

  // 根据时间范围过滤
  const now = new Date()
  const timeRanges = {
    '1h': now.getTime() - 60 * 60 * 1000,
    '6h': now.getTime() - 6 * 60 * 60 * 1000,
    '24h': now.getTime() - 24 * 60 * 60 * 1000,
    '7d': now.getTime() - 7 * 24 * 60 * 60 * 1000
  }
  
  if (timeRange.value && timeRanges[timeRange.value as keyof typeof timeRanges]) {
    const cutoff = timeRanges[timeRange.value as keyof typeof timeRanges]
    filtered = filtered.filter(call => new Date(call.timestamp).getTime() > cutoff)
  }

  return filtered
})

const totalCalls = computed(() => databaseCalls.value.length)
const successCalls = computed(() => databaseCalls.value.filter(call => call.status === 'success').length)
const averageExecutionTime = computed(() => {
  const total = databaseCalls.value.reduce((sum, call) => sum + call.executionTime, 0)
  return Math.round(total / databaseCalls.value.length)
})
const slowQueryCount = computed(() => databaseCalls.value.filter(call => call.executionTime > 1000).length)

const slowQueries = computed(() => 
  databaseCalls.value.filter(call => call.executionTime > 1000)
)

const totalPages = computed(() => Math.ceil(filteredCalls.value.length / pageSize))
const paginatedCalls = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredCalls.value.slice(start, end)
})

// 监听筛选条件变化，重置分页
watch([searchQuery, statusFilter, timeRange], () => {
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

function exportData() {
  // 实现导出功能
  console.log('导出数据库调用分析报告')
}

function viewCallDetails(call: DatabaseCall) {
  // 实现查看详情功能
  console.log('查看调用详情:', call)
}

function getStatusText(status: string): string {
  const statusMap = {
    success: '成功',
    error: '错误',
    timeout: '超时'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`
  return date.toLocaleDateString()
}

function formatParameters(params: Record<string, any>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')
}

// 组件挂载时初始化
onMounted(() => {
  refreshData()
})
</script>
