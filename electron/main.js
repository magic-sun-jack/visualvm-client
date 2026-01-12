import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { spawn } from 'child_process'
import axios from 'axios'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let javaProcess = null

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    fullscreen: false,
    minWidth: 1440,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'), // 应用图标
    titleBarStyle: 'default',
    show: false // 先不显示，等加载完成后再显示
  })

  // 最大化窗口以占据屏幕可用区域（非全屏）
  mainWindow.maximize()

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

  // 处理页面刷新事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成，检查服务状态...')
    
    // 延迟一点时间确保前端组件已挂载
    setTimeout(() => {
      // 检查服务状态并通知前端
      if (javaProcess && !javaProcess.killed) {
        console.log('服务正在运行，通知前端')
        mainWindow.webContents.send('java-service-status', { status: 'running' })
      } else {
        console.log('服务未运行，通知前端')
        mainWindow.webContents.send('java-service-status', { status: 'stopped' })
      }
    }, 100)
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
  
  // 等待窗口完全加载后再启动服务（仅在首次启动时）
  mainWindow.webContents.once('did-finish-load', async () => {
    console.log('窗口首次加载完成，检查是否需要启动 Java 服务...')
    
    // 检查服务是否已经在运行
    if (!javaProcess || javaProcess.killed) {
      console.log('Java 服务未运行，开始启动...')
      
      // 立即通知前端显示loading状态
      mainWindow.webContents.send('java-service-status', { status: 'loading' })
      
      try {
        await startJavaService()
      } catch (error) {
        console.error('Java服务启动失败:', error)
        mainWindow.webContents.send('java-service-status', { status: 'error', message: error.message })
      }
    } else {
      console.log('Java 服务已在运行，通知前端')
      mainWindow.webContents.send('java-service-status', { status: 'running' })
    }
  })

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
  // 在开发环境中使用相对路径，在生产环境中使用打包后的路径
  let jarPath
  if (isDev) {
    // 开发环境：使用项目根目录下的 java 文件夹
    jarPath = path.join(__dirname, '../java/monitor-0.0.1-SNAPSHOT.jar')
  } else {
    // 生产环境：使用打包后的 resources 目录
    jarPath = path.join(process.resourcesPath, 'monitor-0.0.1-SNAPSHOT.jar')
  }
  
  console.log('Java JAR 文件路径:', jarPath)
  console.log('文件是否存在:', existsSync(jarPath))
  
  // 如果文件不存在，尝试其他可能的路径
  if (!existsSync(jarPath)) {
    console.log('尝试查找 JAR 文件的其他位置...')
    const possiblePaths = [
      path.join(__dirname, '../java/monitor-0.0.1-SNAPSHOT.jar'),
      path.join(process.cwd(), 'java/monitor-0.0.1-SNAPSHOT.jar'),
      path.join(process.resourcesPath, 'monitor-0.0.1-SNAPSHOT.jar'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'monitor-0.0.1-SNAPSHOT.jar')
    ]
    
    for (const testPath of possiblePaths) {
      console.log('检查路径:', testPath, '存在:', existsSync(testPath))
      if (existsSync(testPath)) {
        jarPath = testPath
        console.log('找到 JAR 文件:', jarPath)
        break
      }
    }
  }
  
  // 如果仍然找不到 JAR 文件，抛出错误
  if (!existsSync(jarPath)) {
    throw new Error(`无法找到 JAR 文件。已检查的路径：\n${possiblePaths.map(p => `- ${p}`).join('\n')}`)
  }
  
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
  const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8099';
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(`${JAVA_API_BASE_URL}/cvm/overview/getFilteredProcesses`, {
        timeout: 5000
      })
      console.log('Java服务已就绪，响应状态:', response.status)
      mainWindow.webContents.send('java-service-status', { status: 'running' })
      return true
    } catch (error) {
      attempts++
      console.log(`服务启动检查失败 (${attempts}/${maxAttempts}):`, error.message)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // 如果超时，发送错误状态
  const errorMsg = 'Java服务启动超时'
  console.error(errorMsg)
  mainWindow.webContents.send('java-service-status', { status: 'error', message: errorMsg })
  throw new Error(errorMsg)
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
    const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8099';
    // 检查 Java 服务是否正在运行
    if (javaProcess && !javaProcess.killed) {
      // 尝试访问服务接口来确认服务是否真正可用
      const response = await axios.get(`${JAVA_API_BASE_URL}/cvm/overview/getFilteredProcesses`, {
        timeout: 5000
      })
      console.log('Java 服务检查成功，状态码:', response.status)
      return { status: 'running' }
    } else {
      console.log('Java 进程未运行')
      return { status: 'stopped' }
    }
  } catch (error) {
    console.log('Java 服务检查失败:', error.message)
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

// 获取 resources 目录路径
ipcMain.handle('get-resources-path', () => {
  if (isDev) {
    // 开发环境：返回项目根目录下的 java 文件夹
    return path.join(__dirname, '../java')
  } else {
    // 生产环境：返回安装目录的 resources 文件夹
    return process.resourcesPath || path.join(__dirname, '../resources')
  }
})

// 处理文件选择对话框
ipcMain.on('open-file-dialog-for-file', async (event) => {
  try {
    const platform = os.platform()
    let result
    
    if (platform === 'linux' || platform === 'win32') {
      result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Heap Dump Files', extensions: ['hprof', 'heap'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })
    } else {
      // macOS
      result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory'],
        filters: [
          { name: 'Heap Dump Files', extensions: ['hprof', 'heap'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })
    }
    
    if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
      event.sender.send('selected-file', result.filePaths[0])
    }
  } catch (error) {
    console.error('打开文件对话框失败:', error)
    event.sender.send('selected-file', null)
  }
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
