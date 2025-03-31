# Crowd1 - Crowdfunding Platform

Crowd1 is a modern crowdfunding platform that enables users to create, discover, and support various fundraising campaigns. The platform provides a seamless experience for both campaign creators and supporters.

## Features

- User authentication and authorization
- Campaign creation and management
- Secure payment processing
- Real-time campaign updates
- Interactive dashboard for campaign creators
- Responsive and modern UI
- File upload capabilities for campaign media
- Social sharing integration

## Tech Stack

### Frontend
- React.js
- Material-UI
- Redux for state management
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Multer for file uploads

## Project Structure

```
crowd1/
├── backend/                 # Backend server
│   ├── config/             # Configuration files
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── uploads/           # File upload directory
│
└── Fundify-Frontend-main/  # Frontend application
    ├── src/               # Source code
    ├── public/            # Static files
    └── build/             # Production build
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd crowd1
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../Fundify-Frontend-main
npm install
```

4. Set up environment variables
- Create `.env` files in both backend and frontend directories
- Copy the respective `.env.example` files and fill in your configuration

### Running the Application

1. Start the backend server
```bash
cd backend
npm start
```

2. Start the frontend development server
```bash
cd Fundify-Frontend-main
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Documentation

The backend API provides endpoints for:
- User authentication
- Campaign management
- File uploads
- Payment processing

Detailed API documentation is available at `/api-docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the tools and libraries used
