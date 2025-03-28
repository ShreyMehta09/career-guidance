'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        console.log(`Verifying token: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
        
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          // If already verified, treat as success
          if (data.message && data.message.includes('already verified')) {
            setStatus('success');
            setMessage(data.message || 'Email already verified! You can now log in.');
            // Redirect to login page after 3 seconds
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          } else {
            setStatus('error');
            setMessage(data.error || 'Failed to verify email. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        
        // Retry up to 3 times with a delay
        if (retryCount < 3) {
          setMessage(`Verification attempt failed. Retrying (${retryCount + 1}/3)...`);
          setTimeout(() => {
            setRetryCount(retryCount + 1);
          }, 2000);
        } else {
          setStatus('error');
          setMessage('An error occurred while verifying your email. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [token, router, retryCount]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setResendMessage('Please enter your email address.');
      setResendStatus('error');
      return;
    }
    
    setResendStatus('loading');
    setResendMessage('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendStatus('success');
        setResendMessage(data.message || 'Verification email sent. Please check your inbox.');
        // Clear email field
        setEmail('');
      } else {
        setResendStatus('error');
        setResendMessage(data.error || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setResendStatus('error');
      setResendMessage('An error occurred while resending verification email. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying your email...</p>
              {retryCount > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Retry attempt {retryCount}/3
                </p>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="mt-4 text-green-600">{message}</p>
              <p className="mt-2 text-sm text-gray-600">
                Redirecting to login page...
              </p>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login Now
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="mt-4 text-red-600">{message}</p>
              
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Resend Verification Email
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email address below to get a new verification link.
                </p>
                
                <form onSubmit={handleResendVerification} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {resendStatus === 'error' && (
                    <div className="text-sm text-red-600">{resendMessage}</div>
                  )}
                  
                  {resendStatus === 'success' && (
                    <div className="text-sm text-green-600">{resendMessage}</div>
                  )}
                  
                  <div>
                    <button
                      type="submit"
                      disabled={resendStatus === 'loading'}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 