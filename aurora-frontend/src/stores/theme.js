import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 从本地存储获取主题设置
  const savedTheme = localStorage.getItem('aurora-theme') || 'light'
  const theme = ref(savedTheme)

  // 应用主题
  function applyTheme(themeName) {
    document.documentElement.className = themeName
    document.documentElement.style.colorScheme = themeName
    
    // 设置Element Plus主题
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // 设置主题
  function setTheme(themeName) {
    if (['light', 'dark'].includes(themeName)) {
      theme.value = themeName
    }
  }

  // 监听主题变化
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    localStorage.setItem('aurora-theme', newTheme)
  })

  // 初始化应用主题
  applyTheme(theme.value)

  return {
    theme,
    toggleTheme,
    setTheme
  }
})