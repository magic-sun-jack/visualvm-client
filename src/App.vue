<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- 服务加载状态覆盖层 -->
    <ServiceLoading />
    
    <!-- 主应用界面 - 只在服务运行或停止时显示 -->
    <Layout v-if="serviceStore.serviceStatus === 'running' || serviceStore.serviceStatus === 'stopped'">
      <RouterView />
    </Layout>
  </div>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import ServiceLoading from '@/components/ServiceLoading.vue'
import { useServiceStore } from '@/stores/service'

const serviceStore = useServiceStore()
</script>
