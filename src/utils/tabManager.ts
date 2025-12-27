/**
 * 标签页管理工具
 * 用于管理多标签页的进程监控，支持标签页间的通信和状态管理
 */

interface TabInfo {
  pid: string
  isRemote: boolean
  timestamp: number
}

const STORAGE_KEY = 'visualvm_tabs'
const CHANNEL_NAME = 'visualvm_tab_channel'

class TabManager {
  private channel: BroadcastChannel | null = null
  private currentTabId: string
  private isActive = true

  constructor() {
    // 生成当前标签页的唯一 ID
    this.currentTabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 初始化 BroadcastChannel（如果支持）
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME)
      this.setupChannelListeners()
    }
    
    // 监听标签页激活/失活
    this.setupVisibilityListeners()
    
    // 清理已关闭的标签页信息
    this.cleanupClosedTabs()
  }

  /**
   * 设置 BroadcastChannel 监听器
   */
  private setupChannelListeners() {
    if (!this.channel) return

    this.channel.onmessage = (event) => {
      const { type, data } = event.data

      switch (type) {
        case 'tab_opened':
          // 其他标签页打开了进程
          this.updateTabInfo(data.pid, data.isRemote)
          break
        case 'tab_closed':
          // 其他标签页关闭了
          this.removeTabInfo(data.tabId)
          break
        case 'focus_tab':
          // 请求聚焦到指定标签页
          if (data.tabId === this.currentTabId) {
            window.focus()
          }
          break
      }
    }
  }

  /**
   * 设置可见性监听器
   */
  private setupVisibilityListeners() {
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden
      this.broadcast('tab_visibility', {
        tabId: this.currentTabId,
        isActive: this.isActive
      })
    })

    window.addEventListener('focus', () => {
      this.isActive = true
      this.broadcast('tab_visibility', {
        tabId: this.currentTabId,
        isActive: true
      })
    })

    window.addEventListener('blur', () => {
      this.isActive = false
      this.broadcast('tab_visibility', {
        tabId: this.currentTabId,
        isActive: false
      })
    })

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
      this.removeTabInfo(this.currentTabId)
    })
  }

  /**
   * 打开或聚焦到进程标签页
   */
  openProcessTab(pid: string, isRemote: boolean = false): Window | null {
    const windowName = `process_${pid}`
    
    // 构建 URL - 检测当前是否使用 hash 路由
    const isHashMode = window.location.hash.startsWith('#/')
    const baseUrl = window.location.origin + window.location.pathname
    const hash = isHashMode ? `#/dashboard?pid=${pid}&remote=${isRemote}` : ''
    const query = isHashMode ? '' : `?pid=${pid}&remote=${isRemote}`
    const path = isHashMode ? '' : '/dashboard'
    let url = `${baseUrl}${path}${hash}${query}`
    
    // 尝试查找已打开的窗口（通过 window.name）
    try {
      const existingWindow = window.open('', windowName)
      if (existingWindow && !existingWindow.closed) {
        // 标签页已存在，聚焦并更新 URL
        existingWindow.focus()
        
        // 更新 URL 以确保导航到概览页面
        try {
          if (isHashMode) {
            existingWindow.location.hash = `#/dashboard?pid=${pid}&remote=${isRemote}`
          } else {
            existingWindow.location.href = `${baseUrl}/dashboard?pid=${pid}&remote=${isRemote}`
          }
        } catch (e) {
          // 跨域限制，使用 postMessage
          existingWindow.postMessage({
            type: 'navigate_to_process',
            pid,
            isRemote,
            url: '/dashboard'
          }, window.location.origin)
        }
        
        // 广播消息，请求聚焦到该标签页
        this.broadcast('focus_tab', { 
          pid,
          isRemote
        })
        
        return existingWindow
      }
    } catch (error) {
      console.warn('查找已存在标签页失败:', error)
    }

    // 创建新标签页
    const newWindow = window.open(url, windowName, 'noopener,noreferrer')

    if (newWindow) {
      // 保存标签页信息
      this.addTabInfo(pid, isRemote, newWindow)
      
      // 广播新标签页打开
      this.broadcast('tab_opened', {
        pid,
        isRemote,
        tabId: this.currentTabId
      })
    }

    return newWindow
  }

  /**
   * 添加标签页信息
   */
  private addTabInfo(pid: string, isRemote: boolean, window: Window) {
    const tabs = this.getTabs()
    const tabInfo: TabInfo & { tabId: string; window: Window } = {
      pid,
      isRemote,
      tabId: this.currentTabId,
      timestamp: Date.now(),
      window
    }
    
    tabs.push(tabInfo)
    this.saveTabs(tabs)
  }

  /**
   * 更新标签页信息
   */
  private updateTabInfo(pid: string, isRemote: boolean) {
    const tabs = this.getTabs()
    const index = tabs.findIndex(tab => tab.pid === pid)
    
    if (index >= 0) {
      tabs[index] = {
        ...tabs[index],
        isRemote,
        timestamp: Date.now()
      }
      this.saveTabs(tabs)
    }
  }

  /**
   * 移除标签页信息
   */
  private removeTabInfo(tabId: string) {
    const tabs = this.getTabs()
    const filtered = tabs.filter(tab => (tab as any).tabId !== tabId)
    this.saveTabs(filtered)
    
    this.broadcast('tab_closed', { tabId })
  }

  /**
   * 根据 PID 查找标签页
   */
  private findTabByPid(pid: string): (TabInfo & { tabId: string; window: Window }) | null {
    const tabs = this.getTabs()
    return tabs.find(tab => tab.pid === pid && !(tab as any).window?.closed) as any || null
  }

  /**
   * 获取所有标签页信息
   */
  private getTabs(): (TabInfo & { tabId?: string; window?: Window })[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  /**
   * 保存标签页信息
   */
  private saveTabs(tabs: any[]) {
    try {
      // 只保存基本信息，不保存 window 对象
      const serializable = tabs.map(tab => ({
        pid: tab.pid,
        isRemote: tab.isRemote,
        tabId: tab.tabId,
        timestamp: tab.timestamp
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
    } catch (error) {
      console.error('保存标签页信息失败:', error)
    }
  }

  /**
   * 清理已关闭的标签页
   */
  private cleanupClosedTabs() {
    const tabs = this.getTabs()
    const active = tabs.filter(tab => {
      const window = (tab as any).window
      return window && !window.closed
    })
    
    if (active.length !== tabs.length) {
      this.saveTabs(active)
    }
  }

  /**
   * 广播消息
   */
  private broadcast(type: string, data: any) {
    if (this.channel) {
      this.channel.postMessage({ type, data })
    }
  }

  /**
   * 检查当前标签页是否激活
   */
  isTabActive(): boolean {
    return this.isActive && !document.hidden
  }

  /**
   * 获取当前标签页 ID
   */
  getCurrentTabId(): string {
    return this.currentTabId
  }

  /**
   * 监听消息
   */
  onMessage(callback: (type: string, data: any) => void) {
    if (this.channel) {
      this.channel.onmessage = (event) => {
        const { type, data } = event.data
        callback(type, data)
      }
    }
  }
}

// 导出单例
export const tabManager = new TabManager()

