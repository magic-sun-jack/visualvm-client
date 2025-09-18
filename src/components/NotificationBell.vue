<template>
  <div class="relative notification-bell">
    <Button
      variant="ghost"
      size="sm"
      @click.stop="toggleNotifications"
      class="h-8 w-8 p-0 relative"
      :title="`${unreadCount} 条未读通知`"
    >
      <Bell class="h-4 w-4" />
      <!-- 未读通知数量徽章 -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </Button>

    <!-- 通知面板 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showNotifications"
        class="absolute top-full right-0 mt-2 w-80 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
      >
        <div class="p-4 border-b">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">通知</h3>
            <Button
              variant="ghost"
              size="sm"
              @click.stop="markAllAsRead"
              class="h-6 px-2 text-xs"
            >
              全部标记为已读
            </Button>
          </div>
        </div>
        
        <div class="p-2 space-y-2">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'p-3 rounded-md transition-colors cursor-pointer',
              notification.read
                ? 'bg-muted/50 hover:bg-muted'
                : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950'
            ]"
            @click.stop="markAsRead(notification.id)"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <component
                  :is="notification.icon"
                  :class="[
                    'h-4 w-4',
                    notification.read ? 'text-muted-foreground' : 'text-blue-600 dark:text-blue-400'
                  ]"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground">
                  {{ notification.title }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-muted-foreground mt-2">
                  {{ formatTime(notification.timestamp) }}
                </p>
              </div>
            </div>
          </div>
          
          <div v-if="notifications.length === 0" class="text-center py-8 text-muted-foreground">
            <BellOff class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">暂无通知</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 背景遮罩 -->
    <Transition
      enter-active-class="transition-opacity ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showNotifications"
        class="fixed inset-0 z-40"
        @click="showNotifications = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui'
import {
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-vue-next'

interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
  icon: any // Added property
}

const showNotifications = ref(false)
const notifications = ref<Notification[]>([
  {
    id: '1',
    title: '系统监控',
    message: '所有监控指标运行正常',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    type: 'success',
    icon: CheckCircle
  },
  {
    id: '2',
    title: '性能警告',
    message: '内存使用率超过80%',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    type: 'warning',
    icon: AlertTriangle
  },
  {
    id: '3',
    title: '数据更新',
    message: '进程数据已成功刷新',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: true,
    type: 'info',
    icon: Info
  }
])

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

function markAsRead(id: string) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => n.read = true)
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// 点击外部关闭通知面板
function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (!target.closest('.notification-bell')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
