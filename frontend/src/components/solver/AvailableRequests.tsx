// components/AvailableRequests.tsx
"use client";
import { SolverRequestsType } from "@/types/Requests";
import { Clock, Shield, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

interface AvailableRequestsProps {
  requests: SolverRequestsType[];
}

const AvailableRequests: React.FC<AvailableRequestsProps> = ({ requests }) => {
  const getChainColor = (chain: string) => {
    const colors = {
      Ethereum: "bg-blue-100 text-blue-800 border-blue-200",
      Base: "bg-purple-100 text-purple-800 border-purple-200",
      Polygon: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Avalanche: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      colors[chain as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getRiskColor = (risk: number) => {
    switch (risk) {
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleQuickAnswer = async (requestId: string) => {
    window.history.replaceState(null, "", `/solver/${requestId}`);
    // setLoadingQuickAnswer(requestId);
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    // onQuickAnswer(requestId);
    // setLoadingQuickAnswer(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getChainColor(
                      request.chain
                    )}`}
                  >
                    {request.chain}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  created {request.createdAt}
                </span>
              </div>
            </div>

            {/* Question Content */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {request.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {request.description}
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
                  <p className="text-sm font-semibold text-gray-900">
                    {request.reward}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bond Required</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {request.bondRequired}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags and Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(
                    request.riskScore
                  )}`}
                >
                  Dispute Risk: {request.riskScore == 0 && "pending..."}
                  {request.riskScore == 1 && "Low"}
                  {request.riskScore == 2 && "Medium"}
                  {request.riskScore == 3 && "High"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Link href={`/solver/${request.id}`} className="w-full">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                  <span>Propose answer</span>
                </button>
              </Link>

              {/* <button
                onClick={() => onViewDetails(request.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2"
              >
                <span>View Details</span>
                <ExternalLink className="w-4 h-4" />
              </button> */}
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">
            No requests match your filters
          </p>
          <p className="text-gray-400 text-sm">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableRequests;
