import { processApi } from '.'
import type { ApiResponse, JavaProcess } from '@/types'

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
  // 构造参数，适配接口要求
  const params = {
    pid: config.pid
  }

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
