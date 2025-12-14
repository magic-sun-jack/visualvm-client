<script setup lang="ts">
import type { SelectRootEmits, SelectRootProps } from "reka-ui"
import { SelectRoot, useForwardPropsEmits } from "reka-ui"
import { computed, useSlots } from "vue"
import SelectTrigger from "./SelectTrigger.vue"
import SelectContent from "./SelectContent.vue"
import SelectItem from "./SelectItem.vue"
import SelectValue from "./SelectValue.vue"

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props extends SelectRootProps {
  options?: SelectOption[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: undefined,
  placeholder: "请选择"
})

const emits = defineEmits<SelectRootEmits>()
const slots = useSlots()

const delegatedProps = computed(() => {
  const { options, placeholder, ...rest } = props
  return rest
})

const forwarded = useForwardPropsEmits(delegatedProps.value, emits)

const hasOptions = computed(() => props.options && props.options.length > 0)
const hasSlot = computed(() => !!slots.default)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <SelectTrigger :class="props.class">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <template v-if="hasOptions">
        <SelectItem 
          v-for="option in options" 
          :key="String(option.value)" 
          :value="String(option.value)"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </SelectItem>
      </template>
      <template v-else>
        <slot />
      </template>
    </SelectContent>
  </SelectRoot>
</template>
