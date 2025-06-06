import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import { generateVerificationToken, sendVerificationEmail } from '@/utils/emailService';
import { updateUserVerificationFields } from '@/utils/directMongoDB';
import mongoose from 'mongoose';

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
      email: email,
      tokenLength: verificationToken.length
    });
    
    let newUser;
    
    try {
      // Save user with verification fields directly in Mongoose
      newUser = new User({
        name,
        email,
        password,
        role: role || 'student',
        isVerified: false,
        verificationToken,
        verificationTokenExpires
      });
      
      await newUser.save();
      
      console.log('User created successfully with ID:', newUser._id);
    } catch (error) {
      console.error('Error saving user:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ 
          error: 'Invalid user data: ' + error.message
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: 'Error creating user account. Please try again.' 
      }, { status: 500 });
    }
    
    // Double-check to ensure verification fields are set using direct MongoDB
    try {
      const updated = await updateUserVerificationFields(
        newUser._id.toString(), 
        {
          verificationToken,
          verificationTokenExpires,
          isVerified: false
        }
      );
      
      if (!updated) {
        console.warn('Failed to update verification fields with direct MongoDB, but user was created');
      } else {
        console.log('Successfully updated verification fields with direct MongoDB');
      }
    } catch (error) {
      console.error('Error updating verification fields:', error);
      // Continue anyway since the user was created
    }
    
    // Send verification email
    console.log('Attempting to send verification email to:', email);
    const emailSent = await sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      console.error('Failed to send verification email, but user was created');
      // We don't delete the user anymore, as they can request a new verification email later
    } else {
      console.log('Verification email sent successfully to:', email);
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
      message: 'User registered successfully. Please check your email to verify your account.' + 
        (!emailSent ? ' If you did not receive an email, please try logging in to request a new verification email.' : ''), 
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