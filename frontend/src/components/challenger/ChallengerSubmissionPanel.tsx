// components/ChallengerSubmissionPanel.tsx
'use client';
import React, { useState } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Upload, AlertTriangle } from 'lucide-react';

interface ChallengerSubmissionPanelProps {
  onSubmitChallenge: (challengeData: any) => void;
}

const ChallengerSubmissionPanel: React.FC<ChallengerSubmissionPanelProps> = ({ onSubmitChallenge }) => {
  const [challengeData, setChallengeData] = useState({
    reason: '',
    evidence: '',
    sources: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const handleReasonChange = (value: string) => {
    if (value.length <= 1000) {
      setChallengeData(prev => ({ ...prev, reason: value }));
      setCharacterCount(value.length);
    }
  };

  const handleSubmit = async () => {
    if (!challengeData.reason.trim()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSubmitChallenge(challengeData);
    
    // Reset form
    setChallengeData({ reason: '', evidence: '', sources: '' });
    setCharacterCount(0);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Submit Challenge Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Submit Challenge</h3>
        </div>

        {/* Challenge Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challenge Reason *
          </label>
          
          {/* Rich Text Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button 
                type="button" 
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500">{characterCount}/1000</span>
          </div>

          <textarea
            value={challengeData.reason}
            onChange={(e) => handleReasonChange(e.target.value)}
            placeholder="Provide your detailed answer here..."
            rows={6}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          />
        </div>

        {/* Supporting Evidence */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supporting Evidence
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Add alternative data sources</span>
          </div>
          <input
            type="text"
            value={challengeData.sources}
            onChange={(e) => setChallengeData(prev => ({ ...prev, sources: e.target.value }))}
            placeholder="Enter URL..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Challenge Bond Required */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Challenge Bond Required</h4>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Required Amount:</span>
            <span className="font-semibold text-gray-900">0.15 ETH</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Your Balance:</span>
            <span className="font-semibold text-green-600">2.1 ETH</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Potential Reward:</span>
            <span className="font-semibold text-blue-600">Up to 0.12 ETH</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Gas Fee:</span>
            <span className="text-gray-700">~$12</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Bond will be locked until dispute is resolved
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!challengeData.reason.trim() || isSubmitting}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting Challenge...</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>Submit Challenge & Lock Bond</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChallengerSubmissionPanel;