// 进程概览信息
export interface ProcessOverview {
  pid: number                    // 进程ID
  name: string                   // 进程名称
  memoryUsage: MemoryUsage      // 内存使用情况
  status: 'running' | 'stopped' | 'error' // 进程状态
  uptime: number                // 运行时间
  threadCount: number           // 线程数
}

export interface heap_memory_interface {
  init: number // 初始大小
  used: number // 已用
  committed: number // 承诺大小
  max: number // 最大可用
}

export interface non_heap_memory_interface {
  init: number // 初始大小
  used: number // 已用
  committed: number // 承诺大小
  max: number // 最大可用
}

// Java进程信息
export interface JavaProcessInfo {
  daemon_thread_count: number	//	当前守护线程数量
  heap_memory:  heap_memory_interface	//	堆内存使用情况
  non_heap_memory: non_heap_memory_interface // 非堆内存使用情况
  uptime_ms: number	//	JVM 启动时间，单位毫秒（JVM 运行时长）
  loaded_class_count: number	//	当前已加载类的数量
  process_cpu_load: number	//	当前 JVM 进程 CPU 使用率
  system_cpu_load: number	//	系统整体 CPU 使用率
  thread_count: number	//	当前活动线程总数
}

// Java进程List信息
export interface JavaProcessListDetail {
  pid: string	//	进程pid
  displayName: string	//	展示名称
  javaHome: string	//	java home
  mainArgs: string	//	主要参数
  mainClass: string	//	主类
  jvmArgs: string	//	jvm参数
  ip: string | null	//	ip地址
  command: string	//	命令
  startTime: string	//	开始时间
}

export interface SystemPropertiesInterface {
  "sun.desktop": string,
  "awt.toolkit": string,
  "java.specification.version": string,
  "sun.cpu.isalist": string,
  "sun.jnu.encoding": string,
  "java.class.path": string,
  "java.vm.vendor": string,
  "sun.arch.data.model": string,
  "user.variant": string,
  "java.vendor.url": string,
  "user.timezone": string,
  "os.name": string,
  "java.vm.specification.version": string,
  "sun.java.launcher": string,
  "user.country": string,
  "sun.boot.library.path": string,
  "sun.java.command": string,
  "jdk.debug": string,
  "sun.cpu.endian": string,
  "user.home": string,
  "user.language": string,
  "sun.stderr.encoding": string,
  "java.specification.vendor": string,
  "java.version.date": string,
  "java.home": string,
  "file.separator": string,
  "java.vm.compressedOopsMode": string,
  "line.separator": string,
  "sun.stdout.encoding": string,
  "java.specification.name": string,
  "java.vm.specification.vendor": string,
  "java.awt.graphicsenv": string,
  "user.script": string,
  "sun.management.compiler": string,
  "java.runtime.version": string,
  "user.name": string,
  "path.separator": string,
  "os.version": string,
  "java.runtime.name": string,
  "file.encoding": string,
  "java.vm.name": string,
  "java.vendor.version": string,
  "java.vendor.url.bug": string,
  "java.io.tmpdir": string,
  "java.version": string,
  "user.dir": string,
  "os.arch": string,
  "java.vm.specification.name": string,
  "java.awt.printerjob": string,
  "sun.os.patch.level": string,
  "java.library.path": string,
  "java.vendor": string,
  "java.vm.info": string,
  "java.vm.version": string,
  "java.specification.maintenance.version": string,
  "java.rmi.server.randomIDs": string,
  "sun.io.unicode.encoding": string,
  "java.class.version": string
}

export interface JavaProcessDetail {
  host_ip: string // ip地址
  system_properties?: SystemPropertiesInterface // 系统属性
  jvm_name: string // jvm名
  java_home: string // java路径
  os_version: string // 系统版本
  java_version: string // java版本
  os_arch: string // 系统架构
  os_name: string // 系统名
  pid: string // 进程id
  main_class: string // 主类
  jvm_version: string // jvm版本
  jvm_args: string[] | string | null  // jvm参数
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
  msg: string       // 消息
  data: T           // 数据
  areSuccess: boolean  // 是否成功
  success: boolean  // 是否成功
  message?: string  // 可选消息字段
  timestamp?: string // 可选时间戳字段
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

export interface CpuStream {
  result: Array<{
    method: string // 方法
    selfTimeMs: number // 自用时间
    selfTimePercent: number // 自用时间占比
    totalTimeMs: number // 总时间
  }>
  pid: string
  config: { // 配置
    pid: string 
    packageFilters: string[] // 过滤的类名
    filterType: 'INCLUDE' | 'exclude' // 过滤类型
    samplingPeriod: number // 采样间隔
    refreshPeriod: number // 数据返回频率
  }
}
