# VisualVM 监控客户端
# 优速YouSpeed 监控客户端
一个基于 Vue 3 + TypeScript + Tailwind CSS 的现代化 Java 应用监控客户端，提供全面的 JVM 性能监控和分析功能。

## 如何运行

### 开发环境运行
要运行开发服务器，请在终端中执行以下命令：

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

### Electron 桌面应用运行
要运行 Electron 桌面应用，请执行：

```bash
# 同时启动开发服务器和 Electron
pnpm run electron:dev
```

### 生产环境构建
要构建生产版本，请执行：

```bash
# 构建 Vue 应用
pnpm run build

# 构建并打包 Electron 应用
pnpm run electron:build
```

## 如何测试

### 代码检查
要运行代码检查，请在终端中执行以下命令：

```bash
# ESLint 代码检查
pnpm run lint

# TypeScript 类型检查
pnpm run type-check
```

### 构建测试
要测试构建过程，请执行：

```bash
# 构建并检查类型
pnpm run build:check
```

## 🚀 功能特性

### 核心监控功能

### 管理功能

### 用户体验

## 🛠️ 技术栈


## 📦 环境要求


## 🏗️ 项目结构

```
src/
├── api/                 # API 接口层
│   ├── cpu.ts          # CPU 监控接口
│   ├── process.ts      # 进程管理接口
│   └── index.ts        # API 配置和接口定义
├── components/          # 公共组件
│   ├── charts/         # 图表组件
│   ├── monitoring/     # 监控相关组件
│   ├── ui/             # UI 基础组件
│   └── Layout.vue      # 主布局组件
├── router/             # 路由配置
│   └── index.ts        # 路由定义
├── stores/             # 状态管理
│   ├── process.ts      # 进程状态管理
│   ├── service.ts      # 服务状态管理
│   └── statistics.ts   # 统计数据管理
├── types/              # TypeScript 类型定义
│   └── index.ts        # 接口和类型
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

### Java 进程监控 (JavaProcesses)

### 数据库调用分析 (DatabaseAnalysis)

### RMI 分析 (RMIAnalysis)

### 内存泄漏分析 (MemoryLeak)

### 多线程分析 (ThreadAnalysis)

### 进程管理 (ProcessManager)

## 🔧 配置说明

### 环境变量
创建 `.env` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=优速YouSpeed 监控客户端
VITE_APP_VERSION=1.0.0
```

### 开发模式配置

## 📊 数据接口

### 进程相关接口

### 监控数据接口

## 🚀 部署说明

### 开发环境
```bash
pnpm run dev
```

### 生产环境
```bash
pnpm run build
pnpm run preview
```

### Electron 应用打包
```bash
# Windows
pnpm run electron:build:win

# macOS
pnpm run electron:build:mac

# Linux
pnpm run electron:build:linux
```

## 📝 开发规范

### 代码风格

### 组件开发

### 状态管理

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢


## 📞 联系方式

如有问题或建议，请通过以下方式联系：



**注意**: 这是一个前端监控客户端，需要配合后端监控服务使用。请确保后端服务正常运行并正确配置 API 接口。