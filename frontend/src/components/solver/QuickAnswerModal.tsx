// components/QuickAnswerModal.tsx
'use client';
import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, FileText, AlertCircle } from 'lucide-react';

interface QuickAnswerModalProps {
  question: {
    id: string;
    title: string;
    description: string;
    reward: string;
    bondRequired: string;
    timeRemaining: string;
  };
  onSubmit: (answerData: any) => void;
  onClose: () => void;
}

const QuickAnswerModal: React.FC<QuickAnswerModalProps> = ({ question, onSubmit, onClose }) => {
  const [answerData, setAnswerData] = useState({
    answer: '',
    evidence: '',
    sources: [''],
    confidence: 95
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!answerData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    }
    
    if (!answerData.evidence.trim()) {
      newErrors.evidence = 'Evidence is required';
    }
    
    if (answerData.sources.filter(s => s.trim()).length === 0) {
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
      questionId: question.id,
      ...answerData,
      sources: answerData.sources.filter(s => s.trim())
    });
    
    setIsSubmitting(false);
  };

  const addSource = () => {
    setAnswerData(prev => ({
      ...prev,
      sources: [...prev.sources, '']
    }));
  };

  const updateSource = (index: number, value: string) => {
    setAnswerData(prev => ({
      ...prev,
      sources: prev.sources.map((s, i) => i === index ? value : s)
    }));
  };

  const removeSource = (index: number) => {
    setAnswerData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Submit Quick Answer</h2>
            <p className="text-sm text-gray-600 mt-1">Provide your answer with supporting evidence</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Details */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">{question.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{question.description}</p>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Reward:</span>
              <span className="font-semibold text-green-600">{question.reward}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Bond:</span>
              <span className="font-semibold text-red-600">{question.bondRequired}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Time Left:</span>
              <span className="font-semibold text-orange-600">{question.timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Your Answer
            </label>
            <textarea
              value={answerData.answer}
              onChange={(e) => setAnswerData(prev => ({ ...prev, answer: e.target.value }))}
              placeholder="Provide your detailed answer..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                errors.answer ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.answer && (
              <p className="text-red-600 text-sm mt-1">{errors.answer}</p>
            )}
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Evidence
            </label>
            <textarea
              value={answerData.evidence}
              onChange={(e) => setAnswerData(prev => ({ ...prev, evidence: e.target.value }))}
              placeholder="Explain how you arrived at this answer, methodology used, data sources consulted..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
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
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Sources & References
            </label>
            <div className="space-y-2">
              {answerData.sources.map((source, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={source}
                    onChange={(e) => updateSource(index, e.target.value)}
                    placeholder={`Source ${index + 1} URL...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {answerData.sources.length > 1 && (
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
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                + Add another source
              </button>
            </div>
            {errors.sources && (
              <p className="text-red-600 text-sm mt-1">{errors.sources}</p>
            )}
          </div>

          {/* Confidence Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Level: {answerData.confidence}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={answerData.confidence}
              onChange={(e) => setAnswerData(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50% - Uncertain</span>
              <span>75% - Confident</span>
              <span>100% - Very Confident</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium mb-1">Important Notice:</p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Your bond of {question.bondRequired} will be locked until resolution</li>
                  <li>• Incorrect or malicious answers may result in bond forfeiture</li>
                  <li>• Other solvers can challenge your answer within 24 hours</li>
                  <li>• Make sure your sources are reliable and verifiable</li>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Answer...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer & Lock Bond</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAnswerModal;