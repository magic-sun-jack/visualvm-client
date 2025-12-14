<template>
  <div class="gc-monitoring-container">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">GC监控</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">实时监控Java垃圾回收器性能和统计信息</p>
    </div>

    <!-- 连接状态指示器 -->
    <div class="mb-6">
      <ServiceLoading />
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        正在加载GC统计数据...
      </div>
    </div>

    <!-- 应用信息 -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ processStore.currentProcess?.main_class }}</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">PID: {{ processStore.currentProcess?.pid }}</p>
        </div>
        <div class="text-sm text-gray-500">
          <span>刷新率: {{ refreshRate }}ms</span>
        </div>
      </div>
    </div>

    <!-- 内存空间监控 -->
    <Card class="bg-white dark:bg-gray-800 mb-8">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">内存空间使用情况</CardTitle>
        <CardDescription>实时显示各内存区域的使用状态</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Metaspace -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Metaspace</span>
              <span class="text-xs text-gray-500">{{ formatBytes(metaspace.used) }} / {{ formatBytes(metaspace.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${metaspace.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ metaspace.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Old Generation -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Old Gen</span>
              <span class="text-xs text-gray-500">{{ formatBytes(oldGen.used) }} / {{ formatBytes(oldGen.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-green-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${oldGen.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ oldGen.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Eden Space -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Eden</span>
              <span class="text-xs text-gray-500">{{ formatBytes(eden.used) }} / {{ formatBytes(eden.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${eden.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ eden.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Survivor 0 -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">S0</span>
              <span class="text-xs text-gray-500">{{ formatBytes(survivor0.used) }} / {{ formatBytes(survivor0.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${survivor0.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ survivor0.percentage.toFixed(1) }}%</div>
          </div>

          <!-- Survivor 1 -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">S1</span>
              <span class="text-xs text-gray-500">{{ formatBytes(survivor1.used) }} / {{ formatBytes(survivor1.max) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${survivor1.percentage}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">{{ survivor1.percentage.toFixed(1) }}%</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- GC概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- 编译时间统计 -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">编译时间</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {{ gcStatsData?.compileTime.totalCompilationTime || 0 }}
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">编译器:</span>
            <span class="text-xs text-gray-700 dark:text-gray-300 font-mono">{{ gcStatsData?.compileTime.name || '-' }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- 类加载器统计 -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">类加载器</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="space-y-1">
              <div class="text-gray-500 dark:text-gray-400 font-medium">已加载</div>
              <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ gcStatsData?.classLoaderTime.loadedClassCount || 0 }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-gray-500 dark:text-gray-400 font-medium">已卸载</div>
              <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ gcStatsData?.classLoaderTime.unloadedClassCount || 0 }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-gray-500 dark:text-gray-400 font-medium">总计</div>
              <div class="text-gray-900 dark:text-gray-100 font-semibold">{{ gcStatsData?.classLoaderTime.totalLoadedClassCount || 0 }}</div>
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">总耗时</div>
            <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ formatTime(gcStatsData?.classLoaderTime.classLoaderTotalTimeMs, true) }}
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- GC统计 -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">GC统计</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">总次数</div>
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {{ gcStats.totalCollections }}
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">GC名称</div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ gcStats.name || '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">总耗时</div>
              <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatTime(gcStats.totalTime) }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Eden空间 -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Eden空间</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">已使用</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatBytes(gcStatsData?.memorySpaces.eden.used) }}
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">已提交</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.eden.committed) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">最大值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.eden.max) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">初始值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.eden.init) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Survivor0空间 -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Survivor0空间</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">已使用</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatBytes(gcStatsData?.memorySpaces.survivor0.used) }}
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">已提交</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.survivor0.committed) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">最大值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.survivor0.max) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">初始值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.survivor0.init) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Survivor1空间 -->
      <!-- <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Survivor1空间</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">已使用</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatBytes(gcStatsData?.memorySpaces.survivor1?.used || 0) }}
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">已提交</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.survivor1?.committed || 0) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">最大值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.survivor1?.max || 0) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">初始值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.survivor1?.init || 0) }}</span>
            </div>
          </div>
        </CardContent>
      </Card> -->

      <!-- Old空间 -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Old空间</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">已使用</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatBytes(gcStatsData?.memorySpaces.old.used) }}
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">已提交</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.old.committed) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">最大值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.old.max) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">初始值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.old.init) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Metaspace空间 -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Metaspace空间</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">已使用</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatBytes(gcStatsData?.memorySpaces.metaspace.used) }}
            </div>
          </div>
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">已提交</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.metaspace.committed) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">最大值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.metaspace.max) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500 dark:text-gray-400">初始值</span>
              <span class="text-gray-700 dark:text-gray-300 font-mono">{{ formatBytes(gcStatsData?.memorySpaces.metaspace.init) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 对象年龄直方图 -->
    <Card class="bg-white dark:bg-gray-800 mb-8 hidden">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">对象年龄直方图</CardTitle>
        <CardDescription>显示对象在survivor空间中的年龄分布</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- 参数信息 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">Tenuring Threshold:</span>
              <span class="font-mono ml-2">{{ histogramParams.tenuringThreshold }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Max Tenuring Threshold:</span>
              <span class="font-mono ml-2">{{ histogramParams.maxTenuringThreshold }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Desired Survivor Size:</span>
              <span class="font-mono ml-2">{{ formatBytes(histogramParams.desiredSurvivorSize) }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Current Survivor Size:</span>
              <span class="font-mono ml-2">{{ formatBytes(histogramParams.currentSurvivorSize) }}</span>
            </div>
          </div>
          
          <!-- 直方图 -->
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Histogram (0-15):</div>
            <div class="grid grid-cols-8 gap-2">
              <div v-for="(age, index) in objectAgeHistogram" :key="index" class="space-y-1">
                <div class="text-xs text-center text-gray-600 dark:text-gray-400">{{ index }}</div>
                <div class="w-full bg-gray-200 rounded h-20 flex items-end">
                  <div 
                    class="w-full bg-orange-500 rounded transition-all duration-300"
                    :style="{ height: `${age}%` }"
                  ></div>
                </div>
                <div class="text-xs text-center text-gray-500">{{ age.toFixed(0) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- GC类型统计和内存回收效率 -->
    <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card class="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">GC类型统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="gcType in gcTypes" :key="gcType.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div 
                  class="w-3 h-3 rounded-full" 
                  :style="{ backgroundColor: gcType.color }"
                ></div>
                <span class="text-sm font-medium">{{ gcType.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold">{{ gcType.count }}</div>
                <div class="text-xs text-gray-500">{{ gcType.percentage }}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle class="text-lg font-semibold">内存回收效率</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm">堆内存使用</span>
              <span class="text-sm font-bold text-green-600">
                {{ formatBytes(gcStatsData?.heapOverview.heapUsed || 0) }} / {{ formatBytes(gcStatsData?.heapOverview.heapMax || 0) }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-300"
                :style="{ 
                  width: gcStatsData?.heapOverview.heapMax 
                    ? `${((gcStatsData.heapOverview.heapUsed / gcStatsData.heapOverview.heapMax) * 100)}%` 
                    : '0%' 
                }"
              ></div>
            </div>
            <div class="text-xs text-gray-500">
              非堆内存: {{ formatBytes(gcStatsData?.heapOverview.nonHeapUsed || 0) }} / {{ formatBytes(gcStatsData?.heapOverview.nonHeapMax || 0) }}
            </div>
          </div>
        </CardContent>
      </Card>
    </div> -->

    <!-- GC时间趋势图 -->
    <!-- <Card class="bg-white dark:bg-gray-800 mb-8">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">GC时间趋势</CardTitle>
        <CardDescription>最近30分钟的GC执行时间变化</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="h-80">
          <GCTrendChart :data="gcTrendData" />
        </div>
      </CardContent>
    </Card> -->

    <!-- GC详细信息表格 -->
    <!-- <Card class="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">GC详细信息</CardTitle>
        <CardDescription>最近的GC事件记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>GC类型</TableHead>
                <TableHead>持续时间</TableHead>
                <TableHead>回收前内存</TableHead>
                <TableHead>回收后内存</TableHead>
                <TableHead>回收量</TableHead>
                <TableHead>原因</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="record in gcRecords" :key="record.id">
                <TableCell class="font-mono text-sm">{{ formatDateTime(record.timestamp) }}</TableCell>
                <TableCell>
                  <Badge :variant="getGCTypeVariant(record.type)">
                    {{ record.type }}
                  </Badge>
                </TableCell>
                <TableCell class="font-mono">{{ formatTime(record.duration) }}</TableCell>
                <TableCell class="font-mono">{{ formatBytes(record.beforeMemory) }}</TableCell>
                <TableCell class="font-mono">{{ formatBytes(record.afterMemory) }}</TableCell>
                <TableCell class="font-mono text-green-600">
                  {{ formatBytes(record.reclaimedMemory) }}
                </TableCell>
                <TableCell class="text-sm">{{ record.reason }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ServiceLoading from '@/components/ServiceLoading.vue'
import GCTrendChart from '@/components/charts/GCTrendChart.vue'
import { useProcessStore } from '@/stores/process'
import { gcApi } from '@/api'
import type { GCStatsInfo } from '@/types'

const processStore = useProcessStore()

// 接口定义
interface AppInfo {
  name: string
  pid: string
}

interface MemorySpace {
  used: number
  max: number
  percentage: number
}

interface GCStats {
  totalCollections: number
  totalTime: number
  averageTime: number
  frequency: number
  efficiency: number
  lastCause: string
}

interface CompileStats {
  totalCompiles: number
  totalTime: number
}

interface ClassLoaderStats {
  loaded: number
  unloaded: number
  totalTime: number
}

interface HistogramParams {
  tenuringThreshold: number
  maxTenuringThreshold: number
  desiredSurvivorSize: number
  currentSurvivorSize: number
}

interface GCType {
  name: string
  count: number
  percentage: number
  color: string
}

interface GCRecord {
  id: string
  timestamp: number
  type: string
  duration: number
  beforeMemory: number
  afterMemory: number
  reclaimedMemory: number
  reason: string
}

interface GCTrendData {
  timestamp: number
  duration: number
  type: string
}

// 响应式数据
const refreshRate = ref(useProcessStore().refreshPeriod || 5000)
const isLoading = ref(false)
const errorMessage = ref<string>('')
const gcStatsData = ref<GCStatsInfo | null>(null)

// 计算属性：内存空间数据
const metaspace = computed(() => {
  if (!gcStatsData.value) {
    return { used: 0, max: 0, percentage: 0 }
  }
  const ms = gcStatsData.value.memorySpaces.metaspace
  const percentage = ms.max > 0 ? (ms.used / ms.max) * 100 : 0
  return {
    used: ms.used,
    max: ms.max,
    percentage
  }
})

const oldGen = computed(() => {
  if (!gcStatsData.value) {
    return { used: 0, max: 0, percentage: 0 }
  }
  const old = gcStatsData.value.memorySpaces.old
  const percentage = old.max > 0 ? (old.used / old.max) * 100 : 0
  return {
    used: old.used,
    max: old.max,
    percentage
  }
})

const eden = computed(() => {
  if (!gcStatsData.value) {
    return { used: 0, max: 0, percentage: 0 }
  }
  const edenSpace = gcStatsData.value.memorySpaces.eden
  const percentage = edenSpace.max > 0 ? (edenSpace.used / edenSpace.max) * 100 : 0
  return {
    used: edenSpace.used,
    max: edenSpace.max,
    percentage
  }
})

const survivor0 = computed(() => {
  if (!gcStatsData.value) {
    return { used: 0, max: 0, percentage: 0 }
  }
  const s0 = gcStatsData.value.memorySpaces.survivor0
  const percentage = s0.max > 0 ? (s0.used / s0.max) * 100 : 0
  return {
    used: s0.used,
    max: s0.max,
    percentage
  }
})

// Survivor1 接口中没有，保留为空
const survivor1 = computed(() => ({
  used: 0,
  max: 0,
  percentage: 0
}))

// 计算属性：从接口数据中提取GC统计信息
const gcStats = computed(() => {
  if (!gcStatsData.value) {
    return {
      totalCollections: 0,
      totalTime: 0,
      averageTime: 0,
      frequency: 0,
      efficiency: 0,
      name: ''
    }
  }
  
  const collectionCount = gcStatsData.value.gcInfo.reduce((sum, item) => sum + item.collectionCount, 0)
  const totalTime = gcStatsData.value.totalGCTime
  const averageTime = collectionCount > 0 ? totalTime / collectionCount : 0
  
  return {
    totalCollections: collectionCount,
    totalTime: totalTime,
    averageTime: averageTime,
    frequency: 0, // 需要根据时间计算
    efficiency: 0, // 需要根据回收量计算
    name: gcStatsData.value.gcInfo.map(item => item.name).join(',')
  }
})

// 计算属性：编译统计
const compileStats = computed(() => {
  if (!gcStatsData.value) {
    return { totalCompiles: 0, totalTime: 0 }
  }
  return {
    totalCompiles: 0, // 接口中没有这个字段
    totalTime: gcStatsData.value.compileTime.totalCompilationTime
  }
})

// 计算属性：类加载统计（接口中没有，保留为空）
const classLoaderStats = computed(() => ({
  loaded: 0,
  unloaded: 0,
  totalTime: 0
}))

// 直方图参数（接口中没有，保留默认值）
const histogramParams = computed(() => ({
  tenuringThreshold: 15,
  maxTenuringThreshold: 15,
  desiredSurvivorSize: 0,
  currentSurvivorSize: 0
}))

const objectAgeHistogram = ref<number[]>(new Array(16).fill(0))

const gcTypes = ref<GCType[]>([
  { name: 'Young GC', count: 0, percentage: 0, color: '#3B82F6' },
  { name: 'Old GC', count: 0, percentage: 0, color: '#EF4444' },
  { name: 'Full GC', count: 0, percentage: 0, color: '#F59E0B' },
  { name: 'Mixed GC', count: 0, percentage: 0, color: '#10B981' }
])

const gcRecords = ref<GCRecord[]>([])
const gcTrendData = ref<GCTrendData[]>([])

// 工具函数
function formatTime(milliseconds?: number, isMs: boolean = false): string {
  if (!milliseconds) {
    return '0ms'
  }
  if (isMs) {
    return `${milliseconds.toFixed(1)}ms`
  }
  return `${(milliseconds / 1000).toFixed(2)}s`
}

function formatBytes(bytes?: number): string {
  if (!bytes) {
    return '0B'
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)}${units[unitIndex]}`
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getGCTypeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'Young GC':
      return 'default'
    case 'Old GC':
      return 'destructive'
    case 'Full GC':
      return 'secondary'
    case 'Mixed GC':
      return 'outline'
    default:
      return 'default'
  }
}

// 获取GC统计数据
async function getGCStatsFn() {
  const pid = processStore.currentProcess?.pid
  if (!pid) {
    errorMessage.value = '未选择进程，请先连接进程'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await gcApi.getGCStats(pid)
    if (response.areSuccess || response.success) {
      gcStatsData.value = response.data
    } else {
      errorMessage.value = response.msg || '获取GC统计数据失败'
    }
  } catch (error) {
    console.error('获取GC统计数据失败:', error)
    errorMessage.value = '获取GC统计数据失败'
  } finally {
    isLoading.value = false
  }
}

// 上个请求发完再请求下一个
let pendingGCStatsRequest = Promise.resolve()

function queueGetGCStatsFn() {
  // 保证上一个getGCStatsFn执行完再执行下一个
  pendingGCStatsRequest = pendingGCStatsRequest
    .then(() => getGCStatsFn())
    .catch(() => getGCStatsFn())
  return pendingGCStatsRequest
}

// 监听当前进程变化
watch(() => processStore.currentProcess?.pid, (newPid) => {
  if (newPid) {
    queueGetGCStatsFn()
  }
}, { immediate: true })

// 定时刷新数据
let refreshInterval: ReturnType<typeof setInterval> | null = null

// 生命周期
onMounted(() => {
  if (processStore.currentProcess?.pid) {
    queueGetGCStatsFn()
  }
  
  // 定时刷新数据，确保上一个请求完成后再发送下一个
  refreshInterval = setInterval(() => {
    if (processStore.currentProcess?.pid && !isLoading.value) {
      queueGetGCStatsFn()
    }
  }, refreshRate.value)
})

onUnmounted(() => {
  // 确保清除定时器
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})
</script>

<style scoped>
.gc-monitoring-container {
  @apply p-6 max-w-7xl mx-auto;
}
</style>
