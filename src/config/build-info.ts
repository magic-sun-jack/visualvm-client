// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.11",
  "buildTime": "2025-10-28T09:33:42.303Z",
  "git": {
    "commitHash": "6fbf211",
    "commitCount": "83",
    "branch": "main"
  },
  "buildNumber": "83"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
