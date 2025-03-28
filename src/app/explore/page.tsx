'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  name: string;
  description: string;
  points: number;
  moduleCount: number;
  createdBy: { id: string; name: string };
}

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); 

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();

        if (response.ok) {
          setCourses(data.courses);
        } else {
          setError(data.error || 'Failed to fetch courses');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6">Explore Courses</h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          Find the right course for you and start learning today!
        </p>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-gray-800 md:w-2/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />

          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full text-gray-800 md:w-1/3 px-4 py-2 mt-3 md:mt-0 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Fields</option>
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="design">Design</option>
          </select>
        </div>

        {/* Loading and Error Handling */}
        {loading && <p className="text-center text-gray-500">Loading courses...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-gray-500 text-sm">Modules: {course.moduleCount}</p>
                <p className="text-gray-500 text-sm">Created by: {course.createdBy.name}</p>
              </div>
              {/* View Button */}
              <button
                onClick={() => router.push(`/courses/${course.id}`)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Explore
              </button>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-6">No courses found.</p>
        )}
      </div>
    </div>
  );
}
