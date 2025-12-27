<template>
  <div class="min-h-screen bg-background">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="w-full px-5 flex h-14 items-center">
        <!-- Logo 区域 -->
        <div class="mr-4 flex">
          <RouterLink to="/dashboard" class="mr-6 flex items-center space-x-2">
            <div class="h-8 w-8 rounded-lg flex items-center justify-center">
              <img src="/icon.png" alt="logo" class="h-8 w-8" />
            </div>
            <span class="font-bold sm:inline-block">优速YouSpeed</span>
          </RouterLink>
        </div>

        <!-- 搜索栏 -->
        <div class="hidden md:block">
          <SearchBar :navigation-items="flatNavigationItems" />
        </div>

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
      <!-- 侧边栏 -->
      <aside
        class="sidebar-fixed hidden lg:block fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] border-r bg-muted/40 overflow-y-auto z-40"
      >
        <nav class="space-y-2">
          <div class="px-3 py-2">
            <!-- <div class="flex items-center mb-2 px-4 text-lg font-semibold tracking-tight">
              <Monitor class="mr-2 h-5 w-5" />
            </div> -->
            <div class="space-y-1">
              <!-- 渲染导航项目 -->
              <template v-for="(item, index) in navigationItems" :key="item?.name || index">
                <!-- 有子路由的父级菜单 -->
                <div v-if="item?.children && item.children.length > 0">
                  <!-- 父级菜单项 -->
                  <button
                    @click="toggleSubmenu(item.path)"
                    :class="[
                      'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
                      isParentActive(item) 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    ]"
                  >
                    <div class="flex items-center">
                      <component :is="item?.icon" class="mr-3 h-4 w-4" />
                      {{ item?.name }}
                    </div>
                    <ChevronDown 
                      :class="[
                        'h-4 w-4 transition-transform duration-200',
                        expandedMenus.includes(item.path) ? 'rotate-180' : ''
                      ]"
                    />
                  </button>
                  
                  <!-- 子菜单 -->
                  <div 
                    v-show="expandedMenus.includes(item.path)"
                    class="ml-6 mt-1 space-y-1"
                  >
                    <RouterLink
                      v-for="child in item.children"
                      :key="child.name"
                      :to="child.path"
                      :class="[
                        'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                        $route.path === child.path
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      ]"
                    >
                      <component :is="child.icon" class="mr-3 h-4 w-4" />
                      {{ child.name }}
                    </RouterLink>
                  </div>
                </div>
                
                <!-- 没有子路由的普通菜单项 -->
                <RouterLink
                  v-else
                  :to="item?.path || ''"
                  :class="[
                    'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                    $route.path === item?.path
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  ]"
                >
                  <component :is="item?.icon" class="mr-3 h-4 w-4" />
                  {{ item?.name }}
                </RouterLink>
              </template>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 p-2 lg:ml-64 transition-all duration-300">
        <!-- <Breadcrumb /> -->
        <slot />
      </main>
    </div>

    <!-- 进程连接对话框 -->
    <ProcessConnectDialog
      v-model:open="showProcessConnectDialog"
      @process-connected="handleProcessConnected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProcessStore } from '@/stores/process'
import type { JavaProcessListDetail } from '@/types'
import { Button } from '@/components/ui'
import MobileNav from '@/components/MobileNav.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import SearchBar from '@/components/SearchBar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ProcessConnectDialog from '@/components/ProcessConnectDialog.vue'
import {
  LayoutDashboard,
  Database,
  MemoryStick,
  GitBranch,
  RefreshCw,
  Monitor,
  Plug,
  ChevronDown
} from 'lucide-vue-next'
import { routes } from '@/router'
import type { RouteRecordRaw } from '@/router'

const router = useRouter()
const route = useRoute()
const processStore = useProcessStore()
const isRefreshing = ref(false)
const showProcessConnectDialog = ref(false)
const expandedMenus = ref<string[]>([])

// 构建导航项目，支持两级路由
const navigationItems = computed(() => {
  return routes.map((route: RouteRecordRaw) => {
    if (route.meta?.show !== false && route.path !== '/') {
      const item = {
        name: route.meta?.title,
        path: route.path,
        icon: route.meta?.icon,
        show: route.meta?.show,
        children: [] as any[]
      }
      
      // 处理子路由
      if (route.children && route.children.length > 0) {
        item.children = route.children
          .filter(child => child.meta?.show !== false)
          .map(child => ({
            name: child.meta?.title,
            path: child.path.startsWith('/') 
              ? child.path 
              : child.path === '' 
                ? route.path 
                : `${route.path}/${child.path}`,
            icon: child.meta?.icon,
            show: child.meta?.show
          }))
      }
      
      return item
    }
    return null
  }).filter(Boolean)
})

// 扁平化的导航项目，用于搜索
const flatNavigationItems = computed(() => {
  const items: any[] = []
  navigationItems.value.forEach(item => {
    if (item) {
      items.push(item)
      if (item.children && item.children.length > 0) {
        items.push(...item.children)
      }
    }
  })
  return items
})

// 切换子菜单展开/收起
function toggleSubmenu(path: string) {
  const index = expandedMenus.value.indexOf(path)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(path)
  }
}

// 检查父级菜单是否处于激活状态
function isParentActive(item: any) {
  if (!item.children || item.children.length === 0) return false
  return item.children.some((child: any) => route.path === child.path)
}

// 初始化时展开所有有子菜单的父级菜单
function initializeExpandedMenus() {
  navigationItems.value.forEach(item => {
    if (item && item.children && item.children.length > 0) {
      if (!expandedMenus.value.includes(item.path)) {
        expandedMenus.value.push(item.path)
      }
    }
  })
}

// 监听路由变化，自动展开包含当前路由的父级菜单
watch(() => route.path, (newPath) => {
  navigationItems.value.forEach(item => {
    if (item && item.children && item.children.length > 0) {
      const hasActiveChild = item.children.some((child: any) => newPath === child.path)
      if (hasActiveChild && !expandedMenus.value.includes(item.path)) {
        expandedMenus.value.push(item.path)
      }
    }
  })
}, { immediate: true })

// 监听导航项变化，初始化展开状态
watch(navigationItems, () => {
  initializeExpandedMenus()
}, { immediate: true })

console.log(navigationItems.value, routes)

async function refreshData() {
  isRefreshing.value = true
  try {
    await processStore.getFilteredProcesses() 
    // 可以在这里添加其他数据的刷新
  } finally {
    isRefreshing.value = false
  }
}

function openProcessConnectDialog() {
  showProcessConnectDialog.value = true
}

function handleProcessConnected(pid: string) {
  console.log('进程连接成功:', pid)
  // 注意：getLocalOverview 已经在 ProcessConnectDialog 中调用，这里不需要重复调用
  // 刷新进程列表
  // 可以导航到进程监控页面
  router.push(`/dashboard`)
}

// 组件挂载时：使用本地模拟流每300ms更新
processStore.getFilteredProcesses()
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
