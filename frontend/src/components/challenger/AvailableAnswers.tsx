// components/AvailableAnswers.tsx
'use client';
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, Users, ExternalLink, Eye } from 'lucide-react';

interface Answer {
  id: string;
  question: string;
  answer: string;
  riskScore: number;
  riskLevel: 'High Risk Score' | 'Medium Risk Score' | 'Low Risk Score';
  urgency: 'URGENT' | 'NORMAL';
  timeRemaining: string;
  solverBond: string;
  solver: string;
  challengeWindow: string;
  potentialReward: string;
  chain: string;
  riskAssessment: {
    score: number;
    factors: string[];
  };
}

interface AvailableAnswersProps {
  answers: Answer[];
  onChallengeAnswer: (answerId: string) => void;
  onViewFullAnswer: (answerId: string) => void;
}

const AvailableAnswers: React.FC<AvailableAnswersProps> = ({ 
  answers, 
  onChallengeAnswer, 
  onViewFullAnswer 
}) => {
  const [loadingChallenge, setLoadingChallenge] = useState<string | null>(null);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk Score':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium Risk Score':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low Risk Score':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk Score':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Medium Risk Score':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Low Risk Score':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getChainColor = (chain: string) => {
    const colors = {
      'Ethereum': 'bg-blue-100 text-blue-800',
      'Base': 'bg-purple-100 text-purple-800',
      'Polygon': 'bg-indigo-100 text-indigo-800',
      'Avalanche': 'bg-red-100 text-red-800'
    };
    return colors[chain as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleChallengeAnswer = async (answerId: string) => {
    setLoadingChallenge(answerId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onChallengeAnswer(answerId);
    setLoadingChallenge(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Answers to Challenge</h3>
        <div className="text-sm text-gray-500">
          {answers.length} answers available for review
        </div>
      </div>

      <div className="space-y-4">
        {answers.map((answer) => (
          <div
            key={answer.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(answer.riskLevel)}`}>
                  {getRiskIcon(answer.riskLevel)}
                  <span>{answer.riskLevel}: {answer.riskScore}/10</span>
                </span>
                {answer.urgency === 'URGENT' && (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getChainColor(answer.chain)}`}>
                  {answer.chain}
                </span>
                <div className="flex items-center space-x-1 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{answer.timeRemaining}</span>
                </div>
              </div>
            </div>

            {/* Question and Answer */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Q: {answer.question}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">A:</span> {answer.answer}
                </p>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h5 className="font-semibold text-orange-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                MCP RISK ASSESSMENT:
              </h5>
              <div className="space-y-1">
                {answer.riskAssessment.factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-gray-700">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Solver Bond</p>
                  <p className="text-sm font-semibold text-gray-900">{answer.solverBond}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Solver</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{answer.solver}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Challenge Window</p>
                  <p className="text-sm font-semibold text-gray-900">{answer.challengeWindow}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">💰</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Potential Reward</p>
                  <p className="text-sm font-semibold text-green-600">{answer.potentialReward}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleChallengeAnswer(answer.id)}
                disabled={loadingChallenge === answer.id}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loadingChallenge === answer.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Challenge...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Challenge Answer</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => onViewFullAnswer(answer.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Answer</span>
              </button>

              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Score Bar */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Risk Assessment Score</span>
                <span>{answer.riskScore}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    answer.riskScore >= 8 ? 'bg-red-500' :
                    answer.riskScore >= 5 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(answer.riskScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {answers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <CheckCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No answers match your criteria</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters to find challengeable answers</p>
        </div>
      )}
    </div>
  );
};

export default AvailableAnswers;