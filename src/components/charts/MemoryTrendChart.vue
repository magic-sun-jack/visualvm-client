<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import * as echarts from 'echarts'
import type { JavaProcess } from '@/types'

interface Props {
  processes: JavaProcess[]
  maxDataPoints?: number // 最大数据点数量
  updateInterval?: number // 更新间隔（毫秒）
  incremental?: boolean // 是否增量更新
}

const props = withDefaults(defineProps<Props>(), {
  maxDataPoints: 50,
  updateInterval: 1000,
  incremental: true
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let intervalId: number | null = null

// 存储历史数据
const chartData = reactive({
  times: [] as string[],
  memoryData: [] as number[]
})

// 生成初始时间序列数据
function generateInitialData() {
  const now = new Date()
  const times = []
  const memoryData = []
  
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000)
    times.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    
    // 模拟内存使用数据
    const baseMemory = props.processes.reduce((sum, p) => sum + p.memoryUsage.used, 0)
    const randomVariation = (Math.random() - 0.5) * 0.1 // ±5% 变化
    memoryData.push(Math.max(0, baseMemory * (1 + randomVariation)))
  }
  
  chartData.times = times
  chartData.memoryData = memoryData
}

// 添加新数据点（增量更新）
function addDataPoint() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  
  // 计算当前内存使用
  const baseMemory = props.processes.reduce((sum, p) => sum + p.memoryUsage.used, 0)
  const randomVariation = (Math.random() - 0.5) * 0.1 // ±5% 变化
  const newMemoryValue = Math.max(0, baseMemory * (1 + randomVariation))
  
  // 增量添加数据
  chartData.times.push(timeStr)
  chartData.memoryData.push(newMemoryValue)
  
  // 限制数据点数量
  if (chartData.times.length > props.maxDataPoints) {
    chartData.times.shift()
    chartData.memoryData.shift()
  }
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  // 生成初始数据
  generateInitialData()
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const data = params[0]
        return `${data.name}<br/>内存使用: ${formatMemory(data.value)}`
      }
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
          return formatMemory(value)
        },
        fontSize: 10
      }
    },
    series: [
      {
        name: '内存使用',
        type: 'line',
        smooth: true,
        data: chartData.memoryData,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ]
          }
        },
        lineStyle: {
          color: '#3b82f6',
          width: 2
        },
        itemStyle: {
          color: '#3b82f6'
        }
      }
    ]
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
  
  const option = {
    xAxis: {
      data: chartData.times
    },
    series: [
      {
        data: chartData.memoryData
      }
    ]
  }
  
  // 使用notMerge选项进行平滑更新
  chart.setOption(option, {
    notMerge: false,
    lazyUpdate: true
  })
}

// 格式化内存大小
function formatMemory(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 监听进程数据变化
watch(() => props.processes, () => {
  updateChart()
}, { deep: true })

// 监听窗口大小变化
function handleResize() {
  chart?.resize()
}

onMounted(() => {
  initChart()
  // 根据配置的间隔刷新数据
  intervalId = window.setInterval(() => {
    updateChart()
  }, props.updateInterval)
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
