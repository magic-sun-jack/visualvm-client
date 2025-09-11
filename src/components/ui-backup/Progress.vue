<template>
  <div :class="cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', $attrs.class)" v-bind="$attrs">
    <div
      :class="cn('h-full w-full flex-1 bg-primary transition-all', $attrs.class)"
      :style="{ transform: `translateX(-${100 - (value || 0)}%)` }"
    />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface ProgressProps {
  value?: number
  max?: number
}

defineProps<ProgressProps>()
</script>
