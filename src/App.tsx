import {
  Button,
  FluentProvider,
  makeStyles,
  shorthands,
  tokens,
  Tooltip,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  ArrowCollapseAll24Filled,
  ArrowExpandAll24Filled,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
} from '@fluentui/react-icons'
import { Icon } from '@iconify/react'
import { useMonaco } from '@monaco-editor/react'
import * as lodash from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import LanguageSwitcher from './components/LanguageSwitcher'
import { ResizablePanel } from './components/ResizablePanel'
import { TomlEditor } from './components/TomlEditor'
import { TomlViewer } from './components/TomlViewer'
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'
import './App.css'

// 样式定义
const useStyles = makeStyles({
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('8px', '16px'),
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  titleMobile: {
    fontSize: `${tokens.fontSizeBase400} !important`,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    overflowY: 'hidden',
    margin: '8px',
    marginTop: 0,
  },
  monacoLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground3,
  },
})

// 主应用内容组件
function AppContent() {
  const styles = useStyles()
  const { isDark, toggleDark } = useDarkMode()
  const { t } = useTranslation()
  const monaco = useMonaco()

  const [tomlData, setTomlData] = useState<any>(null)
  const [tomlError, setTomlError] = useState<Error | null>(null)

  // 添加展开/收起全部的状态控制
  const [expandAll, setExpandAll] = useState<boolean>(false)
  const [collapseAll, setCollapseAll] = useState<boolean>(false)

  const [viewAnimationRunning, setViewAnimationRunning] = useState<boolean>(false)

  const mobileBreakpoint = 1024 // 默认断点为768px

  const [isMobile, setIsMobile] = useState(false)

  // 检测屏幕宽度并更新布局方向
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [mobileBreakpoint])

  // 处理主题过渡动画
  const handleThemeToggle = () => {
    document.documentElement.style.viewTransitionName = 'root'
    document.startViewTransition(() => {
      toggleDark()
    })
  }

  // 处理TOML编辑器的变化
  const handleTomlChange = lodash.throttle(
    (_value: string, parsedValue: any, error: Error | null) => {
      setTomlData(parsedValue)
      setTomlError(error)
    },
    200,
    { leading: false, trailing: true },
  )

  // 处理展开全部按钮点击
  const handleExpandAll = () => {
    setExpandAll(true)
    setCollapseAll(false)
  }

  // 处理收起全部按钮点击
  const handleCollapseAll = () => {
    setCollapseAll(true)
    setExpandAll(false)
  }

  // 节点状态变更后重置控制标志
  const handleExpandStateChange = () => {
    setExpandAll(false)
    setCollapseAll(false)
  }

  const handleViewerAnimationStart = () => {
    setViewAnimationRunning(true)
  }

  const handleViewerAnimationEnd = () => {
    setViewAnimationRunning(false)
  }

  useEffect(() => {
    document.title = t('app.title')
  }, [t])

  const getPureVarStrVal = (varName: string) => {
    return getComputedStyle(
      document.querySelector('#root')!.children[0],
    ).getPropertyValue(varName)
  }

  const getVarVal = (varName: string) =>
    getPureVarStrVal(varName.replace(/^var\(/, '').replace(/\)$/, ''))

  const getBackgroundColor = () => getVarVal(tokens.colorNeutralBackground1)

  useEffect(() => {
    if (monaco) {
      const themeId = isDark ? 'fluent-dark' : 'fluent'
      monaco.editor.defineTheme(themeId, {
        base: isDark ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': getBackgroundColor(),
        },
      })
    }
  }, [monaco, isDark])

  const treeOpBtnDisabled = useMemo(() => {
    return (
      viewAnimationRunning ||
      !tomlData ||
      Object.keys(tomlData).length === 0 ||
      Boolean(tomlError)
    )
  }, [tomlData, tomlError, viewAnimationRunning])

  return (
    <FluentProvider theme={isDark ? webDarkTheme : webLightTheme}>
      <div className={styles.app}>
        <header className={styles.header}>
          <Tooltip content={t('app.description')}>
            <div className={`${styles.title} ${isMobile ? styles.titleMobile : ''}`}>
              {t('app.title')}
            </div>
          </Tooltip>
          <div className={styles.headerActions}>
            <Tooltip content={t('app.expandAll')}>
              <Button
                appearance="subtle"
                icon={<ArrowExpandAll24Filled />}
                onClick={handleExpandAll}
                aria-label={t('app.expandAll')}
                disabled={treeOpBtnDisabled}
              />
            </Tooltip>
            <Tooltip content={t('app.collapseAll')}>
              <Button
                appearance="subtle"
                icon={<ArrowCollapseAll24Filled />}
                onClick={handleCollapseAll}
                aria-label={t('app.collapseAll')}
                disabled={treeOpBtnDisabled}
              />
            </Tooltip>
            <Tooltip content={t('app.github')}>
              <a href="https://github.com/lgc2333/TomlVisualizer" target="_blank">
                <Button
                  appearance="subtle"
                  icon={<Icon icon="proicons:github" />}
                  aria-label={t('app.github')}
                />
              </a>
            </Tooltip>
            <LanguageSwitcher />
            <Tooltip content={isDark ? t('app.lightMode') : t('app.darkMode')}>
              <Button
                appearance="subtle"
                icon={isDark ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
                onClick={handleThemeToggle}
                aria-label={isDark ? t('app.lightMode') : t('app.darkMode')}
              />
            </Tooltip>
          </div>
        </header>
        <main className={styles.mainContent}>
          <ResizablePanel
            left={
              monaco ? (
                <TomlEditor onChange={handleTomlChange} isDark={isDark} />
              ) : (
                <div className={styles.monacoLoading}>加载编辑器中...</div>
              )
            }
            right={
              <TomlViewer
                data={tomlData}
                error={tomlError}
                expandAll={expandAll}
                collapseAll={collapseAll}
                onExpandStateChange={handleExpandStateChange}
                onAnimationStart={handleViewerAnimationStart}
                onAnimationEnd={handleViewerAnimationEnd}
              />
            }
            initialLeftWidth={50}
            isVertical={isMobile}
            minLeftWidth={20}
            maxLeftWidth={80}
          />
        </main>
      </div>
    </FluentProvider>
  )
}

// 包装App组件，提供DarkModeProvider
function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  )
}

export default App
