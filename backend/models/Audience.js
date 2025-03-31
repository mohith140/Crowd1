const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const AudienceSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  creators: {
    type: [String], // Array of creator pageNames the audience follows
    default: []
  },
  projects: {
    type: [mongoose.Schema.Types.ObjectId], // Array of projects backed
    ref: 'Campaign',
    default: []
  },
  interests: {
    type: [String], // Array of interest categories
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userType: {
    type: String,
    default: 'audience'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'paypal', 'bank'],
      required: true
    },
    lastFour: String,
    expiryDate: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    tokenId: String // Payment processor token/id
  }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    campaignUpdates: { type: Boolean, default: true },
    newContent: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Hash password before saving
AudienceSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
AudienceSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get audience's full name
AudienceSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to check if audience is following a creator
AudienceSchema.methods.isFollowing = function(creatorPageName) {
  return this.creators.includes(creatorPageName);
};

// Method to follow a creator
AudienceSchema.methods.followCreator = function(creatorPageName) {
  if (!this.creators.includes(creatorPageName)) {
    this.creators.push(creatorPageName);
  }
  return this;
};

// Method to unfollow a creator
AudienceSchema.methods.unfollowCreator = function(creatorPageName) {
  this.creators = this.creators.filter(pageName => pageName !== creatorPageName);
  return this;
};

// Create and export the model
module.exports = mongoose.model('Audience', AudienceSchema); 