# Electron 环境下刷新不请求接口问题修复

## 问题描述
在 Electron 环境下，当用户刷新页面（F5 或 Ctrl+R）时，应用不会重新请求接口来检查服务状态，导致界面可能显示错误的状态。

## 问题原因
1. **服务状态管理问题**：页面刷新后 Pinia store 状态重置，但服务状态检查逻辑不够完善
2. **Electron 环境检测**：刷新后 Electron API 检测可能失效
3. **异步状态检查**：原来的服务状态检查是同步的，没有正确处理异步结果
4. **服务启动时机**：服务启动和状态通知的时机不够精确

## 修复方案

### 1. 改进 ServiceLoading.vue 组件
- 使用 `async/await` 确保服务状态检查的异步处理
- 添加详细的日志输出便于调试
- 改进 Electron 环境检测逻辑
- 增强错误处理机制

### 2. 优化 Electron 主进程
- 改进服务检查逻辑，使用正确的 API 端点
- 优化服务启动时机，等待窗口完全加载后再启动服务
- 增强服务状态通知机制
- 添加超时处理和错误状态通知

### 3. 关键修改点

#### ServiceLoading.vue
```typescript
onMounted(async () => {
  const isElectron = !!(window as any).electron
  
  if (isElectron) {
    // 设置状态监听
    window.electron.onJavaServiceStatus((status) => {
      serviceStore.setServiceStatus(status.status, status.message)
    })

    // 异步检查服务状态
    try {
      const result = await window.electron.checkJavaService()
      if (result && result.status === 'running') {
        serviceStore.setServiceStatus('running')
      } else {
        // 尝试启动服务
        serviceStore.setServiceStatus('loading')
        const startResult = await window.electron.startJavaService()
        if (!startResult.success) {
          serviceStore.setServiceStatus('error', startResult.error)
        }
      }
    } catch (error) {
      serviceStore.setServiceStatus('error', '无法检查服务状态')
    }
  }
})
```

#### electron/main.js
```javascript
// 改进服务检查
ipcMain.handle('check-java-service', async () => {
  try {
    if (javaProcess && !javaProcess.killed) {
      const response = await axios.get('http://localhost:8099/cvm/overview/getFilteredProcesses', {
        timeout: 5000
      })
      return { status: 'running' }
    } else {
      return { status: 'stopped' }
    }
  } catch (error) {
    return { status: 'stopped' }
  }
})

// 优化启动时机
app.whenReady().then(async () => {
  createWindow()
  
  mainWindow.webContents.once('did-finish-load', async () => {
    mainWindow.webContents.send('java-service-status', { status: 'loading' })
    
    try {
      await startJavaService()
    } catch (error) {
      mainWindow.webContents.send('java-service-status', { 
        status: 'error', 
        message: error.message 
      })
    }
  })
})
```

## 测试方法

### 1. 基本功能测试
1. 启动 Electron 应用
2. 等待服务启动完成
3. 按 F5 或 Ctrl+R 刷新页面
4. 观察控制台日志，确认服务状态检查正常执行

### 2. 服务状态测试
1. 在服务运行时刷新页面 → 应该显示 "running" 状态
2. 停止 Java 服务后刷新页面 → 应该尝试重新启动服务
3. 服务启动失败时刷新页面 → 应该显示错误状态

### 3. 调试信息
查看控制台输出，应该能看到以下日志：
- "Electron 环境：设置服务状态监听"
- "检查 Java 服务状态..."
- "服务状态检查结果: { status: 'running' }"
- "收到服务状态更新: { status: 'running' }"

## 预期效果
修复后，在 Electron 环境下刷新页面时：
1. 应用会正确检测 Electron 环境
2. 会重新检查 Java 服务状态
3. 如果服务未运行，会尝试重新启动
4. 服务状态会正确更新到前端界面
5. 用户可以看到正确的加载状态或错误信息

## 注意事项
- 确保 Java 服务 JAR 文件路径正确
- 检查端口 8099 是否被占用
- 如果仍有问题，请查看控制台日志进行调试
