import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  path: string;
}

interface StudentDashboardProps {
  userName: string;
}

export default function StudentDashboard({ userName }: StudentDashboardProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
  });

  useEffect(() => {
    // Mock data - in a real app, this would come from an API
    setActivities([
      {
        id: 1,
        title: 'Complete Career Assessment',
        description: 'Take our AI-powered assessment to discover suitable career paths.',
        date: '2023-05-15',
        completed: false
      },
      {
        id: 2,
        title: 'Explore Career Options',
        description: 'Browse through our catalog of careers to learn more about each path.',
        date: '2023-05-16',
        completed: false
      },
      {
        id: 3,
        title: 'Try Career Assessment Tools',
        description: 'Use our interactive tools to gain deeper insights into your strengths and preferences.',
        date: '2023-05-18',
        completed: false
      }
    ]);

    setRecommendations([
      {
        id: 1,
        title: 'Software Engineering',
        description: 'Based on your interests, you might enjoy a career in software development.',
        path: '/explore'
      },
      {
        id: 2,
        title: 'Data Science',
        description: 'Your profile suggests you would excel in data analysis and machine learning.',
        path: '/explore'
      },
      {
        id: 3,
        title: 'Product Management',
        description: 'Consider exploring product management roles which combine technical and business skills.',
        path: '/explore'
      }
    ]);
  }, []);

  const toggleActivityCompletion = (id: number) => {
    setActivities(activities.map(activity => 
      activity.id === id 
        ? { ...activity, completed: !activity.completed }
        : activity
    ));
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setFormData({
      title: '',
      description: '',
      date: '',
    });
    setShowModal(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      date: activity.date,
    });
    setShowModal(true);
  };

  const handleDeleteActivity = (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivities(activities.filter(activity => activity.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingActivity) {
      // Update existing activity
      setActivities(activities.map(activity =>
        activity.id === editingActivity.id
          ? { ...activity, ...formData }
          : activity
      ));
    } else {
      // Add new activity
      const newActivity: Activity = {
        id: Math.max(...activities.map(a => a.id), 0) + 1,
        ...formData,
        completed: false,
      };
      setActivities([...activities, newActivity]);
    }
    
    setShowModal(false);
    setEditingActivity(null);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column - Activities */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Career Goals</h2>
            <button
              onClick={handleAddActivity}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add New Goal
            </button>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={activity.completed}
                      onChange={() => toggleActivityCompletion(activity.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-lg font-medium ${activity.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {activity.title}
                    </h3>
                    <p className={`mt-1 text-sm ${activity.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Due: {activity.date}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditActivity(activity)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full" 
              style={{ width: `${(activities.filter(a => a.completed).length / activities.length) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {Math.round((activities.filter(a => a.completed).length / activities.length) * 100)}% Complete
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Complete the activities above to make progress in your career journey.
          </p>
        </div>
      </div>

      {/* Right Column - Recommendations */}
      <div className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended for You</h2>
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium text-gray-800">
                  {recommendation.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {recommendation.description}
                </p>
                <Link 
                  href={recommendation.path}
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="space-y-3">
            <Link href="/assessment" className="block p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
              Start Career Assessment
            </Link>
            <Link href="/explore" className="block p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
              Explore Courses
            </Link>
            <Link href="/career-tools" className="block p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
              Career Assessment Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
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
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingActivity ? 'Edit Goal' : 'Add New Goal'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    >
                      {editingActivity ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 