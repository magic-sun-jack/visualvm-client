import { defineStore } from 'pinia'
import { ref } from 'vue'

export type StatisticKey = 'threadDumps' | 'heapDumps' | 'profilerSnapshots' | 'jfrSnapshots'

export const useStatisticsStore = defineStore('statistics', () => {
  const stats = ref({
    threadDumps: 0,
    heapDumps: 0,
    profilerSnapshots: 0,
    jfrSnapshots: 0,
  })

  function reset() {
    stats.value = {
      threadDumps: 0,
      heapDumps: 0,
      profilerSnapshots: 0,
      jfrSnapshots: 0,
    }
  }

  function setAll(partial: Partial<typeof stats.value>) {
    stats.value = { ...stats.value, ...partial }
  }

  function increment(key: StatisticKey, amount: number = 1) {
    stats.value[key] = Math.max(0, (stats.value[key] ?? 0) + amount)
  }

  return {
    stats,
    reset,
    setAll,
    increment,
  }
})


