import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import { generateVerificationToken, sendVerificationEmail } from '@/utils/emailService';
import { getUserVerificationStatus, updateUserVerificationFields } from '@/utils/directMongoDB';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.' 
      }, { status: 503 });
    }
    
    // Find the user
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // First, check password since verification requires authenticated user
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    console.log('Initial isVerified from Mongoose:', user.isVerified);
    
    // Get verification status directly from MongoDB with raw query
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database not connected');
      }
      
      const usersCollection = db.collection('users');
      const userFromDB = await usersCollection.findOne({ email: email.toLowerCase() });
      
      console.log('User verification status from direct MongoDB query:', {
        email: email,
        isVerified: userFromDB?.isVerified
      });
      
      // Force isVerified to true if it's true in the database
      if (userFromDB && userFromDB.isVerified === true) {
        // Update the user document
        user.isVerified = true;
        await user.save();
        console.log('Updated user isVerified in Mongoose to true');
        
        // Create a user object without the password to return
        const userWithoutPassword = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true
        };
        
        return NextResponse.json({ 
          message: 'Login successful', 
          user: userWithoutPassword 
        });
      }
    } catch (error) {
      console.error('Error checking direct verification status:', error);
      // Continue with regular flow if this fails
    }
    
    // If isVerified is true in Mongoose, allow login
    if (user.isVerified) {
      console.log('User is verified in Mongoose');
      
      const userWithoutPassword = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true
      };
      
      return NextResponse.json({ 
        message: 'Login successful', 
        user: userWithoutPassword 
      });
    }
    
    // If we get here, user is not verified
    console.log('User is not verified in either Mongoose or direct MongoDB');
    
    // If token is expired or doesn't exist, generate a new one and resend email
    if (!user.verificationToken || 
        !user.verificationTokenExpires || 
        user.verificationTokenExpires < new Date()) {
      console.log('Verification token expired or missing, generating new one...');
      const newToken = generateVerificationToken();
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Update with Mongoose
      user.verificationToken = newToken;
      user.verificationTokenExpires = newExpiry;
      await user.save();
      
      // Also update with direct MongoDB for redundancy
      try {
        await updateUserVerificationFields(
          user._id.toString(),
          {
            verificationToken: newToken,
            verificationTokenExpires: newExpiry
          }
        );
      } catch (error) {
        console.error('Error updating with direct MongoDB (non-critical):', error);
      }
      
      // Resend verification email
      console.log('Resending verification email...');
      await sendVerificationEmail(email, newToken);
    }
    
    return NextResponse.json({ 
      error: 'Please verify your email before logging in. Check your inbox for the verification link.',
      needsVerification: true
    }, { status: 401 });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Provide specific error messages based on error type
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Invalid login data provided'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error logging in. Please try again later.' 
    }, { status: 500 });
  }
} 