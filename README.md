# VisualVM 监控客户端

一个基于 Vue 3 + TypeScript + Tailwind CSS 的现代化 Java 应用监控客户端，提供全面的 JVM 性能监控和分析功能。

## 开发相关命令：

```bash
npm run dev - 启动 Vite 开发服务器
```
```bash
npm run electron:dev - 同时启动开发服务器和 Electron
```
```bash
npm run electron - 仅启动 Electron（需要先构建）
```
```bash
构建相关命令：

npm run build - 构建 Vue 应用（跳过 TypeScript 检查）
```
```bash
npm run build:check - 构建 Vue 应用（包含 TypeScript 检查）
```
打包相关命令：

```bash
npm run pack:win - 仅打包（不重新构建）
```
```bash
npm run dist:win - 构建并打包成 Windows 安装包
```
```bash
npm run installer:win - 构建并打包成可自定义安装路径的 Windows 安装包
```
```bash
npm run electron:build:win - 标准的构建和打包命令
```
生成的文件位置：

安装包：dist-electron/VisualVM Client Setup 1.0.0.exe
解压版本：dist-electron/win-unpacked/

## 🚀 功能特性

### 核心监控功能
- **进程监控**: 实时监控 Java 进程状态、内存使用、CPU 使用率
- **内存分析**: 内存泄漏检测、堆内存使用趋势分析
- **线程分析**: 线程状态监控、死锁检测、性能分析
- **数据库调用分析**: SQL 执行性能监控、慢查询分析
- **RMI 分析**: 远程方法调用性能监控和分析

### 管理功能
- **进程管理**: 启动、停止、重启 Java 进程
- **批量操作**: 支持批量启动、停止、重启进程
- **配置管理**: JVM 参数配置、程序参数设置
- **实时监控**: 实时数据刷新、状态更新

### 用户体验
- **响应式设计**: 支持桌面端和移动端
- **现代化 UI**: 基于 Tailwind CSS 的美观界面
- **数据可视化**: 图表展示监控数据趋势
- **搜索筛选**: 强大的搜索和筛选功能

## 🛠️ 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **开发语言**: TypeScript 5.3+
- **样式框架**: Tailwind CSS 3.4+
- **状态管理**: Pinia 2.1+
- **路由管理**: Vue Router 4.2+
- **图表库**: ECharts 5.4+
- **构建工具**: Vite 5.0+
- **代码规范**: ESLint + Prettier

## 📦 安装和运行

### 环境要求
- Node.js 18.0+
- npm 9.0+ 或 yarn 1.22+

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发环境运行
```bash
npm run dev
# 或
yarn dev
```

### 生产环境构建
```bash
npm run build
# 或
yarn build
```

### 代码检查
```bash
npm run lint
# 或
yarn lint
```

### 类型检查
```bash
npm run type-check
# 或
yarn type-check
```

## 🏗️ 项目结构

```
src/
├── api/                 # API 接口层
│   └── index.ts        # API 配置和接口定义
├── components/          # 公共组件
│   ├── charts/         # 图表组件
│   │   ├── MemoryTrendChart.vue
│   │   └── ProcessStatusChart.vue
│   └── Layout.vue      # 主布局组件
├── router/             # 路由配置
│   └── index.ts        # 路由定义
├── stores/             # 状态管理
│   └── process.ts      # 进程状态管理
├── types/              # TypeScript 类型定义
│   └── index.ts        # 接口和类型
├── utils/              # 工具函数
├── views/              # 页面组件
│   ├── Dashboard.vue           # 仪表板
│   ├── JavaProcesses.vue       # Java 进程监控
│   ├── DatabaseAnalysis.vue    # 数据库调用分析
│   ├── RMIAnalysis.vue         # RMI 分析
│   ├── MemoryLeak.vue          # 内存泄漏分析
│   ├── ThreadAnalysis.vue      # 多线程分析
│   └── ProcessManager.vue      # 进程管理
├── App.vue             # 根组件
├── main.ts             # 应用入口
└── style.css           # 全局样式
```

## 🎯 主要页面说明

### 仪表板 (Dashboard)
- 系统概览和关键指标
- 进程状态分布图表
- 内存使用趋势图表
- 最近活动记录
- 快速操作入口

### Java 进程监控 (JavaProcesses)
- 进程列表和详细信息
- 实时状态监控
- 启动新进程功能
- 进程操作（启动、停止、重启）

### 数据库调用分析 (DatabaseAnalysis)
- SQL 执行性能监控
- 慢查询分析
- 调用状态统计
- 执行时间分布图表

### RMI 分析 (RMIAnalysis)
- 远程方法调用监控
- 性能分析统计
- 远程主机分布
- 错误分析报告

### 内存泄漏分析 (MemoryLeak)
- 内存使用趋势监控
- 泄漏检测结果
- 严重程度分类
- 建议和解决方案

### 多线程分析 (ThreadAnalysis)
- 线程状态监控
- CPU 使用率分析
- 死锁检测
- 热点线程识别

### 进程管理 (ProcessManager)
- 进程生命周期管理
- 批量操作支持
- 配置管理
- 实时状态更新

## 🔧 配置说明

### 环境变量
创建 `.env` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=VisualVM 监控客户端
VITE_APP_VERSION=1.0.0
```

### Tailwind CSS 配置
在 `tailwind.config.js` 中自定义主题：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* 自定义主色调 */ },
        success: { /* 成功状态色 */ },
        warning: { /* 警告状态色 */ },
        danger: { /* 危险状态色 */ }
      }
    }
  }
}
```

## 📊 数据接口

### 进程相关接口
- `GET /api/processes` - 获取进程列表
- `GET /api/processes/:id` - 获取进程详情
- `POST /api/processes` - 启动新进程
- `PUT /api/processes/:id/stop` - 停止进程
- `PUT /api/processes/:id/restart` - 重启进程

### 监控数据接口
- `GET /api/monitoring/memory` - 内存使用数据
- `GET /api/monitoring/threads` - 线程状态数据
- `GET /api/monitoring/database` - 数据库调用数据
- `GET /api/monitoring/rmi` - RMI 调用数据

## 🎨 自定义主题

### 颜色系统
项目使用语义化的颜色系统：

- `primary`: 主要操作和链接
- `success`: 成功状态和确认操作
- `warning`: 警告状态和注意提示
- `danger`: 错误状态和危险操作
- `info`: 信息提示和说明

### 组件样式
所有组件都支持主题定制，通过 CSS 变量实现：

```css
:root {
  --color-primary-500: #3b82f6;
  --color-success-500: #22c55e;
  --color-warning-500: #f59e0b;
  --color-danger-500: #ef4444;
}
```

## 🚀 部署说明

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm run preview
```

### Docker 部署
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 最佳实践
- 使用 ESLint + Prettier 保持代码一致性
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 组件开发
- 使用 `<script setup>` 语法
- 优先使用 Composition API
- 组件属性使用 `defineProps`
- 事件使用 `defineEmits`
- 双向绑定使用 `defineModel`

### 状态管理
- 使用 Pinia 进行状态管理
- Store 按功能模块划分
- 异步操作使用 async/await
- 错误处理统一管理

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [ECharts](https://echarts.apache.org/) - 数据可视化图表库
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues](https://github.com/your-username/visualvm-client/issues)
- 邮箱: your-email@example.com

---

**注意**: 这是一个前端监控客户端，需要配合后端监控服务使用。请确保后端服务正常运行并正确配置 API 接口。
# visualvm-client
