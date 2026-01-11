import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JavaProcessListDetail } from '@/types'

export interface ProcessTab {
  id: string
  pid: string
  displayName: string
  isRemote: boolean
  timestamp: number
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<ProcessTab[]>([])
  const activeTabId = ref<string | null>(null)

  // 计算属性
  const activeTab = computed(() => {
    return tabs.value.find(tab => tab.id === activeTabId.value) || null
  })

  const hasTabs = computed(() => tabs.value.length > 0)

  // 添加新tab
  function addTab(process: JavaProcessListDetail) {
    const isRemote = process.isRemote || false
    const pid = process.pid.toString()
    
    // 检查是否已存在该进程的tab
    const existingTab = tabs.value.find(tab => tab.pid === pid && tab.isRemote === isRemote)
    if (existingTab) {
      // 如果已存在，切换到该tab
      setActiveTab(existingTab.id)
      return existingTab.id
    }

    // 创建新tab
    const newTab: ProcessTab = {
      id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pid,
      displayName: process.mainClass || `PID: ${pid}`,
      isRemote,
      timestamp: Date.now()
    }

    tabs.value.push(newTab)
    setActiveTab(newTab.id)
    return newTab.id
  }

  // 设置活动tab
  function setActiveTab(tabId: string) {
    if (tabs.value.some(tab => tab.id === tabId)) {
      activeTabId.value = tabId
    }
  }

  // 关闭tab
  function closeTab(tabId: string) {
    const index = tabs.value.findIndex(tab => tab.id === tabId)
    if (index === -1) return

    tabs.value.splice(index, 1)

    // 如果关闭的是当前活动tab，切换到其他tab
    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        // 优先切换到右侧的tab，如果没有则切换到左侧
        const nextTab = tabs.value[index] || tabs.value[index - 1]
        if (nextTab) {
          setActiveTab(nextTab.id)
        } else {
          activeTabId.value = null
        }
      } else {
        activeTabId.value = null
      }
    }
  }

  // 关闭其他tab
  function closeOtherTabs(tabId: string) {
    tabs.value = tabs.value.filter(tab => tab.id === tabId)
    setActiveTab(tabId)
  }

  // 关闭所有tab
  function closeAllTabs() {
    tabs.value = []
    activeTabId.value = null
  }

  // 根据pid查找tab
  function findTabByPid(pid: string, isRemote: boolean): ProcessTab | null {
    return tabs.value.find(tab => tab.pid === pid && tab.isRemote === isRemote) || null
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    hasTabs,
    addTab,
    setActiveTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    findTabByPid
  }
})
