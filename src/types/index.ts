// 进程概览信息
export interface ProcessOverview {
  pid: number                    // 进程ID
  name: string                   // 进程名称
  memoryUsage: MemoryUsage      // 内存使用情况
  status: 'running' | 'stopped' | 'error' // 进程状态
  uptime: number                // 运行时间
  threadCount: number           // 线程数
}

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
  used: number        // 已使用内存(MB)
  max: number         // 最大内存(MB)
  committed: number   // 已提交内存(MB)
  heapUsage: number  // 堆内存使用(MB)
  nonHeapUsage: number // 非堆内存使用(MB)
  percentage: number  // 使用率(%)
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
  code: number      // 状态码
  msg: string      // 消息
  data: T          // 数据
  success: boolean // 是否成功
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

// 监控场景类型
export type MonitoringScenario = 'database' | 'http' | 'io' | 'rmi' | 'socket' | 'file'

// 场景配置参数
export interface ScenarioConfig {
  scenario: MonitoringScenario
  enabled: boolean
  packages: string[]
  excludePackages?: string[]
  samplingInterval?: number
  maxSamples?: number
}

// 数据库监控配置
export interface DatabaseMonitoringConfig extends ScenarioConfig {
  scenario: 'database'
  connectionPoolMonitoring?: boolean
  slowQueryThreshold?: number
  captureParameters?: boolean
}

// IO监控配置
export interface IOMonitoringConfig extends ScenarioConfig {
  scenario: 'io' | 'socket' | 'file'
  capturePayload?: boolean
  maxPayloadSize?: number
}

// HTTP监控配置
export interface HTTPMonitoringConfig extends ScenarioConfig {
  scenario: 'http'
  captureHeaders?: boolean
  captureBody?: boolean
  maxBodySize?: number
}

// 监控数据点
export interface MonitoringDataPoint {
  timestamp: string
  value: number
  label?: string
}

// 监控指标
export interface MonitoringMetric {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  dataPoints: MonitoringDataPoint[]
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
