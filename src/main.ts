import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 在开发环境中禁用Vue DevTools的自动集成
if (import.meta.env.DEV) {
  // 禁用Vue DevTools的自动检测
  ;(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = {
    Vue: null,
    apps: [],
    emit: () => {},
    on: () => {},
    off: () => {},
    once: () => {},
    replay: () => {},
    log: () => {},
    devtoolsEnabled: false,
    isVue: () => false,
    devtools: {
      enabled: false,
      installed: false,
      Vue: null,
      version: '',
      app: null
    }
  }
}

const app = createApp(App)

// 添加全局错误处理
app.config.errorHandler = (err, _instance, info) => {
  // 过滤掉Vue DevTools相关的错误
  if (err instanceof TypeError && err.message.includes('__vrv_devtools')) {
    console.warn('Vue DevTools兼容性警告，已忽略:', err.message)
    return
  }
  
  console.error('Vue应用错误:', err, info)
  // 可以在这里添加错误上报逻辑
}

// 添加全局警告处理
app.config.warnHandler = (msg, _instance, trace) => {
  console.warn('Vue警告:', msg, trace)
}

app.use(createPinia())
app.use(router)

// 安全地挂载应用
try {
  app.mount('#app')
} catch (error) {
  console.error('应用挂载失败:', error)
}
