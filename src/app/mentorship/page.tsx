'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MentorshipRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/career-tools');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Career Assessment Tools...</p>
      </div>
    </div>
  );
} 