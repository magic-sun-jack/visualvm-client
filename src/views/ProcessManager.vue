<template>
  <div class="p-4 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">进程管理</h1>
      <div class="flex space-x-3">
        <Button @click="refreshProcesses">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新
        </Button>
        <Button variant="default" @click="showProcessSelector">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          添加监控
        </Button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">总进程数</p>
          <p class="text-2xl font-bold text-foreground">{{ totalProcesses }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">运行中</p>
          <p class="text-2xl font-bold text-green-600">{{ runningProcesses }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">已停止</p>
          <p class="text-2xl font-bold text-red-600">{{ stoppedProcesses }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">错误状态</p>
          <p class="text-2xl font-bold text-yellow-600">{{ errorProcesses }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 进程列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>进程列表</CardTitle>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm text-muted-foreground">状态:</label>
              <Select v-model="statusFilter" class="w-32" placeholder="选择状态">
                <option value="">全部状态</option>
                <option value="running">运行中</option>
                <option value="stopped">已停止</option>
                <option value="error">错误</option>
              </Select>
            </div>
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="搜索进程名..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="filteredProcesses.length === 0" class="text-center py-8 text-muted-foreground">
          没有找到进程
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  进程信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  内存使用
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  CPU使用
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-background divide-y divide-border">
              <tr v-for="process in filteredProcesses" :key="process.id" class="hover:bg-muted/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-foreground">{{ process.name }}</div>
                  <div class="text-xs text-muted-foreground">PID: {{ process.pid }}</div>
                  <div class="text-xs text-muted-foreground">{{ process.command }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Badge :variant="getStatusVariant(process.status)">
                    {{ getStatusText(process.status) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ formatMemory(process.memoryUsage) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ process.cpuUsage.toFixed(1) }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <Button variant="ghost" size="sm" @click="viewProcessDetails(process)">
                      详情
                    </Button>
                    <Button v-if="process.status === 'running'" variant="destructive" size="sm" @click="stopProcess(process.id)">
                      停止
                    </Button>
                    <Button v-else variant="default" size="sm" @click="startProcess(process.id)">
                      启动
                    </Button>
                    <Button variant="outline" size="sm" @click="restartProcess(process.id)">
                      重启
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 进程选择器对话框 -->
    <ProcessSelector
      v-model:isOpen="showProcessSelectorDialog"
      @select="handleProcessSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Select } from '@/components/ui'
import ProcessSelector from '@/components/monitoring/ProcessSelector.vue'
import { getJavaProcesses, startMonitoring, stopMonitoring } from '@/api/process'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showProcessSelectorDialog = ref(false)

// 模拟数据
const totalProcesses = ref(25)
const runningProcesses = ref(18)
const stoppedProcesses = ref(5)
const errorProcesses = ref(2)

const processes = ref([
  {
    id: '1',
    name: 'nginx',
    pid: 1234,
    command: '/usr/sbin/nginx',
    status: 'running',
    memoryUsage: 256 * 1024 * 1024, // 256MB
    cpuUsage: 2.5
  },
  {
    id: '2',
    name: 'mysql',
    pid: 5678,
    command: '/usr/sbin/mysqld',
    status: 'running',
    memoryUsage: 512 * 1024 * 1024, // 512MB
    cpuUsage: 5.2
  },
  {
    id: '3',
    name: 'redis',
    pid: 9012,
    command: '/usr/bin/redis-server',
    status: 'stopped',
    memoryUsage: 0,
    cpuUsage: 0
  }
])

// 计算属性
const filteredProcesses = computed(() => {
  let filtered = processes.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(process => 
      process.name.toLowerCase().includes(query) ||
      process.command.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(process => process.status === statusFilter.value)
  }

  return filtered
})

// 方法
async function refreshProcesses() {
  isLoading.value = true
  try {
    const response = await getJavaProcesses()
    if (response.success) {
      processes.value = response.data.map(process => ({
        id: process.pid.toString(),
        name: process.name,
        pid: process.pid,
        command: process.mainClass,
        status: process.status,
        memoryUsage: process.memoryUsage.used,
        cpuUsage: process.cpuUsage
      }))
    }
  } catch (error) {
    console.error('获取进程列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

function showProcessSelector() {
  showProcessSelectorDialog.value = true
}

async function handleProcessSelect(config: { pid: string, host?: string, port?: number }) {
  try {
    const response = await startMonitoring(config)
    if (response.success) {
      console.log('开始监控进程:', config)
      await refreshProcesses()
    }
  } catch (error) {
    console.error('启动监控失败:', error)
  }
}

async function stopProcess(id: string) {
  try {
    const response = await stopMonitoring(id)
    if (response.success) {
      console.log('停止监控进程:', id)
      await refreshProcesses()
    }
  } catch (error) {
    console.error('停止监控失败:', error)
  }
}

async function startProcess(id: string) {
  try {
    const response = await startMonitoring({ pid: id })
    if (response.success) {
      console.log('启动监控进程:', id)
      await refreshProcesses()
    }
  } catch (error) {
    console.error('启动监控失败:', error)
  }
}

async function restartProcess(id: string) {
  try {
    await stopMonitoring(id)
    await startMonitoring({ pid: id })
    console.log('重启监控进程:', id)
    await refreshProcesses()
  } catch (error) {
    console.error('重启监控失败:', error)
  }
}

function viewProcessDetails(process: any) {
  console.log('查看进程详情:', process)
}

function getStatusText(status: string): string {
  const statusMap = {
    running: '运行中',
    stopped: '已停止',
    error: '错误'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap = {
    running: 'default',
    stopped: 'destructive',
    error: 'destructive'
  }
  return variantMap[status as keyof typeof variantMap] || 'outline'
}

function formatMemory(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载时初始化
onMounted(() => {
  refreshProcesses()
})
</script>
