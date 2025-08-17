const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Media = require('../models/Media');
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');

// 配置文件存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else {
      uploadPath += 'documents/';
    }

    // 确保目录存在
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('创建目录失败:', error);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm/;
  const allowedDocTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
  
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (file.mimetype.startsWith('image/') && allowedImageTypes.test(ext)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/') && allowedVideoTypes.test(ext)) {
    cb(null, true);
  } else if (allowedDocTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// 获取媒体列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      visibility = 'public',
      uploader,
      tag,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // 构建查询条件
    if (type) query.type = type;
    if (tag) query.tags = tag;
    
    // 权限控制
    if (visibility === 'private') {
      if (!req.user) {
        return res.status(401).json({ error: '需要登录' });
      }
      query.uploader = req.user._id;
      query.visibility = 'private';
    } else if (visibility === 'public') {
      query.visibility = 'public';
    }
    
    if (uploader) {
      const user = await User.findOne({ username: uploader });
      if (user) {
        query.uploader = user._id;
      }
    }

    // 执行查询
    const media = await Media.find(query)
      .populate('uploader', 'username avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Media.countDocuments(query);

    res.json({
      media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取媒体列表失败' });
  }
});

// 获取单个媒体详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploader', 'username avatar');

    if (!media) {
      return res.status(404).json({ error: '媒体不存在' });
    }

    // 权限检查
    if (media.visibility === 'private' && 
        (!req.user || media.uploader._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: '无权访问' });
    }

    // 增加浏览量
    media.views += 1;
    await media.save();

    // 检查是否已点赞
    if (req.user) {
      media.isLiked = media.likes.includes(req.user._id);
    }

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: '获取媒体详情失败' });
  }
});

// 上传媒体文件
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const {
      title = req.file.originalname,
      description = '',
      tags = [],
      visibility = 'public',
      album
    } = req.body;

    // 构建文件URL
    const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;

    // 创建媒体记录
    const media = new Media({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploader: req.user._id,
      title,
      description,
      tags: Array.isArray(tags) ? tags : [tags],
      visibility,
      album
    });

    // 如果是图片，可以获取尺寸信息（需要额外的库如sharp）
    // 这里简化处理，实际项目中可以使用sharp等库获取图片元数据

    await media.save();
    await media.populate('uploader', 'username avatar');

    res.status(201).json(media);
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

// 批量上传
router.post('/upload-multiple', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const {
      visibility = 'public',
      album,
      tags = []
    } = req.body;

    const mediaList = [];

    for (const file of req.files) {
      const fileUrl = `/${file.path.replace(/\\/g, '/')}`;
      
      const media = new Media({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        uploader: req.user._id,
        title: file.originalname,
        tags: Array.isArray(tags) ? tags : [tags],
        visibility,
        album
      });

      await media.save();
      await media.populate('uploader', 'username avatar');
      mediaList.push(media);
    }

    res.status(201).json(mediaList);
  } catch (error) {
    res.status(500).json({ error: '批量上传失败' });
  }
});

// 更新媒体信息
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ error: '媒体不存在' });
    }

    // 权限检查
    if (media.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权修改' });
    }

    const updates = {};
    const allowedUpdates = ['title', 'description', 'tags', 'visibility', 'album'];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    Object.assign(media, updates);
    await media.save();
    await media.populate('uploader', 'username avatar');

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除媒体
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ error: '媒体不存在' });
    }

    // 权限检查
    if (media.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除' });
    }

    // 删除文件
    try {
      const filePath = path.join(process.cwd(), media.url);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
    }

    // 删除数据库记录
    await media.remove();

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

// 点赞媒体
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ error: '媒体不存在' });
    }

    const isLiked = media.likes.includes(req.user._id);

    if (isLiked) {
      media.likes.pull(req.user._id);
    } else {
      media.likes.push(req.user._id);
    }

    await media.save();

    res.json({
      liked: !isLiked,
      likeCount: media.likes.length
    });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 获取相册列表
router.get('/albums/list', authenticate, async (req, res) => {
  try {
    const albums = await Media.distinct('album', {
      uploader: req.user._id,
      album: { $ne: null }
    });

    const albumsWithCount = await Promise.all(
      albums.map(async (album) => {
        const count = await Media.countDocuments({
          uploader: req.user._id,
          album
        });
        return { name: album, count };
      })
    );

    res.json(albumsWithCount);
  } catch (error) {
    res.status(500).json({ error: '获取相册列表失败' });
  }
});

module.exports = router;