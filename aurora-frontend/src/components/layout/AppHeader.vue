<template>
  <header class="app-header glass">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <span class="logo-text">Aurora</span>
        </router-link>
        
        <!-- 主导航 -->
        <nav class="main-nav" :class="{ 'mobile-open': mobileMenuOpen }">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="nav-link"
            @click="mobileMenuOpen = false"
          >
            {{ $t(item.label) }}
          </router-link>
        </nav>
        
        <!-- 右侧操作区 -->
        <div class="header-actions">
          <!-- 搜索 -->
          <el-popover
            placement="bottom"
            :width="300"
            trigger="click"
            :show-arrow="false"
          >
            <template #reference>
              <el-button :icon="Search" circle />
            </template>
            <el-input
              v-model="searchQuery"
              :placeholder="$t('common.search')"
              @keyup.enter="handleSearch"
            >
              <template #suffix>
                <el-icon @click="handleSearch" style="cursor: pointer;">
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </el-popover>
          
          <!-- 主题切换 -->
          <el-button 
            :icon="themeStore.theme === 'dark' ? Sunny : Moon" 
            circle
            @click="themeStore.toggleTheme"
          />
          
          <!-- 语言切换 -->
          <el-dropdown @command="handleLanguageChange">
            <el-button circle>
              <el-icon><Translate /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
                <el-dropdown-item command="en-US">English</el-dropdown-item>
                <el-dropdown-item command="ja-JP">日本語</el-dropdown-item>
                <el-dropdown-item command="ko-KR">한국어</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 写文章 -->
          <router-link v-if="userStore.isLoggedIn" to="/write">
            <el-button type="primary" :icon="EditPen">
              {{ $t('nav.write') }}
            </el-button>
          </router-link>
          
          <!-- 用户菜单 -->
          <div v-if="userStore.isLoggedIn" class="user-menu">
            <el-dropdown @command="handleUserCommand">
              <div class="user-avatar">
                <el-avatar :src="userStore.avatar" :size="36">
                  {{ userStore.username[0] }}
                </el-avatar>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    {{ $t('user.profile') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="articles">
                    <el-icon><Document /></el-icon>
                    {{ $t('user.articles') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites">
                    <el-icon><Star /></el-icon>
                    {{ $t('user.favorites') }}
                  </el-dropdown-item>
                  <el-dropdown-item divided command="settings">
                    <el-icon><Setting /></el-icon>
                    {{ $t('user.settings') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    {{ $t('common.logout') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 登录/注册按钮 -->
          <div v-else class="auth-buttons">
            <router-link to="/login">
              <el-button>{{ $t('common.login') }}</el-button>
            </router-link>
            <router-link to="/register">
              <el-button type="primary">{{ $t('common.register') }}</el-button>
            </router-link>
          </div>
          
          <!-- 移动端菜单按钮 -->
          <el-button 
            class="mobile-menu-btn"
            :icon="mobileMenuOpen ? Close : Menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
            circle
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { 
  Search, Sunny, Moon, EditPen, User, Document, 
  Star, Setting, SwitchButton, Menu, Close, Translate
} from '@element-plus/icons-vue'

const router = useRouter()
const { locale } = useI18n()
const userStore = useUserStore()
const themeStore = useThemeStore()

const searchQuery = ref('')
const mobileMenuOpen = ref(false)

const navItems = [
  { path: '/', label: 'nav.home' },
  { path: '/articles', label: 'nav.articles' },
  { path: '/category/frontend', label: 'nav.tech' },
  { path: '/category/yijing', label: 'nav.culture' },
  { path: '/category/a-shares', label: 'nav.stock' },
  { path: '/category/bitcoin', label: 'nav.crypto' },
  { path: '/gallery', label: 'nav.gallery' }
]

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/articles',
      query: { search: searchQuery.value }
    })
    searchQuery.value = ''
  }
}

const handleLanguageChange = (lang) => {
  locale.value = lang
  localStorage.setItem('aurora-locale', lang)
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/user-center/profile')
      break
    case 'articles':
      router.push('/user-center/articles')
      break
    case 'favorites':
      router.push('/user-center/favorites')
      break
    case 'settings':
      router.push('/user-center/settings')
      break
    case 'logout':
      userStore.handleLogout()
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 100;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  
  .logo-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.main-nav {
  display: flex;
  gap: 8px;
  
  .nav-link {
    padding: 8px 16px;
    color: var(--text-color);
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      color: var(--primary-color);
      background: var(--bg-secondary);
    }
    
    &.router-link-active {
      color: var(--primary-color);
      background: var(--bg-secondary);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.05);
  }
}

.auth-buttons {
  display: flex;
  gap: 8px;
}

.mobile-menu-btn {
  display: none;
}

// 移动端适配
@media (max-width: 768px) {
  .app-header {
    height: 56px;
  }
  
  .main-nav {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    background: var(--nav-bg);
    flex-direction: column;
    padding: 16px;
    transform: translateX(-100%);
    transition: transform 0.3s;
    
    &.mobile-open {
      transform: translateX(0);
    }
  }
  
  .auth-buttons {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .header-actions > *:not(.mobile-menu-btn) {
    display: none;
  }
}
</style>