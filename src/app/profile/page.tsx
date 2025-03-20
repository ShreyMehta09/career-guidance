'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Profile() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-8 text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
                  <div className="rounded-full w-20 h-20 border-4 border-white shadow flex items-center justify-center bg-blue-700 text-white text-2xl font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="text-blue-100">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-800 text-white">
                    Account
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-6 py-6">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                    <p className="mt-1 text-sm text-gray-900">Standard Account</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <h2 className="text-lg font-medium text-gray-900">Account Actions</h2>
                <div className="mt-4 space-y-3">
                  <Link 
                    href="/dashboard" 
                    className="block text-blue-600 hover:text-blue-500"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    className="block text-blue-600 hover:text-blue-500"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block text-red-600 hover:text-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 