# shadcn/ui Vue 组件库

本项目基于 [shadcn/ui](https://ui.shadcn.com/) 设计，为 Vue 3 项目提供了完整的 UI 组件库。

## 🚀 特性

- ✅ **Vue 3 兼容** - 完全支持 Vue 3 Composition API
- 🎨 **Tailwind CSS** - 使用 Tailwind CSS 进行样式设计
- 📱 **响应式设计** - 所有组件都支持响应式布局
- ♿ **无障碍访问** - 遵循 WAI-ARIA 标准
- 🎯 **TypeScript** - 完整的 TypeScript 支持
- 🔧 **可定制** - 所有组件都可以通过 props 和 CSS 变量进行定制

## 📦 已实现的组件

### 基础组件
- **Button** - 按钮组件，支持多种变体和尺寸
- **Card** - 卡片容器组件
- **Badge** - 徽章组件，用于状态显示
- **Avatar** - 头像组件
- **Skeleton** - 骨架屏组件
- **Separator** - 分隔符组件

### 表单组件
- **Input** - 输入框组件
- **Textarea** - 多行文本输入框
- **Select** - 选择器组件
- **Checkbox** - 复选框组件
- **Switch** - 开关组件
- **RadioGroup** - 单选组组件
- **Slider** - 滑块组件
- **Progress** - 进度条组件
- **Label** - 标签组件

### 布局组件
- **Tabs** - 标签页组件
- **Accordion** - 手风琴组件
- **Table** - 表格组件系列
  - TableHeader
  - TableBody
  - TableRow
  - TableCell
  - TableHead

### 反馈组件
- **Alert** - 警告提示组件
- **AlertDialog** - 警告对话框组件
- **Dialog** - 对话框组件系列
  - DialogContent
  - DialogHeader
  - DialogTitle
  - DialogDescription
  - DialogFooter

## 🛠️ 使用方法

### 1. 导入组件

```vue
<script setup lang="ts">
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge
} from '@/components/ui'
</script>
```

### 2. 在模板中使用

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>示例卡片</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <Input v-model="inputValue" placeholder="请输入内容" />
        <div class="flex gap-2">
          <Button>主要按钮</Button>
          <Button variant="outline">次要按钮</Button>
        </div>
        <Badge variant="default">状态徽章</Badge>
      </div>
    </CardContent>
  </Card>
</template>
```

## 🎨 组件变体

### Button 变体
- `default` - 默认样式
- `secondary` - 次要样式
- `destructive` - 危险样式
- `outline` - 轮廓样式
- `ghost` - 幽灵样式
- `link` - 链接样式

### Badge 变体
- `default` - 默认样式
- `secondary` - 次要样式
- `destructive` - 危险样式
- `outline` - 轮廓样式

### Alert 变体
- `default` - 默认样式
- `destructive` - 错误样式

## 📱 响应式设计

所有组件都支持响应式设计，使用 Tailwind CSS 的响应式前缀：

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card>内容 1</Card>
    <Card>内容 2</Card>
    <Card>内容 3</Card>
  </div>
</template>
```

## 🎯 表单处理

组件支持 Vue 3 的双向绑定：

```vue
<template>
  <div class="space-y-4">
    <Input v-model="formData.name" placeholder="姓名" />
    <Textarea v-model="formData.description" placeholder="描述" />
    <Select v-model="formData.category" :options="categories" />
    <Checkbox v-model="formData.agree" label="同意条款" />
    <Switch v-model="formData.notifications" label="启用通知" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const formData = reactive({
  name: '',
  description: '',
  category: '',
  agree: false,
  notifications: false
})

const categories = [
  { value: 'tech', label: '技术' },
  { value: 'design', label: '设计' },
  { value: 'business', label: '商业' }
]
</script>
```

## 🎨 主题定制

组件使用 CSS 变量进行主题定制，可以在 `src/style.css` 中修改：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 47.4% 11.2%;
  --radius: 0.5rem;
}
```

## 📖 示例页面

项目包含两个示例页面：

1. **ShadcnDemo** (`/shadcn-demo`) - 基础组件演示
2. **ShadcnShowcase** (`/shadcn-showcase`) - 完整组件展示

访问这些页面可以查看所有组件的使用示例。

## 🔧 开发

### 添加新组件

1. 在 `src/components/ui/` 目录下创建新的 Vue 组件
2. 在 `src/components/ui/index.ts` 中导出组件
3. 在示例页面中添加演示

### 组件结构

每个组件都应该：
- 使用 TypeScript 定义 props 接口
- 支持 `$attrs` 传递
- 使用 `cn` 工具函数合并类名
- 提供适当的默认值

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - 原始设计系统
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件基础
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Vue.js](https://vuejs.org/) - 前端框架
