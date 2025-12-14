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
            placeholder="文件路径（可输入准确路径）"
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
        <Button @click="analyData" :disabled="isLoading || !filePath">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          分析
        </Button>
        <Button variant="outline" @click="exportReport" :disabled="!filePath">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          导出
        </Button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">类加载器总数</p>
          <p class="text-2xl font-bold text-blue-600">{{ classLoaders.length }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">总保留内存</p>
          <p class="text-2xl font-bold text-green-600">{{ formatBytes(totalRetainedBytes) }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6 text-center">
          <p class="text-sm text-muted-foreground">平均保留内存</p>
          <p class="text-2xl font-bold text-orange-600">{{ formatBytes(averageRetainedBytes) }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 类加载器列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>类加载器泄漏分析</CardTitle>
          <div class="flex items-center space-x-2">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="搜索类加载器名称..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="filteredClassLoaders.length === 0" class="text-center py-8 text-muted-foreground">
          {{ classLoaders.length === 0 ? '暂无分析数据，请先选择文件并进行分析' : '没有找到匹配的类加载器' }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="classLoader in filteredClassLoaders"
            :key="classLoader.classLoaderId"
            class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Badge variant="outline" class="font-mono">
                    ID: {{ classLoader.classLoaderId }}
                  </Badge>
                  <Badge variant="secondary">
                    {{ formatBytes(classLoader.retainedBytes) }}
                  </Badge>
                </div>
                <p class="text-sm font-medium text-foreground break-all">
                  {{ classLoader.classLoaderName }}
                </p>
              </div>
            </div>
            
            <!-- GC Root 路径 -->
            <div v-if="classLoader.shortestGcRootPath && classLoader.shortestGcRootPath.length > 0" class="mt-3">
              <p class="text-xs text-muted-foreground mb-2 font-medium">GC Root 路径:</p>
              <div class="space-y-2 pl-4 border-l-2 border-muted">
                <div
                  v-for="(pathItem, index) in classLoader.shortestGcRootPath"
                  :key="index"
                  class="flex items-center gap-2 text-sm"
                >
                  <span class="text-muted-foreground">→</span>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-mono text-xs text-muted-foreground">
                        0x{{ pathItem.objectAddress.toString(16) }}
                      </span>
                      <Badge variant="outline" class="text-xs">
                        {{ pathItem.humanShallow }}
                      </Badge>
                    </div>
                    <p class="text-xs text-foreground mt-1 break-all">
                      {{ pathItem.displayName }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '@/components/ui'
import { memoryApi } from '@/api'
import { useProcessStore } from '@/stores/process';

// 定义数据类型
interface GcRootPathItem {
  objectAddress: number
  displayName: string
  shallowBytes: number
  humanShallow: string
}

interface ClassLoader {
  classLoaderId: number
  classLoaderName: string
  retainedBytes: number
  shortestGcRootPath: GcRootPathItem[]
}

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const filePath = ref<string>('')

const classLoaders = ref<ClassLoader[]>([])
const processStore = useProcessStore()

// 自动刷新定时器
let autoRefreshTimer: number | null = null
const isAutoRefresh = ref(false)

// 计算属性
const filteredClassLoaders = computed(() => {
  let filtered = classLoaders.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(classLoader => 
      classLoader.classLoaderName.toLowerCase().includes(query) ||
      classLoader.classLoaderId.toString().includes(query)
    )
  }

  return filtered
})

const totalRetainedBytes = computed(() => {
  return classLoaders.value.reduce((sum, cl) => sum + cl.retainedBytes, 0)
})

const averageRetainedBytes = computed(() => {
  if (classLoaders.value.length === 0) return 0
  return totalRetainedBytes.value / classLoaders.value.length
})

// 格式化字节数
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 方法
function triggerFileSelect() {
  // 检查是否在 Electron 环境中
  if ((window as any).electron && (window as any).electron.openFileDialog) {
    // 使用 Electron 文件对话框
    const electron = (window as any).electron
    
    // 清理之前的监听器
    if (fileSelectCleanup) {
      fileSelectCleanup()
    }
    
    // 设置文件选择监听器
    fileSelectCleanup = electron.onFileSelected((selectedPath: string | null) => {
      if (selectedPath) {
        filePath.value = selectedPath
        // 创建一个类似 File 的对象用于显示
        selectedFile.value = {
          name: selectedPath.split(/[/\\]/).pop() || selectedPath
        } as File
        
        // 清理监听器
        if (fileSelectCleanup) {
          fileSelectCleanup()
          fileSelectCleanup = null
        }
      }
    })
    
    // 打开文件对话框
    electron.openFileDialog()
  } else {
    // 回退到 HTML5 文件选择
    fileInputRef.value?.click()
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    
    // 尝试获取文件的真实路径
    let path = ''
    
    // 在 Electron 环境中，尝试使用 Electron API 获取真实路径
    if ((window as any).electron && (window as any).electron.getFilePath) {
      try {
        // 如果 Electron 提供了获取文件路径的 API
        path = await (window as any).electron.getFilePath(file)
      } catch (error) {
        console.warn('无法通过 Electron API 获取文件路径:', error)
      }
    }
    
    // 如果 Electron API 不可用，尝试从 input.value 获取
    if (!path && target.value) {
      // 在 Windows 上，路径可能包含 C:\fakepath\ 前缀（浏览器安全机制）
      // 在 Linux/Mac 上，可能直接是路径或文件名
      path = target.value
      
      // 移除浏览器添加的假路径前缀
      if (path.startsWith('C:\\fakepath\\')) {
        path = path.replace('C:\\fakepath\\', '')
      }
      
      // 如果路径不包含目录分隔符，说明只获取到了文件名
      if (!path.includes('\\') && !path.includes('/')) {
        path = file.name
      }
    }
    
    // 尝试使用 webkitRelativePath（如果文件是通过目录选择器选择的）
    if (!path && file.webkitRelativePath) {
      path = file.webkitRelativePath
    }
    
    // 如果以上方法都失败，使用文件名
    if (!path) {
      path = file.name
    }
    
    filePath.value = path
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
    stopAutoRefresh()
    return
  }

  isLoading.value = true
  try {
    const response = await memoryApi.getMemoryLeakAnalysis(`${filePath.value}`)
    
    // 处理分析结果
    if (response.data && Array.isArray(response.data)) {
      // 更新数据
      classLoaders.value = response.data
      // 如果自动刷新未启动，启动它
      if (!isAutoRefresh.value) {
        startAutoRefresh()
      }
    } else {
      console.warn('返回数据格式不正确:', response.data)
      classLoaders.value = []
    }
  } catch (error) {
    console.error('内存泄漏分析失败:', error)
    classLoaders.value = []
    stopAutoRefresh()
  } finally {
    isLoading.value = false
  }
}


async function analyData() {
  if (selectedFile.value || filePath.value) {
    await analyzeMemoryLeak()
  } else {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, processStore.refreshPeriod || 1000)
  }
}
function exportReport() {
  console.log('导出内存泄漏分析报告')
  // 截取目录路径作为output参数
  const dirPath = filePath.value
    ? filePath.value.substring(0, filePath.value.lastIndexOf('/'))
    : '';
  memoryApi.exportHeapDump({
    pid: processStore.currentProcess?.pid || '',
    output: dirPath
  }).then((response) => {
    if (response.areSuccess) {
      console.log('导出内存泄漏分析报告成功:', response.data)
    } else {
      console.error('导出内存泄漏分析报告失败:', response.msg)
    }
  }).catch((error) => {
    console.error('导出内存泄漏分析报告异常:', error)
  })
}

// 存储文件选择监听器的清理函数
let fileSelectCleanup: (() => void) | null = null

// 启动自动刷新
function startAutoRefresh() {
  if (!filePath.value || isAutoRefresh.value) return
  
  stopAutoRefresh()
  isAutoRefresh.value = true
  
  autoRefreshTimer = window.setInterval(() => {
    if (filePath.value) {
      analyzeMemoryLeak()
    }
  }, processStore.refreshPeriod || 5000)
}

// 停止自动刷新
function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
  isAutoRefresh.value = false
}

// 监听 refreshPeriod 变化，更新自动刷新间隔
watch(() => processStore.refreshPeriod, () => {
  if (isAutoRefresh.value && autoRefreshTimer) {
    stopAutoRefresh()
    startAutoRefresh()
  }
})

// 组件挂载时初始化
onMounted(() => {
  analyData()
  // 如果已有文件路径，启动自动刷新
  if (filePath.value) {
    startAutoRefresh()
  }
})

// 组件卸载时清理监听器
onUnmounted(() => {
  if (fileSelectCleanup) {
    fileSelectCleanup()
    fileSelectCleanup = null
  }
  stopAutoRefresh()
})
</script>

