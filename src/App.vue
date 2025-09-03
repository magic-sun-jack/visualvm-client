<template>
  <div id="app" class="min-h-screen bg-background">
    <Layout>
      <RouterView />
    </Layout>
  </div>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
</script>
