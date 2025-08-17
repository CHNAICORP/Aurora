const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'deleted', 'hidden'],
    default: 'active'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
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
commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1 });

// 更新时间戳
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// 虚拟字段：点赞数
commentSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// 获取子评论
commentSchema.methods.getReplies = async function() {
  return await Comment.find({ 
    parentComment: this._id,
    status: 'active'
  }).populate('author', 'username avatar').sort('createdAt');
};

// 转换为JSON时包含虚拟字段
commentSchema.set('toJSON', {
  virtuals: true
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;