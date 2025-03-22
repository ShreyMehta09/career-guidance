'use client';

import { useState } from 'react';
import { getCareerAssessmentResults } from '@/utils/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TestQuestion {
  id: string;
  question: string;
  options?: string[];
  type: 'multiple-choice' | 'scale' | 'text';
}

// Test definitions for the different assessment tools
const aptitudeTest: TestQuestion[] = [
  {
    id: 'analytical',
    question: 'I enjoy solving complex problems and puzzles',
    type: 'scale',
  },
  {
    id: 'verbal',
    question: 'I find it easy to express my thoughts in writing or speech',
    type: 'scale',
  },
  {
    id: 'numerical',
    question: 'I am comfortable working with numbers and mathematical concepts',
    type: 'scale',
  },
  {
    id: 'creative',
    question: 'I often come up with innovative ideas or creative solutions',
    type: 'scale',
  },
  {
    id: 'technical',
    question: 'I enjoy working with tools, equipment, or technology',
    type: 'scale',
  },
  {
    id: 'social',
    question: 'I prefer working with people rather than working alone',
    type: 'scale',
  },
  {
    id: 'leadership',
    question: 'I feel comfortable taking charge and directing others',
    type: 'scale',
  },
  {
    id: 'detail',
    question: 'I pay close attention to details and prefer structured tasks',
    type: 'scale',
  }
];

const personalityTest: TestQuestion[] = [
  {
    id: 'energy',
    question: 'How do you prefer to recharge?',
    options: ['By spending time with others (Extrovert)', 'By spending time alone (Introvert)'],
    type: 'multiple-choice',
  },
  {
    id: 'information',
    question: 'How do you prefer to process information?',
    options: ['Through concrete facts and details (Sensing)', 'Through patterns and impressions (Intuition)'],
    type: 'multiple-choice',
  },
  {
    id: 'decisions',
    question: 'How do you primarily make decisions?',
    options: ['Based on logic and objective analysis (Thinking)', 'Based on values and considering people (Feeling)'],
    type: 'multiple-choice',
  },
  {
    id: 'lifestyle',
    question: 'How do you prefer to organize your life?',
    options: ['With structure and planning (Judging)', 'With flexibility and spontaneity (Perceiving)'],
    type: 'multiple-choice',
  },
  {
    id: 'stress',
    question: 'How do you typically react to stress?',
    type: 'text',
  },
  {
    id: 'collaboration',
    question: 'How do you prefer to work with others?',
    type: 'text',
  },
  {
    id: 'learning',
    question: 'What is your preferred learning style?',
    type: 'text',
  }
];

const skillsInterestsSurvey: TestQuestion[] = [
  {
    id: 'technical_skills',
    question: 'Rate your proficiency in technical skills (programming, data analysis, etc.)',
    type: 'scale',
  },
  {
    id: 'communication_skills',
    question: 'Rate your communication skills (written and verbal)',
    type: 'scale',
  },
  {
    id: 'leadership_skills',
    question: 'Rate your leadership and management skills',
    type: 'scale',
  },
  {
    id: 'creative_skills',
    question: 'Rate your creative and artistic abilities',
    type: 'scale',
  },
  {
    id: 'interest_tech',
    question: 'How interested are you in technology and computer science?',
    type: 'scale',
  },
  {
    id: 'interest_business',
    question: 'How interested are you in business, finance, or entrepreneurship?',
    type: 'scale',
  },
  {
    id: 'interest_creative',
    question: 'How interested are you in creative fields (arts, design, writing)?',
    type: 'scale',
  },
  {
    id: 'interest_helping',
    question: 'How interested are you in helping others (healthcare, education, social work)?',
    type: 'scale',
  },
  {
    id: 'preferred_environment',
    question: 'Describe your ideal work environment:',
    type: 'text',
  }
];
export default function CareerToolsPage() {
  return (
    <ProtectedRoute>
      <CareerTools />
    </ProtectedRoute>
  );
}
function CareerTools() {
  const [activeTest, setActiveTest] = useState<'none' | 'aptitude' | 'personality' | 'skills'>('none');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentTest = () => {
    switch (activeTest) {
      case 'aptitude':
        return aptitudeTest;
      case 'personality':
        return personalityTest;
      case 'skills':
        return skillsInterestsSurvey;
      default:
        return [];
    }
  };

  const handleStartTest = (testType: 'aptitude' | 'personality' | 'skills') => {
    setActiveTest(testType);
    setCurrentQuestion(0);
    setResponses({});
    setResults(null);
    setError(null);
  };

  const handleScaleResponse = (value: number) => {
    const test = getCurrentTest();
    const question = test[currentQuestion];
    
    setResponses(prev => ({
      ...prev,
      [question.id]: value
    }));
    
    handleNextQuestion();
  };

  const handleMultipleChoiceResponse = (option: string) => {
    const test = getCurrentTest();
    const question = test[currentQuestion];
    
    setResponses(prev => ({
      ...prev,
      [question.id]: option
    }));
    
    handleNextQuestion();
  };

  const handleTextResponse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const answer = formData.get('textAnswer');
    
    const test = getCurrentTest();
    const question = test[currentQuestion];
    
    setResponses(prev => ({
      ...prev,
      [question.id]: answer
    }));
    
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    const test = getCurrentTest();
    
    if (currentQuestion < test.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // All questions answered, generate results
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call OpenAI API through our backend
      const result = await getCareerAssessmentResults(activeTest, responses);
      setResults(result);
    } catch (err) {
      setError('Failed to generate assessment results. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = () => {
    const test = getCurrentTest();
    if (test.length === 0) return null;
    
    const question = test[currentQuestion];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Question {currentQuestion + 1} of {test.length}</span>
            <span className="text-gray-500">{activeTest.charAt(0).toUpperCase() + activeTest.slice(1)} Test</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((currentQuestion + 1) / test.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-6 text-gray-800">{question.question}</h3>
        
        {question.type === 'scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleScaleResponse(value)}
                  className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-lg font-medium text-blue-700 hover:bg-blue-100"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {question.type === 'multiple-choice' && (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleMultipleChoiceResponse(option)}
                className="w-full text-left p-4 text-black rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {question.type === 'text' && (
          <form onSubmit={handleTextResponse} className="space-y-4">
            <textarea
              name="textAnswer"
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Type your answer here..."
              required
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Student Career Assessment Tools</h1>
          <p className="mt-2 text-gray-600">Discover more about yourself and find career paths that match your profile</p>
        </div>

        {activeTest === 'none' && !results ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Aptitude Test Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Aptitude Test</h3>
                <p className="text-gray-600 mb-6">
                  Discover your strengths and aptitudes with our interactive test. Get personalized career recommendations based on your natural abilities.
                </p>
                <button
                  onClick={() => handleStartTest('aptitude')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                >
                  Start Aptitude Test
                </button>
              </div>
            </div>

            {/* Personality Test Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Personality Assessment</h3>
                <p className="text-gray-600 mb-6">
                  Understand your personality type and how it impacts your work style. Find careers that match your personality traits and preferences.
                </p>
                <button
                  onClick={() => handleStartTest('personality')}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-300"
                >
                  Start Personality Test
                </button>
              </div>
            </div>

            {/* Skills & Interests Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Skills & Interests Survey</h3>
                <p className="text-gray-600 mb-6">
                  Evaluate your current skills and interests to identify potential career matches. Get recommendations for skill development and exploration.
                </p>
                <button
                  onClick={() => handleStartTest('skills')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
                >
                  Start Skills Survey
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your responses...</p>
              </div>
            ) : results ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Assessment Results</h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-800">
                    {results}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => {
                      setActiveTest('none');
                      setResults(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back to Tools
                  </button>
                  <a
                    href="/explore"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Explore Careers
                  </a>
                </div>
              </div>
            ) : (
              renderQuestion()
            )}
          </div>
        )}
      </div>
    </div>
  );
} 