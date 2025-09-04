<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { MonitoringDataPoint } from '@/types'

interface Props {
  data: MonitoringDataPoint[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value || !props.data?.length) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    grid: {
      top: 2,
      right: 2,
      bottom: 2,
      left: 2
    },
    xAxis: {
      type: 'category',
      show: false,
      data: props.data.map(d => d.timestamp)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 1.5,
          color: '#3b82f6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        },
        data: props.data.map(d => d.value)
      }
    ]
  }
  
  chart.setOption(option)
}

function updateChart() {
  if (!chart || !props.data?.length) return
  
  const option = {
    xAxis: {
      data: props.data.map(d => d.timestamp)
    },
    series: [
      {
        data: props.data.map(d => d.value)
      }
    ]
  }
  
  chart.setOption(option)
}

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>