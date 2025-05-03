import * as monaco from 'monaco-editor'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { language as tomlLangDef } from './utils/monaco-toml'
import './index.css'
import './i18n.ts'

monaco.languages.register({ id: 'toml' })
monaco.languages.setMonarchTokensProvider('toml', tomlLangDef)

createRoot(document.getElementById('root')!).render(<App />)
