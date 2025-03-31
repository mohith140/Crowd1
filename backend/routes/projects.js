const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Import models
const Project = mongoose.model('Project');
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
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private (Creator only)
 */
router.post('/projects', authenticateToken, isCreator, upload.single('projectImage'), async (req, res) => {
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
    if (!title || !description || !amount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const { email, pageName } = req.user;
    
    // Determine project status based on launch preference
    const status = launchImmediately === 'true' ? 'active' : 'draft';
    
    // Upload image if provided
    let imageUrl = '';
    if (req.file) {
      const destination = `creators/${pageName}/projects/${title.replace(/\s+/g, '-').toLowerCase()}`;
      imageUrl = await uploadToCloudStorage(req.file, destination);
    }
    
    // Parse tags if provided
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Create project record
    const newProject = new Project({
      title,
      description,
      email,
      pageName,
      amount: Number(amount),
      category: category || 'Other',
      targetDate: targetDate ? new Date(targetDate) : null,
      imageUrl,
      status,
      tags: parsedTags
    });
    
    await newProject.save();
    
    // For backward compatibility, store email in a variable
    // This is not a good practice but matches the old code
    global.currentEmail = email;
    
    res.status(201).json({
      message: status === 'active' ? 'Project created and launched successfully' : 'Project saved as draft',
      project: newProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Server error while creating project', details: error.message });
  }
});

/**
 * @route POST /api/projects/upload/:pageName
 * @desc Upload a project image
 * @access Private (Creator only)
 */
router.post('/projects/upload/:pageName', authenticateToken, isCreator, async (req, res) => {
  try {
    const { pageName } = req.params;
    const { email } = req.user;
    
    // Store current email for backward compatibility
    global.currentEmail = email;
    
    // Process the upload
    upload.single('projectImage')(req, res, async (err) => {
      if (err) {
        console.error('Error processing upload:', err);
        return res.status(500).json({ error: 'Error processing file upload' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      try {
        const destination = `creators/${pageName}/projects`;
        const publicUrl = await uploadToCloudStorage(req.file, destination);
        
        // Update project URL if currentEmail is available (for backward compatibility)
        if (email) {
          await Project.updateOne(
            { email, pageName },
            { $set: { projectURL: publicUrl } }
          );
        }
        
        res.json({ url: publicUrl });
      } catch (uploadError) {
        console.error('Error uploading to cloud storage:', uploadError);
        res.status(500).json({ error: 'Error uploading to cloud storage' });
      }
    });
  } catch (error) {
    console.error('Error handling project upload:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * @route GET /api/projects
 * @desc Get all projects or projects for a specific creator
 * @access Public
 */
router.get('/projects', async (req, res) => {
  try {
    const { email, pageName, status } = req.query;
    const filter = {};
    
    if (email) {
      filter.email = email;
    }
    
    if (pageName) {
      filter.pageName = pageName;
    }
    
    if (status) {
      filter.status = status;
    }
    
    const projects = await Project.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
});

/**
 * @route GET /api/projects/:projectId
 * @desc Get a specific project by ID
 * @access Public
 */
router.get('/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ error: 'Server error while fetching project details' });
  }
});

/**
 * @route POST /api/projects/:projectId/pledge
 * @desc Pledge to support a project
 * @access Private
 */
router.post('/projects/:projectId/pledge', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount } = req.body;
    const { email, firstName, lastName } = req.user;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // Find the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Add audience member to project
    project.audience.push({
      audienceEmail: email,
      amount: Number(amount),
      firstName,
      lastName,
      timestamp: new Date(),
      status: 'completed'
    });
    
    // Update raised amount
    project.raisedAmount = (project.raisedAmount || 0) + Number(amount);
    
    await project.save();
    
    // For backward compatibility, also handle the old route format
    // This mimics the old behavior but uses the new models
    const { title, pageName } = project;
    
    // Update audience projects
    await Audience.findOneAndUpdate(
      { email },
      {
        $push: {
          projects: {
            projectId,
            title,
            pageName,
            amount: Number(amount),
            date: new Date()
          }
        }
      }
    );
    
    res.json({
      message: 'Successfully supported the project',
      project: {
        id: project._id,
        title: project.title,
        status: project.status,
        raisedAmount: project.raisedAmount,
        fundingPercentage: project.getFundingPercentage ? project.getFundingPercentage() : 
          Math.min(Math.round((project.raisedAmount / project.amount) * 100), 100),
        contribution: Number(amount)
      }
    });
  } catch (error) {
    console.error('Error pledging to project:', error);
    res.status(500).json({ error: 'Server error while processing pledge' });
  }
});

/**
 * @route DELETE /api/projects/:projectId
 * @desc Delete a project
 * @access Private (Creator only)
 */
router.delete('/projects/:projectId', authenticateToken, isCreator, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { pageName } = req.user;
    
    // Find project and verify ownership
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.pageName !== pageName) {
      return res.status(403).json({ error: 'You can only delete your own projects' });
    }
    
    // Don't allow deleting a project with contributions
    if (project.audience && project.audience.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete a project that has received contributions',
        message: 'You can cancel the project instead, but it will remain visible to contributors'
      });
    }
    
    // Delete from database
    await Project.findByIdAndDelete(projectId);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Server error while deleting project' });
  }
});

// For backward compatibility with fundify-Backend-main
router.post('/creator/project/pledge', async (req, res) => {
  try {
    const { projectTitle, pageName, audienceEmail, amount, firstName, lastName, timestamp } = req.body;
    
    // Find the project
    const project = await Project.findOne({ title: projectTitle, pageName });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Add audience member to project
    project.audience.push({
      audienceEmail,
      amount: Number(amount),
      firstName,
      lastName,
      timestamp: timestamp || new Date(),
      status: 'completed'
    });
    
    // Update raised amount
    project.raisedAmount = (project.raisedAmount || 0) + Number(amount);
    
    await project.save();
    
    res.send('pledged');
  } catch (error) {
    console.error('Error with legacy pledge endpoint:', error);
    res.status(500).json({ error: 'Server error processing pledge' });
  }
});

module.exports = router; 