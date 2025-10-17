<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold">HPROF 文件分析</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">选择本地 .hprof 文件，查看头部信息与记录列表；支持按记录高亮字节视图</p>
    </div>

    <Card class="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>选择文件</CardTitle>
        <CardDescription>本地解析，文件不上传</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-3">
          <input
            type="file"
            accept=".hprof"
            @change="onFileChange"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
          />
          <Button variant="secondary" size="sm" @click="clearSelection" :disabled="!selectedFile">清除</Button>
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
            <div class="text-muted-foreground">解析状态</div>
            <div>
              <span v-if="parseError" class="text-red-600">解析失败：{{ parseError }}</span>
              <span v-else-if="isParsing" class="text-blue-600">解析中...</span>
              <span v-else-if="headerSummary" class="text-green-600">已解析</span>
              <span v-else class="text-gray-500">未解析</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex justify-end gap-2">
        <Button variant="outline" @click="parseHprof" :disabled="!selectedFile || isParsing">解析</Button>
      </CardFooter>
    </Card>

    <div v-if="headerSummary" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左：摘要与记录列表 -->
      <div class="space-y-6 lg:col-span-1">
        <Card class="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>文件头部</CardTitle>
            <CardDescription>基础信息</CardDescription>
          </CardHeader>
          <CardContent class="text-sm grid grid-cols-2 gap-4">
            <div>
              <div class="text-muted-foreground">格式标识</div>
              <div class="font-mono break-all">{{ headerSummary.format }}</div>
            </div>
            <div>
              <div class="text-muted-foreground">ID大小</div>
              <div>{{ headerSummary.identifierSize }} 字节</div>
            </div>
            <div>
              <div class="text-muted-foreground">时间戳</div>
              <div>{{ headerSummary.timestampMs }} ({{ formatDate(headerSummary.timestampMs) }})</div>
            </div>
            <div>
              <div class="text-muted-foreground">头部长度</div>
              <div>{{ headerSummary.headerBytes }} 字节</div>
            </div>
          </CardContent>
        </Card>

        <Card class="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>记录列表 (前 {{ records.length }} 条)</CardTitle>
            <CardDescription>点击一条记录以高亮右侧字节区间</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="max-h-[420px] overflow-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="text-left text-gray-600 dark:text-gray-400">
                    <th class="py-1 pr-2">#</th>
                    <th class="py-1 pr-2">偏移</th>
                    <th class="py-1 pr-2">Tag</th>
                    <th class="py-1 pr-2">名称</th>
                    <th class="py-1 pr-2">长度</th>
                    <th class="py-1 pr-2">时间差</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in records" :key="i" @click="selectRecord(i)" :class="i === selectedRecordIndex ? 'bg-yellow-100 dark:bg-yellow-900/30' : i % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : ''" class="cursor-pointer">
                    <td class="py-1 pr-2">{{ i + 1 }}</td>
                    <td class="py-1 pr-2 font-mono">0x{{ r.offset.toString(16) }}</td>
                    <td class="py-1 pr-2 font-mono">0x{{ r.tag.toString(16).padStart(2,'0') }}</td>
                    <td class="py-1 pr-2">{{ tagName(r.tag) }}</td>
                    <td class="py-1 pr-2">{{ r.length }}</td>
                    <td class="py-1 pr-2">{{ r.timeDelta }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 右：十六进制视图 -->
      <div class="lg:col-span-2">
        <Card class="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>字节视图</CardTitle>
            <CardDescription>展示开头 {{ hexSliceLength }} 字节；选中记录时高亮对应区间</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="hexView.length" class="font-mono text-[11px] overflow-auto max-h-[600px]">
              <table>
                <tbody>
                  <tr v-for="row in hexView" :key="row.offset">
                    <td class="pr-3 text-gray-500">{{ row.offsetHex }}</td>
                    <td>
                      <span v-for="b in row.bytes" :key="b.index" :class="byteClass(b.index)">{{ b.hex }}</span>
                    </td>
                    <td class="pl-4 text-gray-500">{{ row.ascii }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-gray-500">未生成字节视图</div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import { threadApi } from '@/api'
import { useProcessStore } from '@/stores/process'

const processStore = useProcessStore()

const threadDump = ref<any>(null)

interface HprofHeaderSummary {
  format: string
  identifierSize: number
  timestampMs: number
  headerBytes: number
}

interface HprofRecord {
  tag: number
  timeDelta: number
  length: number
  offset: number // absolute file offset to record start (tag byte)
}

const selectedFile = ref<File | null>(null)
const isParsing = ref(false)
const parseError = ref<string | null>(null)
const headerSummary = ref<HprofHeaderSummary | null>(null)
const records = ref<HprofRecord[]>([])
const fileBytes = ref<Uint8Array | null>(null)
const selectedRecordIndex = ref<number | null>(null)

const hexSliceLength = 4096
const hexView = computed(() => buildHexView(fileBytes.value, hexSliceLength))

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files && input.files[0] ? input.files[0] : null
  resetState()
}

function clearSelection() {
  selectedFile.value = null
  resetState()
}

function resetState() {
  isParsing.value = false
  parseError.value = null
  headerSummary.value = null
  records.value = []
  fileBytes.value = null
  selectedRecordIndex.value = null
}

async function parseHprof() {
  if (!selectedFile.value) return
  isParsing.value = true
  parseError.value = null
  headerSummary.value = null
  records.value = []
  fileBytes.value = null
  selectedRecordIndex.value = null
  try {
    const buffer = await selectedFile.value.arrayBuffer()
    fileBytes.value = new Uint8Array(buffer)
    const view = new DataView(buffer)
    const header = readHprofHeader(view)
    headerSummary.value = header
    const start = header.headerBytes
    records.value = readRecords(view, start, 100, 2_000_000)
  } catch (e: unknown) {
    parseError.value = e instanceof Error ? e.message : String(e)
  } finally {
    isParsing.value = false
  }
}

function readHprofHeader(view: DataView): HprofHeaderSummary {
  let offset = 0
  const bytes: number[] = []
  while (offset < view.byteLength) {
    const b = view.getUint8(offset++)
    if (b === 0x00) break
    bytes.push(b)
  }
  const format = new TextDecoder().decode(new Uint8Array(bytes)) || 'HPROF'
  if (offset + 12 > view.byteLength) throw new Error('文件过小，无法读取头部信息')
  const identifierSize = view.getUint32(offset)
  const timeHigh = view.getUint32(offset + 4)
  const timeLow = view.getUint32(offset + 8)
  const timestampMs = (timeHigh * 2 ** 32) + timeLow
  const headerBytes = offset + 12
  return { format, identifierSize, timestampMs, headerBytes }
}

function readRecords(view: DataView, startOffset: number, maxRecords: number, maxBytes: number): HprofRecord[] {
  const out: HprofRecord[] = []
  let off = startOffset
  const end = Math.min(view.byteLength, startOffset + maxBytes)
  for (let i = 0; i < maxRecords && off + 9 <= end; i++) {
    const tag = view.getUint8(off)
    const timeDelta = view.getUint32(off + 1)
    const length = view.getUint32(off + 5)
    out.push({ tag, timeDelta, length, offset: off })
    off += 9 + length
    if (off > end) break
  }
  return out
}

function tagName(tag: number): string {
  // Common HPROF tags (subset)
  const map: Record<number, string> = {
    0x01: 'STRING_IN_UTF8',
    0x02: 'LOAD_CLASS',
    0x0C: 'STACK_FRAME',
    0x0D: 'STACK_TRACE',
    0x0F: 'ALLOC_SITES',
    0x10: 'HEAP_SUMMARY',
    0x12: 'START_THREAD',
    0x13: 'END_THREAD',
    0x1C: 'HEAP_DUMP',
    0x1D: 'HEAP_DUMP_SEGMENT',
    0x1E: 'HEAP_DUMP_END',
  }
  return map[tag] || 'UNKNOWN'
}

function buildHexView(bytes: Uint8Array | null, maxLen: number) {
  if (!bytes) return [] as Array<{ offset: number; offsetHex: string; bytes: Array<{ index: number; hex: string }>; ascii: string }>
  const len = Math.min(bytes.length, maxLen)
  const rows: any[] = []
  for (let i = 0; i < len; i += 16) {
    const rowBytes: Array<{ index: number; hex: string }> = []
    const asciiChars: string[] = []
    for (let j = 0; j < 16 && i + j < len; j++) {
      const idx = i + j
      const b = bytes[idx]
      rowBytes.push({ index: idx, hex: b.toString(16).padStart(2, '0') })
      asciiChars.push(b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')
    }
    rows.push({ offset: i, offsetHex: '0x' + i.toString(16).padStart(8, '0'), bytes: rowBytes, ascii: asciiChars.join('') })
  }
  return rows
}

function selectRecord(i: number) {
  selectedRecordIndex.value = i
}

function byteClass(globalIndex: number) {
  if (!headerSummary.value) return 'px-1'
  const headerEnd = headerSummary.value.headerBytes
  if (globalIndex < headerEnd) return 'px-1 bg-gray-200 dark:bg-gray-700'
  if (selectedRecordIndex.value == null) return 'px-1'
  const rec = records.value[selectedRecordIndex.value]
  const start = rec.offset
  const end = rec.offset + 9 + rec.length
  if (globalIndex >= start && globalIndex < end) return 'px-1 bg-yellow-200 dark:bg-yellow-800'
  return 'px-1'
}

function formatBytes(size: number): string {
  if (size === 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return `${(size / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString()
}

async function getThreadDump() {
  if (!processStore.currentProcess?.pid) return
  const response = await threadApi.getThreadDump(processStore.currentProcess.pid)
  if (response.areSuccess) {
    threadDump.value = response.data
  } else {
    console.error('获取线程转储失败:', response.msg)
  }
}

onMounted(() => {
  getThreadDump()
})
</script>

<style scoped>
</style>
