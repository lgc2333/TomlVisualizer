import { loader } from '@monaco-editor/react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n.ts'

// eslint-disable-next-line import/newline-after-import
;(async () => {
  const { default: monacoBefore } = await import('monaco-editor')
  loader.config({ monaco: monacoBefore })
  const monaco = await loader.init()

  const { language: tomlLangDef } = await import('./utils/monaco-toml')
  monaco.languages.register({ id: 'toml' })
  monaco.languages.setMonarchTokensProvider('toml', tomlLangDef)
})()

createRoot(document.getElementById('root')!).render(<App />)
