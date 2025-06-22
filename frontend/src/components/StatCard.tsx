// components/StatCard.tsx
"use client";
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { StatData } from "@/types/StatsCards";

type StatCardProps = StatData;

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
            {value}
          </p>
          {change && changeType && (
            <div
              className={`flex items-center mt-2 text-sm ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg transition-all duration-200 group-hover:scale-110 ${
            changeType === "positive"
              ? "bg-blue-50 group-hover:bg-blue-100"
              : "bg-red-50 group-hover:bg-red-100"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
