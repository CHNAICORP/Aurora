import request from './request'

// 获取文章列表
export function getArticles(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

// 获取热门文章
export function getHotArticles(params) {
  return request({
    url: '/articles/hot',
    method: 'get',
    params
  })
}

// 获取推荐文章
export function getRecommendedArticles(params) {
  return request({
    url: '/articles/recommended',
    method: 'get',
    params
  })
}

// 获取文章详情
export function getArticle(slug) {
  return request({
    url: `/articles/${slug}`,
    method: 'get'
  })
}

// 创建文章
export function createArticle(data) {
  return request({
    url: '/articles',
    method: 'post',
    data
  })
}

// 更新文章
export function updateArticle(id, data) {
  return request({
    url: `/articles/${id}`,
    method: 'patch',
    data
  })
}

// 删除文章
export function deleteArticle(id) {
  return request({
    url: `/articles/${id}`,
    method: 'delete'
  })
}

// 点赞文章
export function likeArticle(id) {
  return request({
    url: `/articles/${id}/like`,
    method: 'post'
  })
}

// 收藏文章
export function favoriteArticle(id) {
  return request({
    url: `/articles/${id}/favorite`,
    method: 'post'
  })
}

// 获取相关文章
export function getRelatedArticles(id, params) {
  return request({
    url: `/articles/${id}/related`,
    method: 'get',
    params
  })
}