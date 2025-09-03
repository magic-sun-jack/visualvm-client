<template>
  <div :class="cn('grid gap-2', $attrs.class)" v-bind="$attrs">
    <div
      v-for="option in options"
      :key="option.value"
      class="flex items-center space-x-2"
    >
      <input
        :id="`${name}-${option.value}`"
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :class="cn(
          'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          $attrs.class
        )"
        @change="$emit('update:modelValue', option.value)"
      />
      <label
        :for="`${name}-${option.value}`"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {{ option.label }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface RadioOption {
  value: string | number
  label: string
}

interface RadioGroupProps {
  modelValue?: string | number
  options: RadioOption[]
  name: string
}

defineProps<RadioGroupProps>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>
