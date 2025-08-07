# RoboBooks Backend Authentication

This is the backend API for RoboBooks authentication system, built with Express.js, MongoDB, and JWT.

## Features

- User registration with company details
- Email/phone login with password
- Google OAuth integration
- JWT-based authentication with HTTP-only cookies
- Session management
- Input validation and error handling

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/robobooks
MONGODB_DB=robobooks

# JWT Secret (generate a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CLIENT_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. Database Setup

Make sure MongoDB is running on your system. If you don't have MongoDB installed:

- **Windows**: Download and install from [MongoDB website](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/login/google` - Google OAuth login
- `GET /api/auth/me` - Get current user session
- `POST /api/auth/logout` - User logout

### Registration Request Body

```json
{
  "companyName": "Robo Innovations Pvt Ltd",
  "email": "user@company.com",
  "phoneNumber": "9876543210",
  "phoneDialCode": "+91",
  "phoneIso2": "IN",
  "password": "password123",
  "country": "India",
  "state": "Uttar Pradesh"
}
```

### Login Request Body

```json
{
  "emailOrPhone": "user@company.com",
  "password": "password123"
}
```

## Frontend Integration

The frontend is configured to use `credentials: "include"` for all API calls, which automatically sends and receives the `rb_session` HTTP-only cookie.

Make sure your frontend has the following environment variable:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Security Features

- HTTP-only cookies for session management
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers
- JWT token expiration (1 hour)

## Development

- The server uses nodemon for hot reloading
- MongoDB connection is established on startup
- All routes are prefixed with `/api`
- Error handling middleware catches and formats errors

## Production Considerations

1. Change the JWT_SECRET to a strong, random string
2. Set NODE_ENV=production
3. Use HTTPS in production
4. Configure proper CORS origins
5. Set up MongoDB Atlas or production MongoDB instance
6. Add rate limiting
7. Set up proper logging
8. Configure Google OAuth for production domain 