import { createContext, useContext } from 'react'
import zh from './zh'
import en from './en'

const resources: Record<string, any> = { zh, en }

export const I18nContext = createContext({
  lang: 'zh',
  t: (key: string) => key,
  setLang: (lang: string) => {},
})

export function useTranslation() {
  const ctx = useContext(I18nContext)
  return {
    t: (key: string) => {
      const dict = resources[ctx.lang] || resources.zh
      const parts = key.split('.')
      let val: any = dict
      for (const p of parts) val = val?.[p]
      return typeof val === 'string' ? val : key
    },
    lang: ctx.lang,
    setLang: ctx.setLang,
  }
} 