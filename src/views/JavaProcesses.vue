<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Java进程监控</h1>
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
          <p class="text-2xl font-bold text-green-600">{{ runningProcessesCount }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">已停止</p>
          <p class="text-2xl font-bold text-red-600">{{ stoppedProcessesCount }}</p>
        </div>
      </div>
      <div class="card">
        <div class="text-center">
          <p class="text-sm text-gray-500">总内存使用</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatMemory(totalMemoryUsage) }}</p>
        </div>
      </div>
    </div>

    <!-- 进程列表 -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">进程列表</h3>
        <div class="flex items-center space-x-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索进程..."
            class="input input-sm"
          />
          <select v-model="statusFilter" class="select select-sm">
            <option value="">全部状态</option>
            <option value="running">运行中</option>
            <option value="stopped">已停止</option>
            <option value="error">错误</option>
          </select>
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
                进程信息
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                内存使用
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPU使用
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                线程数
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="process in filteredProcesses" :key="process.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
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
                <div class="text-sm text-gray-500">{{ process.memoryUsage.percentage.toFixed(1) }}%</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ process.cpuUsage.toFixed(1) }}%</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ process.threadCount }}</div>
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 启动进程对话框 -->
    <div v-if="showStartDialog" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">启动新进程</h3>
          <form @submit.prevent="handleStartProcess" class="space-y-4">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProcessStore } from '@/stores/process'
import type { JavaProcess, ProcessStartParams } from '@/types'

const router = useRouter()
const processStore = useProcessStore()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const showStartDialog = ref(false)
const startParams = ref<ProcessStartParams>({
  jarPath: '',
  mainClass: '',
  jvmOptions: [],
  arguments: []
})
const jvmOptionsText = ref('')
const argumentsText = ref('')

// 计算属性
const processes = computed(() => processStore.processes)
const isLoading = computed(() => processStore.isLoading)
const totalProcesses = computed(() => processStore.totalProcesses)
const runningProcessesCount = computed(() => processStore.runningProcesses.length)
const stoppedProcessesCount = computed(() => processStore.stoppedProcesses.length)
const totalMemoryUsage = computed(() => processStore.totalMemoryUsage)

const filteredProcesses = computed(() => {
  let filtered = processes.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.mainClass.toLowerCase().includes(query) ||
      p.pid.toString().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }

  return filtered
})

// 方法
function refreshProcesses() {
  processStore.fetchProcesses()
}

function showStartProcessDialog() {
  showStartDialog.value = true
  startParams.value = {
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

function viewProcessDetails(process: JavaProcess) {
  processStore.setCurrentProcess(process)
  router.push(`/processes/${process.id}`)
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

// 组件挂载时获取进程列表
onMounted(() => {
  refreshProcesses()
})
</script>
