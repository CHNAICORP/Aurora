import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, logout, verifyToken } from '@/api/auth'
import { getUserInfo, updateUserInfo } from '@/api/user'
import router from '@/router'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('aurora-token') || '')
  const refreshToken = ref(localStorage.getItem('aurora-refresh-token') || '')
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || '')
  const avatar = computed(() => user.value?.avatar || '')
  const role = computed(() => user.value?.role || 'user')

  // 方法
  async function handleLogin(credentials) {
    try {
      loading.value = true
      const response = await login(credentials)
      
      // 保存token和用户信息
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken
      user.value = response.data.user
      
      // 持久化
      localStorage.setItem('aurora-token', token.value)
      localStorage.setItem('aurora-refresh-token', refreshToken.value)
      
      ElMessage.success('登录成功')
      
      // 跳转到之前的页面或首页
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
      
      return response
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '登录失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function handleRegister(userData) {
    try {
      loading.value = true
      const response = await register(userData)
      
      // 注册成功后自动登录
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken
      user.value = response.data.user
      
      // 持久化
      localStorage.setItem('aurora-token', token.value)
      localStorage.setItem('aurora-refresh-token', refreshToken.value)
      
      ElMessage.success('注册成功')
      router.push('/')
      
      return response
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '注册失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      // 忽略登出错误
    } finally {
      // 清除本地数据
      user.value = null
      token.value = ''
      refreshToken.value = ''
      localStorage.removeItem('aurora-token')
      localStorage.removeItem('aurora-refresh-token')
      
      ElMessage.success('已退出登录')
      router.push('/')
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return
    
    try {
      const response = await getUserInfo()
      user.value = response.data
    } catch (error) {
      // Token无效，清除登录状态
      if (error.response?.status === 401) {
        await handleLogout()
      }
    }
  }

  async function updateProfile(data) {
    try {
      loading.value = true
      const response = await updateUserInfo(data)
      user.value = response.data
      ElMessage.success('更新成功')
      return response
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '更新失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 初始化时验证token
  if (token.value) {
    fetchUserInfo()
  }

  return {
    // 状态
    user,
    token,
    loading,
    // 计算属性
    isLoggedIn,
    username,
    avatar,
    role,
    // 方法
    handleLogin,
    handleRegister,
    handleLogout,
    fetchUserInfo,
    updateProfile
  }
})