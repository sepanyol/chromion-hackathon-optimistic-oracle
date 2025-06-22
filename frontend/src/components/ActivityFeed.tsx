// components/ActivityFeed.tsx
"use client";
import React from "react";
import { Copy, ExternalLink } from "lucide-react";
import {
  ActivityItem as Activity,
  ActivityItemStatus,
} from "@/types/Activities";

const getStatusColor = (status: ActivityItemStatus) => {
  switch (status) {
    case "Created":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Proposed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Challenged":
      return "bg-red-100 text-red-800 border-red-200";
    case "Reviewed":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Created":
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        );
      case "Proposed":
        return (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        );
      case "Challenged":
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        );
      case "Reviewed":
        return (
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        );
      case "Resolved":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const copyUserAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(activity.user!);
    // You could add a toast notification here
  };

  return (
    <div className="flex items-start space-x-3 py-4 hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors duration-200 cursor-pointer group">
      <div className="flex items-center justify-center mt-1">
        {getStatusIcon(activity.status)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {activity.title}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-gray-500">by</p>
          {activity.user ? (
            <button
              onClick={copyUserAddress}
              className="text-xs text-blue-400 hover:text-blue-600 font-mono flex items-center space-x-1 hover:bg-blue-50 py-1 rounded transition-all duration-200"
            >
              <span>{activity.user}</span>
              <Copy className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-xs text-blue-400 py-1">System</span>
          )}
          <span className="text-xs text-gray-500">•</span>
          <p className="text-xs text-gray-500">{activity.time}</p>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink className="w-3 h-3 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${getStatusColor(
          activity.status
        )}`}
      >
        {activity.status}
      </span>
    </div>
  );
};

export interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        {/* <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg">
          View All
        </button> */}
      </div>
      <div className="px-6 py-2">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
