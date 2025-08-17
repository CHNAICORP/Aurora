<template>
  <div class="home-page">
    <div class="container">
      <!-- 欢迎区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            探索知识的深邃<br>
            <span class="gradient-text">照亮思想的天空</span>
          </h1>
          <p class="hero-desc">
            在Aurora，我们汇聚技术与文化，融合理性与感性，<br>
            从前沿科技到古老智慧，从金融市场到虚拟货币，<br>
            开启一段深度思考与广泛探索的旅程。
          </p>
          <div class="hero-actions">
            <router-link to="/articles">
              <el-button type="primary" size="large">
                开始探索
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </router-link>
          </div>
        </div>
      </section>

      <!-- 分类导航 -->
      <section class="categories-section">
        <h2 class="section-title">探索领域</h2>
        <div class="category-grid">
          <router-link 
            v-for="category in categories" 
            :key="category.id"
            :to="`/category/${category.id}`"
            class="category-card card"
          >
            <el-icon :size="32" class="category-icon">
              <component :is="category.icon" />
            </el-icon>
            <h3>{{ category.name }}</h3>
            <p>{{ category.desc }}</p>
          </router-link>
        </div>
      </section>

      <!-- 最新文章 -->
      <section class="articles-section">
        <div class="section-header">
          <h2 class="section-title">最新文章</h2>
          <router-link to="/articles" class="view-all">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="articles.length > 0" class="article-list">
          <article 
            v-for="article in articles" 
            :key="article._id"
            class="article-card card"
          >
            <router-link :to="`/articles/${article.slug}`" class="article-link">
              <div v-if="article.coverImage" class="article-cover">
                <img :src="article.coverImage" :alt="article.title">
              </div>
              <div class="article-content">
                <div class="article-meta">
                  <span class="category">{{ getCategoryName(article.category) }}</span>
                  <span class="date">{{ formatDate(article.publishedAt) }}</span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.excerpt }}</p>
                <div class="article-footer">
                  <div class="author">
                    <el-avatar :size="24" :src="article.author.avatar">
                      {{ article.author.username[0] }}
                    </el-avatar>
                    <span>{{ article.author.username }}</span>
                  </div>
                  <div class="stats">
                    <span><el-icon><View /></el-icon> {{ article.views }}</span>
                    <span><el-icon><ChatDotRound /></el-icon> {{ article.commentCount }}</span>
                  </div>
                </div>
              </div>
            </router-link>
          </article>
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="暂无文章" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  ArrowRight, View, ChatDotRound, Monitor, DataAnalysis, 
  Cpu, Connection, PieChart, TrendCharts, Coin
} from '@element-plus/icons-vue'
import { getArticles } from '@/api/article'

const { t } = useI18n()

const loading = ref(false)
const articles = ref([])

const categories = [
  { id: 'frontend', name: '前端开发', desc: '探索现代Web技术', icon: Monitor },
  { id: 'backend', name: '后端开发', desc: '构建稳定的服务端', icon: DataAnalysis },
  { id: 'algorithm', name: '算法研发', desc: '深入数据结构与算法', icon: Cpu },
  { id: 'yijing', name: '易学文化', desc: '解读古老的智慧', icon: Connection },
  { id: 'a-shares', name: 'A股市场', desc: '洞察股市风云', icon: TrendCharts },
  { id: 'bitcoin', name: '虚拟货币', desc: '探索数字金融未来', icon: Coin }
]

const getCategoryName = (category) => {
  return t(`category.${category}`)
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const { data } = await getArticles({ limit: 6 })
    articles.value = data.articles
  } catch (error) {
    console.error('获取文章失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style lang="scss" scoped>
.home-page {
  padding: 40px 0;
}

// 欢迎区域
.hero-section {
  text-align: center;
  padding: 80px 0;
  
  .hero-title {
    font-size: 48px;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 24px;
    color: var(--text-color);
    
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  .hero-desc {
    font-size: 18px;
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 40px;
  }
}

// 分类导航
.categories-section {
  margin-bottom: 80px;
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-top: 32px;
  }
  
  .category-card {
    padding: 32px;
    text-align: center;
    cursor: pointer;
    text-decoration: none;
    color: var(--text-color);
    
    .category-icon {
      color: var(--primary-color);
      margin-bottom: 16px;
    }
    
    h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }
    
    p {
      color: var(--text-secondary);
    }
    
    &:hover {
      .category-icon {
        transform: scale(1.1);
      }
    }
  }
}

// 文章列表
.articles-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  
  .view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--primary-color);
    
    &:hover {
      transform: translateX(4px);
    }
  }
  
  .article-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
  }
  
  .article-card {
    overflow: hidden;
    
    .article-link {
      display: block;
      color: inherit;
      text-decoration: none;
    }
    
    .article-cover {
      height: 200px;
      overflow: hidden;
      margin: -24px -24px 20px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }
    }
    
    &:hover .article-cover img {
      transform: scale(1.05);
    }
    
    .article-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 14px;
      
      .category {
        color: var(--primary-color);
      }
      
      .date {
        color: var(--text-tertiary);
      }
    }
    
    .article-title {
      font-size: 20px;
      margin-bottom: 12px;
      line-height: 1.4;
      @include text-ellipsis(2);
    }
    
    .article-excerpt {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 16px;
      @include text-ellipsis(3);
    }
    
    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .author {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--text-secondary);
      }
      
      .stats {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: var(--text-tertiary);
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}

.loading-container {
  padding: 40px;
}

.empty-state {
  padding: 80px 0;
}

// 响应式
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0;
    
    .hero-title {
      font-size: 32px;
    }
    
    .hero-desc {
      font-size: 16px;
    }
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .article-list {
    grid-template-columns: 1fr;
  }
}
</style>