<template>
  <div :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', $attrs.class)" v-bind="$attrs">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
    />
    <div
      v-else
      :class="cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium',
        $attrs.class
      )"
    >
      {{ fallback }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
}

withDefaults(defineProps<AvatarProps>(), {
  fallback: '?'
})
</script>
