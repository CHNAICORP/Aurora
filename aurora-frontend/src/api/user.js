import request from './request'

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/users/me',
    method: 'get'
  })
}

// 获取用户公开资料
export function getUserProfile(username) {
  return request({
    url: `/users/${username}`,
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/users/me',
    method: 'patch',
    data
  })
}

// 上传头像
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  
  return request({
    url: '/users/me/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新偏好设置
export function updatePreferences(data) {
  return request({
    url: '/users/me/preferences',
    method: 'patch',
    data
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/users/me/password',
    method: 'post',
    data
  })
}

// 关注用户
export function followUser(userId) {
  return request({
    url: `/users/${userId}/follow`,
    method: 'post'
  })
}

// 取消关注
export function unfollowUser(userId) {
  return request({
    url: `/users/${userId}/follow`,
    method: 'delete'
  })
}

// 获取收藏列表
export function getFavorites(params) {
  return request({
    url: '/users/me/favorites',
    method: 'get',
    params
  })
}

// 获取阅读历史
export function getReadHistory(params) {
  return request({
    url: '/users/me/history',
    method: 'get',
    params
  })
}