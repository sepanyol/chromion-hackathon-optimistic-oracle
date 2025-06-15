// components/MyActiveChallenges.tsx
'use client';
import React from 'react';
import { Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface Challenge {
  id: string;
  description: string;
  status: 'Under Review' | 'Won' | 'Complete';
  timeAgo: string;
  reward: string;
}

interface MyActiveChallengesProps {
  challenges: Challenge[];
}

const MyActiveChallenges: React.FC<MyActiveChallengesProps> = ({ challenges }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Under Review':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Won':
      case 'Complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Won':
      case 'Complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">My Active Challenges</h3>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
          View All
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <AlertCircle className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-gray-500">No active challenges</p>
          <p className="text-gray-400 text-sm">Submit challenges to track them here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {challenge.description}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(challenge.status)}`}>
                      {getStatusIcon(challenge.status)}
                      <span>{challenge.status}</span>
                    </span>
                    <span className="text-xs text-gray-500">{challenge.timeAgo}</span>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {challenge.reward}
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyActiveChallenges;