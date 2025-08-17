<template>
  <div class="auth-page">
    <div class="auth-container glass">
      <div class="auth-header">
        <h1>加入Aurora</h1>
        <p>开启您的知识探索之旅</p>
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
            :placeholder="$t('user.username')"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="formData.email"
            :placeholder="$t('user.email')"
            size="large"
            :prefix-icon="Message"
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
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            :placeholder="$t('user.confirmPassword')"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="agreement">
          <el-checkbox v-model="formData.agreement">
            我已阅读并同意
            <router-link to="/terms" target="_blank">服务条款</router-link>
            和
            <router-link to="/privacy" target="_blank">隐私政策</router-link>
          </el-checkbox>
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
            {{ $t('common.register') }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="auth-footer">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度至少6个字符'))
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度在 3 到 30 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '用户名只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { required: true, message: '请同意服务条款和隐私政策', trigger: 'change' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (!formData.agreement) {
    ElMessage.warning('请同意服务条款和隐私政策')
    return
  }
  
  loading.value = true
  try {
    const { username, email, password } = formData
    await userStore.handleRegister({ username, email, password })
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
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

:deep(.el-checkbox__label) {
  color: var(--text-secondary);
  
  a {
    color: var(--primary-color);
    margin: 0 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>