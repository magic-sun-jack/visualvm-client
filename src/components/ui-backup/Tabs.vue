<template>
  <div :class="cn('w-full', $attrs.class)" v-bind="$attrs">
    <div class="border-b border-border">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="cn(
            'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors',
            activeTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
          )"
          @click="$emit('update:activeTab', tab.value)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>
    <div class="mt-4">
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Tab {
  value: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
}

defineProps<TabsProps>()

defineEmits<{
  'update:activeTab': [value: string]
}>()
</script>
