const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  album: {
    type: String,
    default: null
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // 视频时长（秒）
    format: String,
    resolution: String
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usedIn: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
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
mediaSchema.index({ uploader: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ visibility: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ createdAt: -1 });

// 更新时间戳
mediaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 设置文件类型
mediaSchema.pre('save', function(next) {
  if (!this.type) {
    if (this.mimetype.startsWith('image/')) {
      this.type = 'image';
    } else if (this.mimetype.startsWith('video/')) {
      this.type = 'video';
    } else if (
      this.mimetype.includes('pdf') || 
      this.mimetype.includes('document') ||
      this.mimetype.includes('text/')
    ) {
      this.type = 'document';
    } else {
      this.type = 'other';
    }
  }
  next();
});

// 虚拟字段：点赞数
mediaSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// 获取公开信息
mediaSchema.methods.getPublicInfo = function() {
  return {
    _id: this._id,
    url: this.url,
    thumbnailUrl: this.thumbnailUrl,
    type: this.type,
    title: this.title,
    description: this.description,
    metadata: this.metadata,
    views: this.views,
    likeCount: this.likeCount,
    createdAt: this.createdAt
  };
};

// 转换为JSON时包含虚拟字段
mediaSchema.set('toJSON', {
  virtuals: true
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;