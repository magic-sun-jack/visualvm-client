<template>
  <div class="scenario-monitoring">
    <Card class="h-full">
      <CardHeader>
        <CardTitle>场景监控</CardTitle>
        <div class="flex items-center gap-2 ml-auto">
          <Select 
            v-model="selectedScenario" 
            :options="scenarioOptions"
            placeholder="选择监控场景"
            class="w-40"
            @update:modelValue="(value: any) => handleScenarioChange(String(value))"
          >
          </Select>
          <Button
            :variant="isMonitoring ? 'destructive' : 'default'"
            size="sm"
            @click="toggleMonitoring"
            :disabled="!selectedScenario || !selectedProcess"
          >
            {{ isMonitoring ? '停止监控' : '开始监控' }}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div v-if="!selectedScenario" class="text-center py-8 text-muted-foreground">
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
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-base">监控配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">状态:</span>
                    <span :class="config?.enabled ? 'text-green-600' : 'text-red-600'">
                      {{ config?.enabled ? '已启用' : '已禁用' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">采样间隔:</span>
                    <span>{{ config?.samplingInterval }}ms</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">最大样本数:</span>
                    <span>{{ config?.maxSamples }}</span>
                  </div>
                  <div v-if="selectedScenario === 'database'" class="flex justify-between">
                    <span class="text-muted-foreground">慢查询阈值:</span>
                    <span>{{ config?.slowQueryThreshold }}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle class="text-base">监控包路径</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-1 text-xs">
                  <div v-for="pkg in config?.packages?.slice(0, 5)" :key="pkg" class="truncate">
                    {{ pkg }}
                  </div>
                  <div v-if="config?.packages?.length > 5" class="text-muted-foreground">
                    还有 {{ config.packages.length - 5 }} 个包...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <!-- 指标展示 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  :scenario="selectedScenario"
                  :processId="selectedProcess"
                  :interval="1000"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, Button, Select } from '@/components/ui'
import { scenarioApi, configApi } from '@/api'
import MetricSparkline from './MetricSparkline.vue'
import RealtimeChart from './RealtimeChart.vue'
import type { MonitoringMetric } from '@/types'

interface Props {
  selectedProcess?: string
}

const props = defineProps<Props>()

const selectedScenario = ref<string>('common')
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

// 处理场景切换
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
  if (!props.selectedProcess || !selectedScenario.value) return
  
  try {
    if (isMonitoring.value) {
      // 停止监控
      await scenarioApi.stopScenarioMonitoring(props.selectedProcess, selectedScenario.value)
      isMonitoring.value = false
      
      // 停止指标更新
      if (metricsIntervalId) {
        clearInterval(metricsIntervalId)
        metricsIntervalId = null
      }
    } else {
      // 开始监控，使用 selectedScenario 作为 filter
      await scenarioApi.startScenarioMonitoring(props.selectedProcess, selectedScenario.value, selectedScenario.value)
      isMonitoring.value = true
      
      // 开始定时更新指标
      metricsIntervalId = window.setInterval(() => {
        loadScenarioMetrics(selectedScenario.value)
      }, 5000) // 每5秒更新一次指标
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
        selectedScenario.value = commonOption ? 'common' : scenarioOptions.value[0].value
        // 只有在有选中进程时才加载场景数据
        if (props.selectedProcess) {
          handleScenarioChange(selectedScenario.value)
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
    if (props.selectedProcess && selectedScenario.value) {
      handleScenarioChange(selectedScenario.value)
    }
  }
}

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