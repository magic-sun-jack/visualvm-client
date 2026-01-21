<template>
  <div class="min-h-screen bg-background">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <!-- 第一行：Logo、搜索栏、操作按钮 -->
      <div class="w-full px-5 flex h-14 items-center">
        <!-- Logo 区域 -->
        <div class="mr-4 flex">
          <RouterLink to="/dashboard" class="mr-6 flex items-center space-x-2">
            <div class="h-8 w-8 rounded-lg flex items-center justify-center">
              <img src="/icon.png" alt="logo" class="h-8 w-8" />
            </div>
            <span class="font-bold sm:inline-block">Java测试工具</span>
          </RouterLink>
        </div>

        <!-- 搜索栏 -->
        <!-- <div class="hidden md:block">
          <SearchBar :navigation-items="flatNavigationItems" />
        </div> -->

        <!-- 右侧操作区域 -->
        <div class="ml-auto flex items-center space-x-2">
          <!-- 系统状态指示器 -->
          <div class="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted/50">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-muted-foreground">系统运行中</span>
          </div>

          <!-- 连接进程按钮 -->
          <Button
            variant="default"
            size="sm"
            @click="openProcessConnectDialog"
            class="h-8 px-3 hidden sm:flex"
          >
            <Plug class="h-4 w-4" />
            连接进程
          </Button>

          <!-- 刷新按钮 -->
          <!-- <Button
            variant="outline"
            size="sm"
            @click="refreshData"
            :disabled="isRefreshing"
            class="h-8 px-3 hidden sm:flex"
          >
            <RefreshCw
              v-if="isRefreshing"
              class="animate-spin -ml-1 mr-2 h-4 w-4"
            />
            {{ isRefreshing ? '刷新中...' : '刷新' }}
          </Button> -->

          <!-- 主题切换 -->
          <ThemeToggle />

          <!-- 通知铃铛 -->
          <!-- <NotificationBell /> -->

          <!-- 移动端导航菜单 -->
          <MobileNav :navigation-items="flatNavigationItems" />
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- 侧边栏 - 进程列表 -->
      <aside
        class="sidebar-fixed hidden lg:block fixed left-0 w-80 border-r bg-muted/40 overflow-y-auto z-40 top-14 h-[calc(100vh-3.5rem)]"
      >
        <div class="p-4 space-y-4">
          <!-- 标题和刷新按钮 -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">进程列表</h2>
            <Button
              variant="ghost"
              size="icon"
              @click="refreshAllProcesses"
              :disabled="isRefreshing"
              class="h-8 w-8"
            >
              <RefreshCw
                :class="['h-4 w-4', { 'animate-spin': isRefreshing }]"
              />
            </Button>
          </div>

          <!-- 本地进程分组 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
              <Monitor class="h-4 w-4" />
              <span>本地进程</span>
              <Badge variant="secondary" class="ml-auto text-xs">
                {{ localProcesses.length }}
              </Badge>
            </div>
            <div v-if="isRefreshing && localProcesses.length === 0" class="px-2 py-4 text-center text-sm text-muted-foreground">
              <RefreshCw class="h-4 w-4 animate-spin mx-auto mb-2" />
              加载中...
            </div>
            <div v-else-if="localProcesses.length === 0" class="px-2 py-4 text-center text-sm text-muted-foreground">
              暂无本地进程
            </div>
            <div v-else class="space-y-1">
              <button
                v-for="process in localProcesses"
                :key="process.pid"
                @click="selectProcess(process)"
                :class="[
                  'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                  isProcessActive(process)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">{{ `${process.displayName}(${process.pid})` }}</div>
                    <div class="text-xs text-muted-foreground truncate" v-if="process.mainClass">
                      {{ process.mainClass }}
                    </div>
                  </div>
                  <Badge variant="outline" class="ml-2 text-xs shrink-0">
                    本地
                  </Badge>
                </div>
              </button>
            </div>
          </div>

          <!-- 远程进程分组 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
              <Plug class="h-4 w-4" />
              <span>远程进程</span>
              <Badge variant="secondary" class="ml-auto text-xs">
                {{ remoteProcesses.length }}
              </Badge>
            </div>
            <div v-if="isRefreshing && remoteProcesses.length === 0" class="px-2 py-4 text-center text-sm text-muted-foreground">
              <RefreshCw class="h-4 w-4 animate-spin mx-auto mb-2" />
              加载中...
            </div>
            <div v-else-if="remoteProcesses.length === 0" class="px-2 py-4 text-center text-sm text-muted-foreground">
              暂无远程进程
            </div>
            <div v-else class="space-y-1">
              <button
                v-for="process in remoteProcesses"
                :key="process.pid"
                @click="selectProcess(process)"
                :class="[
                  'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                  isProcessActive(process)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">{{ `${process.displayName}(${process.pid})` }}</div>
                    <div class="text-xs text-muted-foreground truncate" v-if="process.ip">
                      {{ process.ip }}
                    </div>
                  </div>
                  <Badge variant="destructive" class="ml-2 text-xs shrink-0">
                    远程
                  </Badge>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main v-if="tabsStore.hasTabs" class="flex-1 lg:ml-80 transition-all duration-300" style="max-width: calc(100% - 20rem);">
        <!-- Tab栏 -->
        <div class="w-full border-b bg-background/95">
          <div class="flex items-center gap-1 px-2 overflow-x-auto">
            <div
              v-for="tab in tabsStore.tabs"
              :key="tab.id"
              @click="switchToTab(tab.id)"
              :class="[
                'group flex items-center gap-2 px-3 py-2 text-sm rounded-t-md transition-colors cursor-pointer min-w-0',
                tabsStore.activeTabId === tab.id
                  ? 'bg-background border-t border-l border-r text-foreground'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              ]"
            >
              <Badge 
                :variant="tab.isRemote ? 'destructive' : 'outline'" 
                class="text-xs shrink-0"
              >
                {{ tab.isRemote ? '远程' : '本地' }}
              </Badge>
              <span class="truncate max-w-[200px]">{{ tab.displayName }}</span>
              <button
                @click.stop="closeTab(tab.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-destructive/10 rounded p-0.5"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="w-full border-b bg-background/95 px-2 py-2">
          <div class="flex items-center space-x-1">
            <RouterLink
              v-for="item in mainNavigationItems"
              :key="item.path"
              :to="item.path"
              :class="[
                'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isRouteActive(item.path)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              ]"
            >
              <component v-if="item.icon" :is="item.icon" class="h-4 w-4" />
              <span>{{ item.title }}</span>
            </RouterLink>
          </div>
        </nav>
        
        <!-- <Breadcrumb /> -->
        <div class="p-2">
          <RouterView v-if="tabsStore.hasTabs && tabsStore.activeTab" :key="`${tabsStore.activeTab.pid}-${tabsStore.activeTab.isRemote}`" />
          <div v-else>
            <slot />
          </div>
        </div>
      </main>
      <div class="w-full bg-background/95" v-else>
        <div class="flex items-center justify-center h-full">
          <div class="text-center text-sm text-muted-foreground">
            <p class="text-lg font-semibold mt-10">请选择进程或连接远程进程</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 进程连接对话框 -->
    <ProcessConnectDialog
      v-model:open="showProcessConnectDialog"
      @process-connected="handleProcessConnected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProcessStore } from '@/stores/process'
import { useTabsStore } from '@/stores/tabs'
import type { JavaProcessListDetail } from '@/types'
import { Button } from '@/components/ui'
import MobileNav from '@/components/MobileNav.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ProcessConnectDialog from '@/components/ProcessConnectDialog.vue'
import {
  RefreshCw,
  Monitor,
  Plug
} from 'lucide-vue-next'
import { routes } from '@/router'
import type { RouteRecordRaw } from '@/router'
import { Badge } from '@/components/ui/badge'

const router = useRouter()
const route = useRoute()
const processStore = useProcessStore()
const tabsStore = useTabsStore()
const isRefreshing = ref(false)
const showProcessConnectDialog = ref(false)

// 主要导航项目（显示在 header 中）
const mainNavigationItems = computed(() => {
  return routes
    .filter((route: RouteRecordRaw) => route.meta?.show !== false && route.path !== '/')
    .map((route: RouteRecordRaw) => ({
      path: route.path,
      title: route.meta?.title || '',
      icon: route.meta?.icon || null
    }))
    .filter(item => item.title && item.path)
})

// 扁平化的导航项目，用于搜索
const flatNavigationItems = computed(() => {
  const items: any[] = []
  routes.forEach((route: RouteRecordRaw) => {
    if (route.meta?.show !== false && route.path !== '/') {
      items.push({
        name: route.meta?.title,
        path: route.path
      })
      if (route.children) {
        route.children.forEach(child => {
          if (child.meta?.show !== false) {
            items.push({
              name: child.meta?.title,
              path: child.path.startsWith('/') 
                ? child.path 
                : child.path === '' 
                  ? route.path 
                  : `${route.path}/${child.path}`
            })
          }
        })
      }
    }
  })
  return items
})

// 检查路由是否激活
function isRouteActive(path: string) {
  if (route.path === path) return true
  // 检查是否是子路由
  return route.path.startsWith(path + '/')
}

// 本地进程列表
const localProcesses = computed(() => {
  return processStore.processes.filter(p => !(p as any).isRemote)
})

// 远程进程列表
const remoteProcesses = computed(() => {
  return processStore.processes.filter(p => (p as any).isRemote)
})

// 检查进程是否处于激活状态
function isProcessActive(process: JavaProcessListDetail) {
  if (!tabsStore.activeTab) return false
  const isRemote = (process as any).isRemote || false
  return tabsStore.activeTab.pid === process.pid.toString() && tabsStore.activeTab.isRemote === isRemote
}

// 选择进程 - 添加tab而不是跳转
async function selectProcess(process: JavaProcessListDetail) {
  const isRemote = (process as any).isRemote || false
  
  // 添加或切换到对应的tab
  tabsStore.addTab(process)
  
  // 设置远程连接状态
  processStore.setRemoteConnection(isRemote)
  
  // 获取进程详情
  if (isRemote) {
    await processStore.getRemoteOverview(process.pid)
  } else {
    await processStore.getLocalOverview(process.pid)
  }
  // 导航到概览页面（用于RouterView）
  router.push({
    path: '/dashboard',
    query: {
      pid: process.pid,
      remote: isRemote.toString()
    }
  })
}

// 切换到指定tab
async function switchToTab(tabId: string) {
  const tab = tabsStore.tabs.find(t => t.id === tabId)
  if (!tab) return
  
  // 如果已经是活动tab，不需要重复切换
  if (tabsStore.activeTabId === tabId) return
  
  // 设置活动tab（这会触发watch来更新URL和加载数据）
  tabsStore.setActiveTab(tabId)
}

// 关闭tab
function closeTab(tabId: string) {
  const wasActive = tabsStore.activeTabId === tabId
  tabsStore.closeTab(tabId)
  
  // 如果关闭的是活动tab，切换到新的活动tab
  if (wasActive && tabsStore.activeTab) {
    switchToTab(tabsStore.activeTab.id)
  } else if (!tabsStore.hasTabs) {
    // 如果没有tab了，导航到默认页面
    router.push('/dashboard')
  }
}

// 刷新所有进程
async function refreshAllProcesses() {
  isRefreshing.value = true
  try {
    await processStore.getAllProcesses()
  } finally {
    isRefreshing.value = false
  }
}

function openProcessConnectDialog() {
  showProcessConnectDialog.value = true
}

async function handleProcessConnected(pid: string) {
  console.log('进程连接成功:', pid)
  
  // 刷新进程列表
  await refreshAllProcesses()
  
  // 查找对应的进程并添加tab
  const process = processStore.processes.find(p => p.pid === pid)
  if (process) {
    await selectProcess(process)
  } else {
    // 如果找不到，直接导航到dashboard
    router.push({
      path: '/dashboard',
      query: {
        pid,
        remote: processStore.isRemoteConnection.toString()
      }
    })
  }
}

// 监听活动tab变化，更新路由和加载进程数据
watch(() => tabsStore.activeTabId, async (newTabId, oldTabId) => {
  if (newTabId && newTabId !== oldTabId) {
    const newTab = tabsStore.activeTab
    if (!newTab) return
    
    // 立即更新URL（同步更新，不等待数据加载）
    const targetQuery = {
      pid: newTab.pid,
      remote: newTab.isRemote.toString()
    }
    
    // 检查当前URL是否已经匹配，避免不必要的导航
    const currentRoute = router.currentRoute.value
    const currentPid = currentRoute.query.pid?.toString()
    const currentRemote = currentRoute.query.remote?.toString()
    
    if (currentPid !== newTab.pid || currentRemote !== newTab.isRemote.toString()) {
      router.push({
        path: '/dashboard',
        query: targetQuery
      })
    }
    
    // 设置远程连接状态
    processStore.setRemoteConnection(newTab.isRemote)
    
    // 加载进程详情
    if (newTab.isRemote) {
      await processStore.getRemoteOverview(newTab.pid)
    } else {
      await processStore.getLocalOverview(newTab.pid)
    }
  }
}, { immediate: false })

// 组件挂载时：获取所有进程（本地+远程）
onMounted(() => {
  refreshAllProcesses()
})
</script>

<style scoped>
/* 侧边栏固定定位和动画效果 */
.sidebar-fixed {
  animation: slideInFromLeft 0.4s ease-out;
  will-change: transform;
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 确保侧边栏在滚动时保持固定 */
@media (min-width: 1024px) {
  .sidebar-fixed {
    position: fixed;
  }
}
</style>
