#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const packageJsonPath = join(projectRoot, 'package.json')

// 读取当前版本
function getCurrentVersion() {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  return packageJson.version
}

// 更新版本号
function updateVersion(type = 'patch') {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const currentVersion = packageJson.version
  const [major, minor, patch] = currentVersion.split('.').map(Number)
  
  let newVersion
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`
      break
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`
      break
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`
      break
  }
  
  packageJson.version = newVersion
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  
  console.log(`版本已更新: ${currentVersion} -> ${newVersion}`)
  return newVersion
}

// 获取 git 提交信息
function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    return { commitHash, commitCount, branch }
  } catch (error) {
    console.warn('无法获取 git 信息:', error.message)
    return { commitHash: 'unknown', commitCount: '0', branch: 'unknown' }
  }
}

// 生成构建信息
function generateBuildInfo() {
  const version = getCurrentVersion()
  const gitInfo = getGitInfo()
  const buildTime = new Date().toISOString()
  
  const buildInfo = {
    version,
    buildTime,
    git: gitInfo,
    buildNumber: gitInfo.commitCount
  }
  
  // 将构建信息写入文件
  const buildInfoPath = join(projectRoot, 'src', 'config', 'build-info.ts')
  const buildInfoContent = `// 自动生成的构建信息
export const buildInfo = ${JSON.stringify(buildInfo, null, 2)} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
`
  
  writeFileSync(buildInfoPath, buildInfoContent)
  console.log('构建信息已生成:', buildInfoPath)
  
  return buildInfo
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const versionType = args[0] || 'patch'
  
  console.log('开始更新版本号...')
  
  // 更新版本号
  const newVersion = updateVersion(versionType)
  
  // 生成构建信息
  const buildInfo = generateBuildInfo()
  
  console.log('版本更新完成!')
  console.log('新版本:', newVersion)
  console.log('构建时间:', buildInfo.buildTime)
  console.log('Git 提交:', buildInfo.git.commitHash)
  console.log('构建编号:', buildInfo.buildNumber)
}

main()
