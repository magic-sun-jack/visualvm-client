// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.5",
  "buildTime": "2025-10-11T07:57:36.724Z",
  "git": {
    "commitHash": "ceedc33",
    "commitCount": "62",
    "branch": "main"
  },
  "buildNumber": "62"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
