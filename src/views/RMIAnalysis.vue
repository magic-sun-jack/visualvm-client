<template>
  <div class="p-4 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">RMI分析</h1>
      <div class="flex space-x-3">
        <Button @click="refreshData">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新数据
        </Button>
        <Button variant="outline" @click="exportData">
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
          <p class="text-sm text-muted-foreground">总调用次数</p>
          <p class="text-2xl font-bold text-foreground">{{ totalCalls }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">成功调用</p>
          <p class="text-2xl font-bold text-green-600">{{ successCalls }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">平均执行时间</p>
          <p class="text-2xl font-bold text-blue-600">{{ averageExecutionTime }}ms</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">远程主机数</p>
          <p class="text-2xl font-bold text-purple-600">{{ uniqueHosts }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>调用时间分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <div class="flex items-center justify-center h-full text-muted-foreground">
              图表组件待实现
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>远程主机分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <div class="flex items-center justify-center h-full text-muted-foreground">
              图表组件待实现
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 筛选和搜索 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>RMI调用记录</CardTitle>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm text-muted-foreground">状态:</label>
              <select v-model="statusFilter" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="">全部</option>
                <option value="success">成功</option>
                <option value="error">错误</option>
                <option value="timeout">超时</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm text-muted-foreground">时间范围:</label>
              <select v-model="timeRange" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="1h">最近1小时</option>
                <option value="6h">最近6小时</option>
                <option value="24h">最近24小时</option>
                <option value="7d">最近7天</option>
              </select>
            </div>
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="搜索方法名或类名..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="filteredCalls.length === 0" class="text-center py-8 text-muted-foreground">
          没有找到RMI调用记录
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  时间
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  方法调用
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  执行时间
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  远程主机
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-background divide-y divide-border">
              <tr v-for="call in filteredCalls" :key="call.id" class="hover:bg-muted/50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ formatTime(call.timestamp) }}
                </td>
                <td class="px-6 py-4">
                  <div class="max-w-xs truncate text-sm text-foreground" :title="call.methodName">
                    {{ call.methodName }}
                  </div>
                  <div class="text-xs text-muted-foreground">{{ call.className }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Badge :variant="getStatusVariant(call.status)">
                    {{ getStatusText(call.status) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ call.executionTime }}ms
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ call.remoteHost }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button variant="ghost" size="sm" @click="viewCallDetails(call)">
                    详情
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
          <div class="text-sm text-muted-foreground">
            显示第 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, totalCalls) }} 条，共 {{ totalCalls }} 条记录
          </div>
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
              上一页
            </Button>
            <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '@/components/ui'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const timeRange = ref('1h')
const currentPage = ref(1)
const pageSize = ref(20)

// 模拟数据
const totalCalls = ref(856)
const successCalls = ref(812)
const averageExecutionTime = ref(67)
const uniqueHosts = ref(12)

const rmiCalls = ref([
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    methodName: 'getUserInfo',
    className: 'com.example.UserService',
    status: 'success',
    executionTime: 45,
    remoteHost: '192.168.1.100:1099'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    methodName: 'processOrder',
    className: 'com.example.OrderService',
    status: 'success',
    executionTime: 89,
    remoteHost: '192.168.1.101:1099'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    methodName: 'validatePayment',
    className: 'com.example.PaymentService',
    status: 'error',
    executionTime: 150,
    remoteHost: '192.168.1.102:1099'
  }
])

// 计算属性
const filteredCalls = computed(() => {
  let filtered = rmiCalls.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(call => 
      call.methodName.toLowerCase().includes(query) ||
      call.className.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(call => call.status === statusFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredCalls.value.length / pageSize.value))

// 方法
function refreshData() {
  isLoading.value = true
  // 模拟API调用
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

function exportData() {
  console.log('导出RMI分析报告')
}

function viewCallDetails(call: any) {
  console.log('查看调用详情:', call)
}

function changePage(page: number) {
  currentPage.value = page
}

function getStatusText(status: string): string {
  const statusMap = {
    success: '成功',
    error: '错误',
    timeout: '超时'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap = {
    success: 'default',
    error: 'destructive',
    timeout: 'destructive'
  }
  return variantMap[status as keyof typeof variantMap] || 'outline'
}

function formatTime(date: Date): string {
  return date.toLocaleString()
}

// 组件挂载时初始化
onMounted(() => {
  refreshData()
})
</script>
