<template>
  <div :class="cn('p-6', className)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CardContentProps {
  className?: string
}

withDefaults(defineProps<CardContentProps>(), {
  className: ''
})
</script>
