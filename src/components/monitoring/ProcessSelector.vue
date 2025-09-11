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
        <Tabs :tabs="[
          { value: 'local', label: '本地进程' },
          { value: 'remote', label: '远程进程' }
        ]" v-model:activeTab="activeTab">
          <template #default="{ activeTab }">
            <div v-if="activeTab === 'local'" class="space-y-4">
              <div v-if="loading" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
              <div v-else-if="processes.length === 0" class="text-center py-8 text-gray-500">
                未找到正在运行的 Java 进程
              </div>
              <div v-else class="space-y-2 max-h-[400px] overflow-y-auto">
                <RadioGroup 
                  v-model="selectedProcess"
                  :options="processes.map(p => ({
                    value: String(p.pid),
                    label: `PID: ${p.pid} - ${p.mainClass}`
                  }))"
                  name="process-selector"
                />
              </div>
              <Button @click="refreshProcesses" class="w-full">
                刷新进程列表
              </Button>
            </div>
            <div v-else-if="activeTab === 'remote'" class="space-y-4">
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
            </div>
          </template>
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'
import { Tabs } from '@/components/ui'
import { RadioGroup } from '@/components/ui'
import { Label } from '@/components/ui'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
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
