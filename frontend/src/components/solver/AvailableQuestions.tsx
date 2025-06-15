// components/AvailableQuestions.tsx
'use client';
import React, { useState } from 'react';
import { Clock, Shield, Users, ExternalLink, Zap } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  chain: string;
  timeRemaining: string;
  reward: string;
  bondRequired: string;
  riskScore: 'Low' | 'Medium' | 'High';
  answersSubmitted: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface AvailableQuestionsProps {
  questions: Question[];
  onQuickAnswer: (questionId: string) => void;
  onViewDetails: (questionId: string) => void;
}

const AvailableQuestions: React.FC<AvailableQuestionsProps> = ({ 
  questions, 
  onQuickAnswer, 
  onViewDetails 
}) => {
  const [loadingQuickAnswer, setLoadingQuickAnswer] = useState<string | null>(null);

  const getChainColor = (chain: string) => {
    const colors = {
      'Ethereum': 'bg-blue-100 text-blue-800 border-blue-200',
      'Base': 'bg-purple-100 text-purple-800 border-purple-200',
      'Polygon': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Avalanche': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[chain as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChainIcon = (chain: string) => {
    const icons = {
      'Ethereum': 'Ξ',
      'Base': '🔵',
      'Polygon': '💜',
      'Avalanche': '🔺'
    };
    return icons[chain as keyof typeof icons] || '⚡';
  };

  const handleQuickAnswer = async (questionId: string) => {
    setLoadingQuickAnswer(questionId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onQuickAnswer(questionId);
    setLoadingQuickAnswer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Questions</h3>
        <div className="text-sm text-gray-500">
          {questions.length} questions available
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-xl">{getChainIcon(question.chain)}</div>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getChainColor(question.chain)}`}>
                    {question.chain}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{question.timeRemaining}</span>
              </div>
            </div>

            {/* Question Content */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {question.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {question.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reward</p>
                  <p className="text-sm font-semibold text-gray-900">{question.reward}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bond Required</p>
                  <p className="text-sm font-semibold text-gray-900">{question.bondRequired}</p>
                </div>
              </div>
            </div>

            {/* Tags and Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(question.riskScore)}`}>
                  Risk Score: {question.riskScore}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-xs">{question.answersSubmitted} answers submitted</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleQuickAnswer(question.id)}
                disabled={loadingQuickAnswer === question.id}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loadingQuickAnswer === question.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Quick Answer</span>
                )}
              </button>
              
              <button
                onClick={() => onViewDetails(question.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2"
              >
                <span>View Details</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Answers Progress</span>
                <span>{question.answersSubmitted}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((question.answersSubmitted / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No questions match your filters</p>
          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default AvailableQuestions;