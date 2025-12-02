<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold">线程转储文件查看</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">选择本地线程转储文件（.hprof 等），直接读取并显示文件内容</p>
    </div>

    <Card class="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>选择文件</CardTitle>
        <CardDescription>本地读取，文件不上传</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-3">
          <Input
            ref="fileInputRef"
            type="file"
            accept=".hprof,.threaddump,.dump,.txt,.log,.log.gz"
            @change="onFileChange"
          />
          <Button variant="secondary" size="sm" @click="clearSelection" :disabled="!selectedFile">清除</Button>
          <Button variant="outline" size="sm" @click="readFile" :disabled="!selectedFile || isReading">读取文件</Button>
        </div>
        <div v-if="selectedFile" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-muted-foreground">文件名</div>
            <div class="font-mono break-all">{{ selectedFile.name }}</div>
          </div>
          <div>
            <div class="text-muted-foreground">大小</div>
            <div>{{ formatBytes(selectedFile.size) }}</div>
          </div>
          <div>
            <div class="text-muted-foreground">最后修改</div>
            <div>{{ new Date(selectedFile.lastModified).toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-muted-foreground">读取状态</div>
            <div>
              <span v-if="readError" class="text-red-600">读取失败：{{ readError }}</span>
              <span v-else-if="isReading" class="text-blue-600">读取中...</span>
              <span v-else-if="fileContent" class="text-green-600">已读取 ({{ fileLines }} 行)</span>
              <span v-else class="text-gray-500">未读取</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex justify-end gap-2">
      </CardFooter>
    </Card>

    <!-- 文件内容显示 -->
    <Card v-if="fileContent" class="bg-white dark:bg-gray-800">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>文件内容</CardTitle>
            <CardDescription>{{ fileLines }} 行，{{ formatBytes(fileContent.length) }}</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="copyToClipboard">复制</Button>
            <Button variant="outline" size="sm" @click="downloadFile">下载</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="relative">
          <div 
            ref="contentContainer"
            class="font-mono text-sm bg-gray-50 dark:bg-gray-900 rounded p-4 overflow-auto max-h-[70vh] whitespace-pre-wrap break-words flex"
            :class="{ 'line-numbers': showLineNumbers }"
          >
            <div v-if="showLineNumbers" class="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 text-right pr-2 text-gray-500 text-xs select-none">
              <div v-for="n in fileLines" :key="n" class="leading-6">{{ n }}</div>
            </div>
            <div>
              <div class="leading-6 pl-2" v-for="line in fileContent.split('\n')" :key="line">
                {{ line }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-4 text-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="showLineNumbers" class="rounded" />
            <span class="text-muted-foreground">显示行号</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="wordWrap" class="rounded" />
            <span class="text-muted-foreground">自动换行</span>
          </label>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import { threadApi } from '@/api'
import router from '@/router'

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isReading = ref(false)
const readError = ref<string | null>(null)
const fileContent = ref<string>('')
const showLineNumbers = ref(true)
const wordWrap = ref(true)
const contentContainer = ref<HTMLElement | null>(null)

const fileLines = computed(() => {
  if (!fileContent.value) return 0
  return fileContent.value.split('\n').length
})

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files && input.files[0] ? input.files[0] : null
  resetState()
  readFile()
}

function clearSelection() {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  resetState()
}

function resetState() {
  isReading.value = false
  readError.value = null
  fileContent.value = ''
}

async function readFile() {
  if (!selectedFile.value) return
  
  isReading.value = true
  readError.value = null
  fileContent.value = ''
  
  try {
    const text = await selectedFile.value.text()
    fileContent.value = text
  } catch (e: unknown) {
    readError.value = e instanceof Error ? e.message : String(e)
    console.error('读取文件失败:', e)
  } finally {
    isReading.value = false
  }
}

async function copyToClipboard() {
  if (!fileContent.value) return
  
  try {
    await navigator.clipboard.writeText(fileContent.value)
    // 可以添加一个提示消息
    alert('已复制到剪贴板')
  } catch (e) {
    console.error('复制失败:', e)
    alert('复制失败')
  }
}

function downloadFile() {
  if (!fileContent.value || !selectedFile.value) return
  
  const blob = new Blob([fileContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = selectedFile.value.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatBytes(size: number): string {
  if (size === 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return `${(size / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

onMounted(() => {
  const pid = router.currentRoute.value.query.pid as string
  if (pid) {
    threadApi.getThreadDump(pid).then((response) => {
      if (response.areSuccess) {
        fileContent.value = response.data
      } else {
        fileContent.value = response.msg
      }
    }).catch(error => {
      console.error('获取线程转储文件失败:', error)
      fileContent.value = error instanceof Error ? error.message : String(error)
    })
  }
})
</script>

<style scoped>
.line-numbers {
  position: relative;
}

.line-numbers > div:first-child {
  position: sticky;
  top: 0;
  height: 100%;
  overflow-y: auto;
}
</style>
