import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import { generateVerificationToken, sendVerificationEmail } from '@/utils/emailService';
import { getUserVerificationStatus, updateUserVerificationFields } from '@/utils/directMongoDB';

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
    
    // Get verification status directly from MongoDB
    const verificationStatus = await getUserVerificationStatus(email);
    console.log('Verification status from direct MongoDB:', verificationStatus);
    
    // Check if email is verified using direct MongoDB check
    const isVerified = verificationStatus && verificationStatus.isVerified;
    
    if (!isVerified) {
      console.log('Unverified user attempted to login:', { email: user.email });
      
      // If token is expired, generate a new one and resend email
      if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
        console.log('Verification token expired, generating new one...');
        const newToken = generateVerificationToken();
        const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        // Update with direct MongoDB access
        await updateUserVerificationFields(user._id.toString(), {
          verificationToken: newToken,
          verificationTokenExpires: newExpiry
        });
        
        // Resend verification email
        console.log('Resending verification email...');
        await sendVerificationEmail(email, newToken);
      }
      
      return NextResponse.json({ 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true
      }, { status: 401 });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Update Mongoose user object with verified status from MongoDB
    if (isVerified && !user.isVerified) {
      console.log('Updating Mongoose user object with verified status');
      user.isVerified = true;
      await user.save();
    }
    
    // Create a user object without the password to return
    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email,
<<<<<<< HEAD
      role: user.role,
      isVerified: true // Force isVerified to true if we got here
=======
      role: user.role
>>>>>>> 7e271183fdd9ff2c5f737295e0204cb5a6dddda8
    };
    
    return NextResponse.json({ 
      message: 'Login successful', 
      user: userWithoutPassword 
    });
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