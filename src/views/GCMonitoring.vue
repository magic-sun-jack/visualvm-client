<template>
  <div class="gc-monitoring-container">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">GC监控</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">实时监控Java垃圾回收器性能和统计信息</p>
    </div>

    <!-- 连接状态指示器 -->
    <div class="mb-6">
      <ServiceLoading />
    </div>

    <!-- 应用信息 -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ processStore.currentProcess?.main_class }}</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">PID: {{ appInfo.pid }}</p>
        </div>
        <div class="text-sm text-gray-500">
          <span>刷新率: {{ refreshRate }}ms</span>
        </div>
      </div>
    </div>

    <!-- 内存空间监控 -->
    <Card class="bg-white dark:bg-gray-800 mb-8">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">内存空间使用情况</CardTitle>
        <CardDescription>实时显示各内存区域的使用状态</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Metaspace -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Metaspace</span>
              <span class="text-xs text-gray-500">{{ formatBytes(metaspace.used) }} / {{ formatBytes(metaspace.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${metaspace.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ metaspace.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Old Generation -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Old Gen</span>
              <span class="text-xs text-gray-500">{{ formatBytes(oldGen.used) }} / {{ formatBytes(oldGen.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-green-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${oldGen.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ oldGen.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Eden Space -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Eden</span>
              <span class="text-xs text-gray-500">{{ formatBytes(eden.used) }} / {{ formatBytes(eden.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${eden.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ eden.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Survivor 0 -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">S0</span>
              <span class="text-xs text-gray-500">{{ formatBytes(survivor0.used) }} / {{ formatBytes(survivor0.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${survivor0.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ survivor0.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Survivor 1 -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">S1</span>
              <span class="text-xs text-gray-500">{{ formatBytes(survivor1.used) }} / {{ formatBytes(survivor1.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${survivor1.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ survivor1.percentage.toFixed(1) }}%</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- GC概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">总GC次数</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ gcStats.totalCollections }}
          </div>
          <div class="text-xs text-gray-500 mt-1">最后原因: {{ gcStats.lastCause }}</div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">总GC时间</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ formatTime(gcStats.totalTime) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ gcStats.totalCollections }}次收集</div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">编译时间</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ formatTime(compileStats.totalTime) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ compileStats.totalCompiles }}次编译</div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">类加载时间</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ formatTime(classLoaderStats.totalTime) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ classLoaderStats.loaded }}加载, {{ classLoaderStats.unloaded }}卸载</div>
        </CardContent>
      </Card>
    </div>

    <!-- 对象年龄直方图 -->
    <Card class="bg-white dark:bg-gray-800 mb-8">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">对象年龄直方图</CardTitle>
        <CardDescription>显示对象在survivor空间中的年龄分布</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- 参数信息 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">Tenuring Threshold:</span>
              <span class="font-mono ml-2">{{ histogramParams.tenuringThreshold }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Max Tenuring Threshold:</span>
              <span class="font-mono ml-2">{{ histogramParams.maxTenuringThreshold }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Desired Survivor Size:</span>
              <span class="font-mono ml-2">{{ formatBytes(histogramParams.desiredSurvivorSize) }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Current Survivor Size:</span>
              <span class="font-mono ml-2">{{ formatBytes(histogramParams.currentSurvivorSize) }}</span>
            </div>
          </div>
          
          <!-- 直方图 -->
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Histogram (0-15):</div>
            <div class="grid grid-cols-8 gap-2">
              <div v-for="(age, index) in objectAgeHistogram" :key="index" class="space-y-1">
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">{{ index }}</div>
                <div class="w-full bg-gray-200 rounded h-20 flex items-end">
                  <div 
                    class="w-full bg-orange-500 rounded transition-all duration-300"
                    :style="{ height: `${age}%` }"
                  ></div>
                </div>
                <div class="text-xs text-center text-gray-500">{{ age.toFixed(0) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- GC类型统计和内存回收效率 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card class="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">GC类型统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="gcType in gcTypes" :key="gcType.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div 
                  class="w-3 h-3 rounded-full" 
                  :style="{ backgroundColor: gcType.color }"
                ></div>
                <span class="text-sm font-medium">{{ gcType.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold">{{ gcType.count }}</div>
                <div class="text-xs text-gray-500">{{ gcType.percentage }}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">内存回收效率</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm">回收效率</span>
              <span class="text-sm font-bold text-green-600">{{ gcStats.efficiency }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${gcStats.efficiency}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">
              基于回收内存量与总内存使用量的比例
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- GC时间趋势图 -->
    <Card class="bg-white dark:bg-gray-800 mb-8">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">GC时间趋势</CardTitle>
        <CardDescription>最近30分钟的GC执行时间变化</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="h-80">
          <GCTrendChart :data="gcTrendData" />
        </div>
      </CardContent>
    </Card>

    <!-- GC详细信息表格 -->
    <Card class="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">GC详细信息</CardTitle>
        <CardDescription>最近的GC事件记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>GC类型</TableHead>
                <TableHead>持续时间</TableHead>
                <TableHead>回收前内存</TableHead>
                <TableHead>回收后内存</TableHead>
                <TableHead>回收量</TableHead>
                <TableHead>原因</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="record in gcRecords" :key="record.id">
                <TableCell class="font-mono text-sm">{{ formatDateTime(record.timestamp) }}</TableCell>
                <TableCell>
                  <Badge :variant="getGCTypeVariant(record.type)">
                    {{ record.type }}
                  </Badge>
                </TableCell>
                <TableCell class="font-mono">{{ formatTime(record.duration) }}</TableCell>
                <TableCell class="font-mono">{{ formatBytes(record.beforeMemory) }}</TableCell>
                <TableCell class="font-mono">{{ formatBytes(record.afterMemory) }}</TableCell>
                <TableCell class="font-mono text-green-600">
                  {{ formatBytes(record.reclaimedMemory) }}
                </TableCell>
                <TableCell class="text-sm">{{ record.reason }}</TableCell>
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ServiceLoading from '@/components/ServiceLoading.vue'
import GCTrendChart from '@/components/charts/GCTrendChart.vue'
import { useProcessStore } from '@/stores/process'

const processStore = useProcessStore()

// 接口定义
interface AppInfo {
  name: string
  pid: number
}

interface MemorySpace {
  used: number
  max: number
  percentage: number
}

interface GCStats {
  totalCollections: number
  totalTime: number
  averageTime: number
  frequency: number
  efficiency: number
  lastCause: string
}

interface CompileStats {
  totalCompiles: number
  totalTime: number
}

interface ClassLoaderStats {
  loaded: number
  unloaded: number
  totalTime: number
}

interface HistogramParams {
  tenuringThreshold: number
  maxTenuringThreshold: number
  desiredSurvivorSize: number
  currentSurvivorSize: number
}

interface GCType {
  name: string
  count: number
  percentage: number
  color: string
}

interface GCRecord {
  id: string
  timestamp: number
  type: string
  duration: number
  beforeMemory: number
  afterMemory: number
  reclaimedMemory: number
  reason: string
}

interface GCTrendData {
  timestamp: number
  duration: number
  type: string
}

// 响应式数据
const appInfo = reactive<AppInfo>({
  name: 'org.springframework.boot.loader.launch.JarLauncher',
  pid: 14460
})

const refreshRate = ref(1000)

const metaspace = reactive<MemorySpace>({
  used: 0,
  max: 0,
  percentage: 0
})

const oldGen = reactive<MemorySpace>({
  used: 0,
  max: 0,
  percentage: 0
})

const eden = reactive<MemorySpace>({
  used: 0,
  max: 0,
  percentage: 0
})

const survivor0 = reactive<MemorySpace>({
  used: 0,
  max: 0,
  percentage: 0
})

const survivor1 = reactive<MemorySpace>({
  used: 0,
  max: 0,
  percentage: 0
})

const gcStats = reactive<GCStats>({
  totalCollections: 0,
  totalTime: 0,
  averageTime: 0,
  frequency: 0,
  efficiency: 0,
  lastCause: ''
})

const compileStats = reactive<CompileStats>({
  totalCompiles: 0,
  totalTime: 0
})

const classLoaderStats = reactive<ClassLoaderStats>({
  loaded: 0,
  unloaded: 0,
  totalTime: 0
})

const histogramParams = reactive<HistogramParams>({
  tenuringThreshold: 15,
  maxTenuringThreshold: 15,
  desiredSurvivorSize: 0,
  currentSurvivorSize: 0
})

const objectAgeHistogram = ref<number[]>(new Array(16).fill(0))

const gcTypes = ref<GCType[]>([
  { name: 'Young GC', count: 0, percentage: 0, color: '#3B82F6' },
  { name: 'Old GC', count: 0, percentage: 0, color: '#EF4444' },
  { name: 'Full GC', count: 0, percentage: 0, color: '#F59E0B' },
  { name: 'Mixed GC', count: 0, percentage: 0, color: '#10B981' }
])

const gcRecords = ref<GCRecord[]>([])
const gcTrendData = ref<GCTrendData[]>([])

// 工具函数
function formatTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(1)}ms`
  }
  return `${(milliseconds / 1000).toFixed(2)}s`
}

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

function getGCTypeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'Young GC':
      return 'default'
    case 'Old GC':
      return 'destructive'
    case 'Full GC':
      return 'secondary'
    case 'Mixed GC':
      return 'outline'
    default:
      return 'default'
  }
}

// 模拟数据生成
function generateMockData() {
  // 生成内存空间数据
  const generateMemorySpace = (maxMB: number, usedPercentage: number) => {
    const max = maxMB * 1024 * 1024
    const used = max * (usedPercentage / 100)
    return {
      used,
      max,
      percentage: usedPercentage
    }
  }

  // 根据图片中的数据生成内存空间
  Object.assign(metaspace, generateMemorySpace(57.875, 97.5)) // 56.405M / 57.875M
  Object.assign(oldGen, generateMemorySpace(59, 69.8)) // 41.164M / 59M
  Object.assign(eden, generateMemorySpace(87, 92.0)) // 80M / 87M
  Object.assign(survivor0, generateMemorySpace(1, 0)) // 0 / 1M
  Object.assign(survivor1, generateMemorySpace(1, 6.5)) // 66.461K / 1M

  // 生成GC统计数据
  gcStats.totalCollections = 53
  gcStats.totalTime = 470.910
  gcStats.averageTime = gcStats.totalTime / gcStats.totalCollections
  gcStats.frequency = Math.floor(Math.random() * 20) + 5
  gcStats.efficiency = Math.floor(Math.random() * 30) + 70
  gcStats.lastCause = 'G1 Evacuation Pause'

  // 生成编译统计
  compileStats.totalCompiles = 11502
  compileStats.totalTime = 16112

  // 生成类加载统计
  classLoaderStats.loaded = 11331
  classLoaderStats.unloaded = 299
  classLoaderStats.totalTime = 3852

  // 生成直方图参数
  histogramParams.desiredSurvivorSize = 5767168
  histogramParams.currentSurvivorSize = 0

  // 生成对象年龄直方图数据（根据图片中的分布）
  const histogramData = [85, 92, 78, 0, 88, 95, 0, 0, 0, 0, 82, 90, 0, 87, 93, 89]
  objectAgeHistogram.value = histogramData

  // 生成GC类型统计
  const total = gcStats.totalCollections
  gcTypes.value.forEach((type) => {
    let count = 0
    switch (type.name) {
      case 'Young GC':
        count = Math.floor(total * 0.7)
        break
      case 'Old GC':
        count = Math.floor(total * 0.2)
        break
      case 'Full GC':
        count = Math.floor(total * 0.05)
        break
      case 'Mixed GC':
        count = Math.floor(total * 0.05)
        break
    }
    type.count = count
    type.percentage = Math.round((count / total) * 100)
  })

  // 生成GC记录
  const records: GCRecord[] = []
  const now = Date.now()
  const types = ['Young GC', 'Old GC', 'Full GC', 'Mixed GC']
  const reasons = ['G1 Evacuation Pause', 'Allocation Failure', 'System.gc()', 'Concurrent Mode Failure']

  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const beforeMemory = Math.floor(Math.random() * 8000) + 2000
    const reclaimedMemory = Math.floor(Math.random() * beforeMemory * 0.8)
    const afterMemory = beforeMemory - reclaimedMemory
    
    records.push({
      id: `gc-${i}`,
      timestamp: now - (i * 30000), // 每30秒一条记录
      type,
      duration: Math.floor(Math.random() * 500) + 10,
      beforeMemory,
      afterMemory,
      reclaimedMemory,
      reason: reasons[Math.floor(Math.random() * reasons.length)]
    })
  }
  
  gcRecords.value = records

  // 生成趋势数据
  const trendData: GCTrendData[] = []
  for (let i = 0; i < 60; i++) {
    trendData.push({
      timestamp: now - (i * 30000),
      duration: Math.floor(Math.random() * 200) + 5,
      type: types[Math.floor(Math.random() * types.length)]
    })
  }
  
  gcTrendData.value = trendData.reverse()
}

// 生命周期
onMounted(() => {
  generateMockData()
  
  // 模拟实时数据更新
  const interval = setInterval(() => {
    generateMockData()
  }, 5000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.gc-monitoring-container {
  @apply p-6 max-w-7xl mx-auto;
}
</style>
