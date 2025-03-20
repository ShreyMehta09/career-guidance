import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

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
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Create a user object without the password to return
    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email
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