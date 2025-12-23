// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.15",
  "buildTime": "2025-12-23T12:12:14.396Z",
  "git": {
    "commitHash": "74eebfe",
    "commitCount": "113",
    "branch": "main"
  },
  "buildNumber": "113"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
