const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const CreatorSchema = new Schema({
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
  pageName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  socialLinks: {
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  category: {
    type: String,
    trim: true,
    default: 'Other'
  },
  followers: [{
    audienceEmail: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  userType: {
    type: String,
    default: 'creator'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  bankDetails: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    routingNumber: { type: String, default: '' }
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    newFollower: { type: Boolean, default: true },
    newCampaignContribution: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Hash password before saving
CreatorSchema.pre('save', async function(next) {
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
CreatorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get creator's full name
CreatorSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to count followers
CreatorSchema.methods.getFollowerCount = function() {
  return this.followers.length;
};

// Create and export the model
module.exports = mongoose.model('Creator', CreatorSchema);