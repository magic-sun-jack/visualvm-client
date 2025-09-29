# Java服务自动停止功能

## 功能概述

当Electron应用关闭时，会自动停止对应的Java服务，确保没有遗留的Java进程在后台运行。

## 实现特性

### 1. 优雅关闭
- 首先尝试使用`SIGTERM`信号优雅关闭Java服务
- 给Java服务5秒时间进行清理和关闭

### 2. 强制关闭
- 如果5秒内Java服务没有关闭，使用`SIGKILL`信号强制终止
- 确保Java服务不会成为僵尸进程

### 3. 多种退出场景处理
- **窗口关闭**: 当所有窗口关闭时停止Java服务
- **应用退出**: 在应用退出前确保Java服务已停止
- **异常退出**: 处理未捕获异常和未处理的Promise拒绝
- **进程退出**: 在进程退出时清理Java服务

### 4. 超时保护
- 最多等待10秒让Java服务完全停止
- 防止应用因Java服务无法停止而卡住

## 事件处理

```javascript
// 应用退出前
app.on('before-quit', (event) => {
  stopJavaService()
  // 等待Java服务停止后再退出
})

// 所有窗口关闭
app.on('window-all-closed', () => {
  stopJavaService()
  app.quit()
})

// 应用即将退出
app.on('will-quit', (event) => {
  if (javaProcess && !javaProcess.killed) {
    stopJavaService()
  }
})

// 进程退出
process.on('exit', () => {
  if (javaProcess && !javaProcess.killed) {
    javaProcess.kill('SIGKILL')
  }
})
```

## IPC接口

### 停止Java服务
```javascript
// 前端调用
const result = await window.electronAPI.stopJavaService()
```

### 退出应用
```javascript
// 前端调用
await window.electronAPI.exitApp()
```

## 测试

运行测试脚本验证功能：
```bash
node test-java-stop.js
```

## 日志输出

应用会输出详细的日志信息：
- `正在停止Java服务...`
- `Java服务已停止，退出码: X`
- `强制停止Java服务...`
- `Electron应用即将退出，正在停止Java服务...`

## 注意事项

1. 确保Java服务能够响应`SIGTERM`信号
2. 如果Java服务有特殊的关闭逻辑，需要在Java代码中实现
3. 在Windows系统上，`SIGTERM`和`SIGKILL`的行为可能略有不同
4. 建议在Java应用中添加Shutdown Hook来优雅处理关闭信号
