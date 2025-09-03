<template>
  <div :class="cn('relative flex w-full touch-none select-none items-center', $attrs.class)" v-bind="$attrs">
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :class="cn(
        'peer h-1.5 w-full cursor-pointer appearance-none rounded-lg border border-primary/20 bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        $attrs.class
      )"
      @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    />
    <div class="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-lg bg-secondary" />
    <div
      class="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-lg bg-primary"
      :style="{ width: `${((modelValue || 0) - min) / (max - min) * 100}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface SliderProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
}

withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1
})

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>
