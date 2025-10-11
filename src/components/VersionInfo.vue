<template>
  <div class="version-info">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="sm" class="h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
          <Info class="w-3 h-3 mr-1" />
          v{{ buildInfo.version }}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" class="max-w-xs">
        <div class="space-y-2 text-xs">
          <div class="font-semibold">构建信息</div>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-muted-foreground">版本:</span>
              <span class="font-mono">{{ buildInfo.version }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">构建时间:</span>
              <span class="font-mono">{{ formatBuildTime(buildInfo.buildTime) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Git 提交:</span>
              <span class="font-mono">{{ buildInfo.git.commitHash }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">构建编号:</span>
              <span class="font-mono">#{{ buildInfo.buildNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">分支:</span>
              <span class="font-mono">{{ buildInfo.git.branch }}</span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-vue-next'
import { buildInfo } from '@/config/build-info'

function formatBuildTime(buildTime: string): string {
  const date = new Date(buildTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.version-info {
  @apply inline-flex items-center;
}
</style>
