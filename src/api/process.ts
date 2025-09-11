import { processApi } from '.'
import type { ApiResponse, JavaProcess, ProcessStartParams } from '@/types'

export interface ProcessConfig {
  pid: string
  host?: string
  port?: number
}

/**
 * 获取系统中运行的 Java 进程列表
 */
export async function getJavaProcesses(): Promise<ApiResponse<JavaProcess[]>> {
  const response = await processApi.getProcesses()
  return response
}

/**
 * 开始监控指定的 Java 进程
 * @param config 进程配置信息
 */
export async function startMonitoring(config: ProcessConfig): Promise<ApiResponse<void>> {
  // 适配为 ProcessStartParams
  const params: ProcessStartParams = {
    jarPath: '', // 这里不需要 jarPath，因为是监控已存在的进程
    pid: config.pid,
    host: config.host,
    port: config.port
  } as any // 使用 any 来绕过类型检查，因为我们的用例与默认接口不完全匹配

  const response = await processApi.startProcess(params)
  return {
    ...response,
    data: undefined // 转换返回类型为 void
  }
}

/**
 * 停止监控指定的 Java 进程
 * @param pid 进程 ID
 */
export async function stopMonitoring(pid: string): Promise<ApiResponse<void>> {
  const response = await processApi.stopProcess(pid)
  return response
}
