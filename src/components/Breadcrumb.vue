<template>
  <nav class="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
    <RouterLink to="/dashboard" class="hover:text-foreground transition-colors">
      <Home class="h-4 w-4" />
    </RouterLink>
    <ChevronRight class="h-4 w-4" />
    <span class="text-foreground font-medium">{{ currentPageTitle }}</span>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ChevronRight } from 'lucide-vue-next'

const route = useRoute()

const currentPageTitle = computed(() => {
  return route.meta.title || '页面'
})
</script>
