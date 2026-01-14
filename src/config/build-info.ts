// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.16",
  "buildTime": "2025-12-29T02:07:56.569Z",
  "git": {
    "commitHash": "6da72cf",
    "commitCount": "126",
    "branch": "main"
  },
  "buildNumber": "126"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
