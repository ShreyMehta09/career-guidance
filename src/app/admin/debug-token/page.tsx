'use client';

import { useState } from 'react';

export default function DebugToken() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/auth/debug-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to debug token');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Token Debugger
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This tool will help diagnose issues with verification tokens.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                    Verification Token
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="token"
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                      placeholder="Enter verification token"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Checking...' : 'Check Token'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6">
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Input Token</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 break-all">{result.inputToken}</dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Tokens in Database</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{result.tokensFoundCount}</dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Exact Matches</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{result.exactMatchCount}</dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Substring Matches</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{result.substringMatchCount}</dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Pattern Matches</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{result.regexMatchCount}</dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Potential Matches</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0">{result.totalPotentialMatches}</dd>
                </div>
                
                {result.potentialMatches.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-900">Potential Matches</h4>
                    <div className="mt-2 flex flex-col">
                      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Token Details
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Match Type
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {result.potentialMatches.map((match: any, index: number) => (
                                  <tr key={match.id || index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{match.maskedEmail}</div>
                                      <div className="text-sm text-gray-500">ID: {match.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">Length: {match.tokenLength}</div>
                                      <div className="text-sm text-gray-500 break-all">Sample: {match.tokenSnippet}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {match.isExactMatch && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Exact</span>}
                                        {match.isSubstringMatch && <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Substring</span>}
                                        {match.isRegexMatch && <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Pattern</span>}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div>
                                        {match.isVerified ? 
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span> : 
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Not Verified</span>
                                        }
                                      </div>
                                      <div className="mt-1">
                                        {match.hasExpires ? 
                                          (match.isExpired ? 
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Expired</span> : 
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Valid</span>
                                          ) : 
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">No Expiry</span>
                                        }
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 