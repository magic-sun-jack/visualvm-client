<template>
  <div class="relative">
    <select
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :disabled="disabled"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <slot />
    </select>
    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg class="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface SelectProps {
  modelValue?: string | number
  placeholder?: string
  className?: string
  disabled?: boolean
}

withDefaults(defineProps<SelectProps>(), {
  modelValue: '',
  placeholder: '请选择...',
  className: '',
  disabled: false
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>
