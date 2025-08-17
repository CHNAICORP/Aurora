const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      // 技术开发区
      'frontend', 'backend', 'algorithm', 'embedded', 'hardware',
      // 国学区
      'yijing', 'numerology', 'astrology', 'taoism',
      // 股市区
      'a-shares', 'hk-stocks', 'us-stocks',
      // 虚拟货币区
      'bitcoin', 'ethereum', 'blockchain'
    ]
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  coverImage: {
    type: String,
    default: null
  },
  images: [{
    url: String,
    caption: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  meta: {
    readTime: Number, // 预计阅读时间（分钟）
    wordCount: Number, // 字数统计
    lastModified: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  },
  isSticky: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ slug: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ views: -1 });
articleSchema.index({ createdAt: -1 });

// 生成slug
articleSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  next();
});

// 更新时间戳
articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // 计算阅读时间和字数
  if (this.content) {
    const wordCount = this.content.length;
    const readTime = Math.ceil(wordCount / 300); // 假设每分钟阅读300字
    
    this.meta = {
      ...this.meta,
      wordCount,
      readTime,
      lastModified: new Date()
    };
  }
  
  // 设置发布时间
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// 虚拟字段：评论数
articleSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// 虚拟字段：点赞数
articleSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// 转换为JSON时包含虚拟字段
articleSchema.set('toJSON', {
  virtuals: true
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;