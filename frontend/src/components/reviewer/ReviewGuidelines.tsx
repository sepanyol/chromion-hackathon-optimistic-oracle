// components/ReviewGuidelines.tsx
'use client';
import React from 'react';
import { CheckCircle, BookOpen } from 'lucide-react';

const ReviewGuidelines: React.FC = () => {
  const guidelines = [
    'Sources are credible and recent',
    'Answer directly addresses question',
    'Evidence supports all conclusions',
    'No obvious bias or manipulation',
    'Data is current and relevant',
    'Methodology is transparent'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Review Guidelines</h3>
      </div>

      <div className="space-y-3">
        {guidelines.map((guideline, index) => (
          <div key={index} className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">{guideline}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewGuidelines;