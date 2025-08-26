# shadcn-vue 组件库使用指南

本项目已成功集成了 [shadcn/ui](https://ui.shadcn.com/) 设计系统的 Vue 3 版本，提供了美观且可定制的 UI 组件。

## 🚀 已集成的组件

### 基础组件
- **Button** - 按钮组件，支持多种样式和大小
- **Card** - 卡片容器组件
- **Input** - 输入框组件
- **Badge** - 徽章/标签组件

### 卡片相关组件
- **CardHeader** - 卡片头部
- **CardTitle** - 卡片标题
- **CardDescription** - 卡片描述
- **CardContent** - 卡片内容
- **CardFooter** - 卡片底部

## 📖 使用方法

### 1. 导入组件

```vue
<script setup lang="ts">
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge
} from '@/components/ui'
</script>
```

### 2. 按钮组件使用

```vue
<template>
  <!-- 不同样式的按钮 -->
  <Button>默认按钮</Button>
  <Button variant="secondary">次要按钮</Button>
  <Button variant="destructive">危险按钮</Button>
  <Button variant="outline">轮廓按钮</Button>
  <Button variant="ghost">幽灵按钮</Button>
  <Button variant="link">链接按钮</Button>

  <!-- 不同大小的按钮 -->
  <Button size="sm">小按钮</Button>
  <Button size="default">默认大小</Button>
  <Button size="lg">大按钮</Button>
  <Button size="icon">🔍</Button>

  <!-- 禁用状态 -->
  <Button disabled>禁用按钮</Button>
</template>
```

### 3. 卡片组件使用

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>卡片标题</CardTitle>
      <CardDescription>卡片描述信息</CardDescription>
    </CardHeader>
    <CardContent>
      <p>卡片的主要内容</p>
    </CardContent>
    <CardFooter>
      <Button>操作按钮</Button>
    </CardFooter>
  </Card>
</template>
```

### 4. 输入框组件使用

```vue
<template>
  <Input 
    v-model="inputValue" 
    placeholder="请输入内容"
    type="text"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')
</script>
```

### 5. 徽章组件使用

```vue
<template>
  <Badge variant="default">默认徽章</Badge>
  <Badge variant="secondary">次要徽章</Badge>
  <Badge variant="destructive">危险徽章</Badge>
  <Badge variant="outline">轮廓徽章</Badge>
</template>
```

## 🎨 设计系统特性

### 颜色系统
- 支持亮色和暗色主题
- 使用 CSS 变量定义颜色
- 响应式设计，支持不同屏幕尺寸

### 组件变体
- **Button**: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`
- **Badge**: `default`, `secondary`, `destructive`, `outline`
- **Button Size**: `sm`, `default`, `lg`, `icon`

### 无障碍性
- 支持键盘导航
- 语义化 HTML 结构
- 屏幕阅读器友好

## 🔧 自定义配置

### 修改主题颜色
在 `src/style.css` 中修改 CSS 变量：

```css
:root {
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  /* 更多颜色变量... */
}
```

### 添加新组件
1. 在 `src/components/ui/` 目录下创建新组件
2. 使用 `cn()` 工具函数组合样式类
3. 在 `src/components/ui/index.ts` 中导出
4. 遵循 TypeScript 接口定义

## 📱 响应式设计

所有组件都支持响应式设计：
- 移动端优先的设计理念
- 使用 Tailwind CSS 的响应式类
- 支持不同屏幕尺寸的布局调整

## 🎯 最佳实践

1. **组件组合**: 使用组合式 API 和 `<script setup>` 语法
2. **类型安全**: 为所有 props 和 emits 定义 TypeScript 接口
3. **样式一致性**: 使用 `cn()` 工具函数组合样式类
4. **无障碍性**: 确保所有交互元素都有适当的 ARIA 属性
5. **性能优化**: 使用 Vue 3 的响应式系统优化渲染性能

## 🌟 演示页面

访问 `/shadcn-demo` 路由查看所有组件的实际效果和用法示例。

## 📚 相关资源

- [shadcn/ui 官网](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 🤝 贡献指南

如需添加新组件或修改现有组件：

1. 遵循现有的代码风格和结构
2. 确保所有 props 都有 TypeScript 类型定义
3. 添加适当的文档和示例
4. 测试组件的响应式设计和无障碍性

---

享受使用 shadcn-vue 组件库！🎉
