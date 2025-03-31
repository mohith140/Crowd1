const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ExclusiveContent = mongoose.model('ExclusiveContent');
const Subscription = mongoose.model('Subscription');

const JWT_SECRET = process.env.JWT_SECRET || 'fundify-jwt-secret-key';

/**
 * Verify JWT token middleware
 */
const authenticateToken = (req, res, next) => {
  // Get the token from various possible sources
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  // If no token provided, check query string or cookie
  const queryToken = req.query.token;
  const cookieToken = req.cookies && req.cookies.token;
  
  const finalToken = token || queryToken || cookieToken;
  
  if (!finalToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Verify the token
  jwt.verify(finalToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Store user data from token
    next();
  });
};

/**
 * Check if the user has an active subscription to the creator
 */
const verifySubscription = async (req, res, next) => {
  try {
    // Must come after authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { email } = req.user;
    const { creatorPageName } = req.params;
    
    // If no creator specified, try to get from request body
    const pageNameToCheck = creatorPageName || req.body.creatorPageName || req.body.pageName;
    
    if (!pageNameToCheck) {
      return res.status(400).json({ error: 'Creator page name is required' });
    }
    
    // Check for active subscription
    const subscription = await Subscription.findOne({
      audienceEmail: email,
      creatorPageName: pageNameToCheck,
      status: 'active',
      endDate: { $gte: new Date() }
    });
    
    if (!subscription) {
      return res.status(403).json({ 
        error: 'Subscription required',
        message: 'You need an active subscription to access this content',
        subscriptionRequired: true
      });
    }
    
    // Store subscription in request for later use
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: 'Server error while verifying subscription' });
  }
};

/**
 * Check if user has access to specific exclusive content
 * This middleware expects the content ID in the request parameters
 */
const verifyContentAccess = async (req, res, next) => {
  try {
    // Must come after authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { email } = req.user;
    const { contentId } = req.params;
    
    if (!contentId) {
      return res.status(400).json({ error: 'Content ID is required' });
    }
    
    // Get the content
    const content = await ExclusiveContent.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Use the model method to check access
    const hasAccess = await content.isAccessibleTo(email);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You need an active subscription to access this content',
        subscriptionRequired: true,
        creatorPageName: content.pageName
      });
    }
    
    // Store content in request for later use
    req.exclusiveContent = content;
    next();
  } catch (error) {
    console.error('Error verifying content access:', error);
    res.status(500).json({ error: 'Server error while verifying content access' });
  }
};

/**
 * Check if the user is a creator
 */
const isCreator = (req, res, next) => {
  // Must come after authenticateToken middleware
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.userType !== 'creator') {
    return res.status(403).json({ error: 'Creator privileges required' });
  }
  
  next();
};

/**
 * Check if the user is an audience member
 */
const isAudience = (req, res, next) => {
  // Must come after authenticateToken middleware
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.userType !== 'audience') {
    return res.status(403).json({ error: 'Audience privileges required' });
  }
  
  next();
};

/**
 * Generate JWT token for a user
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    pageName: user.pageName,
    userType: user.userType,
    isAdmin: user.isAdmin || false
  };
  
  return jwt.sign(
    payload, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticateToken,
  verifySubscription,
  verifyContentAccess,
  isCreator,
  isAudience,
  generateToken
}; 