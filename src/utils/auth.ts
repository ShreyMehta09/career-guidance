'use client'
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  isVerified: boolean;
}

// Auth state management
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any potential cached user data that might have incorrect verification status
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Only set user if they are verified or we're clearing all the cache later
        if (parsedUser.isVerified) {
          setUser(parsedUser);
        } else {
          console.log('Stored user is not verified, clearing cache');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.needsVerification) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
        throw new Error(data.error || 'Login failed');
      }
      
      // Only store verified users
      if (data.user.isVerified) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } else {
        console.warn('API returned unverified user, should not happen');
        throw new Error('Please verify your email before logging in.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (name: string, email: string, password: string, role: string = 'student'): Promise<User> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Don't store unverified users
      if (data.user.isVerified) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      
      return data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  };

  return { user, loading, login, logout, register };
} 