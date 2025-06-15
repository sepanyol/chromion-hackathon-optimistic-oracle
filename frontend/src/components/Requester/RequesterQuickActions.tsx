// components/RequesterQuickActions.tsx
'use client';
import React from 'react';
import { Plus, FileText, BarChart3 } from 'lucide-react';

interface RequesterQuickActionsProps {
  onNewQuestion: () => void;
  onUseTemplate: () => void;
  onViewAnalytics: () => void;
}

const RequesterQuickActions: React.FC<RequesterQuickActionsProps> = ({ 
  onNewQuestion, 
  onUseTemplate,
  onViewAnalytics 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* New Question */}
        <button
          onClick={onNewQuestion}
          className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 hover:border-blue-200 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md group"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">New Question</h4>
          <p className="text-sm text-gray-600 text-center">Submit a new oracle request</p>
        </button>

        {/* Use Template */}
        <button
          onClick={onUseTemplate}
          className="flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 border-2 border-green-100 hover:border-green-200 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md group"
        >
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Use Template</h4>
          <p className="text-sm text-gray-600 text-center">Start from a pre-built template</p>
        </button>

        {/* View Analytics */}
        <button
          onClick={onViewAnalytics}
          className="flex flex-col items-center p-6 bg-orange-50 hover:bg-orange-100 border-2 border-orange-100 hover:border-orange-200 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md group"
        >
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">View Analytics</h4>
          <p className="text-sm text-gray-600 text-center">Check performance metrics</p>
        </button>
      </div>
    </div>
  );
};

export default RequesterQuickActions;