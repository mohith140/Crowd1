const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
  // The audience member's email
  audienceEmail: {
    type: String,
    required: true,
    index: true
  },
  
  // The creator's pageName they're subscribed to
  creatorPageName: {
    type: String,
    required: true,
    index: true
  },
  
  // Subscription status
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // When the subscription starts
  startDate: {
    type: Date,
    default: Date.now
  },
  
  // When the subscription ends (can be updated if renewed)
  endDate: {
    type: Date,
    required: true
  },
  
  // Subscription tier (basic, premium, etc. - for future use)
  tier: {
    type: String,
    default: 'basic'
  },
  
  // Payment info reference (could link to a payment collection)
  paymentId: String,
  
  // Track subscription history
  history: [{
    action: String, // 'created', 'renewed', 'cancelled', etc.
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
});

// Compound index for faster lookups by audience and creator
subscriptionSchema.index({ audienceEmail: 1, creatorPageName: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema); 