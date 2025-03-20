import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

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
    
    // Create new user (password will be hashed by Mongoose pre-save hook)
    const newUser = new User({
      name,
      email,
      password
    });
    
    await newUser.save();
    
    // Create a user object without the password to return
    const userWithoutPassword = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    };
    
    return NextResponse.json({ 
      message: 'User registered successfully', 
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