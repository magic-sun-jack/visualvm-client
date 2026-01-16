// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.20",
  "buildTime": "2026-01-16T03:26:33.150Z",
  "git": {
    "commitHash": "5bb032b",
    "commitCount": "137",
    "branch": "main"
  },
  "buildNumber": "137"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
