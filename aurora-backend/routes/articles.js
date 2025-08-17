const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Article = require('../models/Article');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { authenticate, optionalAuth } = require('../middleware/auth');

// 文章验证规则
const articleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ max: 200 })
    .withMessage('标题不能超过200个字符'),
  body('content')
    .notEmpty()
    .withMessage('内容不能为空'),
  body('category')
    .notEmpty()
    .withMessage('请选择分类')
    .isIn([
      'frontend', 'backend', 'algorithm', 'embedded', 'hardware',
      'yijing', 'numerology', 'astrology', 'taoism',
      'a-shares', 'hk-stocks', 'us-stocks',
      'bitcoin', 'ethereum', 'blockchain'
    ])
    .withMessage('无效的分类'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('摘要不能超过500个字符'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组')
];

// 获取文章列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      tag,
      author,
      search,
      sort = '-publishedAt'
    } = req.query;

    const query = { status: 'published' };

    // 构建查询条件
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) {
      const user = await User.findOne({ username: author });
      if (user) query.author = user._id;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // 执行查询
    const articles = await Article.find(query)
      .populate('author', 'username avatar')
      .select('-content')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// 获取热门文章
router.get('/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const articles = await Article.find({
      status: 'published',
      publishedAt: { $gte: dateLimit }
    })
      .populate('author', 'username avatar')
      .select('-content')
      .sort('-views -likes')
      .limit(limit);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: '获取热门文章失败' });
  }
});

// 获取推荐文章
router.get('/recommended', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // 基于用户兴趣推荐（简化版）
    let query = { status: 'published', isSticky: true };
    
    if (req.user) {
      // 获取用户最近阅读的文章分类
      const recentReads = await User.findById(req.user._id)
        .populate('readHistory.article', 'category')
        .limit(10);
      
      if (recentReads && recentReads.readHistory.length > 0) {
        const categories = [...new Set(recentReads.readHistory.map(h => h.article.category))];
        query = {
          status: 'published',
          $or: [
            { isSticky: true },
            { category: { $in: categories } }
          ]
        };
      }
    }

    const articles = await Article.find(query)
      .populate('author', 'username avatar')
      .select('-content')
      .sort('-publishedAt')
      .limit(limit);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: '获取推荐文章失败' });
  }
});

// 获取单篇文章
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      status: 'published'
    })
      .populate('author', 'username avatar bio followers')
      .populate({
        path: 'comments',
        match: { status: 'active', parentComment: null },
        populate: {
          path: 'author',
          select: 'username avatar'
        },
        options: { sort: '-createdAt' }
      });

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 增加浏览量
    article.views += 1;
    await article.save();

    // 如果用户已登录，更新阅读历史
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          readHistory: {
            $each: [{ article: article._id }],
            $position: 0,
            $slice: 100 // 只保留最近100条记录
          }
        }
      });

      // 检查是否已收藏和点赞
      article.isLiked = article.likes.includes(req.user._id);
      article.isFavorited = req.user.favorites.includes(article._id);
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 创建文章
router.post('/', authenticate, articleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      coverImage,
      status = 'draft',
      allowComments = true
    } = req.body;

    const article = new Article({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category,
      tags,
      coverImage,
      status,
      allowComments,
      author: req.user._id
    });

    await article.save();

    await article.populate('author', 'username avatar');

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: '创建文章失败' });
  }
});

// 更新文章
router.patch('/:id', authenticate, articleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 检查权限
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权编辑此文章' });
    }

    const updates = {};
    const allowedUpdates = [
      'title', 'content', 'excerpt', 'category', 
      'tags', 'coverImage', 'status', 'allowComments'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    Object.assign(article, updates);
    await article.save();

    await article.populate('author', 'username avatar');

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除文章
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 检查权限
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除此文章' });
    }

    // 软删除
    article.status = 'archived';
    await article.save();

    // 删除相关评论
    await Comment.updateMany(
      { article: article._id },
      { status: 'deleted' }
    );

    res.json({ message: '文章已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除文章失败' });
  }
});

// 点赞文章
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article || article.status !== 'published') {
      return res.status(404).json({ error: '文章不存在' });
    }

    const isLiked = article.likes.includes(req.user._id);

    if (isLiked) {
      // 取消点赞
      article.likes.pull(req.user._id);
    } else {
      // 点赞
      article.likes.push(req.user._id);
    }

    await article.save();

    res.json({
      liked: !isLiked,
      likeCount: article.likes.length
    });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 收藏文章
router.post('/:id/favorite', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article || article.status !== 'published') {
      return res.status(404).json({ error: '文章不存在' });
    }

    const user = await User.findById(req.user._id);
    const isFavorited = user.favorites.includes(article._id);

    if (isFavorited) {
      // 取消收藏
      user.favorites.pull(article._id);
    } else {
      // 收藏
      user.favorites.push(article._id);
    }

    await user.save();

    res.json({
      favorited: !isFavorited
    });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 获取相关文章
router.get('/:id/related', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 基于标签和分类查找相关文章
    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      $or: [
        { category: article.category },
        { tags: { $in: article.tags } }
      ]
    })
      .populate('author', 'username avatar')
      .select('-content')
      .sort('-views')
      .limit(limit);

    res.json(relatedArticles);
  } catch (error) {
    res.status(500).json({ error: '获取相关文章失败' });
  }
});

module.exports = router;