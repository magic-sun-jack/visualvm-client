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
  CpuStream,
  GCStatsInfo,
  ThreadListData,
  ThreadListResponse
} from '@/types'
import { env, mockDelay, debugLog, errorLog } from '@/config/env'
import { mockDataGenerator, mockDataCache } from './mockData'
import { useProcessStore } from '@/stores/process'

// 计算基础地址：在 Electron 或 file:// 协议下，强制使用本地后端以避免 file:/// 请求
export function resolveApiBaseUrl(): string {
  try {
    const hasExplicit = !!env.API_BASE_URL
    const explicit = (env.API_BASE_URL || '').toString()
    const isHttp = explicit.startsWith('http://') || explicit.startsWith('https://')
    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:'
    const isElectronUA = typeof window !== 'undefined' && window.navigator && window.navigator.userAgent.includes('Electron')
    if (isElectronUA || isFileProtocol) {
      return isHttp ? explicit : 'http://localhost:8099'
    } else {
      return 'http://localhost:3300'
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

    // 远程连接时，在 /cvm 后添加 /remote，并将 pid 参数改为 id（排除 ProcessConnectDialog 中的接口）
    try {
      const urlPath = (config.url || '').toString()
      // 需要排除的接口（ProcessConnectDialog 中使用的接口）
      const excludedPaths = [
        '/cvm/remote/getRemote',
        '/cvm/overview/getFilteredProcesses',
        '/cvm/monitor/start',
        '/cvm/overview/getLocalOverview'
      ]
      
      // 检查是否是排除的接口
      const isExcluded = excludedPaths.some(path => urlPath.includes(path))
      
      // 如果是远程连接且不是排除的接口，且路径包含 /cvm
      if (!isExcluded && urlPath.includes('/cvm')) {
        try {
          const processStore = useProcessStore()
          if (processStore.isRemoteConnection) {
            // 将 /cvm 替换为 /cvm/remote
            let newUrl = urlPath.replace('/cvm', '/cvm/remote')
            
            // 将 query string 中的 pid 改为 id（如 ?pid=123 或 &pid=123）
            newUrl = newUrl.replace(/([?&])pid=/g, '$1id=')
            
            config.url = newUrl
            
            // 将 params 中的 pid 改为 id
            if (config.params && typeof config.params === 'object' && !(config.params instanceof URLSearchParams) && 'pid' in config.params) {
              const pidValue = config.params.pid
              delete config.params.pid
              config.params.id = pidValue
            }
            
            // 处理 URLSearchParams 的情况
            if (config.params instanceof URLSearchParams) {
              if (config.params.has('pid')) {
                const pidValue = config.params.get('pid')
                config.params.delete('pid')
                config.params.set('id', pidValue || '')
              }
            }
          }
        } catch (storeError) {
          // 如果 store 未初始化，忽略
        }
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
  //   return api.get('/cvm/overview/getProcesses')
  // },

  // 获取过滤进程
  async getProcesses(): Promise<ApiResponse<JavaProcessListDetail[]>> {
    return api.get('/cvm/overview/getFilteredProcesses')
  },

  // 获取单个进程详情
  async getProcessLocalOverview(id: string): Promise<ApiResponse<JavaProcessDetail>> {
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
    const params: any = { host, port }
    if (username) params.username = username
    if (password) params.password = password
    return api.get(`/cvm/remote/addRemote`, { params })
  },

  // 获取pid进程监视信息
  async startProcess(params: { pid: string }): Promise<ApiResponse<JavaProcessInfo>> {
    // 与Postman集合对齐：启动监控 GET /monitor/start?pid=...
    return api.get('/cvm/monitor/start', { params: { pid: params.pid } })
  },

  // 停止进程
  async stopProcess(id: string): Promise<ApiResponse<void>> {
    return {
      areSuccess: false,
      success: false,
      code: 404,
      msg: '接口不存在',
      data: undefined
    }
    // return api.post(`/cvm/processes/${id}/stop`)
  },

  // 重启进程
  async restartProcess(id: string): Promise<ApiResponse<JavaProcessInfo>> {
    return api.post(`/cvm/processes/${id}/restart`)
  },

  // 获取进程线程信息
  async getProcessThreads(id: string): Promise<ApiResponse<ThreadInfo[]>> {
    return api.get(`/cvm/thread/monitorThreads`, { params: { pid: id } })
  },

  // 获取进程内存使用情况
  async getProcessMemory(id: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/processes/${id}/memory`)
  },
}

// 数据库分析相关API
export const databaseApi = {
  // 获取数据库调用统计
  async getDatabaseStats(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/database/${pid}/stats`)
  },

  // 获取慢查询列表
  async getSlowQueries(pid: string, params: PaginationParams): Promise<ApiResponse<PaginatedResult<DatabaseCall>>> {
    return api.get(`/cvm/database/${pid}/slow-queries`, { params })
  },

  // 获取数据库连接池状态
  async getConnectionPoolStatus(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/database/${pid}/connection-pool`)
  }
}

// RMI分析相关API
export const rmiApi = {
  // 获取RMI调用统计
  async getRMIStats(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/rmi/${pid}/stats`)
  },

  // 获取RMI调用列表
  async getRMICalls(pid: string, params: PaginationParams): Promise<ApiResponse<PaginatedResult<RMICall>>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay()
      const result = mockDataGenerator.generatePaginatedResult(
        () => mockDataGenerator.generateRMICall(),
        params,
        mockDataCache.getRMICalls().length
      )
      return mockDataGenerator.generateApiResponse(result)
    }
    return api.get(`/cvm/rmi/${pid}/calls`, { params })
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
    pid: string
  ): Promise<ApiResponse<any>> {
    // totalClasses	类总数
    // totalInstances	实例总数
    // totalBytes	字节总数
    // bytesPercent	字节占比
    // className	类名
    // instances	实例数
    // bytes	字节数
    // instancePercent	实例占比
    return api.get('/cvm/memory/stream', { params: { pid: pid } })
  },

  // 停止pid进程内存分析
  async stopMemory(pid: string): Promise<ApiResponse<any>> {
    return api.post(`/cvm/memory/stop?pid=${pid}`)
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
  async getGCStats(pid: string): Promise<ApiResponse<GCStatsInfo>> {
    return api.get('/cvm/gc/getGC', { params: { pid: pid }})
  }
};

// 线程分析相关API
export const threadApi = {
  // 获取pid线程列表
  async getThreadList(pid: string): Promise<ThreadListResponse> {
    return api.get(`/cvm/thread/monitorThreads`, { params: { pid } })
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
  async getDatabaseMonitoringConfig(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/scenario/database/${pid}/config`)
  },

  // 更新数据库监控配置
  async updateDatabaseMonitoringConfig(pid: string, config: any): Promise<ApiResponse<void>> {
    return api.put(`/cvm/scenario/database/${pid}/config`, config)
  },

  // 获取数据库监控指标
  async getDatabaseMetrics(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/scenario/database/${pid}/metrics`)
  },

  // 获取IO监控配置
  async getIOMonitoringConfig(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/scenario/io/${pid}/config`)
  },

  // 更新IO监控配置
  async updateIOMonitoringConfig(pid: string, config: any): Promise<ApiResponse<void>> {
    return api.put(`/cvm/scenario/io/${pid}/config`, config)
  },

  // 获取IO监控指标
  async getIOMetrics(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/scenario/io/${pid}/metrics`)
  },

  // 获取HTTP监控配置
  async getHTTPMonitoringConfig(pid: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/scenario/http/${pid}/config`)
  },

  // 更新HTTP监控配置
  async updateHTTPMonitoringConfig(pid: string, config: any): Promise<ApiResponse<void>> {
    return api.put(`/cvm/scenario/http/${pid}/config`, config)
  },

  // 获取实时监控数据流（增量更新）
  async getRealtimeMetrics(pid: string, scenario: string, lastTimestamp?: string): Promise<ApiResponse<any>> {
    return api.get(`/cvm/scenario/${scenario}/${pid}/realtime`, {
      params: { lastTimestamp }
    })
  },

  // 启动场景监控
  async startScenarioMonitoring(pid: string, scenario: string): Promise<ApiResponse<void>> {
    return api.post(`/cvm/scenario/${scenario}/${pid}/start`)
  },

  // 停止场景监控
  async stopScenarioMonitoring(pid: string, scenario: string): Promise<ApiResponse<void>> {
    return api.post(`/cvm/scenario/${scenario}/${pid}/stop`)
  }
}

export const cpuApi = {
  async startCpuProfiling(pid: string, refreshPeriod: number = 1000): Promise<ApiResponse<void>> {
    return api.post(`/cvm/cpu/start?pid=${pid}&filterType=include&filter=jdbc,IO&refreshPeriod=${refreshPeriod}`)
  },

  async stopCpuProfiling(pid: string): Promise<ApiResponse<void>> {
    return api.post(`/cvm/cpu/stop?pid=${pid}`)
  },
}

export const configApi = {
  // 获取场景配置
  // ["common",
  // "IO",
  // "Socket"
  // "RPC",
  // "pool",
  // "ORM",
  // "jdbc",
  // "serialize",
  // "NoSql",
  // "RMI",
  // "HTTP"]
  async getScenarioConfig(): Promise<ApiResponse<string[]>> {
    // 接口现在直接返回字符串数组
    return api.get('/cvm/config/getConfig');
  }
}
export default api