import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import { generateVerificationToken, sendVerificationEmail } from '@/utils/emailService';
import { updateUserVerificationFields } from '@/utils/directMongoDB';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json({ 
        message: 'If your email exists in our system, you will receive a verification email shortly.' 
      });
    }

    // If user is already verified, no need to resend
    if (user.isVerified) {
      return NextResponse.json({ 
        message: 'Your email is already verified. You can log in now.' 
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    console.log('Generated new verification token for', email);

    // Update verification token in database using direct MongoDB access
    const updated = await updateUserVerificationFields(
      user._id.toString(),
      {
        verificationToken,
        verificationTokenExpires
      }
    );

    if (!updated) {
      console.error('Failed to update verification token');
      return NextResponse.json({ 
        error: 'Failed to update verification token. Please try again later.' 
      }, { status: 500 });
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      console.error('Failed to send verification email');
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again later.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Verification email sent. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ 
      error: 'Error resending verification email. Please try again later.' 
    }, { status: 500 });
  }
} 