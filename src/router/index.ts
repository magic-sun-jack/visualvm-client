import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import JavaProcesses from "@/views/JavaProcesses.vue";
import DatabaseAnalysis from "@/views/DatabaseAnalysis.vue";
import RMIAnalysis from "@/views/RMIAnalysis.vue";
import MemoryLeak from "@/views/MemoryLeak.vue";
import GCMonitoring from "@/views/GCMonitoring.vue";
import LeakDetection from "@/views/LeakDetection.vue";
import ThreadAnalysis from "@/views/ThreadAnalysis.vue";
import ProcessManager from "@/views/ProcessManager.vue";
import ScenarioMonitoring from "@/views/ScenarioMonitoring.vue";
import ShadcnShowcase from "@/views/ShadcnShowcase.vue";
import {
  LayoutDashboard,
  Database,
  MemoryStick,
  GitBranch,
  SquareActivity,
  Activity,
  FileText,
  ShieldAlert,
  Trello,
} from "lucide-vue-next";
import ThreadMonitor from "@/views/ThreadMonitor.vue";
import ThreadDump from "@/views/ThreadDump.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      title: "概览",
      icon: LayoutDashboard,
    },
  },
  {
    path: "/memory",
    name: "MemoryLeak",
    // component: MemoryLeak,
    meta: { title: "内存信息", icon: MemoryStick },
    children: [
      {
        path: "gc",
        name: "GCMonitoring",
        component: GCMonitoring,
        meta: { title: "GC监控", icon: Trello },
      },
      {
        path: "leak",
        name: "LeakDetection",
        component: MemoryLeak,
        meta: { title: "内存泄漏检测", icon: ShieldAlert },
      },
    ],
  },
  {
    path: "/threads",
    name: "ThreadAnalysis",
    meta: { title: "线程", icon: GitBranch },
    children: [
      {
        path: "monitor",
        name: "ThreadMonitor",
        component: ThreadMonitor,
        meta: { title: "线程监控", icon: Activity },
      },
      {
        path: "dump",
        name: "ThreadDump",
        component: ThreadDump,
        meta: { title: "线程Dump", icon: FileText },
      },
    ],
  },
  {
    path: "/database",
    name: "DatabaseAnalysis",
    component: DatabaseAnalysis,
    meta: { title: "数据库", icon: Database, show: false },
  },
  {
    path: "/processes",
    name: "JavaProcesses",
    component: JavaProcesses,
    meta: { title: "Java进程监控", show: false },
  },
  {
    path: "/rmi",
    name: "RMIAnalysis",
    component: RMIAnalysis,
    meta: { title: "RMI分析", show: false },
  },
  {
    path: "/manager",
    name: "ProcessManager",
    component: ProcessManager,
    meta: { title: "进程管理", show: false },
  },
  {
    path: "/scenario",
    name: "ScenarioMonitoring",
    component: ScenarioMonitoring,
    meta: { title: "数据库监控", icon: Database, show: true },
  },

  {
    path: "/shadcn-showcase",
    name: "ShadcnShowcase",
    component: ShadcnShowcase,
    meta: { title: "shadcn-vue 完整展示", show: false },
  },
  // 兜底：未知路径重定向到仪表板，避免 RouterView 为空
  // { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

// 检测是否在 Electron 环境中 - 检查用户代理字符串或其他 Electron 特征
const isElectron =
  typeof window !== "undefined" &&
  window.navigator.userAgent.includes("Electron");

const router = createRouter({
  history: isElectron ? createWebHashHistory() : createWebHistory(),
  routes,
  // 添加路由配置以避免DevTools问题
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach((to, _from, next) => {
  try {
    document.title = `优速YouSpeed - ${to.meta.title || "监控客户端"}`;
    console.log("路由跳转到:", to.path, to.name);
    next();
  } catch (error) {
    console.error("路由守卫错误:", error);
    next();
  }
});

// 添加路由错误处理
router.onError((error) => {
  console.error("路由错误:", error);
});

// 添加路由解析错误处理
router.beforeResolve((to, _from, next) => {
  try {
    // 确保组件存在
    if (to.matched.length === 0) {
      console.warn("未找到匹配的路由:", to.path);
      next("/dashboard");
      return;
    }
    next();
  } catch (error) {
    console.error("路由解析错误:", error);
    next("/dashboard");
  }
});

export { routes, type RouteRecordRaw };

export default router;
