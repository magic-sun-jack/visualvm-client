import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServiceStore = defineStore('service', () => {
  const serviceStatus = ref<'loading' | 'running' | 'stopped' | 'error'>('loading')
  const errorMessage = ref<string | null>(null)

  function setServiceStatus(status: 'loading' | 'running' | 'stopped' | 'error', message?: string) {
    serviceStatus.value = status
    errorMessage.value = message || null
  }

  return {
    serviceStatus,
    errorMessage,
    setServiceStatus
  }
})
