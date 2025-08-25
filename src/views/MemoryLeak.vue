<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">内存泄漏分析</h1>
      <div class="flex space-x-3">
        <button @click="refreshData" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新数据
        </button>
        <button @click="startMemoryAnalysis" class="btn btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          开始分析
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
          <p class="text-sm text-gray-500">检测到的泄漏</p>
          <p class="text-2xl font-bold text-red-600">{{ detectedLeaks }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">严重程度</p>
          <p class="text-2xl font-bold text-orange-600">{{ criticalLeaks }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">总内存占用</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatMemory(totalMemorySize) }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">增长率</p>
          <p class="text-2xl font-bold text-yellow-600">{{ averageGrowthRate }}%/h</p>
        </div>
      </div>
    </div>

    <!-- 内存使用趋势图 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">内存使用趋势</h3>
      <div class="h-64">
        <div class="flex items-center justify-center h-full text-gray-500">
          图表组件待实现
        </div>
      </div>
    </div>

    <!-- 泄漏检测结果 -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">内存泄漏检测结果</h3>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">严重程度:</label>
            <select v-model="severityFilter" class="select select-sm">
              <option value="">全部</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="critical">严重</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">排序:</label>
            <select v-model="sortBy" class="select select-sm">
              <option value="severity">按严重程度</option>
              <option value="memorySize">按内存大小</option>
              <option value="growthRate">按增长率</option>
              <option value="timestamp">按时间</option>
            </select>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索类名..."
            class="input input-sm w-64"
          />
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="filteredLeaks.length === 0" class="text-center py-8 text-gray-500">
        没有检测到内存泄漏
      </div>

      <div v-else class="space-y-4">
        <div v-for="leak in paginatedLeaks" :key="leak.id" class="border rounded-lg p-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h4 class="text-lg font-medium text-gray-900">{{ leak.className }}</h4>
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  leak.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  leak.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  leak.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                ]">
                  {{ getSeverityText(leak.severity) }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p class="text-sm text-gray-500">实例数量</p>
                  <p class="text-lg font-semibold text-gray-900">{{ leak.instanceCount.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">内存占用</p>
                  <p class="text-lg font-semibold text-gray-900">{{ formatMemory(leak.memorySize) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">增长率</p>
                  <p class="text-lg font-semibold text-gray-900">{{ leak.growthRate.toFixed(2) }}%/h</p>
                </div>
              </div>
              
              <p class="text-sm text-gray-600 mb-3">{{ leak.description }}</p>
              
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>检测时间: {{ formatTime(leak.timestamp) }}</span>
                <div class="flex space-x-2">
                  <button @click="viewLeakDetails(leak)" class="text-primary-600 hover:text-primary-900">
                    查看详情
                  </button>
                  <button @click="generateHeapDump(leak)" class="text-blue-600 hover:text-blue-900">
                    生成堆转储
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="flex items-center justify-between mt-6">
          <div class="text-sm text-gray-700">
            显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredLeaks.length) }} 条，
            共 {{ filteredLeaks.length }} 条记录
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

    <!-- 内存分布分析 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">内存分布</h3>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-gray-500">
            饼图组件待实现
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">增长趋势</h3>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-gray-500">
            折线图组件待实现
          </div>
        </div>
      </div>
    </div>

    <!-- 建议和解决方案 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">建议和解决方案</h3>
      <div class="space-y-4">
        <div v-for="(suggestion, index) in suggestions" :key="index" class="border-l-4 border-blue-500 pl-4">
          <h4 class="font-medium text-gray-900 mb-2">{{ suggestion.title }}</h4>
          <p class="text-sm text-gray-600 mb-2">{{ suggestion.description }}</p>
          <div class="text-xs text-gray-500">
            <strong>影响:</strong> {{ suggestion.impact }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { MemoryLeakResult } from '@/types'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const severityFilter = ref('')
const sortBy = ref('severity')
const currentPage = ref(1)
const pageSize = 20

// 模拟数据
const memoryLeaks = ref<MemoryLeakResult[]>([
  {
    id: '1',
    className: 'com.example.UserSession',
    instanceCount: 15000,
    memorySize: 1024 * 1024 * 500, // 500MB
    growthRate: 15.5,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: 'high',
    description: '用户会话对象未正确清理，导致内存持续增长'
  },
  {
    id: '2',
    className: 'com.example.CacheEntry',
    instanceCount: 50000,
    memorySize: 1024 * 1024 * 200, // 200MB
    growthRate: 8.2,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    severity: 'medium',
    description: '缓存条目过期后未及时清理'
  },
  {
    id: '3',
    className: 'com.example.DatabaseConnection',
    instanceCount: 200,
    memorySize: 1024 * 1024 * 100, // 100MB
    growthRate: 25.0,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    severity: 'critical',
    description: '数据库连接池泄漏，连接未正确关闭'
  }
])

// 计算属性
const filteredLeaks = computed(() => {
  let filtered = memoryLeaks.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(leak => 
      leak.className.toLowerCase().includes(query)
    )
  }

  if (severityFilter.value) {
    filtered = filtered.filter(leak => leak.severity === severityFilter.value)
  }

  // 排序
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder]
      case 'memorySize':
        return b.memorySize - a.memorySize
      case 'growthRate':
        return b.growthRate - a.growthRate
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      default:
        return 0
    }
  })

  return sorted
})

const detectedLeaks = computed(() => memoryLeaks.value.length)
const criticalLeaks = computed(() => memoryLeaks.value.filter(leak => leak.severity === 'critical').length)
const totalMemorySize = computed(() => memoryLeaks.value.reduce((sum, leak) => sum + leak.memorySize, 0))
const averageGrowthRate = computed(() => {
  const total = memoryLeaks.value.reduce((sum, leak) => sum + leak.growthRate, 0)
  return Math.round(total / memoryLeaks.value.length * 10) / 10
})

const totalPages = computed(() => Math.ceil(filteredLeaks.value.length / pageSize))
const paginatedLeaks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredLeaks.value.slice(start, end)
})

// 建议和解决方案
const suggestions = ref([
  {
    title: '检查用户会话管理',
    description: '确保用户登出或会话超时时正确清理会话对象',
    impact: '高 - 可释放大量内存'
  },
  {
    title: '优化缓存策略',
    description: '实现LRU缓存淘汰机制，定期清理过期缓存',
    impact: '中 - 改善内存使用效率'
  },
  {
    title: '修复连接池泄漏',
    description: '检查数据库连接的使用和关闭逻辑，确保连接正确归还',
    impact: '高 - 防止连接资源耗尽'
  }
])

// 监听筛选条件变化，重置分页
watch([searchQuery, severityFilter, sortBy], () => {
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

function startMemoryAnalysis() {
  // 实现内存分析功能
  console.log('开始内存分析')
}

function exportReport() {
  // 实现导出报告功能
  console.log('导出内存泄漏分析报告')
}

function viewLeakDetails(leak: MemoryLeakResult) {
  // 实现查看泄漏详情功能
  console.log('查看泄漏详情:', leak)
}

function generateHeapDump(leak: MemoryLeakResult) {
  // 实现生成堆转储功能
  console.log('生成堆转储:', leak.className)
}

function getSeverityText(severity: string): string {
  const severityMap = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return severityMap[severity as keyof typeof severityMap] || severity
}

function formatMemory(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

// 组件挂载时初始化
onMounted(() => {
  refreshData()
})
</script>
