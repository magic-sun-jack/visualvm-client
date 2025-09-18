<template>
  <div class="p-6 space-y-6 bg-background min-h-full">
    <!-- 顶部标题栏 -->
    <Card>
      <CardContent class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-xl font-semibold">概述</h1>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                v-model="savedDataEnabled"
                class="rounded border-gray-300"
              />
              <CheckSquare class="w-4 h-4 text-blue-500" />
              <span>保存的数据</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                v-model="detailInfoEnabled"
                class="rounded border-gray-300"
              />
              <FileText class="w-4 h-4 text-blue-500" />
              <span>详细信息</span>
            </label>
          </div>
        </div>

        <!-- 错误信息显示 -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-destructive/15 border border-destructive/20 rounded-md">
          <div class="flex items-center gap-2 text-sm text-destructive">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ errorMessage }}
          </div>
        </div>

        <!-- 进程信息表格 -->
        <div class="space-y-4">
          <!-- PID 行 -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">PID</div>
            <div class="col-span-6 flex items-center gap-2">
              <select 
                v-model="selectedPid" 
                class="border rounded-md px-3 py-1 text-sm bg-background"
                @change="handlePidChange"
                :disabled="availableProcesses.length === 0"
              >
                <option v-if="availableProcesses.length === 0" value="" disabled>
                  暂无可用进程
                </option>
                <option v-for="process in availableProcesses" :key="process.pid" :value="process.pid">
                  {{ process.pid }}
                </option>
              </select>
              <Button variant="ghost" size="sm" @click="refreshProcesses" :disabled="isRefreshing">
                <RefreshCw :class="['w-4 h-4', { 'animate-spin': isRefreshing }]" />
              </Button>
            </div>
          </div>

          <!-- 主机 -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">主机</div>
            <div class="col-span-10 text-sm text-muted-foreground">{{ currentProcess.host || '本地' }}</div>
          </div>

          <!-- 主类 -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">主类</div>
            <div class="col-span-10 text-sm text-muted-foreground">{{ currentProcess.mainClass || 'monitor-0.0.1-SNAPSHOT(1).jar' }}</div>
          </div>

          <!-- 参数 -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">参数</div>
            <div class="col-span-10 text-sm text-muted-foreground">{{ formatArguments(currentProcess.arguments) || '接口待补充' }}</div>
          </div>

          <!-- JVM -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">JVM</div>
            <div class="col-span-10 text-sm text-muted-foreground">{{ currentProcess.jvmVersion || 'monitor-0.0.1-SNAPSHOT(1).jar' }}</div>
          </div>

          <!-- Java版本 -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">Java版本</div>
            <div class="col-span-10 text-sm text-muted-foreground">{{ currentProcess.javaVersion || '-' }}</div>
          </div>

          <!-- Java Home目录 -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">Java Home目录</div>
            <div class="col-span-10 text-sm text-muted-foreground">{{ currentProcess.javaHome || '-' }}</div>
          </div>

          <!-- JVM标志 -->
          <div class="grid grid-cols-12 gap-4 items-center py-2">
            <div class="col-span-2 text-sm font-medium">JVM标志</div>
            <div class="col-span-10 text-sm text-muted-foreground">{{ currentProcess.jvmFlags || 'monitor-0.0.1-SNAPSHOT(1).jar' }}</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 底部双面板区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 左侧保存的数据面板 -->
      <div class="lg:col-span-4">
        <Card class="h-fit">
          <CardHeader>
            <CardTitle class="text-base">保存的数据</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">线程Dump</span>
              <span class="text-sm text-muted-foreground">{{ statistics.threadDumps > 0 ? statistics.threadDumps : '-' }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">堆Dump</span>
              <span class="text-sm text-muted-foreground">{{ statistics.heapDumps > 0 ? statistics.heapDumps : '-' }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">PreFilter快照</span>
              <span class="text-sm text-muted-foreground">{{ statistics.profilerSnapshots > 0 ? statistics.profilerSnapshots : '-' }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 右侧标签页区域 -->
      <div class="lg:col-span-8">
        <Card class="h-fit">
          <CardContent class="p-0">
            <Tabs v-model="activeTab" class="w-full">
              <TabsList class="w-full justify-start rounded-none border-b bg-muted/30">
                <TabsTrigger value="jvm-arguments" class="rounded-none">JVM参数</TabsTrigger>
                <TabsTrigger value="system-properties" class="rounded-none">系统属性</TabsTrigger>
              </TabsList>

              <!-- JVM参数标签页 -->
              <TabsContent value="jvm-arguments" class="p-4">
                <div class="space-y-2">
                  <!-- 加载状态 -->
                  <div v-if="isLoadingJvmArgs" class="flex items-center justify-center py-8">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      正在加载JVM参数...
                    </div>
                  </div>
                  <!-- 无数据状态 -->
                  <div v-else-if="jvmArguments.length === 0" class="text-muted-foreground text-center py-8">
                    没有可用的JVM参数信息
                  </div>
                  <!-- 数据显示 -->
                  <div v-else class="space-y-2">
                    <div 
                      v-for="(arg, index) in jvmArguments" 
                      :key="index" 
                      class="p-2 bg-muted/50 rounded text-sm font-mono"
                    >
                      {{ arg }}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <!-- 系统属性标签页 -->
              <TabsContent value="system-properties" class="p-4">
                <div class="space-y-1">
                  <!-- 加载状态 -->
                  <div v-if="isLoadingSysProps" class="flex items-center justify-center py-8">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      正在加载系统属性...
                    </div>
                  </div>
                  <!-- 无数据状态 -->
                  <div v-else-if="systemProperties.length === 0" class="text-muted-foreground text-center py-8">
                    没有可用的系统属性信息
                  </div>
                  <!-- 数据显示 -->
                  <div v-else class="space-y-1">
                    <div 
                      v-for="property in systemProperties" 
                      :key="property.key" 
                      class="grid grid-cols-5 gap-4 py-2 px-2 hover:bg-muted/50 rounded text-sm"
                    >
                      <div class="font-medium col-span-2">{{ property.key }}</div>
                      <div class="text-muted-foreground col-span-3 break-all">{{ property.value }}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProcessStore } from '@/stores/process'
import { processApi } from '@/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  CheckSquare,
  FileText,
  RefreshCw
} from 'lucide-vue-next'
import type { JavaProcess } from '@/types'

const processStore = useProcessStore()
const activeTab = ref('jvm-arguments')

// UI 状态
const savedDataEnabled = ref(true)
const detailInfoEnabled = ref(true)
const selectedPid = ref<number>(23088)
const isRefreshing = ref(false)
const isLoadingDetails = ref(false)
const isLoadingJvmArgs = ref(false)
const isLoadingSysProps = ref(false)

// 错误状态
const errorMessage = ref<string>('')

// 数据状态
const processDetails = ref<JavaProcess | null>(null)
const jvmArguments = ref<string[]>([])
const systemProperties = ref<Array<{key: string, value: string}>>([])

// 统计数据
const statistics = ref({
  threadDumps: 0,
  heapDumps: 0,
  profilerSnapshots: 0,
  jfrSnapshots: 0
})

// 可用进程列表
const availableProcesses = computed(() => {
  const processes = processStore.processes
  if (processes.length > 0) {
    return processes.map(p => ({
      pid: p.pid,
      name: p.name,
      mainClass: p.mainClass,
      status: p.status
    }))
  }
  
  // 如果没有真实数据，返回空数组
  return []
})

// 当前进程数据
const currentProcess = computed((): JavaProcess => {
  if (processDetails.value) {
    return processDetails.value
  }
  
  // 从进程列表中查找当前选中的进程
  const found = availableProcesses.value.find(p => p.pid === selectedPid.value)
  if (found) {
    return {
      id: found.pid.toString(),
      name: found.name,
      pid: found.pid,
      status: found.status,
      mainClass: found.mainClass,
      arguments: [],
      jvmVersion: '',
      javaVersion: '',
      javaHome: '',
      jvmFlags: '',
      startTime: new Date().toISOString(),
      uptime: 0,
      memoryUsage: {
        used: 0,
        max: 0,
        committed: 0,
        heapUsage: 0,
        nonHeapUsage: 0,
        percentage: 0
      },
      cpuUsage: 0,
      threadCount: 0
    } as JavaProcess
  }
  
  // 默认空进程数据
  return {
    id: selectedPid.value.toString(),
    name: '',
    pid: selectedPid.value,
    status: 'running',
    mainClass: '',
    arguments: [],
    jvmVersion: '',
    javaVersion: '',
    javaHome: '',
    jvmFlags: '',
    startTime: new Date().toISOString(),
    uptime: 0,
    memoryUsage: {
      used: 0,
      max: 0,
      committed: 0,
      heapUsage: 0,
      nonHeapUsage: 0,
      percentage: 0
    },
    cpuUsage: 0,
    threadCount: 0
  } as JavaProcess
})

// 格式化参数
function formatArguments(args: string[]): string {
  if (!args || args.length === 0) return ''
  return args.join(' ')
}

// 加载进程详细信息
async function loadProcessDetails(pid: number) {
  if (!pid) return
  
  isLoadingDetails.value = true
  errorMessage.value = ''
  
  try {
    const response = await processApi.getProcess(pid.toString())
    if (response.success) {
      processDetails.value = response.data
    } else {
      errorMessage.value = response.msg || '获取进程详情失败'
      console.error('获取进程详情失败:', response.msg)
    }
  } catch (error) {
    errorMessage.value = '获取进程详情失败'
    console.error('获取进程详情异常:', error)
  } finally {
    isLoadingDetails.value = false
  }
}

// 模拟JVM参数数据（从进程详情中提取或使用默认值）
function setMockJvmArguments() {
  isLoadingJvmArgs.value = true
  // 模拟加载延迟
  setTimeout(() => {
    // 暂时使用空数组，等待后端提供相应接口或在概述接口中包含这些信息
    jvmArguments.value = []
    isLoadingJvmArgs.value = false
  }, 500)
}

// 模拟系统属性数据（从进程详情中提取或使用默认值）
function setMockSystemProperties() {
  isLoadingSysProps.value = true
  // 模拟加载延迟
  setTimeout(() => {
    // 暂时使用空数组，等待后端提供相应接口或在概述接口中包含这些信息
    systemProperties.value = []
    isLoadingSysProps.value = false
  }, 500)
}

// 处理PID变化
async function handlePidChange() {
  console.log('切换到PID:', selectedPid.value)
  await loadProcessDetails(selectedPid.value)
  // 使用模拟数据替代不存在的API接口
  setMockJvmArguments()
  setMockSystemProperties()
}

// 刷新进程列表
async function refreshProcesses() {
  isRefreshing.value = true
  errorMessage.value = ''
  
  try {
    await processStore.fetchProcesses()
  } catch (error) {
    errorMessage.value = '刷新进程列表失败'
    console.error('刷新进程列表异常:', error)
  } finally {
    isRefreshing.value = false
  }
}

// 监听selectedPid变化
watch(selectedPid, (newPid) => {
  if (newPid) {
    handlePidChange()
  }
}, { immediate: false })

// 监听进程列表变化，自动选择第一个进程
watch(() => availableProcesses.value, (newProcesses) => {
  if (newProcesses.length > 0 && !selectedPid.value) {
    selectedPid.value = newProcesses[0].pid
  }
}, { immediate: true })

// 组件挂载时初始化
onMounted(async () => {
  await processStore.fetchProcesses()
  
  // 如果有可用进程，加载第一个进程的详细信息
  if (availableProcesses.value.length > 0) {
    selectedPid.value = availableProcesses.value[0].pid
    await handlePidChange()
  }
})
</script>
