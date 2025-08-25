import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JavaProcess, ProcessStartParams } from '@/types'
import { processApi } from '@/api'

export const useProcessStore = defineStore('process', () => {
  // 状态
  const processes = ref<JavaProcess[]>([])
  const currentProcess = ref<JavaProcess | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const runningProcesses = computed(() => 
    processes.value.filter(p => p.status === 'running')
  )
  
  const stoppedProcesses = computed(() => 
    processes.value.filter(p => p.status === 'stopped')
  )
  
  const totalProcesses = computed(() => processes.value.length)
  
  const totalMemoryUsage = computed(() => 
    processes.value.reduce((sum, p) => sum + p.memoryUsage.used, 0)
  )
  
  const totalCpuUsage = computed(() => 
    processes.value.reduce((sum, p) => sum + p.cpuUsage, 0)
  )

  // 动作
  async function fetchProcesses() {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.getProcesses()
      if (response.success) {
        processes.value = response.data
      } else {
        error.value = response.message || '获取进程列表失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取进程列表失败'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProcess(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.getProcess(id)
      if (response.success) {
        currentProcess.value = response.data
      } else {
        error.value = response.message || '获取进程详情失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取进程详情失败'
    } finally {
      isLoading.value = false
    }
  }

  async function startProcess(params: ProcessStartParams) {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.startProcess(params)
      if (response.success) {
        // 添加到进程列表
        processes.value.push(response.data)
        return response.data
      } else {
        error.value = response.message || '启动进程失败'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '启动进程失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function stopProcess(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.stopProcess(id)
      if (response.success) {
        // 更新进程状态
        const process = processes.value.find(p => p.id === id)
        if (process) {
          process.status = 'stopped'
        }
        if (currentProcess.value?.id === id) {
          currentProcess.value.status = 'stopped'
        }
      } else {
        error.value = response.message || '停止进程失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '停止进程失败'
    } finally {
      isLoading.value = false
    }
  }

  async function restartProcess(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.restartProcess(id)
      if (response.success) {
        // 更新进程信息
        const index = processes.value.findIndex(p => p.id === id)
        if (index !== -1) {
          processes.value[index] = response.data
        }
        if (currentProcess.value?.id === id) {
          currentProcess.value = response.data
        }
        return response.data
      } else {
        error.value = response.message || '重启进程失败'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重启进程失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setCurrentProcess(process: JavaProcess | null) {
    currentProcess.value = process
  }

  return {
    // 状态
    processes,
    currentProcess,
    isLoading,
    error,
    
    // 计算属性
    runningProcesses,
    stoppedProcesses,
    totalProcesses,
    totalMemoryUsage,
    totalCpuUsage,
    
    // 动作
    fetchProcesses,
    fetchProcess,
    startProcess,
    stopProcess,
    restartProcess,
    clearError,
    setCurrentProcess,
  }
})
