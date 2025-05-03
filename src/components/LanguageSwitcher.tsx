import {
  Button,
  makeStyles,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  tokens,
  Tooltip,
} from '@fluentui/react-components'
import { Globe20Regular } from '@fluentui/react-icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles({
  switcherContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  languageButton: {
    minWidth: 'auto',
    padding: '4px 8px',
  },
  popoverContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '120px',
  },
  langOption: {
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    '&.active': {
      backgroundColor: tokens.colorBrandBackground,
      color: tokens.colorNeutralForegroundOnBrand,
    },
  },
})

function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18n.language)
  const styles = useStyles()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setCurrentLang(i18n.language)
  }, [i18n.language])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setCurrentLang(lng)
    setOpen(false) // 选择语言后关闭弹出层
  }

  return (
    <div className={styles.switcherContainer}>
      <Popover open={open} onOpenChange={(_e, data) => setOpen(data.open)}>
        <PopoverTrigger>
          <Tooltip content={t('app.language')}>
            <Button
              appearance="subtle"
              icon={<Globe20Regular />}
              aria-label={t('app.language')}
              className={styles.languageButton}
            />
          </Tooltip>
        </PopoverTrigger>

        <PopoverSurface>
          <div className={styles.popoverContent}>
            <div
              className={`${styles.langOption} ${currentLang.startsWith('en') ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
            >
              English
            </div>
            <div
              className={`${styles.langOption} ${currentLang.startsWith('zh') ? 'active' : ''}`}
              onClick={() => changeLanguage('zh')}
            >
              中文
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  )
}

export default LanguageSwitcher
