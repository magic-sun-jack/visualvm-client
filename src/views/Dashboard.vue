<template>
  <div class="p-4 md:p-6 space-y-4 md:space-y-6 bg-background min-h-full">
    <!-- 顶部标题栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-xl font-semibold">概述</h1>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <Checkbox 
            v-model="savedDataEnabled"
            id="saved-data"
          />
          <label for="saved-data" class="flex items-center gap-2 cursor-pointer">
            <CheckSquare class="w-4 h-4 text-blue-500" />
            <span>保存的数据</span>
          </label>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <Checkbox 
            v-model="detailInfoEnabled"
            id="detail-info"
          />
          <label for="detail-info" class="flex items-center gap-2 cursor-pointer">
            <FileText class="w-4 h-4 text-blue-500" />
            <span>详细信息</span>
          </label>
        </div>
      </div>
    </div>
    <Card>
      <CardContent class="p-6">

        <!-- 错误信息显示 -->
        <Alert v-if="errorMessage" variant="destructive" class="mb-4">
          <AlertDescription class="flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ errorMessage }}
          </AlertDescription>
        </Alert>

        <!-- 进程信息表格 -->
        <div class="space-y-4">
          <!-- PID 选择器 -->
          <!-- <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-2">
            <div class="sm:col-span-2 text-sm font-medium">PID</div>
            <div class="sm:col-span-6 flex items-center gap-2">
              <Select 
                v-model="selectedPid" 
                @update:model-value="handlePidChange"
                :disabled="availableProcesses.length === 0"
              >
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="availableProcesses.length === 0 ? '暂无可用进程' : '选择进程'" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="process in availableProcesses" 
                    :key="process.pid" 
                    :value="process.pid.toString()"
                  >
                    {{ process.pid }} - {{ process.displayName || process.ip || '未知进程' }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" @click="refreshProcesses" :disabled="isRefreshing">
                <RefreshCw :class="['w-4 h-4', { 'animate-spin': isRefreshing }]" />
              </Button>
            </div>
          </div> -->

          <!-- 进程信息表格 -->
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[200px]">属性</TableHead>
                <TableHead>值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium">PID</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, String(currentProcess?.pid || '-'))">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ currentProcess?.pid || '-' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(currentProcess?.pid || '-') }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(String(currentProcess?.pid || '-'))"
                    >
                      <component :is="copiedText === String(currentProcess?.pid || '-') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">主机</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, String(currentProcess?.host_ip || '本地'))">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ currentProcess?.host_ip || '本地' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(currentProcess?.host_ip || '本地') }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(String(currentProcess?.host_ip || '本地'))"
                    >
                      <component :is="copiedText === String(currentProcess?.host_ip || '本地') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">主类</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, String(currentProcess?.main_class?.split(' ')[0] || '-'))">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ currentProcess?.main_class?.split(' ')[0] || '-' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(currentProcess?.main_class?.split(' ')[0] || '-') }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(String(currentProcess?.main_class?.split(' ')[0] || '-'))"
                    >
                      <component :is="copiedText === String(currentProcess?.main_class?.split(' ')[0] || '-') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">参数</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, formatArguments((currentProcess?.main_class?.split(' ').slice(1)) ?? []) || '-')">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ formatArguments((currentProcess?.main_class?.split(' ').slice(1)) ?? []) || '-' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ formatArguments((currentProcess?.main_class?.split(' ').slice(1)) ?? []) || '-' }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(formatArguments((currentProcess?.main_class?.split(' ').slice(1)) ?? []) || '-')"
                    >
                      <component :is="copiedText === (formatArguments((currentProcess?.main_class?.split(' ').slice(1)) ?? []) || '-') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">JVM</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, String(currentProcess?.jvm_name || '-'))">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ currentProcess?.jvm_name || '-' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(currentProcess?.jvm_name || '-') }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(String(currentProcess?.jvm_name || '-'))"
                    >
                      <component :is="copiedText === String(currentProcess?.jvm_name || '-') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Java版本</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, String(currentProcess?.java_version || '-'))">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ currentProcess?.java_version || '-' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(currentProcess?.java_version || '-') }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(String(currentProcess?.java_version || '-'))"
                    >
                      <component :is="copiedText === String(currentProcess?.java_version || '-') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">Java Home目录</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, String(currentProcess?.java_home || '-'))">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ currentProcess?.java_home || '-' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(currentProcess?.java_home || '-') }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(String(currentProcess?.java_home || '-'))"
                    >
                      <component :is="copiedText === String(currentProcess?.java_home || '-') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">JVM标志？？</TableCell>
                <TableCell class="text-muted-foreground">
                  <div class="group relative pr-8" @dblclick="handleDblclickCopy($event, formatArguments(currentProcess?.jvm_args) || '-')">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div class="max-w-full break-all overflow-hidden line-clamp-2">
                            {{ formatArguments(currentProcess?.jvm_args) || '-' }}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ formatArguments(currentProcess?.jvm_args) || '-' }}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      :aria-label="'复制'"
                      @click.stop="copyText(formatArguments(currentProcess?.jvm_args) || '-')"
                    >
                      <component :is="copiedText === (formatArguments(currentProcess?.jvm_args) || '-') ? Check : Copy" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 底部双面板区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
      <!-- 左侧保存的数据面板 -->
      <div v-if="savedDataEnabled" class="xl:col-span-4">
        <Card class="h-fit">
          <CardHeader>
            <CardTitle class="text-base">保存的数据</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3" v-loading="saveDataLoading">
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">线程Dump</span>
              <Badge variant="secondary">
                {{ statistics.threadDumps > 0 ? statistics.threadDumps : '0' }}
              </Badge>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">堆Dump</span>
              <Badge variant="secondary">
                {{ statistics.heapDumps > 0 ? statistics.heapDumps : '0' }}
              </Badge>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm">PreFilter快照</span>
              <Badge variant="secondary">
                {{ statistics.profilerSnapshots > 0 ? statistics.profilerSnapshots : '0' }}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 右侧标签页区域 -->
      <div v-if="detailInfoEnabled" :class="savedDataEnabled ? 'xl:col-span-8' : 'xl:col-span-12'">
        <Card class="h-fit">
          <CardContent class="p-0">
            <Tabs v-model="activeTab" class="w-full">
              <TabsList class="w-full justify-start rounded-none border-b bg-muted/30">
                <TabsTrigger value="jvm-arguments">JVM参数</TabsTrigger>
                <TabsTrigger value="system-properties">系统属性</TabsTrigger>
              </TabsList>

              <!-- JVM参数标签页 -->
              <TabsContent value="jvm-arguments" class="p-4">
                <div class="space-y-2">
                  <!-- 加载状态 -->
                  <div v-if="isLoadingJvmArgs" class="space-y-2 py-4">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      正在加载JVM参数...
                    </div>
                    <Skeleton class="h-8 w-full" />
                    <Skeleton class="h-8 w-full" />
                    <Skeleton class="h-8 w-3/4" />
                  </div>
                  <!-- 无数据状态 -->
                  <div v-else-if="jvmArguments?.length === 0" class="text-muted-foreground text-center py-8">
                    没有可用的JVM参数信息
                  </div>
                  <!-- 数据显示 -->
                  <div v-else class="space-y-2">
                    <div 
                      v-for="(arg, index) in jvmArguments" 
                      :key="index" 
                      class="group relative p-2 pr-10 bg-muted/50 rounded text-sm font-mono"
                      @dblclick="handleDblclickCopy($event, String(arg))"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <div class="max-w-full break-all overflow-hidden line-clamp-2">
                              {{ arg }}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(arg) }}</div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        :aria-label="'复制'"
                        @click.stop="copyText(String(arg))"
                      >
                        <component :is="copiedText === String(arg) ? Check : Copy" class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <!-- 系统属性标签页 -->
              <TabsContent value="system-properties" class="p-4">
                <div class="space-y-1 max-h-[600px] overflow-y-auto">
                  <!-- 加载状态 -->
                  <div v-if="isLoadingSysProps" class="space-y-2 py-4">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      正在加载系统属性...
                    </div>
                    <div class="space-y-2">
                      <Skeleton class="h-6 w-full" />
                      <Skeleton class="h-6 w-full" />
                      <Skeleton class="h-6 w-5/6" />
                      <Skeleton class="h-6 w-4/5" />
                    </div>
                  </div>
                  <!-- 无数据状态 -->
                  <div v-else-if="!systemProperties" class="text-muted-foreground text-center py-8">
                    没有可用的系统属性信息
                  </div>
                  <!-- 数据显示 -->
                  <div v-else class="space-y-1">
                    <div 
                      v-for="property in Object.keys(systemProperties).sort((a, b) => a.localeCompare(b))" 
                      :key="property" 
                      class="group grid grid-cols-5 gap-4 py-2 px-2 hover:bg-muted/50 rounded text-sm"
                    >
                      <div class="font-medium col-span-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <div class="max-w-full break-all overflow-hidden line-clamp-2">
                                {{ property }}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ property }}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div class="text-muted-foreground col-span-3 relative pr-8" @dblclick="handleDblclickCopy($event, String(systemProperties[property as keyof SystemPropertiesInterface]))">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <div class="max-w-full break-all overflow-hidden line-clamp-2">
                                {{ systemProperties[property as keyof SystemPropertiesInterface] }}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div class="max-w-[60vw] break-all whitespace-pre-wrap">{{ String(systemProperties[property as keyof SystemPropertiesInterface]) }}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="icon"
                          class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          :aria-label="'复制'"
                          @click.stop="copyText(String(systemProperties[property as keyof SystemPropertiesInterface]))"
                        >
                          <component :is="copiedText === String(systemProperties[property as keyof SystemPropertiesInterface]) ? Check : Copy" class="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    <!-- 监控区域 -->
    <div class="monitor-section mt-8">
      <div class="grid grid-cols-2 gap-6">
        <!-- CPU监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">CPU</div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <MemoryTrendChart :data="cpuData?.result" :field="'selfTimePercent'" :maxDataPoints="100" :updateInterval="2000" />
          </div>
          <div class="text-xs text-gray-500 mt-2">CPU usage / GC activity</div>
        </div>
        <!-- 内存监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">内存</div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <!-- <MemoryTrendChart :processes="availableProcesses" :maxDataPoints="30" :updateInterval="2000" /> -->
          </div>
          <div class="text-xs text-gray-500 mt-2">Heap / Metaspace</div>
        </div>
        <!-- 类监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">类</div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <!-- <ProcessStatusChart :processes="availableProcesses" /> -->
          </div>
          <div class="text-xs text-gray-500 mt-2">Total loaded / Shared loaded classes</div>
        </div>
        <!-- 线程监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">线程</div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <!-- <ProcessStatusChart :processes="availableProcesses" /> -->
          </div>
          <div class="text-xs text-gray-500 mt-2">Live threads / Daemon threads</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import MemoryTrendChart from '@/components/charts/MemoryTrendChart.vue'
import ProcessStatusChart from '@/components/charts/ProcessStatusChart.vue'
import { useProcessStore } from '@/stores/process'
import { cpuApi, processApi } from '@/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  CheckSquare,
  FileText,
  RefreshCw,
  Copy,
  Check
} from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { JavaProcessDetail, SystemPropertiesInterface, JavaProcessInfo } from '@/types'
import { useStatisticsStore } from '@/stores/statistics'

const processStore = useProcessStore()
const activeTab = ref('jvm-arguments')

// UI 状态
const savedDataEnabled = ref(true)
const detailInfoEnabled = ref(true)
const selectedPid = ref<string>('')
const isRefreshing = ref(false)
const isLoadingDetails = ref(false)
const isLoadingJvmArgs = ref(false)
const isLoadingSysProps = ref(false)

// 错误状态
const errorMessage = ref<string>('')

// 数据状态
const processDetails = ref<JavaProcessDetail | null>(null)
const jvmArguments = ref<JavaProcessDetail['jvm_args']>(null)
const systemProperties = ref<SystemPropertiesInterface>()

// 统计数据（Pinia）
const statisticsStore = useStatisticsStore()
const statistics = computed(() => statisticsStore.stats)

// 可用进程列表
const availableProcesses = computed(() => {
  const processes = processStore.processes
  if (processes.length > 0) {
    return processes
  }
  
  // 如果没有真实数据，返回空数组
  return []
})

// 当前进程数据
const currentProcess = computed((): JavaProcessDetail | null => {
  if (processDetails.value) {
    return processDetails.value
  }
  
  // 默认空进程数据
  return null
})

// 格式化参数
function formatArguments(args: string[] | string | null | undefined): string {
  if (!args || (Array.isArray(args) && args.length === 0)) return ''
  return typeof args === 'string' ? args : args.join(' ')
}

// 复制功能
const copiedText = ref<string>('')
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedText.value = text
    setTimeout(() => { if (copiedText.value === text) copiedText.value = '' }, 1200)
  } catch (e) {
    console.error('复制失败:', e)
  }
}

function handleDblclickCopy(e: MouseEvent, text: string) {
  const target = e.currentTarget as HTMLElement | null
  if (!target) {
    copyText(text)
    return
  }
  const range = document.createRange()
  range.selectNodeContents(target)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
  copyText(text)
}

async function getDetailInfoEnabled(pid: string) {
  if (!pid) return
  try {
    const response = await processApi.getProcessLocalOverview(pid)
    if (response.success) {
      processDetails.value = response.data
      jvmArguments.value = response.data.jvm_args
      systemProperties.value = response.data.system_properties
    } else {
      errorMessage.value = response.msg || '获取进程详情失败'
      console.error('获取进程详情失败:', response.msg)
    }
  } catch (error) {
    errorMessage.value = '获取进程详情失败'
    console.error('获取进程详情异常:', error)
  } finally {
    isLoadingDetails.value = false
  }
}

const saveDataLoading = ref(false)
const saveDataInfo = ref<JavaProcessInfo>()
// 加载进程详细信息
async function getSaveDataFn(pid: string) {
  if (!pid) return
  saveDataLoading.value = true
  errorMessage.value = ''
  await processApi.startProcess({
    pid: pid
  }).then(response => {
    saveDataInfo.value = response.data
  }).catch(error => {
    errorMessage.value = '启动进程失败'
    console.error('启动进程异常:', error)
  }).finally(() => {
    saveDataLoading.value = false
  })
}

// 模拟JVM参数数据（从进程详情中提取或使用默认值）
function setMockJvmArguments() {
  isLoadingJvmArgs.value = true
  // 模拟加载延迟
  setTimeout(() => {
    // 从当前进程详情中提取JVM参数，如果没有则使用默认值
    if (currentProcess.value?.jvm_args) {
      const args = currentProcess.value.jvm_args
      if (Array.isArray(args) && args.length > 0) {
        jvmArguments.value = args
      } else if (typeof args === 'string' && args.trim()) {
        jvmArguments.value = args.split(' ').filter(arg => arg.trim())
      } else {
        // 使用默认的JVM参数
        jvmArguments.value = [
          '-Xmx512m',
          '-Xms256m',
          '-XX:+UseG1GC',
          '-XX:+UseStringDeduplication',
          '-Djava.awt.headless=true'
        ]
      }
    } else {
      // 使用默认的JVM参数
      jvmArguments.value = [
        '-Xmx512m',
        '-Xms256m',
        '-XX:+UseG1GC',
        '-XX:+UseStringDeduplication',
        '-Djava.awt.headless=true'
      ]
    }
    isLoadingJvmArgs.value = false
  }, 500)
}

// 模拟系统属性数据（从进程详情中提取或使用默认值）
function setMockSystemProperties() {
  isLoadingSysProps.value = true
  // 模拟加载延迟
  setTimeout(() => {
    // 从当前进程详情中提取系统属性，如果没有则使用默认值
    if (currentProcess.value?.system_properties) {
      const props = currentProcess.value.system_properties
      systemProperties.value = Object.entries(props).map(([key, value]) => ({
        key,
        value: String(value)
      }))
    } else {
      // 使用默认的系统属性
      systemProperties.value = [
        { key: 'java.version', value: '11.0.27' },
        { key: 'java.vm.name', value: 'Java HotSpot(TM) 64-Bit Server VM' },
        { key: 'java.vm.version', value: '11.0.27+8-LTS-232' },
        { key: 'java.home', value: 'C:\\Program Files\\Java\\jdk-11' },
        { key: 'os.name', value: 'Windows 11' },
        { key: 'os.version', value: '10.0' },
        { key: 'os.arch', value: 'amd64' },
        { key: 'user.dir', value: 'D:\\code\\money\\visualvm-client' },
        { key: 'file.encoding', value: 'UTF-8' },
        { key: 'java.class.path', value: 'math-game.jar' }
      ]
    }
    isLoadingSysProps.value = false
  }, 500)
}

// 处理PID变化
async function handlePidChange() {
  await getSaveDataFn(selectedPid.value)
  await getDetailInfoEnabled(selectedPid.value)
  cpuStart()
  // 使用模拟数据替代不存在的API接口
  // setMockJvmArguments()
  // setMockSystemProperties()
}

// 刷新进程列表
async function refreshProcesses() {
  isRefreshing.value = true
  errorMessage.value = ''
  
  try {
    await processStore.getFilteredProcesses()
  } catch (error) {
    errorMessage.value = '刷新进程列表失败'
    console.error('刷新进程列表异常:', error)
  } finally {
    isRefreshing.value = false
  }
}

// 监听selectedPid变化
watch(selectedPid, (newPid) => {
  if (newPid) {
    handlePidChange()
  }
}, { immediate: false })

// 监听进程列表变化，自动选择第一个进程
watch(() => availableProcesses.value, (newProcesses) => {
  if (newProcesses.length > 0 && !selectedPid.value) {
    selectedPid.value = newProcesses[0].pid.toString()
  }
}, { immediate: true })

const cpuData = ref()

async function cpuStart() {
  await cpuApi.startCpuProfiling(selectedPid.value).then((response) => {
    if (response.areSuccess) {
      console.log('CPU分析启动成功:', response.data)
    } else {
      console.error('CPU分析启动失败:', response.msg)
    }
  }).catch((error) => {
    console.error('CPU分析启动异常:', error)
  })
  const es = new EventSource(`/cvm/cpu/stream?pid=${selectedPid.value}&refreshPeriod=${5000}`);
  es.onmessage = (event) => {
    // 处理 event.data
    cpuData.value = JSON.parse(event.data);
    console.log('Received CPU data:', cpuData.value);
  };
  es.onerror = (err) => {
    // 处理错误
  };
}

// 组件挂载时初始化
onMounted(async () => {
  await processStore.getFilteredProcesses()
  
  // 如果有可用进程，加载第一个进程的详细信息
  if (availableProcesses.value.length > 0) {
    selectedPid.value = availableProcesses.value[0].pid.toString()
    await handlePidChange()
  }
})
</script>
