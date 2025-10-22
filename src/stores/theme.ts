import { ref, computed } from 'vue'

export interface ThemeConfig {
  name: string
  displayName: string
  description: string
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
  }
  fonts: {
    sans: string
    mono: string
    serif: string
  }
  borderRadius: string
  shadows: {
    soft: string
    medium: string
    large: string
  }
}

// 定义多种主题配置
const themes: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: '经典',
    description: '经典的蓝白配色，简洁专业',
    colors: {
      background: '0 0% 100%',
      foreground: '0 0% 3.9%',
      card: '0 0% 100%',
      cardForeground: '0 0% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 3.9%',
      primary: '0 0% 9%',
      primaryForeground: '0 0% 98%',
      secondary: '0 0% 96.1%',
      secondaryForeground: '0 0% 9%',
      muted: '0 0% 96.1%',
      mutedForeground: '0 0% 45.1%',
      accent: '0 0% 96.1%',
      accentForeground: '0 0% 9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '0 0% 89.8%',
      input: '0 0% 89.8%',
      ring: '0 0% 3.9%'
    },
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      mono: 'JetBrains Mono, ui-monospace, monospace',
      serif: 'Georgia, ui-serif, serif'
    },
    borderRadius: '0.5rem',
    shadows: {
      soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      large: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  },
  dark: {
    name: 'dark',
    displayName: '暗夜',
    description: '深色主题，护眼舒适',
    colors: {
      background: '0 0% 3.9%',
      foreground: '0 0% 98%',
      card: '0 0% 3.9%',
      cardForeground: '0 0% 98%',
      popover: '0 0% 3.9%',
      popoverForeground: '0 0% 98%',
      primary: '0 0% 98%',
      primaryForeground: '0 0% 9%',
      secondary: '0 0% 14.9%',
      secondaryForeground: '0 0% 98%',
      muted: '0 0% 14.9%',
      mutedForeground: '0 0% 63.9%',
      accent: '0 0% 14.9%',
      accentForeground: '0 0% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 98%',
      border: '0 0% 14.9%',
      input: '0 0% 14.9%',
      ring: '0 0% 83.1%'
    },
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      mono: 'JetBrains Mono, ui-monospace, monospace',
      serif: 'Georgia, ui-serif, serif'
    },
    borderRadius: '0.5rem',
    shadows: {
      soft: '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
      medium: '0 4px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      large: '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 20px 25px -5px rgba(0, 0, 0, 0.3)'
    }
  },
  ocean: {
    name: 'ocean',
    displayName: '海洋',
    description: '清新的海洋蓝绿色调，现代时尚',
    colors: {
      background: '200 100% 98%',
      foreground: '200 50% 10%',
      card: '200 100% 100%',
      cardForeground: '200 50% 10%',
      popover: '200 100% 100%',
      popoverForeground: '200 50% 10%',
      primary: '200 100% 30%',
      primaryForeground: '200 100% 98%',
      secondary: '200 50% 95%',
      secondaryForeground: '200 50% 10%',
      muted: '200 30% 95%',
      mutedForeground: '200 30% 45%',
      accent: '200 80% 40%',
      accentForeground: '200 100% 98%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '200 30% 90%',
      input: '200 30% 90%',
      ring: '200 100% 30%'
    },
    fonts: {
      sans: 'Poppins, ui-sans-serif, system-ui, sans-serif',
      mono: 'Fira Code, ui-monospace, monospace',
      serif: 'Playfair Display, ui-serif, serif'
    },
    borderRadius: '0.75rem',
    shadows: {
      soft: '0 2px 15px -3px rgba(34, 197, 94, 0.1), 0 10px 20px -2px rgba(34, 197, 94, 0.05)',
      medium: '0 4px 25px -5px rgba(34, 197, 94, 0.15), 0 10px 10px -5px rgba(34, 197, 94, 0.05)',
      large: '0 10px 40px -10px rgba(34, 197, 94, 0.2), 0 20px 25px -5px rgba(34, 197, 94, 0.1)'
    }
  },
  sunset: {
    name: 'sunset',
    displayName: '日落',
    description: '温暖的橙红色调，温馨舒适',
    colors: {
      background: '30 100% 98%',
      foreground: '30 50% 10%',
      card: '30 100% 100%',
      cardForeground: '30 50% 10%',
      popover: '30 100% 100%',
      popoverForeground: '30 50% 10%',
      primary: '30 100% 50%',
      primaryForeground: '30 100% 98%',
      secondary: '30 50% 95%',
      secondaryForeground: '30 50% 10%',
      muted: '30 30% 95%',
      mutedForeground: '30 30% 45%',
      accent: '30 80% 60%',
      accentForeground: '30 100% 98%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '30 30% 90%',
      input: '30 30% 90%',
      ring: '30 100% 50%'
    },
    fonts: {
      sans: 'Nunito, ui-sans-serif, system-ui, sans-serif',
      mono: 'Source Code Pro, ui-monospace, monospace',
      serif: 'Merriweather, ui-serif, serif'
    },
    borderRadius: '1rem',
    shadows: {
      soft: '0 2px 15px -3px rgba(251, 146, 60, 0.1), 0 10px 20px -2px rgba(251, 146, 60, 0.05)',
      medium: '0 4px 25px -5px rgba(251, 146, 60, 0.15), 0 10px 10px -5px rgba(251, 146, 60, 0.05)',
      large: '0 10px 40px -10px rgba(251, 146, 60, 0.2), 0 20px 25px -5px rgba(251, 146, 60, 0.1)'
    }
  },
  forest: {
    name: 'forest',
    displayName: '森林',
    description: '自然的绿色调，清新环保',
    colors: {
      background: '120 100% 98%',
      foreground: '120 50% 10%',
      card: '120 100% 100%',
      cardForeground: '120 50% 10%',
      popover: '120 100% 100%',
      popoverForeground: '120 50% 10%',
      primary: '120 100% 25%',
      primaryForeground: '120 100% 98%',
      secondary: '120 50% 95%',
      secondaryForeground: '120 50% 10%',
      muted: '120 30% 95%',
      mutedForeground: '120 30% 45%',
      accent: '120 80% 35%',
      accentForeground: '120 100% 98%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '120 30% 90%',
      input: '120 30% 90%',
      ring: '120 100% 25%'
    },
    fonts: {
      sans: 'Open Sans, ui-sans-serif, system-ui, sans-serif',
      mono: 'Roboto Mono, ui-monospace, monospace',
      serif: 'Lora, ui-serif, serif'
    },
    borderRadius: '0.25rem',
    shadows: {
      soft: '0 2px 15px -3px rgba(34, 197, 94, 0.1), 0 10px 20px -2px rgba(34, 197, 94, 0.05)',
      medium: '0 4px 25px -5px rgba(34, 197, 94, 0.15), 0 10px 10px -5px rgba(34, 197, 94, 0.05)',
      large: '0 10px 40px -10px rgba(34, 197, 94, 0.2), 0 20px 25px -5px rgba(34, 197, 94, 0.1)'
    }
  },
  purple: {
    name: 'purple',
    displayName: '紫罗兰',
    description: '神秘的紫色调，优雅高贵',
    colors: {
      background: '280 100% 98%',
      foreground: '280 50% 10%',
      card: '280 100% 100%',
      cardForeground: '280 50% 10%',
      popover: '280 100% 100%',
      popoverForeground: '280 50% 10%',
      primary: '280 100% 50%',
      primaryForeground: '280 100% 98%',
      secondary: '280 50% 95%',
      secondaryForeground: '280 50% 10%',
      muted: '280 30% 95%',
      mutedForeground: '280 30% 45%',
      accent: '280 80% 60%',
      accentForeground: '280 100% 98%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '280 30% 90%',
      input: '280 30% 90%',
      ring: '280 100% 50%'
    },
    fonts: {
      sans: 'Montserrat, ui-sans-serif, system-ui, sans-serif',
      mono: 'Cascadia Code, ui-monospace, monospace',
      serif: 'Crimson Text, ui-serif, serif'
    },
    borderRadius: '1.25rem',
    shadows: {
      soft: '0 2px 15px -3px rgba(147, 51, 234, 0.1), 0 10px 20px -2px rgba(147, 51, 234, 0.05)',
      medium: '0 4px 25px -5px rgba(147, 51, 234, 0.15), 0 10px 10px -5px rgba(147, 51, 234, 0.05)',
      large: '0 10px 40px -10px rgba(147, 51, 234, 0.2), 0 20px 25px -5px rgba(147, 51, 234, 0.1)'
    }
  }
}

const currentTheme = ref<string>('default')

export function useTheme() {
  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      currentTheme.value = themeName
      applyTheme(themes[themeName])
      localStorage.setItem('theme', themeName)
    }
  }

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement
    
    // 应用颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    
    // 应用字体
    root.style.setProperty('--font-sans', theme.fonts.sans)
    root.style.setProperty('--font-mono', theme.fonts.mono)
    root.style.setProperty('--font-serif', theme.fonts.serif)
    
    // 应用圆角
    root.style.setProperty('--radius', theme.borderRadius)
    
    // 应用阴影
    root.style.setProperty('--shadow-soft', theme.shadows.soft)
    root.style.setProperty('--shadow-medium', theme.shadows.medium)
    root.style.setProperty('--shadow-large', theme.shadows.large)
    
    // 更新HTML类名
    root.className = root.className.replace(/theme-\w+/g, '')
    root.classList.add(`theme-${theme.name}`)
  }

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const themeName = savedTheme && themes[savedTheme] ? savedTheme : 'default'
    setTheme(themeName)
  }

  const availableThemes = computed(() => Object.values(themes))
  const currentThemeConfig = computed(() => themes[currentTheme.value])

  return {
    currentTheme,
    currentThemeConfig,
    availableThemes,
    setTheme,
    initializeTheme
  }
}
