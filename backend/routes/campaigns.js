const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import models
const Campaign = mongoose.model('Campaign');
const Audience = mongoose.model('Audience');

// Import middleware
const { authenticateToken, isCreator } = require('../middleware/authMiddleware');

// Import storage utilities
const { uploadToCloudStorage } = require('../utils/storage');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Validate image types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
    }
    
    cb(null, true);
  }
});

/**
 * CREATOR CAMPAIGN MANAGEMENT ROUTES
 */

// Create a new campaign
router.post(
  '/campaigns',
  authenticateToken,
  isCreator,
  upload.single('campaignImage'),
  async (req, res) => {
    try {
      const { 
        title, 
        description, 
        amount, 
        category,
        targetDate,
        launchImmediately,
        tags
      } = req.body;
      
      // Validate required fields
      if (!title || !description || !amount || !category) {
        return res.status(400).json({ error: 'Required fields missing' });
      }
      
      const { email, pageName } = req.user;
      
      if (!email || !pageName) {
        return res.status(400).json({ error: 'Creator information missing in token' });
      }
      
      // Validate amount as a number
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      
      // Determine campaign status based on launch preference
      const status = launchImmediately === 'true' ? 'active' : 'draft';
      const launchDate = launchImmediately === 'true' ? new Date() : null;
      
      // Upload image if provided
      let imageUrl = '';
      if (req.file) {
        try {
          const destination = `creators/${pageName}/campaigns/${title.replace(/\s+/g, '-').toLowerCase()}`;
          imageUrl = await uploadToCloudStorage(req.file, destination);
        } catch (uploadError) {
          console.error('Error uploading campaign image:', uploadError);
          // Continue with empty imageUrl if upload fails
        }
      }
      
      // Parse tags if provided
      const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      
      // Create campaign record
      const newCampaign = new Campaign({
        title,
        description,
        creatorEmail: email,
        pageName,
        amount: numericAmount,
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
        imageUrl,
        status,
        launchDate,
        tags: parsedTags
      });
      
      await newCampaign.save();
      
      res.status(201).json({
        message: status === 'active' ? 'Campaign created and launched successfully' : 'Campaign saved as draft',
        campaign: {
          id: newCampaign._id,
          title: newCampaign.title,
          status: newCampaign.status
        }
      });
    }
    catch (error) {
      console.error('Error creating campaign:', error);
      
      if (error.name === 'ValidationError') {
        // Handle mongoose validation errors
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validationErrors 
        });
      }
      
      if (error.code === 11000) {
        // Handle duplicate key errors
        return res.status(400).json({ error: 'A campaign with this title already exists' });
      }
      
      res.status(500).json({ error: 'Server error while creating campaign', details: error.message });
    }
  }
);

// Get all campaigns for a creator
router.get(
  '/campaigns',
  authenticateToken,
  isCreator,
  async (req, res) => {
    try {
      const { pageName } = req.user;
      
      const campaigns = await Campaign.find({ pageName })
        .sort({ createdAt: -1 }) // Newest first
        .select('-__v'); // Exclude version field
        
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching creator campaigns:', error);
      res.status(500).json({ error: 'Server error while fetching campaigns' });
    }
  }
);

// Get a specific campaign
router.get(
  '/campaigns/:campaignId',
  authenticateToken,
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      
      const campaign = await Campaign.findById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      // If user is not the creator, only return active campaigns
      if (req.user.pageName !== campaign.pageName && campaign.status !== 'active') {
        return res.status(403).json({ error: 'Campaign not available' });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ error: 'Server error while fetching campaign' });
    }
  }
);

// Update campaign details
router.put(
  '/campaigns/:campaignId',
  authenticateToken,
  isCreator,
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { pageName } = req.user;
      const updateData = req.body;
      
      // Find campaign and verify ownership
      const campaign = await Campaign.findById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (campaign.pageName !== pageName) {
        return res.status(403).json({ error: 'You can only modify your own campaigns' });
      }
      
      // Don't allow editing if campaign is completed or cancelled
      if (campaign.status === 'completed' || campaign.status === 'cancelled') {
        return res.status(400).json({ error: 'Cannot edit a completed or cancelled campaign' });
      }
      
      // Update fields (whitelist fields that can be updated)
      const allowedUpdates = [
        'title', 'description', 'amount', 'category', 'targetDate', 
        'imageUrl', 'videoUrl', 'status', 'tags'
      ];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedUpdates.includes(key)) {
          campaign[key] = value;
        }
      }
      
      // If updating to active, set launch date
      if (updateData.status === 'active' && campaign.status === 'draft') {
        campaign.launchDate = new Date();
      }
      
      await campaign.save();
      
      res.json({
        message: 'Campaign updated successfully',
        campaign
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ error: 'Server error while updating campaign' });
    }
  }
);

// Launch a campaign (change status from draft to active)
router.post(
  '/campaigns/:campaignId/launch',
  authenticateToken,
  isCreator,
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { email, pageName } = req.user;
      
      // Find campaign and verify ownership
      const campaign = await Campaign.findById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (campaign.pageName !== pageName) {
        return res.status(403).json({ error: 'You can only launch your own campaigns' });
      }
      
      // Check if campaign is already active
      if (campaign.status !== 'draft') {
        return res.status(400).json({ error: `Campaign cannot be launched (current status: ${campaign.status})` });
      }
      
      // Update campaign status
      campaign.status = 'active';
      campaign.launchDate = new Date();
      
      await campaign.save();

      // Find all audience members who follow this creator
      const followingAudiences = await Audience.find({
        'creators.pageName': pageName
      });
      
      // TODO: Send notifications to followers about the new campaign (this could be implemented with a notification system)
      // For now, we'll just log the number of potential notifications
      console.log(`New campaign notification would be sent to ${followingAudiences.length} followers`);
      
      res.json({
        message: 'Campaign launched successfully',
        campaign: {
          id: campaign._id,
          title: campaign.title,
          status: campaign.status,
          launchDate: campaign.launchDate
        }
      });
    } catch (error) {
      console.error('Error launching campaign:', error);
      res.status(500).json({ error: 'Server error while launching campaign' });
    }
  }
);

// Delete a campaign
router.delete(
  '/campaigns/:campaignId',
  authenticateToken,
  isCreator,
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { pageName } = req.user;
      
      // Find campaign and verify ownership
      const campaign = await Campaign.findById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (campaign.pageName !== pageName) {
        return res.status(403).json({ error: 'You can only delete your own campaigns' });
      }
      
      // Don't allow deleting a campaign with contributions
      if (campaign.audience && campaign.audience.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete a campaign that has received contributions',
          message: 'You can cancel the campaign instead, but it will remain visible to contributors'
        });
      }
      
      // Delete from database
      await Campaign.findByIdAndDelete(campaignId);
      
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ error: 'Server error while deleting campaign' });
    }
  }
);

/**
 * AUDIENCE CAMPAIGN ROUTES
 */

// Get all active campaigns (public)
router.get('/public/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'active' })
      .select('title description pageName imageUrl amount raisedAmount targetDate category audience createdAt')
      .sort({ createdAt: -1 });
    
    // Process campaigns to add necessary metadata
    const processedCampaigns = campaigns.map(campaign => {
      // Calculate funding percentage
      const fundingPercentage = campaign.amount > 0 
        ? Math.min(Math.round((campaign.raisedAmount / campaign.amount) * 100), 100)
        : 0;
      
      // Calculate days remaining
      const daysLeft = campaign.targetDate
        ? Math.max(0, Math.ceil((new Date(campaign.targetDate) - new Date()) / (1000 * 60 * 60 * 24)))
        : null;
      
      return {
        id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        pageName: campaign.pageName,
        imageUrl: campaign.imageUrl,
        amount: campaign.amount,
        raisedAmount: campaign.raisedAmount,
        targetDate: campaign.targetDate,
        category: campaign.category,
        audience: campaign.audience,
        createdAt: campaign.createdAt,
        fundingPercentage,
        daysLeft,
        backerCount: campaign.audience ? campaign.audience.length : 0
      };
    });
    
    res.json({ campaigns: processedCampaigns });
  } catch (error) {
    console.error('Error fetching public campaigns:', error);
    res.status(500).json({ error: 'Server error while fetching campaigns' });
  }
});

// Get campaigns for audience dashboard
router.get(
  '/audience/campaigns',
  authenticateToken,
  async (req, res) => {
    try {
      const { email } = req.user;
      
      // Find audience to get list of backed campaigns
      const audience = await Audience.findOne({ email }).select('projects');
      
      if (!audience) {
        return res.status(404).json({ error: 'Audience member not found' });
      }
      
      // Get IDs of campaigns the user has backed
      const backedCampaignIds = audience.projects.map(p => p.campaignId);
      
      // Find all backed campaigns
      const backedCampaigns = await Campaign.find({
        _id: { $in: backedCampaignIds }
      }).select('title description pageName imageUrl status amount raisedAmount targetDate');
      
      // Find campaigns from creators the user follows/subscribes to
      const followedCreators = audience.creators.map(c => c.pageName);
      
      const followedCampaigns = await Campaign.find({
        pageName: { $in: followedCreators },
        status: 'active',
        _id: { $nin: backedCampaignIds } // Exclude already backed campaigns
      }).limit(5).select('title description pageName imageUrl amount raisedAmount targetDate');
      
      // Process campaigns to add metrics
      const processedBackedCampaigns = backedCampaigns.map(campaign => {
        const userContribution = audience.projects.find(
          p => p.campaignId.toString() === campaign._id.toString()
        );
        
        const fundingPercentage = campaign.amount > 0 
          ? Math.min(parseFloat(((campaign.raisedAmount / campaign.amount) * 100).toFixed(2)), 100)
          : 0;
        
        return {
          id: campaign._id,
          title: campaign.title,
          description: campaign.description,
          pageName: campaign.pageName,
          imageUrl: campaign.imageUrl,
          status: campaign.status,
          amount: campaign.amount,
          raisedAmount: campaign.raisedAmount,
          targetDate: campaign.targetDate,
          fundingPercentage: fundingPercentage,
          contribution: userContribution ? userContribution.amount : 0,
          isFullyFunded: campaign.isFullyFunded(),
          hasEnded: campaign.hasEnded()
        };
      });
      
      // Process followed campaigns to add funding percentage
      const processedFollowedCampaigns = followedCampaigns.map(campaign => {
        const fundingPercentage = campaign.amount > 0 
          ? Math.min(parseFloat(((campaign.raisedAmount / campaign.amount) * 100).toFixed(2)), 100)
          : 0;
          
        return {
          id: campaign._id,
          title: campaign.title,
          description: campaign.description,
          pageName: campaign.pageName,
          imageUrl: campaign.imageUrl,
          amount: campaign.amount,
          raisedAmount: campaign.raisedAmount,
          targetDate: campaign.targetDate,
          fundingPercentage: fundingPercentage
        };
      });
      
      res.json({
        backedCampaigns: processedBackedCampaigns,
        followedCampaigns: processedFollowedCampaigns
      });
    } catch (error) {
      console.error('Error fetching audience campaigns:', error);
      res.status(500).json({ error: 'Server error while fetching campaigns' });
    }
  }
);

// Support a campaign (make a contribution)
router.post(
  '/campaigns/:campaignId/support',
  authenticateToken,
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { amount } = req.body;
      const { email, firstName, lastName } = req.user;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }
      
      // Find the campaign
      const campaign = await Campaign.findById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      // Check if campaign is active
      if (campaign.status !== 'active') {
        return res.status(400).json({ error: 'Campaign is not active' });
      }
      
      // Add audience member to campaign
      campaign.audience.push({
        audienceEmail: email,
        amount: Number(amount),
        firstName,
        lastName,
        date: new Date(),
        status: 'completed'
      });
      
      // Update raised amount
      campaign.raisedAmount += Number(amount);
      
      // Check if campaign is now fully funded
      if (campaign.raisedAmount >= campaign.amount) {
        campaign.status = 'completed';
      }
      
      await campaign.save();
      
      // Update audience projects
      await Audience.findOneAndUpdate(
        { email },
        {
          $push: {
            projects: {
              campaignId,
              title: campaign.title,
              pageName: campaign.pageName,
              amount: Number(amount),
              date: new Date()
            }
          }
        }
      );
      
      res.json({
        message: 'Successfully supported the campaign',
        campaign: {
          id: campaign._id,
          title: campaign.title,
          status: campaign.status,
          raisedAmount: campaign.raisedAmount,
          fundingPercentage: campaign.getFundingPercentage(),
          contribution: Number(amount)
        }
      });
    } catch (error) {
      console.error('Error supporting campaign:', error);
      res.status(500).json({ error: 'Server error while processing support' });
    }
  }
);

/**
 * @route GET /api/public/campaign/:campaignId
 * @desc Get detailed information about a campaign for public viewing
 * @access Public
 */
router.get('/public/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Only active and completed campaigns are publicly viewable
    if (campaign.status !== 'active' && campaign.status !== 'completed') {
      return res.status(403).json({ error: 'This campaign is not publicly viewable' });
    }
    
    // Get creator information
    const creator = await mongoose.model('Creator').findOne({ 
      email: campaign.creatorEmail 
    }).select('firstName lastName profileImage pageName bio isVerified');
    
    if (!creator) {
      return res.status(404).json({ error: 'Creator information not found' });
    }
    
    // Calculate funding percentage
    const fundingPercentage = campaign.getFundingPercentage ? campaign.getFundingPercentage() :
      Math.min(Math.round((campaign.raisedAmount / campaign.amount) * 100), 100);
    
    // Calculate days remaining
    const daysLeft = campaign.targetDate
      ? Math.max(0, Math.ceil((new Date(campaign.targetDate) - new Date()) / (1000 * 60 * 60 * 24)))
      : null;
    
    // Format campaign data for response
    const campaignData = {
      id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      creatorEmail: campaign.creatorEmail,
      pageName: campaign.pageName,
      amount: campaign.amount,
      raisedAmount: campaign.raisedAmount,
      category: campaign.category,
      tags: campaign.tags,
      targetDate: campaign.targetDate,
      imageUrl: campaign.imageUrl,
      status: campaign.status,
      createdAt: campaign.createdAt,
      launchDate: campaign.launchDate,
      fundingPercentage,
      daysLeft,
      backerCount: campaign.audience ? campaign.audience.length : 0,
      creator: {
        name: `${creator.firstName} ${creator.lastName}`,
        profileImage: creator.profileImage,
        pageName: creator.pageName,
        bio: creator.bio,
        isVerified: creator.isVerified
      }
    };
    
    res.json(campaignData);
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({ error: 'Server error while fetching campaign details' });
  }
});

/**
 * @route GET /api/campaigns/:campaignId
 * @desc Get detailed information about a specific campaign (creator view)
 * @access Private (Creator only)
 */
router.get('/campaigns/:campaignId', authenticateToken, isCreator, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const creatorEmail = req.user.email;
    
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Ensure the creator owns this campaign
    if (campaign.creatorEmail !== creatorEmail) {
      return res.status(403).json({ error: 'You do not have permission to view this campaign' });
    }
    
    // Get creator information
    const creator = await mongoose.model('Creator').findOne({ 
      email: campaign.creatorEmail 
    }).select('firstName lastName profileImage pageName bio isVerified');
    
    if (!creator) {
      return res.status(404).json({ error: 'Creator information not found' });
    }
    
    // Calculate funding percentage
    const fundingPercentage = campaign.getFundingPercentage ? campaign.getFundingPercentage() :
      Math.min(Math.round((campaign.raisedAmount / campaign.amount) * 100), 100);
    
    // Calculate days remaining
    const daysLeft = campaign.targetDate
      ? Math.max(0, Math.ceil((new Date(campaign.targetDate) - new Date()) / (1000 * 60 * 60 * 24)))
      : null;
    
    // Format campaign data for response
    const campaignData = {
      id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      creatorEmail: campaign.creatorEmail,
      pageName: campaign.pageName,
      amount: campaign.amount,
      raisedAmount: campaign.raisedAmount,
      category: campaign.category,
      tags: campaign.tags,
      targetDate: campaign.targetDate,
      imageUrl: campaign.imageUrl,
      videoUrl: campaign.videoUrl,
      status: campaign.status,
      createdAt: campaign.createdAt,
      launchDate: campaign.launchDate,
      audience: campaign.audience,
      rewards: campaign.rewards,
      updates: campaign.updates,
      fundingPercentage,
      daysLeft,
      backerCount: campaign.audience ? campaign.audience.length : 0,
      creator: {
        name: `${creator.firstName} ${creator.lastName}`,
        profileImage: creator.profileImage,
        pageName: creator.pageName,
        bio: creator.bio,
        isVerified: creator.isVerified
      }
    };
    
    res.json(campaignData);
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({ error: 'Server error while fetching campaign details' });
  }
});

module.exports = router; 