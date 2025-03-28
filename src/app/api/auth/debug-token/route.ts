import { NextResponse } from 'next/server';
import connectDB from '@/utils/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// This endpoint is for administrative/debugging purposes only
// In production, you should secure this or disable it
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ 
        error: 'Token is required' 
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
    
    // Log token for debugging
    console.log(`Debugging token: ${token}`);
    
    // Find all users with raw MongoDB to analyze token storage
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ 
        error: 'MongoDB connection not available' 
      }, { status: 500 });
    }
    
    // Get all users with verification tokens
    const users = await db.collection('users').find({
      verificationToken: { $exists: true }
    }).toArray();
    
    // Find exact matches
    const exactMatches = users.filter(user => user.verificationToken === token);
    
    // Find substring matches (in case of encoding/decoding issues)
    const substringMatches = users.filter(user => {
      if (!user.verificationToken) return false;
      
      // Check if the token is a substring of the stored token or vice versa
      return user.verificationToken.includes(token) || 
             token.includes(user.verificationToken);
    });
    
    // Find regex matches (allowing for some characters to be different)
    const regexMatches = users.filter(user => {
      if (!user.verificationToken) return false;
      
      // Create a regex that allows for some variation in the token
      // This helps catch URL encoding/decoding issues
      const tokenChars = token.split('');
      const pattern = tokenChars
        .map((char: string) => {
          // For special characters in the token, make them optional in the regex
          if (char.match(/[+/%=]/)) {
            return `[+/%=${char}]?`;
          }
          return char;
        })
        .join('');
      
      try {
        const regex = new RegExp(pattern, 'i');
        return regex.test(user.verificationToken);
      } catch (error) {
        console.error('Regex match error:', error);
        return false;
      }
    });
    
    // Get unique users across all match types
    const allMatches = [
      ...exactMatches, 
      ...substringMatches.filter(u => !exactMatches.some(e => e._id.toString() === u._id.toString())),
      ...regexMatches.filter(u => !exactMatches.some(e => e._id.toString() === u._id.toString()) && 
                              !substringMatches.some(s => s._id.toString() === u._id.toString()))
    ];
    
    // Prepare the response
    const result = {
      inputToken: token,
      tokensFoundCount: users.length,
      exactMatchCount: exactMatches.length,
      substringMatchCount: substringMatches.length,
      regexMatchCount: regexMatches.length,
      totalPotentialMatches: allMatches.length,
      // Safe information about potential matches
      potentialMatches: allMatches.map(user => {
        // Only include partial email for privacy
        const email = user.email;
        const maskedEmail = email ? 
          email.substring(0, 3) + '***' + email.substring(email.indexOf('@')) : 
          'unknown';
        
        return {
          id: user._id.toString(),
          maskedEmail,
          tokenLength: user.verificationToken ? user.verificationToken.length : 0,
          tokenSnippet: user.verificationToken ? 
            user.verificationToken.substring(0, 5) + '...' + 
            user.verificationToken.substring(user.verificationToken.length - 5) : 
            'none',
          isExactMatch: exactMatches.some(u => u._id.toString() === user._id.toString()),
          isSubstringMatch: substringMatches.some(u => u._id.toString() === user._id.toString()),
          isRegexMatch: regexMatches.some(u => u._id.toString() === user._id.toString()),
          isVerified: !!user.isVerified,
          hasExpires: !!user.verificationTokenExpires,
          isExpired: user.verificationTokenExpires ? 
            new Date(user.verificationTokenExpires) < new Date() : 
            false
        };
      })
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Token debugging error:', error);
    return NextResponse.json({ 
      error: 'An error occurred. Please try again later.'
    }, { status: 500 });
  }
} 