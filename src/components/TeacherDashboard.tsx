import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

interface Student {
  id: number;
  name: string;
  email: string;
  lastActive: string;
  progress: number;
  nextMeeting?: string;
}

interface Appointment {
  id: number;
  studentName: string;
  date: string;
  time: string;
  topic: string;
}

interface Course {
  id: string;
  name: string;
  courseId: string;
  points: number;
  description: string;
  moduleCount: number;
  createdAt: string;
}

interface Module {
  title: string;
  type: 'text' | 'video';
  content: string;
  order: number;
}

interface TeacherDashboardProps {
  userName: string;
}

export default function TeacherDashboard({ userName }: TeacherDashboardProps) {
  const { user } = useAuthContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // State for course creation modal
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [coursePoints, setCoursePoints] = useState(0);
  const [courseDescription, setCourseDescription] = useState('');
  const [modules, setModules] = useState<Module[]>([{ title: '', type: 'text', content: '', order: 0 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for students and appointments
    setStudents([
      {
        id: 1,
        name: 'Rishi',
        email: 'Rishi@example.com',
        lastActive: '2024-03-15',
        progress: 100,
        nextMeeting: '2024-03-20'
      },
      {
        id: 2,
        name: 'Shrey Mehta',
        email: 'shreymehta@example.com',
        lastActive: '2024-03-14',
        progress: 60
      },
      {
        id: 3,
        name: 'Yash',
        email: 'yash@example.com',
        lastActive: '2024-03-13',
        progress: 90,
        nextMeeting: '2024-03-22'
      }
    ]);

    setAppointments([
      {
        id: 1,
        studentName: 'Rishi',
        date: '2024-03-20',
        time: '10:00 AM',
        topic: 'Career Path Discussion'
      },
      {
        id: 2,
        studentName: 'Shrey',
        date: '2024-03-22',
        time: '2:00 PM',
        topic: 'Resume Review'
      }
    ]);

    // Fetch real courses data
    const fetchCourses = async () => {
      try {
        if (user?.id) {
          const response = await fetch(`/api/courses?teacherId=${user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch courses');
          }
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [user?.id]);

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

  const handleCreateCourse = async (e: React.FormEvent) => {
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
    
    setIsLoading(true);
    
    try {
      // API call to create course
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: courseName,
          courseId,
          points: coursePoints,
          description: courseDescription,
          modules,
          createdBy: user?.id
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create course');
      }
      
      const data = await response.json();
      
      // Add new course to state
      setCourses(prevCourses => [
        ...prevCourses, 
        {
          id: data.course.id,
          name: data.course.name,
          courseId: data.course.courseId,
          points: data.course.points,
          description: data.course.description,
          moduleCount: data.course.modules.length,
          createdAt: new Date(data.course.createdAt).toISOString().split('T')[0]
        }
      ]);
      
      setSuccess('Course created successfully!');
      
      // Reset form
      setCourseName('');
      setCourseId('');
      setCoursePoints(0);
      setCourseDescription('');
      setModules([{ title: '', type: 'text', content: '', order: 0 }]);
      
      // Close modal after a delay
      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Courses Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Courses</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create New Course
          </button>
        </div>
        
        {courses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">You haven't created any courses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3  text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4  whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.courseId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.points}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.moduleCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/courses/${course.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </Link>
                      <Link href={`/courses/${course.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student List Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Students</h2>
              <Link 
                href="/students/add"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add New Student
              </Link>
            </div>
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <p className="text-xs text-gray-500">Last active: {student.lastActive}</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Progress: {student.progress}%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-2 bg-blue-600 rounded-full" 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    {student.nextMeeting && (
                      <p className="text-xs text-gray-500">Next meeting: {student.nextMeeting}</p>
                    )}
                    <Link 
                      href={`/students/${student.id}`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Appointments and Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {appointment.studentName}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.topic}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                    <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/appointments"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All Appointments →
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/schedule" className="block p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
                Schedule Appointment
              </Link>
              <Link href="/resources" className="block p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
                Class Resources
              </Link>
              <Link href="/reports" className="block p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
                Generate Reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Course Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              onClick={() => setShowModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Create New Course
                    </h3>

                    {error && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        {success}
                      </div>
                    )}

                    <form onSubmit={handleCreateCourse}>
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
                            className="mt-1 text-gray-800 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                            className="mt-1 text-gray-800 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                            className="mt-1 text-gray-800 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                            className="mt-1 text-gray-800 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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

                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {isLoading ? 'Creating...' : 'Create Course'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 