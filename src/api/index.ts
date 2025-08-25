import axios from 'axios'
import type { 
  JavaProcess, 
  DatabaseCall, 
  RMICall, 
  MemoryLeakResult, 
  ThreadInfo,
  SystemOverview,
  ProcessStartParams,
  PaginationParams,
  PaginatedResult,
  ApiResponse
} from '@/types'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// Java进程相关API
export const processApi = {
  // 获取所有Java进程
  getProcesses(): Promise<ApiResponse<JavaProcess[]>> {
    return api.get('/processes')
  },

  // 获取单个进程详情
  getProcess(id: string): Promise<ApiResponse<JavaProcess>> {
    return api.get(`/processes/${id}`)
  },

  // 启动JAR进程
  startProcess(params: ProcessStartParams): Promise<ApiResponse<JavaProcess>> {
    return api.post('/processes/start', params)
  },

  // 停止进程
  stopProcess(id: string): Promise<ApiResponse<void>> {
    return api.post(`/processes/${id}/stop`)
  },

  // 重启进程
  restartProcess(id: string): Promise<ApiResponse<JavaProcess>> {
    return api.post(`/processes/${id}/restart`)
  },

  // 获取进程线程信息
  getProcessThreads(id: string): Promise<ApiResponse<ThreadInfo[]>> {
    return api.get(`/processes/${id}/threads`)
  },

  // 获取进程内存使用情况
  getProcessMemory(id: string): Promise<ApiResponse<any>> {
    return api.get(`/processes/${id}/memory`)
  },

  // 获取进程CPU使用情况
  getProcessCpu(id: string): Promise<ApiResponse<any>> {
    return api.get(`/processes/${id}/cpu`)
  }
}

// 数据库分析相关API
export const databaseApi = {
  // 获取数据库调用统计
  getDatabaseStats(processId: string): Promise<ApiResponse<any>> {
    return api.get(`/database/${processId}/stats`)
  },

  // 获取慢查询列表
  getSlowQueries(processId: string, params: PaginationParams): Promise<ApiResponse<PaginatedResult<DatabaseCall>>> {
    return api.get(`/database/${processId}/slow-queries`, { params })
  },

  // 获取数据库连接池状态
  getConnectionPoolStatus(processId: string): Promise<ApiResponse<any>> {
    return api.get(`/database/${processId}/connection-pool`)
  }
}

// RMI分析相关API
export const rmiApi = {
  // 获取RMI调用统计
  getRMIStats(processId: string): Promise<ApiResponse<any>> {
    return api.get(`/rmi/${processId}/stats`)
  },

  // 获取RMI调用列表
  getRMICalls(processId: string, params: PaginationParams): Promise<ApiResponse<PaginatedResult<RMICall>>> {
    return api.get(`/rmi/${processId}/calls`, { params })
  }
}

// 内存泄漏分析相关API
export const memoryApi = {
  // 获取内存泄漏检测结果
  getMemoryLeakResults(processId: string): Promise<ApiResponse<MemoryLeakResult[]>> {
    return api.get(`/memory/${processId}/leak-results`)
  },

  // 开始内存泄漏检测
  startMemoryLeakDetection(processId: string): Promise<ApiResponse<void>> {
    return api.post(`/memory/${processId}/start-detection`)
  },

  // 停止内存泄漏检测
  stopMemoryLeakDetection(processId: string): Promise<ApiResponse<void>> {
    return api.post(`/memory/${processId}/stop-detection`)
  },

  // 获取堆转储
  getHeapDump(processId: string): Promise<ApiResponse<string>> {
    return api.get(`/memory/${processId}/heap-dump`)
  }
}

// 线程分析相关API
export const threadApi = {
  // 获取线程统计信息
  getThreadStats(processId: string): Promise<ApiResponse<any>> {
    return api.get(`/threads/${processId}/stats`)
  },

  // 获取死锁检测结果
  getDeadlockDetection(processId: string): Promise<ApiResponse<any>> {
    return api.get(`/threads/${processId}/deadlock`)
  },

  // 获取线程转储
  getThreadDump(processId: string): Promise<ApiResponse<ThreadInfo[]>> {
    return api.get(`/threads/${processId}/dump`)
  }
}

// 系统概览API
export const systemApi = {
  // 获取系统概览
  getSystemOverview(): Promise<ApiResponse<SystemOverview>> {
    return api.get('/system/overview')
  },

  // 获取监控配置
  getMonitoringConfig(): Promise<ApiResponse<any>> {
    return api.get('/system/config')
  },

  // 更新监控配置
  updateMonitoringConfig(config: any): Promise<ApiResponse<void>> {
    return api.put('/system/config', config)
  }
}

export default api
