<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive, computed } from 'vue'
import * as echarts from 'echarts'

interface Props {
  data: any[]
  field: string | string[] // 例如 'memoryUsage.used' 或 ['heap_memory.used', 'heap_memory.committed']
  maxDataPoints?: number // 最大数据点数量
  updateInterval?: number // 更新间隔（毫秒）
  incremental?: boolean // 是否增量更新
  unit?: string // 单位符串，如 'MB', 'GB', '%'
}

const props = withDefaults(defineProps<Props>(), {
  maxDataPoints: 10,
  updateInterval: 1000,
  incremental: true
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let intervalId: number | null = null

// 存储历史数据
const chartData = reactive({
  times: [] as string[],
  seriesData: {} as Record<string, (number | string)[]>
})

// 获取字段数组
const fieldArray = computed(() => {
  return Array.isArray(props.field) ? props.field : [props.field]
})

// 递归获取对象字段值
function getFieldValue(obj: any, field: string): number {
  if (!obj || !field) return 0
  const keys = field.split('.')
  let value = obj
  for (const key of keys) {
    value = value?.[key]
    if (value === undefined) return 0
  }
  return typeof value === 'number' ? value : Number(value) || 0
}

// 生成初始时间序列数据
function generateInitialData() {
  const now = new Date()
  const times = []
  const seriesData: Record<string, (number | string)[]> = {}
  
  // 初始化每个字段的数据数组
  fieldArray.value.forEach((field: string) => {
    seriesData[field] = []
  })
  
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000)
    times.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    
    // 为每个字段计算值
    fieldArray.value.forEach((field: string) => {
      const baseValue = props.data.reduce((sum, item) => sum + getFieldValue(item, field), 0)
      const randomVariation = 0 // ±5% 变化
      const value = Math.max(0, baseValue * (1 + randomVariation))
      seriesData[field].push(value)
    })
  }
  
  chartData.times = times
  chartData.seriesData = seriesData
}

// 添加新数据点（增量更新）
function addDataPoint() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  
  // 为每个字段计算新值
  fieldArray.value.forEach((field: string) => {
    if (!chartData.seriesData[field]) {
      chartData.seriesData[field] = []
    }
    const baseValue = props.data.reduce((sum, item) => sum + getFieldValue(item, field), 0)
    const randomVariation = 0 // ±5% 变化
    const newValue = Math.max(0, baseValue * (1 + randomVariation))
    chartData.seriesData[field].push(newValue)
    
    // 限制数据点数量
    if (chartData.seriesData[field].length > props.maxDataPoints) {
      chartData.seriesData[field].shift()
    }
  })
  
  chartData.times.push(timeStr)
  // 限制时间点数量
  if (chartData.times.length > props.maxDataPoints) {
    chartData.times.shift()
  }
}

// 定义颜色数组
const colors = [
  { line: '#3b82f6', area: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)'] }, // 蓝色
  { line: '#ef4444', area: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.1)'] }, // 红色
  { line: '#10b981', area: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.1)'] }, // 绿色
  { line: '#f59e0b', area: ['rgba(245, 158, 11, 0.3)', 'rgba(245, 158, 11, 0.1)'] }, // 橙色
  { line: '#8b5cf6', area: ['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)'] }, // 紫色
  { line: '#ec4899', area: ['rgba(236, 72, 153, 0.3)', 'rgba(236, 72, 153, 0.1)'] }  // 粉色
]

// 初始化图表
function initChart() {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  // 生成初始数据
  generateInitialData()
  
  // 生成系列配置
  const series = fieldArray.value.map((field: string, index: number) => {
    const color = colors[index % colors.length]
    const data = chartData.seriesData[field] || []
    
    return {
      name: field,
      type: 'line',
      smooth: true,
      data: data,
      areaStyle: fieldArray.value.length === 1 ? {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: color.area[0] },
            { offset: 1, color: color.area[1] }
          ]
        }
      } : undefined,
      lineStyle: {
        color: color.line,
        width: 2
      },
      itemStyle: {
        color: color.line
      }
    }
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        if (!Array.isArray(params)) return ''
        const time = params[0].name
        let result = `${time}<br/>`
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value}${props.unit ? ' ' + props.unit : ''}<br/>`
        })
        return result
      }
    },
    legend: {
      left: 'right',
      show: fieldArray.value.length > 1
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.times,
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value: number) {
          return value + (props.unit ? ' ' + props.unit : '')
        },
        fontSize: 10
      }
    },
    series: series
  }
  
  chart.setOption(option)
}

// 更新图表数据
function updateChart() {
  if (!chart) return
  
  if (props.incremental) {
    // 增量更新：只添加新数据点
    addDataPoint()
  } else {
    // 全量更新：重新生成所有数据
    generateInitialData()
  }
  
  // 生成系列配置
  const series = fieldArray.value.map((field: string) => {
    const data = chartData.seriesData[field] || []
    
    return {
      name: field,
      type: 'line',
      data: data
    }
  })
  
  const option = {
    xAxis: {
      data: chartData.times
    },
    series: series
  }
  
  // 使用notMerge选项进行平滑更新
  chart.setOption(option, {
    notMerge: false,
    lazyUpdate: true
  })
}

// 监听数据变化
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

// 监听字段变化，如果字段数量或内容改变，重新初始化
watch(() => props.field, () => {
  if (chart) {
    initChart()
  }
}, { deep: true })

// 监听窗口大小变化
function handleResize() {
  chart?.resize()
}

onMounted(() => {
  initChart()
  // 根据配置的间隔刷新数据
  if (props.updateInterval) {
    intervalId = window.setInterval(() => {
      updateChart()
    }, props.updateInterval)
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>
