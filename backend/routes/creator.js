const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Import models
const Creator = mongoose.model('Creator');
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
    fileSize: 5 * 1024 * 1024, // 5MB max file size
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
 * @route GET /api/creators
 * @desc Get all creators
 * @access Public
 */
router.get('/creators', async (req, res) => {
  try {
    const creators = await Creator.find().select('-password');
    res.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/creator/profile
 * @desc Get creator profile
 * @access Private (Creator only)
 */
router.get('/creator/profile', authenticateToken, isCreator, async (req, res) => {
  try {
    const { email } = req.user;

    const creator = await Creator.findOne({ email }).select('-password');
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator account not found' });
    }

    res.json(creator);
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route PUT /api/creator/profile
 * @desc Update creator profile
 * @access Private (Creator only)
 */
router.put('/creator/profile', authenticateToken, isCreator, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { email } = req.user;
    const {
      firstName,
      lastName,
      bio,
      category,
      website,
      twitter,
      instagram,
      facebook,
      youtube,
      accountName,
      accountNumber,
      bankName,
      routingNumber
    } = req.body;

    // Find creator
    const creator = await Creator.findOne({ email });
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator account not found' });
    }

    // Update basic info
    if (firstName) creator.firstName = firstName;
    if (lastName) creator.lastName = lastName;
    if (bio) creator.bio = bio;
    if (category) creator.category = category;

    // Update social links
    if (website || twitter || instagram || facebook || youtube) {
      creator.socialLinks = {
        ...creator.socialLinks,
        website: website || creator.socialLinks.website,
        twitter: twitter || creator.socialLinks.twitter,
        instagram: instagram || creator.socialLinks.instagram,
        facebook: facebook || creator.socialLinks.facebook,
        youtube: youtube || creator.socialLinks.youtube
      };
    }

    // Update bank details
    if (accountName || accountNumber || bankName || routingNumber) {
      creator.bankDetails = {
        ...creator.bankDetails,
        accountName: accountName || creator.bankDetails.accountName,
        accountNumber: accountNumber || creator.bankDetails.accountNumber,
        bankName: bankName || creator.bankDetails.bankName,
        routingNumber: routingNumber || creator.bankDetails.routingNumber
      };
    }

    // Upload and update profile image if provided
    if (req.files && req.files.profileImage) {
      const destination = `creators/${creator.pageName}/profile`;
      creator.profileImage = await uploadToCloudStorage(req.files.profileImage[0], destination);
    }

    // Upload and update cover image if provided
    if (req.files && req.files.coverImage) {
      const destination = `creators/${creator.pageName}/cover`;
      creator.coverImage = await uploadToCloudStorage(req.files.coverImage[0], destination);
    }

    await creator.save();

    res.json({
      message: 'Profile updated successfully',
      creator: {
        id: creator._id,
        firstName: creator.firstName,
        lastName: creator.lastName,
        email: creator.email,
        pageName: creator.pageName,
        bio: creator.bio,
        profileImage: creator.profileImage,
        coverImage: creator.coverImage,
        category: creator.category,
        socialLinks: creator.socialLinks,
        bankDetails: creator.bankDetails
      }
    });
  } catch (error) {
    console.error('Error updating creator profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/creator/dashboard
 * @desc Get creator dashboard stats
 * @access Private (Creator only)
 */
router.get('/creator/dashboard', authenticateToken, isCreator, async (req, res) => {
  try {
    const { email, pageName } = req.user;

    // Get creator
    const creator = await Creator.findOne({ email });
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator account not found' });
    }

    // Get campaigns stats
    const campaigns = await Campaign.find({ creatorEmail: email });
    
    // Calculate total raised amount across all campaigns
    const totalRaised = campaigns.reduce((total, campaign) => total + campaign.raisedAmount, 0);
    
    // Calculate follower count
    const followerCount = creator.followers.length;
    
    // Get count of active campaigns
    const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length;
    
    // Get count of completed campaigns
    const completedCampaigns = campaigns.filter(campaign => campaign.status === 'completed').length;
    
    // Get most recent campaigns
    const recentCampaigns = await Campaign.find({ creatorEmail: email })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status raisedAmount amount');
    
    // Get recent followers
    const recentFollowers = creator.followers
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Fetch audience details for recent followers
    const recentFollowerDetails = await Promise.all(
      recentFollowers.map(async (follower) => {
        const audience = await Audience.findOne({ email: follower.audienceEmail })
          .select('firstName lastName profileImage');
        
        return {
          email: follower.audienceEmail,
          name: audience ? `${audience.firstName} ${audience.lastName}` : 'Anonymous',
          profileImage: audience ? audience.profileImage : '',
          date: follower.date
        };
      })
    );

    res.json({
      totalRaised,
      followerCount,
      activeCampaigns,
      completedCampaigns,
      recentCampaigns,
      recentFollowers: recentFollowerDetails
    });
  } catch (error) {
    console.error('Error fetching creator dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/creator/:pageName
 * @desc Get creator public profile by page name
 * @access Public
 */
router.get('/creator/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;

    const creator = await Creator.findOne({ pageName }).select('-password -bankDetails');
    
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Get active campaigns
    const activeCampaigns = await Campaign.find({ 
      pageName, 
      status: 'active' 
    }).sort({ createdAt: -1 });

    const processedCampaigns = activeCampaigns.map(campaign => {
      const fundingPercentage = Math.min(
        Math.round((campaign.raisedAmount / campaign.amount) * 100),
        100
      );
      
      return {
        id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        amount: campaign.amount,
        raisedAmount: campaign.raisedAmount,
        category: campaign.category,
        targetDate: campaign.targetDate,
        imageUrl: campaign.imageUrl,
        fundingPercentage,
        backerCount: campaign.audience ? campaign.audience.length : 0
      };
    });

    res.json({
      creator: {
        id: creator._id,
        name: `${creator.firstName} ${creator.lastName}`,
        pageName: creator.pageName,
        bio: creator.bio,
        profileImage: creator.profileImage,
        coverImage: creator.coverImage,
        category: creator.category,
        socialLinks: creator.socialLinks,
        followerCount: creator.followers.length,
        isVerified: creator.isVerified
      },
      campaigns: processedCampaigns
    });
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 