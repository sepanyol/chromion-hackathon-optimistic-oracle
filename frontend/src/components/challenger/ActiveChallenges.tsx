// components/ActiveChallenges.tsx
'use client';
import React from 'react';
import { Clock, AlertCircle, CheckCircle, Eye, ExternalLink } from 'lucide-react';

interface Challenge {
  id: string;
  description: string;
  status: 'Under Review' | 'Won' | 'Lost' | 'Pending Response';
  timeAgo: string;
  reward: string;
  bond: string;
}

interface ActiveChallengesProps {
  challenges: Challenge[];
  onViewChallenge: (challengeId: string) => void;
}

const ActiveChallenges: React.FC<ActiveChallengesProps> = ({ challenges, onViewChallenge }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Under Review':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Won':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Lost':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Pending Response':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending Response':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRewardColor = (status: string) => {
    switch (status) {
      case 'Won':
        return 'text-green-600 font-semibold';
      case 'Under Review':
      case 'Pending Response':
        return 'text-blue-600 font-medium';
      case 'Lost':
        return 'text-red-500 line-through';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">My Active Challenges</h3>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg">
          View All
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No active challenges</p>
          <p className="text-gray-400 text-sm">Start challenging questionable answers to earn rewards</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => onViewChallenge(challenge.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusColor(challenge.status)}`}>
                      {getStatusIcon(challenge.status)}
                      <span>{challenge.status}</span>
                    </span>
                    <span className="text-xs text-gray-500">{challenge.timeAgo}</span>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {challenge.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Bond: {challenge.bond}</span>
                    <span className={getRewardColor(challenge.status)}>
                      {challenge.status === 'Won' ? 'Earned: ' : 'Potential: '}
                      {challenge.reward}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewChallenge(challenge.id);
                    }}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status-specific additional info */}
              {challenge.status === 'Pending Response' && (
                <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="text-xs text-orange-700">
                    ⏰ Waiting for solver response. Auto-win in 36 hours if no response.
                  </p>
                </div>
              )}
              
              {challenge.status === 'Won' && (
                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-700">
                    🎉 Challenge successful! Reward has been distributed to your wallet.
                  </p>
                </div>
              )}
              
              {challenge.status === 'Lost' && (
                <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-xs text-red-700">
                    ❌ Challenge rejected. Bond has been forfeited to the solver.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {challenges.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {challenges.filter(c => c.status === 'Under Review').length}
              </div>
              <div className="text-xs text-gray-500">Under Review</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {challenges.filter(c => c.status === 'Pending Response').length}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {challenges.filter(c => c.status === 'Won').length}
              </div>
              <div className="text-xs text-gray-500">Won</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {challenges.filter(c => c.status === 'Lost').length}
              </div>
              <div className="text-xs text-gray-500">Lost</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveChallenges;