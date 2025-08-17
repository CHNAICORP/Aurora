<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const themeStore = useThemeStore()

onMounted(() => {
  // 初始化主题
  themeStore.theme
})
</script>

<template>
  <div id="app">
    <!-- 星空背景 -->
    <div class="starry-background"></div>
    
    <!-- 主导航 -->
    <AppHeader />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <AppFooter />
    
    <!-- 回到顶部 -->
    <el-backtop :right="40" :bottom="40">
      <div class="backtop-btn">
        <el-icon><ArrowUp /></el-icon>
      </div>
    </el-backtop>
  </div>
</template>

<style lang="scss" scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-content {
  flex: 1;
  padding-top: 80px; // 为固定导航栏留出空间
  padding-bottom: 40px;
  position: relative;
  z-index: 1;
}

.backtop-btn {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  }
}

// 响应式
@media (max-width: 768px) {
  .main-content {
    padding-top: 60px;
    padding-bottom: 20px;
  }
  
  .backtop-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
