const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  // Project basics
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Project owner info
  email: {
    type: String,
    required: true,
    index: true
  },
  
  pageName: {
    type: String,
    required: true,
    index: true
  },
  
  // Project funding details
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
    default: 'Other'
  },
  
  // Project dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  targetDate: {
    type: Date
  },
  
  // Media
  imageUrl: String,
  projectURL: String,
  
  // Project status - draft, active, completed, cancelled
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // All supporters/backers of this project
  audience: [{
    audienceEmail: String,
    amount: Number,
    firstName: String,
    lastName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'completed'
    }
  }],
  
  // Additional metadata
  tags: [String]
});



// Add a method to check if project is fully funded
ProjectSchema.methods.isFullyFunded = function() {
  const totalRaised = this.audience.reduce((total, backer) => {
    return total + (backer.amount || 0);
  }, 0);
  return totalRaised >= this.amount;
};

// Add a method to calculate funding percentage
ProjectSchema.methods.getFundingPercentage = function() {
  const totalRaised = this.audience.reduce((total, backer) => {
    return total + (backer.amount || 0);
  }, 0);
  return Math.min(100, parseFloat(((totalRaised / this.amount) * 100).toFixed(2)));
};

// Add a method to check if a project has ended
ProjectSchema.methods.hasEnded = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return true;
  }
  
  if (this.targetDate && new Date() > this.targetDate) {
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('Project', ProjectSchema); 