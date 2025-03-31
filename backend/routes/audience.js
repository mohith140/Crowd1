const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Campaign = mongoose.model('Campaign');
const Subscription = mongoose.model('Subscription');
const ExclusiveContent = mongoose.model('ExclusiveContent');
const Audience = mongoose.model('Audience');
const { authenticateToken, isAudience } = require('../middleware/authMiddleware');

/**
 * @route GET /api/audience/campaigns
 * @desc Get backed and followed campaigns for audience
 * @access Private (Audience only)
 */
router.get('/audience/campaigns', authenticateToken, isAudience, async (req, res) => {
  try {
    const audienceEmail = req.user.email;

    // Find the audience user
    const audience = await Audience.findOne({ email: audienceEmail });
    
    if (!audience) {
      return res.status(404).json({ message: 'Audience account not found' });
    }

    // Get campaigns the audience has backed (contributed to)
    const backedCampaigns = await Campaign.find({
      'audience.audienceEmail': audienceEmail
    }).select('-audience').sort({ createdAt: -1 });

    // Add contribution amount for each backed campaign
    const backedCampaignsWithContribution = backedCampaigns.map(campaign => {
      const audienceData = campaign.audience.find(a => a.audienceEmail === audienceEmail);
      const contribution = audienceData ? audienceData.amount : 0;
      
      // Calculate funding percentage
      const fundingPercentage = Math.min(
        Math.round((campaign.raisedAmount / campaign.amount) * 100),
        100
      );
      
      return {
        id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        creatorEmail: campaign.creatorEmail,
        pageName: campaign.pageName,
        amount: campaign.amount,
        raisedAmount: campaign.raisedAmount,
        category: campaign.category,
        targetDate: campaign.targetDate,
        imageUrl: campaign.imageUrl,
        status: campaign.status,
        fundingPercentage,
        contribution
      };
    });

    // Get campaigns from creators the audience follows
    const followedCreatorPageNames = audience.creators || [];
    
    // Find active campaigns from followed creators that the user hasn't backed yet
    const followedCampaigns = await Campaign.find({
      pageName: { $in: followedCreatorPageNames },
      status: 'active',
      'audience.audienceEmail': { $ne: audienceEmail }
    }).select('-audience').sort({ createdAt: -1 });

    // Add funding percentage to followed campaigns
    const followedCampaignsWithPercentage = followedCampaigns.map(campaign => {
      // Calculate funding percentage
      const fundingPercentage = Math.min(
        Math.round((campaign.raisedAmount / campaign.amount) * 100),
        100
      );
      
      return {
        id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        creatorEmail: campaign.creatorEmail,
        pageName: campaign.pageName,
        amount: campaign.amount,
        raisedAmount: campaign.raisedAmount,
        category: campaign.category,
        targetDate: campaign.targetDate,
        imageUrl: campaign.imageUrl,
        status: campaign.status,
        fundingPercentage
      };
    });

    res.json({
      backedCampaigns: backedCampaignsWithContribution,
      followedCampaigns: followedCampaignsWithPercentage
    });
    
  } catch (error) {
    console.error('Error fetching audience campaigns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/audience/content
 * @desc Get accessible exclusive content for audience
 * @access Private (Audience only)
 */
router.get('/audience/content', authenticateToken, isAudience, async (req, res) => {
  try {
    const audienceEmail = req.user.email;

    // Find active subscriptions for this audience
    const activeSubscriptions = await Subscription.find({
      audienceEmail,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (activeSubscriptions.length === 0) {
      return res.json({ content: [] });
    }

    // Get creator page names from subscriptions
    const creatorPageNames = activeSubscriptions.map(sub => sub.creatorPageName);

    // Find published exclusive content from subscribed creators
    const content = await ExclusiveContent.find({
      creatorPageName: { $in: creatorPageNames },
      published: true
    }).sort({ createdAt: -1 });

    res.json({
      content: content.map(item => ({
        id: item._id,
        title: item.title,
        description: item.description,
        contentType: item.contentType || 'video',
        creatorPageName: item.creatorPageName,
        fileUrl: item.fileUrl,
        thumbnailUrl: item.thumbnailUrl,
        createdAt: item.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching audience exclusive content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/audience/campaign/:campaignId
 * @desc Get campaign details for audience view
 * @access Private (Audience only)
 */
router.get('/audience/campaign/:campaignId', authenticateToken, isAudience, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const audienceEmail = req.user.email;
    
    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Find audience data to check if already backed
    const audience = await Audience.findOne({ email: audienceEmail });
    
    if (!audience) {
      return res.status(404).json({ message: 'Audience account not found' });
    }
    
    // Check if user has already backed this campaign
    const hasBacked = audience.projects.some(p => p.campaignId.toString() === campaignId);
    
    // Calculate contribution amount if any
    const userContribution = audience.projects.find(p => p.campaignId.toString() === campaignId);
    
    // Calculate funding percentage
    const fundingPercentage = campaign.amount > 0 
      ? Math.min(Math.round((campaign.raisedAmount / campaign.amount) * 100), 100)
      : 0;
    
    // Calculate days left
    const daysLeft = campaign.targetDate
      ? Math.max(0, Math.ceil((new Date(campaign.targetDate) - new Date()) / (1000 * 60 * 60 * 24)))
      : null;
    
    // Get creator info
    const creator = await mongoose.model('Creator').findOne({
      pageName: campaign.pageName
    }).select('firstName lastName profileImage bio isVerified');
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    
    // Prepare campaign data
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
      rewards: campaign.rewards || [],
      updates: campaign.updates || [],
      fundingPercentage,
      daysLeft,
      backerCount: campaign.audience ? campaign.audience.length : 0,
      hasBacked,
      contribution: userContribution ? userContribution.amount : 0,
      creator: {
        name: `${creator.firstName} ${creator.lastName}`,
        profileImage: creator.profileImage,
        pageName: creator.pageName,
        bio: creator.bio,
        isVerified: creator.isVerified
      }
    };
    
    res.json({ campaign: campaignData });
  } catch (error) {
    console.error('Error fetching campaign for audience:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route POST /api/audience/back-campaign
 * @desc Back a campaign with a contribution
 * @access Private (Audience only)
 */
router.post('/audience/back-campaign', authenticateToken, isAudience, async (req, res) => {
  try {
    const { campaignId, amount } = req.body;
    const audienceEmail = req.user.email;
    
    // Validate request
    if (!campaignId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Campaign ID and a positive amount are required' });
    }

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID format' });
    }

    // Find audience data
    const audience = await Audience.findOne({ email: audienceEmail });
    
    if (!audience) {
      return res.status(404).json({ message: 'Audience account not found' });
    }

    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Ensure campaign is active
    if (campaign.status !== 'active') {
      return res.status(400).json({ 
        message: `Cannot back a campaign with status "${campaign.status}". Only active campaigns can be backed.` 
      });
    }

    // Check if audience already backed this campaign
    const existingBackerIndex = campaign.audience.findIndex(a => a.audienceEmail === audienceEmail);
    
    if (existingBackerIndex !== -1) {
      // Update existing contribution
      campaign.audience[existingBackerIndex].amount += Number(amount);
      campaign.audience[existingBackerIndex].date = new Date();
    } else {
      // Add new backer
      campaign.audience.push({
        audienceEmail,
        firstName: audience.firstName,
        lastName: audience.lastName,
        amount: Number(amount),
        date: new Date(),
        status: 'completed'
      });
      
      // If not already following this creator, add to followed creators
      if (!audience.creators.includes(campaign.pageName)) {
        audience.creators.push(campaign.pageName);
        await audience.save();
      }
    }

    // Update raised amount
    campaign.raisedAmount += Number(amount);
    
    // Save the campaign
    await campaign.save();
    
    res.json({ 
      message: 'Successfully backed the campaign',
      campaign: {
        id: campaign._id,
        title: campaign.title,
        raisedAmount: campaign.raisedAmount,
        amount: campaign.amount,
        fundingPercentage: Math.min(
          Math.round((campaign.raisedAmount / campaign.amount) * 100),
          100
        )
      }
    });
    
  } catch (error) {
    console.error('Error backing campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/audience/funding-history
 * @desc Get funding history for audience member
 * @access Private (Audience only)
 */
router.get('/audience/funding-history', authenticateToken, isAudience, async (req, res) => {
  try {
    const audienceEmail = req.user.email;
    
    // Find campaigns with contributions from this audience
    const campaigns = await Campaign.find({
      'audience.audienceEmail': audienceEmail
    });
    
    // Format the funding history
    const fundingHistory = [];
    
    campaigns.forEach(campaign => {
      // Get all contributions by this audience to this campaign
      const contributions = campaign.audience
        .filter(a => a.audienceEmail === audienceEmail)
        .map(a => ({
          date: a.date,
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          creatorPageName: campaign.pageName,
          amount: a.amount,
          status: a.status
        }));
      
      fundingHistory.push(...contributions);
    });
    
    // Sort by date (newest first)
    fundingHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ fundingHistory });
  } catch (error) {
    console.error('Error fetching funding history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/audience/monthly-supporters
 * @desc Get list of supporters who support the audience on a monthly basis
 * @access Private (Audience only)
 */
router.get('/audience/monthly-supporters', authenticateToken, isAudience, async (req, res) => {
  try {
    const audienceEmail = req.user.email;
    
    // Currently, our model doesn't support monthly supporters for audience members
    // This endpoint is a placeholder for future implementation
    res.json({ 
      monthlySupporters: [],
      message: "Monthly supporters feature is not yet implemented" 
    });
  } catch (error) {
    console.error('Error fetching monthly supporters:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 