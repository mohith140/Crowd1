const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Audience = mongoose.model('Audience');
const Creator = mongoose.model('Creator');
const { generateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

/**
 * @route POST /api/auth/login
 * @desc Login for audience or creator
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    // console.log(email, password, userType);
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Determine the model to use based on user type
    const Model = userType === 'creator' ? Creator : Audience;
    
    // Find user by email
    const user = await Model.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        profileImage: user.profileImage || ''
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route POST /api/auth/register/audience
 * @desc Register a new audience member
 * @access Public
 */
router.post('/register/audience', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate request
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email and password are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await Audience.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new audience
    const newAudience = new Audience({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      userType: 'audience'
    });
    
    // Save user
    await newAudience.save();
    
    // Generate JWT token
    const token = generateToken(newAudience);
    
    // Return user info and token
    res.status(201).json({
      message: 'Audience registration successful',
      token,
      user: {
        id: newAudience._id,
        email: newAudience.email,
        firstName: newAudience.firstName,
        lastName: newAudience.lastName,
        userType: 'audience'
      }
    });
    
  } catch (error) {
    console.error('Audience registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route POST /api/auth/register/creator
 * @desc Register a new creator
 * @access Public
 */
router.post('/register/creator', async (req, res) => {
  try {
    const { firstName, lastName, email, password, pageName, category, bio } = req.body;
    
    // Validate request
    if (!firstName || !lastName || !email || !password || !pageName) {
      return res.status(400).json({ 
        message: 'First name, last name, email, password and page name are required' 
      });
    }
    
    // Check if user already exists with this email
    const existingUserEmail = await Creator.findOne({ email: email.toLowerCase() });
    
    if (existingUserEmail) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Check if page name is already taken
    const existingPageName = await Creator.findOne({ pageName });
    
    if (existingPageName) {
      return res.status(400).json({ message: 'This page name is already taken' });
    }
    
    // Create new creator
    const newCreator = new Creator({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      pageName,
      category: category || 'Other',
      bio: bio || '',
      userType: 'creator'
    });
    
    // Save creator
    await newCreator.save();
    
    // Generate JWT token
    const token = generateToken(newCreator);
    
    // Return user info and token
    res.status(201).json({
      message: 'Creator registration successful',
      token,
      user: {
        id: newCreator._id,
        email: newCreator.email,
        firstName: newCreator.firstName,
        lastName: newCreator.lastName,
        pageName: newCreator.pageName,
        userType: 'creator'
      }
    });
    
  } catch (error) {
    console.error('Creator registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route POST /api/auth/verify-token
 * @desc Verify a JWT token and return user info
 * @access Public
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Determine model based on user type
    const Model = payload.userType === 'creator' ? Creator : Audience;
    
    // Find user to verify they still exist
    const user = await Model.findById(payload.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user info
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        pageName: user.pageName || null,
        profileImage: user.profileImage || ''
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private (Both audience and creator)
 */
router.post('/change-password', async (req, res) => {
  try {
    const { userId, userType, currentPassword, newPassword } = req.body;
    
    if (!userId || !userType || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'User ID, user type, current password and new password are required' 
      });
    }
    
    // Determine model based on user type
    const Model = userType === 'creator' ? Creator : Audience;
    
    // Find user
    const user = await Model.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 