# Aurora Blog Frontend

Aurora博客的前端应用，基于Vue 3 + Vite构建的现代化个人博客系统。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **国际化**: Vue I18n
- **样式**: SCSS
- **富文本编辑器**: TinyMCE
- **视频播放**: Vue3-video-play

## 功能特性

- 🌟 星空主题设计，支持深色/浅色模式切换
- 🌐 多语言支持（中文、英文、日文、韩文）
- 📝 博客文章浏览、发布和管理
- 🎥 视频播放和图片展示
- 💬 评论系统和社交互动
- 👤 用户注册、登录和个人中心
- 📱 响应式设计，支持移动端
- 🔍 全文搜索功能

## 环境要求

- Node.js >= 14.0
- npm >= 6.0

## 安装步骤

1. 克隆项目并安装依赖
```bash
cd aurora-frontend
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 访问应用
打开浏览器访问 `http://localhost:5173`

## 项目结构

```
aurora-frontend/
├── src/
│   ├── api/            # API接口封装
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   │   └── layout/     # 布局组件
│   ├── i18n/          # 国际化配置
│   │   └── locales/   # 语言文件
│   ├── router/        # 路由配置
│   ├── stores/        # Pinia状态管理
│   ├── styles/        # 全局样式
│   ├── utils/         # 工具函数
│   ├── views/         # 页面组件
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── public/            # 公共资源
├── index.html         # HTML模板
├── vite.config.js     # Vite配置
└── package.json
```

## 主要页面

- **首页**: 展示最新文章和分类导航
- **文章列表**: 浏览所有文章，支持分类筛选
- **文章详情**: 阅读文章内容，评论互动
- **写文章**: 发布和编辑文章（需登录）
- **媒体库**: 浏览图片和视频资源
- **个人中心**: 管理个人资料、文章、收藏等
- **登录/注册**: 用户认证

## 开发指南

### 环境变量
创建 `.env.local` 文件配置开发环境：
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 部署

1. 构建生产版本
2. 将 `dist` 目录部署到静态服务器
3. 配置服务器支持 SPA 路由

### Nginx配置示例
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## License

MIT
