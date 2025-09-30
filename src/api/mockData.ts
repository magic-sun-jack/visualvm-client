import type { 
  JavaProcessInfo, 
  JavaProcessDetail,
  JavaProcessListDetail,
  DatabaseCall, 
  RMICall, 
  MemoryLeakResult, 
  ThreadInfo,
  SystemOverview,
  PaginationParams,
  PaginatedResult,
  ApiResponse,
  MonitoringConfig,
  DatabaseMonitoringConfig,
  IOMonitoringConfig,
  HTTPMonitoringConfig,
  MonitoringMetric,
  MonitoringDataPoint,
  SystemProperties
} from '@/types'

// 模拟数据生成器
class MockDataGenerator {
  private static instance: MockDataGenerator
  private threadCounter = 1

  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator()
    }
    return MockDataGenerator.instance
  }

  // 生成随机ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // 生成随机时间戳
  private generateTimestamp(): string {
    const now = new Date()
    const randomMinutes = Math.floor(Math.random() * 60)
    now.setMinutes(now.getMinutes() - randomMinutes)
    return now.toISOString()
  }


  // 生成Java进程数据
  generateJavaProcess(): JavaProcessInfo {
    const uptime = Math.floor(Math.random() * 86400) + 3600 // 1小时到1天

    return {
      daemon_thread_count: Math.floor(Math.random() * 50) + 10,
      heap_memory: {
        init: 256 * 1024 * 1024, // 256MB
        used: Math.floor(Math.random() * 512) * 1024 * 1024, // 0-512MB
        committed: Math.floor(Math.random() * 1024) * 1024 * 1024, // 0-1GB
        max: 2048 * 1024 * 1024 // 2GB
      },
      non_heap_memory: {
        init: 64 * 1024 * 1024, // 64MB
        used: Math.floor(Math.random() * 128) * 1024 * 1024, // 0-128MB
        committed: Math.floor(Math.random() * 256) * 1024 * 1024, // 0-256MB
        max: -1 // 无限制
      },
      uptime_ms: uptime * 1000,
      loaded_class_count: Math.floor(Math.random() * 10000) + 5000,
      process_cpu_load: Math.round(Math.random() * 100 * 100) / 100,
      system_cpu_load: Math.round(Math.random() * 100 * 100) / 100,
      thread_count: Math.floor(Math.random() * 200) + 50
    }
  }

  // 生成Java进程详情
  generateJavaProcessDetail(): JavaProcessDetail {
    const pid = Math.floor(Math.random() * 9000) + 1000
    const jvmArgs = [
      '-Xmx512m',
      '-Xms256m',
      '-XX:+UseG1GC',
      '-XX:+UseStringDeduplication',
      '-Djava.awt.headless=true'
    ]

    return {
      host_ip: '127.0.0.1',
      system_properties: this.generateSystemProperties(),
      jvm_name: 'Java HotSpot(TM) 64-Bit Server VM',
      java_home: 'C:\\Program Files\\Java\\jdk-11',
      os_version: '10.0',
      java_version: '11.0.27',
      os_arch: 'amd64',
      os_name: 'Windows 11',
      pid: pid.toString(),
      main_class: 'math-game.jar',
      jvm_version: '11.0.27+8-LTS-232',
      jvm_args: jvmArgs
    }
  }

  // 生成Java进程列表详情
  generateJavaProcessListDetail(): JavaProcessListDetail {
    const pid = Math.floor(Math.random() * 9000) + 1000
    const processNames = [
      'Spring Boot Application',
      'Tomcat Server',
      'Eclipse IDE',
      'IntelliJ IDEA',
      'Maven Build',
      'Gradle Daemon',
      'Jenkins Agent',
      'SonarQube Scanner',
      'Elasticsearch',
      'Kafka Broker'
    ]

    const mainClasses = [
      'com.example.Application',
      'org.springframework.boot.SpringApplication',
      'org.apache.catalina.startup.Bootstrap',
      'com.intellij.idea.Main',
      'org.apache.maven.cli.MavenCli',
      'org.gradle.launcher.daemon.bootstrap.GradleDaemon',
      'hudson.remoting.Launcher',
      'org.sonarsource.scanner.cli.Main',
      'org.elasticsearch.bootstrap.Elasticsearch',
      'kafka.Kafka'
    ]

    const randomName = processNames[Math.floor(Math.random() * processNames.length)]
    const randomMainClass = mainClasses[Math.floor(Math.random() * mainClasses.length)]

    return {
      pid: pid.toString(),
      displayName: randomName,
      javaHome: 'C:\\Program Files\\Java\\jdk-11',
      mainArgs: '--server.port=8080 --spring.profiles.active=dev',
      mainClass: randomMainClass,
      jvmArgs: '-Xmx512m -Xms256m -XX:+UseG1GC',
      ip: '127.0.0.1',
      command: `java -Xmx512m -Xms256m -XX:+UseG1GC -jar ${randomMainClass}`,
      startTime: this.generateTimestamp()
    }
  }

  // 生成系统属性
  generateSystemProperties(): SystemProperties {
    return {
      'sun.desktop': 'windows',
      'awt.toolkit': 'sun.awt.windows.WToolkit',
      'java.specification.version': '11',
      'sun.cpu.isalist': 'amd64',
      'sun.jnu.encoding': 'GBK',
      'java.class.path': 'math-game.jar',
      'java.vm.vendor': 'Oracle Corporation',
      'sun.arch.data.model': '64',
      'user.variant': '',
      'java.vendor.url': 'https://java.oracle.com/',
      'user.timezone': 'Asia/Shanghai',
      'os.name': 'Windows 11',
      'java.vm.specification.version': '11',
      'sun.java.launcher': 'SUN_STANDARD',
      'user.country': 'CN',
      'sun.boot.library.path': 'C:\\Program Files\\Java\\jdk-11\\bin',
      'sun.java.command': 'math-game.jar',
      'jdk.debug': 'release',
      'sun.cpu.endian': 'little',
      'user.home': 'C:\\Users\\User',
      'user.language': 'zh',
      'sun.stderr.encoding': 'cp936',
      'java.specification.vendor': 'Oracle Corporation',
      'java.version.date': '2023-10-17',
      'java.home': 'C:\\Program Files\\Java\\jdk-11',
      'file.separator': '\\',
      'java.vm.compressedOopsMode': '32-bit',
      'line.separator': '\r\n',
      'sun.stdout.encoding': 'cp936',
      'java.specification.name': 'Java Platform API Specification',
      'java.vm.specification.vendor': 'Oracle Corporation',
      'java.awt.graphicsenv': 'sun.awt.Win32GraphicsEnvironment',
      'user.script': '',
      'sun.management.compiler': 'HotSpot 64-Bit Tiered Compilers',
      'java.runtime.version': '11.0.27+8-LTS-232',
      'user.name': 'User',
      'path.separator': ';',
      'os.version': '10.0',
      'java.runtime.name': 'Java(TM) SE Runtime Environment',
      'file.encoding': 'UTF-8',
      'java.vm.name': 'Java HotSpot(TM) 64-Bit Server VM',
      'java.vendor.version': '11.0.27+8-LTS-232',
      'java.vendor.url.bug': 'https://bugreport.java.com/bugreport/',
      'java.io.tmpdir': 'C:\\Users\\User\\AppData\\Local\\Temp\\',
      'java.version': '11.0.27',
      'user.dir': 'D:\\code\\money\\visualvm-client',
      'os.arch': 'amd64',
      'java.vm.specification.name': 'Java Virtual Machine Specification',
      'java.awt.printerjob': 'sun.awt.windows.WPrinterJob',
      'sun.os.patch.level': '',
      'java.library.path': 'C:\\Program Files\\Java\\jdk-11\\bin;C:\\Windows\\Sun\\Java\\bin;C:\\Windows\\system32;C:\\Windows;C:\\Program Files\\Java\\jdk-11\\bin;C:\\Windows\\Sun\\Java\\bin;C:\\Windows\\system32;C:\\Windows',
      'java.vendor': 'Oracle Corporation',
      'java.vm.info': 'mixed mode',
      'java.vm.version': '11.0.27+8-LTS-232',
      'java.specification.maintenance.version': '0',
      'java.rmi.server.randomIDs': 'true',
      'sun.io.unicode.encoding': 'UnicodeLittle',
      'java.class.version': '55.0'
    }
  }

  // 生成线程信息
  generateThreadInfo(): ThreadInfo {
    const threadNames = [
      'main',
      'http-nio-8080-exec-1',
      'http-nio-8080-exec-2',
      'GC task thread#0',
      'GC task thread#1',
      'Reference Handler',
      'Finalizer',
      'Signal Dispatcher',
      'Attach Listener',
      'C2 CompilerThread0',
      'C1 CompilerThread0',
      'Sweeper thread',
      'Common-Cleaner',
      'Monitor Ctrl-Break',
      'pool-1-thread-1',
      'pool-1-thread-2',
      'ScheduledExecutorService-1',
      'Timer-0',
      'AsyncAppender-Worker-ASYNC',
      'logback-1'
    ]

    const states = [
      'RUNNABLE',
      'BLOCKED',
      'WAITING',
      'TIMED_WAITING',
      'TERMINATED'
    ]

    const name = threadNames[Math.floor(Math.random() * threadNames.length)]
    const state = states[Math.floor(Math.random() * states.length)]

    return {
      id: this.threadCounter++,
      name,
      state,
      cpuTime: Math.floor(Math.random() * 1000000),
      userTime: Math.floor(Math.random() * 1000000),
      blockedTime: Math.floor(Math.random() * 10000),
      blockedCount: Math.floor(Math.random() * 100),
      waitedTime: Math.floor(Math.random() * 10000),
      waitedCount: Math.floor(Math.random() * 100),
      stackTrace: [
        'java.lang.Thread.sleep(Native Method)',
        'com.example.service.AsyncService.process(AsyncService.java:45)',
        'com.example.controller.ApiController.handleRequest(ApiController.java:23)',
        'org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205)',
        'org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:150)'
      ]
    }
  }

  // 生成数据库调用数据
  generateDatabaseCall(): DatabaseCall {
    const sqlQueries = [
      'SELECT * FROM users WHERE id = ?',
      'INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)',
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      'SELECT u.*, o.* FROM users u LEFT JOIN orders o ON u.id = o.user_id',
      'SELECT COUNT(*) FROM products WHERE category_id = ?',
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id',
      'UPDATE user_profiles SET last_login = NOW() WHERE user_id = ?',
      'SELECT * FROM audit_logs WHERE created_at >= ? ORDER BY created_at DESC',
      'CALL sp_get_user_statistics(?)'
    ]

    const statuses: ('success' | 'error' | 'timeout')[] = ['success', 'error', 'timeout']
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const sql = sqlQueries[Math.floor(Math.random() * sqlQueries.length)]
    const executionTime = Math.floor(Math.random() * 5000) + 10 // 10ms-5s

    return {
      id: this.generateId(),
      sql,
      executionTime,
      timestamp: this.generateTimestamp(),
      connectionId: `conn-${Math.floor(Math.random() * 1000)}`,
      status,
      errorMessage: status === 'error' ? 'Connection timeout' : undefined,
      parameters: {
        param1: Math.floor(Math.random() * 1000),
        param2: `value-${Math.floor(Math.random() * 100)}`
      }
    }
  }

  // 生成RMI调用数据
  generateRMICall(): RMICall {
    const methodNames = [
      'getUserById',
      'createOrder',
      'updateProduct',
      'deleteUser',
      'searchProducts',
      'getOrderHistory',
      'calculateTotal',
      'validatePayment',
      'sendNotification',
      'generateReport'
    ]

    const classNames = [
      'com.example.service.UserService',
      'com.example.service.OrderService',
      'com.example.service.ProductService',
      'com.example.service.PaymentService',
      'com.example.service.NotificationService',
      'com.example.service.ReportService'
    ]

    const statuses: ('success' | 'error' | 'timeout')[] = ['success', 'error', 'timeout']
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const methodName = methodNames[Math.floor(Math.random() * methodNames.length)]
    const className = classNames[Math.floor(Math.random() * classNames.length)]
    const executionTime = Math.floor(Math.random() * 3000) + 5 // 5ms-3s

    return {
      id: this.generateId(),
      methodName,
      className,
      executionTime,
      timestamp: this.generateTimestamp(),
      remoteHost: `192.168.1.${Math.floor(Math.random() * 255)}`,
      status,
      errorMessage: status === 'error' ? 'Remote method execution failed' : undefined,
      parameters: {
        userId: Math.floor(Math.random() * 10000),
        orderId: Math.floor(Math.random() * 100000)
      }
    }
  }

  // 生成内存泄漏检测结果
  generateMemoryLeakResult(): MemoryLeakResult {
    const classNames = [
      'com.example.model.User',
      'com.example.model.Order',
      'com.example.model.Product',
      'com.example.model.CartItem',
      'com.example.model.Payment',
      'com.example.model.Notification',
      'com.example.model.AuditLog',
      'com.example.model.Session',
      'com.example.model.Cache',
      'com.example.model.TempData'
    ]

    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical']
    const severity = severities[Math.floor(Math.random() * severities.length)]

    const className = classNames[Math.floor(Math.random() * classNames.length)]
    const instanceCount = Math.floor(Math.random() * 10000) + 100
    const memorySize = instanceCount * (Math.floor(Math.random() * 1000) + 100) // 字节
    const growthRate = Math.round(Math.random() * 100 * 100) / 100 // 百分比

    return {
      id: this.generateId(),
      className,
      instanceCount,
      memorySize,
      growthRate,
      timestamp: this.generateTimestamp(),
      severity,
      description: `Memory leak detected in ${className}. ${instanceCount} instances consuming ${Math.round(memorySize / 1024 / 1024)}MB of memory.`
    }
  }

  // 生成系统概览数据
  generateSystemOverview(): SystemOverview {
    const totalProcesses = Math.floor(Math.random() * 20) + 5
    const runningProcesses = Math.floor(totalProcesses * (0.7 + Math.random() * 0.3))
    const totalMemoryUsage = Math.round(Math.random() * 80 + 20) // 20%-100%
    const totalCpuUsage = Math.round(Math.random() * 60 + 10) // 10%-70%
    const activeConnections = Math.floor(Math.random() * 1000) + 50

    return {
      totalProcesses,
      runningProcesses,
      totalMemoryUsage,
      totalCpuUsage,
      activeConnections,
      lastUpdate: new Date().toISOString()
    }
  }

  // 生成分页结果
  generatePaginatedResult<T>(
    dataGenerator: () => T,
    params: PaginationParams,
    totalElements?: number
  ): PaginatedResult<T> {
    const total = totalElements || Math.floor(Math.random() * 1000) + 100
    const totalPages = Math.ceil(total / params.size)
    const currentPage = Math.min(params.page, totalPages)
    const content: T[] = []

    const startIndex = (currentPage - 1) * params.size
    const endIndex = Math.min(startIndex + params.size, total)

    for (let i = startIndex; i < endIndex; i++) {
      content.push(dataGenerator())
    }

    return {
      content,
      totalElements: total,
      totalPages,
      currentPage,
      size: params.size
    }
  }

  // 生成API响应
  generateApiResponse<T>(data: T, success: boolean = true, message?: string): ApiResponse<T> {
    return {
      code: success ? 200 : 500,
      msg: message || (success ? '操作成功' : '操作失败'),
      data,
      success,
      message: message || (success ? '操作成功' : '操作失败'),
      timestamp: new Date().toISOString()
    }
  }

  // 生成监控配置
  generateMonitoringConfig(): MonitoringConfig {
    return {
      enabled: true,
      interval: 5000, // 5秒
      retentionDays: 30,
      alertThresholds: {
        cpu: 80,
        memory: 85,
        responseTime: 5000
      }
    }
  }

  // 生成数据库监控配置
  generateDatabaseMonitoringConfig(): DatabaseMonitoringConfig {
    const databasePackages = [
      'java.sql.*',
      'javax.sql.*',
      'com.mysql.cj.*',
      'com.mysql.jdbc.*',
      'org.postgresql.*',
      'oracle.jdbc.*',
      'com.microsoft.sqlserver.jdbc.*',
      'com.zaxxer.hikari.*',
      'org.apache.commons.dbcp2.*',
      'org.springframework.jdbc.core.*',
      'org.mybatis.spring.SqlSessionTemplate.*',
      'org.apache.ibatis.executor.*',
      'org.hibernate.*',
      'spring.data.*'
    ]

    return {
      scenario: 'database',
      enabled: true,
      packages: databasePackages.slice(0, Math.floor(Math.random() * 5) + 3),
      excludePackages: ['org.slf4j.*', 'ch.qos.logback.*'],
      samplingInterval: 1000,
      maxSamples: 10000,
      connectionPoolMonitoring: true,
      slowQueryThreshold: 1000,
      captureParameters: true
    }
  }

  // 生成IO监控配置
  generateIOMonitoringConfig(): IOMonitoringConfig {
    const ioPackages = [
      'java.net.*',
      'java.nio.*',
      'sun.nio.ch.*',
      'java.io.*',
      'java.nio.file.*',
      'sun.nio.fs.*',
      'org.apache.http.*',
      'okhttp3.*',
      'io.netty.*',
      'reactor.netty.*'
    ]

    return {
      scenario: 'io',
      enabled: true,
      packages: ioPackages.slice(0, Math.floor(Math.random() * 4) + 2),
      excludePackages: ['jdk.*', 'sun.*'],
      samplingInterval: 500,
      maxSamples: 5000,
      capturePayload: true,
      maxPayloadSize: 1024 * 10 // 10KB
    }
  }

  // 生成HTTP监控配置
  generateHTTPMonitoringConfig(): HTTPMonitoringConfig {
    const httpPackages = [
      'org.apache.http.*',
      'org.apache.hc.client5.*',
      'okhttp3.*',
      'jdk.internal.net.http.*',
      'org.apache.coyote.*',
      'org.eclipse.jetty.*',
      'io.undertow.*'
    ]

    return {
      scenario: 'http',
      enabled: true,
      packages: httpPackages.slice(0, Math.floor(Math.random() * 3) + 2),
      samplingInterval: 1000,
      maxSamples: 10000,
      captureHeaders: true,
      captureBody: false,
      maxBodySize: 1024 * 50 // 50KB
    }
  }

  // 生成监控数据点
  generateMonitoringDataPoints(count: number = 20): MonitoringDataPoint[] {
    const points: MonitoringDataPoint[] = []
    const now = Date.now()
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * 60000) // 每分钟一个点
      const value = Math.sin(i * 0.3) * 30 + 50 + Math.random() * 10 // 波动数据
      
      points.push({
        timestamp: timestamp.toISOString(),
        value: Math.max(0, Math.round(value * 100) / 100),
        label: i === 0 ? 'Current' : undefined
      })
    }
    
    return points
  }

  // 生成监控指标
  generateMonitoringMetric(name: string, unit: string): MonitoringMetric {
    const dataPoints = this.generateMonitoringDataPoints()
    const currentValue = dataPoints[dataPoints.length - 1].value
    const previousValue = dataPoints[dataPoints.length - 2].value
    
    let trend: 'up' | 'down' | 'stable'
    if (currentValue > previousValue * 1.05) {
      trend = 'up'
    } else if (currentValue < previousValue * 0.95) {
      trend = 'down'
    } else {
      trend = 'stable'
    }

    return {
      name,
      value: currentValue,
      unit,
      trend,
      dataPoints
    }
  }

  // 生成数据库监控指标
  generateDatabaseMetrics(): MonitoringMetric[] {
    return [
      this.generateMonitoringMetric('Query Rate', 'queries/sec'),
      this.generateMonitoringMetric('Connection Pool Usage', '%'),
      this.generateMonitoringMetric('Average Query Time', 'ms'),
      this.generateMonitoringMetric('Slow Queries', 'count'),
      this.generateMonitoringMetric('Active Connections', 'connections'),
      this.generateMonitoringMetric('Transaction Rate', 'tx/sec')
    ]
  }

  // 生成IO监控指标
  generateIOMetrics(): MonitoringMetric[] {
    return [
      this.generateMonitoringMetric('Read Throughput', 'MB/s'),
      this.generateMonitoringMetric('Write Throughput', 'MB/s'),
      this.generateMonitoringMetric('Network Latency', 'ms'),
      this.generateMonitoringMetric('Active Sockets', 'count'),
      this.generateMonitoringMetric('File Operations', 'ops/sec'),
      this.generateMonitoringMetric('IO Wait Time', 'ms')
    ]
  }
}

export const mockDataGenerator = MockDataGenerator.getInstance()

// 预生成的模拟数据缓存
export const mockDataCache = {
  processes: [] as JavaProcessListDetail[],
  processDetails: [] as JavaProcessDetail[],
  threads: [] as ThreadInfo[],
  databaseCalls: [] as DatabaseCall[],
  rmiCalls: [] as RMICall[],
  memoryLeakResults: [] as MemoryLeakResult[],
  systemOverview: null as SystemOverview | null,

  // 初始化缓存数据
  initialize() {
    // 生成10个进程列表
    this.processes = Array.from({ length: 10 }, () => mockDataGenerator.generateJavaProcessListDetail())
    
    // 生成10个进程详情
    this.processDetails = Array.from({ length: 10 }, () => mockDataGenerator.generateJavaProcessDetail())
    
    // 生成100个线程
    this.threads = Array.from({ length: 100 }, () => mockDataGenerator.generateThreadInfo())
    
    // 生成200个数据库调用
    this.databaseCalls = Array.from({ length: 200 }, () => mockDataGenerator.generateDatabaseCall())
    
    // 生成150个RMI调用
    this.rmiCalls = Array.from({ length: 150 }, () => mockDataGenerator.generateRMICall())
    
    // 生成50个内存泄漏结果
    this.memoryLeakResults = Array.from({ length: 50 }, () => mockDataGenerator.generateMemoryLeakResult())
    
    // 生成系统概览
    this.systemOverview = mockDataGenerator.generateSystemOverview()
  },

  // 获取进程列表
  getProcesses(): JavaProcessListDetail[] {
    return [...this.processes]
  },

  // 根据ID获取进程详情
  getProcessById(id: string): JavaProcessDetail | undefined {
    return this.processDetails.find(p => p.pid === id)
  },

  // 获取线程列表
  getThreads(): ThreadInfo[] {
    return [...this.threads]
  },

  // 获取数据库调用列表
  getDatabaseCalls(): DatabaseCall[] {
    return [...this.databaseCalls]
  },

  // 获取RMI调用列表
  getRMICalls(): RMICall[] {
    return [...this.rmiCalls]
  },

  // 获取内存泄漏结果
  getMemoryLeakResults(): MemoryLeakResult[] {
    return [...this.memoryLeakResults]
  },

  // 获取系统概览
  getSystemOverview(): SystemOverview {
    return this.systemOverview || mockDataGenerator.generateSystemOverview()
  }
}

// 初始化缓存
mockDataCache.initialize()
