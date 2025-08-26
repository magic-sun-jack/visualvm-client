<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-foreground mb-4">shadcn-vue 组件演示</h1>
      <p class="text-muted-foreground text-lg">基于 shadcn/ui 设计的 Vue 3 组件库</p>
    </div>

    <!-- 按钮组件演示 -->
    <Card>
      <CardHeader>
        <CardTitle>按钮组件</CardTitle>
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

    <!-- 卡片组件演示 -->
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
              <div class="w-full bg-secondary rounded-full h-2">
                <div class="bg-primary h-2 rounded-full" style="width: 52.5%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>非堆内存</span>
                <span>512MB / 1GB</span>
              </div>
              <div class="w-full bg-secondary rounded-full h-2">
                <div class="bg-secondary-foreground h-2 rounded-full" style="width: 51.2%"></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" class="w-full">详细分析</Button>
        </CardFooter>
      </Card>
    </div>

    <!-- 表单组件演示 -->
    <Card>
      <CardHeader>
        <CardTitle>系统配置</CardTitle>
        <CardDescription>配置监控系统的各项参数</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">服务器地址</label>
            <Input v-model="serverAddress" placeholder="localhost:8080" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">监控间隔</label>
            <Input v-model="monitorInterval" type="number" placeholder="5000" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">用户名</label>
            <Input v-model="username" placeholder="admin" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">密码</label>
            <Input v-model="password" type="password" placeholder="••••••••" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex gap-2">
        <Button>保存配置</Button>
        <Button variant="outline">重置</Button>
        <Button variant="ghost">取消</Button>
      </CardFooter>
    </Card>

    <!-- 状态指示器演示 -->
    <Card>
      <CardHeader>
        <CardTitle>状态指示器</CardTitle>
        <CardDescription>不同状态的颜色和样式</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-4">
          <Badge variant="default">正常运行</Badge>
          <Badge variant="secondary">维护中</Badge>
          <Badge variant="destructive">错误</Badge>
          <Badge variant="outline">离线</Badge>
        </div>
      </CardContent>
    </Card>
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
  Badge
} from '@/components/ui'

import { ref } from 'vue'

const serverAddress = ref('localhost:8080')
const monitorInterval = ref('5000')
const username = ref('admin')
const password = ref('')
</script>
