<template>
  <div :class="cn('font-semibold leading-none tracking-tight', $attrs.class)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>
