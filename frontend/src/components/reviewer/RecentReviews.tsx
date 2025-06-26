// components/RecentReviews.tsx
'use client';
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { RecentReview, ReviewStatus } from '@/types/reviewer';

interface RecentReviewsProps {
  reviews: RecentReview[];
}

const RecentReviews: React.FC<RecentReviewsProps> = ({ reviews }) => {
  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ReviewStatus): string => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(review.status)}
              <span className="text-sm font-medium text-gray-900">#{review.id}</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(review.status)}`}>
              {review.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Last 10 reviews: <span className="text-green-600 font-semibold">90% accuracy</span>
        </div>
      </div>
    </div>
  );
};

export default RecentReviews;