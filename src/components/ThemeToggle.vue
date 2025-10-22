<template>
  <div class="relative">
    <!-- 主题切换按钮 -->
    <Button
      variant="ghost"
      size="sm"
      @click="toggleDropdown"
      class="h-8 w-8 p-0 relative"
      :title="`当前主题: ${currentThemeConfig.displayName}`"
    >
      <Palette class="h-4 w-4" />
      <div 
        v-if="currentThemeConfig.name !== 'default'"
        class="absolute -top-1 -right-1 w-2 h-2 rounded-full"
        :style="{ backgroundColor: getThemeColor(currentThemeConfig.colors.primary) }"
      ></div>
    </Button>

    <!-- 主题选择下拉菜单 -->
    <div
      v-if="isDropdownOpen"
      class="absolute right-0 top-10 z-50 w-80 bg-popover border border-border rounded-lg shadow-lg p-4"
    >
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground">选择主题</h3>
          <Button
            variant="ghost"
            size="sm"
            @click="isDropdownOpen = false"
            class="h-6 w-6 p-0"
          >
            <X class="h-3 w-3" />
          </Button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="theme in availableThemes"
            :key="theme.name"
            @click="selectTheme(theme.name)"
            :class="[
              'relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105',
              currentTheme === theme.name
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            ]"
          >
            <!-- 主题预览 -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium text-foreground">{{ theme.displayName }}</h4>
                <Check 
                  v-if="currentTheme === theme.name"
                  class="h-4 w-4 text-primary"
                />
              </div>
              
              <p class="text-xs text-muted-foreground">{{ theme.description }}</p>
              
              <!-- 颜色预览 -->
              <div class="flex space-x-1">
                <div 
                  class="w-4 h-4 rounded-full border border-border"
                  :style="{ backgroundColor: getThemeColor(theme.colors.primary) }"
                ></div>
                <div 
                  class="w-4 h-4 rounded-full border border-border"
                  :style="{ backgroundColor: getThemeColor(theme.colors.accent) }"
                ></div>
                <div 
                  class="w-4 h-4 rounded-full border border-border"
                  :style="{ backgroundColor: getThemeColor(theme.colors.secondary) }"
                ></div>
                <div 
                  class="w-4 h-4 rounded-full border border-border"
                  :style="{ backgroundColor: getThemeColor(theme.colors.muted) }"
                ></div>
              </div>
              
              <!-- 字体预览 -->
              <div 
                class="text-xs font-medium"
                :style="{ fontFamily: theme.fonts.sans }"
              >
                {{ theme.fonts.sans.split(',')[0] }}
              </div>
            </div>
          </div>
        </div>

        <!-- 主题信息 -->
        <div class="pt-3 border-t border-border">
          <div class="text-xs text-muted-foreground space-y-1">
            <div class="flex justify-between">
              <span>字体:</span>
              <span class="font-mono">{{ currentThemeConfig.fonts.sans.split(',')[0] }}</span>
            </div>
            <div class="flex justify-between">
              <span>圆角:</span>
              <span>{{ currentThemeConfig.borderRadius }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 点击外部关闭下拉菜单 -->
    <div
      v-if="isDropdownOpen"
      class="fixed inset-0 z-40"
      @click="isDropdownOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui'
import { Palette, X, Check } from 'lucide-vue-next'
import { useTheme } from '@/stores/theme'

const { currentTheme, currentThemeConfig, availableThemes, setTheme, initializeTheme } = useTheme()
const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function selectTheme(themeName: string) {
  setTheme(themeName)
  isDropdownOpen.value = false
}

function getThemeColor(colorValue: string): string {
  // 将 HSL 值转换为 CSS 颜色
  if (colorValue.includes(' ')) {
    return `hsl(${colorValue})`
  }
  return colorValue
}

onMounted(() => {
  initializeTheme()
})
</script>

<style scoped>
/* 自定义动画 */
.theme-preview {
  transition: all 0.2s ease-in-out;
}

.theme-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
