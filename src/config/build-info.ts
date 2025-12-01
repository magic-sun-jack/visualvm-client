// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.13",
  "buildTime": "2025-12-01T01:48:27.061Z",
  "git": {
    "commitHash": "25f89df",
    "commitCount": "98",
    "branch": "main"
  },
  "buildNumber": "98"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
