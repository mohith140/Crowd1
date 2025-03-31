# Fundify Backend - Exclusive Content Management

This is the backend service for Fundify's exclusive content management system. It provides APIs for creators to upload and manage exclusive content, and for audience members to access content based on their subscription status.

## Features

- **Content Management**: Upload, update, and delete exclusive content
- **Subscription System**: Track user subscriptions to creators
- **Access Control**: Only allow subscribed users to access exclusive content
- **Secure URLs**: Generate time-limited secure URLs for content access
- **JWT Authentication**: Secure authentication for all API endpoints

## Prerequisites

- Node.js (v14+)
- MongoDB
- Google Cloud Storage account (or similar service)

## Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd fundify-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fundify
JWT_SECRET=your-jwt-secret-key
GCP_PROJECT_ID=your-gcp-project-id
GCP_BUCKET_NAME=your-bucket-name
NODE_ENV=development
```

4. Set up Google Cloud Storage:
   - Create a service account in Google Cloud Console
   - Download the keyfile and save it as `config/gcp-keyfile.json`
   - Create a bucket in Google Cloud Storage

5. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `/api/auth/login` - Login and get JWT token
- `/api/auth/register` - Register new user

### Exclusive Content - Creator
- `POST /api/creator/content` - Create new exclusive content
- `GET /api/creator/content` - List all content for a creator
- `PUT /api/creator/content/:contentId` - Update content metadata
- `DELETE /api/creator/content/:contentId` - Delete content

### Exclusive Content - Audience
- `GET /api/audience/content` - List all available content for subscriber
- `GET /api/audience/content/:contentId` - Get specific content with access URL
- `GET /api/audience/creator/:creatorPageName/content` - Get all content for a specific creator

### Subscriptions
- `POST /api/subscriptions` - Create/renew subscription
- `GET /api/subscriptions` - List all subscriptions for user
- `GET /api/subscriptions/:creatorPageName` - Check specific subscription
- `POST /api/subscriptions/:creatorPageName/cancel` - Cancel subscription
- `GET /api/creator/subscriptions` - Get all subscribers for creator

## Data Models

### ExclusiveContent
Stores metadata about exclusive content including:
- Title, description
- Content URL, type, size
- Creator information
- Access control settings
- View statistics

### Subscription
Tracks subscriptions between audience members and creators:
- Subscription status
- Start and end dates
- Subscription tier
- History of subscription changes

## Security

- Content files are stored securely in cloud storage
- Content access URLs are time-limited and secure
- JWT authentication is required for all API endpoints
- Access control middleware validates subscription status before granting access

## Development

```bash
# Run development server with hot reloading
npm run dev

# Run tests
npm test
``` 