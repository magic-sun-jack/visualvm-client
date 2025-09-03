<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-foreground mb-4">shadcn/ui Vue 组件完整展示</h1>
      <p class="text-muted-foreground text-lg">基于 shadcn/ui 设计的 Vue 3 组件库完整演示</p>
    </div>

    <!-- 按钮组件演示 -->
    <Card>
      <CardHeader>
        <CardTitle>按钮组件 (Button)</CardTitle>
        <CardDescription>不同样式和大小的按钮组件</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <Button>默认按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="destructive">危险按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="link">链接按钮</Button>
        </div>
        <div class="flex flex-wrap gap-4">
          <Button size="sm">小按钮</Button>
          <Button size="default">默认大小</Button>
          <Button size="lg">大按钮</Button>
          <Button size="icon">🔍</Button>
        </div>
        <div class="flex flex-wrap gap-4">
          <Button disabled>禁用按钮</Button>
          <Button variant="outline" disabled>禁用轮廓按钮</Button>
        </div>
      </CardContent>
    </Card>

    <!-- 表单组件演示 -->
    <Card>
      <CardHeader>
        <CardTitle>表单组件</CardTitle>
        <CardDescription>输入框、选择器、复选框等表单组件</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">文本输入框</label>
            <Input v-model="formData.text" placeholder="请输入文本" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">数字输入框</label>
            <Input v-model="formData.number" type="number" placeholder="请输入数字" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">选择器</label>
            <Select
              v-model="formData.select"
              :options="selectOptions"
              placeholder="请选择选项"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">多行文本</label>
            <Textarea v-model="formData.textarea" placeholder="请输入多行文本" />
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <Checkbox v-model="formData.checkbox" label="同意条款" />
            <Switch v-model="formData.switch" label="启用通知" />
          </div>
          <div class="space-y-2">
            <Label>单选组</Label>
            <RadioGroup
              v-model="formData.radio"
              :options="radioOptions"
              name="example-radio"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 进度和滑块组件 -->
    <Card>
      <CardHeader>
        <CardTitle>进度和滑块组件</CardTitle>
        <CardDescription>进度条和滑块控件</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">进度条: {{ progressValue }}%</label>
            <Progress :value="progressValue" />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">滑块: {{ sliderValue }}</label>
            <Slider v-model="sliderValue" :min="0" :max="100" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 标签页组件 -->
    <Card>
      <CardHeader>
        <CardTitle>标签页组件 (Tabs)</CardTitle>
        <CardDescription>可切换的内容标签页</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          :tabs="tabs"
          :activeTab="activeTab"
          @update:activeTab="activeTab = $event"
        >
          <template #default="{ activeTab }">
            <div v-if="activeTab === 'overview'" class="space-y-4">
              <h3 class="text-lg font-semibold">概览</h3>
              <p class="text-muted-foreground">这里是概览页面的内容。</p>
            </div>
            <div v-else-if="activeTab === 'analytics'" class="space-y-4">
              <h3 class="text-lg font-semibold">分析</h3>
              <p class="text-muted-foreground">这里是分析页面的内容。</p>
            </div>
            <div v-else-if="activeTab === 'reports'" class="space-y-4">
              <h3 class="text-lg font-semibold">报告</h3>
              <p class="text-muted-foreground">这里是报告页面的内容。</p>
            </div>
          </template>
        </Tabs>
      </CardContent>
    </Card>

    <!-- 手风琴组件 -->
    <Card>
      <CardHeader>
        <CardTitle>手风琴组件 (Accordion)</CardTitle>
        <CardDescription>可折叠的内容区域</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion :items="accordionItems" />
      </CardContent>
    </Card>

    <!-- 徽章和状态组件 -->
    <Card>
      <CardHeader>
        <CardTitle>徽章和状态组件</CardTitle>
        <CardDescription>不同状态的徽章和指示器</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <Badge variant="default">默认</Badge>
          <Badge variant="secondary">次要</Badge>
          <Badge variant="destructive">危险</Badge>
          <Badge variant="outline">轮廓</Badge>
        </div>
        <div class="space-y-2">
          <Alert>
            <div class="flex items-center space-x-2">
              <span>ℹ️</span>
              <span>这是一个信息提示</span>
            </div>
          </Alert>
          <Alert variant="destructive">
            <div class="flex items-center space-x-2">
              <span>⚠️</span>
              <span>这是一个错误提示</span>
            </div>
          </Alert>
        </div>
      </CardContent>
    </Card>

    <!-- 骨架屏组件 -->
    <Card>
      <CardHeader>
        <CardTitle>骨架屏组件 (Skeleton)</CardTitle>
        <CardDescription>加载状态的占位符</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
          <Skeleton class="h-4 w-[150px]" />
        </div>
        <div class="flex items-center space-x-4">
          <Skeleton class="h-12 w-12 rounded-full" />
          <div class="space-y-2">
            <Skeleton class="h-4 w-[250px]" />
            <Skeleton class="h-4 w-[200px]" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 头像组件 -->
    <Card>
      <CardHeader>
        <CardTitle>头像组件 (Avatar)</CardTitle>
        <CardDescription>用户头像显示组件</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center space-x-4">
          <Avatar src="https://github.com/shadcn.png" alt="shadcn" />
          <Avatar fallback="CN" />
          <Avatar fallback="JD" />
          <Avatar fallback="AB" />
        </div>
      </CardContent>
    </Card>

    <!-- 表格组件 -->
    <Card>
      <CardHeader>
        <CardTitle>表格组件 (Table)</CardTitle>
        <CardDescription>数据表格展示组件</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell class="font-medium">张三</TableCell>
              <TableCell><Badge variant="default">活跃</Badge></TableCell>
              <TableCell>zhangsan@example.com</TableCell>
              <TableCell>
                <Button size="sm" variant="outline">编辑</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="font-medium">李四</TableCell>
              <TableCell><Badge variant="secondary">离线</Badge></TableCell>
              <TableCell>lisi@example.com</TableCell>
              <TableCell>
                <Button size="sm" variant="outline">编辑</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="font-medium">王五</TableCell>
              <TableCell><Badge variant="destructive">错误</Badge></TableCell>
              <TableCell>wangwu@example.com</TableCell>
              <TableCell>
                <Button size="sm" variant="outline">编辑</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 分隔符组件 -->
    <Card>
      <CardHeader>
        <CardTitle>分隔符组件 (Separator)</CardTitle>
        <CardDescription>用于分隔内容的线条</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <h4 class="text-sm font-medium">水平分隔符</h4>
          <div class="my-4">
            <p>上面的内容</p>
            <Separator class="my-4" />
            <p>下面的内容</p>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-medium">垂直分隔符</h4>
          <div class="flex items-center space-x-4">
            <span>左侧内容</span>
            <Separator orientation="vertical" class="h-4" />
            <span>右侧内容</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 卡片网格展示 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>系统监控</CardTitle>
          <CardDescription>实时监控系统性能指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">CPU 使用率</span>
              <Badge variant="default">85%</Badge>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">内存使用率</span>
              <Badge variant="secondary">72%</Badge>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">磁盘使用率</span>
              <Badge variant="destructive">95%</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button class="w-full">查看详情</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>进程状态</CardTitle>
          <CardDescription>当前运行的 Java 进程</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm">Tomcat</span>
              <Badge variant="default">运行中</Badge>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">Spring Boot</span>
              <Badge variant="secondary">等待中</Badge>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">MySQL</span>
              <Badge variant="outline">已停止</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" class="w-full">管理进程</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>内存分析</CardTitle>
          <CardDescription>JVM 内存使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>堆内存</span>
                <span>2.1GB / 4GB</span>
              </div>
              <Progress :value="52.5" />
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>非堆内存</span>
                <span>512MB / 1GB</span>
              </div>
              <Progress :value="51.2" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" class="w-full">详细分析</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

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
  Badge,
  Alert,
  Select,
  Textarea,
  Checkbox,
  Switch,
  Progress,
  Slider,
  Tabs,
  Accordion,
  Separator,
  Skeleton,
  Avatar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Label,
  RadioGroup
} from '@/components/ui'

import { ref, reactive } from 'vue'

// 表单数据
const formData = reactive({
  text: '',
  number: '',
  select: '',
  textarea: '',
  checkbox: false,
  switch: false,
  radio: ''
})

// 选择器选项
const selectOptions = [
  { value: 'option1', label: '选项 1' },
  { value: 'option2', label: '选项 2' },
  { value: 'option3', label: '选项 3' }
]

// 单选组选项
const radioOptions = [
  { value: 'option1', label: '选项 1' },
  { value: 'option2', label: '选项 2' },
  { value: 'option3', label: '选项 3' }
]

// 进度和滑块值
const progressValue = ref(75)
const sliderValue = ref(50)

// 标签页
const activeTab = ref('overview')
const tabs = [
  { value: 'overview', label: '概览' },
  { value: 'analytics', label: '分析' },
  { value: 'reports', label: '报告' }
]

// 手风琴项目
const accordionItems = [
  {
    value: 'item1',
    label: '什么是 shadcn/ui？',
    content: 'shadcn/ui 是一个基于 Radix UI 和 Tailwind CSS 构建的组件库，提供了美观且可访问的 UI 组件。'
  },
  {
    value: 'item2',
    label: '如何安装？',
    content: '可以通过 npm 或 yarn 安装，然后使用 CLI 工具添加所需的组件。'
  },
  {
    value: 'item3',
    label: '是否支持 Vue？',
    content: 'shadcn/ui 原生支持 React，但可以通过 radix-vue 在 Vue 项目中使用。'
  }
]
</script>
