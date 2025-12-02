// 进程概览信息
export interface ProcessOverview {
  pid: number                    // 进程ID
  name: string                   // 进程名称
  memoryUsage: MemoryUsage      // 内存使用情况
  status: 'running' | 'stopped' | 'error' // 进程状态
  uptime: number                // 运行时间
  threadCount: number           // 线程数
}

export interface heap_memory_interface { // 堆内存使用情况
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

export interface metaspace_interface {
  metaspace_used_bytes: number // Metaspace 已使用内存（字节）
  metaspace_committed_bytes: number // Metaspace 已承诺内存（字节）
  metaspace_init_bytes: number // Metaspace 初始分配内存（字节）
  metaspace_max_bytes: number // Metaspace 最大可用内存（字节）
}

export interface thread_interface {
  daemon_thread_count: number // 当前守护线程数
  thread_count: number // 当前活动线程总数
  total_started_thread_count: number // JVM 启动以来线程总数
  peak_thread_count: number // JVM 启动以来线程峰值数
}

export interface class_interface {
  loaded_class_count: number // 当前已加载类的数量
  unloaded_class_count: number // 当前已卸载类的数量
  total_loaded_class_count: number // JVM 启动以来已加载类的总数
}

// Java进程信息
export interface JavaProcessInfo {
  heap_memory: heap_memory_interface
  non_heap_memory: non_heap_memory_interface
  uptime_ms: number
  gc_total_count: number
  process_cpu_load: number
  metaspace: metaspace_interface
  system_cpu_load: number
  thread: thread_interface
  class: class_interface
  gc_activity_percent: number
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

// GC 统计信息接口，根据 @Untitled-3 (4-65) 完善，补全 survivor1 支持及完善注释
export interface GCStatsInfo {
  // 编译器信息
  compileTime: {
    name: string // 编译器名称
    totalCompilationTime: number // 编译器总编译时间(ms)
  }
  // 类加载器统计信息
  classLoaderTime: {
    classLoaderTotalTimeMs: number // 类加载器累计加载用时(ms)
    loadedClassCount: number // 已加载类数
    unloadedClassCount: number // 已卸载类数
    totalLoadedClassCount: number // 历史累计加载类数
  }
  // 垃圾回收器统计信息数组（支持多 GC）
  gcInfo: Array<{
    name: string        // GC 名称，如 "G1 Young Generation"
    collectionCount: number // GC 执行次数
    collectionTime: number  // GC 总耗时(ms)
  }>
  // 所有 GC 总耗时(ms)
  totalGCTime: number
  // 堆/非堆总览
  heapOverview: {
    heapUsed: number        // 堆已使用内存
    heapInit: number        // 堆初始分配内存
    heapCommitted: number   // 堆已提交内存
    heapMax: number         // 堆最大可用内存
    nonHeapUsed: number     // 非堆已使用内存
    nonHeapInit: number     // 非堆初始分配内存
    nonHeapCommitted: number // 非堆已提交内存
    nonHeapMax: number      // 非堆最大可用内存
  }
  // 堆内各内存空间
  memorySpaces: {
    metaspace: {
      init: number
      committed: number
      max: number
      used: number
    }
    eden: {
      init: number
      committed: number
      max: number
      used: number
    }
    old: {
      init: number
      committed: number
      max: number
      used: number
    }
    survivor0: {
      init: number
      committed: number
      max: number
      used: number
    }
    survivor1?: { // 新增 survivor1 区间支持，部分虚拟机有此 Key
      init: number
      committed: number
      max: number
      used: number
    }
  }
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

// 线程状态分布百分比
export interface ThreadStateDistributionPercent {
  NEW: number // 新建状态占比
  RUNNABLE: number // 可运行状态占比
  BLOCKED: number // 阻塞状态占比
  WAITING: number // 等待状态占比
  TIMED_WAITING: number // 定时等待状态占比
  TERMINATED: number // 终止状态占比
}

// 线程统计信息
export interface ThreadStats {
  liveThreads: number // 存活的线程数
  daemonThreads: number // 守护的线程数
  peakThreads: number // 峰值线程数
  totalStartedThreads: number // 启动的总线程数
  stateDistributionPercent: ThreadStateDistributionPercent // 线程状态占比
  sampleMillis: number // 采样间隔（毫秒）
  cpuProcessor: number // 可用的处理器数
}

// 线程详细信息
export interface ThreadDetailInfo {
  threadId: number // 线程ID
  threadName: string // 线程名
  threadState: 'NEW' | 'RUNNABLE' | 'BLOCKED' | 'WAITING' | 'TIMED_WAITING' | 'TERMINATED' // 线程状态
  blockedCount: number // 线程进入 BLOCKED 状态的总次数
  waitedCount: number // 线程处于 WAITING 或 TIMED_WAITING 状态的总次数
  blockedTimeMs: number // 线程进入 BLOCKED 状态的大致累积经过时间（以毫秒为单位）
  waitedTimeMs: number // 线程处于 WAITING 或 TIMED_WAITING 状态的大致累积经过时间（以毫秒为单位）
  cpuTimeDeltaMs: number // CPU 时间增量（毫秒）
  cpuPercent: number // CPU 使用百分比
  daemon: boolean // 是否为守护线程
}

// 线程列表响应数据
export interface ThreadListData {
  stats: ThreadStats // 线程统计信息
  threads: ThreadDetailInfo[] // 线程列表
}

// 线程列表 API 响应
export interface ThreadListResponse {
  status: number // 状态码
  msg: string | null // 消息
  data: ThreadListData // 数据
  areSuccess: boolean // 是否成功
}