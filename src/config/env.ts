// 环境变量配置
export const env = {
  // 应用配置
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'VisualVM 监控客户端',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API配置
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8099',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  
  // 模拟数据配置
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
  MOCK_DELAY: Number(import.meta.env.VITE_MOCK_DELAY) || 500,
  
  // 功能开关
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' || false,
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || false,
  
  // 主题配置
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'light',
  ENABLE_THEME_SWITCH: import.meta.env.VITE_ENABLE_THEME_SWITCH === 'true' || true,
  
  // 开发环境判断
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD
}

// 模拟数据延迟函数
export const mockDelay = (ms: number = env.MOCK_DELAY): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 控制台日志函数
export const debugLog = (...args: any[]) => {
  if (env.ENABLE_DEBUG) {
    console.log('[DEBUG]', ...args)
  }
}

// 错误日志函数
export const errorLog = (...args: any[]) => {
  console.error('[ERROR]', ...args)
}

// 警告日志函数
export const warnLog = (...args: any[]) => {
  console.warn('[WARN]', ...args)
}
