import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import { generateVerificationToken, sendVerificationEmail } from '@/utils/emailService';
import { updateUserVerificationFields } from '@/utils/directMongoDB';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ 
        error: 'Name, email, and password are required' 
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
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    console.log('Generated verification token:', {
      token: verificationToken,
      expires: verificationTokenExpires
    });
    
    // Create new user (basic details only)
    const newUser = new User({
      name,
      email,
      password,
      role: role || 'student',
      isVerified: false
    });
    
    try {
      await newUser.save();
      console.log('New user created with ID:', newUser._id);
      
      // Update verification fields directly with MongoDB
      const updated = await updateUserVerificationFields(
        newUser._id.toString(), 
        {
          verificationToken,
          verificationTokenExpires,
          isVerified: false
        }
      );
      
      if (!updated) {
        console.error('Failed to update verification fields');
        return NextResponse.json({ 
          error: 'Error creating user account. Please try again.' 
        }, { status: 500 });
      }
      
      console.log('Verification fields updated successfully');
    } catch (error) {
      console.error('Error saving user:', error);
      return NextResponse.json({ 
        error: 'Error creating user account. Please try again.' 
      }, { status: 500 });
    }
    
    // Send verification email
    console.log('Attempting to send verification email...');
    const emailSent = await sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      console.error('Failed to send verification email, deleting user...');
      // If email fails to send, delete the user and return error
      await User.findByIdAndDelete(newUser._id);
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again later.' 
      }, { status: 500 });
    }
    
    // Create a user object without sensitive data to return
    const userWithoutPassword = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isVerified: false
    };
    
    return NextResponse.json({ 
      message: 'User registered successfully. Please check your email to verify your account.', 
      user: userWithoutPassword 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    // Provide helpful error messages based on error type
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Invalid user data provided. Please check your inputs.'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error registering user. Please try again later.'
    }, { status: 500 });
  }
} 