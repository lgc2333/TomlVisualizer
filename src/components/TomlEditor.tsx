import { makeStyles, tokens } from '@fluentui/react-components'
import Editor from '@monaco-editor/react'
import { parse as parseToml } from '@std/toml'

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

export function TomlEditor({ onChange, initialValue, isDark }: TomlEditorProps) {
  const styles = useStyles()

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
  const handleEditorDidMount = () => {
    const initialTomlValue = initialValue || DEFAULT_TOML

    // 初始解析
    try {
      const parsedValue = parseToml(initialTomlValue)
      onChange(initialTomlValue, parsedValue, null)
    } catch (error) {
      onChange(initialTomlValue, null, error as Error)
    }
  }

  return (
    <div className={styles.container}>
      <Editor
        defaultLanguage="toml"
        defaultValue={initialValue || DEFAULT_TOML}
        theme={isDark ? 'fluent-dark' : 'fluent'}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          wordWrap: 'on',
          fontSize: 14,
          tabSize: 2,
        }}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        height="100%"
        width="100%"
      />
    </div>
  )
}
