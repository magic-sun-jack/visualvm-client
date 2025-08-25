<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">进程管理</h1>
      <div class="flex space-x-3">
        <button @click="refreshProcesses" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新
        </button>
        <button @click="showStartProcessDialog" class="btn btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          启动进程
        </button>
        <button @click="showBatchOperations" class="btn btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          批量操作
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">总进程数</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalProcesses }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">运行中</p>
          <p class="text-2xl font-bold text-green-600">{{ runningProcesses }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">已停止</p>
          <p class="text-2xl font-bold text-red-600">{{ stoppedProcesses }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">错误状态</p>
          <p class="text-2xl font-bold text-yellow-600">{{ errorProcesses }}</p>
        </div>
      </div>
    </div>

    <!-- 进程列表 -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">进程列表</h3>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">状态:</label>
            <select v-model="statusFilter" class="select select-sm">
              <option value="">全部状态</option>
              <option value="running">运行中</option>
              <option value="stopped">已停止</option>
              <option value="error">错误</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">排序:</label>
            <select v-model="sortBy" class="select select-sm">
              <option value="name">按名称</option>
              <option value="startTime">按启动时间</option>
              <option value="memoryUsage">按内存使用</option>
              <option value="cpuUsage">按CPU使用</option>
            </select>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索进程名或主类..."
            class="input input-sm w-64"
          />
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="filteredProcesses.length === 0" class="text-center py-8 text-gray-500">
        没有找到进程
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  v-model="selectAll"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                进程信息
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                资源使用
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                启动时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="process in paginatedProcesses" :key="process.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  v-model="selectedProcesses"
                  :value="process.id"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <div class="text-sm font-medium text-gray-900">{{ process.name }}</div>
                  <div class="text-sm text-gray-500">PID: {{ process.pid }}</div>
                  <div class="text-sm text-gray-500">{{ process.mainClass }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  process.status === 'running' ? 'bg-green-100 text-green-800' :
                  process.status === 'stopped' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                ]">
                  {{ getStatusText(process.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatMemory(process.memoryUsage.used) }}</div>
                <div class="text-sm text-gray-500">{{ process.cpuUsage.toFixed(1) }}% CPU</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(process.startTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewProcessDetails(process)" class="text-primary-600 hover:text-primary-900">
                    详情
                  </button>
                  <button v-if="process.status === 'running'" @click="stopProcess(process.id)" class="text-red-600 hover:text-red-900">
                    停止
                  </button>
                  <button v-else @click="startProcess(process.id)" class="text-green-600 hover:text-green-900">
                    启动
                  </button>
                  <button @click="restartProcess(process.id)" class="text-yellow-600 hover:text-yellow-900">
                    重启
                  </button>
                  <button @click="showProcessConfig(process)" class="text-blue-600 hover:text-blue-900">
                    配置
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-700">
            显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredProcesses.length) }} 条，
            共 {{ filteredProcesses.length }} 条记录
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

    <!-- 批量操作 -->
    <div v-if="selectedProcesses.length > 0" class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">批量操作</h3>
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-600">已选择 {{ selectedProcesses.length }} 个进程</span>
        <button @click="batchStart" class="btn btn-sm btn-green">批量启动</button>
        <button @click="batchStop" class="btn btn-sm btn-red">批量停止</button>
        <button @click="batchRestart" class="btn btn-sm btn-yellow">批量重启</button>
        <button @click="clearSelection" class="btn btn-sm btn-secondary">清除选择</button>
      </div>
    </div>

    <!-- 启动进程对话框 -->
    <div v-if="showStartDialog" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">启动新进程</h3>
          <form @submit.prevent="handleStartProcess" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">进程名称</label>
              <input v-model="startParams.name" type="text" required class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">JAR文件路径</label>
              <input v-model="startParams.jarPath" type="text" required class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">主类名</label>
              <input v-model="startParams.mainClass" type="text" class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">JVM参数</label>
              <textarea v-model="jvmOptionsText" placeholder="每行一个参数" class="textarea w-full" rows="3"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">程序参数</label>
              <textarea v-model="argumentsText" placeholder="每行一个参数" class="textarea w-full" rows="3"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">工作目录</label>
              <input v-model="startParams.workingDirectory" type="text" class="input w-full" />
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" @click="closeStartDialog" class="btn btn-secondary">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                启动
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 进程配置对话框 -->
    <div v-if="showConfigDialog" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">进程配置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">进程名称</label>
              <input v-model="configProcess.name" type="text" class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">JVM参数</label>
              <textarea v-model="configJvmOptions" placeholder="每行一个参数" class="textarea w-full" rows="3"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">程序参数</label>
              <textarea v-model="configArguments" placeholder="每行一个参数" class="textarea w-full" rows="3"></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button @click="closeConfigDialog" class="btn btn-secondary">
                取消
              </button>
              <button @click="saveProcessConfig" class="btn btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProcessStore } from '@/stores/process'
import type { JavaProcess, ProcessStartParams } from '@/types'

const processStore = useProcessStore()

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('name')
const currentPage = ref(1)
const pageSize = 20
const showStartDialog = ref(false)
const showConfigDialog = ref(false)
const selectedProcesses = ref<string[]>([])
const selectAll = ref(false)

const startParams = ref<ProcessStartParams & { name: string }>({
  name: '',
  jarPath: '',
  mainClass: '',
  jvmOptions: [],
  arguments: []
})
const jvmOptionsText = ref('')
const argumentsText = ref('')

const configProcess = ref<JavaProcess | null>(null)
const configJvmOptions = ref('')
const configArguments = ref('')

// 计算属性
const processes = computed(() => processStore.processes)
const totalProcesses = computed(() => processStore.totalProcesses)
const runningProcesses = computed(() => processStore.runningProcesses.length)
const stoppedProcesses = computed(() => processStore.stoppedProcesses.length)
const errorProcesses = computed(() => processes.value.filter(p => p.status === 'error').length)

const filteredProcesses = computed(() => {
  let filtered = processes.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.mainClass.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }

  // 排序
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'startTime':
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      case 'memoryUsage':
        return b.memoryUsage.used - a.memoryUsage.used
      case 'cpuUsage':
        return b.cpuUsage - a.cpuUsage
      default:
        return 0
    }
  })

  return sorted
})

const totalPages = computed(() => Math.ceil(filteredProcesses.length / pageSize))
const paginatedProcesses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredProcesses.value.slice(start, end)
})

// 监听筛选条件变化，重置分页
watch([searchQuery, statusFilter, sortBy], () => {
  currentPage.value = 1
})

// 监听选择变化
watch(selectedProcesses, (newSelection) => {
  selectAll.value = newSelection.length === filteredProcesses.value.length && newSelection.length > 0
})

// 方法
async function refreshProcesses() {
  await processStore.fetchProcesses()
}

function showStartProcessDialog() {
  showStartDialog.value = true
  startParams.value = {
    name: '',
    jarPath: '',
    mainClass: '',
    jvmOptions: [],
    arguments: []
  }
  jvmOptionsText.value = ''
  argumentsText.value = ''
}

function closeStartDialog() {
  showStartDialog.value = false
}

async function handleStartProcess() {
  // 解析JVM参数和程序参数
  startParams.value.jvmOptions = jvmOptionsText.value.split('\n').filter(s => s.trim())
  startParams.value.arguments = argumentsText.value.split('\n').filter(s => s.trim())

  const result = await processStore.startProcess(startParams.value)
  if (result) {
    closeStartDialog()
    refreshProcesses()
  }
}

async function stopProcess(id: string) {
  await processStore.stopProcess(id)
  refreshProcesses()
}

async function startProcess(id: string) {
  // 这里需要实现启动已停止进程的逻辑
  console.log('启动进程:', id)
}

async function restartProcess(id: string) {
  const result = await processStore.restartProcess(id)
  if (result) {
    refreshProcesses()
  }
}

function showProcessConfig(process: JavaProcess) {
  configProcess.value = process
  configJvmOptions.value = process.arguments.join('\n')
  configArguments.value = process.arguments.join('\n')
  showConfigDialog.value = true
}

function closeConfigDialog() {
  showConfigDialog.value = false
  configProcess.value = null
}

function saveProcessConfig() {
  // 实现保存进程配置功能
  console.log('保存进程配置:', configProcess.value?.id)
  closeConfigDialog()
}

function viewProcessDetails(process: JavaProcess) {
  processStore.setCurrentProcess(process)
  // 这里可以导航到详情页面或打开详情对话框
  console.log('查看进程详情:', process.id)
}

function showBatchOperations() {
  // 实现批量操作功能
  console.log('显示批量操作')
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedProcesses.value = filteredProcesses.value.map(p => p.id)
  } else {
    selectedProcesses.value = []
  }
}

function batchStart() {
  // 实现批量启动功能
  console.log('批量启动进程:', selectedProcesses.value)
}

function batchStop() {
  // 实现批量停止功能
  console.log('批量停止进程:', selectedProcesses.value)
}

function batchRestart() {
  // 实现批量重启功能
  console.log('批量重启进程:', selectedProcesses.value)
}

function clearSelection() {
  selectedProcesses.value = []
  selectAll.value = false
}

function getStatusText(status: string): string {
  const statusMap = {
    running: '运行中',
    stopped: '已停止',
    error: '错误'
  }
  return statusMap[status as keyof typeof statusMap] || status
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
  refreshProcesses()
})
</script>
