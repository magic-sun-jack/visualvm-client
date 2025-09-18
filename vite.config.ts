import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // GitHub Pages部署时需要设置正确的base路径
  base: process.env.NODE_ENV === 'production' 
    ? (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : './')
    : '/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 禁用开发工具相关的警告
          isCustomElement: (tag) => false,
        },
      },
    })
  ],
  define: {
    // 禁用Vue DevTools的开发模式集成
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3300,
    host: true,
    strictPort: true,
    hmr: {
      clientPort: 3300,
      overlay: true,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/cvm': {
        target: 'http://localhost:8099',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          echarts: ['echarts', 'vue-echarts'],
        },
      },
    },
    // 为 Electron 优化资源路径
    assetsInlineLimit: 0,
  },
})
