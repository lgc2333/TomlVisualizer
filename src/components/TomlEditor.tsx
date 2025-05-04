import type { Monaco } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import { makeStyles, tokens } from '@fluentui/react-components'
import Editor from '@monaco-editor/react'
import { parse as parseToml } from '@std/toml'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface TomlEditorProps {
  onChange: (value: string, parsedValue: any, error: Error | null) => void
  initialValue?: string
  isDark?: boolean
}

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
})

export function TomlEditor({ onChange, initialValue, isDark }: TomlEditorProps) {
  const styles = useStyles()
  const { t } = useTranslation()

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  const defaultToml = useMemo(() => {
    return t('editor.defaultToml')
  }, [t])

  // 处理编辑器内容变化
  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return

    try {
      const parsedValue = parseToml(value)
      onChange(value, parsedValue, null)
    } catch (error) {
      onChange(value, null, error as Error)
    }
  }

  // 编辑器挂载后的处理
  const handleEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor
    monacoRef.current = monaco

    const initialTomlValue = initialValue || defaultToml

    // 初始解析
    try {
      const parsedValue = parseToml(initialTomlValue)
      onChange(initialTomlValue, parsedValue, null)
    } catch (error) {
      onChange(initialTomlValue, null, error as Error)
    }
  }

  return (
    <div className={styles.container} id="editor">
      <Editor
        defaultLanguage="toml"
        defaultValue={initialValue || defaultToml}
        theme={isDark ? 'fluent-dark' : 'fluent'}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'on',
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
          insertSpaces: true,
          fixedOverflowWidgets: true,
          tabCompletion: 'on',
          useTabStops: true,
          renderWhitespace: 'selection',
          detectIndentation: true,
        }}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        height="100%"
        width="100%"
      />
    </div>
  )
}
