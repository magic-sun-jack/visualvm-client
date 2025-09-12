# Postman 接口测试文档

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|---------|------|
| baseUrl | http://localhost:8099 | API基础URL |
| pid | 1234 | 测试用进程ID |
| host | 192.168.200.26 | 远程主机IP |
| port | 9010 | 远程主机端口 |

## 接口列表

### 进程管理

#### 获取本地进程概述
- 请求方法: GET
- 接口路径: {{baseUrl}}/cvm/overview/getLocalOverview?pid={{pid}}
- 描述: 获取本地指定进程的概述信息
- 参数:
  - pid: 进程ID (必需)

#### 获取远程进程概述  
- 请求方法: GET
- 接口路径: {{baseUrl}}/cvm/overview/getRemoteOverview?host={{host}}&port={{port}}
- 描述: 获取远程主机上的进程概述
- 参数:
  - host: 远程主机IP (必需)
  - port: 远程主机端口 (必需)

#### 启动进程监控
- 请求方法: GET
- 接口路径: {{baseUrl}}/cvm/monitor/start?pid={{pid}}
- 描述: 启动对指定进程的监控
- 参数:
  - pid: 进程ID (必需)

#### 获取过滤后的进程
- 请求方法: GET  
- 接口路径: {{baseUrl}}/cvm/overview/getFilteredProcesses
- 描述: 获取经过过滤的进程列表
- 参数: 无

### 线程分析

#### 监控线程
- 请求方法: GET
- 接口路径: {{baseUrl}}/cvm/thread/monitorThreads?pid={{pid}}
- 描述: 监控指定进程的线程
- 参数:
  - pid: 进程ID (必需)

#### 获取线程转储
- 请求方法: GET
- 接口路径: {{baseUrl}}/cvm/thread/dump?pid={{pid}}
- 描述: 获取指定进程的线程转储信息
- 参数:
  - pid: 进程ID (必需)

### CPU监控 

#### 启动CPU监控
- 请求方法: POST
- 接口路径: {{baseUrl}}/cvm/cpu/start?pid={{pid}}&packageFilter=java.*,com.*&filterType=include
- 描述: 启动CPU使用监控
- 参数:
  - pid: 进程ID (必需)
  - packageFilter: 包过滤器
  - filterType: 过滤类型

#### 获取CPU监控流
- 请求方法: GET 
- 接口路径: {{baseUrl}}/cvm/cpu/stream?pid={{pid}}&refreshPeriod=5000
- 描述: 获取CPU使用情况数据流
- 参数:
  - pid: 进程ID (必需)
  - refreshPeriod: 刷新周期(ms)

#### 停止CPU监控
- 请求方法: POST
- 接口路径: {{baseUrl}}/cvm/cpu/stop?pid={{pid}}
- 描述: 停止CPU使用监控
- 参数:
  - pid: 进程ID (必需)

### 内存监控

#### 启动内存监控
- 请求方法: POST
- 接口路径: {{baseUrl}}/cvm/memory/start?pid={{pid}}&refresh=10000
- 描述: 启动内存使用监控
- 参数:
  - pid: 进程ID (必需)
  - refresh: 刷新间隔(ms)

#### 获取内存监控流
- 请求方法: GET
- 接口路径: {{baseUrl}}/cvm/memory/stream?pid={{pid}}
- 描述: 获取内存使用情况数据流
- 参数:
  - pid: 进程ID (必需)

#### 停止内存监控
- 请求方法: POST
- 接口路径: {{baseUrl}}/cvm/memory/stop?pid={{pid}}
- 描述: 停止内存使用监控
- 参数:
  - pid: 进程ID (必需)

## 使用说明

1. 导入集合文件 `visualvm-client.postman_collection.json`
2. 导入环境配置文件 `visualvm-client.postman_environment.json`
3. 选择环境 "VisualVM Client Environment"
4. 根据实际情况修改环境变量中的 pid 值
5. 开始测试接口

注意事项:
1. 确保 Java 后端服务已启动且运行在 8099 端口
2. 测试前先通过不带 pid 参数的接口获取可用的进程 ID
3. 使用获取到的真实进程 ID 更新环境变量
