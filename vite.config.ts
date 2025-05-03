import monaco from '@tomjs/vite-plugin-monaco-editor'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), monaco({ local: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 'monaco-editor': ['monaco-editor'],
          'react-vendor': [
            'react',
            'react-dom',
            'react-i18next',
            'i18next',
            'i18next-browser-languagedetector',
          ],
          'fluent-ui': ['@fluentui/react-components', '@fluentui/react-icons'],
        },
      },
    },
  },
})
