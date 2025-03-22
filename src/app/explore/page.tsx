'use client';

import { useState } from 'react';
import { getCareerDetails } from '@/utils/api';

interface Career {
  id: number;
  title: string;
  description: string;
  requiredSkills: string[];
  education: string;
  salary: string;
  growth: string;
}

const careers: Career[] = [
  {
    id: 1,
    title: 'Software Engineer',
    description: 'Design and develop software applications and systems.',
    requiredSkills: ['Programming', 'Problem Solving', 'Teamwork'],
    education: "Bachelor's in Computer Science",
    salary: '$70,000 - $150,000',
    growth: 'High'
  },
  {
    id: 2,
    title: 'Data Scientist',
    description: 'Analyze complex data sets to help organizations make better decisions.',
    requiredSkills: ['Statistics', 'Programming', 'Machine Learning'],
    education: "Master's in Data Science",
    salary: '$80,000 - $160,000',
    growth: 'Very High'
  },
  {
    id: 3,
    title: 'Healthcare Administrator',
    description: 'Manage healthcare facilities and coordinate medical services.',
    requiredSkills: ['Leadership', 'Healthcare Knowledge', 'Business Management'],
    education: "Bachelor's in Healthcare Administration",
    salary: '$60,000 - $120,000',
    growth: 'High'
  },
  {
    id: 4,
    title: 'Environmental Scientist',
    description: 'Study environmental problems and develop solutions.',
    requiredSkills: ['Research', 'Analytical Thinking', 'Environmental Knowledge'],
    education: "Bachelor's in Environmental Science",
    salary: '$50,000 - $100,000',
    growth: 'Moderate'
  },
  {
    id: 5,
    title: 'Digital Marketing Specialist',
    description: 'Create and manage online marketing campaigns.',
    requiredSkills: ['Social Media', 'Content Creation', 'Analytics'],
    education: "Bachelor's in Marketing",
    salary: '$45,000 - $90,000',
    growth: 'High'
  },
  {
    id: 6,
    title: 'Financial Analyst',
    description: 'Analyze financial data and provide investment recommendations.',
    requiredSkills: ['Financial Analysis', 'Excel', 'Attention to Detail'],
    education: "Bachelor's in Finance",
    salary: '$60,000 - $120,000',
    growth: 'Moderate'
  }
];

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [careerDetails, setCareerDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = selectedField === 'all' || career.title.toLowerCase().includes(selectedField.toLowerCase());
    return matchesSearch && matchesField;
  });

  const handleLearnMore = async (career: Career) => {
    setSelectedCareer(career);
    setIsLoading(true);
    setError(null);
    
    try {
      const details = await getCareerDetails(career.title);
      setCareerDetails(details);
    } catch (err) {
      setError('Failed to load career details. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCareer(null);
    setCareerDetails(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
          <p className="mt-2 text-gray-600">Discover various courses and learn enroll in them to know more</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border text-gray-500 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="px-4 py-2 border text-gray-500 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Fields</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>

        {/* Career Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <div
              key={career.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{career.title}</h3>
                <p className="text-gray-600 mb-4">{career.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Required Skills:</span>
                    {career.requiredSkills.join(', ')}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Education:</span>
                    {career.education}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Salary Range:</span>
                    {career.salary}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Growth Potential:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      career.growth === 'Very High' ? 'bg-green-100 text-green-800' :
                      career.growth === 'High' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {career.growth}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleLearnMore(career)}
                  className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found matching your search criteria.</p>
          </div>
        )}

        {/* Career Details Modal */}
        {selectedCareer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{selectedCareer.title}</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedCareer.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-blue-700 mb-1">
                      <span className="font-medium">Education:</span> {selectedCareer.education}
                    </p>
                    <p className="text-blue-700 mb-1">
                      <span className="font-medium">Salary Range:</span> {selectedCareer.salary}
                    </p>
                    <p className="text-blue-700">
                      <span className="font-medium">Growth Potential:</span> {selectedCareer.growth}
                    </p>
                  </div>
                  
                  <div className="whitespace-pre-line text-gray-800">
                    {careerDetails}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
                >
                  Close
                </button>
                <a
                  href="/assessment"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Take Assessment
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 