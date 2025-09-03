<template>
  <div class="relative">
    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      v-model="searchQuery"
      placeholder="搜索页面..."
      class="pl-10 w-full lg:w-64"
      @focus="showResults = true"
      @blur="handleBlur"
    />
    
    <!-- 搜索结果 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showResults && filteredItems.length > 0"
        class="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
      >
        <div class="p-2 space-y-1">
          <RouterLink
            v-for="item in filteredItems"
            :key="item.name"
            :to="item.path"
            @click="selectItem"
            class="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <component :is="item.icon" class="mr-3 h-4 w-4" />
            {{ item.name }}
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from '@/components/ui'
import { Search } from 'lucide-vue-next'

interface NavigationItem {
  name: string
  path: string
  icon: any
}

interface Props {
  navigationItems: NavigationItem[]
}

const props = defineProps<Props>()
const router = useRouter()

const searchQuery = ref('')
const showResults = ref(false)

const filteredItems = computed(() => {
  if (!searchQuery.value) return []
  
  return props.navigationItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function selectItem() {
  searchQuery.value = ''
  showResults.value = false
}

function handleBlur() {
  // 延迟隐藏，让用户有时间点击结果
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

// 监听路由变化，清空搜索
watch(() => router.currentRoute.value.path, () => {
  searchQuery.value = ''
  showResults.value = false
})
</script>
