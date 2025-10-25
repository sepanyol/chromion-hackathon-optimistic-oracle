
'use client';
import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ExternalLink, Link as LinkIcon, Image, BarChart3 } from 'lucide-react';
import { AnswerReview } from '@/types/reviewer';

interface AnswerReviewCardProps {
  review: AnswerReview;
  onSubmitReview: (decision: 'support' | 'reject', comments?: string) => void;
  onSkipReview: () => void;
}

const AnswerReviewCard: React.FC<AnswerReviewCardProps> = ({ 
  review, 
  onSubmitReview, 
  onSkipReview 
}) => {
  const [reviewDecision, setReviewDecision] = useState<'support' | 'reject' | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consensusProgress] = useState({ completed: 3, total: 5, approve: 67, reject: 33 });

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'Low Risk Score':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium Risk Score':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'High Risk Score':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <LinkIcon className="w-4 h-4 text-blue-600" />;
      case 'screenshot':
        return <Image className="w-4 h-4 text-purple-600" />;
      case 'data':
        return <BarChart3 className="w-4 h-4 text-green-600" />;
      default:
        return <ExternalLink className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleSubmit = async () => {
    if (!reviewDecision) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSubmitReview(reviewDecision, reviewComments);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Review #{review.id} - Answer Verification</h2>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">NEW</span>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">ORIGINAL QUESTION:</h3>
        <p className="text-gray-900">{review.originalQuestion}</p>
      </div>

    
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">SUBMITTED ANSWER:</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-900 text-sm leading-relaxed">
            {review.submittedAnswer}
          </p>
          <button className="text-blue-600 text-sm mt-2 hover:text-blue-800 transition-colors">
            Show More
          </button>
        </div>
      </div>

    
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">SOURCES PROVIDED:</h3>
        <div className="space-y-2">
          {review.sources.map((source, index) => (
            <div key={index} className="flex items-center space-x-3 text-sm">
              {getSourceIcon(source.type)}
              <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                {source.description}
              </span>
              {source.verified && (
                <span className="text-green-600 text-xs">(timestamp verified)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">MCP RISK ASSESSMENT:</h3>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(review.riskAssessment.level)}`}>
              {review.riskAssessment.level}: {review.riskAssessment.score}/10
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {review.riskAssessment.factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-sm text-gray-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      {review.challengeStatus.isDisputed && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CHALLENGE STATUS:</h3>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                DISPUTED - Active Challenge
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Challenger claims:</strong> "{review.challengeStatus.challengerClaims}"
            </p>
            
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">CHALLENGER EVIDENCE:</h4>
              <div className="space-y-1">
                {review.challengeStatus.challengerEvidence?.map((evidence, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <LinkIcon className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-600">{evidence}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">YOUR REVIEW DECISION:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="reviewDecision"
              value="support"
              checked={reviewDecision === 'support'}
              onChange={(e) => setReviewDecision(e.target.value as 'support')}
              className="text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">Support the Challenge</div>
              <div className="text-sm text-gray-600">(Support original)</div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="reviewDecision"
              value="reject"
              checked={reviewDecision === 'reject'}
              onChange={(e) => setReviewDecision(e.target.value as 'reject')}
              className="text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">Do not Support the Challenge</div>
              <div className="text-sm text-gray-600">(Support challenger)</div>
            </div>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optional Review Comments:
          </label>
          <textarea
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            placeholder="Provide additional context or reasoning for your decision (optional but recommended)..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>


      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">CONSENSUS TRACKER:</h3>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Progress: {consensusProgress.completed} of {consensusProgress.total} reviewers completed
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(consensusProgress.completed / consensusProgress.total) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-orange-600">Review Deadline: 18 hours remaining</span>
            <span className="text-gray-600">
              Current Split: {consensusProgress.approve}% Approve | {consensusProgress.reject}% Reject
            </span>
          </div>
        </div>
      </div>

   
      <div className="flex space-x-4">
        <button
          onClick={handleSubmit}
          disabled={!reviewDecision || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting Review...</span>
            </>
          ) : (
            <span>Submit Review</span>
          )}
        </button>
        
        <button
          onClick={onSkipReview}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
        >
          Skip Review
        </button>
      </div>
    </div>
  );
};

export default AnswerReviewCard;