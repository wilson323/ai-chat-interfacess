import { createContext, useContext } from 'react';
// Record is a built-in TypeScript utility type, no need to import
import zh from './zh';
import en from './en';

const resources: Record<string, any> = { zh, en };

export const I18nContext = createContext({
  lang: 'zh',
  t: (key: string) => key,
  setLang: (_lang: string) => { /* no-op */ },
});

export function useTranslation() {
  const ctx = useContext(I18nContext);
  return {
    t: (key: string) => {
      const dict = resources[ctx.lang] || resources.zh;
      const parts = key.split('.');
      let val: unknown = dict;
      for (const p of parts) val = (val as any)?.[p];
      return typeof val === 'string' ? val : key;
    },
    lang: ctx.lang,
    setLang: ctx.setLang,
  };
}
