// components/RequestsTable.tsx
"use client";
import { ActiveRequest } from "@/types/Requests";
import { ReadableRequestStatus, RequestStatus } from "@/utils/helpers";
import { AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import React, { useState } from "react";

interface RequestsTableProps {
  requests: ActiveRequest[];
  onPropose: (requestId: string) => void;
  onChallenge: (requestId: string) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  onPropose,
  onChallenge,
}) => {
  const [loadingAction, setLoadingAction] = useState<{
    requestId: string;
    action: string;
  } | null>(null);

  const getStatusColor = (status: ReadableRequestStatus) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Proposed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Challenged":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Boolean":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RWA Valuation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Price Feed":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: ReadableRequestStatus) => {
    switch (status) {
      case "Open":
        return <Clock className="w-4 h-4" />;
      case "Proposed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "Challenged":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleAction = async (
    requestId: string,
    action: "propose" | "challenge"
  ) => {
    setLoadingAction({ requestId, action });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (action === "propose") {
      onPropose(requestId);
    } else {
      onChallenge(requestId);
    }

    setLoadingAction(null);
  };

  const canPropose = (status: RequestStatus) => status === RequestStatus.Open;
  const canChallenge = (status: RequestStatus) =>
    status === RequestStatus.Proposed;
  const canReview = (status: RequestStatus) =>
    status === RequestStatus.Challenged;

  return (
    <div className="overflow-x-auto">
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No requests found</p>
          <p className="text-gray-400 text-sm">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Left
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                      {request.request}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                      <span>Requested {request.requestedTime}</span>
                      <button className="hover:text-gray-700 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${getTypeColor(
                      request.type
                    )}`}
                  >
                    {request.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {request.reward}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${getStatusColor(
                      request.statusLabel
                    )}`}
                  >
                    {getStatusIcon(request.statusLabel)}
                    <span>{request.statusLabel}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-mono">
                    {request.timeLeft}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2 justify-self-center-safe">
                    {canPropose(request.status) && (
                      <button
                        onClick={() => handleAction(request.id, "propose")}
                        disabled={loadingAction?.requestId === request.id}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {loadingAction?.requestId === request.id &&
                        loadingAction?.action === "propose" ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Propose answer</span>
                        )}
                      </button>
                    )}
                    {canChallenge(request.status) && (
                      <button
                        onClick={() => handleAction(request.id, "challenge")}
                        disabled={loadingAction?.requestId === request.id}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {loadingAction?.requestId === request.id &&
                        loadingAction?.action === "challenge" ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Challenge proposer</span>
                        )}
                      </button>
                    )}
                    {canReview(request.status) && (
                      <button
                        onClick={() => handleAction(request.id, "challenge")}
                        disabled={loadingAction?.requestId === request.id}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {loadingAction?.requestId === request.id &&
                        loadingAction?.action === "challenge" ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Review Challenge</span>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RequestsTable;
