<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { JavaProcess } from '@/types'

interface Props {
  processes: JavaProcess[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let intervalId: number | null = null

// 生成模拟的时间序列数据
function generateTimeSeriesData() {
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
  
  return { times, memoryData }
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const { times, memoryData } = generateTimeSeriesData()
  
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
      data: times,
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
        data: memoryData,
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
  
  const { times, memoryData } = generateTimeSeriesData()
  
  const option = {
    xAxis: {
      data: times
    },
    series: [
      {
        data: memoryData
      }
    ]
  }
  
  chart.setOption(option)
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
  // 每1000ms刷新一次数据
  intervalId = window.setInterval(() => {
    updateChart()
  }, 1000)
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
