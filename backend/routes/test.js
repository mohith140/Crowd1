const express = require('express');
const router = express.Router();
const { authenticateToken, isCreator, isAudience } = require('../middleware/authMiddleware');

/**
 * @route GET /api/test/auth
 * @desc Test authentication middleware
 * @access Private
 */
router.get('/test/auth', authenticateToken, (req, res) => {
  try {
    res.json({
      message: 'Authentication successful',
      user: {
        id: req.user.id,
        email: req.user.email,
        userType: req.user.userType,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/test/creator
 * @desc Test creator middleware
 * @access Private (Creator only)
 */
router.get('/test/creator', authenticateToken, isCreator, (req, res) => {
  try {
    res.json({
      message: 'Creator authentication successful',
      user: {
        id: req.user.id,
        email: req.user.email,
        userType: req.user.userType,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    console.error('Test creator auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/test/audience
 * @desc Test audience middleware
 * @access Private (Audience only)
 */
router.get('/test/audience', authenticateToken, isAudience, (req, res) => {
  try {
    res.json({
      message: 'Audience authentication successful',
      user: {
        id: req.user.id,
        email: req.user.email,
        userType: req.user.userType,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    console.error('Test audience auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route GET /api/test/public
 * @desc Test public endpoint
 * @access Public
 */
router.get('/test/public', (req, res) => {
  try {
    res.json({
      message: 'Public endpoint works correctly',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test public endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 