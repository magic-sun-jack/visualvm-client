// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.7",
  "buildTime": "2025-10-17T09:44:07.684Z",
  "git": {
    "commitHash": "10647be",
    "commitCount": "74",
    "branch": "main"
  },
  "buildNumber": "74"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
