<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">VisualVM 监控客户端</h1>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">系统运行中</span>
            </div>
            
            <button 
              @click="refreshData"
              :disabled="isRefreshing"
              class="btn btn-secondary text-sm"
            >
              <svg v-if="isRefreshing" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isRefreshing ? '刷新中...' : '刷新数据' }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- 侧边栏 -->
      <aside class="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
        <nav class="mt-5 px-2">
          <div class="space-y-1">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.path"
              :class="[
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                $route.path === item.path
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <component :is="item.icon" class="mr-3 h-5 w-5" />
              {{ item.name }}
            </RouterLink>
          </div>
        </nav>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProcessStore } from '@/stores/process'

const router = useRouter()
const processStore = useProcessStore()

const isRefreshing = ref(false)

const navigationItems = [
  {
    name: '仪表板',
    path: '/dashboard',
    icon: 'DashboardIcon'
  },
  {
    name: 'Java进程监控',
    path: '/processes',
    icon: 'ProcessIcon'
  },
  {
    name: '数据库调用分析',
    path: '/database',
    icon: 'DatabaseIcon'
  },
  {
    name: 'RMI分析',
    path: '/rmi',
    icon: 'RMIIcon'
  },
  {
    name: '内存泄漏分析',
    path: '/memory',
    icon: 'MemoryIcon'
  },
  {
    name: '多线程分析',
    path: '/threads',
    icon: 'ThreadIcon'
  },
  {
    name: '进程管理',
    path: '/manager',
    icon: 'ManagerIcon'
  },
  {
    name: 'shadcn-vue 演示',
    path: '/shadcn-demo',
    icon: 'ShadcnIcon'
  }
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

// 组件挂载时自动刷新数据
processStore.fetchProcesses()
</script>

<style scoped>
/* 自定义图标样式 */
.DashboardIcon {
  @apply w-5 h-5;
}

.ProcessIcon {
  @apply w-5 h-5;
}

.DatabaseIcon {
  @apply w-5 h-5;
}

.RMIIcon {
  @apply w-5 h-5;
}

.MemoryIcon {
  @apply w-5 h-5;
}

.ThreadIcon {
  @apply w-5 h-5;
}

.ManagerIcon {
  @apply w-5 h-5;
}

.ShadcnIcon {
  @apply w-5 h-5;
}
</style>
