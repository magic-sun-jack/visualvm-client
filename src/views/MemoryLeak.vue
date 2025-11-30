<template>
  <div class="p-4 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">内存泄漏分析</h1>
      <div class="flex space-x-3">
        <div class="flex items-center space-x-2">
          <input
            ref="fileInputRef"
            type="file"
            accept=".hprof,.heap"
            class="hidden"
            @change="handleFileSelect"
          />
          <Button variant="outline" @click="triggerFileSelect">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            选择文件
          </Button>
          <Input
            v-model="filePath"
            type="text"
            placeholder="输入文件路径（选择文件后将自动填充文件名）"
            class="w-64"
            @input="handleFilePathInput"
            @keyup.enter="analyzeMemoryLeak"
          />
          <div v-if="selectedFile" class="flex items-center space-x-2 text-sm text-muted-foreground">
            <span class="max-w-xs truncate">{{ selectedFile.name }}</span>
            <Button variant="ghost" size="sm" @click="clearFile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </Button>
          </div>
        </div>
        <Button @click="refreshData" :disabled="isLoading">
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
          <p class="text-sm text-muted-foreground">总内存使用</p>
          <p class="text-2xl font-bold text-foreground">{{ formatMemory(totalMemoryUsage) }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">堆内存使用</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatMemory(heapMemoryUsage) }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">非堆内存</p>
          <p class="text-2xl font-bold text-green-600">{{ formatMemory(nonHeapMemoryUsage) }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">可疑对象</p>
          <p class="text-2xl font-bold text-yellow-600">{{ suspiciousObjectsCount }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 内存趋势图 -->
    <Card>
      <CardHeader>
        <CardTitle>内存使用趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <div class="flex items-center justify-center h-full text-muted-foreground">
            内存趋势图表组件待实现
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 可疑对象列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>可疑对象分析</CardTitle>
          <div class="flex items-center space-x-2">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="搜索类名..."
              class="w-64"
            />
            <Select v-model="severityFilter" class="w-32" placeholder="选择级别">
              <option value="">全部级别</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="filteredObjects.length === 0" class="text-center py-8 text-muted-foreground">
          没有找到可疑对象
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  类名
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  实例数量
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  内存占用
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  风险级别
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-background divide-y divide-border">
              <tr v-for="obj in filteredObjects" :key="obj.className" class="hover:bg-muted/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-foreground">{{ obj.className }}</div>
                  <div class="text-xs text-muted-foreground">{{ obj.package }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ obj.instanceCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {{ formatMemory(obj.memoryUsage) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Badge :variant="getSeverityVariant(obj.severity)">
                    {{ getSeverityText(obj.severity) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button variant="ghost" size="sm" @click="viewObjectDetails(obj)">
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
import { memoryApi } from '@/api'

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const severityFilter = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const filePath = ref<string>('')

// 模拟数据
const totalMemoryUsage = ref(2.5 * 1024 * 1024 * 1024) // 2.5GB
const heapMemoryUsage = ref(1.8 * 1024 * 1024 * 1024) // 1.8GB
const nonHeapMemoryUsage = ref(0.7 * 1024 * 1024 * 1024) // 0.7GB
const suspiciousObjectsCount = ref(15)

const suspiciousObjects = ref([
  {
    className: 'String',
    package: 'java.lang',
    instanceCount: 1250000,
    memoryUsage: 250 * 1024 * 1024, // 250MB
    severity: 'medium'
  },
  {
    className: 'HashMap$Node',
    package: 'java.util',
    instanceCount: 85000,
    memoryUsage: 180 * 1024 * 1024, // 180MB
    severity: 'high'
  },
  {
    className: 'ArrayList',
    package: 'java.util',
    instanceCount: 45000,
    memoryUsage: 120 * 1024 * 1024, // 120MB
    severity: 'low'
  }
])

// 计算属性
const filteredObjects = computed(() => {
  let filtered = suspiciousObjects.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(obj => 
      obj.className.toLowerCase().includes(query) ||
      obj.package.toLowerCase().includes(query)
    )
  }

  if (severityFilter.value) {
    filtered = filtered.filter(obj => obj.severity === severityFilter.value)
  }

  return filtered
})

// 方法
function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    // 将文件名填充到路径输入框，用户可以补充完整路径
    filePath.value = file.name
  }
}

function handleFilePathInput() {
  // 输入文件路径时，如果路径与选中的文件名不一致，清除文件选择
  if (filePath.value && selectedFile.value && filePath.value !== selectedFile.value.name) {
    selectedFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function clearFile() {
  selectedFile.value = null
  filePath.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function analyzeMemoryLeak() {
  if (!filePath.value) {
    console.warn('请输入文件路径')
    return
  }

  isLoading.value = true
  try {
    const response = await memoryApi.getMemoryLeakAnalysis(filePath.value)
    
    if (response.areSuccess || response.success) {
      // 处理分析结果
      if (response.data) {
        // 更新数据
        updateAnalysisData(response.data)
      }
    } else {
      console.error('内存泄漏分析失败:', response.msg)
    }
  } catch (error) {
    console.error('内存泄漏分析失败:', error)
  } finally {
    isLoading.value = false
  }
}

function updateAnalysisData(data: any) {
  // 根据接口返回的数据更新界面
  // 这里需要根据实际接口返回的数据结构来更新
  if (data.totalMemoryUsage) {
    totalMemoryUsage.value = data.totalMemoryUsage
  }
  if (data.heapMemoryUsage) {
    heapMemoryUsage.value = data.heapMemoryUsage
  }
  if (data.nonHeapMemoryUsage) {
    nonHeapMemoryUsage.value = data.nonHeapMemoryUsage
  }
  if (data.suspiciousObjects) {
    suspiciousObjects.value = data.suspiciousObjects
    suspiciousObjectsCount.value = data.suspiciousObjects.length
  }
}

async function refreshData() {
  if (selectedFile.value || filePath.value) {
    await analyzeMemoryLeak()
  } else {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 1000)
  }
}

function exportReport() {
  console.log('导出内存泄漏分析报告')
}

function viewObjectDetails(obj: any) {
  console.log('查看对象详情:', obj)
}

function getSeverityText(severity: string): string {
  const severityMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return severityMap[severity as keyof typeof severityMap] || severity
}

function getSeverityVariant(severity: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary'
  }
  return variantMap[severity] || 'outline'
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
  refreshData()
})
</script>
