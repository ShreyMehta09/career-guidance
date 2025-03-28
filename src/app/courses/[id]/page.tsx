'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

interface Module {
  title: string;
  type: 'text' | 'video';
  content: string;
  order: number;
}

interface Course {
  id: string;
  name: string;
  courseId: string;
  points: number;
  description: string;
  modules: Module[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!params.id) return;
        
        const response = await fetch(`/api/courses/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        
        const data = await response.json();
        setCourse(data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Could not load the course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Course not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Function to render module content based on type
  const renderModuleContent = (module: Module) => {
    if (module.type === 'text') {
      return (
        <div className="prose max-w-none">
          {module.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
      );
    } else {
      // Assuming YouTube URL format is https://www.youtube.com/watch?v=VIDEO_ID
      // Extract the video ID from URL
      const videoIdMatch = module.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        return <p className="text-red-500">Invalid YouTube URL</p>;
      }

      return (
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-64 md:h-96 rounded-md"
          ></iframe>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          
          {user && course.createdBy.id === user.id && (
            <Link
              href={`/courses/${course.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Course
            </Link>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
                <div className="flex mt-2 text-sm text-gray-700">
                  <span className="mr-4">Course ID: {course.courseId}</span>
                  <span className="mr-4">Points: {course.points}</span>
                  <span>Created by: {course.createdBy.name}</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Created on: {new Date(course.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="mt-4 prose max-w-none">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="text-gray-700">{course.description || 'No description available'}</p>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Modules</h2>
            
            <div className="space-y-8">
              {course.modules.sort((a, b) => a.order - b.order).map((module, index) => (
                <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Module {index + 1}: {module.title}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      Type: {module.type === 'text' ? 'Text Content' : 'Video Content'}
                    </div>
                  </div>
                  
                  <div className="p-4 text-gray-700">
                    {renderModuleContent(module)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 