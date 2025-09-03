# 组件监控功能说明

## 功能概述

为 `router-view` 添加了实时组件监控功能，可以显示当前匹配组件的详细信息、性能指标和生命周期状态。

## 主要功能

### 1. 基础信息监控
- **当前路径**: 显示当前路由路径
- **组件名称**: 自动识别并显示组件名称
- **路由名称**: 显示路由配置中的名称
- **查询参数**: 显示URL查询参数
- **路由参数**: 显示动态路由参数
- **组件类型**: 显示组件的JavaScript类型

### 2. 性能指标监控
- **渲染次数**: 统计组件重新渲染的次数
- **挂载时间**: 测量组件挂载耗时
- **渲染时间**: 测量组件更新渲染耗时
- **内存使用**: 实时监控JavaScript堆内存使用情况
- **最后更新**: 显示最后更新时间

### 3. 生命周期跟踪
- 自动监听组件的 `mounted`、`updated`、`unmounted` 事件
- 在控制台输出详细的生命周期日志
- 实时更新性能指标

## 使用方法

### 显示/隐藏监控面板
1. 点击顶部导航栏的"显示监控"/"隐藏监控"按钮
2. 或者点击监控面板右上角的"X"按钮关闭面板

### 重置性能指标
- 点击监控面板中的"重置"按钮清空所有性能数据

### 自动重置
- 当路由发生变化时，性能指标会自动重置
- 内存使用情况每5秒自动更新一次

## 技术实现

### 核心功能
```typescript
// 性能测量
let renderStartTime = 0
let mountStartTime = 0

// 组件生命周期监听
<component 
  :is="Component" 
  @vue:mounted="onComponentMounted"
  @vue:updated="onComponentUpdated"
  @vue:unmounted="onComponentUnmounted"
/>

// 内存使用监控
function getMemoryUsage(): number {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100
  }
  return 0
}
```

### 路由监听
```typescript
// 监听路由变化，自动重置性能指标
watch(() => route.path, () => {
  mountStartTime = performance.now()
  renderStartTime = performance.now()
  componentMetrics.value.renderCount = 0
  componentMetrics.value.lastUpdate = new Date().toLocaleTimeString()
}, { immediate: true })
```

## 监控面板界面

监控面板采用响应式设计，包含以下信息：

```
┌─────────────────────────────────────────┐
│ 组件监控信息                    [重置] [X] │
├─────────────────────────────────────────┤
│ 当前路径: /dashboard                     │
│ 组件名称: Dashboard                      │
│ 路由名称: dashboard                      │
│ 查询参数: {}                            │
│ 组件类型: object                        │
│ 渲染次数: 3                             │
│ 最后更新: 14:30:25                      │
│ 挂载时间: 12.34ms                       │
│ 渲染时间: 2.15ms                        │
│ 内存使用: 45.67MB                       │
└─────────────────────────────────────────┘
```

## 开发调试

### 控制台日志
监控功能会在浏览器控制台输出详细的调试信息：
- 组件挂载时间
- 组件更新耗时
- 组件卸载事件

### 性能分析
通过监控面板可以：
- 识别性能瓶颈组件
- 监控内存泄漏
- 分析渲染频率
- 优化组件性能

## 注意事项

1. **内存监控**: 仅在支持 `performance.memory` API 的浏览器中可用
2. **性能影响**: 监控功能本身对性能影响极小，但建议在生产环境中关闭
3. **浏览器兼容性**: 需要支持 Vue 3 和现代浏览器特性

## 扩展功能

未来可以考虑添加：
- 组件依赖关系图
- 更详细的性能分析
- 组件状态快照
- 网络请求监控
- 错误边界监控
