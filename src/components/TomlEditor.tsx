import { makeStyles, tokens } from '@fluentui/react-components'
import { parse as parseToml } from '@std/toml'
import * as monaco from 'monaco-editor'
import { useEffect, useRef } from 'react'
import { useDarkMode } from '../context/DarkModeContext'

interface TomlEditorProps {
  onChange: (value: string, parsedValue: any, error: Error | null) => void
  initialValue?: string
}

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  editorContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
})

const DEFAULT_TOML = `# This is a TOML document

title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00

[database]
enabled = true
ports = [ 8000, 8001, 8002 ]
data = [ ["delta", "phi"], [3.14] ]
temp_targets = { cpu = 79.5, case = 72.0 }

[servers]

[servers.alpha]
ip = "10.0.0.1"
role = "frontend"

[servers.beta]
ip = "10.0.0.2"
role = "backend"
`

export function TomlEditor({ onChange, initialValue }: TomlEditorProps) {
  const styles = useStyles()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isDark } = useDarkMode()

  const getPureVarStrVal = (varName: string) => {
    return getComputedStyle(
      document.querySelector('#root')!.children[0],
    ).getPropertyValue(varName)
  }

  const getVarVal = (varName: string) =>
    getPureVarStrVal(varName.replace(/^var\(/, '').replace(/\)$/, ''))

  const getBackgroundColor = () => getVarVal(tokens.colorNeutralBackground1)

  const updateTheme = () => {
    monaco.editor.defineTheme(isDark ? 'fluent-dark' : 'fluent', {
      base: isDark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': getBackgroundColor(),
      },
    })
  }

  // 简单可靠的一次性初始化
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return

    const initialTomlValue = initialValue || DEFAULT_TOML

    // 初始化编辑器
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: initialTomlValue,
      language: 'toml',
      automaticLayout: true,
      theme: 'fluent',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      wordWrap: 'on',
      fontSize: 14,
      tabSize: 2,
    })

    // 设置内容变化监听
    editorRef.current.onDidChangeModelContent(() => {
      if (editorRef.current) {
        const value = editorRef.current.getValue()
        try {
          const parsedValue = parseToml(value)
          onChange(value, parsedValue, null)
        } catch (error) {
          onChange(value, null, error as Error)
        }
      }
    })

    // 初始解析
    try {
      const parsedValue = parseToml(initialTomlValue)
      onChange(initialTomlValue, parsedValue, null)
    } catch (error) {
      onChange(initialTomlValue, null, error as Error)
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    updateTheme()
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: isDark ? 'fluent-dark' : 'fluent',
      })
    }
  }, [isDark])

  return (
    <div className={styles.container}>
      <div className={styles.editorContainer} ref={containerRef} />
    </div>
  )
}
