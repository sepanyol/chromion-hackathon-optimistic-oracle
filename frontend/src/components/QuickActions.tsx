// components/QuickActions.tsx
"use client";
import React from "react";
import { Plus, Eye, TrendingUp, BarChart3 } from "lucide-react";
import {
  ActionTypes,
  useCreateRequestContext,
} from "./request/CreateRequestProvider";

const QuickActions: React.FC = () => {
  const createRequestContext = useCreateRequestContext();

  const handleBrowseRequests = () => {
    // In a real app, this would navigate to a requests page or filter
    console.log("Browse open requests");
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics page
    console.log("View analytics");
  };

  const handleMarketTrends = () => {
    // Navigate to market trends
    console.log("View market trends");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="space-y-3">
        <button
          disabled={createRequestContext.state.isModalOpen}
          onClick={() =>
            createRequestContext.dispatch({ type: ActionTypes.OpenModal })
          }
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>Create New Request</span>
        </button>

        <button
          onClick={handleBrowseRequests}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group"
        >
          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span>Browse Open Requests</span>
        </button>

        {/* <button
          onClick={handleViewAnalytics}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group"
        >
          <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span>View Analytics</span>
        </button>

        <button
          onClick={handleMarketTrends}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group"
        >
          <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span>Market Trends</span>
        </button> */}
      </div>

      {/* Quick Stats */}
      {/* <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Your Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer">
            <div className="text-lg font-bold text-blue-600">12</div>
            <div className="text-xs text-blue-600">Requests</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer">
            <div className="text-lg font-bold text-green-600">847</div>
            <div className="text-xs text-green-600">USDC Earned</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default QuickActions;
