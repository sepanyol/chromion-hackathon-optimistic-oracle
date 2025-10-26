// components/MyRecentProposals.tsx
"use client";
import React from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
} from "lucide-react";
import { SolverProposalsType } from "@/types/Requests";
import Link from "next/link";

interface Answer {
  id: string;
  questionPreview: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Challenged";
  submitted: string;
  reward: string;
}

interface MyRecentProposalsProps {
  proposals: SolverProposalsType[];
}

const MyRecentProposals: React.FC<MyRecentProposalsProps> = ({ proposals }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "Under Review":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "Challenged":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Challenged":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRewardColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "text-green-600 font-semibold";
      case "Pending":
      case "Under Review":
        return "text-blue-600 font-medium";
      case "Rejected":
      case "Challenged":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          My Recent Proposals
        </h3>
        {/* <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg">
          View All
        </button> */}
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CheckCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No proposals submitted yet</p>
          <p className="text-gray-400 text-sm">
            Start proposing answers to questions to earn rewards
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {proposal.question}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusColor(
                        proposal.status
                      )}`}
                    >
                      {getStatusIcon(proposal.status)}
                      <span>{proposal.status}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {proposal.created}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div
                      className={`text-sm ${getRewardColor(proposal.status)}`}
                    >
                      {proposal.reward}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link href={`/solver/${proposal.id}`} className="w-full">
                        <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {proposals.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {proposals.filter((a) => a.status === "Proposed").length}
              </div>
              <div className="text-xs text-gray-500">Under Review</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {proposals.filter((a) => a.status === "Resolved").length}
              </div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {proposals.filter((a) => a.status === "Challenged").length}
              </div>
              <div className="text-xs text-gray-500">Issues</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecentProposals;
