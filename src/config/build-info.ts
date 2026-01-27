// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.22",
  "buildTime": "2026-01-21T09:10:32.020Z",
  "git": {
    "commitHash": "a662de3",
    "commitCount": "145",
    "branch": "main"
  },
  "buildNumber": "145"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
