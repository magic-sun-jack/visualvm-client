<template>
  <div :class="cn('animate-pulse rounded-md bg-muted', $attrs.class)" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>
