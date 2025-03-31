const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Import models
const ExclusiveContent = mongoose.model('ExclusiveContent');
const Subscription = mongoose.model('Subscription');

// Import middleware
const { 
  authenticateToken, 
  verifySubscription, 
  verifyContentAccess, 
  isCreator 
} = require('../middleware/authMiddleware');

// Import storage utils
const { 
  uploadToCloudStorage, 
  generateSignedUrl,
  deleteFromCloudStorage
} = require('../utils/storage');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedTypes = [
      'video/mp4', 
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only videos, audios, images and PDFs are allowed.'), false);
    }
    
    cb(null, true);
  }
});

/**
 * Creator Routes
 */

// Create new exclusive content
router.post(
  '/creator/content', 
  authenticateToken, 
  isCreator,
  upload.single('contentFile'),
  async (req, res) => {
    try {
      // Validate required fields
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }
      
      // Make sure a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'Content file is required' });
      }
      
      const { email, pageName } = req.user;
      
      // Determine content type from mimetype
      let contentType = 'video'; // Default
      if (req.file.mimetype.startsWith('audio/')) contentType = 'audio';
      else if (req.file.mimetype.startsWith('image/')) contentType = 'image';
      else if (req.file.mimetype === 'application/pdf') contentType = 'pdf';
      
      // Upload file to cloud storage
      const destination = `creators/${pageName}/exclusive/${title.replace(/\s+/g, '-').toLowerCase()}`;
      const contentUrl = await uploadToCloudStorage(req.file, destination);
      
      // Create content record in database
      const newContent = new ExclusiveContent({
        title,
        description,
        creatorEmail: email,
        pageName,
        contentUrl,
        contentType,
        fileSize: req.file.size,
        status: 'published',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
      });
      
      await newContent.save();
      
      res.status(201).json({
        message: 'Exclusive content created successfully',
        content: {
          id: newContent._id,
          title: newContent.title,
          description: newContent.description,
          contentUrl: newContent.contentUrl,
          contentType: newContent.contentType,
          createdAt: newContent.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating exclusive content:', error);
      res.status(500).json({ error: 'Server error while creating content' });
    }
  }
);

// Get all content for creator (dashboard view)
router.get(
  '/creator/content',
  authenticateToken,
  isCreator,
  async (req, res) => {
    try {
      const { pageName } = req.user;
      
      const contents = await ExclusiveContent.find({ pageName })
        .sort({ createdAt: -1 }) // Newest first
        .select('-__v'); // Exclude version field
        
      res.json(contents);
    } catch (error) {
      console.error('Error fetching creator content:', error);
      res.status(500).json({ error: 'Server error while fetching content' });
    }
  }
);

// Update content metadata (not the file)
router.put(
  '/creator/content/:contentId',
  authenticateToken,
  isCreator,
  async (req, res) => {
    try {
      const { contentId } = req.params;
      const { pageName } = req.user;
      const { title, description, accessLevel, status, tags } = req.body;
      
      // Find content and verify ownership
      const content = await ExclusiveContent.findById(contentId);
      
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }
      
      if (content.pageName !== pageName) {
        return res.status(403).json({ error: 'You can only modify your own content' });
      }
      
      // Update fields
      if (title) content.title = title;
      if (description) content.description = description;
      if (accessLevel) content.accessLevel = accessLevel;
      if (status) content.status = status;
      if (tags) content.tags = tags.split(',').map(tag => tag.trim());
      
      await content.save();
      
      res.json({
        message: 'Content updated successfully',
        content
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Server error while updating content' });
    }
  }
);

// Delete content
router.delete(
  '/creator/content/:contentId',
  authenticateToken,
  isCreator,
  async (req, res) => {
    try {
      const { contentId } = req.params;
      const { pageName } = req.user;
      
      // Find content and verify ownership
      const content = await ExclusiveContent.findById(contentId);
      
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }
      
      if (content.pageName !== pageName) {
        return res.status(403).json({ error: 'You can only delete your own content' });
      }
      
      // Extract file path from URL for deletion
      const contentUrl = content.contentUrl;
      const bucketPath = contentUrl.split('storage.googleapis.com/')[1].split('/', 2)[1];
      
      // Delete from cloud storage
      try {
        await deleteFromCloudStorage(bucketPath);
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue anyway to delete the database entry
      }
      
      // Delete from database
      await ExclusiveContent.findByIdAndDelete(contentId);
      
      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: 'Server error while deleting content' });
    }
  }
);

/**
 * Audience Routes
 */

// Get list of available exclusive content for an audience member
router.get(
  '/audience/content',
  authenticateToken,
  async (req, res) => {
    try {
      const { email } = req.user;
      
      // Find all active subscriptions for this user
      const subscriptions = await Subscription.find({
        audienceEmail: email,
        status: 'active',
        endDate: { $gte: new Date() }
      });
      
      if (!subscriptions.length) {
        return res.json({ content: [], subscribed: false });
      }
      
      // Get page names of creators the user is subscribed to
      const creatorPageNames = subscriptions.map(sub => sub.creatorPageName);
      
      // Find all published content from these creators
      const contents = await ExclusiveContent.find({
        pageName: { $in: creatorPageNames },
        status: 'published'
      })
      .sort({ createdAt: -1 })
      .select('-__v');
      
      // Return content with restricted details
      const contentList = contents.map(content => ({
        id: content._id,
        title: content.title,
        description: content.description,
        contentType: content.contentType,
        creatorPageName: content.pageName,
        createdAt: content.createdAt,
        // Don't include direct URL - will be generated on demand
      }));
      
      res.json({
        content: contentList,
        subscribed: true
      });
    } catch (error) {
      console.error('Error fetching audience content:', error);
      res.status(500).json({ error: 'Server error while fetching content' });
    }
  }
);

// Get specific content for audience member
router.get(
  '/audience/content/:contentId',
  authenticateToken,
  verifyContentAccess, // This checks subscription and access
  async (req, res) => {
    try {
      // Content is already loaded and access verified by middleware
      const content = req.exclusiveContent;
      
      // Increase view count
      content.viewCount += 1;
      await content.save();
      
      // For security, generate a time-limited signed URL
      const fileName = content.contentUrl.split('storage.googleapis.com/')[1].split('/', 2)[1];
      
      // Generate URL that's valid for 2 hours
      const signedUrl = await generateSignedUrl(fileName, 120);
      
      res.json({
        id: content._id,
        title: content.title,
        description: content.description,
        contentType: content.contentType,
        creatorPageName: content.pageName,
        createdAt: content.createdAt,
        contentUrl: signedUrl, // Temporary access URL
        viewCount: content.viewCount
      });
    } catch (error) {
      console.error('Error fetching specific content:', error);
      res.status(500).json({ error: 'Server error while fetching content' });
    }
  }
);

// Get all content for a specific creator the audience is subscribed to
router.get(
  '/audience/creator/:creatorPageName/content',
  authenticateToken,
  verifySubscription, // Verify subscription to this creator
  async (req, res) => {
    try {
      const { creatorPageName } = req.params;
      
      // Find all published content from this creator
      const contents = await ExclusiveContent.find({
        pageName: creatorPageName,
        status: 'published'
      })
      .sort({ createdAt: -1 })
      .select('-__v');
      
      // Return content with restricted details
      const contentList = contents.map(content => ({
        id: content._id,
        title: content.title,
        description: content.description,
        contentType: content.contentType,
        creatorPageName: content.pageName,
        createdAt: content.createdAt,
        // Don't include direct URL - will be generated on demand
      }));
      
      res.json({
        creatorPageName,
        content: contentList
      });
    } catch (error) {
      console.error('Error fetching creator content for audience:', error);
      res.status(500).json({ error: 'Server error while fetching content' });
    }
  }
);

module.exports = router; 