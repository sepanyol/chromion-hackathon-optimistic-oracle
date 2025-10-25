
'use client';
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ReviewPatterns as ReviewPatternsType } from '@/types/reviewer';

interface ReviewPatternsProps {
  patterns: ReviewPatternsType;
}

const ReviewPatterns: React.FC<ReviewPatternsProps> = ({ patterns }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Your Review Patterns</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Approval Rate:</span>
          <span className="font-semibold text-gray-900">{patterns.approvalRate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Challenge Agreement:</span>
          <span className="font-semibold text-gray-900">{patterns.challengeAgreement}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Average Time:</span>
          <span className="font-semibold text-gray-900">{patterns.averageTime}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Specialization:</span>
          <span className="font-normal text-gray-900">{patterns.specialization}</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewPatterns;