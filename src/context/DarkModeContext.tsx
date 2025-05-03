import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// 定义Context类型
interface DarkModeContextType {
  isDark: boolean
  toggleDark: () => void
}

// 创建Context，默认值为null
const DarkModeContext = createContext<DarkModeContextType | null>(null)

// Provider组件属性类型
interface DarkModeProviderProps {
  children: ReactNode
}

/**
 * 暗色模式Provider组件
 */
export function DarkModeProvider({ children }: DarkModeProviderProps) {
  // 获取初始暗色模式状态
  const getInitialDarkMode = (): boolean => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      return savedMode === 'true'
    }

    // 检查系统偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const [isDark, setIsDark] = useState<boolean>(getInitialDarkMode)

  // 切换暗色模式
  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev
      localStorage.setItem('darkMode', String(newValue))
      return newValue
    })
  }, [])

  // 监听系统颜色方案变化
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      // 只有用户没有设置过明确偏好时才跟随系统
      if (localStorage.getItem('darkMode') === null) {
        setIsDark(e.matches)
      }
    }

    darkModeMediaQuery.addEventListener('change', handleColorSchemeChange)

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleColorSchemeChange)
    }
  }, [])

  // 应用暗色模式到文档
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // 创建context值
  const contextValue: DarkModeContextType = {
    isDark,
    toggleDark,
  }

  return (
    <DarkModeContext.Provider value={contextValue}>{children}</DarkModeContext.Provider>
  )
}

/**
 * 使用暗色模式的钩子
 * @returns 暗色模式状态和切换函数
 */
export function useDarkMode(): DarkModeContextType {
  const context = useContext(DarkModeContext)

  if (!context) {
    throw new Error('useDarkMode must use in DarkModeProvider')
  }

  return context
}
