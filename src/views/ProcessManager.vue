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
        <Button variant="outline" @click="showCreateProcessDialog">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          创建进程
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
              <select v-model="statusFilter" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="">全部状态</option>
                <option value="running">运行中</option>
                <option value="stopped">已停止</option>
                <option value="error">错误</option>
              </select>
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

    <!-- 创建进程对话框 -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-md bg-card">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-foreground mb-4">创建新进程</h3>
          <form @submit.prevent="handleCreateProcess" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground">进程名称</label>
              <Input v-model="createParams.name" type="text" required class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground">命令</label>
              <Input v-model="createParams.command" type="text" required class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground">工作目录</label>
              <Input v-model="createParams.workingDir" type="text" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground">环境变量</label>
              <textarea v-model="envVarsText" placeholder="每行一个变量，格式：KEY=VALUE" class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" rows="3"></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <Button type="button" variant="outline" @click="closeCreateDialog">
                取消
              </Button>
              <Button type="submit">
                创建
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '@/components/ui'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showCreateDialog = ref(false)
const createParams = ref({
  name: '',
  command: '',
  workingDir: '',
  envVars: []
})
const envVarsText = ref('')

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
function refreshProcesses() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

function showCreateProcessDialog() {
  showCreateDialog.value = true
  createParams.value = {
    name: '',
    command: '',
    workingDir: '',
    envVars: []
  }
  envVarsText.value = ''
}

function closeCreateDialog() {
  showCreateDialog.value = false
}

async function handleCreateProcess() {
  // 解析环境变量
  createParams.value.envVars = envVarsText.value.split('\n').filter(s => s.trim())

  console.log('创建进程:', createParams.value)
  closeCreateDialog()
  refreshProcesses()
}

async function stopProcess(id: string) {
  console.log('停止进程:', id)
  refreshProcesses()
}

async function startProcess(id: string) {
  console.log('启动进程:', id)
  refreshProcesses()
}

async function restartProcess(id: string) {
  console.log('重启进程:', id)
  refreshProcesses()
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
