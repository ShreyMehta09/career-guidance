# Career Guidance Platform

An AI-powered career counseling and guidance platform for schools, built with Next.js 15.

## Features

- **AI-Powered Career Assessment**: Get personalized career recommendations based on your interests, skills, and preferences.
- **Career Exploration**: Browse through various career paths with detailed information about requirements, salary, and growth potential.
- **Mentorship Program**: Connect with experienced professionals in your field of interest for guidance and advice.
- **User Authentication**: Secure email/password authentication with MongoDB.

## Technologies Used

- Next.js 15
- TypeScript
- Tailwind CSS
- Google Gemini API
- MongoDB with Mongoose
- bcrypt for password encryption

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Google Gemini API key (optional - fallback responses are provided if no key is available)
- MongoDB (installed and running)

### MongoDB Setup

1. **Install MongoDB**:
   - Download and install from [MongoDB website](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas cloud service

2. **Start MongoDB Service**:
   - Windows: MongoDB should run as a service automatically
   - macOS/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`

3. **Verify MongoDB is Running**:
   - Run `mongosh` in terminal to connect to MongoDB shell
   - If it connects, MongoDB is running correctly

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd career-guidance
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key and MongoDB URI:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     MONGODB_URI=mongodb://127.0.0.1:27017/career-guidance
     ```
   - For MongoDB Atlas, use the connection string provided by Atlas

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Authentication System

The platform includes a secure authentication system:

1. **User Registration**: Create an account with name, email, and password
2. **Login**: Secure login with email and password
3. **Password Security**: Passwords are encrypted using bcrypt before storage
4. **User Profiles**: View and manage your user profile
5. **Protected Routes**: Certain pages require authentication to access

### MongoDB Integration

User data is stored in MongoDB with the following features:
- Encrypted passwords (never stored in plain text)
- Data validation for emails and passwords
- Connection pooling for efficient database access
- Error handling for database connection issues

## Gemini Integration

The platform uses Google's Gemini API to provide AI-powered features:

1. **Career Assessment**: Analyzes student interests, skills, and preferences to suggest suitable career paths.
2. **Career Details**: Provides comprehensive information about specific careers.
3. **Mentorship Advice**: Offers personalized guidance on how to benefit from mentorship in chosen fields.

### Using Free Tier Gemini API Keys

If you're using a free tier Gemini API key, you may encounter some limitations:

1. **Limited Quota**: Free tier keys have a limited number of requests per month
2. **Rate Limiting**: There are restrictions on how many requests you can make per minute
3. **Model Availability**: The application uses the "gemini-pro" model which is available on the free tier

The application is configured to handle these limitations by:
- Using the "gemini-pro" model which is optimized for text generation
- Providing fallback responses when API calls fail
- Implementing proper error handling for quota and rate limit issues

### Fallback Functionality

If the Gemini API is unavailable or you don't have an API key, the application will use pre-defined fallback responses. These responses provide general guidance but aren't personalized to user input. For the full AI experience, a valid API key is required.

### Customizing AI Prompts

To customize the AI prompts, you can modify:
- System prompts in `src/app/api/openai/route.ts`
- Fallback responses in the same file
- User prompts in `src/utils/api.ts`

## Deployment

The application can be deployed to platforms like Vercel, Netlify, or any other hosting service that supports Next.js applications.

Make sure to set up the environment variables in your deployment environment.

## Troubleshooting

### MongoDB Connection Issues

If you encounter errors connecting to MongoDB:

1. **Verify MongoDB is running**:
   - Windows: Check services.msc to ensure MongoDB service is running
   - macOS/Linux: Run `systemctl status mongod` or `brew services list`

2. **Check connection string**:
   - Ensure your MONGODB_URI in .env.local is correct
   - Use `mongodb://127.0.0.1:27017/career-guidance` for local MongoDB
   - For MongoDB Atlas, verify credentials and network access

3. **Firewall issues**:
   - Ensure port 27017 is not blocked by firewall
   - Check network connectivity if using a remote MongoDB instance

### API Key Issues

If you encounter errors related to the Gemini API:

1. Verify your API key is correct and has sufficient quota
2. Check that your `.env.local` file is properly set up
3. The application will use fallback responses if API calls fail

### Free Tier Specific Issues

If you're using a free tier API key and experiencing problems:

1. **Quota Exceeded**: Free tier has a monthly request limit. Check your usage in the Google AI Studio dashboard
2. **Rate Limits**: Free tier has stricter rate limits. Space out your requests or use fallback responses
3. **API Unavailability**: If you see connection errors, check your internet connection and try again later

### Rate Limiting

Gemini has rate limits on their API. If you exceed these limits:

1. The application will use fallback responses
2. Wait a while before trying again
3. Consider upgrading your Gemini plan for higher limits


