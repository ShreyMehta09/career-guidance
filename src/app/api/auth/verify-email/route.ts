import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import { getUserByVerificationToken, updateUserVerificationFields } from '@/utils/directMongoDB';

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

    // Get user directly from MongoDB
    const userFromDB = await getUserByVerificationToken(token);
    
    console.log('User found in MongoDB:', userFromDB ? {
      id: userFromDB._id,
      email: userFromDB.email,
      isVerified: userFromDB.isVerified,
      hasToken: !!userFromDB.verificationToken,
      tokenExpires: userFromDB.verificationTokenExpires
    } : 'No user found');

    if (!userFromDB) {
      return NextResponse.json({ 
        error: 'Invalid verification token. Please request a new verification email.' 
      }, { status: 400 });
    }

    // Check if token is expired
    const now = new Date();
    if (userFromDB.verificationTokenExpires && new Date(userFromDB.verificationTokenExpires) < now) {
      console.log('Token expired on:', userFromDB.verificationTokenExpires);
      return NextResponse.json({ 
        error: 'Verification token has expired. Please request a new verification email.' 
      }, { status: 400 });
    }

    // Update user verification status directly with MongoDB
    try {
      const updated = await updateUserVerificationFields(
        userFromDB._id.toString(),
        {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null
        }
      );
      
      if (!updated) {
        console.error('Failed to update user verification status');
        return NextResponse.json({ 
          error: 'Error verifying email. Please try again.' 
        }, { status: 500 });
      }
      
      console.log('User email verified successfully:', userFromDB.email);
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