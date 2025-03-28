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

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [coursePoints, setCoursePoints] = useState(0);
  const [courseDescription, setCourseDescription] = useState('');
  const [modules, setModules] = useState<Module[]>([]);

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
        
        // Initialize form state with course data
        setCourseName(data.course.name);
        setCourseId(data.course.courseId);
        setCoursePoints(data.course.points);
        setCourseDescription(data.course.description);
        setModules(data.course.modules);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Could not load the course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  useEffect(() => {
    // Check if the user is allowed to edit this course
    if (!loading && course && user && course.createdBy.id !== user.id) {
      setError('You do not have permission to edit this course');
    }
  }, [course, user, loading]);

  const handleAddModule = () => {
    if (modules.length < 10) {
      setModules([...modules, { title: '', type: 'text', content: '', order: modules.length }]);
    }
  };

  const handleRemoveModule = (index: number) => {
    if (modules.length > 1) {
      const updatedModules = modules.filter((_, i) => i !== index);
      // Update order numbers
      const reorderedModules = updatedModules.map((module, i) => ({ ...module, order: i }));
      setModules(reorderedModules);
    }
  };

  const handleModuleChange = (index: number, field: keyof Module, value: string) => {
    const updatedModules = [...modules];
    updatedModules[index] = { 
      ...updatedModules[index], 
      [field]: field === 'order' ? parseInt(value) : value 
    };
    setModules(updatedModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!courseName || !courseId || coursePoints <= 0 || !courseDescription) {
      setError('Please fill in all required fields with valid values');
      return;
    }
    
    if (modules.some(module => !module.title || !module.content)) {
      setError('Please fill in all module fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API call to update course
      const response = await fetch(`/api/courses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: courseName,
          courseId,
          points: coursePoints,
          description: courseDescription,
          modules
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update course');
      }
      
      setSuccess('Course updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/courses/${params.id}`);
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href={`/courses/${params.id}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Course
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                <div>
                  <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
                    Course Name*
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    name="courseName"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="mt-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                    Course ID*
                  </label>
                  <input
                    type="text"
                    id="courseId"
                    name="courseId"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="mt-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="coursePoints" className="block text-sm font-medium text-gray-700">
                    Course Points*
                  </label>
                  <input
                    type="number"
                    id="coursePoints"
                    name="coursePoints"
                    min="1"
                    value={coursePoints}
                    onChange={(e) => setCoursePoints(parseInt(e.target.value) || 0)}
                    className="mt-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700">
                    Course Description*
                  </label>
                  <textarea
                    id="courseDescription"
                    name="courseDescription"
                    rows={3}
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="mt-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium text-gray-700">Course Modules (1-10)*</h4>
                  {modules.length < 10 && (
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Module
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                  {modules.map((module, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-gray-700 font-medium">Module {index + 1}</h5>
                        {modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`module-${index}-title`} className="block text-sm font-medium text-gray-700">
                            Title*
                          </label>
                          <input
                            type="text"
                            id={`module-${index}-title`}
                            value={module.title}
                            onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                            className="mt-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor={`module-${index}-type`} className="block text-sm font-medium text-gray-700">
                            Type*
                          </label>
                          <select
                            id={`module-${index}-type`}
                            value={module.type}
                            onChange={(e) => handleModuleChange(index, 'type', e.target.value as 'text' | 'video')}
                            className="mt-1 text-gray-700 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            required
                          >
                            <option value="text">Text</option>
                            <option value="video">Video</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor={`module-${index}-content`} className="block text-sm font-medium text-gray-700">
                            {module.type === 'text' ? 'Content*' : 'YouTube Video URL*'}
                          </label>
                          {module.type === 'text' ? (
                            <textarea
                              id={`module-${index}-content`}
                              value={module.content}
                              onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                              rows={3}
                              className="mt-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          ) : (
                            <input
                              type="text"
                              id={`module-${index}-content`}
                              value={module.content}
                              onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="mt-1 text-gray-700 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href={`/courses/${params.id}`}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 