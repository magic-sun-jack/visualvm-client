<template>
  <div class="p-4 md:p-6 space-y-4 md:space-y-6 bg-background min-h-full">
    <!-- 顶部标题栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold">概述</h1>
        <VersionInfo />
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex items-center gap-2 text-sm hidden">
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
                <TableCell class="font-medium">JVM标志</TableCell>
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
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            <div v-for="flagObj in []" :key="flagObj.text" class="text-xs text-gray-500">{{ flagObj.text }}: {{ flagObj.value }}</div>
          </div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <MemoryTrendChart :data="cpuData?.result || []" :field="'totalTimeMs'" />
          </div>
          <div class="text-xs text-gray-500 mt-2">CPU使用</div>
        </div>
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">GC</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            <div v-for="flagObj in [
             ]" :key="flagObj.text" class="text-xs text-gray-500">{{ flagObj.text }}: {{ flagObj.value }}</div>
          </div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <MemoryTrendChart :data="[gcStatsData] || []" :field="'totalGCTime'" />
          </div>
          <div class="text-xs text-gray-500 mt-2">GC活动</div>
        </div>
        <!-- 内存监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">堆内存</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            <div v-for="flagObj in [{
              text: '初始大小',
              value: formatBytesToMB(saveDataInfo?.heap_memory?.init || 0)
            }, {
              text: '已使用',
              value: formatBytesToMB(saveDataInfo?.heap_memory?.used || 0)
            }, {
              text: '最大可用',
              value: formatBytesToMB(saveDataInfo?.heap_memory?.max || 0)
            }, {
              text: '承诺大小',
              value: formatBytesToMB(saveDataInfo?.heap_memory?.committed || 0)
            }]" :key="flagObj.text" class="text-xs text-gray-500">{{ flagObj.text }}: {{ flagObj.value }}</div>
          </div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <MemoryTrendChart :data="[saveDataInfo?.heap_memory] || []" :field="['init', 'max']" :unit="'MB'" :sourceUnit="'B'" />
          </div>
          <div class="text-xs text-gray-500 mt-2">堆大小 / 已使用堆</div>
        </div>
        <!-- 内存监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">元空间</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            <div v-for="flagObj in [{
              text: '初始大小',
              value: formatBytesToMB(saveDataInfo?.metaspace?.metaspace_init_bytes || 0)
            }, {
              text: '已使用',
              value: formatBytesToMB(saveDataInfo?.metaspace?.metaspace_used_bytes || 0)
            }, {
              text: '承诺大小',
              value: formatBytesToMB(saveDataInfo?.metaspace?.metaspace_committed_bytes || 0)
            }]" :key="flagObj.text" class="text-xs text-gray-500">{{ flagObj.text }}: {{ flagObj.value }}</div>
          </div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <MemoryTrendChart :data="[saveDataInfo?.metaspace] || []" :field="['metaspace_init_bytes', 'metaspace_used_bytes']" :unit="'MB'" :sourceUnit="'B'" />
          </div>
          <div class="text-xs text-gray-500 mt-2">元空间大小 / 已使用元空间</div>
        </div>
        <!-- 类监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">类</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            <div v-for="flagObj in [{
              text: '总加载',
              value: saveDataInfo?.class?.total_loaded_class_count || 0
            }, {
              text: '加载类数量',
              value: saveDataInfo?.class?.loaded_class_count || 0
            }, {
              text: '卸载类数量',
              value: saveDataInfo?.class?.unloaded_class_count || 0
            }]" :key="flagObj.text" class="text-xs text-gray-500">{{ flagObj.text }}: {{ flagObj.value }}</div>
          </div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <MemoryTrendChart :data="[saveDataInfo?.class] || []" :field="['total_loaded_class_count', 'loaded_class_count', 'unloaded_class_count']" />
          </div>
          <div class="text-xs text-gray-500 mt-2">总加载类数量 / 加载类数量 / 卸载类数量</div>
        </div>
        <!-- 线程监控卡片 -->
        <div class="bg-white rounded shadow p-4 flex flex-col">
          <div class="font-bold mb-2">线程</div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            <div v-for="flagObj in [{
              text: '活跃线程',
              value: threadData?.liveThreads || 0
            }, {
              text: '守护线程',
              value: threadData?.daemonThreads || 0
            }, {
              text: '峰值线程',
              value: threadData?.peakThreads || 0
            }, {
              text: '总启动线程',
              value: threadData?.totalStartedThreads || 0
            }]" :key="flagObj.text" class="text-xs text-gray-500">{{ flagObj.text }}: {{ flagObj.value }}</div>
          </div>
          <!-- 图表插槽 -->
          <div class="flex-1 min-h-[220px]">
            <MemoryTrendChart :data="[threadData] || []" :field="['liveThreads', 'daemonThreads']"   />
          </div>
          <div class="text-xs text-gray-500 mt-2">活跃线程 / 守护线程</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MemoryTrendChart from '@/components/charts/MemoryTrendChart.vue'
import ProcessStatusChart from '@/components/charts/ProcessStatusChart.vue'
import { useProcessStore } from '@/stores/process'
import { cpuApi, memoryApi, processApi, threadApi, gcApi } from '@/api'
import { resolveApiBaseUrl } from '@/api'
import { buildInfo } from '@/config/build-info'
import VersionInfo from '@/components/VersionInfo.vue'
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
import type { JavaProcessDetail, SystemPropertiesInterface, JavaProcessInfo, heap_memory_interface, GCStatsInfo } from '@/types'
import { useStatisticsStore } from '@/stores/statistics'
import type { ThreadStats } from '@/types'

const processStore = useProcessStore()
const activeTab = ref('jvm-arguments')

// UI 状态
const savedDataEnabled = ref(false)
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

// 当前进程数据 - 优先使用 store 中的 currentProcess，否则使用本地 processDetails
const currentProcess = computed((): JavaProcessDetail | null => {
  // 优先使用 store 中的 currentProcess
  if (processStore.currentProcess) {
    return processStore.currentProcess as JavaProcessDetail
  }
  
  // 否则使用本地 processDetails
  if (processDetails.value) {
    return processDetails.value
  }
  
  // 默认空进程数据
  return null
})

// B转MB
function formatBytesToMB(bytes: number): string {
  if (bytes === 0) return '0 MB'
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

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
  await processApi.getProcessLocalOverview(pid).then(response => {
    if (response.areSuccess) {
      processDetails.value = response.data
      jvmArguments.value = response.data.jvm_args
      systemProperties.value = response.data.system_properties
    }
  }).catch(error => {
    errorMessage.value = '获取进程详情失败'
    console.error('获取进程详情失败:', error)
  }).finally(() => {
    isLoadingDetails.value = false
  })
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
    if (response.areSuccess || response.success) {
      saveDataInfo.value = response.data
    } else {
      // errorMessage.value = response.msg || '启动进程失败'
    }
  }).catch(error => {
    // errorMessage.value = '启动进程失败'
    console.error('启动进程异常:', error)
  }).finally(() => {
    saveDataLoading.value = false
  })
}


const gcStatsData = ref<GCStatsInfo>()
async function getGCStatsFn(pid: string) {
  if (!pid) return
  await gcApi.getGCStats(pid).then(response => {
    if (response.areSuccess) {
      console.log('GC分析启动成功:', response.data)
      gcStatsData.value = response.data
    }
  })
}
// 轮询控制
const threadPollingEnabled = ref(false)
let threadPollingTimer: ReturnType<typeof setInterval> | null = null
let isThreadRequesting = ref(false)

// 队列方式执行 threadStart，确保上一个请求完成后再执行下一个
let pendingThreadRequest = Promise.resolve()

async function queueFnList() {
  if (selectedPid.value && threadPollingEnabled.value) {
    await getSaveDataFn(selectedPid.value)
    await getGCStatsFn(selectedPid.value)
  }
  await threadStart()
}
async function queueThreadStart() {
  if (isThreadRequesting.value) return pendingThreadRequest
  
  isThreadRequesting.value = true
  pendingThreadRequest = pendingThreadRequest
    .then(async () => {
      if (selectedPid.value && threadPollingEnabled.value) {
        // getSaveDataFn(selectedPid.value)
        // await threadStart()
      }
    })
    .catch(async () => {
      if (selectedPid.value && threadPollingEnabled.value) {
        // getSaveDataFn(selectedPid.value)
        // await threadStart()
      }
    })
    .finally(async () => {
      isThreadRequesting.value = false
      await queueFnList()
    })
  
  return pendingThreadRequest
}

// 启动轮询
function startThreadPolling() {
  if (threadPollingTimer) return
  
  threadPollingEnabled.value = true
  // 立即执行一次
  queueThreadStart()
  
  // 然后每1秒执行一次
  threadPollingTimer = setInterval(() => {
    if (selectedPid.value && threadPollingEnabled.value) {
      queueThreadStart()
    }
  }, 1000)
}

// 停止轮询
function stopThreadPolling() {
  threadPollingEnabled.value = false
  if (threadPollingTimer) {
    clearInterval(threadPollingTimer)
    threadPollingTimer = null
  }
}

// 处理PID变化
async function handlePidChange() {
  // 先停止旧的轮询
  stopThreadPolling()
  
  await getSaveDataFn(selectedPid.value)
  await getDetailInfoEnabled(selectedPid.value)
  cpuStart()
  memoryStart()
  threadData.value = []
  
  // 启动新的轮询
  startThreadPolling()
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
watch(selectedPid, (newPid, oldPid) => {
  if (newPid) {
    handlePidChange()
  }
  if (oldPid && oldPid !== newPid) {
    // PID 变化时，停止之前的内存分析
    if (isMemoryStarted.value) {
      memoryApi.stopMemory(oldPid).then((response) => {
        if (response.areSuccess) {
          console.log('停止内存分析成功:', response.data)
        } else {
          console.error('停止内存分析失败:', response.msg)
        }
      }).catch((error) => {
        console.error('停止内存分析异常:', error)
      })
      // 关闭之前的 EventSource
      if (memoryEventSource) {
        memoryEventSource.close()
        memoryEventSource = null
      }
      isMemoryStarted.value = false
    }
    // PID 变化时，停止之前的CPU分析
    if (isCpuStarted.value) {
      cpuApi.stopCpuProfiling(oldPid).then((response) => {
        if (response.areSuccess) {
          console.log('停止CPU分析成功:', response.data)
        } else {
          console.error('停止CPU分析失败:', response.msg)
        }
      }).catch((error) => {
        console.error('停止CPU分析异常:', error)
      })
      // 关闭之前的 EventSource
      if (cpuEventSource) {
        cpuEventSource.close()
        cpuEventSource = null
      }
      isCpuStarted.value = false
    }
  }
}, { immediate: false })

// 监听进程列表变化，自动选择第一个进程
watch(() => availableProcesses.value, (newProcesses) => {
  if (newProcesses.length > 0 && !selectedPid.value) {
    selectedPid.value = newProcesses[0].pid.toString()
  }
}, { immediate: true })

// 监听当前进程变化，当连接新进程时自动更新数据
watch(() => processStore.currentProcess, (newProcess) => {
  if (newProcess?.pid) {
    const newPid = newProcess.pid.toString()
    // 如果 pid 发生变化，更新 selectedPid 并重新获取数据
    if (selectedPid.value !== newPid) {
      selectedPid.value = newPid
      handlePidChange()
    }
  }
}, { immediate: true })

const cpuData = ref()
let cpuEventSource: EventSource | null = null
const isCpuStarted = ref(false)

async function cpuStart() {
  if (!selectedPid.value) return
  
  await cpuApi.startCpuProfiling(selectedPid.value, processStore.refreshPeriod || 1000, 'include', processStore.selectedScenarios).then((response) => {
    if (response.areSuccess) {
      console.log('CPU分析启动成功:', response.data)
      isCpuStarted.value = true
    } else {
      console.error('CPU分析启动失败:', response.msg)
      isCpuStarted.value = false
    }
  }).catch((error) => {
    console.error('CPU分析启动异常:', error)
    isCpuStarted.value = false
  })
  
  // 关闭之前的 EventSource（如果存在）
  if (cpuEventSource) {
    cpuEventSource.close()
    cpuEventSource = null
  }
  
  // 使用正确的 API 基础 URL 来创建 EventSource
  const baseUrl = resolveApiBaseUrl()
  const eventSourceUrl = `${baseUrl}/cvm/cpu/stream?pid=${selectedPid.value}&refreshPeriod=${5000}`
  cpuEventSource = new EventSource(eventSourceUrl)
  cpuEventSource.onmessage = (event) => {
    // 处理 event.data
    cpuData.value = JSON.parse(event.data);
  };
  cpuEventSource.onerror = () => {
    // 处理错误
  };
}

// 停止CPU分析
async function cpuStop() {
  if (!selectedPid.value || !isCpuStarted.value) return
  
  try {
    await cpuApi.stopCpuProfiling(selectedPid.value).then((response) => {
      if (response.areSuccess) {
        console.log('CPU分析停止成功')
      } else {
        console.error('CPU分析停止失败:', response.msg)
      }
    }).catch((error) => {
      console.error('CPU分析停止异常:', error)
    })
  } finally {
    isCpuStarted.value = false
    // 关闭 EventSource
    if (cpuEventSource) {
      cpuEventSource.close()
      cpuEventSource = null
    }
  }
}

const memoryData = ref()
let memoryEventSource: EventSource | null = null
const isMemoryStarted = ref(false)

async function memoryStart() {
  if (!selectedPid.value) return
  
  await memoryApi.getMemoryStats({
    pid: selectedPid.value,
    refresh: 5000,
    filterType: 'include',
    filter: processStore.selectedScenarios
  }).then((response) => {
    if (response.areSuccess) {
      console.log('内存分析启动成功:', response.data)
      isMemoryStarted.value = true
      // memoryData.value = response.data
    } else {
      console.error('内存分析启动失败:', response.msg)
      isMemoryStarted.value = false
    }
  }).catch((error) => {
    console.error('内存分析启动异常:', error)
    isMemoryStarted.value = false
  })
  
  // 关闭之前的 EventSource（如果存在）
  if (memoryEventSource) {
    memoryEventSource.close()
    memoryEventSource = null
  }
  
  const baseUrl = resolveApiBaseUrl()
  const eventSourceUrl = `${baseUrl}/cvm/memory/stream?pid=${selectedPid.value}&refreshPeriod=${5000}`
  memoryEventSource = new EventSource(eventSourceUrl)
  memoryEventSource.onmessage = (event) => {
    // 处理 event.data
    memoryData.value = JSON.parse(event.data);
  };
  memoryEventSource.onerror = () => {
    // 处理错误
  };
}

// 停止内存分析
async function memoryStop() {
  if (!selectedPid.value || !isMemoryStarted.value) return
  
  try {
    await memoryApi.stopMemory(selectedPid.value).then((response) => {
      if (response.areSuccess) {
        console.log('内存分析停止成功')
      } else {
        console.error('内存分析停止失败:', response.msg)
      }
    }).catch((error) => {
      console.error('内存分析停止异常:', error)
    })
  } finally {
    isMemoryStarted.value = false
    // 关闭 EventSource
    if (memoryEventSource) {
      memoryEventSource.close()
      memoryEventSource = null
    }
  }
}

const threadData = ref<ThreadStats>()
async function threadStart() {
  if (!selectedPid.value) return
  
  await threadApi.getThreadList(selectedPid.value).then((response) => {
    if (response.areSuccess) {
      console.log('线程分析启动成功:', response.data)
      threadData.value = response.data?.stats
    } else {
      console.error('线程分析启动失败:', response.msg)
    }
  }).catch((error) => {
    console.error('线程分析启动异常:', error)
  })
}

// 组件挂载时初始化
onMounted(async () => {
  // 优先使用 store 中的 currentProcess
  if (processStore.currentProcess?.pid) {
    selectedPid.value = processStore.currentProcess.pid.toString()
  } else if (availableProcesses.value.length > 0) {
    // 如果没有 currentProcess，使用第一个可用进程
    selectedPid.value = availableProcesses.value[0].pid.toString()
  }
})

// 组件卸载时停止轮询、内存分析和CPU分析
onUnmounted(() => {
  stopThreadPolling()
  memoryStop()
  cpuStop()
})
</script>
