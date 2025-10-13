# Electron 刷新问题调试指南

## 问题描述
Ctrl+R 刷新后仍未请求接口的问题已修复，以下是详细的调试和测试方法。

## 修复内容

### 1. IPC 监听器管理
- **问题**：页面刷新时 IPC 监听器重复注册，导致状态更新混乱
- **修复**：添加监听器清理机制，确保刷新时正确清理旧监听器

### 2. 服务状态检查优化
- **问题**：刷新后服务状态检查逻辑不够完善
- **修复**：在页面加载完成时主动检查并通知服务状态

### 3. 启动逻辑优化
- **问题**：每次刷新都会尝试重新启动服务
- **修复**：检查服务是否已运行，避免重复启动

## 关键修改

### ServiceLoading.vue
```typescript
// 添加监听器清理
let statusListener: ((status: any) => void) | null = null
let cleanupListener: (() => void) | null = null

onMounted(async () => {
  const isElectron = !!(window as any).electron
  
  if (isElectron) {
    // 创建状态监听器
    statusListener = (status) => {
      console.log('收到服务状态更新:', status)
      serviceStore.setServiceStatus(status.status, status.message)
    }
    
    // 监听服务状态变化（返回清理函数）
    cleanupListener = window.electron.onJavaServiceStatus(statusListener)
    
    // 检查服务状态
    const result = await window.electron.checkJavaService()
    // ... 处理结果
  }
})

// 组件卸载时清理监听器
onUnmounted(() => {
  if (cleanupListener) {
    console.log('清理服务状态监听器')
    cleanupListener()
    cleanupListener = null
    statusListener = null
  }
})
```

### electron/preload.js
```javascript
// 添加监听器管理
let statusListeners = new Set()

contextBridge.exposeInMainWorld('electron', {
  onJavaServiceStatus: (callback) => {
    statusListeners.add(callback)
    
    const listener = (_, status) => callback(status)
    ipcRenderer.on('java-service-status', listener)
    
    // 返回清理函数
    return () => {
      ipcRenderer.removeListener('java-service-status', listener)
      statusListeners.delete(callback)
    }
  },
  // ... 其他方法
})
```

### electron/main.js
```javascript
// 页面加载完成时检查服务状态
mainWindow.webContents.on('did-finish-load', () => {
  console.log('页面加载完成，检查服务状态...')
  
  setTimeout(() => {
    if (javaProcess && !javaProcess.killed) {
      console.log('服务正在运行，通知前端')
      mainWindow.webContents.send('java-service-status', { status: 'running' })
    } else {
      console.log('服务未运行，通知前端')
      mainWindow.webContents.send('java-service-status', { status: 'stopped' })
    }
  }, 100)
})

// 优化启动逻辑
mainWindow.webContents.once('did-finish-load', async () => {
  if (!javaProcess || javaProcess.killed) {
    // 启动服务
    await startJavaService()
  } else {
    // 服务已运行，直接通知
    mainWindow.webContents.send('java-service-status', { status: 'running' })
  }
})
```

## 测试步骤

### 1. 基本刷新测试
1. 启动 Electron 应用
2. 等待服务启动完成，界面显示正常
3. 按 **Ctrl+R** 刷新页面
4. 观察控制台输出，应该看到：
   ```
   Electron 环境：设置服务状态监听
   检查 Java 服务状态...
   服务状态检查结果: { status: 'running' }
   页面加载完成，检查服务状态...
   服务正在运行，通知前端
   收到服务状态更新: { status: 'running' }
   ```

### 2. 服务状态测试
1. **服务运行时刷新**：
   - 刷新后应该立即显示 "running" 状态
   - 不应该重新启动服务

2. **服务停止后刷新**：
   - 刷新后应该检测到服务停止
   - 应该尝试重新启动服务

3. **服务启动失败时刷新**：
   - 刷新后应该显示错误状态
   - 应该提供重试选项

### 3. 监听器清理测试
1. 多次刷新页面
2. 观察控制台，应该看到：
   ```
   清理服务状态监听器
   Electron 环境：设置服务状态监听
   ```
3. 确认没有重复的状态更新

## 调试信息

### 控制台日志
刷新时应该看到以下关键日志：
- `Electron 环境：设置服务状态监听`
- `检查 Java 服务状态...`
- `服务状态检查结果: { status: 'running' }`
- `页面加载完成，检查服务状态...`
- `服务正在运行，通知前端`
- `收到服务状态更新: { status: 'running' }`

### 网络请求
刷新后应该能看到：
- 对 `http://localhost:8099/cvm/overview/getFilteredProcesses` 的请求
- 请求应该成功返回（如果服务正在运行）

## 故障排除

### 如果仍然不请求接口
1. 检查控制台是否有错误信息
2. 确认 Electron 环境检测是否正常
3. 检查 IPC 通信是否正常
4. 验证服务是否真的在运行

### 如果状态更新混乱
1. 检查监听器是否正确清理
2. 确认没有重复注册监听器
3. 检查状态更新逻辑是否正确

### 如果服务重复启动
1. 检查服务状态检查逻辑
2. 确认 `javaProcess` 变量是否正确维护
3. 验证启动条件判断

## 预期效果
修复后，Ctrl+R 刷新时：
- ✅ 会正确检测 Electron 环境
- ✅ 会重新检查 Java 服务状态
- ✅ 会正确请求接口验证服务状态
- ✅ 监听器会被正确清理和重新注册
- ✅ 服务状态会正确更新到前端界面
- ✅ 不会重复启动已运行的服务
