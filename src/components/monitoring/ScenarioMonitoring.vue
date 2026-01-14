<template>
  <div class="scenario-monitoring">
    <div v-if="!selectedScenarios.length" class="text-center py-8 text-muted-foreground">
      请选择一个监控场景
    </div>

    <div v-else-if="loading" class="text-center py-8">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        加载中...
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- 配置信息 -->
      <div class="grid grid-cols-1 lg:grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">监控配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center gap-4 flex-wrap">
              <div v-for="option in scenarioOptions" :key="option.value" class="flex items-center gap-2">
                <Checkbox :id="`scenario-${option.value}`" :model-value="selectedScenarios.includes(option.value)"
                  @update:model-value="(value: boolean | 'indeterminate') => {
                    const checked = value === true
                    handleScenarioToggle(option.value, checked)
                  }" />
                <label :for="`scenario-${option.value}`"
                  class="text-sm font-medium leading-none cursor-pointer select-none">
                  {{ option.label }}
                </label>
              </div>
            </div>
            <div class="space-y-2 text-sm mt-5">
              <div class="flex items-center gap-2">
                <label for="refreshPeriod" class="text-muted-foreground whitespace-nowrap">采样间隔 (ms):</label>
                <Input id="refreshPeriod" v-model.number="refreshPeriod" type="number" min="100" step="100" class="w-32"
                  :disabled="isMonitoring" />
              </div>
            </div>
            <div class="flex items-center gap-2 mt-5">
              <Label for="filterType" class="text-muted-foreground whitespace-nowrap">过滤类型:</Label>
              <RadioGroup id="filterType" :model-value="filterType" class="flex items-center gap-4" @update:model-value="(val: string) => {
                if (val === 'include' || val === 'exclude') {
                  filterType = val
                }
              }">
                <div class="flex items-center gap-2">
                  <RadioGroupItem value="include" id="filter-include" />
                  <Label for="filter-include" class="text-sm font-normal cursor-pointer">包含</Label>
                </div>
                <div class="flex items-center gap-2">
                  <RadioGroupItem value="exclude" id="filter-exclude" />
                  <Label for="filter-exclude" class="text-sm font-normal cursor-pointer">排除</Label>
                </div>
              </RadioGroup>
            </div>
            <!-- 配置文件编辑区域 -->
            <div class="mt-6 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">配置文件：</span>
                  <span class="text-xs text-muted-foreground break-all">
                    @java/config/config.json
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button"
                    class="inline-flex items-center rounded border px-2 py-1 text-xs border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="isLoadingConfigFile" @click="reloadConfigFile">
                    重新加载
                  </button>
                  <button type="button"
                    class="inline-flex items-center rounded px-2 py-1 text-xs text-white bg-primary hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="isSavingConfigFile || !canPersistConfig" @click="saveConfigFile">
                    保存到文件
                  </button>
                </div>
              </div>
              <textarea v-model="rawConfigContent"
                class="w-full h-96 resize-y rounded border border-input bg-muted/50 p-2 text-xs font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                spellcheck="false" />
              <p v-if="!canPersistConfig" class="text-[11px] text-muted-foreground">
                当前运行环境无法直接写入本地配置文件，仅支持查看与临时编辑。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, Checkbox, Input, RadioGroup, RadioGroupItem, Label } from '@/components/ui'
import { scenarioApi } from '@/api'
import { useProcessStore } from '@/stores/process'
// 静态导入配置文件（非 Electron 环境的回退）
// 注意：使用相对路径指向项目根目录下的 java/config/config.json
// @ts-ignore
import scenarioConfigJson from '../../../java/config/config.json'

interface ScenarioConfigItem {
  name: string
  value: boolean | number | string
}

type ScenarioConfigMap = Record<string, ScenarioConfigItem>

interface Props {
  selectedProcess?: string
}

const props = defineProps<Props>()
const processStore = useProcessStore()
const isElectronEnv = typeof window !== 'undefined' && !!(window as any).electron

// 从全局 store 读取初始值，如果没有则使用默认值
const selectedScenarios = ref<string[]>(processStore.selectedScenarios.length > 0 ? [...processStore.selectedScenarios] : ['common'])
const refreshPeriod = ref<number>(processStore.refreshPeriod || 5000)
const filterType = ref<'include' | 'exclude'>(processStore.filterType || 'include')

const isMonitoring = ref(false)
const loading = ref(false)
const config = ref<any>(null)
const scenarioOptions = ref<Array<{ value: string; label: string }>>([])

// 配置文件与编辑状态
const configFile = ref<ScenarioConfigMap>({})
const rawConfigContent = ref('')
const isLoadingConfigFile = ref(false)
const isSavingConfigFile = ref(false)
const canPersistConfig = isElectronEnv && !!(window as any).electron?.writeConfigJson

// 场景名称到中文标签的映射
const scenarioLabelMap: Record<string, string> = {
  'common': '通用监控',
  'IO': 'IO监控',
  'Socket': 'Socket监控',
  'RPC': 'RPC监控',
  'pool': '连接池监控',
  'ORM': 'ORM监控',
  'jdbc': 'JDBC监控',
  'serialize': '序列化监控',
  'NoSql': 'NoSQL监控',
  'RMI': 'RMI监控',
  'HTTP': 'HTTP监控',
  'database': '数据库监控',
  'http': 'HTTP监控'
}

function buildScenarioOptionsFromConfig(configData: ScenarioConfigMap) {
  const entries = Object.entries(configData).filter(
    ([key]) => key !== 'refreshPeriod' && key !== 'filterType'
  )

  scenarioOptions.value = entries.map(([key, item]) => {
    const scenarioValue = key.toLowerCase()
    return {
      value: scenarioValue,
      label: item.name || scenarioLabelMap[key] || scenarioLabelMap[scenarioValue] || key
    }
  })

  const enabled = entries
    .filter(([, item]) => item.value === true)
    .map(([key]) => key.toLowerCase())

  if (enabled.length > 0) {
    selectedScenarios.value = enabled
  }

  if (configData.refreshPeriod && typeof configData.refreshPeriod.value === 'number') {
    refreshPeriod.value = configData.refreshPeriod.value as number
  }

  if (configData.filterType && typeof configData.filterType.value === 'string') {
    const v = configData.filterType.value as string
    if (v === 'include' || v === 'exclude') {
      filterType.value = v
    }
  }
}

async function loadConfigFromFile() {
  isLoadingConfigFile.value = true
  try {
    let data: ScenarioConfigMap | null = null

    if (isElectronEnv && (window as any).electron?.readConfigJson) {
      const result = await (window as any).electron.readConfigJson()
      if (result?.success && result.data) {
        data = result.data as ScenarioConfigMap
      }
    }

    if (!data) {
      data = scenarioConfigJson as ScenarioConfigMap
    }

    configFile.value = data
    rawConfigContent.value = JSON.stringify(data, null, 2)
    buildScenarioOptionsFromConfig(data)

    processStore.setSelectedScenarios([...selectedScenarios.value])
    processStore.setRefreshPeriod(refreshPeriod.value)
    processStore.setFilterType(filterType.value)
  } catch (error) {
    console.error('加载配置文件失败:', error)
  } finally {
    isLoadingConfigFile.value = false
  }
}

async function reloadConfigFile() {
  await loadConfigFromFile()
}

async function saveConfigFile() {
  if (!canPersistConfig) {
    console.warn('当前环境不支持写入配置文件')
    return
  }

  isSavingConfigFile.value = true
  try {
    let parsed: ScenarioConfigMap
    try {
      parsed = JSON.parse(rawConfigContent.value)
    } catch (e) {
      console.error('配置文件 JSON 解析失败:', e)
      return
    }

    const result = await (window as any).electron.writeConfigJson(parsed)
    if (result?.success) {
      configFile.value = parsed
      buildScenarioOptionsFromConfig(parsed)
      rawConfigContent.value = JSON.stringify(parsed, null, 2)
    }
  } catch (error) {
    console.error('保存配置文件失败:', error)
  } finally {
    isSavingConfigFile.value = false
  }
}

function updateConfigFileScenarioValue(scenarioValue: string, enabled: boolean) {
  if (!configFile.value) return
  const current: ScenarioConfigMap = { ...configFile.value }

  Object.keys(current).forEach((key) => {
    if (key.toLowerCase() === scenarioValue) {
      current[key] = {
        ...current[key],
        value: enabled
      }
    }
  })

  configFile.value = current
  rawConfigContent.value = JSON.stringify(current, null, 2)
}

// 处理场景切换（checkbox 选中/取消选中）
function handleScenarioToggle(scenarioValue: string, checked: boolean) {
  if (checked) {
    // 选中：添加到数组
    if (!selectedScenarios.value.includes(scenarioValue)) {
      selectedScenarios.value.push(scenarioValue)
    }
  } else {
    // 取消选中：从数组移除，但至少保留一个
    if (selectedScenarios.value.length > 1) {
      const index = selectedScenarios.value.indexOf(scenarioValue)
      if (index > -1) {
        selectedScenarios.value.splice(index, 1)
      }
    } else {
      // 如果只有一个，不允许取消选中
      console.warn('至少需要选择一个监控场景')
      return
    }
  }

  // 同步到全局 store
  processStore.setSelectedScenarios([...selectedScenarios.value])
  // 同步到配置文件状态
  updateConfigFileScenarioValue(scenarioValue, checked)

  // 如果正在监控，需要重新启动监控以应用新的场景选择
  if (isMonitoring.value && props.selectedProcess) {
    toggleMonitoring()
  }
}

// 处理场景切换（用于加载配置和指标）
async function handleScenarioChange(scenario: string) {
  if (!props.selectedProcess) return

  loading.value = true
  try {
    // 停止之前的监控
    if (isMonitoring.value) {
      await toggleMonitoring()
    }

    // 获取新场景的配置
    await loadScenarioConfig(scenario)
  } finally {
    loading.value = false
  }
}

// 加载场景配置
async function loadScenarioConfig(scenario: string) {
  if (!props.selectedProcess) return

  try {
    let response
    switch (scenario) {
      case 'database':
        response = await scenarioApi.getDatabaseMonitoringConfig(props.selectedProcess)
        break
      case 'io':
        response = await scenarioApi.getIOMonitoringConfig(props.selectedProcess)
        break
      case 'http':
        response = await scenarioApi.getHTTPMonitoringConfig(props.selectedProcess)
        break
      default:
        return
    }

    if (response.success) {
      config.value = response.data
    }
  } catch (error) {
    console.error('Failed to load scenario config:', error)
  }
}

// 切换监控状态
async function toggleMonitoring() {
  if (!props.selectedProcess || !selectedScenarios.value.length) return

  try {
    if (isMonitoring.value) {
      // 停止监控
      await scenarioApi.stopScenarioMonitoring(props.selectedProcess, selectedScenarios.value.join(','))
      isMonitoring.value = false
    } else {
      // 开始监控，使用 selectedScenarios 作为 filter，refreshPeriod 作为刷新周期，filterType 作为过滤类型
      await scenarioApi.startScenarioMonitoring(props.selectedProcess, selectedScenarios.value.join(','), selectedScenarios.value.join(','), refreshPeriod.value, filterType.value)
      isMonitoring.value = true
    }
  } catch (error) {
    console.error('Failed to toggle monitoring:', error)
  }
}

// 加载场景配置选项
async function loadScenarioOptions() {
  try {
    await loadConfigFromFile()

    if (scenarioOptions.value.length > 0) {
      const commonOption = scenarioOptions.value.find(opt => opt.value === 'common')
      if (!selectedScenarios.value.length) {
        selectedScenarios.value = commonOption ? [commonOption.value] : [scenarioOptions.value[0].value]
      }
      if (props.selectedProcess) {
        handleScenarioChange(selectedScenarios.value.join(','))
      }
    }
  } catch (error) {
    console.error('Failed to load scenario options from config file:', error)
    scenarioOptions.value = []
    if (props.selectedProcess && selectedScenarios.value.length) {
      handleScenarioChange(selectedScenarios.value.join(','))
    }
  }
}

// 监听 refreshPeriod 变化，同步到全局 store
watch(refreshPeriod, (newValue) => {
  if (newValue && newValue > 0) {
    processStore.setRefreshPeriod(newValue)
    if (configFile.value?.refreshPeriod) {
      configFile.value = {
        ...configFile.value,
        refreshPeriod: {
          ...configFile.value.refreshPeriod,
          value: newValue
        }
      }
      rawConfigContent.value = JSON.stringify(configFile.value, null, 2)
    }
  }
}, { immediate: true })

// 监听 selectedScenarios 变化，同步到全局 store
watch(selectedScenarios, (newValue) => {
  if (newValue && newValue.length > 0) {
    processStore.setSelectedScenarios([...newValue])
  }
}, { deep: true, immediate: true })

// 监听 filterType 变化，同步到全局 store
watch(filterType, (newValue) => {
  if (newValue) {
    processStore.setFilterType(newValue)
    if (configFile.value?.filterType) {
      configFile.value = {
        ...configFile.value,
        filterType: {
          ...configFile.value.filterType,
          value: newValue
        }
      }
      rawConfigContent.value = JSON.stringify(configFile.value, null, 2)
    }
  }
}, { immediate: true })

onMounted(() => {
  loadScenarioOptions()
})
</script>

<style scoped>
.scenario-monitoring {
  height: 100%;
}
</style>