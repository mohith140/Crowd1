const mongoose = require('mongoose');

const campaignSchema = mongoose.Schema({
  // Campaign basics
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Campaign owner info
  creatorEmail: {
    type: String,
    required: true,
    index: true
  },
  
  pageName: {
    type: String,
    required: true,
    index: true
  },
  
  // Campaign funding details
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  
  // The sum of all contributions
  raisedAmount: {
    type: Number,
    default: 0
  },
  
  category: {
    type: String,
    required: true
  },
  
  // Campaign dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  targetDate: {
    type: Date
  },
  
  // When the campaign was launched (made public)
  launchDate: {
    type: Date
  },
  
  // Media
  imageUrl: String,
  videoUrl: String,
  
  // Campaign status - draft, active, completed, cancelled
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // All supporters/backers of this campaign
  audience: [{
    audienceEmail: String,
    amount: Number,
    firstName: String,
    lastName: String,
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'completed'
    }
  }],
  
  // For updates from the creator to backers
  updates: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Additional metadata
  tags: [String],
  
  // Settings
  rewards: [{
    title: String,
    description: String,
    amount: Number,
    limit: Number,
    claimed: {
      type: Number,
      default: 0
    }
  }]
});

// Add a method to check if campaign is fully funded
campaignSchema.methods.isFullyFunded = function() {
  return this.raisedAmount >= this.amount;
};

// Add a method to calculate funding percentage
campaignSchema.methods.getFundingPercentage = function() {
  return Math.min(100, parseFloat(((this.raisedAmount / this.amount) * 100).toFixed(2)));
};

// Add a method to check if a campaign has ended
campaignSchema.methods.hasEnded = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return true;
  }
  
  if (this.targetDate && new Date() > this.targetDate) {
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('Campaign', campaignSchema); 