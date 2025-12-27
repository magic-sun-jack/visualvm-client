import { ref, onMounted, onUnmounted } from 'vue'
import { tabManager } from '@/utils/tabManager'

/**
 * 标签页可见性管理 Composable
 * 用于在组件中管理标签页的激活/失活状态，控制请求的暂停和恢复
 */
export function useTabVisibility() {
  const isActive = ref(true)
  const isPaused = ref(false)
  
  // 请求暂停控制器
  const pauseController = ref<AbortController | null>(null)
  const pausedRequests = ref<Set<AbortController>>(new Set())

  /**
   * 暂停所有请求
   */
  function pauseRequests() {
    if (isPaused.value) return
    
    isPaused.value = true
    pauseController.value = new AbortController()
    pauseController.value.abort()
    
    console.log('标签页失活，暂停请求')
  }

  /**
   * 恢复所有请求
   */
  function resumeRequests() {
    if (!isPaused.value) return
    
    isPaused.value = false
    pauseController.value = null
    pausedRequests.value.clear()
    
    console.log('标签页激活，恢复请求')
  }

  /**
   * 检查是否应该暂停请求
   */
  function shouldPause(): boolean {
    return !tabManager.isTabActive() || isPaused.value
  }

  /**
   * 获取请求控制器（用于取消请求）
   */
  function getRequestController(): AbortController | null {
    if (shouldPause()) {
      const controller = new AbortController()
      pausedRequests.value.add(controller)
      return controller
    }
    return null
  }

  /**
   * 更新激活状态
   */
  function updateVisibility() {
    const wasActive = isActive.value
    isActive.value = tabManager.isTabActive()
    
    if (wasActive && !isActive.value) {
      pauseRequests()
    } else if (!wasActive && isActive.value) {
      resumeRequests()
    }
  }

  // 监听可见性变化
  function handleVisibilityChange() {
    updateVisibility()
  }

  // 监听窗口焦点变化
  function handleFocus() {
    updateVisibility()
  }

  function handleBlur() {
    updateVisibility()
  }

  onMounted(() => {
    // 初始状态
    updateVisibility()
    
    // 监听可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    
    // 监听标签页管理器的消息
    tabManager.onMessage((type, data) => {
      if (type === 'tab_visibility') {
        updateVisibility()
      }
    })
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('blur', handleBlur)
  })

  return {
    isActive,
    isPaused,
    shouldPause,
    getRequestController,
    pauseRequests,
    resumeRequests
  }
}

