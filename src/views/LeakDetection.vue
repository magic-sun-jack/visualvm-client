<template>
  <div class="leak-detection-container">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">内存泄漏检测</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">智能检测和分析Java应用程序中的内存泄漏问题</p>
    </div>

    <!-- 连接状态指示器 -->
    <div class="mb-6">
      <ServiceLoading />
    </div>

    <!-- 检测状态概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">检测状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-2">
            <div 
              class="w-3 h-3 rounded-full"
              :class="detectionStatus.isRunning ? 'bg-green-500' : 'bg-gray-400'"
            ></div>
            <span class="text-lg font-bold" :class="detectionStatus.isRunning ? 'text-green-600' : 'text-gray-600'">
              {{ detectionStatus.isRunning ? '运行中' : '已停止' }}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">可疑对象</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {{ leakStats.suspiciousObjects }}
          </div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">泄漏风险</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold" :class="getRiskLevelColor(leakStats.riskLevel)">
            {{ getRiskLevelText(leakStats.riskLevel) }}
          </div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">检测时长</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ formatDuration(detectionStatus.duration) }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 内存使用趋势 -->
    <Card class="bg-white dark:bg-gray-800 mb-8">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">内存使用趋势</CardTitle>
        <CardDescription>监控内存使用情况，识别异常增长模式</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="h-80">
          <MemoryTrendChart :data="memoryTrendData" />
        </div>
      </CardContent>
    </Card>

    <!-- 泄漏检测结果 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 可疑对象列表 -->
      <Card class="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">可疑对象</CardTitle>
          <CardDescription>检测到的可能泄漏的对象</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div 
              v-for="object in suspiciousObjects" 
              :key="object.id"
              class="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ object.className }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ object.description }}</div>
                  <div class="flex items-center space-x-4 mt-2">
                    <span class="text-xs text-gray-600">
                      大小: {{ formatBytes(object.size) }}
                    </span>
                    <span class="text-xs text-gray-600">
                      引用: {{ object.referenceCount }}
                    </span>
                  </div>
                </div>
                <Badge :variant="getSeverityVariant(object.severity)">
                  {{ getSeverityText(object.severity) }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 检测统计 -->
      <Card class="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">检测统计</CardTitle>
          <CardDescription>内存泄漏检测的详细统计信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm">检测覆盖率</span>
                <span class="text-sm font-bold text-blue-600">{{ leakStats.coverage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${leakStats.coverage}%` }"
                ></div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm">误报率</span>
                <span class="text-sm font-bold text-green-600">{{ leakStats.falsePositiveRate }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${leakStats.falsePositiveRate}%` }"
                ></div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-4 border-t">
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ leakStats.totalScans }}</div>
                <div class="text-xs text-gray-500">总扫描次数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">{{ leakStats.objectsAnalyzed }}</div>
                <div class="text-xs text-gray-500">分析对象数</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 操作按钮 -->
    <div class="flex space-x-4 mb-8">
      <Button 
        @click="toggleDetection"
        :variant="detectionStatus.isRunning ? 'destructive' : 'default'"
        class="flex items-center space-x-2"
      >
        <Play v-if="!detectionStatus.isRunning" class="w-4 h-4" />
        <Square v-else class="w-4 h-4" />
        <span>{{ detectionStatus.isRunning ? '停止检测' : '开始检测' }}</span>
      </Button>
      
      <Button 
        @click="exportReport"
        variant="outline"
        class="flex items-center space-x-2"
      >
        <Download class="w-4 h-4" />
        <span>导出报告</span>
      </Button>
      
      <Button 
        @click="clearResults"
        variant="outline"
        class="flex items-center space-x-2"
      >
        <Trash2 class="w-4 h-4" />
        <span>清空结果</span>
      </Button>
    </div>

    <!-- 详细检测日志 -->
    <Card class="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">检测日志</CardTitle>
        <CardDescription>内存泄漏检测的详细日志记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>级别</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>消息</TableHead>
                <TableHead>对象ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="log in detectionLogs" :key="log.id">
                <TableCell class="font-mono text-sm">{{ formatDateTime(log.timestamp) }}</TableCell>
                <TableCell>
                  <Badge :variant="getLogLevelVariant(log.level)">
                    {{ log.level }}
                  </Badge>
                </TableCell>
                <TableCell class="text-sm">{{ log.type }}</TableCell>
                <TableCell class="text-sm">{{ log.message }}</TableCell>
                <TableCell class="font-mono text-xs">{{ log.objectId }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Play, Square, Download, Trash2 } from 'lucide-vue-next'
import ServiceLoading from '@/components/ServiceLoading.vue'
import MemoryTrendChart from '@/components/charts/MemoryTrendChart.vue'

// 接口定义
interface DetectionStatus {
  isRunning: boolean
  duration: number
  startTime: number
}

interface LeakStats {
  suspiciousObjects: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  coverage: number
  falsePositiveRate: number
  totalScans: number
  objectsAnalyzed: number
}

interface SuspiciousObject {
  id: string
  className: string
  description: string
  size: number
  referenceCount: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface DetectionLog {
  id: string
  timestamp: number
  level: 'info' | 'warning' | 'error'
  type: string
  message: string
  objectId: string
}

interface MemoryTrendData {
  timestamp: number
  used: number
  total: number
}

// 响应式数据
const detectionStatus = reactive<DetectionStatus>({
  isRunning: false,
  duration: 0,
  startTime: 0
})

const leakStats = reactive<LeakStats>({
  suspiciousObjects: 0,
  riskLevel: 'low',
  coverage: 0,
  falsePositiveRate: 0,
  totalScans: 0,
  objectsAnalyzed: 0
})

const suspiciousObjects = ref<SuspiciousObject[]>([])
const detectionLogs = ref<DetectionLog[]>([])
const memoryTrendData = ref<MemoryTrendData[]>([])

// 工具函数
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)}${units[unitIndex]}`
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

function getRiskLevelText(level: string): string {
  const levelMap = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '严重'
  }
  return levelMap[level as keyof typeof levelMap] || '未知'
}

function getRiskLevelColor(level: string): string {
  const colorMap = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400'
  }
  return colorMap[level as keyof typeof colorMap] || 'text-gray-600'
}

function getSeverityText(severity: string): string {
  const severityMap = {
    low: '轻微',
    medium: '中等',
    high: '严重',
    critical: '危急'
  }
  return severityMap[severity as keyof typeof severityMap] || '未知'
}

function getSeverityVariant(severity: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
    critical: 'destructive'
  }
  return variantMap[severity as keyof typeof variantMap] || 'default'
}

function getLogLevelVariant(level: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap = {
    info: 'outline',
    warning: 'secondary',
    error: 'destructive'
  }
  return variantMap[level as keyof typeof variantMap] || 'default'
}

// 操作方法
function toggleDetection() {
  if (detectionStatus.isRunning) {
    detectionStatus.isRunning = false
    detectionStatus.duration = Math.floor((Date.now() - detectionStatus.startTime) / 1000)
  } else {
    detectionStatus.isRunning = true
    detectionStatus.startTime = Date.now()
    detectionStatus.duration = 0
  }
}

function exportReport() {
  // 模拟导出报告
  console.log('导出检测报告')
}

function clearResults() {
  suspiciousObjects.value = []
  detectionLogs.value = []
  leakStats.suspiciousObjects = 0
  leakStats.riskLevel = 'low'
}

// 模拟数据生成
function generateMockData() {
  // 生成泄漏统计
  leakStats.suspiciousObjects = Math.floor(Math.random() * 20)
  leakStats.coverage = Math.floor(Math.random() * 20) + 80
  leakStats.falsePositiveRate = Math.floor(Math.random() * 10) + 5
  leakStats.totalScans = Math.floor(Math.random() * 1000) + 500
  leakStats.objectsAnalyzed = Math.floor(Math.random() * 10000) + 5000
  
  // 根据可疑对象数量确定风险级别
  if (leakStats.suspiciousObjects > 15) {
    leakStats.riskLevel = 'critical'
  } else if (leakStats.suspiciousObjects > 10) {
    leakStats.riskLevel = 'high'
  } else if (leakStats.suspiciousObjects > 5) {
    leakStats.riskLevel = 'medium'
  } else {
    leakStats.riskLevel = 'low'
  }

  // 生成可疑对象
  const objects: SuspiciousObject[] = []
  const classNames = [
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.lang.String',
    'com.example.User',
    'com.example.Order',
    'java.util.concurrent.ThreadPoolExecutor'
  ]
  
  const descriptions = [
    '大量未释放的集合对象',
    '缓存未正确清理',
    '字符串常量池泄漏',
    '用户会话未过期',
    '订单对象循环引用',
    '线程池未正确关闭'
  ]

  for (let i = 0; i < leakStats.suspiciousObjects; i++) {
    const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
    objects.push({
      id: `obj-${i}`,
      className: classNames[Math.floor(Math.random() * classNames.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      size: Math.floor(Math.random() * 1000000) + 100000,
      referenceCount: Math.floor(Math.random() * 100) + 10,
      severity
    })
  }
  
  suspiciousObjects.value = objects

  // 生成检测日志
  const logs: DetectionLog[] = []
  const levels = ['info', 'warning', 'error'] as const
  const types = ['内存扫描', '对象分析', '引用检查', 'GC分析']
  const messages = [
    '开始内存扫描',
    '发现可疑对象',
    '分析对象引用关系',
    '检测到潜在泄漏',
    '完成GC分析',
    '生成检测报告'
  ]

  const now = Date.now()
  for (let i = 0; i < 15; i++) {
    logs.push({
      id: `log-${i}`,
      timestamp: now - (i * 60000), // 每分钟一条日志
      level: levels[Math.floor(Math.random() * levels.length)],
      type: types[Math.floor(Math.random() * types.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      objectId: `obj-${Math.floor(Math.random() * 10)}`
    })
  }
  
  detectionLogs.value = logs.reverse()

  // 生成内存趋势数据
  const trendData: MemoryTrendData[] = []
  const baseMemory = 2000000000 // 2GB
  for (let i = 0; i < 60; i++) {
    const used = baseMemory + (Math.random() - 0.5) * 500000000
    trendData.push({
      timestamp: now - (i * 30000),
      used,
      total: baseMemory * 1.5
    })
  }
  
  memoryTrendData.value = trendData.reverse()
}

// 生命周期
onMounted(() => {
  generateMockData()
  
  // 模拟实时数据更新
  const interval = setInterval(() => {
    if (detectionStatus.isRunning) {
      detectionStatus.duration = Math.floor((Date.now() - detectionStatus.startTime) / 1000)
      generateMockData()
    }
  }, 5000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.leak-detection-container {
  @apply p-6 max-w-7xl mx-auto;
}
</style>
