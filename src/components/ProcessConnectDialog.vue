<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Activity class="h-5 w-5" />
          连接 Java 进程
        </DialogTitle>
        <DialogDescription>
          选择本地进程或连接到远程 JVM 进行监控
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="local">本地进程</TabsTrigger>
          <TabsTrigger value="remote">远程连接</TabsTrigger>
        </TabsList>

        <!-- 本地进程选项卡 -->
        <TabsContent value="local" class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">选择要监控的本地 Java 进程：</p>
            <Button 
              variant="outline" 
              size="sm" 
              @click="refreshLocalProcesses"
              :disabled="isLoadingLocal"
            >
              <RefreshCw :class="['h-4 w-4', { 'animate-spin': isLoadingLocal }]" />
              刷新
            </Button>
          </div>

          <div class="max-h-60 overflow-y-auto space-y-2">
            <div v-if="isLoadingLocal" class="flex items-center justify-center py-8">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                正在加载进程列表...
              </div>
            </div>

            <div v-else-if="localProcesses.length === 0" class="flex items-center justify-center py-8">
              <p class="text-sm text-muted-foreground">未找到 Java 进程</p>
            </div>

            <div
              v-else
              v-for="process in localProcesses"
              :key="process.id"
              :class="[
                'p-3 rounded-lg border cursor-pointer transition-colors',
                selectedLocalProcess?.id === process.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-accent'
              ]"
              @click="selectLocalProcess(process)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="text-sm font-medium">{{ process.name }}</h4>
                  <p class="text-xs text-muted-foreground">PID: {{ process.pid }}</p>
                  <p class="text-xs text-muted-foreground">{{ process.mainClass }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <Badge 
                    :variant="true ? 'default' : 'secondary'"
                    class="text-xs"
                  >
                    {{ true ? '运行中' : '已停止' }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- 远程连接选项卡 -->
        <TabsContent value="remote" class="space-y-4">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="host">主机地址 *</Label>
                <Input
                  id="host"
                  v-model="remoteForm.host"
                  placeholder="192.168.1.100"
                  :disabled="isConnecting"
                />
              </div>
              <div class="space-y-2">
                <Label for="port">端口 *</Label>
                <Input
                  id="port"
                  v-model="remoteForm.port"
                  type="number"
                  placeholder="9010"
                  :disabled="isConnecting"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="username">用户名</Label>
                <Input
                  id="username"
                  v-model="remoteForm.username"
                  placeholder="可选"
                  :disabled="isConnecting"
                />
              </div>
              <div class="space-y-2">
                <Label for="password">密码</Label>
                <Input
                  id="password"
                  v-model="remoteForm.password"
                  type="password"
                  placeholder="可选"
                  :disabled="isConnecting"
                />
              </div>
            </div>

            <Alert>
              <Info class="h-4 w-4" />
              <AlertTitle>远程JVM配置</AlertTitle>
              <AlertDescription>
                确保远程JVM已启用JMX并添加以下启动参数：<br/>
                <code class="text-xs bg-muted px-1 rounded">
                  -Dcom.sun.management.jmxremote<br/>
                  -Dcom.sun.management.jmxremote.port=9010<br/>
                  -Dcom.sun.management.jmxremote.authenticate=false<br/>
                  -Dcom.sun.management.jmxremote.ssl=false
                </code>
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter class="flex justify-between">
        <div class="flex items-center space-x-2">
          <div v-if="connectionError" class="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle class="h-4 w-4" />
            {{ connectionError }}
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button variant="outline" @click="closeDialog">取消</Button>
          <Button 
            @click="connect"
            :disabled="!canConnect || isConnecting"
          >
            <div v-if="isConnecting" class="flex items-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
              连接中...
            </div>
            <div v-else class="flex items-center gap-2">
              <Plug class="h-4 w-4" />
              连接
            </div>
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { processApi } from '@/api'
import type { JavaProcess } from '@/types'
import { useProcessStore } from '@/stores/process'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  RefreshCw,
  Info,
  AlertCircle,
  Plug
} from 'lucide-vue-next'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'process-connected', process: JavaProcess): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const processStore = useProcessStore()
const activeTab = ref<'local' | 'remote'>('local')
const isLoadingLocal = ref(false)
const isConnecting = ref(false)
const connectionError = ref<string>('')

// 本地进程相关
const localProcesses = ref<JavaProcess[]>([])
const selectedLocalProcess = ref<JavaProcess | null>(null)

// 远程连接表单
const remoteForm = ref({
  host: '',
  port: '',
  username: '',
  password: ''
})

// 计算属性
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const canConnect = computed(() => {
  if (activeTab.value === 'local') {
    return !!selectedLocalProcess.value
  } else {
    return !!(remoteForm.value.host && remoteForm.value.port)
  }
})

// 方法
async function refreshLocalProcesses() {
  isLoadingLocal.value = true
  connectionError.value = ''
  
  try {
    const response = await processApi.getProcesses()
    if (response.success) {
      localProcesses.value = response.data || []
    } else {
      connectionError.value = response.msg || '获取进程列表失败'
    }
  } catch (error) {
    console.error('获取本地进程失败:', error)
    connectionError.value = '获取进程列表失败'
    localProcesses.value = []
  } finally {
    isLoadingLocal.value = false
  }
}

function selectLocalProcess(process: JavaProcess) {
  selectedLocalProcess.value = process
  connectionError.value = ''
}

async function connect() {
  if (!canConnect.value || isConnecting.value) return

  isConnecting.value = true
  connectionError.value = ''

  try {
    if (activeTab.value === 'local' && selectedLocalProcess.value) {
      // 连接本地进程 - 启动监控
      const response = await processApi.startProcess({
        pid: selectedLocalProcess.value.id,
        host: undefined,
        port: undefined
      } as any)

      if (response.success) {
        emit('process-connected', selectedLocalProcess.value)
        closeDialog()
      } else {
        connectionError.value = response.msg || '连接进程失败'
      }
    } else if (activeTab.value === 'remote') {
      // 连接远程进程
      const host = remoteForm.value.host.trim()
      const port = parseInt(remoteForm.value.port)
      const username = remoteForm.value.username.trim() || undefined
      const password = remoteForm.value.password.trim() || undefined

      if (!host || !port || isNaN(port)) {
        connectionError.value = '请填写有效的主机地址和端口'
        return
      }

      const response = await processApi.getRemoteProcess(host, port, username, password)
      
      if (response.success) {
        // 启动远程监控
        const startResponse = await processApi.startProcess({
          pid: response.data.id,
          host: host,
          port: port
        } as any)

        if (startResponse.success) {
          emit('process-connected', response.data)
          closeDialog()
        } else {
          connectionError.value = startResponse.msg || '启动远程监控失败'
        }
      } else {
        connectionError.value = response.msg || '连接远程JVM失败'
      }
    }
  } catch (error) {
    console.error('连接失败:', error)
    connectionError.value = '连接失败，请检查网络和配置'
  } finally {
    isConnecting.value = false
  }
}

function closeDialog() {
  isOpen.value = false
  // 重置状态
  setTimeout(() => {
    selectedLocalProcess.value = null
    connectionError.value = ''
    remoteForm.value = {
      host: '',
      port: '',
      username: '',
      password: ''
    }
  }, 200)
}

// 监听对话框打开状态
watch(isOpen, (newValue) => {
  if (newValue) {
    refreshLocalProcesses()
  }
})

// 组件挂载时获取进程列表
onMounted(() => {
  if (props.open) {
    refreshLocalProcesses()
  }
})
</script>
