import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import JavaProcesses from '@/views/JavaProcesses.vue'
import DatabaseAnalysis from '@/views/DatabaseAnalysis.vue'
import RMIAnalysis from '@/views/RMIAnalysis.vue'
import MemoryLeak from '@/views/MemoryLeak.vue'
import ThreadAnalysis from '@/views/ThreadAnalysis.vue'
import ProcessManager from '@/views/ProcessManager.vue'
import ShadcnDemo from '@/views/ShadcnDemo.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '仪表板' }
  },
  {
    path: '/processes',
    name: 'JavaProcesses',
    component: JavaProcesses,
    meta: { title: 'Java进程监控' }
  },
  {
    path: '/database',
    name: 'DatabaseAnalysis',
    component: DatabaseAnalysis,
    meta: { title: '数据库调用分析' }
  },
  {
    path: '/rmi',
    name: 'RMIAnalysis',
    component: RMIAnalysis,
    meta: { title: 'RMI分析' }
  },
  {
    path: '/memory',
    name: 'MemoryLeak',
    component: MemoryLeak,
    meta: { title: '内存泄漏分析' }
  },
  {
    path: '/threads',
    name: 'ThreadAnalysis',
    component: ThreadAnalysis,
    meta: { title: '多线程分析' }
  },
  {
    path: '/manager',
    name: 'ProcessManager',
    component: ProcessManager,
    meta: { title: '进程管理' }
  },
  {
    path: '/shadcn-demo',
    name: 'ShadcnDemo',
    component: ShadcnDemo,
    meta: { title: 'shadcn-vue 组件演示' }
  },
  // 兜底：未知路径重定向到仪表板，避免 RouterView 为空
  // { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 添加路由配置以避免DevTools问题
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, _from, next) => {
  try {
    document.title = `VisualVM - ${to.meta.title || '监控客户端'}`
    console.log('路由跳转到:', to.path, to.name)
    next()
  } catch (error) {
    console.error('路由守卫错误:', error)
    next()
  }
})

// 添加路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

// 添加路由解析错误处理
router.beforeResolve((to, _from, next) => {
  try {
    // 确保组件存在
    if (to.matched.length === 0) {
      console.warn('未找到匹配的路由:', to.path)
      next('/dashboard')
      return
    }
    next()
  } catch (error) {
    console.error('路由解析错误:', error)
    next('/dashboard')
  }
})

export default router
