// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.19",
  "buildTime": "2026-01-15T02:20:21.094Z",
  "git": {
    "commitHash": "7af21be",
    "commitCount": "135",
    "branch": "main"
  },
  "buildNumber": "135"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
