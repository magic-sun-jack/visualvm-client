# 版本管理说明

本项目已集成自动版本管理功能，每次打包时都会自动更新版本号。

## 功能特性

- ✅ 自动版本号递增
- ✅ Git 信息集成
- ✅ 构建时间记录
- ✅ 构建编号生成
- ✅ 版本信息显示

## 使用方法

### 1. 自动版本更新（推荐）

每次运行构建命令时，版本号会自动递增：

```bash
# 构建 Windows 版本（自动 patch 版本递增）
pnpm run electron:build:win

# 构建 Mac 版本（自动 patch 版本递增）
pnpm run electron:build:mac

# 构建 Linux 版本（自动 patch 版本递增）
pnpm run electron:build:linux
```

### 2. 手动版本更新

如果需要手动控制版本更新类型：

```bash
# 补丁版本更新 (1.0.2 -> 1.0.3)
pnpm run version:patch

# 次要版本更新 (1.0.2 -> 1.1.0)
pnpm run version:minor

# 主要版本更新 (1.0.2 -> 2.0.0)
pnpm run version:major
```

### 3. 版本信息查看

版本信息会在以下位置显示：

- **Dashboard 页面**：顶部标题栏显示版本号和 Git 提交哈希
- **悬停提示**：点击版本号可查看详细构建信息
- **构建信息文件**：`src/config/build-info.ts`

## 版本号规则

遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

## 构建信息

每次构建都会生成以下信息：

- **版本号**：当前应用版本
- **构建时间**：构建完成的时间戳
- **Git 提交哈希**：当前代码的 Git 提交 ID
- **构建编号**：基于 Git 提交总数的构建编号
- **分支名称**：当前 Git 分支

## 文件结构

```
scripts/
├── version-update.js          # 版本更新脚本
src/config/
├── build-info.ts             # 构建信息（自动生成）
└── env.ts                    # 环境配置（包含版本信息）
src/components/
└── VersionInfo.vue           # 版本信息显示组件
```

## 注意事项

1. **Git 依赖**：版本管理功能依赖 Git 仓库，确保在 Git 仓库中运行
2. **自动生成**：`build-info.ts` 文件会被自动生成，请勿手动修改
3. **版本同步**：确保 `package.json` 和 `build-info.ts` 中的版本号保持一致
4. **提交记录**：建议在每次构建后提交版本更新

## 示例

```bash
# 当前版本：1.0.2
pnpm run electron:build:win

# 输出：
# 开始更新版本号...
# 版本已更新: 1.0.2 -> 1.0.3
# 构建信息已生成: src/config/build-info.ts
# 版本更新完成!
# 新版本: 1.0.3
# 构建时间: 2025-10-11T07:55:07.819Z
# Git 提交: ceedc33
# 构建编号: 62
```

## 故障排除

如果遇到版本更新问题：

1. 确保在 Git 仓库根目录运行命令
2. 检查 `scripts/version-update.js` 文件是否存在
3. 确保有写入 `package.json` 和 `src/config/build-info.ts` 的权限
4. 检查 Node.js 版本是否支持 ES 模块
