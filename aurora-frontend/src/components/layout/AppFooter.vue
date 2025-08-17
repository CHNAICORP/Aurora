<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <h3 class="footer-logo">Aurora</h3>
          <p class="footer-desc">探索知识的深邃，照亮思想的天空</p>
          <div class="social-links">
            <a href="#" aria-label="GitHub">
              <el-icon><Link /></el-icon>
            </a>
            <a href="#" aria-label="Twitter">
              <el-icon><Link /></el-icon>
            </a>
            <a href="#" aria-label="Email">
              <el-icon><Message /></el-icon>
            </a>
          </div>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>技术</h4>
            <router-link to="/category/frontend">前端开发</router-link>
            <router-link to="/category/backend">后端开发</router-link>
            <router-link to="/category/algorithm">算法研发</router-link>
          </div>
          
          <div class="link-group">
            <h4>文化</h4>
            <router-link to="/category/yijing">易学</router-link>
            <router-link to="/category/numerology">命理学</router-link>
            <router-link to="/category/taoism">道家修行</router-link>
          </div>
          
          <div class="link-group">
            <h4>投资</h4>
            <router-link to="/category/a-shares">A股</router-link>
            <router-link to="/category/bitcoin">比特币</router-link>
            <router-link to="/category/blockchain">区块链</router-link>
          </div>
          
          <div class="link-group">
            <h4>关于</h4>
            <router-link to="/about">关于我们</router-link>
            <router-link to="/terms">服务条款</router-link>
            <router-link to="/privacy">隐私政策</router-link>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 Aurora Blog. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Link, Message } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.app-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: 80px;
  padding: 48px 0 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
  margin-bottom: 32px;
}

.footer-info {
  .footer-logo {
    font-size: 28px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
  }
  
  .footer-desc {
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
  
  .social-links {
    display: flex;
    gap: 12px;
    
    a {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all 0.3s;
      
      &:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
      }
    }
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  
  .link-group {
    h4 {
      font-size: 16px;
      margin-bottom: 16px;
      color: var(--text-color);
    }
    
    a {
      display: block;
      color: var(--text-secondary);
      margin-bottom: 8px;
      transition: color 0.3s;
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.footer-bottom {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>