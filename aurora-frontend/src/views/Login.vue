<template>
  <div class="auth-page">
    <div class="auth-container glass">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>登录以继续您的探索之旅</p>
      </div>
      
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            :placeholder="$t('user.username') + ' / ' + $t('user.email')"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            :placeholder="$t('user.password')"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="remember">记住我</el-checkbox>
            <router-link to="/forgot-password" class="forgot-link">
              忘记密码？
            </router-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleSubmit"
            native-type="submit"
            style="width: 100%"
          >
            {{ $t('common.login') }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="auth-footer">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
      
      <el-divider>或</el-divider>
      
      <div class="social-login">
        <el-button circle size="large" @click="handleSocialLogin('github')">
          <el-icon><Link /></el-icon>
        </el-button>
        <el-button circle size="large" @click="handleSocialLogin('google')">
          <el-icon><Link /></el-icon>
        </el-button>
        <el-button circle size="large" @click="handleSocialLogin('wechat')">
          <el-icon><Link /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Lock, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const remember = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  try {
    await userStore.handleLogin(formData)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (provider) => {
  ElMessage.info(`${provider} 登录功能开发中`)
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 16px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    font-size: 28px;
    margin-bottom: 8px;
    color: var(--text-color);
  }
  
  p {
    color: var(--text-secondary);
  }
}

.form-options {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .forgot-link {
    font-size: 14px;
    color: var(--primary-color);
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--text-secondary);
  
  a {
    color: var(--primary-color);
    margin-left: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  
  .el-button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    
    &:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  }
}
</style>