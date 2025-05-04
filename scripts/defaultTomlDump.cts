import * as fs from 'node:fs'
import * as path from 'node:path'

const tomlDir = path.join(__dirname, 'defaultToml')
const localeDir = path.join(__dirname, '../src/locales')
const files = fs.readdirSync(tomlDir)

files.forEach((file) => {
  const localeName = path.basename(file, path.extname(file))
  const tomlContent = fs.readFileSync(path.join(tomlDir, file), 'utf-8')
  const localePath = path.join(localeDir, `${localeName}.json`)
  const localeContent = fs.readFileSync(localePath, 'utf-8')
  const localeJson = JSON.parse(localeContent)
  ;(localeJson.editor ??= {}).defaultToml = tomlContent
  fs.writeFileSync(localePath, JSON.stringify(localeJson, null, 2))
})
