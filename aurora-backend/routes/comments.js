const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { io } = require('../server');

// 评论验证规则
const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('评论内容不能为空')
    .isLength({ min: 1, max: 1000 })
    .withMessage('评论内容长度必须在1-1000个字符之间')
];

// 获取文章评论
router.get('/article/:articleId', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // 查找顶级评论
    const comments = await Comment.find({
      article: req.params.articleId,
      parentComment: null,
      status: 'active'
    })
      .populate('author', 'username avatar')
      .populate('replyTo', 'username')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // 获取每个评论的回复
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          status: 'active'
        })
          .populate('author', 'username avatar')
          .populate('replyTo', 'username')
          .sort('createdAt')
          .limit(5); // 默认显示5条回复

        const replyCount = await Comment.countDocuments({
          parentComment: comment._id,
          status: 'active'
        });

        // 检查用户是否点赞
        let isLiked = false;
        if (req.user) {
          isLiked = comment.likes.includes(req.user._id);
        }

        return {
          ...comment.toJSON(),
          replies,
          replyCount,
          isLiked
        };
      })
    );

    const total = await Comment.countDocuments({
      article: req.params.articleId,
      parentComment: null,
      status: 'active'
    });

    res.json({
      comments: commentsWithReplies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取评论失败' });
  }
});

// 获取评论的回复
router.get('/:commentId/replies', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query;

    const replies = await Comment.find({
      parentComment: req.params.commentId,
      status: 'active'
    })
      .populate('author', 'username avatar')
      .populate('replyTo', 'username')
      .sort('createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // 检查用户是否点赞
    const repliesWithLikes = replies.map(reply => {
      const replyObj = reply.toJSON();
      if (req.user) {
        replyObj.isLiked = reply.likes.includes(req.user._id);
      }
      return replyObj;
    });

    const total = await Comment.countDocuments({
      parentComment: req.params.commentId,
      status: 'active'
    });

    res.json({
      replies: repliesWithLikes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取回复失败' });
  }
});

// 发表评论
router.post('/', authenticate, commentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      content,
      articleId,
      parentCommentId,
      replyToUserId
    } = req.body;

    // 检查文章是否存在
    const article = await Article.findById(articleId);
    if (!article || article.status !== 'published') {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 检查是否允许评论
    if (!article.allowComments) {
      return res.status(403).json({ error: '该文章不允许评论' });
    }

    // 如果是回复，检查父评论
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.status !== 'active') {
        return res.status(404).json({ error: '回复的评论不存在' });
      }
    }

    // 创建评论
    const comment = new Comment({
      content,
      author: req.user._id,
      article: articleId,
      parentComment: parentCommentId || null,
      replyTo: replyToUserId || null
    });

    await comment.save();

    // 更新文章评论列表
    article.comments.push(comment._id);
    await article.save();

    // 填充用户信息
    await comment.populate('author', 'username avatar');
    if (replyToUserId) {
      await comment.populate('replyTo', 'username');
    }

    // 通过Socket.IO实时推送新评论
    if (io) {
      io.to(articleId).emit('new-comment', {
        comment: comment.toJSON(),
        articleId
      });
    }

    // TODO: 发送通知给文章作者或被回复的用户

    res.status(201).json(comment);
  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({ error: '发表评论失败' });
  }
});

// 编辑评论
router.patch('/:id', authenticate, commentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查权限
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权编辑此评论' });
    }

    // 只能编辑发布后24小时内的评论
    const hoursSinceCreated = (Date.now() - comment.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreated > 24) {
      return res.status(403).json({ error: '评论发布超过24小时，无法编辑' });
    }

    comment.content = req.body.content;
    await comment.save();

    await comment.populate('author', 'username avatar');
    if (comment.replyTo) {
      await comment.populate('replyTo', 'username');
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: '编辑评论失败' });
  }
});

// 删除评论
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查权限
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    // 软删除
    comment.status = 'deleted';
    comment.content = '[该评论已被删除]';
    await comment.save();

    // 同时删除所有子评论
    await Comment.updateMany(
      { parentComment: comment._id },
      { status: 'deleted', content: '[该评论已被删除]' }
    );

    res.json({ message: '评论已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除评论失败' });
  }
});

// 点赞评论
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status !== 'active') {
      return res.status(404).json({ error: '评论不存在' });
    }

    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
      // 取消点赞
      comment.likes.pull(req.user._id);
    } else {
      // 点赞
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.json({
      liked: !isLiked,
      likeCount: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 举报评论
router.post('/:id/report', authenticate, [
  body('reason')
    .notEmpty()
    .withMessage('请选择举报原因')
    .isIn(['spam', 'offensive', 'misleading', 'other'])
    .withMessage('无效的举报原因'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('描述不能超过500个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status !== 'active') {
      return res.status(404).json({ error: '评论不存在' });
    }

    // TODO: 实现举报功能，保存到举报记录表

    res.json({ message: '举报已提交，我们会尽快处理' });
  } catch (error) {
    res.status(500).json({ error: '举报失败' });
  }
});

module.exports = router;