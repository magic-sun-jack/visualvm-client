import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import type { JavaProcessListDetail, JavaProcessDetail, RemoteProcess } from '@/types'
import { processApi, remoteApi } from '@/api'
import { ReconnectingWebSocketClient } from '@/lib/ws'

interface Process extends JavaProcessListDetail {
  status: 'running' | 'stopped'
  isRemote?: boolean
}

interface ProcessDetail extends JavaProcessDetail {
  status: 'running' | 'stopped'
}

export const useProcessStore = defineStore('process', () => {
  // 状态
  const processes = ref<Process[]>([])
  const remoteProcesses = ref<RemoteProcess[]>([])
  const currentProcess = ref<ProcessDetail>()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isLive = ref(false)
  const isRemoteConnection = ref(false)
  const selectedScenarios = ref<string[]>(['common'])
  const refreshPeriod = ref<number>(5000)
  const filterType = ref<'include' | 'exclude'>('include')
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
          status: 'stopped',
          isRemote: false
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

  async function getAllProcesses() {
    try {
      isLoading.value = true
      error.value = null
      // 获取本地进程
      await getFilteredProcesses()
      // 获取远程进程
      await getRemoteProcesses()
      // 将远程进程转换为 Process 格式并合并到进程列表
      const remoteProcessList: Process[] = remoteProcesses.value.map(remote => ({
        pid: remote.id,
        displayName: `${remote.ip}:${remote.port}`,
        javaHome: '',
        mainArgs: '',
        mainClass: '远程进程',
        jvmArgs: '',
        ip: remote.ip,
        command: '',
        startTime: '',
        status: 'stopped',
        isRemote: true
      }))
      
      // 使用 Map 去重，避免重复添加相同的进程（基于 pid）
      const processMap = new Map<string, Process>()
      
      // 先添加本地进程
      processes.value.forEach(process => {
        processMap.set(process.pid, process)
      })
      
      // 再添加远程进程（如果已存在则覆盖）
      remoteProcessList.forEach(process => {
        processMap.set(process.pid, process)
      })
      
      // 更新进程列表
      processes.value = Array.from(processMap.values())
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
      // 设置远程连接状态为 false
      setRemoteConnection(false)
      const response = await processApi.getProcessLocalOverview(id)
      if (response.areSuccess) {
        const processDetail: ProcessDetail = {
          ...response.data,
          status: 'running'
        }
        currentProcess.value = processDetail
        setCurrentProcess(processDetail)
      } else {
        error.value = response.message || '获取进程详情失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取进程详情失败'
    } finally {
      isLoading.value = false
    }
  }

  async function getRemoteProcesses() {
    try {
      isLoading.value = true
      error.value = null
      const response = await processApi.getRemoteProcess()
      if (response.areSuccess) {
        remoteProcesses.value = response.data || []
      } else {
        error.value = response.message || '获取远程进程列表失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取远程进程列表失败'
    } finally {
      isLoading.value = false
    }
  }

  async function getRemoteOverview(id: string) {
    try {
      isLoading.value = true
      error.value = null
      // 设置远程连接状态为 true
      setRemoteConnection(true)
      const response = await remoteApi.getRemoteOverview(id)
      if (response.areSuccess) {
        const processDetail: ProcessDetail = {
          ...response.data,
          status: 'running'
        }
        currentProcess.value = processDetail
        setCurrentProcess(processDetail)
      } else {
        error.value = response.message || '获取远程进程详情失败'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取远程进程详情失败'
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
    // 根据进程列表中的 isRemote 属性设置远程连接状态
    const processInfo = processes.value.find(p => p.pid === process.pid)
    if (processInfo) {
      setRemoteConnection(processInfo.isRemote || false)
    }
  }

  function setRemoteConnection(isRemote: boolean) {
    isRemoteConnection.value = isRemote
  }

  function setSelectedScenarios(scenarios: string[]) {
    selectedScenarios.value = scenarios
  }

  function setRefreshPeriod(period: number) {
    refreshPeriod.value = period
  }

  function setFilterType(type: 'include' | 'exclude') {
    filterType.value = type
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
    remoteProcesses,
    currentProcess,
    isLoading,
    error,
    isLive,
    isRemoteConnection,
    selectedScenarios,
    refreshPeriod,
    filterType,
    
    // 计算属性
    runningProcesses,
    stoppedProcesses,
    totalProcesses,
    
    // 动作
    getFilteredProcesses,
    getAllProcesses,
    getLocalOverview,
    getRemoteProcesses,
    getRemoteOverview,
    startProcess,
    stopProcess,
    restartProcess,
    clearError,
    setCurrentProcess,
    setRemoteConnection,
    setSelectedScenarios,
    setRefreshPeriod,
    setFilterType,
    stopLiveUpdates,
  }
})
