<template>
  <div class="lg:hidden">
    <!-- 汉堡菜单按钮 -->
    <Button
      variant="ghost"
      size="sm"
      @click="isOpen = !isOpen"
      class="h-8 w-8 p-0"
    >
      <Menu v-if="!isOpen" class="h-4 w-4" />
      <X v-else class="h-4 w-4" />
    </Button>

    <!-- 移动端导航菜单 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 z-50 bg-background border-b shadow-lg"
      >
        <nav class="p-4 space-y-2">
          <div class="space-y-1">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.path"
              @click="isOpen = false"
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
        </nav>
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
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        @click="isOpen = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui'
import { Menu, X } from 'lucide-vue-next'

interface NavigationItem {
  name: string
  path: string
  icon: any
}

interface Props {
  navigationItems: NavigationItem[]
}

defineProps<Props>()

const isOpen = ref(false)
const route = useRoute()

// 监听路由变化，自动关闭菜单
watch(() => route.path, () => {
  isOpen.value = false
})
</script>
