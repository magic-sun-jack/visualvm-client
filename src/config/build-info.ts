// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.14",
  "buildTime": "2025-12-20T02:18:39.352Z",
  "git": {
    "commitHash": "619ef1e",
    "commitCount": "110",
    "branch": "main"
  },
  "buildNumber": "110"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
