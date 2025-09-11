# 模拟数据配置说明

## 🎯 功能概述

已为所有 API 接口添加了完整的模拟数据支持，通过环境变量控制是否使用模拟数据。

## 🔧 环境变量配置

创建 `.env.local` 文件（或修改现有环境变量文件）来配置模拟数据：

```bash
# 应用配置
VITE_APP_TITLE=VisualVM 监控客户端
VITE_APP_VERSION=1.0.0

# API配置
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000

# 模拟数据配置 - 关键配置项
VITE_USE_MOCK_DATA=true          # 设置为 true 启用模拟数据
VITE_MOCK_DELAY=500              # 模拟网络延迟（毫秒）

# 功能开关
VITE_ENABLE_DEBUG=true           # 启用调试日志
VITE_ENABLE_ANALYTICS=false      # 禁用分析

# 主题配置
VITE_DEFAULT_THEME=light         # 默认主题
VITE_ENABLE_THEME_SWITCH=true    # 启用主题切换
```

## 📊 模拟数据特性

### 1. 智能数据生成
- **真实数据模拟**: 生成符合实际业务场景的数据
- **随机性**: 每次请求返回不同的数据，模拟真实环境
- **关联性**: 数据之间保持逻辑关联

### 2. 性能模拟
- **网络延迟**: 可配置的请求延迟，模拟真实网络环境
- **操作时间**: 不同操作有不同的延迟时间
  - 普通查询: 500ms
  - 启动/停止进程: 800-1200ms
  - 堆转储: 2000ms
  - 线程转储: 1000ms

### 3. 错误模拟
- **随机错误**: 模拟网络错误、超时等异常情况
- **业务错误**: 模拟进程不存在、权限不足等业务错误
- **状态变化**: 模拟进程状态变化、内存泄漏等动态情况

## 🎨 数据内容

### Java 进程数据
- 10个预生成的进程
- 包含 Spring Boot、Tomcat、IDE 等常见应用
- 真实的内存使用、CPU 使用率、线程数等指标

### 线程信息
- 100个线程数据
- 包含 main、http-nio、GC 等常见线程
- 完整的线程状态、CPU 时间、堆栈信息

### 数据库调用
- 200个数据库调用记录
- 包含 SELECT、INSERT、UPDATE、DELETE 等操作
- 执行时间、状态、参数等完整信息

### RMI 调用
- 150个 RMI 调用记录
- 包含各种服务方法调用
- 远程主机、执行时间、状态等信息

### 内存泄漏检测
- 50个内存泄漏检测结果
- 不同严重级别的泄漏
- 实例数量、内存大小、增长率等指标

### 系统概览
- 实时系统状态
- 进程数量、内存使用、CPU 使用等
- 活跃连接数等系统指标

## 🚀 使用方法

### 1. 启用模拟数据
```bash
# 在 .env.local 中设置
VITE_USE_MOCK_DATA=true
```

### 2. 禁用模拟数据
```bash
# 在 .env.local 中设置
VITE_USE_MOCK_DATA=false
```

### 3. 调整延迟时间
```bash
# 设置模拟网络延迟
VITE_MOCK_DELAY=1000  # 1秒延迟
```

### 4. 启用调试日志
```bash
# 查看 API 请求和响应日志
VITE_ENABLE_DEBUG=true
```

## 🔍 API 接口覆盖

### 进程管理 API
- ✅ `getProcesses()` - 获取所有进程
- ✅ `getProcess(id)` - 获取单个进程
- ✅ `startProcess(params)` - 启动进程
- ✅ `stopProcess(id)` - 停止进程
- ✅ `restartProcess(id)` - 重启进程
- ✅ `getProcessThreads(id)` - 获取进程线程
- ✅ `getProcessMemory(id)` - 获取内存使用
- ✅ `getProcessCpu(id)` - 获取 CPU 使用

### 数据库分析 API
- ✅ `getDatabaseStats(processId)` - 获取数据库统计
- ✅ `getSlowQueries(processId, params)` - 获取慢查询
- ✅ `getConnectionPoolStatus(processId)` - 获取连接池状态

### RMI 分析 API
- ✅ `getRMIStats(processId)` - 获取 RMI 统计
- ✅ `getRMICalls(processId, params)` - 获取 RMI 调用列表

### 内存泄漏分析 API
- ✅ `getMemoryLeakResults(processId)` - 获取泄漏检测结果
- ✅ `startMemoryLeakDetection(processId)` - 开始检测
- ✅ `stopMemoryLeakDetection(processId)` - 停止检测
- ✅ `getHeapDump(processId)` - 获取堆转储

### 线程分析 API
- ✅ `getThreadStats(processId)` - 获取线程统计
- ✅ `getDeadlockDetection(processId)` - 获取死锁检测
- ✅ `getThreadDump(processId)` - 获取线程转储

### 系统概览 API
- ✅ `getSystemOverview()` - 获取系统概览
- ✅ `getMonitoringConfig()` - 获取监控配置
- ✅ `updateMonitoringConfig(config)` - 更新监控配置

## 🎯 开发建议

### 1. 开发阶段
- 使用 `VITE_USE_MOCK_DATA=true` 进行前端开发
- 无需依赖后端服务即可完成所有功能开发
- 可以测试各种数据状态和异常情况

### 2. 联调阶段
- 设置 `VITE_USE_MOCK_DATA=false` 连接真实后端
- 使用 `VITE_ENABLE_DEBUG=true` 查看 API 调用日志
- 对比模拟数据和真实数据的差异

### 3. 生产部署
- 确保 `VITE_USE_MOCK_DATA=false`
- 设置正确的 `VITE_API_BASE_URL`
- 关闭调试日志 `VITE_ENABLE_DEBUG=false`

## 🔧 自定义配置

### 修改模拟数据
编辑 `src/api/mockData.ts` 文件：
- 修改 `mockDataCache.initialize()` 中的数据量
- 调整 `generateJavaProcess()` 等方法的数据生成逻辑
- 自定义错误概率和状态变化

### 添加新的模拟数据
1. 在 `MockDataGenerator` 类中添加新的生成方法
2. 在 `mockDataCache` 中添加缓存管理
3. 在对应的 API 方法中添加模拟数据逻辑

---

🎉 **现在你可以通过简单的环境变量配置，在模拟数据和真实 API 之间自由切换！**
