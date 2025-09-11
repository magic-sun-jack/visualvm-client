<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>选择要监控的 Java 进程</DialogTitle>
        <DialogDescription>
          请从以下列表中选择需要监控的 Java 进程，或者输入远程进程的 IP 和端口。
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <Tabs v-model="activeTab" default-value="local" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="local">本地进程</TabsTrigger>
            <TabsTrigger value="remote">远程进程</TabsTrigger>
          </TabsList>
          <TabsContent value="local" class="space-y-4">
            <div v-if="loading" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <div v-else-if="processes.length === 0" class="text-center py-8 text-gray-500">
              未找到正在运行的 Java 进程
            </div>
            <div v-else class="space-y-2 max-h-[400px] overflow-y-auto">
              <RadioGroup v-model="selectedProcess">
                <div v-for="process in processes" :key="process.pid" class="flex items-start space-x-4 p-4 rounded-lg border">
                  <RadioGroupItem :value="String(process.pid)" />
                  <div>
                    <div class="font-medium">PID: {{ process.pid }}</div>
                    <div class="text-sm text-gray-500">{{ process.mainClass }}</div>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <Button @click="refreshProcesses" class="w-full">
              刷新进程列表
            </Button>
          </TabsContent>
          <TabsContent value="remote" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>IP 地址</Label>
                <Input v-model="remoteHost" placeholder="例如: 192.168.1.100" />
              </div>
              <div class="space-y-2">
                <Label>端口</Label>
                <Input v-model="remotePort" placeholder="例如: 9010" type="number" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:isOpen', false)">
          取消
        </Button>
        <Button @click="handleConfirm" :disabled="!canConfirm">
          开始监控
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { processApi } from '@/api'
import type { JavaProcess } from '@/types'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'select': [process: { pid: string, host?: string, port?: number }]
}>()

const loading = ref(false)
const processes = ref<Array<JavaProcess>>([])
const selectedProcess = ref<string>('')
const remoteHost = ref('')
const remotePort = ref<number>()
const activeTab = ref('local')

const canConfirm = computed(() => {
  if (activeTab.value === 'local') {
    return !!selectedProcess.value
  } else {
    return !!remoteHost.value && !!remotePort.value
  }
})

async function refreshProcesses() {
  loading.value = true
  try {
    const response = await processApi.getProcesses()
    if (response.success) {
      processes.value = response.data
    } else {
      console.error('获取进程列表失败:', response.message)
    }
  } catch (error) {
    console.error('获取进程列表失败:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

function handleConfirm() {
  if (activeTab.value === 'local') {
    emit('select', { pid: selectedProcess.value })
  } else {
    emit('select', {
      pid: 'remote',
      host: remoteHost.value,
      port: remotePort.value
    })
  }
  emit('update:isOpen', false)
}

// 初始加载进程列表
refreshProcesses()
</script>
