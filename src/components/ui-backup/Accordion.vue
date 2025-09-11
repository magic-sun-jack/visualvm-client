<template>
  <div :class="cn('w-full', $attrs.class)" v-bind="$attrs">
    <div
      v-for="item in items"
      :key="item.value"
      class="border-b border-border last:border-b-0"
    >
      <button
        :class="cn(
          'flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:text-foreground [&[data-state=open]>svg]:rotate-180',
          $attrs.class
        )"
        @click="toggleItem(item.value)"
      >
        {{ item.label }}
        <svg
          class="h-4 w-4 shrink-0 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        v-show="openItems.includes(item.value)"
        class="overflow-hidden text-sm transition-all"
      >
        <div class="pb-4 pt-0">
          <slot :name="item.value" :item="item">
            {{ item.content }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ref, watch } from 'vue'

interface AccordionItem {
  value: string
  label: string
  content?: string
}

interface AccordionProps {
  items: AccordionItem[]
  multiple?: boolean
  defaultValue?: string | string[]
}

const props = withDefaults(defineProps<AccordionProps>(), {
  multiple: false,
  defaultValue: ''
})

const openItems = ref<string[]>(
  Array.isArray(props.defaultValue) ? props.defaultValue : props.defaultValue ? [props.defaultValue] : []
)

const toggleItem = (value: string) => {
  if (props.multiple) {
    const index = openItems.value.indexOf(value)
    if (index > -1) {
      openItems.value.splice(index, 1)
    } else {
      openItems.value.push(value)
    }
  } else {
    openItems.value = openItems.value.includes(value) ? [] : [value]
  }
}
</script>
