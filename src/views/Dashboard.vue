<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">系统概览</h1>
      <div class="text-sm text-gray-500">
        最后更新: {{ lastUpdateTime }}
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">运行中进程</p>
            <p class="text-2xl font-semibold text-gray-900">{{ runningProcessesCount }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">总内存使用</p>
            <p class="text-2xl font-semibold text-gray-900">{{ formatMemory(totalMemoryUsage) }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">总CPU使用</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalCpuUsage.toFixed(1) }}%</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">活跃连接</p>
            <p class="text-2xl font-semibold text-gray-900">{{ activeConnections }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 进程状态图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">进程状态分布</h3>
        <div class="h-64">
          <ProcessStatusChart :processes="processes" />
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">内存使用趋势</h3>
        <div class="h-64">
          <MemoryTrendChart :processes="processes" />
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
      <div class="space-y-3">
        <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <div :class="[
              'w-2 h-2 rounded-full',
              activity.type === 'start' ? 'bg-green-500' : 
              activity.type === 'stop' ? 'bg-red-500' : 'bg-blue-500'
            ]"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900">{{ activity.description }}</p>
            <p class="text-xs text-gray-500">{{ formatTime(activity.timestamp) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
      <div class="flex space-x-4">
        <button @click="refreshData" class="btn btn-primary">
          刷新数据
        </button>
        <button @click="showProcessManager" class="btn btn-secondary">
          进程管理
        </button>
        <button @click="showSystemConfig" class="btn btn-secondary">
          系统配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProcessStore } from '@/stores/process'
import ProcessStatusChart from '@/components/charts/ProcessStatusChart.vue'
import MemoryTrendChart from '@/components/charts/MemoryTrendChart.vue'
import type { JavaProcess } from '@/types'

const router = useRouter()
const processStore = useProcessStore()

const activeConnections = ref(0)
const lastUpdateTime = ref('')

// 计算属性
const processes = computed(() => processStore.processes)
const runningProcessesCount = computed(() => processStore.runningProcesses.length)
const totalMemoryUsage = computed(() => processStore.totalMemoryUsage)
const totalCpuUsage = computed(() => processStore.totalCpuUsage)

// 模拟最近活动数据
const recentActivities = ref([
  {
    id: '1',
    type: 'start',
    description: '进程 "user-service" 已启动',
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: '2',
    type: 'stop',
    description: '进程 "order-service" 已停止',
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: '3',
    type: 'info',
    description: '系统监控数据已更新',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  }
])

// 格式化内存大小
function formatMemory(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`
  return date.toLocaleDateString()
}

// 刷新数据
async function refreshData() {
  await processStore.fetchProcesses()
  lastUpdateTime.value = new Date().toLocaleString()
}

// 显示进程管理
function showProcessManager() {
  router.push('/manager')
}

// 显示系统配置
function showSystemConfig() {
  // 这里可以打开配置对话框
  console.log('显示系统配置')
}

// 组件挂载时初始化
onMounted(() => {
  refreshData()
  // 模拟活跃连接数
  activeConnections.value = Math.floor(Math.random() * 100) + 20
})
</script>
