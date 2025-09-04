<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { scenarioApi } from '@/api'

interface Props {
  scenario: string
  processId?: string
  interval?: number
  maxPoints?: number
}

const props = withDefaults(defineProps<Props>(), {
  interval: 1000,
  maxPoints: 100
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let intervalId: number | null = null
let lastTimestamp: string | null = null

const chartData = reactive({
  times: [] as string[],
  values: [] as number[]
})

async function fetchRealtimeData() {
  try {
    const response = await scenarioApi.getRealtimeMetrics(
      props.processId || '',
      props.scenario,
      lastTimestamp || undefined
    )
    
    if (response.success && response.data?.dataPoint) {
      const dataPoint = response.data.dataPoint
      
      // 添加新数据点
      const time = new Date(dataPoint.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      chartData.times.push(time)
      chartData.values.push(dataPoint.value)
      
      // 限制数据点数量
      if (chartData.times.length > props.maxPoints) {
        chartData.times.shift()
        chartData.values.shift()
      }
      
      lastTimestamp = dataPoint.timestamp
      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch realtime data:', error)
  }
}

function initChart() {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.times,
      axisLabel: {
        fontSize: 10,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: getSeriesName(),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        sampling: 'lttb',
        data: chartData.values,
        lineStyle: {
          width: 2,
          color: getSeriesColor()
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: getSeriesColor(0.3) },
              { offset: 1, color: getSeriesColor(0.1) }
            ]
          }
        },
        itemStyle: {
          color: getSeriesColor()
        }
      }
    ]
  }
  
  chart.setOption(option)
}

function updateChart() {
  if (!chart) return
  
  const option = {
    xAxis: {
      data: chartData.times
    },
    series: [
      {
        data: chartData.values
      }
    ]
  }
  
  chart.setOption(option, {
    notMerge: false,
    lazyUpdate: true
  })
}

function getSeriesName(): string {
  switch (props.scenario) {
    case 'database':
      return '数据库性能'
    case 'io':
      return 'IO性能'
    case 'http':
      return 'HTTP性能'
    default:
      return '性能指标'
  }
}

function getSeriesColor(opacity: number = 1): string {
  const colors: Record<string, string> = {
    database: `rgba(34, 197, 94, ${opacity})`,   // green
    io: `rgba(251, 146, 60, ${opacity})`,        // orange
    http: `rgba(147, 51, 234, ${opacity})`       // purple
  }
  return colors[props.scenario] || `rgba(59, 130, 246, ${opacity})`
}

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  initChart()
  
  // 立即获取第一个数据点
  fetchRealtimeData()
  
  // 开始定时更新
  intervalId = window.setInterval(() => {
    fetchRealtimeData()
  }, props.interval)
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>