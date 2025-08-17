const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Article = require('../models/Article');
const { authenticate, optionalAuth } = require('../middleware/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片文件'));
    }
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'title slug coverImage category')
      .populate('following', 'username avatar')
      .populate('followers', 'username avatar');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 获取用户公开资料
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true });
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const publicProfile = user.getPublicProfile();
    
    // 如果是已登录用户，检查是否关注
    if (req.user) {
      publicProfile.isFollowing = req.user.following.includes(user._id);
    }

    // 获取用户最近的文章
    const recentArticles = await Article.find({
      author: user._id,
      status: 'published'
    })
      .select('title slug excerpt coverImage category publishedAt views')
      .sort('-publishedAt')
      .limit(5);

    res.json({
      ...publicProfile,
      recentArticles
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户资料失败' });
  }
});

// 更新个人资料
router.patch('/me', authenticate, [
  body('bio').optional().isLength({ max: 500 }).withMessage('个人简介不能超过500字'),
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('用户名长度必须在3-30个字符之间')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const allowedUpdates = ['bio', 'username'];
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // 如果更新用户名，检查是否已存在
    if (updates.username) {
      const existingUser = await User.findOne({ 
        username: updates.username,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: '用户名已被使用' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '更新资料失败' });
  }
});

// 上传头像
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({ avatar: avatarUrl, user });
  } catch (error) {
    res.status(500).json({ error: '上传头像失败' });
  }
});

// 更新偏好设置
router.patch('/me/preferences', authenticate, async (req, res) => {
  try {
    const { theme, language, notifications } = req.body;
    const updates = {};

    if (theme) updates['preferences.theme'] = theme;
    if (language) updates['preferences.language'] = language;
    if (notifications) {
      if (notifications.email !== undefined) updates['preferences.notifications.email'] = notifications.email;
      if (notifications.push !== undefined) updates['preferences.notifications.push'] = notifications.push;
      if (notifications.comments !== undefined) updates['preferences.notifications.comments'] = notifications.comments;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: '更新偏好设置失败' });
  }
});

// 修改密码
router.post('/me/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('请输入当前密码'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('新密码必须包含字母和数字')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // 获取完整用户信息（包含密码）
    const user = await User.findById(req.user._id);
    
    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: '当前密码错误' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 关注用户
router.post('/:userId/follow', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ error: '不能关注自己' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 添加关注关系
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: targetUserId }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: req.user._id }
    });

    res.json({ message: '关注成功' });
  } catch (error) {
    res.status(500).json({ error: '关注失败' });
  }
});

// 取消关注
router.delete('/:userId/follow', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    // 移除关注关系
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: targetUserId }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: req.user._id }
    });

    res.json({ message: '取消关注成功' });
  } catch (error) {
    res.status(500).json({ error: '取消关注失败' });
  }
});

// 获取收藏列表
router.get('/me/favorites', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        select: 'title slug excerpt coverImage category author publishedAt views',
        populate: {
          path: 'author',
          select: 'username avatar'
        },
        options: {
          sort: '-createdAt',
          skip,
          limit
        }
      });

    const total = user.favorites.length;

    res.json({
      favorites: user.favorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

// 获取阅读历史
router.get('/me/history', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'readHistory.article',
        select: 'title slug excerpt coverImage category author publishedAt',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      })
      .slice('readHistory', [skip, limit]);

    const total = user.readHistory.length;

    res.json({
      history: user.readHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取阅读历史失败' });
  }
});

module.exports = router;