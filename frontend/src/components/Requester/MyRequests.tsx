// components/MyRequests.tsx
"use client";
import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  MoreHorizontal,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  description: string;
  status: "Completed" | "Pending" | "Awaiting Review" | "Challenged";
  reward: string;
  timeAgo: string;
  chains: string[];
}

interface MyRequestsProps {
  questions: Question[];
}

const MyRequests: React.FC<MyRequestsProps> = ({ questions }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Pending":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "Awaiting Review":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "Challenged":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Awaiting Review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Challenged":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const copyQuestionId = (questionId: string) => {
    navigator.clipboard.writeText(questionId);
    // You could add a toast notification here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Requests</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">No questions submitted yet</p>
            <p className="text-gray-400 text-sm">
              Submit your first oracle request to get started
            </p>
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() =>
                setSelectedQuestion(
                  selectedQuestion === question.id ? null : question.id
                )
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(question.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Question #{question.id}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusColor(
                          question.status
                        )}`}
                      >
                        {question.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">
                      {question.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{question.timeAgo}</span>
                      <div className="flex items-center space-x-1">
                        {question.chains.map((chain, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center"
                          >
                            {chain}
                            {index < question.chains.length - 1 && (
                              <span className="mx-1">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {question.reward}
                    </div>
                    <div className="text-xs text-gray-500">
                      {question.status === "Completed" ? "Earned" : "Reward"}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyQuestionId(question.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedQuestion === question.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Full Question
                    </h5>
                    <p className="text-sm text-gray-700 mb-4">
                      {question.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">
                          Status:
                        </span>
                        <p className="text-gray-600">{question.status}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Reward:
                        </span>
                        <p className="text-gray-600">{question.reward}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Networks:
                        </span>
                        <p className="text-gray-600">
                          {question.chains.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        View Details
                      </button>
                      {question.status === "Challenged" && (
                        <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors duration-200">
                          Respond to Challenge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyRequests;
