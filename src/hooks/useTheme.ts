import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark'

interface UseThemeReturn {
  theme: ThemeMode
  toggleTheme: () => void
  isDark: boolean
}

/**
 * 主题管理钩子，处理应用主题切换
 */
export function useTheme(): UseThemeReturn {
  // 初始主题状态，优先使用系统主题
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme) {
      return savedTheme
    }

    return prefersDark ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const isDark = theme === 'dark'

  // 切换主题
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newTheme)
      return newTheme
    })
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    darkModeMediaQuery.addEventListener('change', handleThemeChange)

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [])

  // 应用主题到文档
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return {
    theme,
    toggleTheme,
    isDark,
  }
}
