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

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column - Activities */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Next Steps</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
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
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-blue-600 h-4 rounded-full w-1/4"></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">25% Complete</p>
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
              Explore Career Paths
            </Link>
            <Link href="/career-tools" className="block p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
              Career Assessment Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 