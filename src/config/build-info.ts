// 自动生成的构建信息
export const buildInfo = {
  "version": "1.0.8",
  "buildTime": "2025-10-22T07:35:58.273Z",
  "git": {
    "commitHash": "24a2905",
    "commitCount": "81",
    "branch": "main"
  },
  "buildNumber": "81"
} as const

export const getVersion = () => buildInfo.version
export const getBuildTime = () => buildInfo.buildTime
export const getGitHash = () => buildInfo.git.commitHash
export const getBuildNumber = () => buildInfo.buildNumber
