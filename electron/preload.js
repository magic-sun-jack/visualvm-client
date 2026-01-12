// 使用 CommonJS 以兼容 Electron 预加载脚本环境
const { contextBridge, ipcRenderer } = require('electron')

// 存储监听器引用，用于清理
let statusListeners = new Set()

contextBridge.exposeInMainWorld('electron', {
  startJavaService: () => ipcRenderer.invoke('start-java-service'),
  checkJavaService: () => ipcRenderer.invoke('check-java-service'),
  onJavaServiceStatus: (callback) => {
    // 添加监听器到集合中
    statusListeners.add(callback)
    
    // 设置监听器
    const listener = (_, status) => callback(status)
    ipcRenderer.on('java-service-status', listener)
    
    // 返回清理函数
    return () => {
      ipcRenderer.removeListener('java-service-status', listener)
      statusListeners.delete(callback)
    }
  },
  removeJavaServiceStatusListener: (callback) => {
    // 移除特定的监听器
    statusListeners.delete(callback)
  },
  removeAllJavaServiceStatusListeners: () => {
    // 移除所有监听器
    ipcRenderer.removeAllListeners('java-service-status')
    statusListeners.clear()
  },
  exitApp: () => ipcRenderer.invoke('exit-app'),
  // 获取 resources 目录路径
  getResourcesPath: () => ipcRenderer.invoke('get-resources-path'),
  // 打开文件选择对话框
  openFileDialog: () => {
    ipcRenderer.send('open-file-dialog-for-file')
  },
  // 监听文件选择结果
  onFileSelected: (callback) => {
    const listener = (_, path) => callback(path)
    ipcRenderer.on('selected-file', listener)
    
    // 返回清理函数
    return () => {
      ipcRenderer.removeListener('selected-file', listener)
    }
  }
})
