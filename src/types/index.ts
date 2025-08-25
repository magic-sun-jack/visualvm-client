// Java进程信息
export interface JavaProcess {
  id: string
  name: string
  pid: number
  status: 'running' | 'stopped' | 'error'
  mainClass: string
  arguments: string[]
  jvmVersion: string
  startTime: string
  uptime: number
  memoryUsage: MemoryUsage
  cpuUsage: number
  threadCount: number
}

// 内存使用情况
export interface MemoryUsage {
  used: number
  max: number
  committed: number
  percentage: number
}

// 线程信息
export interface ThreadInfo {
  id: number
  name: string
  state: string
  cpuTime: number
  userTime: number
  blockedTime: number
  blockedCount: number
  waitedTime: number
  waitedCount: number
  stackTrace: string[]
}

// 数据库调用信息
export interface DatabaseCall {
  id: string
  sql: string
  executionTime: number
  timestamp: string
  connectionId: string
  status: 'success' | 'error' | 'timeout'
  errorMessage?: string
  parameters?: Record<string, any>
}

// RMI调用信息
export interface RMICall {
  id: string
  methodName: string
  className: string
  executionTime: number
  timestamp: string
  remoteHost: string
  status: 'success' | 'error' | 'timeout'
  errorMessage?: string
  parameters?: Record<string, any>
}

// 内存泄漏检测结果
export interface MemoryLeakResult {
  id: string
  className: string
  instanceCount: number
  memorySize: number
  growthRate: number
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

// 系统概览数据
export interface SystemOverview {
  totalProcesses: number
  runningProcesses: number
  totalMemoryUsage: number
  totalCpuUsage: number
  activeConnections: number
  lastUpdate: string
}

// API响应格式
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

// 分页参数
export interface PaginationParams {
  page: number
  size: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 分页结果
export interface PaginatedResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

// 监控配置
export interface MonitoringConfig {
  enabled: boolean
  interval: number
  retentionDays: number
  alertThresholds: {
    cpu: number
    memory: number
    responseTime: number
  }
}

// 进程启动参数
export interface ProcessStartParams {
  jarPath: string
  mainClass?: string
  jvmOptions?: string[]
  arguments?: string[]
  workingDirectory?: string
  environment?: Record<string, string>
}
