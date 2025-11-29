// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.12",
  "buildTime": "2025-11-28T10:56:38.417Z",
  "git": {
    "commitHash": "9d354d2",
    "commitCount": "94",
    "branch": "main"
  },
  "buildNumber": "94"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
