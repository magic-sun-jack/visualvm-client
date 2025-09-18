# GitHub Pages 部署指南

## 部署方式

本项目支持两种部署到 GitHub Pages 的方式：

### 1. GitHub Actions 自动部署（推荐）

当你推送代码到 `main` 或 `master` 分支时，GitHub Actions 会自动构建并部署到 GitHub Pages。

**配置步骤：**

1. 确保你的 GitHub 仓库已启用 GitHub Pages
2. 在仓库设置中，将 Pages 的 Source 设置为 "GitHub Actions"
3. 推送代码到主分支，GitHub Actions 会自动开始部署

**工作流程：**
- 构建环境：Ubuntu Latest + Node.js 18 + pnpm
- 类型检查：运行 `pnpm run type-check`
- 构建项目：运行 `pnpm run build`
- 自动部署到 GitHub Pages

### 2. 手动部署

使用本地命令进行部署：

```bash
# 标准部署
pnpm run deploy

# 明确指定 gh-pages 分支部署
pnpm run deploy:github
```

## 常见问题和解决方案

### 1. GitHub Actions 部署失败

**检查清单：**

- [ ] 确保仓库已启用 GitHub Pages
- [ ] 检查 Pages 设置中的 Source 是否设为 "GitHub Actions"
- [ ] 确认分支名称是 `main` 或 `master`
- [ ] 检查 Actions 权限设置

**权限设置：**
在仓库的 Settings > Actions > General 中：
- Workflow permissions: 选择 "Read and write permissions"
- 勾选 "Allow GitHub Actions to create and approve pull requests"

### 2. 路径问题

如果部署后资源文件（CSS、JS）加载失败：

1. 检查仓库名称和 `vite.config.ts` 中的 base 配置
2. 确保 `GITHUB_REPOSITORY` 环境变量正确传递

### 3. 构建失败

**常见原因：**

- TypeScript 类型错误：运行 `pnpm run type-check` 检查
- 依赖问题：确保 `pnpm-lock.yaml` 已提交
- 内存不足：在 Actions 中增加 Node.js 内存限制

**解决方案：**

```yaml
# 在 .github/workflows/deploy.yml 中添加
- name: Build
  run: pnpm run build
  env:
    NODE_ENV: production
    NODE_OPTIONS: '--max_old_space_size=4096'
    GITHUB_REPOSITORY: ${{ github.repository }}
```

### 4. Vite 构建优化

当前配置已针对部署进行优化：

- 生产环境使用相对路径
- 代码分割：vendor 和 echarts 单独打包
- 禁用内联资源以支持 Electron 构建

## 调试技巧

### 1. 本地预览

```bash
# 构建后本地预览
pnpm run build
pnpm run preview
```

### 2. 检查构建产物

构建后检查 `dist` 目录：
- `index.html` - 入口文件
- `assets/` - 静态资源
- 确保路径引用正确

### 3. GitHub Actions 日志

在 GitHub 仓库的 Actions 标签页查看详细的构建和部署日志。

## 环境变量

部署时可用的环境变量：

- `NODE_ENV`: 设置为 'production'
- `GITHUB_REPOSITORY`: GitHub 仓库路径（如 'username/repo-name'）
- `VITE_*`: 以 VITE_ 开头的自定义环境变量

## 注意事项

1. **SPA 路由**：如果使用 Vue Router 的 history 模式，可能需要配置 404 页面重定向
2. **API 代理**：生产环境中的 API 请求需要配置正确的基础 URL
3. **安全性**：不要在前端代码中暴露敏感信息

## 多环境部署

可以创建不同的部署环境：

```bash
# 开发环境部署
pnpm run build --mode development

# 预发布环境部署  
pnpm run build --mode staging

# 生产环境部署
pnpm run build --mode production
```
