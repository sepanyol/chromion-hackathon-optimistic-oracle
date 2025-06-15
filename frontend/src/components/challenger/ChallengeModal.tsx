// components/ChallengeModal.tsx
'use client';
import React, { useState } from 'react';
import { X, AlertTriangle, Upload, Link as LinkIcon, Bold, Italic, Underline } from 'lucide-react';

interface ChallengeModalProps {
  answer: {
    id: string;
    question: string;
    answer: string;
    solver: string;
    solverBond: string;
    potentialReward: string;
    timeRemaining: string;
  };
  onSubmit: (challengeData: any) => void;
  onClose: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ answer, onSubmit, onClose }) => {
  const [challengeData, setChallengeData] = useState({
    reason: '',
    evidence: '',
    sources: [''],
    bondAmount: '0.15'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [characterCount, setCharacterCount] = useState(0);

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!challengeData.reason.trim()) {
      newErrors.reason = 'Challenge reason is required';
    } else if (challengeData.reason.trim().length < 50) {
      newErrors.reason = 'Challenge reason must be at least 50 characters';
    }
    
    if (!challengeData.evidence.trim()) {
      newErrors.evidence = 'Supporting evidence is required';
    }
    
    if (challengeData.sources.filter(s => s.trim()).length === 0) {
      newErrors.sources = 'At least one source is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSubmit({
      answerId: answer.id,
      ...challengeData,
      sources: challengeData.sources.filter(s => s.trim())
    });
    
    setIsSubmitting(false);
  };

  const addSource = () => {
    setChallengeData(prev => ({
      ...prev,
      sources: [...prev.sources, '']
    }));
  };

  const updateSource = (index: number, value: string) => {
    setChallengeData(prev => ({
      ...prev,
      sources: prev.sources.map((s, i) => i === index ? value : s)
    }));
  };

  const removeSource = (index: number) => {
    setChallengeData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const handleReasonChange = (value: string) => {
    setChallengeData(prev => ({ ...prev, reason: value }));
    setCharacterCount(value.length);
    if (errors.reason) {
      setErrors((prev: any) => ({ ...prev, reason: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Submit Challenge</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">Challenge this answer with detailed reasoning</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Answer Context */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Answer Being Challenged</h3>
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Q: {answer.question}</p>
            <p className="text-sm text-gray-700">A: {answer.answer}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Solver:</span>
              <p className="font-mono font-medium">{answer.solver}</p>
            </div>
            <div>
              <span className="text-gray-500">Solver Bond:</span>
              <p className="font-semibold text-red-600">{answer.solverBond}</p>
            </div>
            <div>
              <span className="text-gray-500">Potential Reward:</span>
              <p className="font-semibold text-green-600">{answer.potentialReward}</p>
            </div>
            <div>
              <span className="text-gray-500">Time Remaining:</span>
              <p className="font-semibold text-orange-600">{answer.timeRemaining}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Challenge Reason */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Challenge Reason *
              </label>
              <div className="flex items-center space-x-2">
                {/* Rich Text Toolbar */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button type="button" className="p-1 text-gray-600 hover:text-gray-900 rounded">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 text-gray-600 hover:text-gray-900 rounded">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 text-gray-600 hover:text-gray-900 rounded">
                    <Underline className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 text-gray-600 hover:text-gray-900 rounded">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">{characterCount}/1000</span>
              </div>
            </div>
            <textarea
              value={challengeData.reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="Provide your detailed answer here..."
              rows={6}
              maxLength={1000}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                errors.reason ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reason && (
              <p className="text-red-600 text-sm mt-1">{errors.reason}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Minimum 50 characters. Explain why this answer is incorrect or insufficient.
            </p>
          </div>

          {/* Supporting Evidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Evidence
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Add alternative data sources</span>
            </div>
            <textarea
              value={challengeData.evidence}
              onChange={(e) => setChallengeData(prev => ({ ...prev, evidence: e.target.value }))}
              placeholder="Enter URL..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                errors.evidence ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.evidence && (
              <p className="text-red-600 text-sm mt-1">{errors.evidence}</p>
            )}
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Sources & References
            </label>
            <div className="space-y-2">
              {challengeData.sources.map((source, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={source}
                    onChange={(e) => updateSource(index, e.target.value)}
                    placeholder={`Source ${index + 1} URL...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  />
                  {challengeData.sources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSource(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSource}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                + Add another source
              </button>
            </div>
            {errors.sources && (
              <p className="text-red-600 text-sm mt-1">{errors.sources}</p>
            )}
          </div>

          {/* Challenge Bond */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">Challenge Bond Required</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-red-700 mb-1">Required Amount:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    value={challengeData.bondAmount}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, bondAmount: e.target.value }))}
                    className="w-20 px-2 py-1 border border-red-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-red-700 font-semibold">ETH</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-red-700 mb-1">Your Balance:</label>
                <p className="font-semibold text-red-600">2.1 ETH</p>
              </div>
              <div>
                <label className="block text-sm text-red-700 mb-1">Potential Reward:</label>
                <p className="font-semibold text-green-600">Up to 0.12 ETH</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-red-700">
              <p className="mb-1">Gas Fee: ~$12</p>
              <p>⚠️ Bond will be locked until dispute is resolved</p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium mb-1">Challenge Guidelines:</p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Ensure your challenge is well-researched and factually accurate</li>
                  <li>• Provide credible sources to support your position</li>
                  <li>• False or malicious challenges may result in bond forfeiture</li>
                  <li>• The solver has 48 hours to respond to your challenge</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
        </form>
      </div>
    </div>
  );
};

export default ChallengeModal;