import {
  Button,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
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

  useEffect(() => {
    setCurrentLang(i18n.language)
  }, [i18n.language])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setCurrentLang(lng)
  }

  return (
    <div className={styles.switcherContainer}>
      <Menu>
        <MenuTrigger>
          <Tooltip content={t('app.language')}>
            <Button
              appearance="subtle"
              icon={<Globe20Regular />}
              aria-label={t('app.language')}
              className={styles.languageButton}
            />
          </Tooltip>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem
              className={`${styles.langOption} ${currentLang.startsWith('en') ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
            >
              English
            </MenuItem>
            <MenuItem
              className={`${styles.langOption} ${currentLang.startsWith('zh') ? 'active' : ''}`}
              onClick={() => changeLanguage('zh')}
            >
              中文
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  )
}

export default LanguageSwitcher
