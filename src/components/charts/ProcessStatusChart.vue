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

// 计算进程状态数据
function getProcessStatusData() {
  const statusCount = {
    running: 0,
    stopped: 0,
    error: 0
  }
  
  props.processes.forEach(process => {
    statusCount[process.status]++
  })
  
  return [
    { value: statusCount.running, name: '运行中', itemStyle: { color: '#10b981' } },
    { value: statusCount.stopped, name: '已停止', itemStyle: { color: '#6b7280' } },
    { value: statusCount.error, name: '错误', itemStyle: { color: '#ef4444' } }
  ].filter(item => item.value > 0)
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '进程状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: getProcessStatusData()
      }
    ]
  }
  
  chart.setOption(option)
}

// 更新图表数据
function updateChart() {
  if (!chart) return
  
  const option = {
    series: [
      {
        data: getProcessStatusData()
      }
    ]
  }
  
  chart.setOption(option)
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
