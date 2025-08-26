<template>
  <div class="p-4 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">多线程分析</h1>
      <div class="flex space-x-3">
        <Button @click="refreshData">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新数据
        </Button>
        <Button variant="outline" @click="exportReport">
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
          <p class="text-sm text-muted-foreground">总线程数</p>
          <p class="text-2xl font-bold text-foreground">{{ totalThreads }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">运行中</p>
          <p class="text-2xl font-bold text-green-600">{{ runningThreads }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">等待中</p>
          <p class="text-2xl font-bold text-yellow-600">{{ waitingThreads }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">阻塞中</p>
          <p class="text-2xl font-bold text-red-600">{{ blockedThreads }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 线程状态分布图 -->
    <Card>
      <CardHeader>
        <CardTitle>线程状态分布</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-muted-foreground">
            线程状态分布图表组件待实现
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 线程列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>线程列表</CardTitle>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm text-muted-foreground">状态:</label>
                          <Select v-model="statusFilter" class="w-32" placeholder="选择状态">
              <option value="">全部状态</option>
              <option value="RUNNABLE">运行中</option>
              <option value="WAITING">等待中</option>
              <option value="BLOCKED">阻塞中</option>
              <option value="TIMED_WAITING">限时等待</option>
            </Select>
            </div>
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
          没有找到线程
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  线程信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  优先级
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  CPU时间
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-background divide-y divide-border">
              <tr v-for="thread in filteredThreads" :key="thread.id" class="hover:bg-muted/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-foreground">{{ thread.name }}</div>
                  <div class="text-xs text-muted-foreground">ID: {{ thread.id }}</div>
                  <div class="text-xs text-muted-foreground">{{ thread.group }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Badge :variant="getStatusVariant(thread.state)">
                    {{ getStatusText(thread.state) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ thread.priority }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ formatCpuTime(thread.cpuTime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button variant="ghost" size="sm" @click="viewThreadDetails(thread)">
                    详情
                  </Button>
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
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Select } from '@/components/ui'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')

// 模拟数据
const totalThreads = ref(45)
const runningThreads = ref(12)
const waitingThreads = ref(18)
const blockedThreads = ref(3)

const threads = ref([
  {
    id: 1,
    name: 'main',
    group: 'main',
    state: 'RUNNABLE',
    priority: 5,
    cpuTime: 15000
  },
  {
    id: 2,
    name: 'Reference Handler',
    group: 'system',
    state: 'WAITING',
    priority: 10,
    cpuTime: 500
  },
  {
    id: 3,
    name: 'Finalizer',
    group: 'system',
    state: 'WAITING',
    priority: 8,
    cpuTime: 200
  },
  {
    id: 4,
    name: 'Signal Dispatcher',
    group: 'system',
    state: 'RUNNABLE',
    priority: 9,
    cpuTime: 1000
  },
  {
    id: 5,
    name: 'Attach Listener',
    group: 'system',
    state: 'RUNNABLE',
    priority: 5,
    cpuTime: 300
  }
])

// 计算属性
const filteredThreads = computed(() => {
  let filtered = threads.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(thread => 
      thread.name.toLowerCase().includes(query) ||
      thread.group.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(thread => thread.state === statusFilter.value)
  }

  return filtered
})

// 方法
function refreshData() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

function exportReport() {
  console.log('导出线程分析报告')
}

function viewThreadDetails(thread: any) {
  console.log('查看线程详情:', thread)
}

function getStatusText(state: string): string {
  const statusMap = {
    RUNNABLE: '运行中',
    WAITING: '等待中',
    BLOCKED: '阻塞中',
    TIMED_WAITING: '限时等待',
    TERMINATED: '已终止'
  }
  return statusMap[state as keyof typeof statusMap] || state
}

function getStatusVariant(state: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap = {
    RUNNABLE: 'default',
    WAITING: 'secondary',
    BLOCKED: 'destructive',
    TIMED_WAITING: 'outline',
    TERMINATED: 'outline'
  }
  return variantMap[state as keyof typeof variantMap] || 'outline'
}

function formatCpuTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }
  return `${(milliseconds / 1000).toFixed(2)}s`
}

// 组件挂载时初始化
onMounted(() => {
  refreshData()
})
</script>
