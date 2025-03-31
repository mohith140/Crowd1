const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExclusiveContentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  creatorEmail: {
    type: String,
    required: true,
    ref: 'Creator'
  },
  creatorPageName: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['video', 'audio', 'image', 'pdf', 'text'],
    default: 'video'
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  published: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  accessTier: {
    type: String,
    enum: ['free', 'basic', 'premium', 'elite'],
    default: 'basic',
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    audienceEmail: {
      type: String,
      required: true
    },
    audienceName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Indexes for faster queries
ExclusiveContentSchema.index({ creatorEmail: 1, createdAt: -1 });
ExclusiveContentSchema.index({ creatorPageName: 1, contentType: 1 });
ExclusiveContentSchema.index({ accessTier: 1 });
ExclusiveContentSchema.index({ tags: 1 });

// Method to increment view count
ExclusiveContentSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add a like
ExclusiveContentSchema.methods.addLike = function() {
  this.likes += 1;
  return this.save();
};

// Method to add a comment
ExclusiveContentSchema.methods.addComment = function(audienceEmail, audienceName, text) {
  this.comments.push({
    audienceEmail,
    audienceName,
    text,
    createdAt: new Date()
  });
  return this.save();
};

// Method to check if content is accessible to a given tier
ExclusiveContentSchema.methods.isAccessibleTo = function(subscriberTier) {
  const tierLevels = {
    'free': 0,
    'basic': 1,
    'premium': 2,
    'elite': 3
  };
  
  return tierLevels[subscriberTier] >= tierLevels[this.accessTier];
};

// Create and export the model
module.exports = mongoose.model('ExclusiveContent', ExclusiveContentSchema); 