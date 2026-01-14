// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.18",
  "buildTime": "2026-01-14T12:37:10.738Z",
  "git": {
    "commitHash": "364e434",
    "commitCount": "134",
    "branch": "main"
  },
  "buildNumber": "134"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
