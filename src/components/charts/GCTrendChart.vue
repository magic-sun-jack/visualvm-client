<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface GCTrendData {
  timestamp: number
  duration: number
  type: string
}

interface Props {
  data: GCTrendData[]
}

const props = defineProps<Props>()

const chartContainer = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// GC类型颜色映射
const gcTypeColors: Record<string, string> = {
  'Young GC': '#3B82F6',
  'Old GC': '#EF4444', 
  'Full GC': '#F59E0B',
  'Mixed GC': '#10B981'
}

function initChart() {
  if (!chartContainer.value) return
  
  chartInstance = echarts.init(chartContainer.value)
  updateChart()
}

function updateChart() {
  if (!chartInstance || !props.data.length) return

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'transparent',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params: any) {
        const data = params[0]
        const timestamp = new Date(data.axisValue).toLocaleString('zh-CN')
        return `
          <div class="p-2">
            <div class="font-semibold mb-1">${timestamp}</div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${data.color}"></div>
              <span>${data.seriesName}: ${data.value}ms</span>
            </div>
          </div>
        `
      }
    },
    legend: {
      data: ['Young GC', 'Old GC', 'Full GC', 'Mixed GC'],
      top: 10,
      textStyle: {
        color: '#6B7280'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      axisLabel: {
        color: '#6B7280',
        formatter: function(value: number) {
          return new Date(value).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '持续时间 (ms)',
      nameTextStyle: {
        color: '#6B7280'
      },
      axisLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      axisLabel: {
        color: '#6B7280'
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6'
        }
      }
    },
    series: [
      {
        name: 'Young GC',
        type: 'line',
        data: props.data
          .filter(item => item.type === 'Young GC')
          .map(item => [item.timestamp, item.duration]),
        lineStyle: {
          color: gcTypeColors['Young GC'],
          width: 2
        },
        itemStyle: {
          color: gcTypeColors['Young GC']
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      },
      {
        name: 'Old GC',
        type: 'line',
        data: props.data
          .filter(item => item.type === 'Old GC')
          .map(item => [item.timestamp, item.duration]),
        lineStyle: {
          color: gcTypeColors['Old GC'],
          width: 2
        },
        itemStyle: {
          color: gcTypeColors['Old GC']
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      },
      {
        name: 'Full GC',
        type: 'line',
        data: props.data
          .filter(item => item.type === 'Full GC')
          .map(item => [item.timestamp, item.duration]),
        lineStyle: {
          color: gcTypeColors['Full GC'],
          width: 2
        },
        itemStyle: {
          color: gcTypeColors['Full GC']
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      },
      {
        name: 'Mixed GC',
        type: 'line',
        data: props.data
          .filter(item => item.type === 'Mixed GC')
          .map(item => [item.timestamp, item.duration]),
        lineStyle: {
          color: gcTypeColors['Mixed GC'],
          width: 2
        },
        itemStyle: {
          color: gcTypeColors['Mixed GC']
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  chartInstance.setOption(option, true)
}

function resizeChart() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听数据变化
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

onMounted(async () => {
  await nextTick()
  initChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
/* 确保图表容器占满父元素 */
.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}
</style>
