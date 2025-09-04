<template>
  <div class="min-h-screen bg-background">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="w-full px-5 flex h-14 items-center">
        <!-- Logo 区域 -->
        <div class="mr-4 flex">
          <RouterLink to="/dashboard" class="mr-6 flex items-center space-x-2">
            <div class="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <span class="text-primary-foreground text-sm font-bold">V</span>
            </div>
            <span class="hidden font-bold sm:inline-block">VisualVM 监控</span>
          </RouterLink>
        </div>

        <!-- 搜索栏 -->
        <div class="hidden md:block">
          <SearchBar :navigation-items="navigationItems" />
        </div>

        <!-- 右侧操作区域 -->
        <div class="ml-auto flex items-center space-x-2">
          <!-- 系统状态指示器 -->
          <div class="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted/50">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-muted-foreground">系统运行中</span>
          </div>



          <!-- 刷新按钮 -->
          <Button
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
          </Button>

          <!-- 用户菜单 -->
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
            <User class="h-4 w-4" />
          </Button>

          <!-- 主题切换 -->
          <ThemeToggle />

          <!-- 通知铃铛 -->
          <NotificationBell />

          <!-- 移动端导航菜单 -->
          <MobileNav :navigation-items="navigationItems" />
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- 侧边栏 -->
      <aside class="hidden lg:block w-64 border-r bg-muted/40 min-h-[calc(100vh-3.5rem)]">
        <nav class="space-y-2">
          <div class="px-3 py-2">
            <div class="flex items-center mb-2 px-4 text-lg font-semibold tracking-tight">
              <Monitor class="mr-2 h-5 w-5" />
              监控面板
            </div>
            <div class="space-y-1">
              <RouterLink
                v-for="item in navigationItems"
                :key="item.name"
                :to="item.path"
                :class="[
                  'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                  $route.path === item.path
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                ]"
              >
                <component :is="item.icon" class="mr-3 h-4 w-4" />
                {{ item.name }}
              </RouterLink>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 p-4 lg:p-6">
        <Breadcrumb />
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProcessStore } from '@/stores/process'
import { Button } from '@/components/ui'
import MobileNav from '@/components/MobileNav.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import SearchBar from '@/components/SearchBar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import {
  LayoutDashboard,
  Activity,
  Database,
  Network,
  MemoryStick,
  GitBranch,
  Settings,
  Eye,
  RefreshCw,
  User,
  Monitor
} from 'lucide-vue-next'

const processStore = useProcessStore()
const isRefreshing = ref(false)

const navigationItems = [
  {
    name: '仪表板',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Java进程监控',
    path: '/processes',
    icon: Activity
  },
  {
    name: '数据库调用分析',
    path: '/database',
    icon: Database
  },
  {
    name: 'RMI分析',
    path: '/rmi',
    icon: Network
  },
  {
    name: '内存泄漏分析',
    path: '/memory',
    icon: MemoryStick
  },
  {
    name: '多线程分析',
    path: '/threads',
    icon: GitBranch
  },
  {
    name: '进程管理',
    path: '/manager',
    icon: Settings
  },
  {
    name: '场景监控',
    path: '/scenario',
    icon: Eye
  },

]

async function refreshData() {
  isRefreshing.value = true
  try {
    await processStore.fetchProcesses()
    // 可以在这里添加其他数据的刷新
  } finally {
    isRefreshing.value = false
  }
}

// 组件挂载时：使用本地模拟流每300ms更新
processStore.fetchProcesses()
</script>

<style scoped>
/* 自定义图标样式 - 使用更现代的图标 */
.Dashboard{
  @apply w-4 h-4;
}

.Process{
  @apply w-4 h-4;
}

.Database{
  @apply w-4 h-4;
}

.RMI{
  @apply w-4 h-4;
}

.Memory{
  @apply w-4 h-4;
}

.Thread{
  @apply w-4 h-4;
}

.Manager{
  @apply w-4 h-4;
}

.Shadcn{
  @apply w-4 h-4;
}
</style>
