# Environment Setup Guide

This guide helps you configure environment variables for both development and production environments.

## Frontend Environment Variables (Client)

Create a `.env.local` file in the `client` directory:

### Development Environment
```env
# Backend API URL for development
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# App URL for development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (if using Google login)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Production Environment
```env
# Backend API URL for production - UPDATE THIS TO YOUR ACTUAL BACKEND URL
NEXT_PUBLIC_BACKEND_URL=https://api.robobookss.com

# App URL for production
NEXT_PUBLIC_APP_URL=https://robobookss.com

# Google OAuth (if using Google login)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id
```

## Backend Environment Variables

Create a `.env` file in the `backend` directory:

### Development Environment
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
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### Production Environment
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (use your production MongoDB URI)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/robobooks
MONGODB_DB=robobooks

# JWT Secret (use a strong, unique secret)
JWT_SECRET=your-production-jwt-secret-key-here

# CORS Configuration
CLIENT_ORIGIN=https://robobookss.com
FRONTEND_URL=https://robobookss.com

# Google OAuth (if using Google login)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Email Configuration (if using email features)
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
```

## Deployment Checklist

### 1. Backend Deployment
- [ ] Deploy backend to your server (e.g., Heroku, DigitalOcean, AWS)
- [ ] Set environment variables on your hosting platform
- [ ] Ensure the backend is accessible via HTTPS
- [ ] Update `NEXT_PUBLIC_BACKEND_URL` to point to your deployed backend

### 2. Frontend Deployment
- [ ] Deploy frontend to your hosting platform (e.g., Vercel, Netlify)
- [ ] Set environment variables on your hosting platform
- [ ] Ensure the frontend is accessible via HTTPS

### 3. CORS Configuration
- [ ] Verify that your backend CORS configuration includes your frontend domain
- [ ] Test API calls from your production frontend to your production backend

### 4. Database
- [ ] Set up production MongoDB database
- [ ] Update `MONGODB_URI` to point to your production database
- [ ] Ensure database is accessible from your backend server

## Common Issues and Solutions

### CORS Errors
If you're getting CORS errors:
1. Check that your backend CORS configuration includes your frontend domain
2. Verify that `NEXT_PUBLIC_BACKEND_URL` is set correctly
3. Ensure both frontend and backend are using HTTPS in production

### Authentication Issues
If users can't log in:
1. Check that `JWT_SECRET` is set correctly
2. Verify that cookies are being set with the correct domain
3. Ensure HTTPS is used in production for secure cookies

### Database Connection Issues
If the app can't connect to the database:
1. Verify `MONGODB_URI` is correct
2. Check that your database is accessible from your backend server
3. Ensure database credentials are correct

## Security Notes

1. **Never commit `.env` files to version control**
2. **Use strong, unique secrets for JWT_SECRET in production**
3. **Always use HTTPS in production**
4. **Regularly rotate secrets and credentials**
5. **Monitor your application logs for security issues**

## Testing Your Configuration

After setting up your environment variables:

1. **Test Backend**: Start your backend server and check the console for any errors
2. **Test Frontend**: Start your frontend and try to make API calls
3. **Test Authentication**: Try to register/login a user
4. **Test CORS**: Check browser console for any CORS errors

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check the backend server logs
3. Verify all environment variables are set correctly
4. Ensure your hosting platform supports the required environment variables
