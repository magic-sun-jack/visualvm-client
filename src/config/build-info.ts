// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.17",
  "buildTime": "2026-01-13T01:22:54.789Z",
  "git": {
    "commitHash": "a66f713",
    "commitCount": "130",
    "branch": "main"
  },
  "buildNumber": "130"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
