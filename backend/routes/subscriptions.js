const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const Subscription = mongoose.model('Subscription');
const Creator = mongoose.model('Creator');
const Audience = mongoose.model('Audience');

// Import middleware
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * SUBSCRIPTION MANAGEMENT ROUTES
 */

// Create a new subscription
router.post('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { creatorPageName, durationMonths, tier } = req.body;
    const audienceEmail = req.user.email;
    
    if (!creatorPageName) {
      return res.status(400).json({ error: 'Creator page name is required' });
    }
    
    // Check if creator exists
    const creator = await Creator.findOne({ pageName: creatorPageName });
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    // Check if subscriber exists
    const audience = await Audience.findOne({ email: audienceEmail });
    if (!audience) {
      return res.status(404).json({ error: 'Audience member not found' });
    }
    
    // Check if subscription already exists
    const existingSub = await Subscription.findOne({
      audienceEmail,
      creatorPageName,
    });
    
    if (existingSub && existingSub.status === 'active') {
      return res.status(400).json({ 
        error: 'Subscription already exists', 
        subscription: existingSub 
      });
    }
    
    // Calculate subscription end date
    const months = durationMonths || 1; // Default to 1 month
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    
    // Create or update subscription
    if (existingSub) {
      // Update existing subscription
      existingSub.status = 'active';
      existingSub.startDate = new Date();
      existingSub.endDate = endDate;
      existingSub.tier = tier || existingSub.tier;
      
      // Add history entry
      existingSub.history.push({
        action: 'renewed',
        date: new Date(),
        note: `Subscription renewed for ${months} month(s)`
      });
      
      await existingSub.save();
      
      res.json({
        message: 'Subscription renewed successfully',
        subscription: existingSub
      });
    } else {
      // Create new subscription
      const newSubscription = new Subscription({
        audienceEmail,
        creatorPageName,
        startDate: new Date(),
        endDate,
        tier: tier || 'basic',
        status: 'active',
        history: [{
          action: 'created',
          note: `Initial subscription for ${months} month(s)`
        }]
      });
      
      await newSubscription.save();
      
      // Update audience member's creators list if not already there
      const creatorExists = audience.creators.some(c => c.pageName === creatorPageName);
      if (!creatorExists) {
        audience.creators.push({ pageName: creatorPageName });
        await audience.save();
      }
      
      // Update creator's audience list if not already there
      const audienceExists = creator.audience.some(a => a.email === audienceEmail);
      if (!audienceExists) {
        creator.audience.push({ email: audienceEmail });
        await creator.save();
      }
      
      res.status(201).json({
        message: 'Subscription created successfully',
        subscription: newSubscription
      });
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Server error while creating subscription' });
  }
});

// Get all subscriptions for an audience member
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const audienceEmail = req.user.email;
    
    const subscriptions = await Subscription.find({ audienceEmail })
      .sort({ startDate: -1 }); // Newest first
    
    res.json({
      subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Server error while fetching subscriptions' });
  }
});

// Get subscription details for a specific creator
router.get('/subscriptions/:creatorPageName', authenticateToken, async (req, res) => {
  try {
    const { creatorPageName } = req.params;
    const audienceEmail = req.user.email;
    
    const subscription = await Subscription.findOne({
      audienceEmail,
      creatorPageName
    });
    
    if (!subscription) {
      return res.status(404).json({ 
        error: 'Subscription not found',
        isSubscribed: false
      });
    }
    
    // Check if subscription is active
    const isActive = subscription.status === 'active' && 
                     subscription.endDate >= new Date();
    
    res.json({
      subscription,
      isSubscribed: isActive,
      isExpired: subscription.status === 'active' && subscription.endDate < new Date()
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Server error while fetching subscription' });
  }
});

// Cancel a subscription
router.post('/subscriptions/:creatorPageName/cancel', authenticateToken, async (req, res) => {
  try {
    const { creatorPageName } = req.params;
    const audienceEmail = req.user.email;
    
    const subscription = await Subscription.findOne({
      audienceEmail,
      creatorPageName
    });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    if (subscription.status === 'cancelled') {
      return res.status(400).json({ error: 'Subscription is already cancelled' });
    }
    
    // Update subscription status
    subscription.status = 'cancelled';
    
    // Add history entry
    subscription.history.push({
      action: 'cancelled',
      date: new Date(),
      note: 'Subscription cancelled by user'
    });
    
    await subscription.save();
    
    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Server error while cancelling subscription' });
  }
});

// Get all subscriptions for a creator
router.get('/creator/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { pageName } = req.user;
    
    if (!pageName) {
      return res.status(400).json({ error: 'Creator page name is required' });
    }
    
    const subscriptions = await Subscription.find({
      creatorPageName: pageName
    }).sort({ startDate: -1 }); // Newest first
    
    // Count active subscriptions
    const activeSubscriptions = subscriptions.filter(
      sub => sub.status === 'active' && sub.endDate >= new Date()
    );
    
    res.json({
      subscriptions,
      totalCount: subscriptions.length,
      activeCount: activeSubscriptions.length
    });
  } catch (error) {
    console.error('Error fetching creator subscriptions:', error);
    res.status(500).json({ error: 'Server error while fetching subscriptions' });
  }
});

module.exports = router; 