<template>
  <div class="scenario-monitoring">
    <Card class="h-full">
      <CardHeader>
        <CardTitle>场景监控</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="!selectedScenarios.length" class="text-center py-8 text-muted-foreground">
          请选择一个监控场景
        </div>
        
        <div v-else-if="loading" class="text-center py-8">
          <div class="inline-flex items-center">
            <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            加载中...
          </div>
        </div>
        
        <div v-else class="space-y-6">
          <!-- 配置信息 -->
          <div class="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-base">监控配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="flex items-center gap-4 flex-wrap">
                  <div
                    v-for="option in scenarioOptions"
                    :key="option.value"
                    class="flex items-center gap-2"
                  >
                    <Checkbox
                      :id="`scenario-${option.value}`"
                      :model-value="selectedScenarios.includes(option.value)"
                      @update:model-value="(value: boolean | 'indeterminate') => {
                        const checked = value === true
                        handleScenarioToggle(option.value, checked)
                      }"
                    />
                    <label
                      :for="`scenario-${option.value}`"
                      class="text-sm font-medium leading-none cursor-pointer select-none"
                    >
                      {{ option.label }}
                    </label>
                  </div>
                </div>
                <div class="space-y-2 text-sm mt-5">
                  <div class="flex items-center gap-2">
                    <label for="refreshPeriod" class="text-muted-foreground whitespace-nowrap">采样间隔 (ms):</label>
                    <Input
                      id="refreshPeriod"
                      v-model.number="refreshPeriod"
                      type="number"
                      min="100"
                      step="100"
                      class="w-32"
                      :disabled="isMonitoring"
                    />
                  </div>
                </div>
                <div class="flex items-center gap-2 mt-5">
                  <Label for="filterType" class="text-muted-foreground whitespace-nowrap">过滤类型:</Label>
                  <RadioGroup
                    id="filterType"
                    :model-value="filterType"
                    class="flex items-center gap-4"
                    @update:model-value="(val: string) => {
                      if (val === 'include' || val === 'exclude') {
                        filterType = val
                      }
                    }"
                  >
                    <div class="flex items-center gap-2">
                      <RadioGroupItem value="include" id="filter-include" />
                      <Label for="filter-include" class="text-sm font-normal cursor-pointer">包含</Label>
                    </div>
                    <div class="flex items-center gap-2">
                      <RadioGroupItem value="exclude" id="filter-exclude" />
                      <Label for="filter-exclude" class="text-sm font-normal cursor-pointer">排除</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>
          <!-- <div class="flex items-center gap-2 ml-auto">
            <Button
              :variant="isMonitoring ? 'destructive' : 'default'"
              size="sm"
              @click="toggleMonitoring"
              :disabled="!selectedScenarios || !selectedProcess"
            >
              {{ isMonitoring ? '停止监控' : '开始监控' }}
            </Button>
          </div> -->
          
          <!-- 指标展示 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="metrics.length > 0">
            <Card v-for="metric in metrics" :key="metric.name">
              <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium">{{ metric.name }}</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="flex items-baseline justify-between">
                  <span class="text-2xl font-bold">{{ formatValue(metric.value, metric.unit) }}</span>
                  <span class="text-xs text-muted-foreground">{{ metric.unit }}</span>
                </div>
                <div class="mt-2 flex items-center text-xs">
                  <span v-if="metric.trend === 'up'" class="text-green-600">
                    ↑ 上升
                  </span>
                  <span v-else-if="metric.trend === 'down'" class="text-red-600">
                    ↓ 下降
                  </span>
                  <span v-else class="text-gray-600">
                    → 稳定
                  </span>
                </div>
                <div class="mt-2 h-16">
                  <MetricSparkline :data="metric.dataPoints" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <!-- 实时数据图表 -->
          <Card v-if="isMonitoring">
            <CardHeader>
              <CardTitle class="text-base">实时监控数据</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="h-64">
                <RealtimeChart 
                  :scenario="selectedScenarios.join(',')"
                  :processId="selectedProcess"
                  :interval="refreshPeriod"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, Checkbox, Input, RadioGroup, RadioGroupItem, Label } from '@/components/ui'
import { scenarioApi, configApi } from '@/api'
import { useProcessStore } from '@/stores/process'
import MetricSparkline from './MetricSparkline.vue'
import RealtimeChart from './RealtimeChart.vue'
import type { MonitoringMetric } from '@/types'

interface Props {
  selectedProcess?: string
}

const props = defineProps<Props>()
const processStore = useProcessStore()

// 从全局 store 读取初始值，如果没有则使用默认值
const selectedScenarios = ref<string[]>(processStore.selectedScenarios.length > 0 ? [...processStore.selectedScenarios] : ['common'])
const refreshPeriod = ref<number>(processStore.refreshPeriod || 5000)
const filterType = ref<'include' | 'exclude'>(processStore.filterType || 'include')

const isMonitoring = ref(false)
const loading = ref(false)
const config = ref<any>(null)
const metrics = ref<MonitoringMetric[]>([])
const scenarioOptions = ref<Array<{ value: string; label: string }>>([])

// 场景名称到中文标签的映射
const scenarioLabelMap: Record<string, string> = {
  'common': '通用监控',
  'IO': 'IO监控',
  'Socket': 'Socket监控',
  'RPC': 'RPC监控',
  'pool': '连接池监控',
  'ORM': 'ORM监控',
  'jdbc': 'JDBC监控',
  'serialize': '序列化监控',
  'NoSql': 'NoSQL监控',
  'RMI': 'RMI监控',
  'HTTP': 'HTTP监控',
  'database': '数据库监控',
  'io': 'IO监控',
  'http': 'HTTP监控'
}

let metricsIntervalId: number | null = null

// 格式化数值
function formatValue(value: number, unit: string): string {
  if (unit === '%') {
    return value.toFixed(1)
  } else if (unit === 'ms') {
    if (value > 1000) {
      return (value / 1000).toFixed(2) + 's'
    }
    return value.toFixed(0)
  } else if (unit === 'MB/s') {
    return value.toFixed(2)
  } else if (unit === 'queries/sec' || unit === 'ops/sec' || unit === 'tx/sec') {
    return value.toFixed(1)
  } else {
    return value.toFixed(0)
  }
}

// 处理场景切换（checkbox 选中/取消选中）
function handleScenarioToggle(scenarioValue: string, checked: boolean) {
  if (checked) {
    // 选中：添加到数组
    if (!selectedScenarios.value.includes(scenarioValue)) {
      selectedScenarios.value.push(scenarioValue)
    }
  } else {
    // 取消选中：从数组移除，但至少保留一个
    if (selectedScenarios.value.length > 1) {
      const index = selectedScenarios.value.indexOf(scenarioValue)
      if (index > -1) {
        selectedScenarios.value.splice(index, 1)
      }
    } else {
      // 如果只有一个，不允许取消选中
      console.warn('至少需要选择一个监控场景')
      return
    }
  }
  
  // 同步到全局 store
  processStore.setSelectedScenarios([...selectedScenarios.value])
  
  // 如果正在监控，需要重新启动监控以应用新的场景选择
  if (isMonitoring.value && props.selectedProcess) {
    toggleMonitoring()
  }
}

// 处理场景切换（用于加载配置和指标）
async function handleScenarioChange(scenario: string) {
  if (!props.selectedProcess) return
  
  loading.value = true
  try {
    // 停止之前的监控
    if (isMonitoring.value) {
      await toggleMonitoring()
    }
    
    // 获取新场景的配置
    await loadScenarioConfig(scenario)
    
    // 获取新场景的指标
    await loadScenarioMetrics(scenario)
  } finally {
    loading.value = false
  }
}

// 加载场景配置
async function loadScenarioConfig(scenario: string) {
  if (!props.selectedProcess) return
  
  try {
    let response
    switch (scenario) {
      case 'database':
        response = await scenarioApi.getDatabaseMonitoringConfig(props.selectedProcess)
        break
      case 'io':
        response = await scenarioApi.getIOMonitoringConfig(props.selectedProcess)
        break
      case 'http':
        response = await scenarioApi.getHTTPMonitoringConfig(props.selectedProcess)
        break
      default:
        return
    }
    
    if (response.success) {
      config.value = response.data
    }
  } catch (error) {
    console.error('Failed to load scenario config:', error)
  }
}

// 加载场景指标
async function loadScenarioMetrics(scenario: string) {
  if (!props.selectedProcess) return
  
  try {
    let response
    switch (scenario) {
      case 'database':
        response = await scenarioApi.getDatabaseMetrics(props.selectedProcess)
        break
      case 'io':
        response = await scenarioApi.getIOMetrics(props.selectedProcess)
        break
      default:
        return
    }
    
    if (response.success) {
      metrics.value = response.data
    }
  } catch (error) {
    console.error('Failed to load scenario metrics:', error)
  }
}

// 切换监控状态
async function toggleMonitoring() {
  if (!props.selectedProcess || !selectedScenarios.value.length) return
  
  try {
    if (isMonitoring.value) {
      // 停止监控
      await scenarioApi.stopScenarioMonitoring(props.selectedProcess, selectedScenarios.value.join(','))
      isMonitoring.value = false
      
      // 停止指标更新
      if (metricsIntervalId) {
        clearInterval(metricsIntervalId)
        metricsIntervalId = null
      }
    } else {
      // 开始监控，使用 selectedScenarios 作为 filter，refreshPeriod 作为刷新周期，filterType 作为过滤类型
      await scenarioApi.startScenarioMonitoring(props.selectedProcess, selectedScenarios.value.join(','), selectedScenarios.value.join(','), refreshPeriod.value, filterType.value)
      isMonitoring.value = true
      
      // 开始定时更新指标
      metricsIntervalId = window.setInterval(() => {
        if (selectedScenarios.value.length > 0) {
          loadScenarioMetrics(selectedScenarios.value[0])
        }
      }, refreshPeriod.value)
    }
  } catch (error) {
    console.error('Failed to toggle monitoring:', error)
  }
}

// 加载场景配置选项
async function loadScenarioOptions() {
  try {
    const response = await configApi.getScenarioConfig()
    if (response.success && response.data && Array.isArray(response.data)) {
      scenarioOptions.value = response.data.map(scenario => {
        // 保持原始场景值，但转换为小写以匹配 API 路径
        const scenarioValue = scenario.toLowerCase()
        return {
          value: scenarioValue,
          label: scenarioLabelMap[scenario] || scenarioLabelMap[scenarioValue] || scenario
        }
      })
      
      // 如果有选项，优先选择 common，否则选择第一个
      if (scenarioOptions.value.length > 0) {
        const commonOption = scenarioOptions.value.find(opt => opt.value === 'common')
        selectedScenarios.value = commonOption ? processStore.selectedScenarios : ['common']
        // 只有在有选中进程时才加载场景数据
        if (props.selectedProcess) {
          handleScenarioChange(selectedScenarios.value.join(','))
        }
      }
    } else {
      // 如果返回数据格式不正确，使用默认选项
      throw new Error('Invalid response data')
    }
  } catch (error) {
    console.error('Failed to load scenario options:', error)
    // 如果接口失败，使用默认选项
    scenarioOptions.value = []
    // 保持默认值为 common
    if (props.selectedProcess && selectedScenarios.value.length) {
      handleScenarioChange(selectedScenarios.value.join(','))
    }
  }
}

// 监听 refreshPeriod 变化，同步到全局 store
watch(refreshPeriod, (newValue) => {
  if (newValue && newValue > 0) {
    processStore.setRefreshPeriod(newValue)
  }
}, { immediate: true })

// 监听 selectedScenarios 变化，同步到全局 store
watch(selectedScenarios, (newValue) => {
  if (newValue && newValue.length > 0) {
    processStore.setSelectedScenarios([...newValue])
  }
}, { deep: true, immediate: true })

// 监听 filterType 变化，同步到全局 store
watch(filterType, (newValue) => {
  if (newValue) {
    processStore.setFilterType(newValue)
  }
}, { immediate: true })

onMounted(() => {
  loadScenarioOptions()
})

onUnmounted(() => {
  if (metricsIntervalId) {
    clearInterval(metricsIntervalId)
  }
})
</script>

<style scoped>
.scenario-monitoring {
  height: 100%;
}
</style>