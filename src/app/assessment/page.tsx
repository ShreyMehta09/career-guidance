'use client';

import { useState } from 'react';
import { getCareerRecommendations } from '@/utils/api';

export default function Assessment() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    interests: [] as string[],
    skills: [] as string[],
    education: '',
    workStyle: '',
    goals: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const interests = [
    'Technology', 'Healthcare', 'Business', 'Arts', 'Science',
    'Education', 'Engineering', 'Social Work', 'Law', 'Sports'
  ];

  const skills = [
    'Problem Solving', 'Communication', 'Leadership', 'Creativity',
    'Analytical Thinking', 'Teamwork', 'Technical Skills', 'Research',
    'Writing', 'Public Speaking'
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the OpenAI API through our backend
      const result = await getCareerRecommendations(formData);
      setRecommendations(result);
      setStep(4); // Move to results page
    } catch (err) {
      setError('Failed to generate career recommendations. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Career Assessment</h1>
            <p className="mt-2 text-gray-600">Step {step} of {recommendations ? 4 : 3}</p>
          </div>

          {step < 4 && (
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">What interests you?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-4 rounded-lg border ${
                          formData.interests.includes(interest)
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                      disabled={formData.interests.length === 0}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">What are your skills?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`p-4 rounded-lg border ${
                          formData.skills.includes(skill)
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-200 hover:border-blue-300 text-gray-800'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                      disabled={formData.skills.length === 0}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Preferred Education Level
                      </label>
                      <select
                        value={formData.education}
                        onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                        className="mt-1 block w-full text-gray-700 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option className="text-gray-500" value="">Select education level</option>
                        <option className="text-gray-500" value="high-school">High School</option>
                        <option className="text-gray-500" value="bachelors">Bachelor's Degree</option>
                        <option className="text-gray-500" value="masters">Master's Degree</option>
                        <option className="text-gray-500" value="phd">PhD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Preferred Work Style
                      </label>
                      <select
                        value={formData.workStyle}
                        onChange={(e) => setFormData(prev => ({ ...prev, workStyle: e.target.value }))}
                        className="mt-1 block w-full text-gray-700 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option className="text-gray-500" value="">Select work style</option>
                        <option className="text-gray-500" value="remote">Remote</option>
                        <option className="text-gray-500" value="office">Office</option>
                        <option className="text-gray-500" value="hybrid">Hybrid</option>
                        <option className="text-gray-500" value="flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Career Goals
                      </label>
                      <textarea
                        value={formData.goals}
                        onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                        className="mt-1 text-gray-700 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                        placeholder="What are your career goals and aspirations?"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Analyzing...' : 'Get Recommendations'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Results Page */}
          {step === 4 && recommendations && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Career Recommendations</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="prose max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Based on Your Profile</h3>
                  <p className="text-blue-700 mb-1">
                    <span className="font-medium">Interests:</span> {formData.interests.join(', ')}
                  </p>
                  <p className="text-blue-700 mb-1">
                    <span className="font-medium">Skills:</span> {formData.skills.join(', ')}
                  </p>
                  {formData.education && (
                    <p className="text-blue-700 mb-1">
                      <span className="font-medium">Education:</span> {formData.education}
                    </p>
                  )}
                  {formData.workStyle && (
                    <p className="text-blue-700 mb-1">
                      <span className="font-medium">Work Style:</span> {formData.workStyle}
                    </p>
                  )}
                </div>
                
                <div className="whitespace-pre-line text-gray-800">
                  {recommendations}
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setRecommendations(null);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Start Over
                </button>
                <a
                  href="/explore"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Explore Careers
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 