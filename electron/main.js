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
    app.quit()
  }
})

// 启动 Java 服务
async function startJavaService() {
  const jarPath = path.join(__dirname, '../java/monitor-0.0.1-SNAPSHOT.jar')
  
  javaProcess = spawn('java', ['-jar', jarPath], {
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
      await axios.get('http://localhost:8080/health')
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
    javaProcess.kill()
    javaProcess = null
  }
}

// 在应用退出前清理
app.on('before-quit', () => {
  stopJavaService()
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

ipcMain.handle('exit-app', () => {
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
