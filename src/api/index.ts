import axios from 'axios'
import type { 
  JavaProcessInfo, 
  DatabaseCall, 
  RMICall, 
  MemoryLeakResult, 
  ThreadInfo,
  SystemOverview,
  PaginationParams,
  PaginatedResult,
  ApiResponse,
  JavaProcessDetail,
  JavaProcessListDetail,
  CpuStream
} from '@/types'
import { env, mockDelay, debugLog, errorLog } from '@/config/env'
import { mockDataGenerator, mockDataCache } from './mockData'

// 计算基础地址：在 Electron 或 file:// 协议下，强制使用本地后端以避免 file:/// 请求
function resolveApiBaseUrl(): string {
  try {
    const hasExplicit = !!env.API_BASE_URL
    const explicit = (env.API_BASE_URL || '').toString()
    const isHttp = explicit.startsWith('http://') || explicit.startsWith('https://')
    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:'
    const isElectronUA = typeof window !== 'undefined' && window.navigator && window.navigator.userAgent.includes('Electron')
    if (isElectronUA || isFileProtocol) {
      return isHttp ? explicit : 'http://localhost:8099'
    }
    // 非 Electron：优先使用明确设置的值，否则走 Vite 代理
    return hasExplicit ? explicit : '/'
  } catch {
    return '/'
  }
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: env.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  responseType: 'json',
  transformResponse: [
    data => {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          /* Ignore */
        }
      }
      return {
        areSuccess: data.areSuccess,
        success: data.status === 0,
        code: data.status,
        msg: data.msg,
        data: data.data
      };
    }
  ],
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // Electron 环境且指向本地 8099 时，确保路径包含 /cvm 前缀
    try {
      const base = (config.baseURL || '').toString()
      const urlPath = (config.url || '').toString()
      const isTo8099 = base.includes('localhost:8099') || base.includes('127.0.0.1:8099')
      if (env.isElectron && isTo8099 && urlPath && !urlPath.startsWith('/cvm')) {
        config.url = `/cvm${urlPath.startsWith('/') ? '' : '/'}${urlPath}`
      }
    } catch {}

    debugLog('API请求:', config.method?.toUpperCase(), config.url, config.data)
    // 可以在这里添加认证token等
    return config
  },
  (error) => {
    errorLog('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    debugLog('API响应:', response.config.url, response.data)
    // 检查响应状态
    if (!response.data.success) {
      errorLog('业务错误:', response.data.msg)
      return Promise.reject(new Error(response.data.msg))
    }
    return response.data
  },
  (error) => {
    errorLog('API请求错误:', error)
    return Promise.reject(error)
  }
)

// Java进程相关API
export const processApi = {
  // 获取进程列表
  // async getProcesses(): Promise<ApiResponse<JavaProcessInfo[]>> {
  //   debugLog('getProcesses', env.USE_MOCK_DATA)
  //   if (env.USE_MOCK_DATA) {
  //     await mockDelay()
  //     const processes = mockDataCache.getProcesses()
  //     return mockDataGenerator.generateApiResponse(processes)
  //   }
  //   return api.get('/cvm/overview/getProcesses')
  // },

  // 获取过滤进程
  async getProcesses(): Promise<ApiResponse<JavaProcessListDetail[]>> {
    debugLog('getProcesses', env.USE_MOCK_DATA)
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const processes = mockDataCache.getProcesses()
      return mockDataGenerator.generateApiResponse(processes)
    }
    return api.get('/cvm/overview/getFilteredProcesses')
  },

  // 获取单个进程详情
  async getProcessLocalOverview(id: string): Promise<ApiResponse<JavaProcessDetail>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const process = mockDataCache.getProcessById(id)
      if (!process) {
        return mockDataGenerator.generateApiResponse(null as any, false, '进程不存在')
      }
      return mockDataGenerator.generateApiResponse(process)
    }
    return api.get(`/cvm/overview/getLocalOverview`, { params: { pid: id } })
  },

  // 获取远程进程概述信息
  /**
   * 注意⚠：远程jvm需要加上以下参数：
  -Dcom.sun.management.jmxremote
  -Dcom.sun.management.jmxremote.port=9010
  -Dcom.sun.management.jmxremote.authenticate=false
  -Dcom.sun.management.jmxremote.ssl=false
   */
  async getRemoteProcess(host: string, port: number, username?: string, password?: string, authenticate?: boolean, ssl?: boolean): Promise<ApiResponse<JavaProcessDetail>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(1200) // 远程连接需要更长时间
      const process = mockDataGenerator.generateJavaProcess()
      process.host = host
      process.port = port
      process.name = `远程进程@${host}:${port}`
      return mockDataGenerator.generateApiResponse(process)
    }
    
    const params: any = { host, port }
    if (username) params.username = username
    if (password) params.password = password
    
    return api.get(`/cvm/overview/getRemoteOverview`, { params })
  },

  // 获取pid进程监视信息
  async startProcess(params: { pid: string }): Promise<ApiResponse<JavaProcessInfo>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(1000) // 启动操作需要更长时间
      const newProcess = mockDataGenerator.generateJavaProcess()
      mockDataCache.processes.push(newProcess)
      return mockDataGenerator.generateApiResponse(newProcess, true, '进程启动成功')
    }
    // 与Postman集合对齐：启动监控 GET /monitor/start?pid=...
    return api.get('/cvm/monitor/start', { params: { pid: params.pid } })
  },

  // 停止进程
  async stopProcess(id: string): Promise<ApiResponse<void>> {
    return {
      success: false,
      code: 404,
      msg: '接口不存在',
      data: undefined
    }
    // if (env.USE_MOCK_DATA) {
    //   await mockDelay(800)
    //   const process = mockDataCache.getProcessById(id)
    //   if (process) {
    //     process.status = 'stopped'
    //   }
    //   return mockDataGenerator.generateApiResponse(undefined as any, true, '进程已停止')
    // }
    // return api.post(`/cvm/processes/${id}/stop`)
  },

  // 重启进程
  async restartProcess(id: string): Promise<ApiResponse<JavaProcessInfo>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(1200)
      const process = mockDataCache.getProcessById(id)
      if (!process) {
        return mockDataGenerator.generateApiResponse(null as any, false, '进程不存在')
      }
      process.status = 'running'
      process.startTime = new Date().toISOString()
      process.uptime = 0
      return mockDataGenerator.generateApiResponse(process, true, '进程重启成功')
    }
    return api.post(`/cvm/processes/${id}/restart`)
  },

  // 获取进程线程信息
  async getProcessThreads(id: string): Promise<ApiResponse<ThreadInfo[]>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const threads = mockDataCache.getThreads().slice(0, 20) // 返回前20个线程
      return mockDataGenerator.generateApiResponse(threads)
    }
    return api.get(`/cvm/thread/monitorThreads`, { params: { pid: id } })
  },

  // 获取进程内存使用情况
  async getProcessMemory(id: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const process = mockDataCache.getProcessById(id)
      if (!process) {
        return mockDataGenerator.generateApiResponse(null, false, '进程不存在')
      }
      return mockDataGenerator.generateApiResponse(process.memoryUsage)
    }
    return api.get(`/cvm/processes/${id}/memory`)
  },

  // 获取进程CPU使用情况
  async getProcessCpu(id: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const process = mockDataCache.getProcessById(id)
      if (!process) {
        return mockDataGenerator.generateApiResponse(null, false, '进程不存在')
      }
      return mockDataGenerator.generateApiResponse({
        usage: process.cpuUsage,
        timestamp: new Date().toISOString()
      })
    }
    // 与Postman集合对齐：GET /cpu/stream?pid=...
    return api.get(`/cvm/cpu/stream`, { params: { pid: id } })
  },
}

// 数据库分析相关API
export const databaseApi = {
  // 获取数据库调用统计
  async getDatabaseStats(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const calls = mockDataCache.getDatabaseCalls()
      const stats = {
        totalCalls: calls.length,
        successCalls: calls.filter(c => c.status === 'success').length,
        errorCalls: calls.filter(c => c.status === 'error').length,
        timeoutCalls: calls.filter(c => c.status === 'timeout').length,
        avgExecutionTime: Math.round(calls.reduce((sum, c) => sum + c.executionTime, 0) / calls.length),
        maxExecutionTime: Math.max(...calls.map(c => c.executionTime)),
        minExecutionTime: Math.min(...calls.map(c => c.executionTime))
      }
      return mockDataGenerator.generateApiResponse(stats)
    }
    return api.get(`/cvm/database/${processId}/stats`)
  },

  // 获取慢查询列表
  async getSlowQueries(processId: string, params: PaginationParams): Promise<ApiResponse<PaginatedResult<DatabaseCall>>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const slowQueries = mockDataCache.getDatabaseCalls().filter(c => c.executionTime > 1000)
      const result = mockDataGenerator.generatePaginatedResult(
        () => mockDataGenerator.generateDatabaseCall(),
        params,
        slowQueries.length
      )
      return mockDataGenerator.generateApiResponse(result)
    }
    return api.get(`/cvm/database/${processId}/slow-queries`, { params })
  },

  // 获取数据库连接池状态
  async getConnectionPoolStatus(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const poolStatus = {
        activeConnections: Math.floor(Math.random() * 20) + 5,
        idleConnections: Math.floor(Math.random() * 10) + 2,
        maxConnections: 50,
        minConnections: 5,
        waitingRequests: Math.floor(Math.random() * 5),
        totalRequests: Math.floor(Math.random() * 1000) + 100,
        avgWaitTime: Math.floor(Math.random() * 100) + 10
      }
      return mockDataGenerator.generateApiResponse(poolStatus)
    }
    return api.get(`/cvm/database/${processId}/connection-pool`)
  }
}

// RMI分析相关API
export const rmiApi = {
  // 获取RMI调用统计
  async getRMIStats(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const calls = mockDataCache.getRMICalls()
      const stats = {
        totalCalls: calls.length,
        successCalls: calls.filter(c => c.status === 'success').length,
        errorCalls: calls.filter(c => c.status === 'error').length,
        timeoutCalls: calls.filter(c => c.status === 'timeout').length,
        avgExecutionTime: Math.round(calls.reduce((sum, c) => sum + c.executionTime, 0) / calls.length),
        maxExecutionTime: Math.max(...calls.map(c => c.executionTime)),
        minExecutionTime: Math.min(...calls.map(c => c.executionTime)),
        uniqueMethods: new Set(calls.map(c => c.methodName)).size,
        uniqueClasses: new Set(calls.map(c => c.className)).size
      }
      return mockDataGenerator.generateApiResponse(stats)
    }
    return api.get(`/cvm/rmi/${processId}/stats`)
  },

  // 获取RMI调用列表
  async getRMICalls(processId: string, params: PaginationParams): Promise<ApiResponse<PaginatedResult<RMICall>>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const result = mockDataGenerator.generatePaginatedResult(
        () => mockDataGenerator.generateRMICall(),
        params,
        mockDataCache.getRMICalls().length
      )
      return mockDataGenerator.generateApiResponse(result)
    }
    return api.get(`/cvm/rmi/${processId}/calls`, { params })
  }
}

// 内存泄漏分析相关API
export const memoryApi = {
  // 开始pid进程内存分析
  async getMemoryStats({
    pid,
    refresh = 5000,
    filterType = "include",
    filter = "jdbc",
  }: {
    pid: string; // 进程ID
    refresh: number; // 刷新频率，单位毫秒
    filterType: string; // 过滤类型，include或exclude
    filter: string; // 场景过滤	否
  }): Promise<ApiResponse<any>> {
    return api.post(
      `/cvm/memory/start?pid=${pid}&refresh=${refresh}&filter=${filter}&filterType=${filterType}`
    );
  },

  // 获取pid进程内存分析数据
  async getMemoryAnalysisData(
    processId: string
  ): Promise<ApiResponse<any>> {
    // totalClasses	类总数
    // totalInstances	实例总数
    // totalBytes	字节总数
    // bytesPercent	字节占比
    // className	类名
    // instances	实例数
    // bytes	字节数
    // instancePercent	实例占比
    return api.get('/cvm/memory/stream', { params: { pid: processId } })
  },

  // 停止pid进程内存分析
  async stopMemory(): Promise<ApiResponse<any>> {
    return api.post(`/cvm/memory/stop?pid=14758`)
  },

  // 导出指定pid进程的heapdump文件
  async exportHeapDump({pid, output}: {pid: string, output: string}): Promise<ApiResponse<any>> {
    return api.post(`/cvm/heapdump/generate?pid=${pid}&output=${output}`)
  },
  
  // 内存泄漏分析
  async getMemoryLeakAnalysis(filePath: string): Promise<ApiResponse<any>> {
    return api.get('/cvm/heapdump/analyse', { params: { filePath } })
  },
};

export const gcApi = {
  // 获取GC监控数据
  async getGCStats(pid: string): Promise<ApiResponse<any>> {
    return api.get('/cvm/gc/getGC', { params: { pid: pid }})
  }
  // gcCollectors	gc集合
  // name	gc名称
  // collectionCount	GC执行次数
  // collectionTime	GC总耗时（ms）
  // nonHeapMemoryUsage	堆内存使用情况（字节）
  // heapMemoryUsage	非堆内存使用情况（字节）
  // init	JVM 初始化分配的内存大小（字节）
  // used	当前使用的内存（字节）
  // committed	JVM 已承诺可用的内存（操作系统已保证可用）（字节）
  // max	可用的最大内存（-1 表示未定义）（字节）
};

// 线程分析相关API
export const threadApi = {
  // 获取pid线程列表
  async getThreadList(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/thread/monitorThreads`, { params: { pid } })
    // liveThreads	存活的线程数
    // daemonThreads	守护的线程数
    // peakThreads	峰值线程数
    // totalStartedThreads	启动的总线程数
    // stateDistributionPercent	线程状态占比
    // sampleMillis	采样间隔
    // cpuProcessor	可用的处理器数
    // threadName	线程名
    // threadState	线程状态
    // blockedCount	线程进入 BLOCKED 状态的总次数
    // waitedCount	线程处于 WAITING 或 TIMED_WAITING 状态的总次数
    // blockedTimeMs	线程进入 BLOCKED 状态的大致累积经过时间（以毫秒为单位）
    // waitedTimeMs	线程处于 WAITING 或 TIMED_WAITING 状态的大致累积经过时间（以毫秒为单位）
    // cpuTimeDeltaMs	cpu 时间增量
    // cpuPercent	cpu占比
    // daemon	是否是守护线程
  },

  // 获取pid线程分析Tree（死锁等信息）
  async getTheradTree(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/thread/getThreadTree`, { params: { pid } })
    // totalThreads	线程总数
    // deadlockedCount	死锁线程数
    // normalCount	正常线程数
    // deadlockedThreads	死锁线程列表
    // normalThreads	正常线程列表
    // threadName	线程名称
    // state	线程状态
    // waitingLock	正在等待的锁
    // ownedLocks	当前线程持有的锁
    // deadlocked	是否死锁
    // stackTrace	栈追踪
  },

  // 获取pid线程dump信息
  async getThreadDump(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/thread/dump`, { params: { pid: pid } })
  }
}

// 系统概览API
export const systemApi = {
  // 获取系统概览
  async getSystemOverview(): Promise<ApiResponse<SystemOverview>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const overview = mockDataCache.getSystemOverview()
      return mockDataGenerator.generateApiResponse(overview)
    }
    return api.get('/cvm/system/overview')
  },

  // 获取监控配置
  async getMonitoringConfig(): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const config = mockDataGenerator.generateMonitoringConfig()
      return mockDataGenerator.generateApiResponse(config)
    }
    return api.get('/cvm/system/config')
  },

  // 更新监控配置
  async updateMonitoringConfig(config: any): Promise<ApiResponse<void>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(800)
      return mockDataGenerator.generateApiResponse(undefined as any, true, '监控配置已更新')
    }
    return api.put('/system/config', config)
  }
}

// 场景监控API
export const scenarioApi = {
  // 获取数据库监控配置
  async getDatabaseMonitoringConfig(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const config = mockDataGenerator.generateDatabaseMonitoringConfig()
      return mockDataGenerator.generateApiResponse(config)
    }
    return api.get(`/cvm/scenario/database/${processId}/config`)
  },

  // 更新数据库监控配置
  async updateDatabaseMonitoringConfig(processId: string, config: any): Promise<ApiResponse<void>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(800)
      return mockDataGenerator.generateApiResponse(undefined as any, true, '数据库监控配置已更新')
    }
    return api.put(`/cvm/scenario/database/${processId}/config`, config)
  },

  // 获取数据库监控指标
  async getDatabaseMetrics(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const metrics = mockDataGenerator.generateDatabaseMetrics()
      return mockDataGenerator.generateApiResponse(metrics)
    }
    return api.get(`/cvm/scenario/database/${processId}/metrics`)
  },

  // 获取IO监控配置
  async getIOMonitoringConfig(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const config = mockDataGenerator.generateIOMonitoringConfig()
      return mockDataGenerator.generateApiResponse(config)
    }
    return api.get(`/cvm/scenario/io/${processId}/config`)
  },

  // 更新IO监控配置
  async updateIOMonitoringConfig(processId: string, config: any): Promise<ApiResponse<void>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(800)
      return mockDataGenerator.generateApiResponse(undefined as any, true, 'IO监控配置已更新')
    }
    return api.put(`/cvm/scenario/io/${processId}/config`, config)
  },

  // 获取IO监控指标
  async getIOMetrics(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const metrics = mockDataGenerator.generateIOMetrics()
      return mockDataGenerator.generateApiResponse(metrics)
    }
    return api.get(`/cvm/scenario/io/${processId}/metrics`)
  },

  // 获取HTTP监控配置
  async getHTTPMonitoringConfig(processId: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const config = mockDataGenerator.generateHTTPMonitoringConfig()
      return mockDataGenerator.generateApiResponse(config)
    }
    return api.get(`/cvm/scenario/http/${processId}/config`)
  },

  // 更新HTTP监控配置
  async updateHTTPMonitoringConfig(processId: string, config: any): Promise<ApiResponse<void>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(800)
      return mockDataGenerator.generateApiResponse(undefined as any, true, 'HTTP监控配置已更新')
    }
    return api.put(`/cvm/scenario/http/${processId}/config`, config)
  },

  // 获取实时监控数据流（增量更新）
  async getRealtimeMetrics(processId: string, scenario: string, lastTimestamp?: string): Promise<ApiResponse<any>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(200) // 实时数据响应更快
      
      // 生成增量数据点
      const newDataPoint = {
        timestamp: new Date().toISOString(),
        value: Math.round((Math.random() * 40 + 30) * 100) / 100,
        scenario,
        processId
      }
      
      return mockDataGenerator.generateApiResponse({
        dataPoint: newDataPoint,
        hasMore: true
      })
    }
    return api.get(`/cvm/scenario/${scenario}/${processId}/realtime`, {
      params: { lastTimestamp }
    })
  },

  // 启动场景监控
  async startScenarioMonitoring(processId: string, scenario: string): Promise<ApiResponse<void>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(1000)
      return mockDataGenerator.generateApiResponse(undefined as any, true, `${scenario}监控已启动`)
    }
    return api.post(`/cvm/scenario/${scenario}/${processId}/start`)
  },

  // 停止场景监控
  async stopScenarioMonitoring(processId: string, scenario: string): Promise<ApiResponse<void>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay(800)
      return mockDataGenerator.generateApiResponse(undefined as any, true, `${scenario}监控已停止`)
    }
    return api.post(`/cvm/scenario/${scenario}/${processId}/stop`)
  }
}

export const cpuApi = {
  async startCpuProfiling(pid: string, refreshPeriod: number = 1000): Promise<ApiResponse<void>> {
    return api.post(`/cvm/cpu/start?pid=${pid}&filterType=include&filter=jdbc,IO&refreshPeriod=${refreshPeriod}`)
  },

  async stopCpuProfiling(pid: string): Promise<ApiResponse<void>> {
    return api.post(`/cvm/cpu/stop?pid=${pid}`)
  },

  async getCpuProfileData(pid: string, refreshPeriod: number = 5000): Promise<ApiResponse<CpuStream>> {
    return api.get(`/cvm/cpu/stream`, { 
      params: { pid, refreshPeriod }, 
      headers: { 'Content-Type': 'text/event-stream;charset=UTF-8' },
      // responseType: 'text'
    })
  }
}

export const configApi = {
  // 获取场景配置
  async getScenarioConfig(): Promise<ApiResponse<any>> {
    return api.get('/cvm/config/getConfig')
  }
}

export default api
