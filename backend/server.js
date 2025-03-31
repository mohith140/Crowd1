const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up MongoDB connection
const MONGODB_URI = process.env.DB_CONNECTION || 'mongodb://localhost:27017/fundify';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Register models
require('./models/Audience');
require('./models/Creator');
require('./models/Campaign');
require('./models/ExclusiveContent');
require('./models/Subscription');
require('./models/Project');

// Routes
const audienceRoutes = require('./routes/audience');
const creatorRoutes = require('./routes/creator');
const campaignRoutes = require('./routes/campaigns');
const authRoutes = require('./routes/auth');
const exclusiveContentRoutes = require('./routes/exclusiveContent');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const projectRoutes = require('./routes/projects');
const testRoutes = require('./routes/test');

// Use routes
app.use('/api', audienceRoutes);
app.use('/api', creatorRoutes);
app.use('/api', campaignRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', exclusiveContentRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', projectRoutes);
app.use('/api', testRoutes);

// For backward compatibility with fundify-Backend-main 
// This ensures old endpoints still work

// Payment endpoints
app.post("/orders", (req, res) => {
  // Redirect to the new endpoint
  req.url = "/api/payments/orders";
  app.handle(req, res);
});

app.post("/create-order", (req, res) => {
  // Redirect to the new endpoint
  req.url = "/api/payments/create-order";
  app.handle(req, res);
});

// Project endpoints
app.get("/projects", (req, res) => {
  req.url = "/api/projects";
  app.handle(req, res);
});

app.get("/projects/:projectId", (req, res) => {
  req.url = `/api/projects/${req.params.projectId}`;
  app.handle(req, res);
});

app.post("/projects/new", (req, res) => {
  req.url = "/api/projects";
  app.handle(req, res);
});

app.post("/projects/upload/:pageName", (req, res) => {
  req.url = `/api/projects/upload/${req.params.pageName}`;
  app.handle(req, res);
});

// Creator endpoints
app.get("/creators", (req, res) => {
  req.url = "/api/creators";
  app.handle(req, res);
});

// Exclusive content endpoints
app.post("/creator/exclusive/view", (req, res) => {
  req.url = "/api/exclusive-content/creator";
  req.method = "GET";
  req.query = { pageName: req.body.pageName };
  app.handle(req, res);
});

app.post("/creator/exclusive/new", (req, res) => {
  req.url = "/api/exclusive-content";
  app.handle(req, res);
});

app.post("/creators/exclusive", (req, res) => {
  req.url = "/api/exclusive-content/audience";
  req.query = { userEmail: req.body.userEmail };
  app.handle(req, res);
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Define port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 