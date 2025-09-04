<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">场景监控</h1>
      <p class="text-muted-foreground">针对不同场景进行性能监控，支持数据库、IO、HTTP等场景的实时监控和增量数据更新</p>
    </div>
    
    <div class="mb-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">选择进程</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            v-model="selectedProcessId" 
            :options="processOptions"
            placeholder="请选择要监控的Java进程"
            class="w-full max-w-md"
            @update:modelValue="handleProcessChange"
          />
        </CardContent>
      </Card>
    </div>
    
    <ScenarioMonitoringComponent 
      v-if="selectedProcessId"
      :selected-process="selectedProcessId"
    />
    
    <div v-else class="text-center py-12">
      <div class="text-muted-foreground">
        <svg class="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p>请选择一个Java进程开始监控</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, Select } from '@/components/ui'
import ScenarioMonitoringComponent from '@/components/monitoring/ScenarioMonitoring.vue'
import { processApi } from '@/api'
import type { JavaProcess } from '@/types'

const processes = ref<JavaProcess[]>([])
const selectedProcessId = ref<string>('')

const processOptions = computed(() => 
  processes.value.map(process => ({
    value: process.id,
    label: `${process.name} (PID: ${process.pid})`
  }))
)

async function loadProcesses() {
  try {
    const response = await processApi.getProcesses()
    if (response.success) {
      processes.value = response.data.filter(p => p.status === 'running')
    }
  } catch (error) {
    console.error('Failed to load processes:', error)
  }
}

function handleProcessChange(value: string | number) {
  const processId = String(value)
  console.log('Selected process:', processId)
}

onMounted(() => {
  loadProcesses()
})
</script>