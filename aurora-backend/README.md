# Aurora Blog Backend

Aurora博客的后端API服务，基于Node.js + Express + MongoDB构建。

## 技术栈

- **框架**: Express.js
- **数据库**: MongoDB (Mongoose ODM)
- **认证**: JWT
- **实时通信**: Socket.IO
- **缓存**: Redis
- **文件上传**: Multer
- **验证**: Express Validator

## 功能特性

- 用户认证与授权（注册、登录、JWT）
- 文章管理（CRUD、分类、标签、搜索）
- 评论系统（嵌套评论、实时推送）
- 媒体管理（图片、视频上传）
- 用户社交（关注、收藏、点赞）
- 多语言支持
- 实时通知

## 环境要求

- Node.js >= 14.0
- MongoDB >= 4.0
- Redis >= 6.0 (可选)

## 安装步骤

1. 克隆项目并安装依赖
```bash
cd aurora-backend
npm install
```

2. 配置环境变量
复制 `.env.example` 到 `.env` 并修改配置：
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aurora
JWT_SECRET=your_jwt_secret_key
```

3. 启动MongoDB服务
```bash
# macOS/Linux
mongod

# Windows
mongod.exe
```

4. 启动开发服务器
```bash
npm run dev
```

## API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 退出登录
- `GET /api/auth/verify` - 验证Token

### 用户相关
- `GET /api/users/me` - 获取当前用户信息
- `PATCH /api/users/me` - 更新用户资料
- `POST /api/users/me/avatar` - 上传头像
- `POST /api/users/:userId/follow` - 关注用户

### 文章相关
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:slug` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PATCH /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 评论相关
- `GET /api/comments/article/:articleId` - 获取文章评论
- `POST /api/comments` - 发表评论
- `DELETE /api/comments/:id` - 删除评论

## 项目结构

```
aurora-backend/
├── models/          # 数据模型
├── routes/          # API路由
├── middleware/      # 中间件
├── utils/           # 工具函数
├── uploads/         # 上传文件存储
├── server.js        # 入口文件
├── package.json
└── .env            # 环境配置
```

## 部署

1. 设置生产环境变量
2. 构建项目：`npm run build`
3. 使用PM2启动：`pm2 start server.js`

## License

MIT