import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import { getUserByVerificationToken, updateUserVerificationFields } from '@/utils/directMongoDB';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    console.log('Verifying token:', token);

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.' 
      }, { status: 503 });
    }

    // First try Mongoose lookup - most reliable
    console.log('Trying to find user with Mongoose');
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      console.log('No user found with token');
      return NextResponse.json({ 
        error: 'Invalid verification token. Please request a new verification email.' 
      }, { status: 400 });
    }

    console.log('Found user:', {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified
    });

    // Check if already verified
    if (user.isVerified) {
      console.log('User already verified');
      return NextResponse.json({ 
        message: 'Your email is already verified. You can now log in.' 
      });
    }

    // Check if token is expired
    const now = new Date();
    if (user.verificationTokenExpires && user.verificationTokenExpires < now) {
      console.log('Token expired on:', user.verificationTokenExpires);
      return NextResponse.json({ 
        error: 'Verification token has expired. Please request a new verification email.' 
      }, { status: 400 });
    }

    // Update user verification status
    try {
      // Update with Mongoose
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      
      console.log('User verified with Mongoose');
      
      // Also try with direct MongoDB for double safety
      try {
        await updateUserVerificationFields(
          user._id.toString(),
          {
            isVerified: true,
            verificationToken: null,
            verificationTokenExpires: null
          }
        );
        console.log('Also updated with direct MongoDB');
      } catch (error) {
        console.error('Error updating with direct MongoDB (non-critical):', error);
        // Non-critical, continue anyway
      }
      
      console.log('User email verified successfully:', user.email);
      return NextResponse.json({ 
        message: 'Email verified successfully' 
      });
    } catch (error) {
      console.error('Error updating user verification status:', error);
      return NextResponse.json({ 
        error: 'Error verifying email. Please try again.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ 
      error: 'Error verifying email. Please try again later.' 
    }, { status: 500 });
  }
} 