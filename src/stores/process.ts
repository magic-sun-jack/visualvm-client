import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import type { JavaProcessInfo, JavaProcessListDetail, JavaProcessDetail } from '@/types'
import { processApi } from '@/api'
import { ReconnectingWebSocketClient } from '@/lib/ws'

interface Process extends JavaProcessListDetail {
  status: 'running' | 'stopped'
}

interface ProcessDetail extends JavaProcessDetail {
  status: 'running' | 'stopped'
}

export const useProcessStore = defineStore('process', () => {
  // 状态
  const processes = ref<Process[]>([])
  const currentProcess = ref<ProcessDetail>()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isLive = ref(false)
  let wsClient: ReconnectingWebSocketClient | null = null

  // 计算属性
  const runningProcesses = computed(() => 
    processes.value.filter(p => p.status === 'running')
  )
  
  const stoppedProcesses = computed(() => 
    processes.value.filter(p => p.status === 'stopped')
  )
  
  const totalProcesses = computed(() => processes.value.length)

  // 动作
  async function getFilteredProcesses() {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.getProcesses()
      if (response.areSuccess) {
        processes.value = response.data?.filter(data => data?.displayName != 'monitor-0.0.1-SNAPSHOT.jar')?.map(process => ({
          ...process,
          status: 'stopped'
        })) || []
        if (!currentProcess.value) {
          getLocalOverview(processes.value[0].pid)
        } else {
          getLocalOverview(currentProcess.value?.pid || '')
        }
      } else {
        error.value = response.message || '获取进程列表失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取进程列表失败'
    } finally {
      isLoading.value = false
    }
  }

  async function getLocalOverview(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.getProcessLocalOverview(id)
      if (response.areSuccess) {
        currentProcess.value = {
          ...response.data,
          status: 'running'
        }
      } else {
        error.value = response.message || '获取进程详情失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取进程详情失败'
    } finally {
      isLoading.value = false
    }
  }

  async function startProcess(params: { pid: string }) {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.startProcess(params)
      if (response.success) {
        // 添加到进程列表
        // processes.value.push(response.data)
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
        const process = processes.value.find(p => p.pid === id)
        if (process) {
          process.status = 'stopped'
        }
        if (currentProcess.value?.pid === id) {
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
    return startProcess({ pid: id })
  }

  function clearError() {
    error.value = null
  }

  function setCurrentProcess(process: ProcessDetail) {
    currentProcess.value = process
  }

  function stopLiveUpdates() {
    wsClient?.close()
    wsClient = null
    isLive.value = false
  }

  function getWebSocketUrl(path: string): string {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = location.host
    return `${protocol}//${host}${path}`
  }

  onUnmounted(() => {
    stopLiveUpdates()
  })

  return {
    // 状态
    processes,
    currentProcess,
    isLoading,
    error,
    isLive,
    
    // 计算属性
    runningProcesses,
    stoppedProcesses,
    totalProcesses,
    
    // 动作
    getFilteredProcesses,
    getLocalOverview,
    startProcess,
    stopProcess,
    restartProcess,
    clearError,
    setCurrentProcess,
    stopLiveUpdates,
  }
})
