import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由懒加载
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const ArticleList = () => import('@/views/article/ArticleList.vue')
const ArticleDetail = () => import('@/views/article/ArticleDetail.vue')
const ArticleCreate = () => import('@/views/article/ArticleCreate.vue')
const UserProfile = () => import('@/views/user/UserProfile.vue')
const UserCenter = () => import('@/views/user/UserCenter.vue')
const MediaGallery = () => import('@/views/media/MediaGallery.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册', guest: true }
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: ArticleList,
    meta: { title: '文章列表' }
  },
  {
    path: '/articles/:slug',
    name: 'ArticleDetail',
    component: ArticleDetail,
    meta: { title: '文章详情' }
  },
  {
    path: '/write',
    name: 'ArticleCreate',
    component: ArticleCreate,
    meta: { title: '写文章', requiresAuth: true }
  },
  {
    path: '/user/:username',
    name: 'UserProfile',
    component: UserProfile,
    meta: { title: '用户资料' }
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: UserCenter,
    meta: { title: '个人中心', requiresAuth: true },
    redirect: '/user-center/profile',
    children: [
      {
        path: 'profile',
        name: 'UserCenterProfile',
        component: () => import('@/views/user/center/Profile.vue'),
        meta: { title: '个人资料' }
      },
      {
        path: 'articles',
        name: 'UserCenterArticles',
        component: () => import('@/views/user/center/Articles.vue'),
        meta: { title: '我的文章' }
      },
      {
        path: 'favorites',
        name: 'UserCenterFavorites',
        component: () => import('@/views/user/center/Favorites.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'history',
        name: 'UserCenterHistory',
        component: () => import('@/views/user/center/History.vue'),
        meta: { title: '浏览历史' }
      },
      {
        path: 'settings',
        name: 'UserCenterSettings',
        component: () => import('@/views/user/center/Settings.vue'),
        meta: { title: '设置' }
      }
    ]
  },
  {
    path: '/gallery',
    name: 'MediaGallery',
    component: MediaGallery,
    meta: { title: '媒体库' }
  },
  // 分类路由
  {
    path: '/category/:category',
    name: 'CategoryArticles',
    component: ArticleList,
    meta: { title: '分类文章' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'Aurora'} - Aurora博客`

  const userStore = useUserStore()
  
  // 需要认证的路由
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      return next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }
  }
  
  // 游客路由（已登录用户不能访问）
  if (to.meta.guest && userStore.isLoggedIn) {
    return next({ name: 'Home' })
  }

  next()
})

export default router