/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_USE_MOCK_DATA: string
  readonly VITE_MOCK_DELAY: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_ENABLE_THEME_SWITCH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Allow importing of Vue SFC without TS complaining
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}