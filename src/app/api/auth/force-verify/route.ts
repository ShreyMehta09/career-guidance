import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';
import { updateUserVerificationFields } from '@/utils/directMongoDB';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

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
      // Don't reveal user existence for security
      return NextResponse.json({ 
        message: 'If your account exists, it has been verified. You can now log in.' 
      });
    }

    // Check password - this is required to prevent abuse
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Don't reveal password is incorrect
      return NextResponse.json({ 
        message: 'If your account exists, it has been verified. You can now log in.' 
      });
    }
    
    console.log(`Force verifying user: ${email}`);
    
    // Set user as verified in Mongoose
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    // Also update with direct MongoDB for redundancy
    try {
      const updated = await updateUserVerificationFields(
        user._id.toString(),
        {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null
        }
      );
      
      console.log(`Direct MongoDB update result: ${updated ? 'success' : 'failed'}`);
      
      // Also try with raw MongoDB for triple redundancy
      const db = mongoose.connection.db;
      if (db) {
        const result = await db.collection('users').updateOne(
          { email: email.toLowerCase() },
          { 
            $set: { 
              isVerified: true 
            },
            $unset: { 
              verificationToken: "",
              verificationTokenExpires: ""
            }
          }
        );
        
        console.log(`Raw MongoDB update result: ${result.modifiedCount} document(s) modified`);
      }
    } catch (error) {
      console.error('Error with direct MongoDB update (non-critical):', error);
      // Continue anyway since Mongoose update succeeded
    }
    
    return NextResponse.json({ 
      message: 'Your account has been verified. You can now log in.'
    });
  } catch (error) {
    console.error('Force verification error:', error);
    return NextResponse.json({ 
      error: 'An error occurred. Please try again later.'
    }, { status: 500 });
  }
} 