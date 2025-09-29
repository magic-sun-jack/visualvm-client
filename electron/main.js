import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { spawn } from 'child_process'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let javaProcess = null

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.svg'), // 应用图标
    titleBarStyle: 'default',
    show: false // 先不显示，等加载完成后再显示
  })

  // 加载应用
  if (isDev) {
    // 开发环境：加载Vite开发服务器
    mainWindow.loadURL('http://localhost:3300')
    // 打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 添加导航拦截器，处理 SPA 路由
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    // 如果是路由导航失败，重新加载主页面
    if (errorCode === -6) { // ERR_FILE_NOT_FOUND
      console.log('路由导航失败，重新加载:', validatedURL)
      if (!isDev) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
      }
    }
  })

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 当窗口被关闭时
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(async () => {
  createWindow()
  
  // 立即通知前端显示loading状态
  mainWindow.webContents.send('java-service-status', { status: 'loading' })
  
  try {
    await startJavaService()
  } catch (error) {
    console.error('Java服务启动失败:', error)
    mainWindow.webContents.send('java-service-status', { status: 'error', message: error.message })
  }

  // 在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    console.log('所有窗口已关闭，正在停止Java服务...')
    stopJavaService()
    app.quit()
  }
})

// 处理应用即将退出事件
app.on('will-quit', (event) => {
  console.log('Electron应用即将退出，确保Java服务已停止...')
  if (javaProcess && !javaProcess.killed) {
    console.log('Java服务仍在运行，强制停止...')
    stopJavaService()
  }
})

// 处理进程退出事件
process.on('exit', () => {
  console.log('进程退出，清理Java服务...')
  if (javaProcess && !javaProcess.killed) {
    javaProcess.kill('SIGKILL')
  }
})

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  stopJavaService()
  process.exit(1)
})

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
  stopJavaService()
})

// 启动 Java 服务
async function startJavaService() {
  const jarPath = path.join(__dirname, '../java/monitor-0.0.1-SNAPSHOT.jar')
  
  javaProcess = spawn('java', [
    '-Dfile.encoding=UTF-8',
    '-Dspring.jpa.database-platform=org.hibernate.dialect.H2Dialect',
    '--add-modules=jdk.attach',
    '-jar', jarPath
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  })

  javaProcess.stdout.on('data', (data) => {
    console.log(`Java服务输出: ${data}`)
    if (data.toString().includes('Started MonitorApplication')) {
      mainWindow.webContents.send('java-service-status', { status: 'running' })
    }
  })

  javaProcess.stderr.on('data', (data) => {
    console.error(`Java服务错误: ${data}`)
  })

  javaProcess.on('close', (code) => {
    console.log(`Java服务已退出，退出码: ${code}`)
    mainWindow.webContents.send('java-service-status', { status: 'stopped' })
    javaProcess = null
  })

  // 等待服务启动
  let attempts = 0
  const maxAttempts = 30
  while (attempts < maxAttempts) {
    try {
      await axios.get('http://localhost:8099/cvm/overview/getFilteredProcesses')
      console.log('Java服务已就绪')
      mainWindow.webContents.send('java-service-status', { status: 'running' })
      return true
    } catch (error) {
      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  throw new Error('Java服务启动超时')
}

// 停止 Java 服务
function stopJavaService() {
  if (javaProcess) {
    console.log('正在停止Java服务...')
    try {
      // 先尝试优雅关闭
      javaProcess.kill('SIGTERM')
      
      // 设置超时，如果5秒内没有关闭则强制杀死
      setTimeout(() => {
        if (javaProcess && !javaProcess.killed) {
          console.log('强制停止Java服务...')
          javaProcess.kill('SIGKILL')
        }
      }, 5000)
      
      javaProcess.on('exit', (code) => {
        console.log(`Java服务已停止，退出码: ${code}`)
        javaProcess = null
      })
    } catch (error) {
      console.error('停止Java服务时出错:', error)
      javaProcess = null
    }
  }
}

// 在应用退出前清理
app.on('before-quit', (event) => {
  console.log('Electron应用即将退出，正在停止Java服务...')
  stopJavaService()
  
  // 等待Java服务停止后再退出
  if (javaProcess) {
    event.preventDefault()
    
    const checkInterval = setInterval(() => {
      if (!javaProcess || javaProcess.killed) {
        clearInterval(checkInterval)
        app.quit()
      }
    }, 100)
    
    // 最多等待10秒
    setTimeout(() => {
      clearInterval(checkInterval)
      app.quit()
    }, 10000)
  }
})

// 设置 IPC 通信
ipcMain.handle('check-java-service', async () => {
  try {
    const response = await axios.get('http://localhost:8080/health')
    return { status: 'running' }
  } catch (error) {
    return { status: 'stopped' }
  }
})

ipcMain.handle('start-java-service', async () => {
  try {
    await startJavaService()
    return { success: true }
  } catch (error) {
    console.error('启动Java服务失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('stop-java-service', () => {
  try {
    stopJavaService()
    return { success: true }
  } catch (error) {
    console.error('停止Java服务失败:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('exit-app', () => {
  console.log('收到退出应用请求，正在停止Java服务...')
  stopJavaService()
  app.quit()
})

// 设置应用菜单
const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '退出',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit()
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { role: 'undo', label: '撤销' },
      { role: 'redo', label: '重做' },
      { type: 'separator' },
      { role: 'cut', label: '剪切' },
      { role: 'copy', label: '复制' },
      { role: 'paste', label: '粘贴' }
    ]
  },
  {
    label: '视图',
    submenu: [
      { role: 'reload', label: '重新加载' },
      { role: 'forceReload', label: '强制重新加载' },
      { role: 'toggleDevTools', label: '开发者工具' },
      { type: 'separator' },
      { role: 'resetZoom', label: '实际大小' },
      { role: 'zoomIn', label: '放大' },
      { role: 'zoomOut', label: '缩小' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: '全屏' }
    ]
  },
  {
    label: '窗口',
    submenu: [
      { role: 'minimize', label: '最小化' },
      { role: 'close', label: '关闭' }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
