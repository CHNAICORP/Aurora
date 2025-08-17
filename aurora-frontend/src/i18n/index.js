import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
import jaJP from './locales/ja-JP.json'
import koKR from './locales/ko-KR.json'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR
}

// 获取浏览器语言
function getDefaultLocale() {
  const savedLocale = localStorage.getItem('aurora-locale')
  if (savedLocale && messages[savedLocale]) {
    return savedLocale
  }
  
  const browserLang = navigator.language
  if (messages[browserLang]) {
    return browserLang
  }
  
  // 尝试匹配语言代码前缀
  const langPrefix = browserLang.split('-')[0]
  const matchedLocale = Object.keys(messages).find(locale => 
    locale.startsWith(langPrefix)
  )
  
  return matchedLocale || 'zh-CN'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true
})

export default i18n